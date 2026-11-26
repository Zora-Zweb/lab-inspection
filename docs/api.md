# 接口约定

本文档是全组的接口契约。**任何字段或行为变更，先在小组内说明，再改代码并同步更新本文件。**

- 后端负责人：成员 A（设备详情、巡检、故障状态、健康检查）
- 查询与统计负责人：成员 C（列表、搜索、筛选、首页统计）
- 前端对接：成员 B

## 1. 通用约定

### 1.1 地址

| 环境 | Base URL |
| --- | --- |
| 本地开发 | `http://127.0.0.1:8000` |

所有业务接口以 `/api` 开头。

### 1.2 响应格式

所有接口（**包括错误**）都返回同一结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 0 表示成功；失败时等于 HTTP 状态码 |
| message | string | 成功时为提示语，失败时为中文错误原因，可直接展示给用户 |
| data | object / array / null | 业务数据，失败时为 null |

### 1.3 错误码

| HTTP 状态码 | code | 场景 |
| --- | --- | --- |
| 400 | 400 | 参数校验失败（缺字段、枚举值不在范围内、超长等） |
| 404 | 404 | 设备或故障不存在 |
| 500 | 500 | 服务端异常 |

错误示例：

```json
{
  "code": 400,
  "message": "参数校验失败：result 只能是 'normal' or 'abnormal' 之一",
  "data": null
}
```

常见校验提示：

| 场景 | message |
| --- | --- |
| 缺必填字段 | `参数校验失败：inspector 是必填项` |
| 枚举值不在范围 | `参数校验失败：status 只能是 'pending', 'processing' or 'resolved' 之一` |
| 必填字符串为空 | `参数校验失败：inspector 不能为空` |
| 记录不存在 | `设备不存在：id=999` |

### 1.4 枚举值

| 字段 | 可选值 | 含义 |
| --- | --- | --- |
| `device.status` | `normal` / `faulty` | 设备正常 / 设备故障 |
| `inspection.result` | `normal` / `abnormal` | 巡检结果正常 / 异常 |
| `fault.status` | `pending` / `processing` / `resolved` | 待处理 / 处理中 / 已解决 |

**状态口径**：`device.status` 是设备表中的一个独立字段，不根据故障列表实时推导。设备被判定为故障时，由后端把该字段置为 `faulty`。

### 1.5 时间格式

统一使用 ISO 8601 字符串，UTC 时区，例如 `2026-11-25T08:30:00+00:00`。前端展示时自行转换为本地时间。

## 2. 接口清单

| 方法 | 路径 | 说明 | 负责人 |
| --- | --- | --- | --- |
| GET | `/api/health` | 健康检查 | A |
| GET | `/api/devices/{device_id}` | 设备详情（含巡检与故障） | A |
| POST | `/api/devices/{device_id}/inspections` | 登记一条巡检记录 | A |
| PATCH | `/api/faults/{fault_id}/status` | 更新故障状态 | A |
| GET | `/api/devices` | 设备列表、搜索、状态筛选 | C |
| GET | `/api/stats` | 首页统计 | C |

## 3. 接口详情

### 3.1 设备详情

`GET /api/devices/{device_id}`

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| device_id | int | 设备 id |

