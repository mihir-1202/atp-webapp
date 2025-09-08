from re import A
from fastapi import APIRouter, Body, Depends
from datetime import datetime, timezone
from typing import Annotated, Callable
from bson import ObjectId
from dependencies import get_atp_submissions_collection, get_atp_forms_collection, get_blob_handler, get_mongo_client, get_atp_spreadsheet_manager, ATPSpreadsheetManager
from schemas import atp_submissions as schemas, atp_submissions_responses as responses
import aiofiles
import pymongo
from azure.core.exceptions import AzureError
from pymongo import AsyncMongoClient
from pymongo.errors import PyMongoError
from pymongo.asynchronous.collection import AsyncCollection
from exceptions import *
router = APIRouter()

#TOOD: before downloading the spreadsheet template, check if it exists

#Technician submission
@router.post("/", response_model = responses.ATPSubmissionCreationResponse)
async def create_atp_submission(
    atp_submission: Annotated[schemas.ATPTechnicianSubmission, Body()],
    atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection)
):
    try:
        atp_submission_data = atp_submission.model_dump()
        atp_submission_data['submittedAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', '')
        atp_submission_data['status'] = 'pending'
        try:
            inserted_document = await atp_submissions.insert_one(atp_submission_data)
        except PyMongoError as e:
            raise DatabaseInsertError(collection_name = 'atp_submissions', document = atp_submission_data)
    except pymongo.errors.ConnectionFailure as e:
        print(type(e).__name__, str(e))
        raise DatabaseConnectionError(details = str(e))
    except Exception as e:
        print(type(e).__name__, str(e))
        raise e
    else:
        return {'message': 'Submitted ATP succesfully', 'submissionId': str(inserted_document.inserted_id)}
        
   
#Engineer review submission
@router.put("/{atp_submission_id}", response_model = responses.ATPReviewSubmissionResponse)
async def update_atp_submission(atp_submission_id: str, 
                                atp_submission: Annotated[schemas.ATPReviewSubmission, Body()], 
                                atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection),
                                client: AsyncMongoClient = Depends(get_mongo_client),
                                atp_spreadsheet_manager: ATPSpreadsheetManager = Depends(get_atp_spreadsheet_manager),
                                blob_handler: Callable = Depends(get_blob_handler)
                                ):
    
    try:
        async with client.start_session() as session:
            try:
                # Validate ObjectId format
                object_id = ObjectId(atp_submission_id)
            except Exception:
                return {'error': 'Invalid submission ID format', 'submissionId': None}
            
            
            completion_time = datetime.now(timezone.utc)
            completion_time_isoformat = completion_time.isoformat().replace('+00:00', '')
            completion_time_path_format = completion_time.strftime("%Y-%m-%d_%H-%M-%S")

            
            atp_review_data = atp_submission.model_dump()
            atp_review_data['reviewedAt'] = completion_time_isoformat
            
            # Check if the submission exists and update it
            
            result = await atp_submissions.update_one({'_id': object_id}, {'$set': atp_review_data})

            if result.matched_count == 0:
                raise ATPSubmissionNotFoundError(collection_name = 'atp_submissions', document_id = atp_submission_id)

            if result.modified_count == 0:
                raise ATPSubmissionUpdateError(collection_name = 'atp_submissions', document_id = atp_submission_id)
            
            
            spreadsheet_path = await blob_handler.download_blob(container_name = 'spreadsheets', blob_path = f'{atp_review_data["formGroupId"]}/active-form/{atp_review_data["formId"]}.xlsx')
            

            with atp_spreadsheet_manager.register_workbook(spreadsheet_path):
                cell_to_response_mappings = {}
                for response in atp_review_data['technicianResponses']:
                    cell_to_response_mappings[response['spreadsheetCell']] = response['answer']
                for response in atp_review_data['engineerResponses']:
                    cell_to_response_mappings[response['spreadsheetCell']] = response['answer']
                atp_spreadsheet_manager.populate_cells_with_responses(cell_to_response_mappings)
                upload_path = f'{atp_review_data["formGroupId"]}/submissions/{atp_review_data["formId"]}_{completion_time_path_format}.xlsx'
                
                async with aiofiles.open(spreadsheet_path, 'rb') as file_stream:
                    await blob_handler.upload_blob(container_name = 'spreadsheets', blob_path = upload_path, file_stream = file_stream)
                   
            
                blob_handler.cleanup_temp_files(spreadsheet_path)
    
    except pymongo.errors.ConnectionFailure as e:
        print(type(e).__name__, str(e))
        raise DatabaseConnectionError()
    except (AzureError, PyMongoError) as e:
        print(type(e).__name__, str(e))
        print('we caught an azure/mongo error')
        # Abort transaction if anything unexpectedfails
        if session.in_transaction:
            await session.abort_transaction()

        if isinstance(e, AzureError):
            raise AzureBlobStorageError()
        elif isinstance(e, PyMongoError):
            print(type(e).__name__, str(e))
            raise MongoDBError()
    except Exception as e:
        print(type(e).__name__, str(e))
        raise e
    else:
        return {'message': 'ATP submission updated successfully', 'submissionId': atp_submission_id}

