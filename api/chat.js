const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理OPTIONS请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只处理POST请求
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // 获取OpenAI兼容API配置
        const apiKey = process.env.OPENAI_API_KEY;
        const apiBaseUrl = process.env.OPENAI_API_BASE || 'https://api.moonshot.cn/v1';
        const defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'moonshot-v1-8k';
        
        if (!apiKey) {
            res.status(503).json({ error: 'API密钥未配置，请设置 OPENAI_API_KEY 环境变量' });
            return;
        }

        // 获取请求数据
        const { model = defaultModel, messages, max_tokens = 200, temperature = 0.7 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: '请求格式错误：缺少messages参数' });
            return;
        }

        // 构建API端点URL
        const apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/chat/completions`;
        
        // 调用OpenAI兼容API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens,
                temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('AI API错误:', response.status, errorData);
            res.status(response.status).json({ error: `API错误: ${errorData}` });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({ error: `服务器错误: ${error.message}` });
    }
};