"""FastAPI 启动入口。

启动：uvicorn app.main:app --reload
接口文档：http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .database import init_db
from .routers import devices, faults, inspections,devices_list,stats
from .schemas import fail, ok

app = FastAPI(
    title="实验室设备巡检与故障记录平台",
    version="0.1.0",
    description="后端核心接口（成员 A 负责）。列表、搜索、筛选、统计接口由成员 C 补充。",
)

# 开发阶段允许前端（Vite 默认 5173 端口）跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(devices.router)
app.include_router(devices_list.router)
app.include_router(stats.router)
app.include_router(inspections.router)
app.include_router(faults.router)


@app.get("/api/health", tags=["系统"], summary="健康检查")
def health():
    return ok({"status": "ok"})


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """把 404 等错误也包成统一格式，前端只需要处理一种结构。"""
    return JSONResponse(status_code=exc.status_code, content=fail(exc.status_code, str(exc.detail)))


def _validation_message(error: dict) -> str:
    """把 Pydantic 的英文校验提示翻成前端可直接展示的中文。"""
    field = ".".join(str(item) for item in error["loc"] if item != "body")
    kind = error["type"]

    if kind == "missing":
        return f"{field} 是必填项"
    if kind == "literal_error":
        return f"{field} 只能是 {error['ctx']['expected']} 之一"
    if kind == "string_too_short":
        return f"{field} 不能为空"
    if kind == "string_too_long":
        return f"{field} 长度超出限制"
    return f"{field} {error['msg']}"


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """把 FastAPI 默认的 422 校验错误转成统一格式与中文提示。"""
    return JSONResponse(
        status_code=400,
        content=fail(400, "参数校验失败：" + _validation_message(exc.errors()[0])),
    )
