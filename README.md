# 实验室设备巡检与故障记录平台

一个由三人协作开发的实验室设备管理 Web 项目，支持设备查询、巡检登记、故障查看与处理状态更新，并提供首页统计和前端 Mock 演示模式。

项目采用 **FastAPI + SQLAlchemy + SQLite + Vue 3 + Vite**，使用 Git 功能分支和 Pull Request 完成开发、评审、联调与集成。

## 功能一览

| 模块 | 已实现功能 |
| --- | --- |
| 运行概览 | 展示设备总数、正常设备、故障设备，以及待处理、处理中、已解决故障数量，共 6 项统计 |
| 设备列表 | 设备分页展示；按名称、型号或位置模糊搜索；按正常、故障状态筛选；支持重置条件 |
| 设备详情 | 展示设备编号、型号、位置、建档时间，以及该设备的巡检和故障记录 |
| 巡检登记 | 提交巡检结果、巡检人和备注；新记录显示在巡检列表最前面 |
| 故障处理 | 在“待处理”“处理中”“已解决”三种状态之间更新；请求失败时恢复页面原状态 |
| 异常反馈 | 展示加载中、无数据、操作成功、参数错误和网络连接失败等状态 |
| 前端 Mock | 不启动后端也能演示列表、详情、巡检登记、故障更新和统计页面 |

本项目不包含用户注册登录、权限管理、消息通知、云端部署、复杂报表和真实硬件控制。

## 技术栈与请求流程

| 部分 | 技术与依赖 |
| --- | --- |
| 后端 | Python、FastAPI、Uvicorn |
| 数据访问 | SQLAlchemy |
| 数据库 | SQLite，本地文件为仓库根目录下的 `lab.db` |
| 前端 | Vue 3、Vue Router、Vite、Axios |
| 后端测试 | pytest、FastAPI TestClient |
| 协作工具 | Git、GitHub、Pull Request |

真实接口模式下，浏览器请求流程如下：

```text
浏览器
  → Vue 前端（默认端口 5173）
  → /api 请求
  → Vite 开发代理
  → FastAPI 后端（默认端口 8000）
  → SQLite（lab.db）
```

前端请求默认使用 `/api` 作为基础路径，由 [frontend/vite.config.js](frontend/vite.config.js) 将请求代理到 `http://127.0.0.1:8000`。也可以通过 `VITE_API_BASE` 修改请求基础路径。

## 项目结构

```text
lab-inspection/
├── app/                            # FastAPI 后端
│   ├── main.py                     # 应用入口、CORS、路由注册与异常处理
│   ├── database.py                 # SQLAlchemy 引擎、会话与建表
│   ├── models.py                   # Device / Inspection / Fault 数据模型
│   ├── schemas.py                  # 请求模型与统一响应函数
│   └── routers/
│       ├── devices.py              # 设备详情
│       ├── devices_list.py         # 设备列表、搜索、筛选与分页
│       ├── inspections.py          # 登记巡检
│       ├── faults.py               # 更新故障状态
│       └── stats.py                # 首页统计
├── frontend/                       # Vue 3 + Vite 前端
│   ├── src/
│   │   ├── api/                    # Axios 请求、接口函数与 Mock 实现
│   │   ├── components/             # 状态标签等公共组件
│   │   ├── router/                 # 前端路由
│   │   ├── utils/                  # 时间格式化
│   │   ├── views/                  # 首页、设备列表、设备详情
│   │   ├── App.vue                 # 布局与导航
│   │   ├── main.js                 # 前端入口
│   │   └── style.css               # 全局样式
│   ├── vite.config.js              # 开发服务器与 /api 代理
│   ├── package.json                # 前端脚本与依赖
│   └── package-lock.json           # 前端依赖锁定文件
├── scripts/
│   └── seed.py                     # 重建数据库并写入示例数据
├── tests/
│   └── test_c_endpoints.py         # 当前 3 个后端接口测试
├── docs/
│   └── api.md                      # 接口契约，由全组共同维护
├── acceptance.md                   # 小组验收记录
├── requirements.txt                # 后端运行依赖
└── README.md                       # 项目说明
```

## 环境要求

| 软件 | 版本要求 | 用途 |
| --- | --- | --- |
| Python | 3.11 及以上 | 后端、数据库脚本和接口测试 |
| Node.js | 22.12 及以上 | Vite 8 前端开发环境 |
| npm | 随 Node.js 安装 | 安装和构建前端 |
| Git | 任意稳定版本 | 克隆代码和版本管理 |

