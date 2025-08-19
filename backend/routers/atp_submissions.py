from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated
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
   
@router.patch("/{atp_submission_id}")
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

@router.get("/technicianSubmission/{atp_submission_id}")
async def get_technician_submission(atp_submission_id: str, atp_submissions: Collection = Depends(get_atp_submissions_collection)):
    query = {'_id': ObjectId(atp_submission_id)}
    projection = {'_id': 1,'technicianResponses': 1, 'formId': 1, 'submittedBy': 1, 'submittedAt': 1}
    atp_submission_document = atp_submissions.find_one(query, projection)
    if not atp_submission_document:
        return {'error': 'ATP submission not found'}
    atp_submission_document['_id'] = str(atp_submission_document['_id'])
    return atp_submission_document

@router.get("/pending")
async def get_pending_atp_submission(atp_submissions: Collection = Depends(get_atp_submissions_collection), atp_forms: Collection = Depends(get_atp_forms_collection)):

    pending_submissions = list(atp_submissions.find({'status': 'pending'}))
    
    # Extract unique form IDs from the submissions and convert to ObjectId
    form_ids = set(str(sub['formId']) for sub in pending_submissions)
    form_object_ids = [ObjectId(form_id) for form_id in form_ids]
    
    # Get form metadata for all relevant forms
    atp_forms_cursor = atp_forms.find({'_id': {'$in': form_object_ids}})
    
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
        }
        result.append(submission_data)
    return result
   
