from fastapi import FastAPI, Body, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, model_validator
import uvicorn
from datetime import datetime
from typing import Annotated, Literal, Union, Self
import json


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
    
#Item = Annotated[HeadingItem | FieldItem, Field(discriminator = "type")] 
Item = Annotated[Union[HeadingItem, FieldItem], Field(discriminator = "type")]
"""
With Field(discriminator="type"):
FastAPI (via Pydantic) only validates the input against the model in the union with the correct "type" value — no trial and error

Without the discriminator:
FastAPI tries to validate the input against each model in the union one by one, in order, until one succeeds — can lead to ambiguous or incorrect matches if models share fields.
"""
    
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
    
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- This allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/form-templates")
async def create_form_template(form_template: Annotated[FormTemplate, Body()]):
    #model_dump() converts the model object into a dictionary
    form_template_data = form_template.model_dump()
    form_template_data['metadata']['createdAt'] = datetime.now().isoformat()
    print("Validated form template:", form_template_data)
    return form_template_data
    #returning a dict -> FastAPI automatically converts it to JSON in the HTTP response

@app.get("/")
async def root():
    return {"message": "ATP Form Builder API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
    
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