本次文档复核使用的环境为 **Python 3.11.9、Node.js 24.14.0、npm 11.9.0**。

可先在终端检查本机版本：

```bash
python --version
node --version
npm --version
git --version
```

Windows 用户可以使用 PowerShell 或 Git Bash。两种终端的虚拟环境激活命令不同，其他主要命令基本一致。

## 快速启动

### 1. 克隆仓库

```bash
git clone https://github.com/Zora-Zweb/lab-inspection.git
cd lab-inspection
```

以下后端命令均在仓库根目录 `lab-inspection` 中执行。本项目没有 `backend` 目录。

### 2. 创建并激活 Python 虚拟环境

创建虚拟环境：

```bash
python -m venv .venv
```

Git Bash 激活命令：

```bash
source .venv/Scripts/activate
```

PowerShell 激活命令：

```powershell
.\.venv\Scripts\Activate.ps1
```

激活成功后，命令行最前面会出现 `(.venv)`。

如果 PowerShell 提示禁止运行脚本，可以直接改用 Git Bash；也可以在了解执行策略后，仅为当前用户执行：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

然后重新执行 PowerShell 激活命令。

### 3. 安装后端运行依赖

```bash
python -m pip install -r requirements.txt
```

当前 `requirements.txt` 包含 FastAPI、Uvicorn 和 SQLAlchemy；测试依赖需要单独安装，见[运行测试](#运行测试)。

### 4. 初始化示例数据

在全新的本地开发环境中执行：

```bash
python scripts/seed.py
```

成功输出：

```text
完成：设备 10 台，巡检 12 条，故障 4 条
```

> **重要：`seed.py` 会先删除数据表，再重新建表并写入示例数据。** 该脚本只用于首次初始化或明确需要重置本地数据的场景。重复执行会清除之后在系统中新增和修改的数据，不要把它当作普通的“刷新数据”命令。

后端启动时也会自动建表，但自动建表不会生成示例业务数据。因此，未执行 seed 的全新数据库中，设备数和统计数都可能为 0。

### 5. 启动后端

```bash
python -m uvicorn app.main:app --reload
```

看到 `Application startup complete.` 即表示启动成功。

可以访问：

- Swagger 接口文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/health>
- 设备列表：<http://127.0.0.1:8000/api/devices?page=1&page_size=10>
- 设备详情：<http://127.0.0.1:8000/api/devices/1>
- 首页统计：<http://127.0.0.1:8000/api/stats>

保持该终端窗口打开。按 `Ctrl + C` 可停止后端。

### 6. 启动前端

保持后端运行，再打开一个终端。**第二个终端必须先从正确的项目目录打开，不能在桌面直接执行 `cd frontend`。**

推荐操作：在文件资源管理器中进入已经克隆好的 `lab-inspection` 文件夹，在该文件夹的空白处右键，选择 **Git Bash Here**，然后执行：

```bash
cd frontend
npm ci
npm run dev
```

也可以在终端中执行 `pwd`，确认当前路径以 `/lab-inspection` 结尾，再执行上述命令。

如果你已经在桌面打开了 Git Bash，并且 `lab-inspection` 文件夹就在桌面，则使用：

```bash
cd lab-inspection/frontend
npm ci
npm run dev
```

如果第一步提示 `No such file or directory`，说明项目不在当前位置，应回到文件资源管理器，找到实际的 `lab-inspection` 文件夹，再从该文件夹中打开 Git Bash。

`npm ci` 会根据 `package-lock.json` 安装锁定版本。终端随后会显示前端地址，默认通常为：

```text
http://127.0.0.1:5173/
```

请以终端实际输出的 `Local` 地址为准。如果 5173 已被占用，Vite 可能自动选择 5174 等其他端口。

真实接口模式下，前端和后端需要同时运行。请保持两个终端窗口打开。

## 真实数据与 Mock 数据

本项目有两套相互独立的数据来源，验收时必须先说明当前使用哪一种。

| 对比项 | 真实接口模式 | Mock 模式 |
| --- | --- | --- |
| 数据来源 | FastAPI + SQLite | `frontend/src/api/mock.js` |
| 初始设备数量 | seed 后为 10 台 | 26 台 |
| 初始正常 / 故障设备 | 7 台正常、3 台故障 | 20 台正常、6 台故障 |
| 初始巡检 / 故障记录 | 12 条巡检、4 条故障 | 每台设备生成 3 条巡检；6 台故障设备各生成 2 条故障 |
| 是否需要后端 | 需要 | 不需要 |
| 数据保存位置 | 仓库根目录 `lab.db` | 新增巡检和故障状态修改保存在 `sessionStorage` |
| 刷新页面 | 数据保留 | 本次标签页中的修改保留 |
| 重启后端或前端 | 数据保留 | Mock 基础数据不变 |
| 关闭浏览器标签页 | 数据保留 | 本次会话新增的 Mock 巡检和故障状态修改清空 |

### 开启 Mock 模式

在 `frontend/` 目录新建 `.env.local` 文件，内容为：

```env
VITE_USE_MOCK=true
```

修改后必须重新启动前端：

```bash
npm run dev
```

Mock 模式适合独立演示前端页面，但不能替代真实后端接口测试和前后端联调。

### 恢复真实接口模式

删除 `.env.local`，或将内容改为：

```env
VITE_USE_MOCK=false
```

然后重新执行 `npm run dev`，并确保后端已经启动。

`.gitignore` 已包含 `*.local`，因此 `.env.local` 不会被提交到仓库。

## 页面与操作路径

| 前端路由 | 页面 | 操作 |
| --- | --- | --- |
| `/` | 运行概览 | 查看 6 项统计，点击“刷新”重新获取数据 |
| `/devices` | 设备列表 | 搜索、状态筛选、重置、分页、进入设备详情 |
| `/devices/:id` | 设备详情 | 查看设备和故障信息，登记巡检，更新故障状态 |
| 其他地址 | 路由兜底 | 自动跳转到 `/devices` |

设备列表页默认每页显示 20 条。真实 seed 数据只有 10 台设备，因此默认只有 1 页；如需演示前端翻页，可以使用包含 26 台设备的 Mock 模式。后端分页也可以通过 `page_size=5` 等参数直接验证。

## 接口说明

完整字段、参数、枚举值和响应示例见 [docs/api.md](docs/api.md)。

### 核心接口

| 方法与路径 | 功能 | 主要负责人 |
| --- | --- | --- |
| `GET /api/health` | 健康检查 | 成员 A |
| `GET /api/devices/{device_id}` | 设备详情，包含巡检和故障记录 | 成员 A |
| `POST /api/devices/{device_id}/inspections` | 登记巡检，成功返回 HTTP 201 | 成员 A |
| `PATCH /api/faults/{fault_id}/status` | 更新故障状态 | 成员 A |
| `GET /api/devices` | 列表、搜索、筛选和分页 | 成员 C |
| `GET /api/stats` | 首页 6 项统计 | 成员 C |

### 统一响应

成功响应，以及应用已经处理的 HTTP 错误和参数校验错误，采用以下结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

失败时，`code` 与相应 HTTP 状态码一致，`data` 为 `null`。例如，设备不存在时返回 HTTP 404；已由应用处理的参数错误返回 HTTP 400。

### 列表查询参数

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `keyword` | 无 | 模糊匹配设备名称、型号和位置 |
| `status` | 无 | `normal` 或 `faulty`；不传表示全部，不要传 `all` |
| `page` | `1` | 页码，必须大于等于 1 |
| `page_size` | `20` | 每页条数，范围为 1～100 |

请求示例：

```text
GET /api/devices?keyword=示波器&status=normal&page=1&page_size=10
```

列表数据位于 `data.items`，总数和分页信息位于 `data.total`、`data.page`、`data.page_size`，不要直接把 `data` 当作数组遍历。

### 状态枚举

| 字段 | 可选值 |
| --- | --- |
| 设备状态 `device.status` | `normal` / `faulty` |
| 巡检结果 `inspection.result` | `normal` / `abnormal` |
| 故障状态 `fault.status` | `pending` / `processing` / `resolved` |

## 运行测试

### 安装测试依赖

当前测试使用 FastAPI TestClient。除了 pytest，还需要安装与当前 Starlette 版本匹配的 `httpx2`：

```bash
python -m pip install pytest httpx2
```

如果只安装 pytest，干净环境中运行测试会在收集阶段提示缺少 `httpx2`。

### 执行测试

在仓库根目录、已激活的虚拟环境中执行：

```bash
python -m pytest tests/ -v
```

本次实际复核结果：

```text
tests/test_c_endpoints.py::test_devices_list_ok PASSED
tests/test_c_endpoints.py::test_devices_list_invalid_status PASSED
tests/test_c_endpoints.py::test_stats_ok PASSED
3 passed
```

当前 3 个测试分别检查：

1. 设备列表接口正常响应，并包含 `items` 和 `total` 字段。
2. 非法设备状态返回 HTTP 400。
3. 首页统计接口正常响应，且正常设备数与故障设备数之和等于设备总数。

当前测试尚未覆盖关键词搜索结果、设备详情、新增巡检、故障状态更新和 404 等场景。测试直接使用项目根目录的 `lab.db`，没有自动创建独立测试数据库，因此在空数据库上也可能通过。测试通过后仍需要完成下面的功能验收。

## 功能验收

以下预期数据以**刚执行完 seed、尚未新增或修改数据的真实接口模式**为准。

| 验收项 | 操作 | 预期结果 |
| --- | --- | --- |
| 后端健康检查 | 访问 `/api/health` | HTTP 200，`code=0`，`data.status=ok` |
| 首页统计 | 打开 `/` 或访问 `/api/stats` | 设备 10 台、正常 7 台、故障 3 台；待处理 2、处理中 1、已解决 1 |
| 关键词搜索 | 搜索 `示波器` | 示例数据中有 1 条匹配记录 |
| 状态筛选 | 选择“故障” | 显示 3 台故障设备 |
| API 分页 | 请求 `/api/devices?page=1&page_size=5` | `total=10`，当前页 `items` 包含 5 条记录 |
| 设备详情 | 查看设备 1 | 返回设备信息，以及该设备的巡检和故障列表 |
| 新增巡检 | 选择巡检结果，填写巡检人和备注并提交 | 返回 HTTP 201，详情页出现新记录，重启后端后记录仍在 |
| 更新故障 | 修改一条故障的状态 | 返回更新后的故障，刷新页面后状态保持 |
| 空数据 | 搜索一个不存在的关键词 | 列表为空并显示提示，接口不报错 |
| 网络异常 | 停止后端后操作真实接口页面 | 页面显示无法连接或后端不可用提示 |

提交验收前，还应分别注明哪些结果来自真实接口，哪些来自 Mock，避免把 Mock 的 26 台设备写成数据库中的 26 台设备。

## 前端构建与预览

在 `frontend/` 目录执行：

```bash
npm run build
```

构建产物输出到 `frontend/dist/`，该目录已被 `.gitignore` 忽略。

本地预览构建结果：

```bash
npm run preview
```

本次复核已实际执行 `npm ci` 和 `npm run build`，构建成功。

## 三人分工

| 成员 | 主要职责 | 对应交付物 |
| --- | --- | --- |
| 成员 A：后端核心开发 | 搭建 FastAPI 基础结构；设计数据模型；实现设备详情、新增巡检、故障状态更新和健康检查；处理参数与 HTTP 异常 | `app/main.py`、核心模型和路由、核心接口说明、联调数据 |
| 成员 B：前端开发 | 实现运行概览、设备列表和详情；完成搜索筛选、巡检提交、故障状态更新、Mock 和页面状态反馈 | `frontend/` 页面、用户操作流程、前后端联调结果 |
| 成员 C：查询统计、测试与集成 | 实现设备列表查询和首页统计；编写接口测试；维护接口文档、启动说明和验收记录 | `devices_list.py`、`stats.py`、`tests/`、`docs/api.md`、`acceptance.md` |

接口或字段变更时，应先同步给全组，再同时更新实现、[docs/api.md](docs/api.md)、前端调用和相关测试。

## Git 协作规范

- `main` 为可运行、可供全组同步和验收的主分支，不直接向 `main` 推送功能改动。
- 功能从最新 `main` 创建分支，例如 `feat/backend-core`、`feat/frontend-pages`、`feat/search-tests`。
- 每个分支对应一项明确任务，每次提交聚焦一组相关改动。
- 每个 PR 至少由一位队友评审，作者应回应意见并完成必要修改。
- PR 中说明改动内容和验证方式；联调功能还应写明前后端验证过程。
- 主分支更新后，先同步并解决冲突，再运行测试和启动验证，最后更新 PR。
- 不擅自改写已经共享的提交历史；需要撤销共享改动时，先沟通并使用修正提交或 `git revert`。
- `.venv/`、`lab.db`、`__pycache__/`、`node_modules/`、`dist/`、本地环境配置和密钥不得提交。

提交前建议检查：

```bash
git status
git diff --staged
python -m pytest tests/ -v
```

如果修改了前端，还应在 `frontend/` 目录执行：

```bash
npm run build
```

小组验收记录见 [acceptance.md](acceptance.md)，分支合并和评审过程以 GitHub 的提交历史及 Pull Request 记录为准。

## 当前限制与后续改进

为了准确反映当前实现，以下事项仍需注意：

1. **后端校验尚未完全对齐接口文档。** 前端已限制巡检人非空且最多 32 字、备注最多 200 字，但后端 `InspectionCreate` 目前没有完整实现这些非空和长度约束。直接调用 API 时仍需补充服务端校验。
2. **异常巡检不会自动修改设备状态。** 当前新增 `abnormal` 巡检只新增巡检记录，不会把设备的 `status` 自动改为 `faulty`；设备状态和故障状态是相互独立的字段。
3. **自动化测试覆盖有限。** 当前只有 3 个查询与统计测试，并使用实际 `lab.db`。后续应增加独立测试数据库，以及详情、巡检、故障、搜索和异常输入测试。
4. **前端暂无独立自动化测试和 lint 脚本。** 当前可通过 `npm run build` 验证编译，通过人工验收检查交互。
5. **Mock 不是后端持久化的替代品。** 它只适合演示和并行开发，不能作为真实接口或数据库验收结果。

## 常见问题

### 运行测试时提示缺少 `httpx2`

在虚拟环境中执行：

```bash
python -m pip install pytest httpx2
```

然后重新运行测试。

### 页面持续转圈或接口返回 502

通常是前端已启动，但 Vite 无法连接后端。检查：

1. 后端终端是否仍在运行。
2. <http://127.0.0.1:8000/api/health> 是否可访问。
3. 后端是否在仓库根目录通过 `python -m uvicorn app.main:app --reload` 启动。

如果只需要演示前端，可以改用 Mock 模式。

### 页面统计全为 0 或设备列表为空

确认是否使用了全新数据库但尚未执行 seed。首次初始化可执行：

```bash
python scripts/seed.py
```

该命令会清空并重建 `lab.db`。如果数据库中已有需要保留的数据，不要重复执行。

同时检查是否混淆了真实接口和 Mock 模式。

### 提示 `No module named ...`

确认命令行前显示 `(.venv)`，然后在仓库根目录执行：

```bash
python -m pip install -r requirements.txt
```

### 找不到 `requirements.txt` 或 `scripts/seed.py`

当前目录不正确。使用 `pwd` 检查路径，后端命令应在 `lab-inspection` 仓库根目录执行。

### 执行 `cd frontend` 提示 `No such file or directory`

`frontend` 位于 `lab-inspection` 项目内部，不在桌面顶层。请在文件资源管理器中进入 `lab-inspection`，从该文件夹打开 Git Bash后再执行 `cd frontend`。

如果项目文件夹就在桌面，也可以在桌面 Git Bash 中直接执行：

```bash
cd lab-inspection/frontend
```

### `npm run dev` 提示找不到 `package.json`

当前不在前端目录。先进入 `lab-inspection/frontend`，再执行 `npm run dev`。可以用 `pwd` 检查当前路径是否以 `/lab-inspection/frontend` 结尾。

### 关闭 Git Bash 时弹出 `Processes are running in session` 或 `Close anyway?`

这不是启动报错，而是 mintty 在提示当前窗口中仍有 `npm run dev`、Node.js 或后端进程运行。

- 要继续使用平台：点击 **Cancel**，保持窗口运行，然后打开终端中 `Local:` 后面的网址。
- 要正常停止服务：先点击 **Cancel** 回到终端，按 `Ctrl + C`，等待服务停止后再关闭窗口。
- 如果直接点击 **OK**：窗口和其中的服务会一起停止，网页将无法继续访问前端。

### 出现 `EBADENGINE` 警告

Node.js 版本低于项目要求。请升级到 Node.js 22.12 或更高版本，重新打开终端后再安装依赖。

### 页面白屏，浏览器只显示动态模块加载失败

优先查看运行 `npm run dev` 的终端，Vue 的具体编译错误通常显示在那里。

### 修改 `.env.local` 后没有生效

确认：

1. 文件位于 `frontend/` 目录。
2. 文件名正好是 `.env.local`。
3. 变量值使用小写 `true` 或 `false`。
4. 修改后已停止并重新执行 `npm run dev`。

## 停止与再次运行

分别在前端和后端终端按 `Ctrl + C` 即可停止服务。

下次启动时，如果代码和依赖没有变化，不需要重新克隆、重新安装依赖或重新执行 seed。

后端终端，在仓库根目录执行：

```bash
source .venv/Scripts/activate
python -m uvicorn app.main:app --reload
```

PowerShell 用户将第一条命令替换为：

```powershell
.\.venv\Scripts\Activate.ps1
```

前端终端，在 `frontend/` 目录执行：

```bash
npm run dev
```

使用真实接口模式时，请确认 `VITE_USE_MOCK` 未设置为 `true`，并同时保持前后端服务运行。
