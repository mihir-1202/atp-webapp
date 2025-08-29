from dotenv import load_dotenv
import os
from azure.storage.blob import BlobServiceClient
import tempfile
from azure.core.exceptions import AzureError
from typing import Annotated, BinaryIO
from fastapi import File

load_dotenv() 
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

"""=====BLOB SERVICE CLIENT====="""
blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

class BlobHandler:
    @staticmethod
    def upload_blob(container_name: str, blob_path: str, file_stream: Annotated[BinaryIO, File()]) -> None:
        try:
            blob_client = blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_path
            )
            blob_client.upload_blob(file_stream, overwrite=True)
        except AzureError as e:
            raise AzureError(f"Failed to upload blob {blob_path} to container {container_name}: {str(e)}")
        
    @staticmethod
    def download_blob(container_name: str, blob_path: str) -> str:
        try:
            blob_client = blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_path
            )
            
            # Verify blob exists
            if not blob_client.exists():
                raise AzureError(f"Blob {blob_path} not found in container {container_name}")
                
            with tempfile.NamedTemporaryFile(delete=False, mode='wb', suffix='.xlsx') as temp_file:
                #returns a StorageStreamDownloader object.
                blob_stream = blob_client.download_blob()
                
                #.chunks() returns a generator
                for chunk in blob_stream.chunks():
                    temp_file.write(chunk)
                
                #context manager flushes and closes the file automatically when the context is exited                   
        except AzureError as e:
            raise IOError(f"Failed to download blob {blob_path}: {str(e)}")
        
        return temp_file.name

    @staticmethod
    def cleanup_temp_files(*file_paths: str) -> None:
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                raise IOError(f"Failed to cleanup temp file {file_path}: {str(e)}")
            
    @staticmethod
    def move_blob(from_container_name: str, blob_path: str, to_container_name: str, to_blob_path: str) -> None:
        try:
            blob_client = blob_service_client.get_blob_client(
                container = from_container_name,
                blob = blob_path
            )
            tempfile_path = BlobHandler.download_blob(from_container_name, blob_path)
            with open(tempfile_path, 'rb') as temp_file:
                BlobHandler.upload_blob(to_container_name, to_blob_path, temp_file)
            BlobHandler.cleanup_temp_files(tempfile_path)
            blob_client.delete_blob()
        except AzureError as e:
            raise AzureError(f"Couldn't move blob {blob_path} from container {from_container_name} to container {to_container_name}: {str(e)}")

    @staticmethod
    def delete_blobs(container_name: str, blob_path = None, virtual_directory = None) -> None:
        if not blob_path and not virtual_directory:
            raise ValueError("Either blob_path or virtual_directory must be provided")
        
        try:
            if virtual_directory:
                blob_container_client = blob_service_client.get_container_client(container_name)
                blobs = blob_container_client.list_blobs(name_starts_with = virtual_directory)
                for blob in blobs:
                    blob_client = blob_service_client.get_blob_client(
                        container=container_name,
                        blob=blob.name
                    )
                    blob_client.delete_blob()
            
            if blob_path:
                blob_client = blob_service_client.get_blob_client(
                    container = container_name,
                    blob = blob_path
                )
                blob_client.delete_blob()
                
        except AzureError as e:
            raise AzureError(f"Failed to delete blob {blob_path} from container {container_name}: {str(e)}")

#Dependency function to get the blob handler
def get_blob_handler():
    return BlobHandler()        

if __name__ == "__main__":
    blob_handler = BlobHandler()
    
    def main():
        #TEST upload_blob()
        try:
            with open("C:/Users/mihirmehta/Downloads/Book1.xlsx", 'rb') as f:
                # Test with virtual path structure
                blob_handler.upload_blob('spreadsheets', 'test_folder/subfolder/testblob.xlsx', f)
        
        except Exception as e:
            print(e)
        
        #TEST download_blob()
        try:
            tf_path = blob_handler.download_blob('spreadsheets', 'atp_form_group_id/active-form/atp_form_id.xlsx')
            print(tf_path)
        except Exception as e:
            print(e)
        
        #TEST list blobs in virtual directory
        try:
            print("\nListing blobs in virtual directory 'test_folder/':")
            blob_container_client = blob_service_client.get_container_client('spreadsheets')
            blobs = blob_container_client.list_blobs(name_starts_with='test_folder/')
            for blob in blobs:
                print(f"  - {blob.name}")
        except Exception as e:
            print(e)
            
        #TEST cleanup_temp_files()
        try:
            blob_handler.cleanup_temp_files(tf_path)
        except Exception as e:
            print(e)
            
        #TEST move_blob()
        try:
            blob_handler.move_blob(
                from_container_name = 'spreadsheets',
                blob_path = 'test_folder/subfolder/testblob.xlsx',
                to_container_name = 'spreadsheets',
                to_blob_path = 'new_test_folder/new_subfolder/testblob_moved.xlsx'
            )
        except Exception as e:
            print(e)
            
    main()