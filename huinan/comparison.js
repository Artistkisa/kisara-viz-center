// 多源数据对比脚本
async function loadDataComparison() {
    const container = document.getElementById('comparisonContent');
    if (!container) {
        console.error('comparisonContent element not found');
        return;
    }
    
    try {
        // 尝试从多个源加载数据
        const urls = [
            // 当前目录下的数据源
            'sources/sources-data.json',
            // 上一级目录
            '../huinan/sources/sources-data.json'
        ];
        
        let response = null;
        let lastError = null;
        
        for (const url of urls) {
            try {
                console.log('Trying to fetch:', url);
                response = await fetch(url);
                if (response.ok) {
                    console.log('Success with:', url);
                    break;
                }
            } catch (e) {
                lastError = e;
                console.log('Failed:', url, e.message);
            }
        }
        
        if (!response || !response.ok) {
            throw new Error('无法加载数据，可能是跨域限制');
        }
        
        const data = await response.json();
        console.log('Data loaded:', data.length, 'records');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">暂无多源数据</p>';
            return;
        }
        
        const latest = data[data.length - 1];
        const sources = latest.sources || {};
        const qw = sources.qweather;
        const om = sources.openmeteo;
        
        let html = '';
        
        if (qw && om) {
            const tempDiff = (qw.temp - om.temp).toFixed(1);
            const humidityDiff = (qw.humidity - om.humidity).toFixed(0);
            const dewDiff = (qw.dew - om.dew).toFixed(1);
            const pressureDiff = (qw.pressure - om.pressure).toFixed(0);
            
            const humidityDiffAbs = Math.abs(qw.humidity - om.humidity);
            const dewDiffAbs = Math.abs(qw.dew - om.dew);
            let weightQw, weightOm, confidence;
            
            if (humidityDiffAbs <= 5 && dewDiffAbs <= 1) {
                weightQw = 0.5; weightOm = 0.5; confidence = 'high';
            } else if (humidityDiffAbs <= 10 && dewDiffAbs <= 2) {
                weightQw = 0.7; weightOm = 0.3; confidence = 'medium';
            } else {
                weightQw = 0.85; weightOm = 0.15; confidence = 'low';
            }
            
            const mergedTemp = (qw.temp * weightQw + om.temp * weightOm).toFixed(1);
            const mergedHumidity = (qw.humidity * weightQw + om.humidity * weightOm).toFixed(1);
            const mergedDew = (qw.dew * weightQw + om.dew * weightOm).toFixed(1);
            const mergedPressure = (qw.pressure * weightQw + om.pressure * weightOm).toFixed(0);
            
            const tempDiffColor = Math.abs(tempDiff) > 2 ? '#e94560' : '#4ecca3';
            const humidityDiffColor = Math.abs(humidityDiff) > 5 ? '#e94560' : '#4ecca3';
            const dewDiffColor = Math.abs(dewDiff) > 1 ? '#e94560' : '#4ecca3';
            const pressureDiffColor = Math.abs(pressureDiff) > 5 ? '#e94560' : '#4ecca3';
            
            const confidenceText = confidence === 'high' ? '✓ 高置信度 (差异<5%)' : 
                                  confidence === 'medium' ? '⚠️ 中等置信度 (差异5-10%)' : 
                                  '❌ 低置信度 (差异>10%，和风优先)';
            const confidenceColor = confidence === 'high' ? '#4ecca3' : 
                                   confidence === 'medium' ? '#fac858' : '#e94560';
            
            html = `
            <div style="margin-bottom: 30px;">
                <h4 style="color: #00d9ff; margin-bottom: 15px;">🔄 数据源对比 (${new Date(latest.timestamp).toLocaleString('zh-CN')})</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">指标</th>
                            <th style="color: #91cc75;">🌤️ 和风天气</th>
                            <th style="color: #fac858;">🌍 Open-Meteo</th>
                            <th style="color: #e94560;">📏 差异</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>温度</td>
                            <td>${qw.temp}°C</td>
                            <td>${om.temp}°C</td>
                            <td style="color: ${tempDiffColor};">${tempDiff > 0 ? '+' : ''}${tempDiff}°C</td>
                        </tr>
                        <tr>
                            <td>湿度</td>
                            <td>${qw.humidity}%</td>
                            <td>${om.humidity}%</td>
                            <td style="color: ${humidityDiffColor};">${humidityDiff > 0 ? '+' : ''}${humidityDiff}%</td>
                        </tr>
                        <tr>
                            <td>露点</td>
                            <td>${qw.dew}°C</td>
                            <td>${om.dew}°C</td>
                            <td style="color: ${dewDiffColor};">${dewDiff > 0 ? '+' : ''}${dewDiff}°C</td>
                        </tr>
                        <tr>
                            <td>气压</td>
                            <td>${qw.pressure}hPa</td>
                            <td>${om.pressure}hPa</td>
                            <td style="color: ${pressureDiffColor};">${pressureDiff > 0 ? '+' : ''}${pressureDiff}hPa</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #00d9ff; margin-bottom: 15px;">⚖️ 融合权重计算</h4>
                <div style="background: #1a1a2e; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin-bottom: 10px;"><strong>差异评估：</strong></p>
                    <ul style="margin-left: 20px; color: #888; margin-bottom: 15px;">
                        <li>湿度差异: ${humidityDiffAbs}% ${humidityDiffAbs <= 5 ? '✓ 正常' : humidityDiffAbs <= 10 ? '⚠️ 中等' : '❌ 较大'}</li>
                        <li>露点差异: ${dewDiffAbs}°C ${dewDiffAbs <= 1 ? '✓ 正常' : dewDiffAbs <= 2 ? '⚠️ 中等' : '❌ 较大'}</li>
                    </ul>
                    <p style="margin-bottom: 10px;"><strong>权重分配：</strong></p>
                    <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 15px;">
                        <div style="text-align: center; padding: 10px 20px; background: #16213e; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: bold; color: #91cc75;">${(weightQw * 100).toFixed(0)}%</div>
                            <div style="font-size: 12px; color: #888;">和风天气</div>
                        </div>
                        <div style="text-align: center; padding: 10px 20px; background: #16213e; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: bold; color: #fac858;">${(weightOm * 100).toFixed(0)}%</div>
                            <div style="font-size: 12px; color: #888;">Open-Meteo</div>
                        </div>
                    </div>
                    <p style="text-align: center;">
                        <span style="color: ${confidenceColor};">${confidenceText}</span>
                    </p>
                </div>
            </div>
            
            <div>
                <h4 style="color: #00d9ff; margin-bottom: 15px;">🧮 融合计算公式</h4>
                <div style="background: #1a1a2e; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.8;">
                    <p style="color: #888; margin-bottom: 10px;">// 加权平均公式</p>
                    <p>融合值 = 和风 × ${weightQw} + Open-Meteo × ${weightOm}</p>
                    <br>
                    <p style="color: #667eea;">温度: ${qw.temp} × ${weightQw} + ${om.temp} × ${weightOm} = <strong>${mergedTemp}°C</strong></p>
                    <p style="color: #5470c6;">湿度: ${qw.humidity} × ${weightQw} + ${om.humidity} × ${weightOm} = <strong>${mergedHumidity}%</strong></p>
                    <p style="color: #fac858;">露点: ${qw.dew} × ${weightQw} + ${om.dew} × ${weightOm} = <strong>${mergedDew}°C</strong></p>
                    <p style="color: #00d9ff;">气压: ${qw.pressure} × ${weightQw} + ${om.pressure} × ${weightOm} = <strong>${mergedPressure}hPa</strong></p>
                </div>
            </div>
            `;
        } else if (qw || om) {
            const src = qw || om;
            const name = qw ? '和风天气' : 'Open-Meteo';
            html = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #fac858; margin-bottom: 10px;">⚠️ 单源数据</p>
                <p style="color: #888;">当前仅 ${name} 可用</p>
                <p style="margin-top: 15px;">温度: ${src.temp}°C | 湿度: ${src.humidity}% | 露点: ${src.dew}°C</p>
            </div>
            `;
        } else {
            html = '<p style="text-align: center; color: #888;">暂无数据源数据</p>';
        }
        
        container.innerHTML = html;
        
    } catch (err) {
        container.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <p style="color: #e94560; margin-bottom: 15px;">❌ 加载失败: ${err.message}</p>
            <p style="color: #888; font-size: 13px; margin-bottom: 20px;">
                可能是跨域限制导致无法获取数据源数据<br>
                请直接访问 
                <a href="https://artistkisa.github.io/kisara-viz-center/huinan/sources/sources-data.json" 
                   target="_blank" 
                   style="color: #667eea;">
                   数据源 JSON
                </a>
                查看原始数据
            </p>
            <button onclick="loadDataComparison()" 
                    style="padding: 10px 20px; background: #667eea; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
                🔄 重试加载
            </button>
        </div>
        `;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadDataComparison);
