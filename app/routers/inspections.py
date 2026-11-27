"""巡检记录新增接口。"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Device, Inspection
from ..schemas import InspectionCreate, ok

router = APIRouter(prefix="/api/devices", tags=["巡检"])


@router.post("/{device_id}/inspections", status_code=201, summary="登记巡检")
def create_inspection(
    device_id: int,
    payload: InspectionCreate,
    db: Session = Depends(get_db),
):
    device = db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail=f"设备不存在：id={device_id}")

    item = Inspection(
        device_id=device_id,
        result=payload.result,
        remark=payload.remark.strip(),
        inspector=payload.inspector.strip(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ok(item.to_dict(), message="巡检记录已保存")
