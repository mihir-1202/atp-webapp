from dotenv import load_dotenv
import os
from pymongo import MongoClient
from pymongo import AsyncMongoClient

#TODO: implement asynchronous code in the dependencies

# Load environment variables from .env file
load_dotenv() 
MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

"""=====MONGO DB DEPENDENCIES====="""
client = AsyncMongoClient(MONGO_CONNECTION_STRING)
db = client['atp-webapp-database']  # Database name

# Collections
atp_forms_collection = db['atp-forms']  # Collection name
atp_submissions_collection = db['atp-submissions']
atp_users_collection = db['atp-users']

# Dependency functions
def get_mongo_client():
    return client

def get_atp_forms_collection():
    """Dependency function to get ATP forms collection"""
    return atp_forms_collection

def get_atp_submissions_collection():
    return atp_submissions_collection
    
def get_atp_users_collection():
    return atp_users_collection