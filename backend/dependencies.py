from dotenv import load_dotenv
import os
from pymongo import MongoClient

#TODO: implement asynchronous code in the dependencies

# Load environment variables from .env file
load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI")

# Database connection
client = MongoClient(MONGO_URI)
db = client['atp-webapp-database']  # Database name

# Collections
atp_forms_collection = db['atp-forms']  # Collection name

# Dependency functions
def get_database():
    """Dependency function to get database instance"""
    return db

def get_atp_forms_collection():
    """Dependency function to get ATP forms collection"""
    return atp_forms_collection