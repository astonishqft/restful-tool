# restful-api-test 发布说明

## 使用以下命令进行版本发布：

```bash
# 补丁版本升级 (推荐用于 bug 修复) - 升级补丁版本 (1.0.0 → 1.0.1)
pnpm release
# 或
pnpm release:patch

# 次版本升级 (用于新功能) - 升级次版本 (1.0.0 → 1.1.0)
pnpm release:minor

# 主版本升级 (用于重大更改) - 升级主版本 (1.0.0 → 2.0.0)
pnpm release:major
```
每个命令都会自动执行以下操作：

1. 升级 package.json 中的版本号
2. 创建对应的 git tag
3. 推送代码和标签到 GitHub
4. 触发 GitHub Actions 自动构建和发布

## 程序下载地址：

- Windows 安装程序：
  https://github.com/astonishqft/restful-tool/releases/download/v1.0.7/restful-api-test-1.0.7.setup.exe

- macOS 应用程序：
  https://github.com/astonishqft/restful-tool/releases/download/v1.0.7/restful-api-test-1.0.7.dmg
