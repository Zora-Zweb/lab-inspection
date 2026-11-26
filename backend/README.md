# 后端（成员 A）

FastAPI + SQLite，提供设备详情、巡检登记、故障状态更新和健康检查接口。

## 环境要求

- Python 3.11 及以上（已在 3.14 上验证）
- 依赖见 `requirements.txt`

## 一、创建虚拟环境

在 `backend` 目录下执行：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

如果提示"禁止运行脚本"，先执行一次：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 二、安装依赖

```powershell
pip install -r requirements.txt
```

## 三、生成示例数据

```powershell
python scripts/seed.py
```

输出示例：

```
完成：设备 10 台，巡检 12 条，故障 4 条
```

注意：该脚本会**清空并重建** `lab.db`，只在本地开发时使用。

## 四、启动服务

```powershell
uvicorn app.main:app --reload
```

看到 `Application startup complete.` 即成功。

- 接口文档（可直接点按钮测试）：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/api/health
- 设备详情：http://127.0.0.1:8000/api/devices/1

按 `Ctrl + C` 停止服务。

## 五、目录结构

```
backend/
├── app/
│   ├── main.py           启动入口、CORS、统一错误处理
│   ├── database.py       数据库连接与建表
│   ├── models.py         数据模型
│   ├── schemas.py        请求校验与统一响应格式
│   └── routers/
│       ├── devices.py    设备详情
│       ├── inspections.py 登记巡检
│       └── faults.py     更新故障状态
├── scripts/seed.py       示例数据
├── requirements.txt
└── lab.db                本地数据库（不提交 Git）
```

## 六、接口说明

见仓库根目录的 `docs/api.md`。

## 七、常见问题

**启动时报 `ModuleNotFoundError: No module named 'app'`**
说明没在 `backend` 目录下执行命令。先 `cd backend`，再运行 `uvicorn app.main:app --reload`。

**接口返回 `{"detail": "Not Found"}`**
路径写错了，注意所有业务接口都以 `/api` 开头。

**页面数据是空的**
没有跑 `python scripts/seed.py`，或者数据库文件被删了，重新跑一次。
