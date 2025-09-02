from fastapi import APIRouter, Body, Depends, Path, Form, File, UploadFile
from datetime import datetime
from typing import Annotated, Optional, Union, Literal
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_forms_collection, get_atp_submissions_collection
from schemas import atp_forms as schemas, atp_forms_responses as responses
from dependencies import parse_technician_image_data, parse_engineer_image_data, get_mongo_client, get_blob_handler
from typing import Callable
from pymongo.mongo_client import MongoClient
import json

router = APIRouter()

#New endpoint
@router.post("/", response_model = responses.ATPNewFormCreationResponse)
async def create_form_template(
    spreadsheetTemplate: Annotated[UploadFile, File()], #File() implies that spreadsheetTemplate is of type Form()/FormData, and it will be converted into an UploadFile obejct
    metadata: Annotated[str, Form()],
    sections: Annotated[str, Form()],
    technicianImageData: dict = Depends(parse_technician_image_data),
    engineerImageData: dict = Depends(parse_engineer_image_data),
    client: MongoClient = Depends(get_mongo_client),
    atp_forms: Collection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    """
    Create a new ATP form template for the first time.

    - **form_template**: The ATP form template JSON object to create
    """
    with client.start_session() as session:
        try:
            # Parse JSON strings back to objects
            metadata_obj = json.loads(metadata)
            sections_obj = json.loads(sections)
            
            # Validate the data using Pydantic
            validated_request_body = schemas.FormTemplate(
                spreadsheetTemplate=spreadsheetTemplate,
                metadata=schemas.Metadata(**metadata_obj),
                sections=sections_obj
            )
            
            if not validated_request_body.spreadsheetTemplate:
                raise ValueError("Spreadsheet template is required")
            
            
            new_form_template_data = validated_request_body.model_dump()
            # Remove the UploadFile object as it can't be stored in MongoDB
            new_form_template_data.pop('spreadsheetTemplate', None)

            # Add server-generated fields
            form_group_id = str(ObjectId())
            new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
            new_form_template_data['metadata']['status'] = 'active'
            new_form_template_data['metadata']['version'] = 1
            new_form_template_data['metadata']['formGroupID'] = form_group_id

            #Initialize the hasImage and image fields for each item in the technician and engineer sections (to be filled later)
            for item in new_form_template_data['sections']['technician']['items']:
                item['hasImage'] = False
                item['image'] = None
            
            for item in new_form_template_data['sections']['engineer']['items']:
                item['hasImage'] = False
                item['image'] = None

            #Upload images to Azure Blob Storage
            for index, image in technicianImageData.items():
                container_name, blob_path = 'images', f'{form_group_id}/technician/{index}.png'
                # Support both uploaded files and remote URLs
                
                print(type(image))
                if hasattr(image, 'file') and hasattr(image, 'filename'):
                    data = image.file  # file-like
                else:
                    print(f'{image} is not an UploadFile')
                    continue
                
                blob_handler.upload_blob(container_name, blob_path, data)
                new_form_template_data['sections']['technician']['items'][index]['image'] = blob_path
                new_form_template_data['sections']['technician']['items'][index]['hasImage'] = True
                
            
            for index, image in engineerImageData.items():
                container_name, blob_path = 'images', f'{form_group_id}/engineer/{index}.png'
                
                print(type(image))
                if hasattr(image, 'file') and hasattr(image, 'filename'):
                    data = image.file
                else:
                    print(f'{image} is not an UploadFile')
                    continue
                blob_handler.upload_blob(container_name, blob_path, data)
                new_form_template_data['sections']['engineer']['items'][index]['image'] = blob_path
                new_form_template_data['sections']['engineer']['items'][index]['hasImage'] = True
                
            
            # Start transaction
            session.start_transaction()
            
            # Insert into MongoDB
            inserted_document = atp_forms.insert_one(new_form_template_data, session=session)
            new_form_id = inserted_document.inserted_id
            
            # Upload excel spreadsheet to Azure Blob Storage
            container_name, blob_path = 'spreadsheets', f'{form_group_id}/active-form/{new_form_id}.xlsx'
            blob_handler.upload_blob(container_name, blob_path, spreadsheetTemplate.file)
            session.commit_transaction()
            
            return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}
            
        except Exception as e:
            # Abort transaction if anything fails
            session.abort_transaction()
            raise e

