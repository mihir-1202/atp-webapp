#name: what part of the code is throwing the error
class CreateATPException(Exception):
    def __init__(self, message: str, name: str):
        self.name = name
        self.message = message
        super().__init__(self.message, self.name)
        
    def __str__(self):
        return f"{self.name}: {self.message}"
    
    
class MissingSpreadsheetTemplateError(CreateATPException):
    def __init__(self):
        super().__init__(
            "Could not create ATP form: Spreadsheet template is required", 
            "FormTemplateService"
        )  
        
class UploadFileError(CreateATPException):
    def __init__(self, file_name: str):
        super().__init__(
            f"Could not create ATP form: Failed to upload file {file_name}",
            'AzureBlobStorage'
        )
    
class DatabaseInsertError(CreateATPException):
    def __init__(self):
        super().__init__(
            "Could not create ATP form: Database insert failed",
            "MongoDB"
        )
        
class DatabaseConnectionError(CreateATPException):
    def __init__(self):
        super().__init__(
            'Service is currently unavailable',
            "MongoDB"
        )
        
class FormNotFoundError(CreateATPException):
    def __init__(self, form_group_id: str):
        super().__init__(
            f'Could not Update ATP form: Active form with form group ID {form_group_id} not found',
            "FormTemplateService"
        )

