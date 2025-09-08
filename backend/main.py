from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from routers import atp_forms_router, atp_submissions_router, atp_users_router
from pymongo.errors import PyMongoError
from exceptions import *

app = FastAPI(
    title = "ATP Web Application API",
    description = "This is a FastAPI program for the ATP Web Application, which allows users from Upwing Energy to create, manage, and submit ATP forms.",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- This allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    missing_fields = []
    error_details = []
    for error in exc.errors():
        if error["type"] == "value_error.missing":
            # loc may be like ['body', 'field_name']
            field_path = ".".join(str(l) for l in error["loc"][1:])
            missing_fields.append(field_path)
        
        # Convert error to JSON-serializable format
        error_details.append({
            "type": error.get("type", ""),
            "loc": error.get("loc", []),
            "msg": error.get("msg", ""),
            "input": str(error.get("input", "")) if error.get("input") is not None else None
        })
    
    print("Missing fields:", missing_fields)  # prints to console for debugging
    print("All validation errors:", error_details)  # prints all errors for debugging

    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "missing_fields": missing_fields,
            "details": error_details
        }
    )


@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    print(type(exc).__name__, str(exc))
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)}
    )

@app.exception_handler(AzureBlobStorageError)
async def azure_blob_storage_error_handler(request: Request, exc: AzureBlobStorageError):
    print(type(exc).__name__, str(exc))
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)}
    )

@app.exception_handler(ATPException)
async def atp_error_handler(request: Request, exc: ATPException):
    print(type(exc).__name__, str(exc))
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)}
    )

@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    print(type(exc).__name__, str(exc))
    return JSONResponse(
        status_code=500,
        content={"message": 'Something unexpected happened'}
    )

"""
# Add global exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = [error['msg'] for error in exc.errors()]
    return JSONResponse(
        status_code = 422,
        content = {"message": '\n'.join(error_messages)}
    )
"""

app.include_router(atp_forms_router, prefix = "/atp-forms", tags = ['ATP Forms'])
app.include_router(atp_submissions_router, prefix = "/atp-submissions", tags = ['ATP Submissions'])
app.include_router(atp_users_router, prefix = "/atp-users", tags = ['ATP Users'])
    
if __name__ == "__main__":
    uvicorn.run('main:app', host="localhost", port=8000, reload=True)
