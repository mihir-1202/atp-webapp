import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()

# Get connection string from environment variable
client = MongoClient(os.getenv("MONGO_CONNECTION_STRING"))
db = client["atp-webapp-database"]
users = db["atp-users"]

# Add the user
user_data = {
    "userEmail": "i.mihir.mehta@hotmail.com",
    "userRole": "admin"
}

result = users.insert_one(user_data)
print(f"User added with ID: {result.inserted_id}")

# Verify
user = users.find_one({"userEmail": "i.mihir.mehta@hotmail.com"})
print(f"User: {user['userEmail']}, Role: {user['userRole']}")

client.close()