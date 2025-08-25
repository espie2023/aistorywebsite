# AI互动故事网站

这是一个基于Kimi API的极简互动故事网站，灵感来自deepnovel.net/judgment。

## 功能特点

- 🎭 基于AI的动态故事生成
- 🎯 交互式选择系统
- 📱 响应式设计
- ⌨️ 键盘快捷键支持（1-3选择选项）
- 🎨 极简美观的界面

## 文件结构

```
├── index.html          # 主页面
├── story.js           # 核心逻辑和Kimi API集成
├── style.css          # 样式表
├── story.config.js    # 配置
├── api/
│   └── chat.js       # Vercel serverless API函数
├── vercel.json       # Vercel配置
├── package.json      # Node.js依赖
├── serve.py          # Python本地服务器（已弃用）
├── test.html         # API测试页面
├── DEPLOYMENT.md     # 部署指南
└── README.md         # 说明文档
```

## 快速开始

### 本地运行

1. **获取Kimi API密钥**
   - 访问 [Moonshot AI](https://platform.moonshot.cn/)
   - 注册账号并获取API密钥

2. **设置环境变量**
   ```bash
   export KIMI_API_KEY='your_api_key_here'
   ```

3. **运行本地服务器**
   ```bash
   python serve.py
   # 或
   python -m http.server 8000
   # 或
   npx serve .
   ```

### Vercel 部署

1. **一键部署**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-interactive-story&env=KIMI_API_KEY)

2. **手动部署**
   查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细步骤。

## 使用方法

1. 点击"开始故事"按钮开始你的冒险
2. 阅读AI生成的故事情节
3. 从提供的选项中选择你的行动
4. 使用键盘数字键1-3快速选择选项
5. 点击"重新开始"可以随时重置故事

## 自定义配置

在 `story.js` 中可以调整以下参数：

- **模型选择**：修改 `model` 参数（如 `moonshot-v1-8k`）
- **故事风格**：修改系统提示词中的描述
- **响应长度**：调整 `max_tokens` 参数
- **创意程度**：调整 `temperature` 参数（0-1之间）

## 注意事项

- 请确保你的网络可以访问Kimi API
- API调用可能会产生费用，请合理使用
- 建议添加错误处理和重试机制以获得更好的用户体验

## 浏览器兼容性

支持所有现代浏览器（Chrome, Firefox, Safari, Edge）。

## 许可证

MIT License - 可自由使用和修改。