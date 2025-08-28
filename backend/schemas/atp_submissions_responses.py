from pydantic import BaseModel, Field
from typing import Annotated, List, Optional, Literal
from .atp_submissions import ATPTechnicianSubmission, ATPReviewSubmission, Responses

class ATPSubmissionCreationResponse(BaseModel):
    message: Annotated[str, Field(description = "The message of the ATP submission creation response", example = "Submitted ATP succesfully")]
    submissionId: Annotated[str, Field(description = "The ID of the ATP submission", example = "68af89b21334801ed14d5fc9")]

class ATPReviewSubmissionResponse(BaseModel):
    message: Annotated[str, Field(description = "The message of the ATP review submission response", example = "ATP submission updated successfully")]
    submissionId: Annotated[str, Field(description = "The ID of the ATP submission", example = "68af89b21334801ed14d5fc9")]
    
#Optional fields means that the field can have a value of None; It does NOT mean that the field is not required
class ATPSpecifiedSubmissionResponse(BaseModel):
  id: Annotated[str, Field(alias = "_id", description = "The ID of the ATP submission", example = "68af963fac20ad3b06788848")]
  formId: Annotated[str, Field(description = "The ID of the ATP form", example = "68af9632ac20ad3b06788847")]
  formGroupId: Annotated[str, Field(description = "The ID of the ATP form group", example = "68af9632ac20ad3b06788846")]
  submittedBy: Annotated[str, Field(description = "The email of the user who submitted the ATP submission", example = "technician@upwingenergy.com")]
  technicianResponses: Annotated[List[Responses], Field(description = "The responses of the technician", example = [{"questionUUID": "c4bcebc4-5d7f-4de6-b824-5941582d2545", "questionOrder": 1, "spreadsheetCell": "A2", "answer": "test response", "answerFormat": "text"}])]
  submittedAt: Annotated[str, Field(description = "The date and time the ATP submission was submitted", example = "2025-08-27T16:35:27.574041")]
  status: Annotated[Literal['pending', 'approved', 'rejected'], Field(description = "The status of the ATP submission", example = "pending")]
  engineerResponses: Annotated[Optional[List[Responses]], Field(description = "The responses of the engineer", example = [{"questionUUID": "59ad8436-c64c-43fd-94b1-f149fb9eb975", "questionOrder": 1, "spreadsheetCell": "B2", "answer": "hello world", "answerFormat": "text"}])]
  reviewedAt: Annotated[Optional[str], Field(description = "The date and time the ATP submission was reviewed", example = "2025-08-27T16:35:36.940679")]
  reviewedBy: Annotated[Optional[str], Field(description = "The email of the user who reviewed the ATP submission", example = "engineer@upwingenergy.com")]

  class Config:
    populate_by_name = True


class ATPPendingSubmissionsMetadata(BaseModel):
  submissionId: Annotated[str, Field(description = "The ID of the ATP submission", example = "68af91f55b6090eeac6c4338")]
  formId: Annotated[str, Field(description = "The ID of the ATP form", example = "68af915d5b6090eeac6c4336")]
  formGroupId: Annotated[str, Field(description = "The ID of the ATP form group", example = "68af915d5b6090eeac6c4335")]
  submittedBy: Annotated[str, Field(description = "The email of the user who submitted the ATP submission", example = "technician@upwingenergy.com")]
  submittedAt: Annotated[str, Field(description = "The date and time the ATP submission was submitted", example = "2025-08-27T16:17:09.162526")]
  formTitle: Annotated[str, Field(description = "The title of the ATP form", example = "this is not a test title")]
  formDescription: Annotated[str, Field(description = "The description of the ATP form", example = "this is not a test description")]
  status: Annotated[str, Field(description = "The status of the ATP submission", example = "pending")]

ATPAllPendingSubmissionsMetadata = Annotated[List[ATPPendingSubmissionsMetadata], Field(description = "The metadata of the ATP submissions", example = [{"submissionId": "68af91f55b6090eeac6c4338", "formId": "68af915d5b6090eeac6c4336", "formGroupId": "68af915d5b6090eeac6c4335", "submittedBy": "technician@upwingenergy.com", "submittedAt": "2025-08-27T16:17:09.162526", "formTitle": "this is not a test title", "formDescription": "this is not a test description", "status": "pending"}] * 2)]


class ATPSubmissionMetadata(BaseModel):
  submissionId: Annotated[str, Field(description = "The ID of the ATP submission", example = "68af91f55b6090eeac6c4338")]
  formId: Annotated[str, Field(description = "The ID of the ATP form", example = "68af915d5b6090eeac6c4336")]
  formGroupId: Annotated[str, Field(description = "The ID of the ATP form group", example = "68af915d5b6090eeac6c4335")]
  formTitle: Annotated[str, Field(description = "The title of the ATP form", example = "this is not a test title")]
  formDescription: Annotated[str, Field(description = "The description of the ATP form", example = "this is not a test description")]
  submittedBy: Annotated[str, Field(description = "The email of the user who submitted the ATP submission", example = "technician@upwingenergy.com")]
  submittedAt: Annotated[str, Field(description = "The date and time the ATP submission was submitted", example = "2025-08-27T16:17:09.162526")]
  reviewedBy: Annotated[Optional[str], Field(description = "The email of the user who reviewed the ATP submission", example = "engineer@upwingenergy.com")]
  reviewedAt: Annotated[Optional[str], Field(description = "The date and time the ATP submission was reviewed", example = "2025-08-27T16:14:58.195104")]
  status: Annotated[Literal['pending', 'approved', 'rejected'], Field(description = "The status of the ATP submission", example = "pending")]

ATPAllSubmissionsMetadata = Annotated[List[ATPSubmissionMetadata], Field(description = "The metadata of the ATP submissions", example = 
[
  {
    "submissionId": "68af91695b6090eeac6c4337",
    "formId": "68af915d5b6090eeac6c4336",
    "formGroupId": "68af915d5b6090eeac6c4335",
    "formTitle": "this is not a test title",
    "formDescription": "this is not a test description",
    "submittedBy": "technician@upwingenergy.com",
    "submittedAt": "2025-08-27T16:14:49.274144",
    "reviewedBy": "engineer@upwingenergy.com",
    "reviewedAt": "2025-08-27T16:14:58.195104",
    "status": "rejected"
  },
  {
    "submissionId": "68af91f55b6090eeac6c4338",
    "formId": "68af915d5b6090eeac6c4336",
    "formGroupId": "68af915d5b6090eeac6c4335",
    "formTitle": "this is not a test title",
    "formDescription": "this is not a test description",
    "submittedBy": "technician@upwingenergy.com",
    "submittedAt": "2025-08-27T16:17:09.162526",
    "reviewedBy": None,
    "reviewedAt": None,
    "status": "pending"
  }
])]