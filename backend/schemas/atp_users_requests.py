from pydantic import BaseModel
from pydantic import EmailStr
from typing import Literal

class ATPUser(BaseModel):
    userEmail: EmailStr
    userRole: Literal['technician', 'engineer', 'admin']
    