from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
from bson import ObjectId
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
async def get_form_templates_metadata(atp_forms: Collection = Depends(get_atp_forms_collection)):
    #TODO: only return the metadata of the form templates instead of the entire document
    cursor = atp_forms.find()
    form_templates = []
    for document in cursor:
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        form_templates.append(document)
    return form_templates

@router.get("/{atp_form_id}")
async def get_atp_form(atp_form_id: str, atp_forms: Collection = Depends(get_atp_forms_collection)):
    query = {'_id': ObjectId(atp_form_id)}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form not found"}
        #TODO: add error handling if an atp form is not found
    atp_form_document['_id'] = str(atp_form_document['_id'])  # Convert ObjectId to string
    return atp_form_document

