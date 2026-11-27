from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/api", tags=["C-查询与统计"])

@router.get("/stats", summary="首页统计")
def get_stats(db: Session = Depends(get_db)):
    device_total = db.query(models.Device).count()
    device_normal = db.query(models.Device).filter(models.Device.status == "normal").count()
    device_faulty = db.query(models.Device).filter(models.Device.status == "faulty").count()
    
    fault_pending = db.query(models.Fault).filter(models.Fault.status == "pending").count()
    fault_processing = db.query(models.Fault).filter(models.Fault.status == "processing").count()
    fault_resolved = db.query(models.Fault).filter(models.Fault.status == "resolved").count()

    return {
        "code": 0,
        "message": "ok",
        "data": {
            "device_total": device_total,
            "device_normal": device_normal,
            "device_faulty": device_faulty,
            "fault_pending": fault_pending,
            "fault_processing": fault_processing,
            "fault_resolved": fault_resolved
        }
    }