# 实验室设备巡检与故障记录平台

三人协作开发的小型 Web 项目。学生可以查看实验室设备、登记巡检结果、查看故障并更新处理状态。

技术栈：FastAPI（后端）+ SQLite（数据库）+ Vue（前端）

## 目录结构

```
.
├── app/                 后端服务
│   ├── main.py          启动入口、CORS、统一错误处理
│   ├── database.py      数据库连接与建表
│   ├── models.py        数据模型（Device / Inspection / Fault）
│   ├── schemas.py       请求校验与统一响应格式
│   └── routers/
│       ├── devices.py      设备详情
│       ├── devices_list.py 设备列表、搜索、筛选、分页
│       ├── inspections.py  登记巡检
│       ├── faults.py       更新故障状态
│       └── stats.py        首页统计
├── scripts/
│   └── seed.py          生成示例数据
├── tests/
│   └── test_c_endpoints.py  接口测试
├── docs/
│   └── api.md           接口约定（全组共同维护）
├── requirements.txt
└── README.md
```

## 环境要求

- Python 3.11 及以上（已在 3.14 上验证）

## 快速开始

所有命令在**仓库根目录**执行（不是 `backend` 目录，本项目没有该目录）。

### 1. 创建虚拟环境

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

如果提示"禁止运行脚本"，先执行一次：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 2. 安装依赖

```powershell
pip install -r requirements.txt
```

### 3. 生成示例数据

```powershell
python scripts/seed.py
```

输出示例：

```
完成：设备 10 台，巡检 12 条，故障 4 条
```

该脚本会**清空并重建** `lab.db`，只在本地开发时使用。不执行这一步，页面和统计都会是空的。

### 4. 启动服务

```powershell
uvicorn app.main:app --reload
```

看到 `Application startup complete.` 即成功：

- 接口文档（可直接点按钮测试）：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/api/health
- 设备详情：http://127.0.0.1:8000/api/devices/1
- 设备列表：http://127.0.0.1:8000/api/devices?page=1&page_size=10
- 首页统计：http://127.0.0.1:8000/api/stats

按 `Ctrl + C` 停止服务。

## 运行测试

```powershell
pip install pytest
pytest tests/ -v
```

## 接口说明

完整字段与示例见 [docs/api.md](docs/api.md)。

所有接口统一返回：

```json
{ "code": 0, "message": "ok", "data": {} }
```

| 接口 | 说明 | 负责人 |
| --- | --- | --- |
| `GET /api/health` | 健康检查 | A |
| `GET /api/devices/{id}` | 设备详情（含巡检与故障） | A |
| `POST /api/devices/{id}/inspections` | 登记巡检 | A |
| `PATCH /api/faults/{id}/status` | 更新故障状态 | A |
| `GET /api/devices` | 列表、搜索、筛选、分页 | C |
| `GET /api/stats` | 首页统计 | C |

## 前端

前端页面由成员 B 开发，完成后在此补充启动步骤。

## 协作约定

- `main` 为可运行的主分支，任何改动都通过功能分支 + PR 合并，不直接推 `main`。
- 每个 PR 至少由一位队友评审，作者需回复评审意见。
- 分支命名：`feat/backend-core`、`feat/frontend-pages`、`feat/search-tests`。
- `.venv/`、`lab.db`、`__pycache__/` 不提交。