"""
#FastAPI coerces the return value to the response model as a JSON
@router.post("/", response_model = responses.ATPNewFormCreationResponse)
async def create_form_template(
    spreadsheetTemplate: Annotated[UploadFile, File()], #File() implies that spreadsheetTemplate is of type Form()/FormData, and it will be converted into an UploadFile obejct
    metadata: Annotated[str, Form()],
    sections: Annotated[str, Form()],
    client: MongoClient = Depends(get_mongo_client),
    atp_forms: Collection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    
    #Create a new ATP form template for the first time.

    # **form_template**: The ATP form template JSON object to create
    
    with client.start_session() as session:
        try:
            # Parse JSON strings back to objects
            metadata_obj = json.loads(metadata)
            sections_obj = json.loads(sections)
            
            # Validate the data using Pydantic
            validated_request_body = schemas.FormTemplate(
                spreadsheetTemplate=spreadsheetTemplate,
                metadata=schemas.Metadata(**metadata_obj),
                sections=sections_obj
            )
            
            if not validated_request_body.spreadsheetTemplate:
                raise ValueError("Spreadsheet template is required")
            
            new_form_template_data = validated_request_body.model_dump()
            # Remove the UploadFile object as it can't be stored in MongoDB
            new_form_template_data.pop('spreadsheetTemplate', None)

            # Add server-generated fields
            form_group_id = str(ObjectId())
            new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
            new_form_template_data['metadata']['status'] = 'active'
            new_form_template_data['metadata']['version'] = 1
            new_form_template_data['metadata']['formGroupID'] = form_group_id
            
            
            # Start transaction
            session.start_transaction()
            
            # Insert into MongoDB
            inserted_document = atp_forms.insert_one(new_form_template_data, session=session)
            new_form_id = inserted_document.inserted_id
            
            # Upload to Azure Blob Storage
            container_name, blob_path = 'spreadsheets', f'{form_group_id}/active-form/{new_form_id}.xlsx'
            blob_handler.upload_blob(container_name, blob_path, spreadsheetTemplate.file)
            session.commit_transaction()
            
            return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}
            
        except Exception as e:
            # Abort transaction if anything fails
            session.abort_transaction()
            raise e
"""


