from fastapi import APIRouter, Body, Depends, Path, Form, File, UploadFile
from datetime import datetime
from typing import Annotated, Optional, Union, Literal
from pymongo.collection import Collection
from bson import ObjectId
from dependencies import get_atp_forms_collection, get_atp_submissions_collection
from schemas import atp_forms_requests as schemas, atp_forms_responses as responses
from dependencies import parse_technician_image_data, parse_engineer_image_data, get_mongo_client, get_blob_handler
from typing import Callable
from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection
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
    client: AsyncMongoClient = Depends(get_mongo_client),
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    """
    Create a new ATP form template for the first time.

    - **form_template**: The ATP form template JSON object to create
    """
    async with client.start_session() as session:
        try:
            # Parse JSON strings back to objects
            metadata_obj = json.loads(metadata)
            sections_obj = json.loads(sections)
            
            #Request body validation (excludes the image data)
            validated_request_body = schemas.RequestFormTemplate(
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
            new_form_template_data['metadata']['version'] = version = 1
            new_form_template_data['metadata']['formGroupID'] = form_group_id
            
            print('here1')

            # Initialize all items with default image values
            for item in new_form_template_data['sections']['technician']['items']:
                item['hasImage'] = False
                item['imageBlobPath'] = None
            
            for item in new_form_template_data['sections']['engineer']['items']:
                item['hasImage'] = False
                item['imageBlobPath'] = None

            #Upload images to Azure Blob Storage and update items if necessary
            for uuid, image in technicianImageData.items():
                container_name, blob_path = 'images', f'{form_group_id}/{uuid}_v{version}.png'
                # Support both uploaded files and remote URLs
                
                print(type(image))
                if hasattr(image, 'file') and hasattr(image, 'filename'):
                    data = image.file  # file-like
                else:
                    print(f'{image} is not an UploadFile')
                    continue
                
                await blob_handler.upload_blob(container_name, blob_path, data)
                
                # Find the item by UUID and update it
                for item in new_form_template_data['sections']['technician']['items']:
                    if item['uuid'] == uuid:
                        item['imageBlobPath'] = blob_path                     
                        item['hasImage'] = True
                        break
                
            
            for uuid, image in engineerImageData.items():
                container_name, blob_path = 'images', f'{form_group_id}/{uuid}_v{version}.png'
                
                print(type(image))
                if hasattr(image, 'file') and hasattr(image, 'filename'):
                    data = image.file
                else:
                    print(f'{image} is not an UploadFile')
                    continue
                await blob_handler.upload_blob(container_name, blob_path, data)
                
                # Find the item by UUID and update it
                for item in new_form_template_data['sections']['engineer']['items']:
                    if item['uuid'] == uuid:
                        item['imageBlobPath'] = blob_path
                        item['hasImage'] = True
                        break
                
            
            # Start transaction
            await session.start_transaction()
            
            # Insert into MongoDB
            inserted_document = await atp_forms.insert_one(new_form_template_data, session=session)
            new_form_id = inserted_document.inserted_id
            
            # Upload excel spreadsheet to Azure Blob Storage
            container_name, blob_path = 'spreadsheets', f'{form_group_id}/active-form/{new_form_id}.xlsx'
            await blob_handler.upload_blob(container_name, blob_path, spreadsheetTemplate.file)
            await session.commit_transaction()
            
            return {"message": "Form template created successfully", "form_template_id": str(inserted_document.inserted_id)}
            
        except Exception as e:
            # Abort transaction if anything fails
            await session.abort_transaction()
            raise e


@router.put("/active/{atp_form_group_id}", response_model = responses.ATPFormUpdateResponse)
async def update_active_form_template(
    atp_form_group_id: Annotated[str, Path()],
    spreadsheetTemplate: Annotated[Union[UploadFile, Literal['']], File()],
    metadata: Annotated[str, Form()],
    sections: Annotated[str, Form()],
    technicianImageData: dict = Depends(parse_technician_image_data),
    engineerImageData: dict = Depends(parse_engineer_image_data),
    client: AsyncMongoClient = Depends(get_mongo_client),
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    
    async with client.start_session() as session:
        try:
            metadata_obj = json.loads(metadata)
            sections_obj = json.loads(sections)
            
            #Request body validation (excludes the image data)
            validated_request_body = schemas.RequestFormTemplate(
                spreadsheetTemplate = spreadsheetTemplate,
                metadata = schemas.Metadata(**metadata_obj),
                sections = sections_obj
            )
            
            # FastAPI automatically converts 'true' and 'false' to True and False, but it doesn't convert 'null' to None
            for section_name in ['technician', 'engineer']:
                for item in sections_obj[section_name]['items']:
                    if section_name == 'technician':
                        print('TECHNICIAN ITEM: ', item['hasImage'], type(item['hasImage']), technicianImageData.get(item['uuid'], None), type(technicianImageData.get(item['uuid'])), '\n\n')
                    elif section_name == 'engineer':
                        print('ENGINEER ITEM: ', item['hasImage'], type(item['hasImage']), engineerImageData.get(item['uuid'], None), type(engineerImageData.get(item['uuid'])), '\n\n')
                    if not item['hasImage']:
                        if section_name == 'technician':
                            technicianImageData[item['uuid']] = None
                        elif section_name == 'engineer':
                            engineerImageData[item['uuid']] = None
        
            new_form_template_data = validated_request_body.model_dump()
            # Remove the UploadFile object as it can't be stored in MongoDB
            new_form_template_data.pop('spreadsheetTemplate', None)
            
            # Find the current active form template
            query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
            old_form = await atp_forms.find_one(query)
            if not old_form:
                return {"message": "ATP form group not found"}
            old_form_id = old_form['_id']
            
            # Update metadata with server-generated fields
            new_form_template_data['metadata']['formGroupID'] = atp_form_group_id
            new_form_template_data['metadata']['version'] = version = old_form['metadata']['version'] + 1
            new_form_template_data['metadata']['status'] = 'active'
            new_form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
            
            
            """TODO: let azure functions handle scheduled deletion of images"""
            ###################################################################################################################
            
            prevTechnicianImageData = {item['uuid']: item.get('imageBlobPath', None) for item in old_form['sections']['technician']['items']}
            
            #Handle images for technician section
            new_technician_items = new_form_template_data['sections']['technician']['items']
            for new_item in new_technician_items:
                # Check if this item has image data in the request
                uuid = new_item['uuid']
                if uuid in technicianImageData:
                    new_image_data = technicianImageData[uuid]
                    
                    #Items that already existed in the old form template
                    if uuid in prevTechnicianImageData:
                        # Check if the image is the same (both have blob paths and they match)
                        if new_image_data == prevTechnicianImageData[uuid]:
                            print(f'unchanged image for {uuid}\nOld: {prevTechnicianImageData[uuid]}\nNew: {new_image_data}')
                            # Copy the existing image data to the new item
                            new_item['imageBlobPath'] = prevTechnicianImageData[uuid]
                            new_item['hasImage'] = prevTechnicianImageData[uuid] is not None
                        #New local image was uploaded (either for the first time or as a replacement -> both work since overwrite = True is set in the upload_blob function)
                        elif hasattr(new_image_data, 'file') and hasattr(new_image_data, 'filename'):
                            print('new local image was uploaded for an existing item')
                            data = new_image_data.file
                            container_name, blob_path = 'images', f'{atp_form_group_id}/{uuid}_v{version}.png'
                            await blob_handler.upload_blob(container_name, blob_path, data)
                            new_item['imageBlobPath'] = blob_path
                            new_item['hasImage'] = True
                        #Image was removed - handle FormData string conversion
                        elif new_image_data is None and prevTechnicianImageData[uuid] is not None:
                            #print(f'blob path being deleted:\nNew: {new_image_data}\nOld: {prevTechnicianImageData[uuid]}')
                            #blob_handler.delete_blobs('images', blob_path = prevTechnicianImageData[uuid], virtual_directory = None)
                            #blob_handler.move_blob('images', prevTechnicianImageData[uuid], 'images', f'{atp_form_group_id}/archived/{uuid}.png')
                            #new_item['imageBlobPath'] = None
                            #new_item['hasImage'] = False
                            pass
                    #New items that were not in the old form template
                    else:
                        if hasattr(new_image_data, 'file') and hasattr(new_image_data, 'filename'):
                            print('local image was uploaded for a new item')
                            data = new_image_data.file
                            container_name, blob_path = 'images', f'{atp_form_group_id}/{uuid}_v{version}.png'
                            await blob_handler.upload_blob(container_name, blob_path, data)
                            new_item['imageBlobPath'] = blob_path
                            new_item['hasImage'] = True
                        else:
                            new_item['imageBlobPath'] = None
                            new_item['hasImage'] = False
                
            # Handle deleted items (items that existed before but are not in the new form)
            #deleted_technician_items = [uuid for uuid in prevTechnicianImageData.keys() if uuid not in set(item['uuid'] for item in new_technician_items)]
            #for deleted_item in deleted_technician_items:
                #if prevTechnicianImageData[deleted_item] is not None:
                    #print('Deleting image for an item that was deleted')
                    #blob_handler.move_blob('images', prevTechnicianImageData[deleted_item], 'images', f'{atp_form_group_id}/archived/{deleted_item}.png')
                
                
                    
                        
                        
            ###################################################################################################################
            
            prevEngineerImageData = {item['uuid']: item.get('imageBlobPath', None) for item in old_form['sections']['engineer']['items']}
            
            #Handle images for technician section
            new_engineer_items = new_form_template_data['sections']['engineer']['items']
            for new_item in new_engineer_items:
                # Check if this item has image data in the request
                uuid = new_item['uuid']
                if uuid in engineerImageData:
                    new_image_data = engineerImageData[uuid]
                    
                    #Items that already existed in the old form template
                    if uuid in prevEngineerImageData:
                        # Check if the image is the same (both have blob paths and they match)
                        if new_image_data == prevEngineerImageData[uuid]:
                            print(f'unchanged image for {uuid}\nOld: {prevEngineerImageData[uuid]}\nNew: {new_image_data}')
                            # Copy the existing image data to the new item
                            new_item['imageBlobPath'] = prevEngineerImageData[uuid]
                            new_item['hasImage'] = prevEngineerImageData[uuid] is not None
                        #New local image was uploaded (either for the first time or as a replacement -> both work since overwrite = True is set in the upload_blob function)
                        elif hasattr(new_image_data, 'file') and hasattr(new_image_data, 'filename'):
                            print('new local image was uploaded for an existing item')
                            data = new_image_data.file
                            container_name, blob_path = 'images', f'{atp_form_group_id}/{uuid}_v{version}.png'
                            await blob_handler.upload_blob(container_name, blob_path, data)
                            new_item['imageBlobPath'] = blob_path
                            new_item['hasImage'] = True
                        #Image was removed - handle FormData string conversion
                        elif new_image_data is None and prevEngineerImageData[uuid] is not None:
                            #print(f'blob path being deleted:\nNew: {new_image_data}\nOld: {prevEngineerImageData[uuid]}')
                            #blob_handler.move_blob('images', prevEngineerImageData[uuid], 'images', f'{atp_form_group_id}/archived/{uuid}.png')
                            #new_item['imageBlobPath'] = None
                            #new_item['hasImage'] = False
                            pass
                    #New items that were not in the old form template
                    else:
                        if hasattr(new_image_data, 'file') and hasattr(new_image_data, 'filename'):
                            print('local image was uploaded for a new item')
                            data = new_image_data.file
                            container_name, blob_path = 'images', f'{atp_form_group_id}/{uuid}_v{version}.png'
                            await blob_handler.upload_blob(container_name, blob_path, data)
                            new_item['imageBlobPath'] = blob_path
                            new_item['hasImage'] = True
                        else:
                            new_item['imageBlobPath'] = None
                            new_item['hasImage'] = False
                
            # Handle deleted items (items that existed before but are not in the new form)
            #deleted_engineer_items = [uuid for uuid in prevEngineerImageData.keys() if uuid not in set(item['uuid'] for item in new_engineer_items)]
            #for deleted_item in deleted_engineer_items:
                #if prevEngineerImageData[deleted_item] is not None:
                    #print('Deleting image for an item that was deleted')
                    #blob_handler.move_blob('images', prevEngineerImageData[deleted_item], 'images', f'{atp_form_group_id}/archived/{deleted_item}.png')
                        
            ###################################################################################################################

            
            await session.start_transaction()
            
            # Make the old template inactive
            await atp_forms.update_one(query, {'$set': {'metadata.status': 'inactive'}}, session=session)
            # Insert the new template
            inserted_document = await atp_forms.insert_one(new_form_template_data, session=session)
            new_form_id = inserted_document.inserted_id
            
            # Upload new spreadsheet to Azure Blob Storage if a replacement was provided
            if hasattr(spreadsheetTemplate, 'file') and hasattr(spreadsheetTemplate, 'filename'):
                blob_path = f'{atp_form_group_id}/active-form/{new_form_id}.xlsx'
                await blob_handler.upload_blob('spreadsheets', blob_path, spreadsheetTemplate.file)
            
                # Archive the old spreadsheet if it exists
                old_blob_path = f'{atp_form_group_id}/active-form/{old_form["_id"]}.xlsx'
                try:
                    await blob_handler.move_blob(
                        from_container_name='spreadsheets',
                        blob_path=old_blob_path,
                        to_container_name='spreadsheets',
                        to_blob_path=f'{atp_form_group_id}/archived-forms/{old_form["_id"]}.xlsx'
                    )
                except Exception as e:
                    # If the old blob doesn't exist, just continue (this might be the first version)
                    print(f"Warning: Could not archive old excel template blob {old_blob_path}: {str(e)}. The blob may not exist")

            #Update the spreadsheet template name in Blob Storage with the new form id
            else:
                await blob_handler.move_blob(
                    from_container_name='spreadsheets',
                    blob_path=f'{atp_form_group_id}/active-form/{old_form_id}.xlsx',
                    to_container_name='spreadsheets',
                    to_blob_path=f'{atp_form_group_id}/active-form/{new_form_id}.xlsx'
                )
            
            # Commit the transaction
            print('committing transaction')
            await session.commit_transaction()
                   
        except Exception as e:
            # Rollback the transaction on error
            print('error: ', e)
            print('aborting transaction')
            await session.abort_transaction()
            return {"message": f"Error updating ATP form template: {str(e)}"}
        
        return {"message": "ATP form template updated successfully"}

@router.get("/active", response_model = responses.ATPAllActiveForms)
async def get_active_form_templates(atp_forms: Collection = Depends(get_atp_forms_collection), blob_handler: Callable = Depends(get_blob_handler)):
    """
    Get all ATP form templates that are currently active.
    """
    #TODO: only return the metadata of the form templates instead of the entire document
    form_templates = []
    async for document in atp_forms.find({'metadata.status': 'active'}):
        #convert ObjectId to a string before appending the document to the list
        document['_id'] = str(document['_id'])
        for item in document['sections']['technician']['items']:
            if item.get('hasImage') and item.get('imageBlobPath'):
                item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
            else:
                item['imageBlobPath'] = None
                item['imageUrl'] = None
                item['hasImage'] = False  # Ensure consistency

        for item in document['sections']['engineer']['items']:
            if item.get('hasImage') and item.get('imageBlobPath'):
                item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
            else:
                item['imageBlobPath'] = None
                item['imageUrl'] = None
                item['hasImage'] = False  # Ensure consistency
        
        form_templates.append(document)
    return form_templates

@router.get("/active/{atp_form_group_id}", response_model = responses.ATPSpecifiedForm)
async def get_active_form_template(atp_form_group_id: Annotated[str, Path(description="The ID of the ATP form group to get", example="674a1b2c3d4e5f6789012345")], atp_forms: Collection = Depends(get_atp_forms_collection), blob_handler: Callable = Depends(get_blob_handler)):
    """
    Get an active ATP form template by its form group ID.
    """
    print('in getATPTemplateData')
    query = {'metadata.formGroupID': atp_form_group_id, 'metadata.status': 'active'}
    atp_form_document = await atp_forms.find_one(query)
    
    if not atp_form_document:
        return {"message": "ATP form group not found"}
    
    atp_form_document['_id'] = str(atp_form_document['_id'])
    
    for item in atp_form_document['sections']['technician']['items']:
        if item.get('hasImage') and item.get('imageBlobPath'):
            item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
        else:
            item['imageBlobPath'] = None
            item['imageUrl'] = None
            item['hasImage'] = False  # Ensure consistency
        
        
    for item in atp_form_document['sections']['engineer']['items']:
        if item.get('hasImage') and item.get('imageBlobPath'):
            item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
        else:
            item['imageBlobPath'] = None
            item['imageUrl'] = None
            item['hasImage'] = False  # Ensure consistency
        
       
    print('Final response data:', atp_form_document)
    return atp_form_document

@router.get("/{atp_form_id}", response_model = responses.ATPSpecifiedForm)
async def get_form_template(
    atp_form_id: Annotated[str, Path(description = "The ID of the ATP form to get", example = "674a1b2c3d4e5f6789012345")], 
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection),
    blob_handler: Callable = Depends(get_blob_handler)
):
    """
    Get an ATP form.
    """
    query = {'_id': ObjectId(atp_form_id)}
    atp_form_document = await atp_forms.find_one(query)
    if not atp_form_document:
        return {"message": "ATP form not found"}
        #TODO: add error handling if an atp form is not found
    atp_form_document['_id'] = str(atp_form_document['_id'])  # Convert ObjectId to string
    
    
    for item in atp_form_document['sections']['technician']['items']:
        if item.get('hasImage') and item.get('imageBlobPath'):
            item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
        else:
            item['imageBlobPath'] = None
            item['imageUrl'] = None
            item['hasImage'] = False  # Ensure consistency
        
        
    for item in atp_form_document['sections']['engineer']['items']:
        if item.get('hasImage') and item.get('imageBlobPath'):
            item['imageUrl'] = blob_handler.get_blob_url(container_name = 'images', blob_name = item.get('imageBlobPath'))  # Full URL for display
        else:
            item['imageBlobPath'] = None
            item['imageUrl'] = None
            item['hasImage'] = False  # Ensure consistency
        
       
    print('Final response data:', atp_form_document)
    
    return atp_form_document
    
    
    
    

@router.delete("/{atp_form_group_id}", response_model = responses.ATPFormDeleteResponse)
async def delete_form_template(
    atp_form_group_id: Annotated[str, Path(description = "The ID of the ATP form group to delete", example = "674a1b2c3d4e5f6789012345")], 
    atp_forms: AsyncCollection = Depends(get_atp_forms_collection),
    atp_submissions: AsyncCollection = Depends(get_atp_submissions_collection),
    client: AsyncMongoClient = Depends(get_mongo_client),
    blob_handler: Callable = Depends(get_blob_handler)
):
    """
    Delete an ATP form.
    """
    async with client.start_session() as session:
        await session.start_transaction()
        try:
            # Validate ObjectId format
            object_id = ObjectId(atp_form_group_id)
        except Exception:
            return {"message": "Invalid ATP form ID format"}
        
        query = {'metadata.formGroupID': atp_form_group_id}
        result = await atp_forms.delete_many(query)
        
        if result.deleted_count == 0:
            return {"message": "ATP form not found"}
        
        #delete all submissions associated with the ATP form
        await atp_submissions.delete_many({'formGroupId': atp_form_group_id})
        await blob_handler.delete_blobs('spreadsheets', virtual_directory = f'{atp_form_group_id}')
        await blob_handler.delete_blobs('images', virtual_directory = f'{atp_form_group_id}')
        await session.commit_transaction()
    
    return {"message": "ATP form and corresponding submissions deleted successfully"}

