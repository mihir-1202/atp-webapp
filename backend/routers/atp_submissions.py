from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_submissions_collection
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
    return {'message': 'Submitted ATP succesfully', 'submission_id': str(inserted_document.inserted_id)}