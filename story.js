const PROXY_API_URL = '/api/chat';

let currentStory = '';
let storyHistory = [];
let storySetup = {};
let currentStep = 0;
const MAX_STEPS = 20;
let storyType = '';
let protagonistType = '';

async function callKimiAPI(prompt) {
    try {
        console.log('正在通过后端代理调用API...');
        const response = await fetch(PROXY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: storyConfig.system_prompt
                    },
                    {
                        role: 'user',
                        content: prompt + "\n\n重要：请严格按照格式要求，只提供2-3个平行的行动选择，每个选择必须是同级别的、互斥的行动。"}
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API响应错误:', response.status, errorData);
            throw new Error(`API错误 ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('API调用成功:', data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling Kimi API:', error);
        if (error.message.includes('API密钥未配置')) {
            return `抱歉，API密钥未配置。请联系管理员设置KIMI_API_KEY环境变量。`;
        } else if (error.message.includes('网络')) {
            return `抱歉，网络连接出现问题。请检查网络连接后重试。`;
        } else {
            return `抱歉，AI暂时无法响应。错误信息：${error.message}`;
        }
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('choices-container').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function displayStory(text) {
    const storyText = document.getElementById('story-text');
    
    // 清理文本格式，保持段落结构
    const cleanText = text.replace(/\n{3,}/g, '\n\n').trim();
    
    // 将换行转换为段落
    const paragraphs = cleanText.split('\n\n');
    storyText.innerHTML = '';
    
    paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
            const p = document.createElement('p');
            p.textContent = paragraph.trim();
            p.style.marginBottom = '1em';
            storyText.appendChild(p);
        }
    });
    
    currentStory = text;
    
    // 滚动到顶部，让用户看到新内容
    storyText.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function parseChoices(text) {
    const lines = text.split('\n');
    const choices = [];
    let currentChoice = '';
    let inChoicesSection = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 检测选择部分的开始
        if (trimmedLine.toLowerCase().includes('选择：') || 
            trimmedLine.toLowerCase().includes('选择：') ||
            trimmedLine.toLowerCase().includes('请选择：')) {
            inChoicesSection = true;
            continue;
        }
        
        // 在选择部分中寻找编号选项
        if (inChoicesSection && trimmedLine.match(/^\d+\./)) {
            if (currentChoice) {
                choices.push(currentChoice.trim());
            }
            currentChoice = trimmedLine;
        } else if (inChoicesSection && trimmedLine && currentChoice && trimmedLine.match(/^[A-Z]\./)) {
            // 如果遇到字母选项，先保存当前选项
            choices.push(currentChoice.trim());
            currentChoice = trimmedLine;
        } else if (inChoicesSection && trimmedLine && currentChoice && !trimmedLine.match(/^\d+\./)) {
            // 续接上一行的描述，但只在选择部分内
            if (trimmedLine.length > 0 && !trimmedLine.startsWith('故事')) {
                currentChoice += ' ' + trimmedLine;
            }
        }
    }
    
    if (currentChoice) {
        choices.push(currentChoice.trim());
    }
    
    // 限制为最多3个选择，确保平行结构
    return choices.slice(0, 3);
}

function displayChoices(choices) {
    const choicesContainer = document.getElementById('choices-container');
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    // 只显示有效的2-3个平行选项
    const validChoices = choices.slice(0, 3);
    
    validChoices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        
        // 清理和格式化选项文本
        let cleanChoice = choice.replace(/^(\d+|[A-Z])\./, '').trim();
        cleanChoice = cleanChoice.replace(/\s+/g, ' '); // 清理多余空格
        
        // 创建清晰的选项结构
        button.innerHTML = `<strong>${index + 1}.</strong> ${cleanChoice}`;
        
        button.onclick = () => makeChoice(cleanChoice);
        choicesDiv.appendChild(button);
    });
    
    choicesContainer.style.display = 'block';
}

async function generateStorySetup() {
    showLoading();
    
    storyType = document.getElementById('story-type').value;
    protagonistType = document.getElementById('protagonist-type').value;
    
    const prompt = storyConfig.story_setup_prompt
        .replace('${storyType}', storyType)
        .replace('${protagonistType}', protagonistType);
    
    const response = await callKimiAPI(prompt);
    
    // 解析故事设定
    const sections = response.split('\n\n');
    let summary = '';
    let characters = [];
    let endings = [];
    
    sections.forEach(section => {
        if (section.includes('【故事大纲】')) {
            summary = section.replace('【故事大纲】', '').trim();
        } else if (section.includes('【主要人物】')) {
            const charLines = section.split('\n').slice(1);
            characters = charLines.filter(line => line.trim() && line.includes('：'));
        } else if (section.includes('【可能结局】')) {
            const endingLines = section.split('\n').slice(1);
            endings = endingLines.filter(line => line.trim() && line.includes('：'));
        }
    });
    
    // 显示故事设定
    document.getElementById('summary-text').textContent = summary;
    
    const charactersList = document.getElementById('characters');
    charactersList.innerHTML = '';
    characters.forEach(char => {
        const li = document.createElement('li');
        li.textContent = char.trim();
        charactersList.appendChild(li);
    });
    
    storySetup = { summary, characters, endings, storyType, protagonistType };
    
    document.getElementById('start-story-btn').style.display = 'inline-block';
    hideLoading();
}

async function startStory() {
    showLoading();
    
    document.getElementById('setup-container').style.display = 'none';
    document.getElementById('story-container').style.display = 'block';
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'inline-block';
    
    currentStep = 0;
    updateProgress();
    
    const prompt = `开始一个${storySetup.storyType}故事，主角是一个${storySetup.protagonistType}。
    
    故事大纲：${storySetup.summary}
    
    这是一个将在${MAX_STEPS}步内完成的紧凑故事。请从故事开头开始，提供2-3个初始选择。
    
    重要：请严格控制故事长度，确保能在${MAX_STEPS}步内完成，每个阶段都要推进故事发展。`;
    
    const response = await callKimiAPI(prompt);
    displayStory(response);
    
    const choices = parseChoices(response);
    if (choices.length > 0) {
        displayChoices(choices);
    }
    
    hideLoading();
    
    storyHistory = [response];
}

async function makeChoice(choice) {
    showLoading();
    
    const prompt = `继续故事。之前的故事：${currentStory}\n\n读者选择：${choice}\n\n请继续故事，并提供新的2-3个选择。`;
    
    const response = await callKimiAPI(prompt);
    displayStory(response);
    
    const choices = parseChoices(response);
    if (choices.length > 0) {
        displayChoices(choices);
    } else {
        document.getElementById('choices-container').style.display = 'none';
        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'choice-btn';
        restartBtn.textContent = '故事结束 - 重新开始';
        restartBtn.onclick = resetStory;
        choicesDiv.appendChild(restartBtn);
        choicesContainer.style.display = 'block';
    }
    
    hideLoading();
    currentStep++;
    updateProgress();
    storyHistory.push(response);
    
    // 检查是否达到最大步数
    if (currentStep >= MAX_STEPS) {
        setTimeout(() => {
            endStory();
        }, 1000);
    }
}

function updateProgress() {
    const progressText = document.getElementById('progress');
    const progressFill = document.getElementById('progress-fill');
    
    progressText.textContent = `${currentStep}/${MAX_STEPS}`;
    const percentage = (currentStep / MAX_STEPS) * 100;
    progressFill.style.width = `${percentage}%`;
    
    // 根据进度改变颜色
    if (percentage > 75) {
        progressFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa500)';
    } else if (percentage > 50) {
        progressFill.style.background = 'linear-gradient(90deg, #ffa500, #667eea)';
    }
}

async function endStory() {
    showLoading();
    
    const prompt = `故事即将结束。当前故事发展：${currentStory}
    
    请提供一个完整的结局，总结主角的命运，并在结尾处标明这是故事的最终结局。`;
    
    const response = await callKimiAPI(prompt);
    displayStory(response + "\n\n🎭 故事完結 🎭");
    
    document.getElementById('choices-container').style.display = 'none';
    
    // 添加重新开始按钮
    const choicesDiv = document.getElementById('choices');
    const choicesContainer = document.getElementById('choices-container');
    choicesDiv.innerHTML = '';
    const restartBtn = document.createElement('button');
    restartBtn.className = 'choice-btn';
    restartBtn.textContent = '🔄 重新开始新故事';
    restartBtn.onclick = () => {
        document.getElementById('setup-container').style.display = 'block';
        document.getElementById('story-container').style.display = 'none';
        resetStory();
    };
    choicesDiv.appendChild(restartBtn);
    choicesContainer.style.display = 'block';
    
    hideLoading();
}

function resetStory() {
    currentStory = '';
    storyHistory = [];
    storySetup = {};
    currentStep = 0;
    storyType = '';
    protagonistType = '';
    
    document.getElementById('setup-container').style.display = 'block';
    document.getElementById('story-container').style.display = 'none';
    document.getElementById('start-story-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('choices-container').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
    
// 重置设定界面
    document.getElementById('summary-text').textContent = '选择一个故事类型和主角身份，生成故事大纲...';
    document.getElementById('characters').innerHTML = '';
}

// 键盘支持
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '3') {
        const choices = document.querySelectorAll('.choice-btn');
        const index = parseInt(e.key) - 1;
        if (choices[index]) {
            choices[index].click();
        }
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI互动故事网站已加载');
    console.log('API请求现在通过安全后端进行。');
});
