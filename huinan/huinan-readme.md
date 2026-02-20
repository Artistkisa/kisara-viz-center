# 回南天监测数据说明

## 数据文件位置

### 最新数据（推荐使用）
- **路径**: `/data/huinan-data.json`
- **URL**: https://monitor.kisara.info/data/huinan-data.json
- **说明**: 包含最新合并后的回南天监测数据（主服务器 + ECS）

### 历史详细数据
- **路径**: `/data/huinan-detailed.json`
- **URL**: https://monitor.kisara.info/data/huinan-detailed.json
- **说明**: 包含历史记录数组，用于趋势分析

### ECS 原始数据
- **路径**: `/ecs-data/huinan-data.json`
- **URL**: https://monitor.kisara.info/ecs-data/huinan-data.json
- **说明**: 仅包含 ECS 采集的数据

## JSON 数据结构

### huinan-data.json（当前状态）
```json
{
  "humidity": 51,           // 相对湿度 (%)
  "dew": 11,                // 露点温度 (°C)
  "temp": 22,               // 温度 (°C)
  "windDir": 0,             // 风向 (度)
  "windSpeed": 10,          // 风速 (km/h)
  "pressure": 1013,         // 气压 (hPa)
  "humidityChange3h": 0,    // 3小时湿度变化 (%)
  "pressureDrop6h": 0,      // 6小时气压下降 (hPa)
  "coreTrigger": {
    "humidityOK": false,    // 湿度条件满足
    "dewDiffOK": false,     // 温差条件满足
    "humidityTrendOK": true,// 湿度趋势条件满足
    "tempDewDiff": 11,      // 温度-露点温差 (°C)
    "allOK": false          // 所有条件满足
  },
  "confidence": {
    "score": 1,             // 置信度 (0-3)
    "reasons": ["有风流动"] // 触发原因
  },
  "intensity": {
    "level": "none",        // 回南天等级: none/mild/moderate/severe
    "by": "湿度"            // 判定依据
  },
  "updatedAt": "2026-02-20T14:04:24.435318"  // 更新时间 (ISO 8601)
}
```

### huinan-detailed.json（历史记录）
```json
{
  "records": [
    {
      "time": "2026-02-20 14:00:00",  // 记录时间
      "humidity": 51,
      "temp": 22,
      "dew": 11,
      "windDir": 0,
      "windSpeed": 10,
      "pressure": 1013,
      "humidityChange3h": 0,
      "pressureDrop6h": 0,
      "coreTrigger": { ... },
      "confidence": { ... },
      "intensity": { ... },
      "source": "main"  // 数据来源: main(主服务器) / ecs(ECS节点)
    }
  ],
  "events": [],          // 回南天事件记录
  "currentEvent": null   // 当前进行中的事件
}
```

## 数据来源

### 主服务器 (OpenClaw)
- **位置**: 主节点
- **采集频率**: 每小时
- **数据文件**: `/root/.openclaw/workspace/data/huinan-data.json`

### ECS 节点 (阿里云)
- **位置**: 阿里云上海
- **IP**: 47.116.201.2
- **采集频率**: 每小时
- **数据文件**: `/opt/monitor/data/huinan-data.json`

## 数据合并流程

1. **主服务器**采集数据 → 保存到本地
2. **ECS**采集数据 → 推送到 GitHub (`ecs-data/`)
3. **合并脚本** (`merge-huinan-data-v3.py`)：
   - 读取主服务器当前数据
   - 读取 ECS 数据
   - 合并到 `huinan-detailed.json`
   - 生成最新状态 `huinan-data.json`
4. **推送**到 GitHub (`data/` 目录)

## 可视化页面

### 新版 (V3)
- **文件**: `huinan-visualization-v3.html`
- **数据引用**: `../data/huinan-data.json`
- **特点**: 使用 ECharts，支持趋势分析

### 旧版
- **文件**: `huinan-visualization.html`
- **数据引用**: GitHub Raw API
- **状态**: 已标记为旧版，建议迁移到 V3

## 更新频率

- **数据采集**: 每小时
- **数据合并**: 每小时
- **GitHub 推送**: 每小时（ECS）+ 实时（主服务器）

## 注意事项

1. 使用 `data/huinan-data.json` 获取最新数据
2. `ecs-data/huinan-data.json` 仅包含 ECS 数据，可能不是最新
3. `huinan/huinan-data.json` 已废弃，请勿使用

---
最后更新: 2026-02-20