@router.get("/pending/metadata", response_model = responses.ATPAllPendingSubmissionsMetadata)
async def get_all_pending_submissions_metadata(
    atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection), 
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection)
    ):

    pending_submissions = []
   
    async for submission in atp_submissions.find({'status': 'pending'}):
        pending_submissions.append(submission)
    
    if not pending_submissions:
        return []
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    submission_form_ids = set(str(sub['formId']) for sub in pending_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in submission_form_ids]
    
    # Get form metadata for all relevant forms
    form_metadata_dict = {}
    
    async for form in atp_forms.find({'_id': {'$in': form_object_ids}}):
        form_metadata_dict[str(form['_id'])] = {
            'formTitle': form['metadata']['title'], 
            'formDescription': form['metadata']['description'],
            'formGroupId': form['metadata']['formGroupID']  # Get formGroupId from form template
        }
    if not form_metadata_dict:
        return []
    
    result = []
    for atp_submission in pending_submissions:
        form_id = str(atp_submission['formId'])
        submission_data = {}
        if form_metadata_dict.get(form_id, {}).get('formGroupId', '') != '':
            submission_data = {
            'submissionId': str(atp_submission['_id']),
            'formId': form_id,
            'formGroupId': form_metadata_dict.get(form_id, {}).get('formGroupId', ''),  # Use formGroupId from form template
            'submittedBy': atp_submission['submittedBy'],
            'submittedAt': atp_submission['submittedAt'],
            'formTitle': form_metadata_dict.get(form_id, {}).get('formTitle', ''),
            'formDescription': form_metadata_dict.get(form_id, {}).get('formDescription', ''),
            'status': atp_submission['status']
        }
        if submission_data:
            result.append(submission_data)
    return result

