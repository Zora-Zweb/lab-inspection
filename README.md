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

---

# 前端（成员 B）

Vue 3 + Vite 实现的巡检管理前端，通过 `/api` 与后端通信。

## 环境要求

- Node.js ≥ 22.12（Vite 8 的最低版本要求）
- 后端服务已在 `127.0.0.1:8000` 运行

检查版本：

```bash
node -v
```

## 一、安装依赖

```bash
cd frontend
npm install
```

## 二、启动开发服务器

```bash
npm run dev
```

终端会打印访问地址，默认 `http://127.0.0.1:5173`。

**前端必须和后端同时开着。**&#8203; 前端不直接访问 8000 端口，而是在 `vite.config.js` 里配置了代理：所有 `/api` 开头的请求由 Vite 转发到 `http://127.0.0.1:8000`。这样浏览器发出的请求始终是同源的，不会触发 CORS。

按 `Ctrl + C` 停止服务。

## 三、没有后端时使用假数据

后端接口未就绪时，可以让前端跑本地 Mock 数据，此时不需要启动后端。

在 `frontend/` 目录下新建 `.env.local`，内容一行：

```
VITE_USE_MOCK=true
```

重新执行 `npm run dev` 生效。

`.gitignore` 中已包含 `*.local`，因此这个文件只在本机生效，不会被提交。删掉它、或把值改成 `false`，即恢复真实的接口请求。

Mock 数据在 `src/api/mock.js`，内置 26 台设备，其中 7 台带故障记录；页面新登记的巡检记录保存在 `sessionStorage`，刷新不丢，关闭标签页后清空。

## 四、页面说明

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/` | 首页 | 设备总数、正常数、故障数等统计卡片 |
| `/devices` | 设备列表 | 分页、按名称/型号/位置搜索、按状态筛选 |
| `/devices/:id` | 设备详情 | 设备信息、故障列表、登记巡检表单 |

## 五、目录结构

```
frontend/
├── src/
│   ├── api/
│   │   ├── http.js        axios 实例、响应拦截器、错误信息翻译
│   │   ├── index.js       6 个接口函数，含 Mock 开关
│   │   └── mock.js        本地假数据实现
│   ├── components/
│   │   └── StatusTag.vue  状态标签
│   ├── router/index.js    路由表
│   ├── utils/format.js    时间格式化
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── DeviceListView.vue
│   │   └── DeviceDetailView.vue
│   ├── App.vue            布局与导航
│   ├── main.js            入口
│   └── style.css          全局样式
├── vite.config.js         开发服务器与 /api 代理
└── package.json
```

## 六、构建

```bash
npm run build
```

产物输出到 `frontend/dist/`（已在 `.gitignore` 中忽略）。本地预览构建结果：

```bash
npm run preview
```

## 七、常见问题

**页面白屏，浏览器控制台只有一行报错**
先看运行 `npm run dev` 的那个终端窗口。Vue 的编译错误打印在那里，浏览器控制台通常只说 `Failed to fetch dynamically imported module`，看不到真正原因。

**接口返回 502**
Vite 代理起来了但后端没有启动。检查 `127.0.0.1:8000` 是否可访问，或者按第三节改用 Mock。

**`npm run dev` 报 `ENOENT: no such file or directory, open 'package.json'`**
当前目录不对。先 `cd frontend`。

**出现 `EBADENGINE` 警告**
Node 版本低于 22.12，需要升级 Node。
