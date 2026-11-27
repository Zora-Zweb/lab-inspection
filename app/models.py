"""数据模型：设备、巡检记录、故障。"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

# 状态取值，全组统一，改动需同步 docs/api.md
DEVICE_STATUS = ("normal", "faulty")
INSPECTION_RESULT = ("normal", "abnormal")
FAULT_STATUS = ("pending", "processing", "resolved")


def now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime | None) -> str | None:
    """统一输出带 UTC 时区的 ISO 8601 字符串，与 docs/api.md 的约定一致。"""
    if value is None:
        return None
    # SQLite 不保存时区，读回来是 naive 时间，这里补上 UTC 标记
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), index=True)
    model: Mapped[str] = mapped_column(String(64), default="")
    location: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(16), default="normal")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    inspections: Mapped[list["Inspection"]] = relationship(
        back_populates="device",
        cascade="all, delete-orphan",
        order_by="Inspection.created_at.desc()",
    )
    faults: Mapped[list["Fault"]] = relationship(
        back_populates="device",
        cascade="all, delete-orphan",
        order_by="Fault.updated_at.desc()",
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "model": self.model,
            "location": self.location,
            "status": self.status,
            "created_at": _iso(self.created_at),
        }


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), index=True)
    result: Mapped[str] = mapped_column(String(16))
    remark: Mapped[str] = mapped_column(Text, default="")
    inspector: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    device: Mapped["Device"] = relationship(back_populates="inspections")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "device_id": self.device_id,
            "result": self.result,
            "remark": self.remark,
            "inspector": self.inspector,
            "created_at": _iso(self.created_at),
        }


class Fault(Base):
    __tablename__ = "faults"

    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), index=True)
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now, onupdate=now
    )

    device: Mapped["Device"] = relationship(back_populates="faults")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "device_id": self.device_id,
            "description": self.description,
            "status": self.status,
            "updated_at": _iso(self.updated_at),
        }
