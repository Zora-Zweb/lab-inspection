# 实验室设备巡检与故障记录平台

三人协作开发的小型 Web 项目：学生可以查看实验室设备、登记巡检结果、查看故障并更新处理状态。

技术栈：FastAPI（后端）+ Vue（前端）+ SQLite（数据库）。

## 目录结构

```
.
├── backend/        后端服务（成员 A）
│   ├── app/
│   │   ├── main.py        启动入口、CORS、统一错误处理
│   │   ├── database.py    数据库连接与建表
│   │   ├── models.py      数据模型（Device / Inspection / Fault）
│   │   ├── schemas.py     请求校验与统一响应格式
│   │   └── routers/
│   │       ├── devices.py      设备详情
│   │       ├── inspections.py  登记巡检
│   │       └── faults.py       更新故障状态
│   ├── scripts/seed.py  示例数据
│   └── requirements.txt
├── frontend/       前端页面（成员 B，待创建）
├── docs/
│   └── api.md      接口约定（A、C 共同维护）
└── README.md
```

## 快速开始（后端）

在 `backend` 目录下执行：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload
```

打开 http://127.0.0.1:8000/docs 可以看到接口列表并直接测试。

更详细的说明见 [backend/README.md](backend/README.md)，接口字段见 [docs/api.md](docs/api.md)。

## 前端与联调

待成员 B 补充启动步骤。

## 协作约定

- `main` 为可运行的主分支，任何改动都通过功能分支 + PR 合并，不直接推 `main`。
- 每个 PR 至少由一位队友评审。
- 分支命名：`feat/backend-core`、`feat/frontend-pages`、`feat/search-tests`。
