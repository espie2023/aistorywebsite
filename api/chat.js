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
        // 检查API密钥
        const apiKey = process.env.KIMI_API_KEY;
        if (!apiKey) {
            res.status(503).json({ error: 'API密钥未配置' });
            return;
        }

        // 获取请求数据
        const { model = 'moonshot-v1-8k', messages, max_tokens = 200, temperature = 0.7 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: '请求格式错误：缺少messages参数' });
            return;
        }

        // 调用Kimi API
        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
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
            console.error('Kimi API错误:', response.status, errorData);
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