## 6.20 车型展示

车型导入设置页的上传、参数保存、排序、封面、删除和预览生成全部通过以下 API 完成。除公开清单外，写操作都要求管理员 Cookie 会话、可信同源请求并受频率限制。模型文件通过 `/uploads/**` 静态地址与浏览器 Cache Storage / IndexedDB 加载；镜头、圆盘、线框颜色和部位选择属于逐帧交互，不经过 API。

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/api/showcase/models` | 读取首页可用车型清单与公开渲染配置 | 无 |
| POST | `/api/showcase/models/upload?name={file.glb}` | 体检或提交保存 GLB，最大 250MB | 管理员 |
| POST | `/api/showcase/models` | 保存新车型及参数并正式上线 | 管理员 |
| PUT | `/api/showcase/models/{id}` | 更新车型名称、年份和渲染参数 | 管理员 |
| DELETE | `/api/showcase/models/{id}?file=1` | 移出车型；`file=1` 同时删除 GLB | 管理员 |
| PUT | `/api/showcase/models/order` | 保存首页车型排列顺序 | 管理员 |
| POST | `/api/showcase/models/cover?id={id}&name={image}` | 上传车型封面，最大 6MB | 管理员 |
| DELETE | `/api/showcase/models/cover?id={id}` | 移除自定义封面 | 管理员 |
| POST | `/api/showcase/models/preview-upload?id=<id>` | 上传本地工具导出的首页轻量预览 | 管理员 |

### GLB 体检与保存

```http
POST /api/showcase/models/upload?name=mp4-6.glb
Content-Type: model/gltf-binary
Cookie: fire_session=<admin-session>

<原始 GLB 二进制请求体>
```

服务端流式写入系统临时目录，检查 GLB 结构、扩展、网格和贴图。体检通过返回 `{ file, bytes, suggested, report }`，不返回持久化 URL；未通过返回 HTTP `422`。所有分支都删除临时文件。工作台直接预览浏览器当前 File 的 Blob 地址，不写持久化缓存。单文件上限 250MB；单 IP 每小时 20 次，全站每小时 40 次。

保存新车型时再次提交原始 GLB，并附加 `X-Showcase-Model` 请求头，值为 `encodeURIComponent(JSON.stringify({ id, label, note, params }))`，编码后不超过 12000 字符。保存成功返回 `{ model }`；文件复制或登记表提交失败会回收本次新文件。取消、离开、保存失败均不保留未保存附件。

### 新建与更新车型参数

```http
POST /api/showcase/models
Content-Type: application/json

{
  "id": "mp4-6",
  "label": "MP4/6",
  "note": "1991",
  "file": "existing-model.glb",
  "params": {
    "length": 4.4,
    "yaw": 0,
    "pitch": 0,
    "wheelPattern": "wheel|tyre"
  }
}
```

此 JSON 接口仅用于登记 uploads 中已有的文件，不用于新附件上传；新附件通过上述上传接口同时提交文件与参数。成功返回 `{ model }`。修改已有导入车型使用 `PUT /api/showcase/models/{id}`，body 可包含 `label`、`note`、`params`；文件名不可通过更新接口替换。请求体上限 256KB，每小时最多 60 次。内置车型不能通过该接口改参数。

### 排序、封面与删除

```http
PUT /api/showcase/models/order
Content-Type: application/json

{ "ids": ["mcl35m", "mp4-6", "mp4-5"] }
```

排序成功返回 `{ order }`；请求体上限 64KB。封面上传把 PNG、JPG 或 WebP 原始二进制放在请求体中，查询参数传车型 `id` 与原始文件名 `name`，成功返回 `{ cover }`；封面上限 6MB，并验证文件内容与扩展名一致。删除车型默认只移出清单并保留素材，传 `?file=1` 时同时删除 uploads 卷内的 GLB，成功返回 `{ removed, fileDeleted }`。

### 上传本地首页预览

`POST /api/showcase/models/preview-upload?id=<车型ID>`，裸 GLB 请求体，`Content-Type: model/gltf-binary`。仅管理员、同源写入，单 IP 每小时 30 次，上限 32 MiB（包括没有 Content-Length 的流式请求）。体检成功后原子替换预览，失败保留旧预览；支持内置和导入车型。返回 `{ "preview": "/uploads/mclaren/previews/...glb?v=..." }`。

模型高清优化版通过原有车型导入流程上传；KTX2、Meshopt 和 WebP 由现有查看器读取。压缩已迁到独立本地工具，原 `/api/showcase/models/previews` 生成/查询接口已移除，不再启动后台任务。
