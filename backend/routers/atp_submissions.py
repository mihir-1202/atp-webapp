from fastapi import APIRouter, Body, Depends
from datetime import datetime
from typing import Annotated
from pymongo.collection import Collection
import sys
import os
# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dependencies import get_atp_forms_collection

router = APIRouter()

# TODO: Add ATP submission endpoints here
# This router will handle form submissions and related functionality