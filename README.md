# 围棋对战平台 - Go Battle Platform

## 项目概述

这是一个专业的围棋对弈平台第一迭代版本，使用 Next.js + React + TypeScript + Tailwind CSS 构建，支持完整的围棋规则、实时目数计算、玩家管理与统计功能。

## 🎯 核心功能

### 1. 棋盘与对弈系统
- ✅ 支持 13路 (13x13, 169个交点) 和 19路 (19x19, 361个交点) 棋盘
- ✅ 完整的围棋规则实现：落子合法性校验、提子逻辑、气的计算
- ✅ 悔棋功能支持
- ✅ 天元和星位标识显示
- ✅ 响应式棋盘设计，支持移动端操作

### 2. 玩家管理系统
- ✅ 本地玩家列表展示
- ✅ 新增玩家功能（仅需输入昵称）
- ✅ 玩家统计信息：昵称、累计胜负、总对局时长
- ✅ 详细的玩家档案页面

### 3. 对局管理
- ✅ 对局前玩家选择界面
- ✅ 棋盘规格选择（13路/19路）
- ✅ 规则类型选择（吃子游戏/标准规则）
- ✅ 游戏状态管理和自动保存

### 4. 实时目数计算
- ✅ 实时显示黑白双方地盘目数估算
- ✅ 区分活子、死子、空点显示
- ✅ 手动刷新目数功能
- ✅ 智能地盘分析算法

### 5. 数据存储
- ✅ SQLite 数据库存储
- ✅ Players表：player_id, nickname, win_count, lose_count, total_time
- ✅ Games表：game_id, player1_id, player2_id, board_size, rule_type, winner_id, duration, date_time, record

## 🛠️ 技术栈

- **前端框架**: Next.js 15.4.0 (App Router)
- **UI 库**: React 19.1.0
- **样式**: Tailwind CSS 4.1.7
- **语言**: TypeScript 5.8.3
- **数据库**: SQLite + Drizzle ORM
- **组件库**: Radix UI + shadcn/ui
- **构建工具**: Turbopack

## 🚀 快速开始

### 环境要求
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd go-battle-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **设置数据库**
   ```bash
   npm run db:generate
   npm run db:setup
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 📁 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   │   ├── players/       # 玩家管理 API
│   │   └── games/         # 游戏管理 API
│   ├── game/              # 游戏对弈页面
│   ├── players/           # 玩家管理页面
│   ├── setup/             # 游戏设置页面
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/               # UI 组件库
│       ├── board.tsx     # 围棋棋盘组件
│       ├── game-info.tsx # 游戏信息面板
│       └── ...
├── lib/                   # 核心库文件
│   ├── go/               # 围棋游戏逻辑
│   │   ├── board.ts      # 棋盘逻辑
│   │   ├── game.ts       # 游戏逻辑
│   │   ├── territory.ts  # 地盘计算
│   │   └── types.ts      # 类型定义
│   └── db/               # 数据库相关
│       ├── schema.ts     # 数据库模式
│       ├── queries.ts    # 查询函数
│       └── drizzle.ts    # 数据库连接
└── ...
```

## 🎮 使用指南

### 1. 添加玩家
1. 访问主页，点击"玩家管理"
2. 输入玩家昵称，点击"添加"
3. 玩家将出现在列表中

### 2. 开始游戏
1. 点击"开始对局"进入游戏设置页面
2. 选择黑棋和白棋玩家
3. 选择棋盘规格（13路或19路）
4. 选择规则类型（标准规则或吃子游戏）
5. 点击"开始对局"

### 3. 进行对弈
1. 黑棋先行，点击棋盘交点落子
2. 系统自动切换到白棋回合
3. 可以使用"弃权"、"悔棋"功能
4. 实时查看目数估算
5. 两次连续弃权结束游戏

### 4. 查看统计
1. 在玩家管理页面查看总体统计
2. 点击玩家详情查看个人数据
3. 查看历史对局记录

## 🧪 测试

项目包含完整的围棋逻辑测试：

```bash
# 运行基础逻辑测试
npx tsx lib/go/test-basic.ts
```

测试覆盖：
- ✅ 基础棋盘操作
- ✅ 提子逻辑验证
- ✅ 游戏流程测试
- ✅ 计分系统测试

## 📊 API 文档

### 玩家 API

#### 获取所有玩家
```http
GET /api/players
```

#### 创建新玩家
```http
POST /api/players
Content-Type: application/json

{
  \"nickname\": \"玩家昵称\"
}
```

#### 获取玩家详情
```http
GET /api/players/{id}
```

### 游戏 API

#### 获取所有游戏
```http
GET /api/games
```

#### 创建新游戏
```http
POST /api/games
Content-Type: application/json

{
  \"player1Id\": 1,
  \"player2Id\": 2,
  \"boardSize\": 19,
  \"ruleType\": \"standard\"
}
```

#### 完成游戏
```http
PUT /api/games
Content-Type: application/json

{
  \"gameId\": 1,
  \"winnerId\": 1,
  \"blackScore\": 50,
  \"whiteScore\": 45,
  \"gameRecord\": \"B[aa];W[bb];\",
  \"duration\": 600,
  \"player1Id\": 1,
  \"player2Id\": 2
}
```

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 数据库相关
npm run db:generate    # 生成数据库迁移
npm run db:migrate     # 执行数据库迁移
npm run db:setup       # 初始化数据库
npm run db:studio      # 打开数据库管理界面
```

## 🎯 验收标准

### ✅ 已完成功能

1. **流畅的棋盘操作体验**
   - 响应式设计，支持桌面和移动端
   - 实时石子预览和悬停效果
   - 清晰的星位和天元标识

2. **准确的围棋规则实现**
   - 完整的落子合法性验证
   - 精确的提子和气的计算
   - 劫争检测和禁着点处理

3. **实时目数估算准确性**
   - 智能地盘识别算法
   - 实时计分显示
   - 手动刷新功能

4. **完整的对局数据统计入库**
   - 自动保存游戏记录
   - 玩家统计实时更新
   - 详细的历史记录查询

## 🚧 已知限制

1. **单机版本**: 当前版本为单机对弈，不支持网络对战
2. **简化AI**: 没有内置围棋AI，需要两名真人玩家
3. **基础计分**: 地盘计算使用简化算法，可能与专业软件有细微差异

## 🛣️ 未来规划

1. **网络对战**: 支持在线多人对弈
2. **AI 对手**: 集成围棋AI引擎
3. **棋谱分析**: 添加对局复盘和分析功能
4. **排位系统**: 实现段位和积分系统
5. **社交功能**: 好友系统和对局观战

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 开发团队

- **项目架构**: Next.js + TypeScript + Tailwind CSS
- **围棋逻辑**: 完整的Go游戏规则实现
- **数据库设计**: SQLite + Drizzle ORM
- **UI/UX设计**: 现代化响应式界面

---

**享受围棋对弈的乐趣！** 🎋