# 部署到 Vercel 指南

本指南将帮助你把AI互动故事网站部署到Vercel。

## 准备工作

### 1. 安装 Vercel CLI (如果尚未安装)
```bash
npm i -g vercel
```

### 2. 获取 Kimi API 密钥
- 访问 [Moonshot AI](https://platform.moonshot.cn/)
- 注册账号并获取API密钥

## 部署步骤

### 方法一：使用Vercel CLI

1. **登录Vercel**
```bash
vercel login
```

2. **设置环境变量**
```bash
vercel env add KIMI_API_KEY production
# 输入你的Kimi API密钥
```

3. **部署**
```bash
vercel --prod
```

### 方法二：使用Vercel Dashboard

1. **推送代码到GitHub**
```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **连接GitHub仓库到Vercel**
- 登录 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "New Project"
- 导入你的GitHub仓库
- 在环境变量中添加 `KIMI_API_KEY`
- 点击 "Deploy"

## 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式表
├── story.js            # 前端逻辑
├── story.config.js     # 配置
├── api/
│   └── chat.js         # Vercel serverless API函数
├── vercel.json         # Vercel配置
├── package.json        # Node.js依赖
├── DEPLOYMENT.md       # 本部署指南
└── README.md           # 项目说明
```

## 环境变量设置

在Vercel中设置以下环境变量：
- `KIMI_API_KEY`: 你的Kimi API密钥

### 设置方法

**通过CLI：**
```bash
vercel env add KIMI_API_KEY production
```

**通过Vercel Dashboard：**
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加 `KIMI_API_KEY` 和你的API密钥

## 验证部署

部署完成后，访问你的网站：
- 主应用：https://your-project.vercel.app
- API测试页面：https://your-project.vercel.app/test.html

## 故障排除

### 常见问题

1. **API密钥未配置**
   - 确认已在Vercel环境变量中设置了 `KIMI_API_KEY`

2. **CORS错误**
   - 检查API函数是否正确设置了CORS头
   - 确认前端请求的API端点是 `/api/chat`

3. **部署失败**
   - 检查 `vercel.json` 配置是否正确
   - 确认所有必需文件已提交

4. **API调用失败**
   - 使用测试页面 https://your-project.vercel.app/test.html 进行调试
   - 检查Vercel函数日志

### 调试命令

```bash
# 本地测试
vercel dev

# 查看日志
vercel logs

# 重新部署
vercel --prod --force
```

## 自定义域名

1. 在Vercel Dashboard中进入项目设置
2. 点击 "Domains"
3. 添加你的自定义域名

## 后续更新

每次推送代码到GitHub主分支，Vercel会自动重新部署。

或者手动部署：
```bash
vercel --prod
```

## 注意事项

- 确保API密钥安全，不要提交到代码库
- 监控API使用量，避免超出配额
- 定期检查Kimi API的状态