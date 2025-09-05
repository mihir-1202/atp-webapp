class ATPError(Exception):
    def __init__(self, message: str, name: str, details: str = None):
        self.name = name
        self.message = message
        self.details = details
        
    def __str__(self):
        return f"{self.message}"
        
    def __repr__(self):
        return f"{self.__class__.__name__}(name={self.name}, message={self.message}, details={self.details})"
    
"""MongoDB Exceptions"""
    
class MongoDBError(ATPError):
    def __init__(self, name = "MongoDB", message = "Error: Service temporarily unavailable", details: str = None):
        super().__init__(
            name=name,
            message=message,
            details="Failed to connect to or perform operations on MongoDB" if details is None else details
        )
    
class DatabaseInsertError(MongoDBError):
    def __init__(self, collection_name: str, document: str, details: str = None):
        super().__init__(
            details=f"Failed to insert document into MongoDB.\nCollection: {collection_name}\nDocument: {document}" if details is None else details
        )
        
class DatabaseConnectionError(MongoDBError):
    def __init__(self, details: str = None):
        super().__init__(
            details="Failed to connect to MongoDB"
        )
        
class DocumentNotFoundError(MongoDBError):
    def __init__(self, details: str = None):
        super().__init__(
            details="Failed to find document in MongoDB." if details is None else details,
        )
        
class ATPFormNotFoundError(DocumentNotFoundError):
    def __init__(self, details: str = None):
        super().__init__(
            details="Failed to find form in MongoDB." if details is None else details,
        )
        
class ATPSubmissionNotFoundError(DocumentNotFoundError):
    def __init__(self, details: str = None):
        super().__init__(
            details="Failed to find submission in MongoDB." if details is None else details,
        )

"""Azure Blob Storage Exceptions"""

class AzureBlobStorageError(ATPError):
    def __init__(self, name = "AzureBlobStorage", message = "Error: Service temporarily unavailable", details: str = None):
        super().__init__(
            name=name,
            message=message,
            details="Failed to connect to or perform operations on Azure Blob Storage" if details is None else details,
        )
        
class BlobNotFoundError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to find file in Azure Blob Storage.\nContainer: {container_name}\nPath: {blob_path}",
        )
         
class BlobDownloadError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to download file from Azure Blob Storage.\nContainer: {container_name}\nPath: {blob_path}",
        )
        
class BlobUploadError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to upload file to Azure Blob Storage.\nContainer: {container_name}\nPath: {blob_path}",
        )
        
class BlobDeleteError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to delete file from Azure Blob Storage.\nContainer: {container_name}\nPath: {blob_path}",
        )
        