@router.get("/metadata", response_model = responses.ATPAllSubmissionsMetadata)
async def get_all_atp_submissions_metadata(
    atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection), 
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection)
    ):
    #TODO: add error handling when a form is submitted but the form template metadata is deleted/not found
    try:
        all_submissions = []
        async for submission in atp_submissions.find():
            all_submissions.append(submission)
        if not all_submissions:
            return []
        
        # Extract unique form IDs from the submissions and convert to ObjectId
        submission_form_ids = set(str(sub['formId']) for sub in all_submissions)
        form_object_ids = [ObjectId(form_id) for form_id in submission_form_ids]
        
        # Get form metadata for all relevant forms
        form_metadata_dict = {}
        async for form in atp_forms.find({'_id': {'$in': form_object_ids}}):
            form_metadata_dict[str(form['_id'])] = {
                'formTitle': form['metadata']['title'], 
                'formDescription': form['metadata']['description'],
                'formGroupId': form['metadata'].get('formGroupID', '')  # Get formGroupId from form template
            }
    
        
        result = []
        for atp_submission in all_submissions:
            submission_data = {}
            form_id = str(atp_submission['formId'])
            if atp_submission['status'] == 'pending' and form_metadata_dict.get(form_id, {}).get('formGroupId', '') != '':
                submission_data = {
                    'submissionId': str(atp_submission['_id']),
                    'formId': form_id,
                    'formGroupId': form_metadata_dict.get(form_id, {}).get('formGroupId', ''),  # Use formGroupId from form template
                    'formTitle': form_metadata_dict.get(form_id, {}).get('formTitle', ''),
                    'formDescription': form_metadata_dict.get(form_id, {}).get('formDescription', ''),
                    'submittedBy': atp_submission['submittedBy'],
                    'submittedAt': atp_submission['submittedAt'],
                    'reviewedBy': None,
                    'reviewedAt': None,
                    'status': atp_submission['status']
                }
            elif atp_submission['status'] in ['approved', 'rejected'] and form_metadata_dict.get(form_id, {}).get('formGroupId', '') != '':
                submission_data = {
                    'submissionId': str(atp_submission['_id']),
                    'formId': form_id,
                    'formGroupId': form_metadata_dict.get(form_id, {}).get('formGroupId', ''),  # Use formGroupId from form template
                    'formTitle': form_metadata_dict.get(form_id, {}).get('formTitle', ''),
                    'formDescription': form_metadata_dict.get(form_id, {}).get('formDescription', ''),
                    'submittedBy': atp_submission['submittedBy'],
                    'submittedAt': atp_submission['submittedAt'],
                    'reviewedBy': atp_submission['reviewedBy'],
                    'reviewedAt': atp_submission['reviewedAt'],
                    'status': atp_submission['status']
                }
            if submission_data:
                result.append(submission_data)
    
    except pymongo.errors.ConnectionFailure as e:
        print(type(e).__name__, str(e))
        raise DatabaseConnectionError()
    except (AzureError, PyMongoError) as e:
        print(type(e).__name__, str(e))
        print('we caught an azure/mongo error')
        # Abort transaction if anything unexpectedfails
        if isinstance(e, AzureError):
            raise AzureBlobStorageError()
        elif isinstance(e, PyMongoError):
            print(type(e).__name__, str(e))
            raise MongoDBError()
    except Exception as e:
        print(type(e).__name__, str(e))
        raise e
    else:
        return result

#FastAPI checks routes based on the order they are defined -> most specific routes should be defined first
#This route is the least specific because it matches to anything
#TODO: add engineer submission data to the response if applicable (so the frontend can display it)
@router.get("/{atp_submission_id}", response_model = responses.ATPSpecifiedSubmissionResponse)
async def get_submission(
    atp_submission_id: str, 
    atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection),
    blob_handler: Callable = Depends(get_blob_handler)
    ):
    try:
        query = {'_id': ObjectId(atp_submission_id)}
    
        atp_submission_document = await atp_submissions.find_one(query)
        if not atp_submission_document:
            raise ATPSubmissionNotFoundError(collection_name = 'atp_submissions', document_id = atp_submission_id)
        
        # Ensure required fields are present for the response model
        atp_submission_document['_id'] = str(atp_submission_document['_id'])
        
        # Add missing optional fields if they don't exist
        #fill-atp doesn't use these fields since they are only used to reset the default values of the form if the location is review-atp
        if 'reviewedAt' in atp_submission_document:
            form_group_id, form_id = atp_submission_document["formGroupId"], atp_submission_document["formId"]
            reviewed_at_isoformat = atp_submission_document["reviewedAt"]
            reviewed_at = datetime.fromisoformat(reviewed_at_isoformat)
            reviewed_at_path_format = reviewed_at.strftime("%Y-%m-%d_%H-%M-%S")
            
            blob_path = f'{form_group_id}/submissions/{form_id}_{reviewed_at_path_format}.xlsx'
            atp_submission_document['completedSpreadsheetURL'] = blob_handler.get_blob_url(container_name = 'spreadsheets', blob_name = blob_path)
        else:
            atp_submission_document['completedSpreadsheetURL'] = None
            atp_submission_document['reviewedAt'] = None
            atp_submission_document['reviewedBy'] = None
            atp_submission_document['engineerResponses'] = None
            atp_submission_document['engineerStartTime'] = None

    except pymongo.errors.ConnectionFailure as e:
        print(type(e).__name__, str(e))
        raise DatabaseConnectionError()
    except (AzureError, PyMongoError) as e:
        print(type(e).__name__, str(e))
        print('we caught an azure/mongo error')
        # Abort transaction if anything unexpectedfails
        if isinstance(e, AzureError):
            raise AzureBlobStorageError()
        elif isinstance(e, PyMongoError):
            print(type(e).__name__, str(e))
            raise MongoDBError()
    except Exception as e:
        print(type(e).__name__, str(e))
        raise e
    else:
        return atp_submission_document
   
