from dotenv import load_dotenv
import os
from azure.storage.blob.aio import BlobServiceClient
from azure.storage.blob import BlobSasPermissions, generate_blob_sas
import tempfile
from azure.core.exceptions import AzureError
from typing import Annotated, BinaryIO
from fastapi import File
from datetime import datetime, timedelta
import aiofiles
from exceptions import *

load_dotenv() 
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

"""=====BLOB SERVICE CLIENT====="""
blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING, async_only=True)

class BlobHandler:
    @staticmethod
    async def upload_blob(container_name: str, blob_path: str, file_stream: Annotated[BinaryIO, File()]) -> None:
        try:
            blob_client = blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_path
            )
            await blob_client.upload_blob(file_stream, overwrite=True)
        except AzureError as e:
            raise BlobUploadError(container_name = container_name, blob_path = blob_path)
        
    @staticmethod
    async def download_blob(container_name: str, blob_path: str) -> str:
        try:
            blob_client = blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_path
            )
            
            # Verify blob exists
            if not await blob_client.exists():
                raise BlobNotFoundError(container_name = container_name, blob_path = blob_path)
            
            # TODO: rename to download_excel_blob since it is only used for excel blobs (images arent downloaded, they only need a url)
            with tempfile.NamedTemporaryFile(delete = False, mode = 'wb', suffix='.xlsx') as tmp_file:
                tmp_path = tmp_file.name
                
            async with aiofiles.open(tmp_path, 'wb') as temp_file:
                #returns a StorageStreamDownloader object.
                blob_stream = await blob_client.download_blob()
                
                #.chunks() returns a generator
                async for chunk in blob_stream.chunks():
                    await temp_file.write(chunk)
                
                #context manager flushes and closes the file automatically when the context is exited                   
        except AzureError as e:
            raise BlobDownloadError(container_name = container_name, blob_path = blob_path)
        
        return tmp_path

    @staticmethod
    def cleanup_temp_files(*file_paths: str) -> None:
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                raise IOError(f"Failed to cleanup temp file {file_path}: {str(e)}")
            
    @staticmethod
    async def move_blob(from_container_name: str, blob_path: str, to_container_name: str, to_blob_path: str) -> None:
        try:
            blob_client = blob_service_client.get_blob_client(
                container = from_container_name,
                blob = blob_path
            )
            tempfile_path = await BlobHandler.download_blob(from_container_name, blob_path)
            
            async with aiofiles.open(tempfile_path, 'rb') as temp_file:
                await BlobHandler.upload_blob(to_container_name, to_blob_path, temp_file)
            BlobHandler.cleanup_temp_files(tempfile_path)
            await blob_client.delete_blob()
        except AzureError as e:
            raise BlobMoveError(from_container_name = from_container_name, blob_path = blob_path, to_container_name = to_container_name, to_blob_path = to_blob_path)

    @staticmethod
    async def delete_blobs(container_name: str, blob_path = None, virtual_directory = None) -> None:
        print(f"delete_blobs called with: container_name={container_name}, blob_path={blob_path}, virtual_directory={virtual_directory}")
        print(f"blob_path type: {type(blob_path)}, virtual_directory type: {type(virtual_directory)}")
        
        if not blob_path and not virtual_directory:
            raise ValueError("Either blob_path or virtual_directory must be provided")
        
        try:
            if virtual_directory:
                print(f"Deleting virtual directory: {virtual_directory}")
                blob_container_client = blob_service_client.get_container_client(container_name)
                blobs = blob_container_client.list_blobs(name_starts_with = virtual_directory)
                async for blob in blobs:
                    print(f"  Deleting blob: {blob.name}")
                    blob_client = blob_service_client.get_blob_client(
                        container=container_name,
                        blob=blob.name
                    )
                    await blob_client.delete_blob()
            
            elif blob_path:
                print(f"Deleting specific blob: {blob_path}")
                blob_client = blob_service_client.get_blob_client(
                    container = container_name,
                    blob = blob_path
                )
                await blob_client.delete_blob()
                
        except AzureError as e:
            raise BlobDeleteError(container_name = container_name, blob_path = blob_path)
        
    @staticmethod
    def get_blob_url(container_name: str, blob_name: str, expiry_hours: int = 1):
        account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")

        # Generate SAS token
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=blob_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
        )

        # Construct full URL with SAS token
        return f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
    


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