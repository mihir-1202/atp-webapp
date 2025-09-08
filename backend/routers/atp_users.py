from fastapi import APIRouter, Body, Depends, Path
from pydantic import EmailStr
from typing import Annotated, Optional, Union, Literal
from pymongo.collection import Collection
from pymongo import AsyncMongoClient
from pymongo.errors import PyMongoError
from pymongo.asynchronous.collection import AsyncCollection
from schemas import atp_users_requests
import dependencies
from exceptions import DatabaseInsertError

router = APIRouter()


@router.post("/")
async def create_user(
    user: Annotated[atp_users_requests.ATPUser, Body()],
    client: AsyncMongoClient = Depends(dependencies.get_mongo_client),
    atp_users: AsyncCollection = Depends(dependencies.get_atp_users_collection)
):
    try:
        async with client.start_session() as session:
            await session.start_transaction()
            await atp_users.insert_one(user.model_dump())
            await session.commit_transaction()
    except PyMongoError as e:
        raise DatabaseInsertError(collection_name = 'atp_users')
    else:
        return {'message': "User created succesfully"}

@router.get("/{user_email}")
async def get_user_role(
    user_email: Annotated[EmailStr, Path()],
    client: AsyncMongoClient = Depends(dependencies.get_mongo_client),
    atp_users: AsyncCollection = Depends(dependencies.get_atp_users_collection)
):
    try:
        user = await atp_users.find_one({'userEmail': user_email})
        if user:
            return {'userRole': user['userRole']}
        else:
            return {'userRole': "unauthorized"}
    except PyMongoError as e:
        raise DatabaseInsertError(collection_name = 'atp_users')