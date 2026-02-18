# 🌐 Kisara 可视化中心

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://artistkisa.github.io/kisara-viz-center/)

个人数据可视化仪表盘，实时展示台风监控、空气质量、网站运行状态等数据。

## 📊 可视化项目

| 项目 | 描述 | 更新频率 |
|------|------|----------|
| 🌀 [台风监控](./typhoon/) | 实时台风追踪、路径预报、风圈半径可视化 | 实时 |
| 🌫️ [空气质量](./aqi/) | 广州 AQI、PM2.5、紫外线指数监测 | 每2小时 |
| 🌐 [网站监控](./website/) | Kisara 主站和论坛可用率、响应时间 | 每30分钟 |
| 📋 [推送日志](./logs/) | GitHub Pages 部署记录和统计 | 实时 |

## 🚀 技术栈

- **前端**: HTML5 + CSS3 + Chart.js
- **数据源**: 和风天气 API、自定义监控脚本
- **部署**: GitHub Pages
- **自动化**: Python + Node.js + Cron

## 📁 项目结构

```
kisara-viz-center/
├── index.html              # 主页入口
├── favicon.svg             # 网站图标
├── typhoon/                # 台风可视化
│   └── *.html
├── aqi/                    # 空气质量可视化
│   └── aqi-visualization.html
├── website/                # 网站监控可视化
│   └── website-visualization.html
└── logs/                   # 推送日志
    └── push-log-visualization.html
```

## 🔧 自动化推送

所有可视化页面通过统一的推送脚本自动部署：

- **API 优先**: GitHub REST API（10次重试）- 更快更稳定
- **Git 备用**: 传统 Git 方式（20次重试）- API 失败时自动切换
- **日志记录**: 每次推送自动记录到[日志页面](./logs/)
- **自动更新**: 推送成功后自动刷新日志页面

```
推送流程: API → (失败) → Git → (失败) → 记录日志
                    ↓
              推送成功 → 自动更新日志页面
```

## 📝 相关仓库

- 监控脚本: [OpenClaw Workspace](https://github.com/Artistkisa/openclaw-workspace)
- 个人主页: [kisara.art](https://kisara.art)

---

© 2026 Kisara. All rights reserved.
