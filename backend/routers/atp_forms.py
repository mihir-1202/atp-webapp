from fastapi import APIRouter, Body, Depends, Path
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_forms_collection, get_atp_submissions_collection   
from schemas import atp_forms as schemas

router = APIRouter()

@router.post("/")
async def create_form_template(
    form_template: Annotated[schemas.FormTemplate, Body()],
    atp_forms: Collection = Depends(get_atp_forms_collection),
):
    """
    Create a new ATP form template for the first time.

    - **form_template**: The ATP form template JSON object to create
    """

    form_template_data = form_template.model_dump()
    
    form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
    form_template_data['metadata']['status'] = 'active'
    form_template_data['metadata']['version'] = 1
    form_template_data['metadata']['formGroupID'] = str(ObjectId())
    
    print("Validated form template:", form_template_data)
    inserted_document = atp_forms.insert_one(form_template_data)
    return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}

#TODO: update the http method to something more appropriate for updating the version of the form template and archiving the old version
@router.put("/{atp_form_id}")
async def update_form_template(
    atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to update", example = "674a1b2c3d4e5f6789012345")], 
    form_template: Annotated[schemas.FormTemplate, Body()], 
    atp_forms: Collection = Depends(get_atp_forms_collection)
):
    query = {'_id': ObjectId(atp_form_id), 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form not found and cannot be updated"}
    
    # Convert Pydantic model to dictionary
    new_form_template_data = form_template.model_dump()
    # Update the document
    result = atp_forms.update_one(query, {'$set': {'metadata.status': 'inactive'}})
    
    if result.matched_count == 0:
        return {"error": "ATP form not found and cannot be updated"}
    if result.modified_count == 0:
        return {"error": "ATP form was not modified"}
    else:
        new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
        new_form_template_data['metadata']['status'] = 'active'
        new_form_template_data['metadata']['version'] = atp_form_document['metadata']['version'] + 1
        new_form_template_data['metadata']['formGroupID'] = atp_form_document['metadata']['formGroupID']
        result = atp_forms.insert_one(new_form_template_data)
        
    return {"message": "ATP form updated successfully"}

@router.get("/active")
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

@router.get("/active/{atp_form_group_id}")
async def get_active_form_template(atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to get", example = "674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get an active ATP form template by its form group ID.
    """
    query = {'_id': ObjectId(atp_form_group_id), 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    
    if not atp_form_document:
        return {"error": "ATP form group not found"}
    
    atp_form_document['_id'] = str(atp_form_document['_id'])
    return atp_form_document

@router.post("/active/{atp_form_group_id}")
async def create_form_template(
    atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to create a form template for", example = "674a1b2c3d4e5f6789012345")],
    form_template: Annotated[schemas.FormTemplate, Body()],
    atp_forms: Collection = Depends(get_atp_forms_collection)
):
    """
    Create a new ATP form template for an active ATP form group.
    """
    query = {'_id': ObjectId(atp_form_group_id), 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form group not found"}
    
    form_template_data = form_template.model_dump()
    form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
    form_template_data['metadata']['status'] = 'active'
    form_template_data['metadata']['version'] = 1
    form_template_data['metadata']['formGroupID'] = atp_form_document['metadata']['formGroupID']
    
    #Make the old template inactive
    atp_forms.update_one(query, {'$set': {'metadata.status': 'inactive'}})
    #Put the new template in the database
    atp_forms.insert_one(form_template_data)
    
    return {"message": "ATP form template created successfully"}

@router.get("/all")
async def get_all_form_templates(atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get all ATP form templates, regardless of their status.
    """
    #TODO: only return the metadata of the form templates instead of the entire document
    cursor = atp_forms.find()
    form_templates = []
    for document in cursor:
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        form_templates.append(document)
    return form_templates

@router.get("/{atp_form_id}/metadata")
async def get_atp_form_metadata(atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to get the metadata of", example = "674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection)):
    """
    Get the metadata of an ATP form.
    """
    query = {'_id': ObjectId(atp_form_id)}
    atp_form_document = atp_forms.find_one(query)
    if not atp_form_document:
        return {"error": "ATP form not found"}
    atp_form_document['_id'] = str(atp_form_document['_id'])
    return atp_form_document['metadata']


@router.get("/{atp_form_id}")
async def get_atp_form(atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to get", example = "674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection)):
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


@router.delete("/{atp_form_id}")
async def delete_form_template(
    atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to delete", example = "674a1b2c3d4e5f6789012345")], 
    atp_forms: Collection = Depends(get_atp_forms_collection),
    atp_submissions: Collection = Depends(get_atp_submissions_collection)
):
    """
    Delete an ATP form.
    """
    try:
        # Validate ObjectId format
        object_id = ObjectId(atp_form_id)
    except Exception:
        return {"error": "Invalid ATP form ID format"}
    
    query = {'_id': object_id}
    result = atp_forms.delete_one(query)
    
    if result.deleted_count == 0:
        return {"error": "ATP form not found"}
    
    #delete all submissions associated with the ATP form
    atp_submissions.delete_many({'formId': atp_form_id})
    
    return {"message": "ATP form and corresponding submissions deleted successfully"}

