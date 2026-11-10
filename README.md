# McLaren

迈凯轮 3D 展示台，以及车型画册。2026-11-06 从 Alcor 迁出。

- `/` 展示台
- `/showcase/pipeline` 车型画册
- `/showcase/import` 车型管理
- `/login` 管理员登录

内置车是 `public/mclaren/` 里的 MCL35M 和两张 HDR。导入的模型、封面和 `showroom.json` 写在 `public/uploads/mclaren/`，不进 Git。

## 本地运行

```bash
npm install
# 画册、导入和写接口需要这个密码
export MCLAREN_ADMIN_PASSWORD='你的密码'
npm run dev
```

开发地址是 `http://127.0.0.1:3100`。

使用方式见 `docs/教程.md`，页面和三种展示模式的约定见 `docs/规范.md`。

本机压缩工具仍在 `tools/model-optimizer`：

```bash
cd tools/model-optimizer
npm install
npm start
```

画册里的「群晖处理」使用同目录的 `Dockerfile` 和 `online-worker.mjs`，队列写在 uploads 卷的 `mclaren/processing/jobs/`。

## 检查

```bash
npx tsc --noEmit
npm test
```
