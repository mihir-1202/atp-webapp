from dotenv import load_dotenv
import os
from pymongo import MongoClient

#TODO: implement asynchronous code in the dependencies

# Load environment variables from .env file
load_dotenv() 
MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

"""=====MONGO DB DEPENDENCIES====="""
client = MongoClient(MONGO_CONNECTION_STRING)
db = client['atp-webapp-database']  # Database name

# Collections
atp_forms_collection = db['atp-forms']  # Collection name
atp_submissions_collection = db['atp-submissions']

# Dependency functions
def get_mongo_client():
    return client

def get_database():
    """Dependency function to get database instance"""
    return db

def get_atp_forms_collection():
    """Dependency function to get ATP forms collection"""
    return atp_forms_collection

def get_atp_submissions_collection():
    return atp_submissions_collection