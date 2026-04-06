# Amazing Owl

> Layer 2 Orchestration Layer for Amazing Ecosystem

## 项目简介

Amazing Owl 是 Amazing 系列的 Layer 2 编排和管理组件，位于用户输入层和执行层（amazing-specialists）之间，负责将原始用户请求转换为结构化的可执行工作，并协调交付工作流的下一步。

简而言之：
- **Layer 1**: 用户输入和需求澄清
- **Layer 2**: `amazing-owl` 管理和编排
- **Layer 3**: `amazing-specialists` 执行层

## MVP 范围

当前 MVP 实现了核心编排能力：

### 已实现功能

1. **请求接收 (Intake)**
   - 解析原始用户输入
   - 自动分类请求类型（feature/bugfix/enhancement）
   - 生成唯一请求 ID

2. **需求澄清 (Clarifier)**
   - 检测缺失的关键信息
   - 生成结构化的澄清问题
   - 判断是否可以分发

3. **需求标准化 (Normalizer)**
   - 生成 slug-safe 功能标识符
   - 提取范围和约束
   - 标准化为结构化需求对象

4. **工作流路由 (Planner)**
   - 根据当前阶段确定下一步动作
   - 支持 6 个工作流阶段：new → spec_exists → plan_complete → tasks_complete → implementation_complete → audit_complete

5. **执行桥接 (Bridge)**
   - 定义与 amazing-specialists 的接口
   - CLI 适配器实现
   - 负载构建和结果加载

6. **结果评估 (Evaluator)**
   - 分类执行状态（success/partial/blocked/failed/needs_user_input）
   - 生成下一步建议

### 明确不在 MVP 范围内

- 异步执行支持（当前仅同步）
- 持久化存储（当前仅内存）
- NLP 驱动的智能分类（当前使用关键词匹配）
- 多租户支持
- API 服务（当前仅 CLI/库使用）

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Input                                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  INTAKE                                                          │
│  - Parse raw input                                               │
│  - Generate request_id                                           │
│  - Classify request_type                                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLARIFIER                                                       │
│  - Check required fields                                         │
│  - If missing: return clarification questions                    │
│  - If complete: proceed                                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  NORMALIZER                                                      │
│  - Generate slug                                                 │
│  - Extract scope/constraints                                     │
│  - Create NormalizedRequirement                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  PLANNER/ROUTER                                                  │
│  - Resolve stage                                                 │
│  - Select action (spec-start/plan/tasks/implement/audit)        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  BRIDGE                                                          │
│  - Build payload                                                 │
│  - Call amazing-specialists                                      │
│  - Load result                                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  EVALUATOR                                                       │
│  - Classify status                                               │
│  - Recommend next step                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 开发方式

本项目使用 [amazing-specialists](https://github.com/Burburton/amazing-specialists) 专家包提供的 spec-driven 开发能力。

### 环境要求

- Node.js 18+
- TypeScript 5+
- `amazing-specialists` 位于相邻目录：

```
Workspace/
├── amazing-specialists/
└── amazing-owl/          # 本项目
```

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

### 构建

```bash
npm run build
```

## 项目结构

```
amazing-owl/
├── docs/              # 设计文档
│   └── infra/         # 架构和需求文档
├── src/               # 业务代码
│   ├── contracts/     # 数据模型和接口定义
│   ├── intake/        # 请求接收模块
│   ├── clarifier/     # 需求澄清模块
│   ├── normalizer/    # 标准化模块
│   ├── planner/       # 路由模块
│   ├── bridge/        # 执行桥接模块
│   ├── evaluator/     # 结果评估模块
│   ├── app/           # 应用核心
│   └── utils/         # 工具函数
├── tests/             # 测试文件
│   ├── integration/   # 集成测试
│   ├── e2e/           # 端到端测试
│   └── **/            # 单元测试
├── specs/             # Feature 开发记录
└── .opencode/         # 配置文件
```

## 使用示例

```typescript
import { OwlApp } from './src/app/owl-app';

const app = new OwlApp({ skipBridge: true });

// 处理原始输入
const response = await app.processRawInput(
  'Add a new user authentication feature. The goal is to enable secure login.'
);

console.log(response.status);        // 'success'
console.log(response.normalized_requirement?.feature_id);  // 'add-a-new-user-authentication-feature'
console.log(response.recommended_action);  // 'spec-start'
```

## 核心合约

### OwlRequest

```typescript
interface OwlRequest {
  request_id: string;
  raw_input: string;
  request_type: 'feature' | 'bugfix' | 'enhancement' | 'unknown';
  stage_hint?: WorkflowStage;
  context?: RequestContext;
}
```

### OwlResponse

```typescript
interface OwlResponse {
  request_id: string;
  status: ResponseStatus;
  normalized_requirement?: NormalizedRequirement;
  recommended_action?: RecommendedAction;
  dispatch_payload?: DispatchPayload;
  clarification_questions?: ClarificationQuestion[];
  notes?: string[];
}
```

### WorkflowStage

```typescript
type WorkflowStage = 
  | 'new'
  | 'spec_exists'
  | 'plan_complete'
  | 'tasks_complete'
  | 'implementation_complete'
  | 'audit_complete';
```

## 与 amazing-specialists 的关系

`amazing-owl` 作为编排层，负责：
- 接收用户原始请求
- 标准化和结构化需求
- 确定工作流阶段
- 调用 `amazing-specialists` 的相应命令
- 评估执行结果
- 推荐下一步操作

`amazing-specialists` 作为执行层，负责：
- 具体的开发工作流执行
- spec/plan/tasks 的生成和管理
- 实际的代码实现

## License

MIT