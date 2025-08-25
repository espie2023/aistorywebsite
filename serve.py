#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import json
import urllib.request

PORT = 8000
# 从环境变量获取API密钥，提高安全性
import os
KIMI_API_KEY = os.environ.get('KIMI_API_KEY', '')
if not KIMI_API_KEY:
    print("警告：未设置KIMI_API_KEY环境变量，API功能将不可用")
    print("请设置环境变量：export KIMI_API_KEY='your_api_key_here'")
KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            try:
                # 检查API密钥是否设置
                if not KIMI_API_KEY:
                    self.send_response(503)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'API密钥未配置'}).encode('utf-8'))
                    return

                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                client_data = json.loads(post_data)

                # 创建到Kimi API的请求
                req = urllib.request.Request(
                    KIMI_API_URL,
                    data=json.dumps(client_data).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {KIMI_API_KEY}'
                    },
                    method='POST'
                )
                
                try:
                    with urllib.request.urlopen(req, timeout=30) as response:
                        response_data = response.read()
                        self.send_response(response.status)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(response_data)
                except urllib.error.HTTPError as e:
                    error_data = e.read().decode('utf-8')
                    self.send_response(e.code)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': f'API错误: {error_data}'}).encode('utf-8'))

            except json.JSONDecodeError as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': '请求格式错误'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': f'服务器错误: {str(e)}'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        # 沿用SimpleHTTPRequestHandler的处理方式来服务静态文件
        super().do_GET()

def start_server():
    # 确保我们从脚本所在的目录提供文件
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"后端服务器已启动: http://localhost:{PORT}")
        print("它现在会安全地处理对Kimi API的请求。")
        print("按 Ctrl+C 停止服务器")
        
        # 在新标签页中打开前端页面
        webbrowser.open(f'http://localhost:{PORT}/index.html')
        
        httpd.serve_forever()

if __name__ == "__main__":
    start_server()
