from pydantic import BaseModel
from typing import Any, Dict

class TimetableRequest(BaseModel):
    payload: Dict[str, Any]

class TimetableResponse(BaseModel):
    draft: Dict[str, Any]
