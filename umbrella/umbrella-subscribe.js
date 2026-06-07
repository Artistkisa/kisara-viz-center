/**
 * 带伞提醒订阅功能
 * 路径: umbrella-subscribe.js
 */

(function() {
    'use strict';
    
    const API_BASE = 'https://www.kisara.art/umbrella';
    
    // 天气图标映射
    const WEATHER_ICONS = {
        sunny: '☀️',
        cloudy: '☁️',
        'rain-light': '🌦️',
        'rain-medium': '🌧️',
        'rain-heavy': '⛈️',
        'rain-extreme': '🌊',
        snow: '❄️',
        fog: '🌫️',
        haze: '😷',
        dust: '🌪️'
    };
    
    // 初始化订阅组件
    function initSubscribe() {
        const container = document.getElementById('umbrella-subscribe-container');
        if (!container) return;
        
        // 检查当前天气状态
        const currentLevel = container.dataset.weatherLevel || 'cloudy';
        const needUmbrella = container.dataset.needUmbrella === 'true';
        
        const icon = WEATHER_ICONS[currentLevel] || '☁️';
        const statusText = needUmbrella ? '☂️ 今天记得带伞' : '✅ 今天不用带伞';
        const statusClass = needUmbrella ? 'alert' : 'safe';
        
        container.innerHTML = `
            <div class="umbrella-subscribe-section ${statusClass}">
                <div class="umbrella-status">
                    <span class="umbrella-status-icon">${icon}</span>
                    <span class="umbrella-status-text">${statusText}</span>
                </div>
                
                <div class="subscribe-title">📧 订阅带伞提醒</div>
                <div class="subscribe-subtitle">当广州有雨时，自动发送邮件提醒到您的邮箱</div>
                
                <form class="subscribe-form" id="umbrella-subscribe-form">
                    <input 
                        type="email" 
                        class="subscribe-input" 
                        id="umbrella-subscribe-email"
                        placeholder="请输入您的邮箱地址" 
                        required
                        autocomplete="email"
                    >
                    <button type="submit" class="subscribe-btn" id="umbrella-subscribe-btn">
                        立即订阅
                    </button>
                </form>
                
                <div class="subscribe-status" id="umbrella-subscribe-status"></div>
                
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
                
                <div class="subscribe-note">
                    💡 每90分钟检查一次 · 4小时内不重复提醒 · 数据保留一年
                </div>
            </div>
        `;
        
        // 绑定表单提交
        const form = document.getElementById('umbrella-subscribe-form');
        form.addEventListener('submit', handleSubscribe);
        
        // 检查是否已订阅（如果本地存储有记录）
        checkSubscriptionStatus();
    }
    
    // 处理订阅
    async function handleSubscribe(e) {
        e.preventDefault();
        
        const email = document.getElementById('umbrella-subscribe-email').value.trim();
        const btn = document.getElementById('umbrella-subscribe-btn');
        
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
            const response = await fetch(`${API_BASE}/subscribe.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=subscribe&email=${encodeURIComponent(email)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                showStatus('✅ ' + data.message, 'success');
                document.getElementById('umbrella-subscribe-email').value = '';
                
                // 保存到本地存储
                localStorage.setItem('umbrella_subscribed_email', email);
                localStorage.setItem('umbrella_subscribed_at', new Date().toISOString());
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
    
    // 检查订阅状态
    async function checkSubscriptionStatus() {
        const email = localStorage.getItem('umbrella_subscribed_email');
        if (!email) return;
        
        try {
            const response = await fetch(`${API_BASE}/subscribe.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=check&email=${encodeURIComponent(email)}`
            });
            
            const data = await response.json();
            
            if (data.success && data.subscribed) {
                // 已订阅，显示提示
                const container = document.querySelector('.umbrella-subscribe-section');
                if (container) {
                    container.classList.add('already-subscribed');
                    
                    const note = document.querySelector('.subscribe-note');
                    if (note) {
                        const safeEmail = email.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
                        note.innerHTML = `✅ 您已订阅 (${safeEmail}) · <a href="${API_BASE}/unsubscribe.php" target="_blank">退订</a>`;
                    }
                }
            } else {
                // 未订阅或已退订，清除本地记录
                localStorage.removeItem('umbrella_subscribed_email');
                localStorage.removeItem('umbrella_subscribed_at');
            }
        } catch (error) {
            console.error('检查订阅状态失败:', error);
        }
    }
    
    // 验证邮箱格式
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // 显示状态信息
    function showStatus(message, type) {
        const status = document.getElementById('umbrella-subscribe-status');
        if (!status) return;
        
        status.textContent = message;
        status.className = 'subscribe-status ' + type;
        
        // 5秒后自动隐藏错误/成功消息
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
