from .atp_exception import ATPException

"""Azure Blob Storage Exceptions"""
class AzureBlobStorageError(ATPException):
    def __init__(self, name = "AzureBlobStorage", message = "Error: Service temporarily unavailable", details = "Failed to connect to or perform operations on Azure Blob Storage"):
        super().__init__(
            name=name,
            message=message,
            details=details,
        )
        
class BlobNotFoundError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to find files.\nContainer: {container_name}\nPath: {blob_path}",
        )
         
class BlobDownloadError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to download files.\nContainer: {container_name}\nPath: {blob_path}",
        )
        
class BlobUploadError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to upload files.\nContainer: {container_name}\nPath: {blob_path}",
        )
        
class BlobMoveError(AzureBlobStorageError):
    def __init__(self, from_container_name: str, from_blob_path: str, to_container_name: str, to_blob_path: str):
        super().__init__(
            details=f"Failed to move file in Azure Blob Storage.\nFrom Container: {from_container_name}\nFrom Path: {from_blob_path}\nTo Container: {to_container_name}\nTo Path: {to_blob_path}",
        )
        
class BlobDeleteError(AzureBlobStorageError):
    def __init__(self, container_name: str, blob_path: str):
        super().__init__(
            details=f"Failed to delete file from Azure Blob Storage.\nContainer: {container_name}\nPath: {blob_path}",
        )
        