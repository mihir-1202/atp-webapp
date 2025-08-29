from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated, Dict, Any, Callable
from openpyxl.worksheet import cell_range
from pymongo.collection import Collection
from pymongo.mongo_client import MongoClient
from bson import ObjectId
from dependencies import get_atp_submissions_collection, get_atp_forms_collection, get_blob_handler, get_mongo_client, get_atp_spreadsheet_manager, ATPSpreadsheetManager
from schemas import atp_submissions as schemas, atp_submissions_responses as responses

router = APIRouter()

#Technician submission
@router.post("/", response_model = responses.ATPSubmissionCreationResponse)
async def create_atp_submission(
    atp_submission: Annotated[schemas.ATPTechnicianSubmission, Body()],
    atp_submissions: Collection = Depends(get_atp_submissions_collection)
):
    atp_submission_data = atp_submission.model_dump()
    atp_submission_data['submittedAt'] = datetime.now().isoformat()
    atp_submission_data['status'] = 'pending'
    inserted_document = atp_submissions.insert_one(atp_submission_data)
    return {'message': 'Submitted ATP succesfully', 'submissionId': str(inserted_document.inserted_id)}
   
#Engineer review submission
@router.put("/{atp_submission_id}", response_model = responses.ATPReviewSubmissionResponse)
async def update_atp_submission(atp_submission_id: str, 
                                atp_submission: Annotated[schemas.ATPReviewSubmission, Body()], 
                                atp_submissions: Collection = Depends(get_atp_submissions_collection),
                                client: MongoClient = Depends(get_mongo_client),
                                atp_spreadsheet_manager: ATPSpreadsheetManager = Depends(get_atp_spreadsheet_manager),
                                blob_handler: Callable = Depends(get_blob_handler)
                                ):
    
    with client.start_session() as session:
        try:
            # Validate ObjectId format
            object_id = ObjectId(atp_submission_id)
        except Exception:
            return {'error': 'Invalid submission ID format', 'submissionId': None}
        
        atp_review_data = atp_submission.model_dump()
        atp_review_data['reviewedAt'] = datetime.now().isoformat()
        
        # Check if the submission exists and update it
        result = atp_submissions.update_one({'_id': object_id}, {'$set': atp_review_data})
        
        if result.matched_count == 0:
            return {'error': 'ATP submission not found', 'submissionId': None}
        
        if result.modified_count == 0:
            return {'error': 'ATP submission was not modified', 'submissionId': atp_submission_id}
        
        spreadsheet_path = blob_handler.download_blob(container_name = 'spreadsheets', blob_path = f'{atp_review_data["formGroupId"]}/active-form/{atp_review_data["formId"]}.xlsx')
        with atp_spreadsheet_manager.register_workbook(spreadsheet_path):
            cell_to_response_mappings = {}
            for response in atp_review_data['technicianResponses']:
                cell_to_response_mappings[response['spreadsheetCell']] = response['answer']
            for response in atp_review_data['engineerResponses']:
                cell_to_response_mappings[response['spreadsheetCell']] = response['answer']
            atp_spreadsheet_manager.populate_cells_with_responses(cell_to_response_mappings)
            upload_path = f'{atp_review_data["formGroupId"]}/submissions/{atp_review_data["formId"]}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
            with open(spreadsheet_path, 'rb') as file_stream:
                blob_handler.upload_blob(container_name = 'spreadsheets', blob_path = upload_path, file_stream = file_stream)
            blob_handler.cleanup_temp_files(spreadsheet_path)
        
    return {'message': 'ATP submission updated successfully', 'submissionId': atp_submission_id}

@router.get("/pending/metadata", response_model = responses.ATPAllPendingSubmissionsMetadata)
async def get_all_pending_submissions_metadata(
    atp_submissions: Collection = Depends(get_atp_submissions_collection), 
    atp_forms: Collection = Depends(get_atp_forms_collection)
    ):

    pending_submissions = list(atp_submissions.find({'status': 'pending'}))
    
    if not pending_submissions:
        return []
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    submission_form_ids = set(str(sub['formId']) for sub in pending_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in submission_form_ids]
    
    # Get form metadata for all relevant forms
    atp_forms_cursor = atp_forms.find({'_id': {'$in': form_object_ids}})
    
    if not atp_forms_cursor:
        return []
    
    #Create a dictionary of form metadata for all relevant forms where the key is the form id and the value is the form metadata
    form_metadata_dict = {
        str(form['_id']): {
            'formTitle': form['metadata']['title'], 
            'formDescription': form['metadata']['description'],
            'formGroupId': form['metadata']['formGroupID']  # Get formGroupId from form template
        } 
        for form in atp_forms_cursor
    }
    
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
    atp_submissions: Collection = Depends(get_atp_submissions_collection), 
    atp_forms: Collection = Depends(get_atp_forms_collection)
    ):
    #TODO: add error handling when a form is submitted but the form template metadata is deleted/not found
    all_submissions = list(atp_submissions.find())
    if not all_submissions:
        return []
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    submission_form_ids = set(str(sub['formId']) for sub in all_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in submission_form_ids]
    
    # Get form metadata for all relevant forms
    atp_forms_cursor = atp_forms.find({'_id': {'$in': form_object_ids}})
    
    if not atp_forms_cursor:
        return []
    
    #Create a dictionary of form metadata for all relevant forms where the key is the form id and the value is the form metadata dictionary
    form_metadata_dict = {
        str(form['_id']): {
            'formTitle': form['metadata']['title'], 
            'formDescription': form['metadata']['description'],
            'formGroupId': form['metadata'].get('formGroupID', '')  # Get formGroupId from form template
        } 
        for form in atp_forms_cursor
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
    return result

#FastAPI checks routes based on the order they are defined -> most specific routes should be defined first
#This route is the least specific because it matches to anything
#TODO: add engineer submission data to the response if applicable (so the frontend can display it)
@router.get("/{atp_submission_id}", response_model = responses.ATPSpecifiedSubmissionResponse)
async def get_submission(
    atp_submission_id: str, 
    atp_submissions: Collection = Depends(get_atp_submissions_collection)
    ):
    query = {'_id': ObjectId(atp_submission_id)}
   
    atp_submission_document = atp_submissions.find_one(query)
    if not atp_submission_document:
        return {'error': 'ATP submission not found'}
    
    # Ensure required fields are present for the response model
    atp_submission_document['_id'] = str(atp_submission_document['_id'])
    
    # Add missing optional fields if they don't exist
    #fill-atp doesn't use these fields since they are only used to reset the default values of the form if the location is review-atp
    if 'reviewedAt' not in atp_submission_document:
        atp_submission_document['reviewedAt'] = None
    if 'reviewedBy' not in atp_submission_document:
        atp_submission_document['reviewedBy'] = None
    if 'engineerResponses' not in atp_submission_document:
        atp_submission_document['engineerResponses'] = None
    
    return atp_submission_document
   
