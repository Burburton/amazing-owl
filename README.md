# Amazing Owl

> Layer 2 Orchestration Layer for Amazing Ecosystem

## 项目简介

Amazing Owl 是 Amazing 系列的 Layer 2 编排和管理组件，位于用户输入层和执行层（amazing-specialists）之间，负责将原始用户请求转换为结构化的可执行工作，并协调交付工作流的下一步。

简而言之：
- **Layer 1**: 用户输入和需求澄清
- **Layer 2**: `amazing-owl` 管理和编排
- **Layer 3**: `amazing-specialists` 执行层

## 开发方式

本项目使用 [amazing-specialists](https://github.com/Burburton/amazing-specialists) 专家包提供的 spec-driven 开发能力。

### 环境要求

确保 `amazing-specialists` 位于相邻目录：

```
Workspace/
├── amazing-specialists/
└── amazing-owl/          # 本项目
```

### 开始开发

1. 阅读原始设计文档：`docs/infra/`
2. 创建 feature spec：`specs/<feature-id>/spec.md`
3. 使用 specialists 命令进行开发

## 项目结构

```
amazing-owl/
├── docs/              # 设计文档
├── src/               # 业务代码
├── specs/             # Feature 开发记录
└── .opencode/         # 配置文件
```

## 技术栈

TBD

## License

MIT