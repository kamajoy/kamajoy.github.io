### vscode必备插件
   备份信息见： https://github.com/kamajoy/kamajoy.github.io/tree/master/vscode%E5%A4%87%E4%BB%BD%E7%9B%AE%E5%BD%95

- 中文版插件: Chinese
- 图标： Material Icon Theme
- 主题：Dracula Theme Official
- 运行代码：Code Runner
- 代码格式化：Prettier
- 代码补齐AI：Codeium（免费），MarsCode AI
- 前端代码工具：ESLint
- 代码中显示git修改信息：GitLens
- Go扩展：Go
- vue: Vue - Official
- 字体： https://github.com/tonsky/FiraCode?tab=readme-ov-file
- 缩进：Indent Rainbow
- ssh: Remote - SSH

自动格式化代码：    "editor.formatOnSave": true,"[go]": {xxxx},如下：
setting json配置：
```json
{
  "workbench.iconTheme": "material-icon-theme",
  "files.exclude": {
    "**/.trunk/*actions/": true,
    "**/.trunk/*logs/": true,
    "**/.trunk/*notifications/": true,
    "**/.trunk/*out/": true,
    "**/.trunk/*plugins/": true
  },
  "files.watcherExclude": {
    "**/.trunk/*actions/": true,
    "**/.trunk/*logs/": true,
    "**/.trunk/*notifications/": true,
    "**/.trunk/*out/": true,
    "**/.trunk/*plugins/": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  },
  "go.formatTool": "gofmt",
  "go.lintTool": "golint",
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "editor.fontSize": 11,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "workbench.colorTheme": "Dracula Theme",
  "editor.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.quickSuggestions": {
    "strings": true
  }
}
```
