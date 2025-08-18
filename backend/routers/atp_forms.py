from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
import sys
import os
# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dependencies import get_atp_forms_collection
from schemas import atp_forms as schemas

router = APIRouter()

@router.post("/")
async def create_form_template(
    form_template: Annotated[schemas.FormTemplate, Body()],
    atp_forms: Collection = Depends(get_atp_forms_collection)
):
    form_template_data = form_template.model_dump()
    form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
    print("Validated form template:", form_template_data)
    inserted_document = atp_forms.insert_one(form_template_data)
    return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}

@router.get("/metadata")
async def get_form_templates(atp_forms: Collection = Depends(get_atp_forms_collection)):
    cursor = atp_forms.find()
    form_templates = []
    for document in cursor:
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        form_templates.append(document)
    return form_templates

