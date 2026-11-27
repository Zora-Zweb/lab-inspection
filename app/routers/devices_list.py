from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/api", tags=["C-查询与统计"])

@router.get("/devices", summary="设备列表、搜索与状态筛选")
def list_devices(
    keyword: str = Query(None, description="按设备名称、型号、位置模糊搜索"),
    status: str = Query(None, description="normal / faulty，不传表示全部"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Device)

    if keyword:
        search = f"%{keyword}%"
        # 按照文档说明，模糊匹配名称、型号、位置
        query = query.filter(
            (models.Device.name.like(search)) | 
            (models.Device.model.like(search)) | 
            (models.Device.location.like(search))
        )
    
    if status:
        if status not in ["normal", "faulty"]:
            raise HTTPException(status_code=400, detail="参数校验失败：status 只能是 'normal' or 'faulty' 之一")
        query = query.filter(models.Device.status == status)

    total = query.count()
    # 文档说明：默认按 id 升序（或创建时间）
    items = query.order_by(models.Device.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "code": 0,
        "message": "ok",
        "data": {
            "items": [item.to_dict() for item in items],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }