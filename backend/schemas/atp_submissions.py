from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Annotated, Dict, List, Literal, Optional
from dateutil.parser import parse
from datetime import datetime

"""
Initial Form Data:
{
  formId: "674a1b2c3d4e5f6789012345",
  submittedBy: "technician@upwing.com",
  technicianResponses: {
    "1": "Motor tested and operational",  // From input registration
    "2": "Pass",
    "5": "Approved for operation"
  }
}

API Post Request Body structure:
{
  "formId": "674a1b2c3d4e5f6789012345",
  "submittedBy": "technician@upwing.com",
  "submittedAt": "2024-01-15T10:30:00Z",
  "technicianResponses": 
    [
        {questionOrder: "1", answerFormat: "text", response: "Motor tested and operational"},
    ],
  "status": "submitted"
}
"""

def is_numeric(value):
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, str):
        try:
            float(value)
            return True
        except ValueError:
            return False
    return False

def is_date(value):
    try:
        parse(value)
        return True
    except ValueError:
        return False

class Responses(BaseModel):
    questionOrder: Annotated[int, Field(ge = 0)]
    spreadsheetCell: Annotated[str, Field(pattern=r'^[A-Z]{1,3}[1-9]\d{0,6}$', description="Cell reference in format A1, B5, AA10, etc.")]
    answer: Annotated[str, Field(min_length = 1)]
    answerFormat: Annotated[str, Field(min_length = 1)]
    
    @model_validator(mode = 'after')
    def validate_fields(self) -> 'Responses':
        if self.answerFormat not in ['text', 'textarea', 'number', 'date']:
            raise ValueError(f"Invalid answer format: {self.answerFormat}")
        if self.answerFormat == 'number' and not is_numeric(self.answer):
            raise ValueError(f"Answer must be a number: {self.answer}")
        if self.answerFormat == 'date' and not is_date(self.answer):
            raise ValueError(f"Answer must be a date string: {self.answer}")
        return self

class ATPTechnicianSubmission(BaseModel):
    formId: Annotated[str, Field(min_length = 1)]
    submittedBy: Annotated[EmailStr, Field(min_length = 1)]
    technicianResponses: Annotated[List[Responses], Field(min_items = 1)]
    
    @model_validator(mode='after')
    def validate_all_questions_answered(self) -> 'ATPTechnicianSubmission':
        #TODO: Fetch the form template from the database and check if all questions have been answered because the user can submit empty fields and they will be excluded from the form data object
        return self
    

class ATPReviewSubmission(BaseModel):
    formId: Annotated[str, Field(min_length = 1)]
    reviewedBy: Annotated[EmailStr, Field(min_length = 1)]
    technicianResponses: Annotated[List[Responses], Field(min_items = 1)]
    engineerResponses: Annotated[List[Responses], Field(min_items = 1)] 
    submittedBy: Annotated[EmailStr, Field(min_length = 1)]
    submittedAt: Annotated[str, Field(min_length = 1)]
    status: Annotated[Literal['approved', 'rejected'], Field(min_length = 1)]
    
    @model_validator(mode='after')
    def validate_all_questions_answered(self) -> 'ATPReviewSubmission':
        #TODO: Fetch the form template from the database and check if all questions have been answered because the user can submit empty fields and they will be excluded from the form data object
        return self
    
    

