"""故障状态更新接口。"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Fault, now
from ..schemas import FaultStatusUpdate, ok

router = APIRouter(prefix="/api/faults", tags=["故障"])


@router.patch("/{fault_id}/status", summary="更新故障状态")
def update_fault_status(
    fault_id: int,
    payload: FaultStatusUpdate,
    db: Session = Depends(get_db),
):
    fault = db.get(Fault, fault_id)
    if fault is None:
        raise HTTPException(status_code=404, detail=f"故障不存在：id={fault_id}")

    fault.status = payload.status
    fault.updated_at = now()
    db.commit()
    db.refresh(fault)
    return ok(fault.to_dict(), message="故障状态已更新")
