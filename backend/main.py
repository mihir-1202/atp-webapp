from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from routers import atp_forms_router, atp_submissions_router

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

# Add global exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = [error['msg'] for error in exc.errors()]
    return JSONResponse(
        status_code = 422,
        content = {"errors": '\n'.join(error_messages)}
    )

app.include_router(atp_forms_router, prefix = "/atp-forms", tags = ['ATP Forms'])
app.include_router(atp_submissions_router, prefix = "/atp-submissions", tags = ['ATP Submissions'])
    
if __name__ == "__main__":
    uvicorn.run('main:app', host="localhost", port=8000, reload=True)
