// 回南天订阅功能
(function() {
    'use strict';
    
    const ZBLOG_API = 'https://www.kisara.art';
    
    // 初始化订阅组件
    function initSubscribe() {
        const container = document.getElementById('subscribe-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="subscribe-section">
                <div class="subscribe-title">📧 订阅回南天预警</div>
                <div class="subscribe-subtitle">当广州出现回南天风险时，自动发送邮件提醒到您的邮箱</div>
                
                <form class="subscribe-form" id="subscribe-form">
                    <input 
                        type="email" 
                        class="subscribe-input" 
                        id="subscribe-email"
                        placeholder="请输入您的邮箱地址" 
                        required
                    >
                    <button type="submit" class="subscribe-btn" id="subscribe-btn">
                        立即订阅
                    </button>
                </form>
                
                <div class="subscribe-status" id="subscribe-status"></div>
                
                <div class="subscribe-features">
                    <div class="subscribe-feature">
                        <span class="subscribe-feature-icon">🎯</span>
                        <span>精准预警</span>
                    </div>
                    <div class="subscribe-feature">
                        <span class="subscribe-feature-icon">🔔</span>
                        <span>即时通知</span>
                    </div>
                    <div class="subscribe-feature">
                        <span class="subscribe-feature-icon">🚫</span>
                        <span>随时退订</span>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定表单提交
        const form = document.getElementById('subscribe-form');
        form.addEventListener('submit', handleSubscribe);
    }
    
    // 处理订阅
    async function handleSubscribe(e) {
        e.preventDefault();
        
        const email = document.getElementById('subscribe-email').value.trim();
        const btn = document.getElementById('subscribe-btn');
        const status = document.getElementById('subscribe-status');
        
        // 验证邮箱
        if (!isValidEmail(email)) {
            showStatus('请输入有效的邮箱地址', 'error');
            return;
        }
        
        // 显示加载状态
        btn.disabled = true;
        btn.textContent = '提交中...';
        showStatus('正在处理...', 'loading');
        
        try {
            const response = await fetch(`${ZBLOG_API}/subscribe.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&action=subscribe`
            });
            
            const data = await response.json();
            
            if (data.success) {
                showStatus('✅ 订阅成功！当广州出现回南天风险时，您将收到邮件提醒', 'success');
                document.getElementById('subscribe-email').value = '';
            } else {
                showStatus(data.error || '订阅失败，请稍后重试', 'error');
            }
        } catch (error) {
            console.error('订阅请求失败:', error);
            showStatus('网络错误，请检查网络连接后重试', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '立即订阅';
        }
    }
    
    // 验证邮箱格式
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // 显示状态信息
    function showStatus(message, type) {
        const status = document.getElementById('subscribe-status');
        status.textContent = message;
        status.className = 'subscribe-status ' + type;
        
        // 3秒后自动隐藏错误/成功消息
        if (type !== 'loading') {
            setTimeout(() => {
                status.className = 'subscribe-status';
            }, 5000);
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSubscribe);
    } else {
        initSubscribe();
    }
})();
