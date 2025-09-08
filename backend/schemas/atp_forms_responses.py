from pydantic import BaseModel, Field, AnyUrl
from typing import Annotated, List, Optional, Literal, Union
from .atp_forms_common import ATPFormMetadata

# Response-specific item models that include imageUrl for display
class ResponseHeadingItem(BaseModel):
    uuid: Annotated[str, Field(description="The UUID of the heading item", example="123e4567-e89b-12d3-a456-426614174000")]
    type: Annotated[Literal['heading'], Field(description="The type of the heading item", example="heading")]
    content: Annotated[str, Field(description="The content of the heading item", example="This is a heading")]
    hasImage: Annotated[bool, Field(description="Whether the heading item has an image", example=True)]
    imageBlobPath: Annotated[Optional[str], Field(description="The blob path of the heading item image", example="images/container/path/image.png")]
    imageUrl: Annotated[Optional[AnyUrl], Field(description="The full URL of the heading item image for display", example="https://storage.blob.core.windows.net/images/container/path/image.png?sv=...")]
    

class ResponseFieldItem(BaseModel):
    uuid: Annotated[str, Field(description="The UUID of the field item", example="123e4567-e89b-12d3-a456-426614174000")]    
    type: Annotated[Literal['field'], Field(description="The type of the field item", example="field")]
    question: Annotated[str, Field(description="The question of the field item", example="What is the motor speed?")]
    answerFormat: Annotated[str, Field(description="The answer format of the field item", example="number")]
    spreadsheetCell: Annotated[str, Field(description="Cell reference in format A1, B5, AA10, etc.", example="A1")]
    hasImage: Annotated[Optional[bool], Field(description="Whether the field item has an image", example=True)]
    imageBlobPath: Annotated[Optional[str], Field(description="The blob path of the field item image", example="images/container/path/image.png")]
    imageUrl: Annotated[Optional[AnyUrl], Field(description="The full URL of the field item image for display", example="https://storage.blob.core.windows.net/images/container/path/image.png?sv=...")]
    

ResponseItem = Annotated[Union[ResponseHeadingItem, ResponseFieldItem], Field(discriminator="type")]

class ResponseSection(BaseModel):
    items: Annotated[List[ResponseItem], Field(description="The items in the section")]


class ATPNewFormCreationResponse(BaseModel):
    message: Annotated[str, Field(description="The message of the ATP form creation response", example="Form template created successfully")]
    form_template_id: Annotated[str, Field(description="The ID of the ATP form template", example="674a1b2c3d4e5f6789012345")]


class ATPSpecifiedFormMetadata(BaseModel):
    title: Annotated[str, Field(description="The title of the ATP form", example="ATP Title")]
    description: Annotated[str, Field(description="The description of the ATP form", example="ATP Description")]
    createdBy: Annotated[str, Field(description="The email of the user who created the ATP form", example="admin@upwingenergy.com")]
    createdAt: Annotated[str, Field(description="The date and time the ATP form was created", example="2025-08-27T14:39:54.525021")]
    status: Annotated[str, Field(description="The status of the ATP form", example="active")]
    version: Annotated[int, Field(description="The version of the ATP form", example=3)]
    formGroupID: Annotated[str, Field(description="The ID of the ATP form group", example="68af7b2a710b560dffc8741b")]


class ATPSpecifiedForm(BaseModel):
    id: Annotated[str, Field(alias="_id", description="The ID of the ATP form", example="68af7b2a710b560dffc8741c")]
    metadata: Annotated[ATPFormMetadata, 
                        Field(description="The metadata of the ATP form", 
                        example={
                            "title": "asdasdad",
                            "description": "asdasdasdasd",
                            "createdBy": "someone@upwingenergy.com",
                            "createdAt": "2025-08-27T14:39:54.525021",
                            "status": "inactive",
                            "version": 1,
                            "formGroupID": "68af7b2a710b560dffc8741b",
                            "spreadsheetTemplateBlobPath": "3294kjsdgkdg833/3294346sioudbg33.xlsx"
                        })]
    sections: Annotated[dict[str, ResponseSection], 
                        Field(description="The sections of the ATP form",
                        example={
                            "technician": {
                                "items": [
                                    {
                                        "uuid": "fd6932ff-398f-4b6c-b9c7-1c60af17a088",
                                        "type": "field",
                                        "question": "hello world",
                                        "answerFormat": "textarea",
                                        "spreadsheetCell": "A2",
                                        "imageBlobPath": "images/container/path/image.png",
                                        "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                        "hasImage": True
                                    }
                                ]
                            },
                            "engineer": {
                                "items": [
                                    {
                                        "uuid": "15150c1d-f532-4982-a5a4-e9d6395e2697",
                                        "type": "heading",
                                        "content": "This is not a engineer heading",
                                        "imageBlobPath": "images/container/path/image.png",
                                        "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                        "hasImage": True
                                    },
                                    {
                                        "uuid": "11056fe7-6551-4bef-abe8-717d515db8be",
                                        "type": "field",
                                        "question": "This is a engineer question",
                                        "answerFormat": "text",
                                        "spreadsheetCell": "B2",
                                        "imageBlobPath": "images/container/path/image.png",
                                        "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                        "hasImage": True
                                    }
                                ]
                            }
                        })]
    
    class Config:
        populate_by_name = True


