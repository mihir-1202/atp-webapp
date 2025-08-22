from pydantic import BaseModel, EmailStr, Field, model_validator, ValidationError
from typing import Annotated, Literal, Union, Self

# BaseModel takes json input data, extracts the values for each key, 
# validates and converts them to the types you defined in the model, 
# and then instantiates an object where those values are assigned to the corresponding classattributes.

class Metadata(BaseModel):
    title: Annotated[str, Field(min_length = 1)]
    description: Annotated[str, Field(min_length = 1)]
    createdBy: Annotated[EmailStr, Field(min_length = 1)]

class HeadingItem(BaseModel):
    order: Annotated[int, Field(ge = 0)]
    type: Literal['heading'] #type can only be a literal string 'heading'
    content: Annotated[str, Field(min_length = 1)]
    
class FieldItem(BaseModel):
    order: Annotated[int, Field(ge = 0)]
    type: Literal['field']
    question: Annotated[str, Field(min_length = 1)]
    answerFormat: Annotated[str, Field(min_length = 1)]
    spreadsheetCell: Annotated[str, Field(pattern=r'^[A-Z]{1,3}[1-9]\d{0,6}$', description="Cell reference in format A1, B5, AA10, etc.")]
    
    
"""
With Field(discriminator="type"):
FastAPI (via Pydantic) only validates the input against the model in the union with the correct "type" value — no trial and error

Without the discriminator:
FastAPI tries to validate the input against each model in the union one by one, in order, until one succeeds — can lead to ambiguous or incorrect matches if models share fields.
"""
#Item = Annotated[HeadingItem | FieldItem, Field(discriminator = "type")] 
Item = Annotated[Union[HeadingItem, FieldItem], Field(discriminator = "type")]


class Section(BaseModel):
    items: Annotated[list[Item], Field(min_length = 1)]
    
    #Whatever returns from the root_validator becomes the "final" set of field values used to instantiate the model
    @model_validator(mode = "after")
    def must_have_field_item(self) -> Self:
        items = self.items
        if not any(isinstance(item, FieldItem) for item in items):
            raise ValueError("Each section must have at least one field item")
        return self

class FormTemplate(BaseModel):
    metadata: Metadata
    sections: Annotated[dict[str, Section], Field(min_length = 1)]
    
    class Config:
        extra = "forbid"