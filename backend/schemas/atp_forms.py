from pydantic import BaseModel, EmailStr, Field, model_validator, ValidationError
from typing import Annotated, Literal, Union, Self, Optional, List
from pydantic import AnyUrl
from fastapi import UploadFile, Form, File

# BaseModel takes json input data, extracts the values for each key, 
# validates and converts them to the types you defined in the model, 
# and then instantiates an object where those values are assigned to the corresponding classattributes.

#Because the request body when creating a new form template does not contain createdAt, status, version, and formGroupID, but the response body for GET requests do, make the fields optionalb
class Metadata(BaseModel):
    title: Annotated[str, Field(min_length = 1, description = "The title of the ATP form", example = "ATP 03")]
    description: Annotated[str, Field(min_length = 1, description = "The description of the ATP form", example = "This is a description of the ATP form")]
    createdBy: Annotated[EmailStr, Field(min_length = 1, description = "The email of the user who created the ATP form", example = "admin@upwingenergy.com")]
    createdAt: Annotated[Optional[str], Field(default=None, description = "The date and time the ATP form was created", example = "2025-08-27T14:39:54.525021")]
    status: Annotated[Optional[Literal['active', 'inactive']], Field(default=None, description = "The status of the ATP form", example = 'active')]
    version: Annotated[Optional[int], Field(default=None, ge = 1, description = "The version of the ATP form", example = 1)]
    formGroupID: Annotated[Optional[str], Field(default=None, description = "The ID of the ATP form group", example = "68af7b2a710b560dffc8741b")]

class HeadingItem(BaseModel):
    uuid: Annotated[str, Field(min_length = 1, description = "The UUID of the heading item", example = "123e4567-e89b-12d3-a456-426614174000")]
    index: Annotated[int, Field(ge = 0, description = "The index of the heading item", example = 0)]
    type: Annotated[Literal['heading'], Field(description = "The type of the heading item", example = "heading")] #type can only be a literal string 'heading'
    content: Annotated[str, Field(min_length = 1, description = "The content of the heading item", example = "This is a heading")]
    
class FieldItem(BaseModel):
    uuid: Annotated[str, Field(min_length = 1, description = "The UUID of the field item", example = "123e4567-e89b-12d3-a456-426614174000")]
    index: Annotated[int, Field(ge = 0, description = "The index of the field item", example = 0)]
    type: Annotated[Literal['field'], Field(description = "The type of the field item", example = "field")]
    question: Annotated[str, Field(min_length = 1, description = "The question of the field item", example = "What is the motor speed?")]
    answerFormat: Annotated[str, Field(min_length = 1, description = "The answer format of the field item", example = "number")]
    spreadsheetCell: Annotated[str, Field(pattern=r'^[A-Z]{1,3}[1-9]\d{0,6}$', description="Cell reference in format A1, B5, AA10, etc.", example = "A1")]
    
    
"""
With Field(discriminator="type"):
FastAPI (via Pydantic) only validates the input against the model in the union with the correct "type" value — no trial and error

Without the discriminator:
FastAPI tries to validate the input against each model in the union one by one, in order, until one succeeds — can lead to ambiguous or incorrect matches if models share fields.
"""
#Item = Annotated[HeadingItem | FieldItem, Field(discriminator = "type")] 
Item = Annotated[Union[HeadingItem, FieldItem], Field(discriminator = "type")]

class TechnicianImageData(BaseModel):
    technicianUploadedImages: Annotated[List[UploadFile], File()]
    technicianRemoteImages: Annotated[Optional[List[AnyUrl]], Form()]
    technicianImageIndices: Annotated[List[int], Form()]

class EngineerImageData(BaseModel):
    engineerUploadedImages: Annotated[List[UploadFile], File()]
    engineerRemoteImages: Annotated[Optional[List[AnyUrl]], Form()]
    engineerImageIndices: Annotated[List[int], Form()]


class Section(BaseModel):
    items: Annotated[list[Item], Field(min_length = 1, example = [{"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 0, "type": "heading", "content": "This is a heading"}, {"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 1, "type": "field", "question": "What is the motor speed?", "answerFormat": "number", "spreadsheetCell": "A1"}])]
    
    #Whatever returns from the root_validator becomes the "final" set of field values used to instantiate the model
    @model_validator(mode = "after")
    def must_have_field_item(self) -> Self:
        items = self.items
        if not any(isinstance(item, FieldItem) for item in items):
            raise ValueError("Each section must have at least one field item")
        return self

class FormTemplate(BaseModel):
    #When creating a form for the first time, the spreadsheetTemplate is required, but when updating a form, it is not required
    #Since spreadsheetTemplate still needs to be sent as a key value pair in the Form Data request body, it will be an empty string if not provided
    #spreadsheetTemplate: Annotated[Optional[UploadFile], Field(description = "The spreadsheet template of the ATP form")] #UploadFile is a FastAPI class that represents FormData.File[0]
    spreadsheetTemplate: Annotated[Optional[Union[UploadFile, Literal['']]], Field(description = "The spreadsheet template of the ATP form")] #UploadFile is a FastAPI class that represents FormData.File[0]
    metadata: Annotated[Metadata, Field(description = "The metadata of the ATP form")]
    sections: Annotated[dict[str, Section], Field(
        min_length = 2,
        max_length = 2,
        description = "A dictionary of named sections, where each section contains form items",
        example = {
            "technician": {
                "items": [
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 0, "type": "heading", "content": "This is a heading"},
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 1, "type": "field", "question": "What is the motor speed?", "answerFormat": "number", "spreadsheetCell": "A1"}
                ]
            },
            "engineer": {
                "items": [
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 0, "type": "heading", "content": "Another heading"},
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "index": 1, "type": "field", "question": "What is the temperature?", "answerFormat": "number", "spreadsheetCell": "B1"}
                ]
            }
        }
    )]
    
    class Config:
        extra = "forbid"