ATPAllActiveForms = Annotated[List[ATPSpecifiedForm], 
                             Field(description="The list of ATP forms", 
                                    example=[
                                  {
                                      "_id": "68af7b2a710b560dffc8741c",
                                        "metadata": {
                                           "title": "asdasdad",
                                           "description": "asdasdasdasd",
                                           "createdBy": "someone@upwingenergy.com",
                                           "createdAt": "2025-08-27T14:39:54.525021",
                                           "status": "inactive",
                                           "version": 1,
                                           "formGroupID": "68af7b2a710b560dffc8741b",
                                           "spreadsheetTemplateBlobPath": "3294kjsdgkdg833/3294346sioudbg33.xlsx"
                                       },
                                     "sections": {
                                         "technician": {
                                             "items": [
                                                 {
                                                     "uuid": "1d220efe-2c00-4b27-8209-b453fa743515",
                                                     "type": "heading",
                                                     "content": "This is a technician heading",
                                                     "imageBlobPath": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 },
                                                 {
                                                     "uuid": "57c55c49-57c4-4a6a-bc25-f0ae838916d5",
                                                     "type": "field",
                                                     "question": "This is a technician question",
                                                     "answerFormat": "text",
                                                     "spreadsheetCell": "A2",
                                                     "imageBlobPath": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 }
                                             ]
                                         },
                                         "engineer": {
                                             "items": [
                                                 {
                                                     "uuid": "e1e6bd9a-3803-4022-aa47-8c8196655b07",
                                                     "type": "heading",
                                                     "content": "This is not a engineer heading",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 },
                                                 {
                                                     "uuid": "3a8a2312-bce3-4479-9ff0-ce2b623632cc",
                                                     "type": "field",
                                                     "question": "This is a engineer question",
                                                     "answerFormat": "text",
                                                     "spreadsheetCell": "B2",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 }
                                             ]
                                         }
                                     }
                                 },
                                 
                                                                   {
                                      "_id": "68af7d4aea334609889360ec",
                                                                                                                  "metadata": {
                                           "title": "ATP 03",
                                           "description": "This is a description of the ATP form",
                                           "createdBy": "admin@upwingenergy.com",
                                           "createdAt": "2025-08-27T14:48:58.994781",
                                           "status": "active",
                                           "version": 1,
                                           "formGroupID": "68af7d4aea334609889360eb",
                                           "spreadsheetTemplateBlobPath": "3294kjsdgkdg833/3294346sioudbg33.xlsx"
                                       },
                                     "sections": {
                                         "engineer": {
                                             "items": [
                                                 {
                                                     "uuid": "123e4567-e89b-12d3-a456-426614174002",
                                                     "type": "heading",
                                                     "content": "Another heading",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 },
                                                 {
                                                     "uuid": "123e4567-e89b-12d3-a456-426614174003",
                                                     "type": "field",
                                                     "question": "What is the temperature?",
                                                     "answerFormat": "number",
                                                     "spreadsheetCell": "B1",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 }
                                             ]
                                         },
                                         "technician": {
                                             "items": [
                                                 {
                                                     "uuid": "123e4567-e89b-12d3-a456-426614174000",
                                                     "type": "heading",
                                                     "content": "This is a heading",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 },
                                                 {
                                                     "uuid": "123e4567-e89b-12d3-a456-426614174001",
                                                     "type": "field",
                                                     "question": "What is the motor speed?",
                                                     "answerFormat": "number",
                                                     "spreadsheetCell": "A1",
                                                     "image": "images/container/path/image.png",
                                                     "imageUrl": "https://storage.blob.core.windows.net/images/container/path/image.png?sv=...",
                                                     "hasImage": True
                                                 }
                                             ]
                                         }
                                     }
                                 }
                             ])]

class ATPFormUpdateResponse(BaseModel):
    message: Annotated[str, Field(description="The message of the ATP form update response", example="ATP form template updated successfully")]


class ATPFormDeleteResponse(BaseModel):
    message: Annotated[str, Field(description="The message of the ATP form delete response", example="ATP form template deleted successfully")]