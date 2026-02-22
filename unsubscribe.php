<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>取消订阅 - 回南天预警</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }
        .container {
            background: rgba(255,255,255,0.05);
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
        }
        h1 { margin-bottom: 20px; }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #e74c3c;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #64ffda;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 取消订阅</h1>
        <p>不再接收回南天预警邮件</p>
        <form id="unsubscribeForm">
            <input type="email" id="email" placeholder="输入您的邮箱" required>
            <button type="submit">取消订阅</button>
        </form>
        <a href="https://artistkisa.github.io/kisara-viz-center/huinan/huinan-visualization-v5.html" class="back-link">返回监测页面</a>
        <p id="message" style="margin-top: 20px;"></p>
    </div>
    
    <script>
        document.getElementById('unsubscribeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const response = await fetch('https://www.kisara.art/subscribe.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `email=${encodeURIComponent(email)}&action=unsubscribe`
            });
            const result = await response.json();
            document.getElementById('message').textContent = result.message;
        });
    </script>
</body>
</html>
