from dotenv import load_dotenv
import os
from pymongo import MongoClient
from azure.storage.blob import BlobServiceClient

#TODO: implement asynchronous code in the dependencies

# Load environment variables from .env file
load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI")
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# Database connection
client = MongoClient(MONGO_URI)
db = client['atp-webapp-database']  # Database name

# Collections
atp_forms_collection = db['atp-forms']  # Collection name
atp_submissions_collection = db['atp-submissions']

#Blob service client
blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

# Dependency functions
def get_client():
    return client

def get_database():
    """Dependency function to get database instance"""
    return db

def get_atp_forms_collection():
    """Dependency function to get ATP forms collection"""
    return atp_forms_collection

def get_atp_submissions_collection():
    return atp_submissions_collection

def get_blob_service_client():
    return blob_service_client