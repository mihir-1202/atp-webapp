from pydantic import BaseModel, EmailStr, Field, model_validator, ValidationError
from typing import Annotated, Literal, Union, Self, Optional, List
from pydantic import AnyUrl
from fastapi import UploadFile, Form, File

# Common models shared between request and response schemas

class Metadata(BaseModel):
    title: Annotated[str, Field(min_length = 1, description = "The title of the ATP form", example = "ATP 03")]
    description: Annotated[str, Field(min_length = 1, description = "The description of the ATP form", example = "This is a description of the ATP form")]
    createdBy: Annotated[EmailStr, Field(min_length = 1, description = "The email of the user who created the ATP form", example = "admin@upwingenergy.com")]
    createdAt: Annotated[Optional[str], Field(default=None, description = "The date and time the ATP form was created", example = "2025-08-27T14:39:54.525021")]
    status: Annotated[Optional[Literal['active', 'inactive']], Field(default=None, description = "The status of the ATP form", example = 'active')]
    version: Annotated[Optional[int], Field(default=None, ge = 1, description = "The version of the ATP form", example = 1)]
    formGroupID: Annotated[Optional[str], Field(default=None, description = "The ID of the ATP form group", example = "68af7b2a710b560dffc8741b")]


