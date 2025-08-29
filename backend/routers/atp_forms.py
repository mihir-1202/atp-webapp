from fastapi import APIRouter, Body, Depends, Path
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_forms_collection, get_atp_submissions_collection   
from schemas import atp_forms as schemas, atp_forms_responses as responses
from azure.storage.blob import BlobServiceClient
from dependencies import get_blob_service_client, get_client
from pymongo.mongo_client import MongoClient

router = APIRouter()

#FastAPI coerces the return value to the response model as a JSON
@router.post("/", response_model = responses.ATPNewFormCreationResponse)
async def create_form_template(
    form_template: Annotated[schemas.FormTemplate, Body()],
    client: MongoClient = Depends(get_client),
    atp_forms: Collection = Depends(get_atp_forms_collection),
    blob_service_client: BlobServiceClient = Depends(get_blob_service_client)
):
    """
    Create a new ATP form template for the first time.

    - **form_template**: The ATP form template JSON object to create
    """
    with client.start_session() as session:
        try:
            #Upload the spreadsheet template data to MongoDB
            form_group_id = str(ObjectId())
            form_template_data = form_template.model_dump()
            
            form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
            form_template_data['metadata']['status'] = 'active'
            form_template_data['metadata']['version'] = 1
            form_template_data['metadata']['formGroupID'] = form_group_id
            inserted_document = atp_forms.insert_one(form_template_data)
            new_form_id = inserted_document.inserted_id
            
            #Upload the spreadsheet template to Azure Blob Storage
            blob_path = f'{form_group_id}/active-form/{new_form_id}.xlsx'
            blob_client = blob_service_client.get_blob_client(
                container = 'atpspreadsheets',
                blob = blob_path
            )
            blob_client.upload_blob(form_template.spreadsheetTemplate.file)
            session.commit_transaction()
        except Exception as e:
            session.abort_transaction()
            raise e
        return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}

@router.get("/active", response_model = responses.ATPAllActiveForms)
async def get_active_form_templates(atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get all ATP form templates that are currently active.
    """
    #TODO: only return the metadata of the form templates instead of the entire document
    cursor = atp_forms.find({'metadata.status': 'active'})
    form_templates = []
    for document in cursor:
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        form_templates.append(document)
    return form_templates

@router.get("/active/{atp_form_group_id}", response_model = responses.ATPSpecifiedForm)
async def get_active_form_template(atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to get", example = "674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get an active ATP form template by its form group ID.
    """
    query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    
    if not atp_form_document:
        return {"error": "ATP form group not found"}
    
    atp_form_document['_id'] = str(atp_form_document['_id'])
    return atp_form_document

@router.put("/active/{atp_form_group_id}", response_model = responses.ATPFormUpdateResponse)
async def update_active_form_template(
    atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to update", example = "674a1b2c3d4e5f6789012345")],
    form_template: Annotated[schemas.FormTemplate, Body()],
    atp_forms: Collection = Depends(get_atp_forms_collection)
):
    """
    Update an ATP form template by form group ID (creates a new version).
    """
    query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form group not found"}
    
    # Convert Pydantic model to dictionary
    new_form_template_data = form_template.model_dump()
    new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
    new_form_template_data['metadata']['status'] = 'active'
    new_form_template_data['metadata']['version'] = atp_form_document['metadata']['version'] + 1
    new_form_template_data['metadata']['formGroupID'] = atp_form_document['metadata']['formGroupID']
    
    # Make the old template inactive
    atp_forms.update_one(query, {'$set': {'metadata.status': 'inactive'}})
    # Insert the new template
    atp_forms.insert_one(new_form_template_data)
    
    return {"message": "ATP form template updated successfully"}








@router.get("/{atp_form_id}", response_model = responses.ATPSpecifiedForm)
async def get_form_template(atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to get", example = "674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get an ATP form.
    """
    query = {'_id': ObjectId(atp_form_id)}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form not found"}
        #TODO: add error handling if an atp form is not found
    atp_form_document['_id'] = str(atp_form_document['_id'])  # Convert ObjectId to string
    return atp_form_document


@router.delete("/{atp_form_group_id}", response_model = responses.ATPFormDeleteResponse)
async def delete_form_template(
    atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to delete", example = "674a1b2c3d4e5f6789012345")], 
    atp_forms: Collection = Depends(get_atp_forms_collection),
    atp_submissions: Collection = Depends(get_atp_submissions_collection)
):
    """
    Delete an ATP form.
    """
    try:
        # Validate ObjectId format
        object_id = ObjectId(atp_form_group_id)
    except Exception:
        return {"error": "Invalid ATP form ID format"}
    
    query = {'metadata.formGroupID': atp_form_group_id}
    result = atp_forms.delete_many(query)
    
    if result.deleted_count == 0:
        return {"error": "ATP form not found"}
    
    #delete all submissions associated with the ATP form
    atp_submissions.delete_many({'formGroupId': atp_form_group_id})
    
    return {"message": "ATP form and corresponding submissions deleted successfully"}

