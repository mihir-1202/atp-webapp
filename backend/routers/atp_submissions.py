from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated, Dict, Any
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_submissions_collection, get_atp_forms_collection
from schemas import atp_submissions as schemas

router = APIRouter()

@router.post("/")
async def create_atp_submission(
    atp_submission: Annotated[schemas.ATPTechnicianSubmission, Body()],
    atp_submissions: Collection = Depends(get_atp_submissions_collection)
):
    atp_submission_data = atp_submission.model_dump()
    atp_submission_data['submittedAt'] = datetime.now().isoformat()
    atp_submission_data['status'] = 'pending'
    inserted_document = atp_submissions.insert_one(atp_submission_data)
    return {'message': 'Submitted ATP succesfully', 'submissionId': str(inserted_document.inserted_id)}
   
@router.put("/{atp_submission_id}")
async def update_atp_submission(atp_submission_id: str, 
                                atp_submission: Annotated[schemas.ATPReviewSubmission, Body()], 
                                atp_submissions: Collection = Depends(get_atp_submissions_collection)):
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
    
    return {'message': 'ATP submission updated successfully', 'submissionId': atp_submission_id}

@router.get("/pending/metadata")
async def get_pending_atp_submission(atp_submissions: Collection = Depends(get_atp_submissions_collection), atp_forms: Collection = Depends(get_atp_forms_collection)):

    pending_submissions = list(atp_submissions.find({'status': 'pending'}))
    
    if not pending_submissions:
        return []
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    form_ids = set(str(sub['formId']) for sub in pending_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in form_ids]
    
    # Get form metadata for all relevant forms
    atp_forms_cursor = atp_forms.find({'_id': {'$in': form_object_ids}})
    
    #Create a dictionary of form metadata for all relevant forms where the key is the form id and the value is the form metadata
    form_metadata_dict = {
        str(form['_id']): {
            'formTitle': form['metadata']['title'], 
            'formDescription': form['metadata']['description']
        } 
        for form in atp_forms_cursor
    }
    
    result = []
    for atp_submission in pending_submissions:
        form_id = str(atp_submission['formId'])
        submission_data = {
            'submissionId': str(atp_submission['_id']),
            'formId': form_id,
            'submittedBy': atp_submission['submittedBy'],
            'submittedAt': atp_submission['submittedAt'],
            'formTitle': form_metadata_dict[form_id]['formTitle'],
            'formDescription': form_metadata_dict[form_id]['formDescription'],
            'status': atp_submission['status']
        }
        result.append(submission_data)
    return result

@router.get("/metadata")
async def get_atp_submission_metadata(atp_submissions: Collection = Depends(get_atp_submissions_collection), atp_forms: Collection = Depends(get_atp_forms_collection)):
    all_submissions = list(atp_submissions.find())
    if not all_submissions:
        return []
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    form_ids = set(str(sub['formId']) for sub in all_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in form_ids]
    
    # Get form metadata for all relevant forms
    atp_forms_cursor = atp_forms.find({'_id': {'$in': form_object_ids}})
    
    #Create a dictionary of form metadata for all relevant forms where the key is the form id and the value is the form metadata
    form_metadata_dict = {
        str(form['_id']): {
            'formTitle': form['metadata']['title'], 
            'formDescription': form['metadata']['description']
        } 
        for form in atp_forms_cursor
    }
    
    result = []
    for atp_submission in all_submissions:
        form_id = str(atp_submission['formId'])
        if atp_submission['status'] == 'pending':
            submission_data = {
                'submissionId': str(atp_submission['_id']),
                'formId': form_id,
                'formTitle': form_metadata_dict[form_id]['formTitle'],
                'formDescription': form_metadata_dict[form_id]['formDescription'],
                'submittedBy': atp_submission['submittedBy'],
                'submittedAt': atp_submission['submittedAt'],
                'reviewedBy': None,
                'reviewedAt': None,
                'status': atp_submission['status']
            }
        else:
            submission_data = {
                'submissionId': str(atp_submission['_id']),
                'formId': form_id,
                'formTitle': form_metadata_dict[form_id]['formTitle'],
                'formDescription': form_metadata_dict[form_id]['formDescription'],
                'submittedBy': atp_submission['submittedBy'],
                'submittedAt': atp_submission['submittedAt'],
                'reviewedBy': atp_submission['reviewedBy'],
                'reviewedAt': atp_submission['reviewedAt'],
                'status': atp_submission['status']
            }
        result.append(submission_data)
    return result


@router.get("/")
async def get_all_atp_submissions(atp_submissions: Collection = Depends(get_atp_submissions_collection)):
    all_submissions = [{**doc, '_id': str(doc['_id'])} for doc in atp_submissions.find()]
    return all_submissions

#FastAPI checks routes based on the order they are defined -> most specific routes should be defined first
#This route is the least specific because it matches to anything
#TODO: add engineer submission data to the response if applicable (so the frontend can display it)
@router.get("/{atp_submission_id}")
async def get_technician_submission(atp_submission_id: str, atp_submissions: Collection = Depends(get_atp_submissions_collection)):
    query = {'_id': ObjectId(atp_submission_id)}
    #projection = {'_id': 1,'technicianResponses': 1, 'engineerResponses': 1, 'formId': 1, 'submittedBy': 1, 'submittedAt': 1, 'status': 1, 'reviewedBy': 1, 'reviewedAt': 1}
    #atp_submission_document = atp_submissions.find_one(query, projection)
    atp_submission_document = atp_submissions.find_one(query)
    if not atp_submission_document:
        return {'error': 'ATP submission not found'}
    atp_submission_document['_id'] = str(atp_submission_document['_id'])
    return atp_submission_document
   
