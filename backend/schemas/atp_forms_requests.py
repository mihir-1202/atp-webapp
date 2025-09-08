from pydantic import BaseModel, Field, model_validator, ValidationError, field_validator
from typing import Annotated, Literal, Union, Self, Optional
from fastapi import UploadFile
from .atp_forms_common import ATPFormMetadata

# Request-specific models for creating and updating ATP forms

class RequestHeadingItem(BaseModel):
    uuid: Annotated[str, Field(min_length = 1, description = "The UUID of the heading item", example = "123e4567-e89b-12d3-a456-426614174000")]
    type: Annotated[Literal['heading'], Field(description = "The type of the heading item", example = "heading")] #type can only be a literal string 'heading'
    content: Annotated[str, Field(min_length = 1, description = "The content of the heading item", example = "This is a heading")]
    hasImage: Annotated[Optional[bool], Field(default=None, description = "Whether the heading item has an image", example = True)]

class RequestFieldItem(BaseModel):
    uuid: Annotated[str, Field(min_length = 1, description = "The UUID of the field item", example = "123e4567-e89b-12d3-a456-426614174000")]
    type: Annotated[Literal['field'], Field(description = "The type of the field item", example = "field")]
    question: Annotated[str, Field(min_length = 1, description = "The question of the field item", example = "What is the motor speed?")]
    answerFormat: Annotated[str, Field(min_length = 1, description = "The answer format of the field item", example = "number")]
    spreadsheetCell: Annotated[Optional[str], Field(pattern=r'^[A-Z]{1,3}[1-9]\d{0,6}$', description="Cell reference in format A1, B5, AA10, etc.", example = "A1", default = None)]
    hasImage: Annotated[Optional[bool], Field(default=None, description = "Whether the field item has an image", example = True)]
    
    @field_validator('spreadsheetCell', mode = 'before')
    def validate_spreadsheet_cell(cls, value):
        if value == '':
            return None
        return value
    
"""
With Field(discriminator="type"):
FastAPI (via Pydantic) only validates the input against the model in the union with the correct "type" value — no trial and error

Without the discriminator:
FastAPI tries to validate the input against each model in the union one by one, in order, until one succeeds — can lead to ambiguous or incorrect matches if models share fields.
"""
#Item = Annotated[HeadingItem | FieldItem, Field(discriminator = "type")] 
RequestItem = Annotated[Union[RequestHeadingItem, RequestFieldItem], Field(discriminator = "type")]

class RequestSection(BaseModel):
    items: Annotated[list[RequestItem], Field(min_length = 1, example = [{"uuid": "123e4567-e89b-12d3-a456-426614174000", "type": "heading", "content": "This is a heading"}, {"uuid": "123e4567-e89b-12d3-a456-426614174000", "type": "field", "question": "What is the motor speed?", "answerFormat": "number", "spreadsheetCell": "A1"}])]
    
    #Whatever returns from the root_validator becomes the "final" set of field values used to instantiate the model
    @model_validator(mode = "after")
    def must_have_field_item(self) -> Self:
        items = self.items
        if not any(isinstance(item, RequestFieldItem) for item in items):
            raise ValueError("Each section must have at least one field item")
        return self

class RequestFormTemplate(BaseModel):
    #When creating a form for the first time, the spreadsheetTemplate is required, but when updating a form, it is not required
    #Since spreadsheetTemplate still needs to be sent as a key value pair in the Form Data request body, it will be an empty string if not provided
    #spreadsheetTemplate: Annotated[Optional[UploadFile], Field(description = "The spreadsheet template of the ATP form")] #UploadFile is a FastAPI class that represents FormData.File[0]
    spreadsheetTemplate: Annotated[Optional[Union[UploadFile, Literal['']]], Field(description = "The spreadsheet template of the ATP form")] #UploadFile is a FastAPI class that represents FormData.File[0]
    metadata: Annotated[ATPFormMetadata, Field(description = "The metadata of the ATP form")]
    sections: Annotated[dict[str, RequestSection], Field(
        min_length = 2,
        max_length = 2,
        description = "A dictionary of named sections, where each section contains form items",
        example = {
            "technician": {
                "items": [
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "type": "heading", "content": "This is a heading", "image": "images/container/path/image.png", "hasImage": True},
                    {"uuid": "123e4567-e89b-426614174000", "index": 1, "type": "field", "question": "What is the motor speed?", "answerFormat": "number", "spreadsheetCell": "A1", "image": "images/container/path/image.png", "hasImage": True}
                ]
            },
            "engineer": {
                "items": [
                    {"uuid": "123e4567-e89b-12d3-a456-426614174000", "type": "heading", "content": "Another heading", "image": "images/container/path/image.png", "hasImage": True},
                    {"uuid": "123e4567-e89b-426614174000", "type": "field", "question": "What is the temperature?", "answerFormat": "number", "spreadsheetCell": "B1", "image": "images/container/path/image.png", "hasImage": True}
                ]
            }
        }
    )]
    
    class Config:
        extra = "forbid"