@router.put("/active/{atp_form_group_id}", response_model = responses.ATPFormUpdateResponse)
async def update_active_form_template(
    atp_form_group_id: Annotated[str, Path()],
    metadata: Annotated[str, Form()],
    sections: Annotated[str, Form()],
    spreadsheetTemplate: Annotated[Union[UploadFile, Literal['']], File()],
    client: MongoClient = Depends(get_mongo_client),
    atp_forms: Collection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    
    with client.start_session() as session:
        try:
            metadata_obj = json.loads(metadata)
            sections_obj = json.loads(sections)
            
            validated_request_body = schemas.FormTemplate(
                spreadsheetTemplate = spreadsheetTemplate,
                metadata = schemas.Metadata(**metadata_obj),
                sections = sections_obj
            )
        
            new_form_template_data = validated_request_body.model_dump()
            # Remove the UploadFile object as it can't be stored in MongoDB
            new_form_template_data.pop('spreadsheetTemplate', None)
            
            # Find the current active form template
            query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
            current_form = atp_forms.find_one(query)
            if not current_form:
                return {"error": "ATP form group not found"}
            old_form_id = current_form['_id']
            
            # Update metadata with server-generated fields
            new_form_template_data['metadata']['formGroupID'] = atp_form_group_id
            new_form_template_data['metadata']['version'] = current_form['metadata']['version'] + 1
            new_form_template_data['metadata']['status'] = 'active'
            new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
            
            session.start_transaction()
            
            # Make the old template inactive
            atp_forms.update_one(query, {'$set': {'metadata.status': 'inactive'}}, session=session)
            # Insert the new template
            inserted_document = atp_forms.insert_one(new_form_template_data, session=session)
            new_form_id = inserted_document.inserted_id
            
            # Upload new spreadsheet to Azure Blob Storage if a replacement was provided
            if hasattr(spreadsheetTemplate, 'file') and hasattr(spreadsheetTemplate, 'filename'):
                blob_path = f'{atp_form_group_id}/active-form/{new_form_id}.xlsx'
                blob_handler.upload_blob('spreadsheets', blob_path, spreadsheetTemplate.file)
            
                # Archive the old spreadsheet if it exists
                old_blob_path = f'{atp_form_group_id}/active-form/{current_form["_id"]}.xlsx'
                try:
                    blob_handler.move_blob(
                        from_container_name='spreadsheets',
                        blob_path=old_blob_path,
                        to_container_name='spreadsheets',
                        to_blob_path=f'{atp_form_group_id}/archived-forms/{current_form["_id"]}.xlsx'
                    )
                except Exception as e:
                    # If the old blob doesn't exist, just continue (this might be the first version)
                    print(f"Warning: Could not archive old excel template blob {old_blob_path}: {str(e)}. The blob may not exist")

            #Update the spreadsheet template name in Blob Storage with the new form id
            else:
                blob_handler.move_blob(
                    from_container_name='spreadsheets',
                    blob_path=f'{atp_form_group_id}/active-form/{old_form_id}.xlsx',
                    to_container_name='spreadsheets',
                    to_blob_path=f'{atp_form_group_id}/active-form/{new_form_id}.xlsx'
                )
            
            # Commit the transaction
            session.commit_transaction()
                
        except Exception as e:
            # Rollback the transaction on error
            session.abort_transaction()
            return {"error": str(e)}
        
    return {"message": "ATP form template updated successfully"}



@router.get("/active", response_model = responses.ATPAllActiveForms)
async def get_active_form_templates(atp_forms: Collection = Depends(get_atp_forms_collection), blob_handler: Callable = Depends(get_blob_handler)):
    """
    Get all ATP form templates that are currently active.
    """
    #TODO: only return the metadata of the form templates instead of the entire document
    cursor = atp_forms.find({'metadata.status': 'active'})
    form_templates = []
    for document in cursor:
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        for item in document['sections']['technician']['items']:
            item['image'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('image')) if item.get('hasImage') else None

        for item in document['sections']['engineer']['items']:
            item['image'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('image')) if item.get('hasImage') else None
        
        form_templates.append(document)
    return form_templates

@router.get("/active/{atp_form_group_id}", response_model = responses.ATPSpecifiedForm)
async def get_active_form_template(atp_form_group_id: Annotated[str, Path(description="The ID of the ATP form group to get", example="674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection), blob_handler: Callable = Depends(get_blob_handler)):
    """
    Get an active ATP form template by its form group ID.
    """
    print('in getATPTemplateData')
    query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
    atp_form_document = atp_forms.find_one(query)
    
    if not atp_form_document:
        return {"error": "ATP form group not found"}
    
    atp_form_document['_id'] = str(atp_form_document['_id'])
    
    for item in atp_form_document['sections']['technician']['items']:
        item['image'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('image')) if item.get('hasImage') else None
        
        
    for item in atp_form_document['sections']['engineer']['items']:
        item['image'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('image')) if item.get('hasImage') else None
        
       
    print('Final response data:', atp_form_document)
    return atp_form_document

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
    atp_submissions: Collection = Depends(get_atp_submissions_collection),
    client: MongoClient = Depends(get_mongo_client),
    blob_handler: Callable = Depends(get_blob_handler)
):
    """
    Delete an ATP form.
    """
    with client.start_session() as session:
        session.start_transaction()
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
        blob_handler.delete_blobs('spreadsheets', virtual_directory = f'{atp_form_group_id}')
        session.commit_transaction()
    
    return {"message": "ATP form and corresponding submissions deleted successfully"}

