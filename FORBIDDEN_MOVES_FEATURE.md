# 围棋禁入点鼠标样式功能

## 功能概述

为围棋棋盘添加了禁入点（非法落子位置）的鼠标hover样式，提供更好的用户体验。

## 实现的功能

### 1. 禁入点检测
- **已占位置**: 已有棋子的位置
- **自杀落子**: 落子后该子或该子所在的己方棋群无气（除非能吃掉对方棋子）
- **劫争违例**: 违反劫争规则的落子（不能立即回提）

### 2. 视觉反馈

#### 鼠标光标样式
- **合法位置**: `cursor-crosshair` (十字准星)
- **禁入点**: `cursor-not-allowed` (禁止符号)
- **非游戏状态**: `cursor-default` (默认箭头)

#### hover预览效果
- **合法位置**: 半透明的预览棋子(当前玩家颜色)
- **禁入点**: 红色半透明圆圈 + 白色"✗"标记
- **已占位置**: 无预览效果

## 技术实现

### 1. 组件接口扩展
```typescript
interface GoBoardProps {
  // ... 其他属性
  onCheckLegalMove?: (position: Position) => boolean;
}
```

### 2. 状态管理
```typescript
const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
const [isHoveredPositionLegal, setIsHoveredPositionLegal] = useState<boolean>(true);
```

### 3. 鼠标事件处理
- 在`handleMouseMove`中检查位置合法性
- 动态设置光标样式和预览效果
- 在`handleMouseLeave`中重置状态

### 4. 样式应用
```typescript
className={cn(
  "relative bg-amber-100 border-4 border-amber-800",
  !isGameActive ? "cursor-default" :
  hoveredPosition && !isHoveredPositionLegal ? "cursor-not-allowed" :
  "cursor-crosshair"
)}
```

## 围棋规则实现

### 1. 自杀检测
```typescript
// 检查落子后是否有气
const playedGroup = this.getGroup(pos);
const playedLiberties = this.countLiberties(playedGroup);

// 自杀是非法的，除非能吃掉对方棋子
if (playedLiberties === 0 && capturedGroups.length === 0) {
  return false;
}
```

### 2. 劫争检测
```typescript
// 检查是否回到之前的棋盘状态
if (previousBoard) {
  const currentState = this.getBoardState();
  if (this.boardStatesEqual(currentState, previousBoard)) {
    return false;
  }
}
```

## 使用方式

### 1. 在游戏页面中传递检查函数
```typescript
const checkLegalMove = useCallback((position: { x: number; y: number }) => {
  if (!game || gameState?.status !== GameStatus.PLAYING) return false;
  return game.isLegalMove(position);
}, [game, gameState?.status]);

<GoBoard
  // ... 其他属性
  onCheckLegalMove={checkLegalMove}
/>
```

### 2. 自动生效
- 用户鼠标移动到棋盘上时自动检测
- 实时更新光标样式和预览效果
- 无需额外配置

## 测试验证

### 1. 基本功能测试
```bash
npx tsx lib/go/test-forbidden-moves.ts
```

### 2. 自杀检测测试
```bash
npx tsx lib/go/test-suicide.ts
```

### 3. 用户界面测试
1. 启动开发服务器: `npm run dev`
2. 创建新游戏
3. 尝试在不同位置hover鼠标
4. 观察光标变化和预览效果

## 预期行为

### 正常游戏过程中
- ✅ 空白合法位置：十字准星 + 棋子预览
- ❌ 禁入点：禁止光标 + 红色圆圈 + ✗标记
- ⚪ 已占位置：十字准星 + 无预览
- 🚫 游戏结束：默认光标 + 无预览

### 特殊情况
- 自杀落子：红色禁止样式
- 劫争违例：红色禁止样式
- 棋盘边界外：无任何效果

## 代码文件

### 修改的文件
- `components/ui/board.tsx` - 棋盘组件主要逻辑
- `app/game/page.tsx` - 游戏页面集成

### 新增的测试文件
- `lib/go/test-forbidden-moves.ts` - 综合测试
- `lib/go/test-suicide.ts` - 自杀检测专项测试

## 性能考虑

- 合法性检查只在鼠标移动时触发
- 使用`useCallback`避免不必要的重新渲染
- 状态更新经过优化，最小化DOM操作

## 后续改进建议

1. **更精细的视觉反馈**: 区分不同类型的禁入点（自杀vs劫争）
2. **动画效果**: 添加平滑的hover过渡动画
3. **音效支持**: 为禁入点hover添加音效提示
4. **可配置性**: 允许用户自定义禁入点样式
5. **移动端优化**: 针对触摸设备的特殊处理

---

## 总结

这个功能显著提升了围棋对战平台的用户体验，让玩家能够：
- 立即识别哪些位置可以落子
- 避免尝试非法落子
- 更直观地理解围棋规则
- 享受更流畅的游戏体验

功能已完整实现并通过测试，可以投入使用。