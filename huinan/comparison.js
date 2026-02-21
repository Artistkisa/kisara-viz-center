// 多源数据对比脚本 - 三源版本
async function loadDataComparison() {
    const container = document.getElementById('comparisonContent');
    if (!container) return;
    
    try {
        const response = await fetch('sources/sources-data.json');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">暂无多源数据</p>';
            return;
        }
        
        const latest = data[data.length - 1];
        const sources = latest.sources || {};
        const qw = sources.qweather;
        const om = sources.openmeteo;
        const yr = sources.yrno;
        
        let html = '';
        
        if (qw && om) {
            // 计算差异
            const tempDiff = (qw.temp - om.temp).toFixed(1);
            const humidityDiff = (qw.humidity - om.humidity).toFixed(0);
            const dewDiff = (qw.dew - om.dew).toFixed(1);
            const pressureDiff = (qw.pressure - om.pressure).toFixed(0);
            
            const humidityDiffAbs = Math.abs(qw.humidity - om.humidity);
            const dewDiffAbs = Math.abs(qw.dew - om.dew);
            
            // 判断是否有冲突
            const conflict = humidityDiffAbs > 10 || dewDiffAbs > 2;
            
            // 三源气压差异
            let yrPressureDiff = null;
            let yrUsed = false;
            if (yr && !conflict) {
                yrPressureDiff = Math.max(
                    Math.abs(qw.pressure - yr.pressure),
                    Math.abs(om.pressure - yr.pressure),
                    Math.abs(qw.pressure - om.pressure)
                );
                yrUsed = yrPressureDiff < 10;
            }
            
            // 权重显示
            const qwWeight = conflict ? 60 : 70;
            const omWeight = conflict ? 40 : 30;
            const yrWeight = yrUsed ? (yrPressureDiff < 5 ? 20 : 10) : 0;
            
            html = `
            <div style="margin-bottom: 30px;">
                <h4 style="color: #00d9ff; margin-bottom: 15px;">🔄 三源数据对比 (${new Date(latest.timestamp).toLocaleString('zh-CN')})</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">指标</th>
                            <th style="color: #91cc75;">🌤️ 和风 70%</th>
                            <th style="color: #fac858;">🌍 OM 30%</th>
                            ${yr ? '<th style="color: #00d9ff;">🇳🇴 yr.no 校验</th>' : ''}
                            <th style="color: #e94560;">差异</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>温度</td>
                            <td>${qw.temp}°C</td>
                            <td>${om.temp}°C</td>
                            ${yr ? `<td>${yr.temp}°C</td>` : ''}
                            <td style="color: ${Math.abs(tempDiff) > 2 ? '#e94560' : '#4ecca3'};">${tempDiff > 0 ? '+' : ''}${tempDiff}°C</td>
                        </tr>
                        <tr>
                            <td>湿度</td>
                            <td>${qw.humidity}%</td>
                            <td>${om.humidity}%</td>
                            ${yr ? `<td>${yr.humidity}%</td>` : ''}
                            <td style="color: ${humidityDiffAbs > 5 ? '#e94560' : '#4ecca3'};">${humidityDiff > 0 ? '+' : ''}${humidityDiff}%</td>
                        </tr>
                        <tr>
                            <td>露点</td>
                            <td>${qw.dew}°C</td>
                            <td>${om.dew}°C</td>
                            ${yr ? '<td style="color: #888;">-</td>' : ''}
                            <td style="color: ${dewDiffAbs > 1 ? '#e94560' : '#4ecca3'};">${dewDiff > 0 ? '+' : ''}${dewDiff}°C</td>
                        </tr>
                        <tr>
                            <td>气压</td>
                            <td>${qw.pressure}hPa</td>
                            <td>${om.pressure}hPa</td>
                            ${yr ? `<td>${yr.pressure}hPa</td>` : ''}
                            <td style="color: ${Math.abs(pressureDiff) > 5 ? '#e94560' : '#4ecca3'};">${pressureDiff > 0 ? '+' : ''}${pressureDiff}hPa</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="color: #00d9ff; margin-bottom: 15px;">⚖️ 融合权重</h4>
                <div style="background: #1a1a2e; padding: 15px; border-radius: 8px;">
                    <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 15px;">
                        <div style="text-align: center; padding: 10px 20px; background: #16213e; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: bold; color: #91cc75;">${qwWeight}%</div>
                            <div style="font-size: 12px; color: #888;">和风天气</div>
                            <div style="font-size: 10px; color: #666;">主源</div>
                        </div>
                        <div style="text-align: center; padding: 10px 20px; background: #16213e; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: bold; color: #fac858;">${omWeight}%</div>
                            <div style="font-size: 12px; color: #888;">Open-Meteo</div>
                            <div style="font-size: 10px; color: #666;">次源</div>
                        </div>
                        ${yr ? `
                        <div style="text-align: center; padding: 10px 20px; background: #16213e; border-radius: 6px; ${!yrUsed ? 'opacity: 0.5;' : ''}">
                            <div style="font-size: 24px; font-weight: bold; color: #00d9ff;">${yrWeight > 0 ? yrWeight + '%' : '-'}</div>
                            <div style="font-size: 12px; color: #888;">yr.no</div>
                            <div style="font-size: 10px; color: #666;">${yrUsed ? '气压校验' : '未参与'}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <p style="text-align: center; margin-bottom: 10px;">
                        <span style="color: ${conflict ? '#e94560' : '#4ecca3'};">
                            ${conflict ? '⚠️ 主源冲突（湿度/露点差异大）' : '✓ 主源一致'}
                        </span>
                    </p>
                    
                    ${yr && yrPressureDiff !== null ? `
                    <p style="text-align: center; font-size: 12px; color: #888;">
                        三源气压差异: ${yrPressureDiff.toFixed(1)}hPa 
                        ${yrPressureDiff < 5 ? '✓ 一致' : yrPressureDiff < 10 ? '⚠️ 轻微差异' : '❌ 差异较大'}
                    </p>
                    ` : ''}
                </div>
            </div>
            
            <div>
                <h4 style="color: #00d9ff; margin-bottom: 15px;">🧮 融合结果</h4>
                <div style="background: #1a1a2e; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.8;">
                    <p style="color: #667eea;">温度: ${qw.temp} × ${qwWeight/100} + ${om.temp} × ${omWeight/100} = <strong>${(qw.temp * qwWeight/100 + om.temp * omWeight/100).toFixed(1)}°C</strong></p>
                    <p style="color: #5470c6;">湿度: ${qw.humidity} × ${qwWeight/100} + ${om.humidity} × ${omWeight/100} = <strong>${(qw.humidity * qwWeight/100 + om.humidity * omWeight/100).toFixed(1)}%</strong></p>
                    <p style="color: #fac858;">露点: ${qw.dew} × ${qwWeight/100} + ${om.dew} × ${omWeight/100} = <strong>${(qw.dew * qwWeight/100 + om.dew * omWeight/100).toFixed(1)}°C</strong></p>
                    ${yrUsed ? `
                    <p style="color: #00d9ff;">气压: ${qw.pressure} × ${(100-yrWeight-omWeight)/100} + ${om.pressure} × ${omWeight/100} + ${yr.pressure} × ${yrWeight/100} = <strong>${(qw.pressure * (100-yrWeight-omWeight)/100 + om.pressure * omWeight/100 + yr.pressure * yrWeight/100).toFixed(1)}hPa</strong></p>
                    ` : `
                    <p style="color: #00d9ff;">气压: ${qw.pressure} × ${qwWeight/100} + ${om.pressure} × ${omWeight/100} = <strong>${(qw.pressure * qwWeight/100 + om.pressure * omWeight/100).toFixed(1)}hPa</strong></p>
                    `}
                </div>
            </div>
            `;
        } else {
            html = '<p style="text-align: center; color: #888;">数据源不完整</p>';
        }
        
        container.innerHTML = html;
        
    } catch (err) {
        container.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <p style="color: #e94560; margin-bottom: 15px;">❌ 加载失败: ${err.message}</p>
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
