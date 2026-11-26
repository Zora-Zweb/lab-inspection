"""请求校验模型与统一响应格式。"""

from typing import Literal

from pydantic import BaseModel, Field


def ok(data=None, message: str = "ok") -> dict:
    """成功响应：code 固定为 0。"""
    return {"code": 0, "message": message, "data": data}


def fail(code: int, message: str) -> dict:
    """失败响应：code 与 HTTP 状态码一致。"""
    return {"code": code, "message": message, "data": None}


class InspectionCreate(BaseModel):
    """新增巡检记录的请求体。字段不合法时由全局异常处理器统一返回中文提示。"""

    result: Literal["normal", "abnormal"] = Field(description="巡检结果，只能是 normal 或 abnormal")
    inspector: str = Field(min_length=1, max_length=32, description="巡检人，必填")
    remark: str = Field(default="", max_length=200, description="备注，可选，最长 200 字")


class FaultStatusUpdate(BaseModel):
    """更新故障状态的请求体。"""

    status: Literal["pending", "processing", "resolved"] = Field(
        description="故障状态，只能是 pending / processing / resolved"
    )
