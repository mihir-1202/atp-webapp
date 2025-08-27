#!/usr/bin/env python3
"""
Simple MongoDB Connection Test
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

def test_connection():
    print("=== MongoDB Connection Test ===")
    
    # Try to load .env file
    load_dotenv()
    uri = os.getenv("MONGO_URI")
    
    if not uri:
        print("❌ MONGO_URI not found!")
        print("\nTo fix this, create a .env file in the backend directory with:")
        print("MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/atp-webapp-database?retryWrites=true&w=majority")
        return False
    
    print(f"✅ MONGO_URI found: {uri[:50]}...")
    
    try:
        # Test connection with minimal configuration
        client = MongoClient(
            uri,
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        
        # Test ping
        client.admin.command('ping')
        print("✅ Connection successful!")
        
        # Test database access
        db = client['atp-webapp-database']
        collections = db.list_collection_names()
        print(f"✅ Database access successful! Collections: {collections}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nPossible solutions:")
        print("1. Check your MongoDB Atlas network access settings")
        print("2. Verify your connection string is correct")
        print("3. Make sure your IP is whitelisted in MongoDB Atlas")
        return False

if __name__ == "__main__":
    test_connection()
