class SubmitATPException(Exception):
    def __init__(self, message: str, name: str):
        self.name = name
        self.message = message
        
    def __str__(self):
        return f"{self.name}: {self.message}"
    
class ATPSubmissionNotFoundError(SubmitATPException):
    def __init__(self, submission_id: str):
        super().__init__(
            f"ATP submission for form {submission_id} not found",
            'FormSubmissionService'
        )
        
class ATPSpreadsheetTemplateNotFoundError(SubmitATPException):
    def __init__(self, form_id: str):
        super().__init__(
            f"ATP spreadsheet template for form {form_id} not found",
            'FormSubmissionService'
        )
class ATPSpreadsheetTemplateDownloadError(SubmitATPException):
    def __init__(self, form_id: str):
        super().__init__(
            f"Failed to download ATP spreadsheet template for form {form_id}",
            'AzureBlobStorage'
        )
        
class ATPCompletedSpreadsheetUploadError(SubmitATPException):
    def __init__(self, form_id: str):
        super().__init__(
            f"Failed to upload completed ATP spreadsheet template for form {form_id}",
            'AzureBlobStorage'
        )
        
class ATPCompletedSpreadsheetDownloadError(SubmitATPException):
    def __init__(self, form_id: str):
        super().__init__(
            f"Failed to download completed ATP spreadsheet template for form {form_id}",
            'AzureBlobStorage'
        )