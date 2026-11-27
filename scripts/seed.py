"""生成示例数据。

注意：会先删表再重建，只用于本地开发环境，不要在有真实数据时运行。

用法（在仓库根目录下）：
    python scripts/seed.py
"""

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# 让脚本能 import app 包（scripts/ 的上一级就是仓库根目录）
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, SessionLocal, engine, init_db  # noqa: E402
from app.models import Device, Fault, Inspection  # noqa: E402

DEVICES = [
    ("数字示波器 DS1104Z", "DS1104Z", "A-101", "normal"),
    ("数字万用表 Fluke 17B+", "Fluke 17B+", "A-101", "normal"),
    ("可编程直流电源 E3631A", "E3631A", "A-101", "faulty"),
    ("函数信号发生器 DG1022Z", "DG1022Z", "A-102", "normal"),
    ("直流电子负载 IT8511", "IT8511", "A-102", "faulty"),
    ("恒温焊台 936", "936", "A-102", "normal"),
    ("频谱分析仪 DSA815", "DSA815", "B-201", "normal"),
    ("LCR 数字电桥 TH2822", "TH2822", "B-201", "faulty"),
    ("温湿度记录仪 TH20R", "TH20R", "B-201", "normal"),
    ("逻辑分析仪 LA1010", "LA1010", "B-202", "normal"),
]

# (设备序号, 结果, 巡检人, 备注, 几天前)
INSPECTIONS = [
    (1, "normal", "张同学", "波形正常，探头已校准", 6),
    (1, "normal", "李同学", "自检通过", 2),
    (2, "normal", "张同学", "电池电量正常", 5),
    (3, "abnormal", "李同学", "带载后输出电压跌落明显，已上报故障", 4),
    (3, "abnormal", "张同学", "复测仍有掉压，等待维修", 1),
    (4, "normal", "王同学", "输出频率准确", 3),
    (5, "abnormal", "王同学", "高电流挡位自动保护频繁触发", 3),
    (6, "normal", "李同学", "温度稳定，烙铁头已更换", 7),
    (7, "normal", "张同学", "频谱底噪正常", 5),
    (8, "abnormal", "王同学", "测 100uF 电容偏差超过 5%", 2),
    (9, "normal", "李同学", "数据记录连续无中断", 1),
    (10, "normal", "张同学", "采样正常", 2),
]

# (设备序号, 故障描述, 状态, 几小时前更新)
FAULTS = [
    (3, "带载后输出电压不稳定，掉压明显", "pending", 30),
    (5, "高电流挡位自动保护触发", "pending", 20),
    (8, "测量电容值偏差超过 5%", "processing", 10),
    (8, "屏幕背光闪烁", "resolved", 48),
]


def main() -> None:
    print("正在重建数据库 ...")
    Base.metadata.drop_all(bind=engine)
    init_db()

    db = SessionLocal()
    try:
        devices = []
        for name, model, location, status in DEVICES:
            device = Device(name=name, model=model, location=location, status=status)
            db.add(device)
            devices.append(device)
        db.flush()  # 先拿到设备 id

        for index, result, inspector, remark, days_ago in INSPECTIONS:
            db.add(
                Inspection(
                    device_id=devices[index - 1].id,
                    result=result,
                    inspector=inspector,
                    remark=remark,
                    created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
                )
            )

        for index, description, status, hours_ago in FAULTS:
            db.add(
                Fault(
                    device_id=devices[index - 1].id,
                    description=description,
                    status=status,
                    updated_at=datetime.now(timezone.utc) - timedelta(hours=hours_ago),
                )
            )

        db.commit()
        print(f"完成：设备 {len(DEVICES)} 台，巡检 {len(INSPECTIONS)} 条，故障 {len(FAULTS)} 条")
        print("示例：GET http://127.0.0.1:8000/api/devices/1")
    finally:
        db.close()


if __name__ == "__main__":
    main()
