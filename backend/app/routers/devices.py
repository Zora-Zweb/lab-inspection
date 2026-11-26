"""设备详情接口。列表、搜索、筛选、统计由成员 C 负责，不要写在这里。"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Device
from ..schemas import ok

router = APIRouter(prefix="/api/devices", tags=["设备"])


@router.get("/{device_id}", summary="设备详情")
def get_device(device_id: int, db: Session = Depends(get_db)):
    """返回设备本身、该设备全部巡检记录、全部故障，一次请求拿全详情页所需数据。"""
    device = db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail=f"设备不存在：id={device_id}")

    return ok(
        {
            "device": device.to_dict(),
            "inspections": [item.to_dict() for item in device.inspections],
            "faults": [item.to_dict() for item in device.faults],
        }
    )
