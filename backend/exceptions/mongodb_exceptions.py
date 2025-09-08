from .atp_exception import ATPException
    
class MongoDBError(ATPException):
    def __init__(self, name = "MongoDB", message = "Error: Database temporarily unavailable", details = "Failed to connect to or perform operations on MongoDB"):
        super().__init__(
            name=name,
            message=message,
            details = details,
        )
    
class DatabaseInsertError(MongoDBError):
    def __init__(self, collection_name: str, message: str = "Failed to upload data to database"):
        super().__init__(
            message = message,
            details=f"Failed to insert document into MongoDB.\nCollection: {collection_name}\n" 
        )
        
class DatabaseUpdateError(MongoDBError):
    def __init__(self, collection_name: str, document_id: str, message: str = "Failed to update data in database"):
        super().__init__(
            message = message,
            details=f"Failed to update document in MongoDB.\nCollection: {collection_name}\nDocument ID: {document_id}"
        )

class DatabaseDeleteError(MongoDBError):
    def __init__(self, collection_name: str, document_id: str, message: str = "Failed to delete data from database"):
        super().__init__(
            message = message,
            details=f"Failed to delete document from MongoDB.\nCollection: {collection_name}\nDocument ID: {document_id}"
        )
        
class DatabaseConnectionError(MongoDBError):
    def __init__(self, message: str = "Failed to connect to the database"):
        super().__init__(
            message = message,
            details="Failed to connect to MongoDB"
        )
        
class DocumentNotFoundError(MongoDBError):
    def __init__(self, message: str = "Failed to find requested data.", collection_name: str = None, document_id: str = None):
        super().__init__(
            message=message,
            details=f"Failed to find document in MongoDB.\nCollection: {collection_name}\nDocument ID: {document_id}",
        )
        
class ATPFormNotFoundError(DocumentNotFoundError):
    def __init__(self, message: str = "Failed to find requested ATP form.", collection_name: str = None, document_id: str = None):
        super().__init__(
            message = message,
            collection_name = collection_name,
            document_id = document_id,
        )
        
class ATPSubmissionNotFoundError(DocumentNotFoundError):
    def __init__(self, message: str = "Failed to find requested ATP submission.", collection_name: str = None, document_id: str = None):
        super().__init__(
            message=message,
            collection_name = collection_name,
            document_id = document_id,
        )