from pydantic import BaseModel
from typing import Literal

def ok(data=None, message="ok"):
    return {"code": 0, "message": message, "data": data}

def fail(code=400, message="error"):
    return {"code": code, "message": message, "data": None}

class InspectionCreate(BaseModel):
    result: Literal["normal", "abnormal"]
    inspector: str
    remark: str = ""

class FaultStatusUpdate(BaseModel):
    status: Literal["pending", "processing", "resolved"]