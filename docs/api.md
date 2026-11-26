# 接口约定

## 5. 查询与统计接口（成员 C）

### 5.1 设备列表、搜索与状态筛选

`GET /api/devices`

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | 空 | 按设备 name 或 model 模糊搜索，不区分大小写 |
| status | string | 否 | 空 | 只能是 normal / faulty；不传则不限状态 |
| page | int | 否 | 1 | 页码，从 1 开始，必须 ≥ 1 |
| page_size | int | 否 | 10 | 每页条数，范围 1~100 |

校验规则：

- status 非法返回 400，message：`参数校验失败：status 只能是 'normal' or 'faulty' 之一`
- page < 1 返回 400，message：`参数校验失败：page 必须大于等于 1`
- page_size 不在 1~100 返回 400，message：`参数校验失败：page_size 必须在 1~100 之间`

成功响应 200：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "数字示波器 DS1104Z",
        "model": "DS1104Z",
        "location": "A-101",
        "status": "normal",
        "created_at": "2026-11-25T08:30:00+00:00"
      }
    ],
    "total": 42,
    "page": 1,
    "page_size": 10
  }
}