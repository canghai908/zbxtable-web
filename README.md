# ZbxTable-Web

ZbxTable 前端工程（基于 Vue 2 + Ant Design Vue + ECharts + AntV X6）。

后端仓库与完整前后端联调、单二进制打包文档请参见 [zbxtable 本地开发与编译指南](https://github.com/canghai908/zbxtable/blob/3.0/docs/DEVELOPMENT.md)。

## 环境要求

- **Node.js**：`16.x ~ 20.x`（Node.js `17+` 运行开发服务器需启用 `--openssl-legacy-provider`）
- **Yarn**：`1.22+`（Classic）

## 本地开发

1. 安装依赖：

```bash
yarn install
```

2. 确保本地后端服务已启动（默认监听 `http://127.0.0.1:8088`），或按需修改 `.env.development` 中的代理目标地址：

```ini
VUE_APP_API_BASE_URL=http://127.0.0.1:8088
```

3. 启动本地热更新开发服务器：

```bash
yarn serve

# 若使用 Node.js 17+ / 18 / 20 遇到 ERR_OSSL_EVP_UNSUPPORTED，请执行：
NODE_OPTIONS=--openssl-legacy-provider yarn serve
```

启动后访问 `http://127.0.0.1:8080`。`vue.config.js` 会自动将 `/v1`、`/download`、`/public`、`/upload`、`/install` 请求与 `/ws` WebSocket 代理到 `VUE_APP_API_BASE_URL`。

## 代码检查与生产构建

```bash
# ESLint 代码规范检查
yarn lint

# 构建生产静态资源（已内置 NODE_OPTIONS=--openssl-legacy-provider）
yarn build
```

- 构建产物默认输出至 `./web` 目录。
- 前端版本号（`process.env.VUE_APP_VERSION`）在构建时按以下优先级自动解析：`VERSION` 环境变量 > 当前提交精确匹配的 Git Tag > `git describe --tags --always` > `package.json` 的 `version`。

## 嵌入后端单二进制编译

与后端 `zbxtable` 同级目录放置时，可将构建产物同步至后端 `go:embed` 目录后编译单二进制文件：

```bash
yarn build
rm -rf ../zbxtable/api/v1/web/web
mkdir -p ../zbxtable/api/v1/web/web
cp -R ./web/. ../zbxtable/api/v1/web/web/

cd ../zbxtable && make build
```

## 许可证

Apache-2.0，详见 [LICENSE](./LICENSE)。
