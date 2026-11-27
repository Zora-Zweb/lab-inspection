"""数据库连接与初始化。"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# 数据库文件放在 backend/lab.db，已在 .gitignore 中排除，不要提交
DB_PATH = Path(__file__).resolve().parent.parent / "lab.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI 依赖：每个请求一个数据库会话，用完自动关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """建表。已存在的表不会被改动。"""
    from . import models  # noqa: F401  确保模型已注册到 Base

    Base.metadata.create_all(bind=engine)