成功响应 `200`：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "device": {
      "id": 1,
      "name": "数字示波器 DS1104Z",
      "model": "DS1104Z",
      "location": "A-101",
      "status": "normal",
      "created_at": "2026-11-25T08:30:00+00:00"
    },
    "inspections": [
      {
        "id": 2,
        "device_id": 1,
        "result": "normal",
        "remark": "自检通过",
        "inspector": "李同学",
        "created_at": "2026-11-23T08:30:00+00:00"
      }
    ],
    "faults": []
  }
}
```

说明：

- `inspections` 按巡检时间倒序，最新的在最前面。
- `faults` 按更新时间倒序。
- 设备不存在时返回 `404`。

### 3.2 登记巡检

`POST /api/devices/{device_id}/inspections`

请求体：

| 字段 | 类型 | 必填 | 校验规则 |
| --- | --- | --- | --- |
| result | string | 是 | 只能是 `normal` / `abnormal` |
| inspector | string | 是 | 1~32 个字符 |
| remark | string | 否 | 最长 200 字符，默认空字符串 |

请求示例：

```json
{
  "result": "abnormal",
  "inspector": "张同学",
  "remark": "带载后电压不稳"
}
```

成功响应 `201`，`data` 为新建的巡检记录：

```json
{
  "code": 0,
  "message": "巡检记录已保存",
  "data": {
    "id": 13,
    "device_id": 3,
    "result": "abnormal",
    "remark": "带载后电压不稳",
    "inspector": "张同学",
    "created_at": "2026-11-25T09:10:00+00:00"
  }
}
```

失败情况：设备不存在返回 `404`；`result` 取值非法或 `inspector` 为空返回 `400`。

### 3.3 更新故障状态

`PATCH /api/faults/{fault_id}/status`

请求体：

| 字段 | 类型 | 必填 | 校验规则 |
| --- | --- | --- | --- |
| status | string | 是 | 只能是 `pending` / `processing` / `resolved` |

请求示例：

```json
{ "status": "processing" }
```

成功响应 `200`，`data` 为更新后的故障：

```json
{
  "code": 0,
  "message": "故障状态已更新",
  "data": {
    "id": 1,
    "device_id": 3,
    "description": "带载后输出电压不稳定，掉压明显",
    "status": "processing",
    "updated_at": "2026-11-25T09:12:00+00:00"
  }
}
```

说明：三个状态之间允许互相修改，暂不做流转限制。故障不存在返回 `404`，状态值非法返回 `400`。

### 3.4 健康检查

`GET /api/health`

```json
{ "code": 0, "message": "ok", "data": { "status": "ok" } }
```

## 4. 数据模型

### Device

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 主键 |
| name | string | 设备名称 |
| model | string | 型号 |
| location | string | 所在实验室与位置，如 `A-101` |
| status | string | `normal` / `faulty` |
| created_at | string | 创建时间 |

### Inspection

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 主键 |
| device_id | int | 所属设备 |
| result | string | `normal` / `abnormal` |
| remark | string | 备注 |
| inspector | string | 巡检人 |
| created_at | string | 巡检时间 |

### Fault

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 主键 |
| device_id | int | 所属设备 |
| description | string | 故障描述 |
| status | string | `pending` / `processing` / `resolved` |
| updated_at | string | 最近更新时间 |

## 5. 列表与统计（成员 C）

### 5.1 设备列表（搜索 + 筛选 + 分页）

`GET /api/devices`

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 校验规则 | 说明 |
| --- | --- | --- | --- | --- | --- |
| keyword | string | 否 | 无 | — | 关键词，模糊匹配设备名称、型号、位置 |
| status | string | 否 | 无 | `normal` / `faulty` | 不传或为空表示全部，**不要传 `all`** |
| page | int | 否 | 1 | `>= 1` | 页码，从 1 开始 |
| page_size | int | 否 | 20 | `1 ~ 100` | 每页条数 |

请求示例：

```
GET /api/devices?keyword=示波器&status=faulty&page=1&page_size=10
```

成功响应 `200`：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": 3,
        "name": "可编程直流电源 E3631A",
        "model": "E3631A",
        "location": "A-101",
        "status": "faulty",
        "created_at": "2026-11-25T08:30:00+00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

说明：

- `items` 是设备对象数组，字段与设备详情里的 `device` 一致（不含巡检与故障）。
- 排序：默认按 `id` 升序（或创建时间），如需变更请在群里说明。
- 参数非法（如 `page=0`、`page_size=200`、`status=bad`）返回 `400`，走统一错误格式。
- 无匹配数据时 `items` 为空数组，`total` 为 0，不报错。

### 5.2 首页统计

`GET /api/stats`

返回字段：

- `device_total`：设备总数
- `device_normal`：正常设备数
- `device_faulty`：故障设备数
- `fault_pending`：待处理故障数
- `fault_processing`：处理中故障数
- `fault_resolved`：已解决故障数

成功响应 `200`：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "device_total": 42,
    "device_normal": 35,
    "device_faulty": 7,
    "fault_pending": 3,
    "fault_processing": 2,
    "fault_resolved": 5
  }
}

> 注意：列表接口返回结构已从"数组"变为"对象（items + total + page + page_size）"，前端取数据时请用 `data.items`，不要再直接遍历 `data`。
