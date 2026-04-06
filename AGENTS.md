# AGENTS.md

## Project

**Amazing Owl** - Layer 2 Orchestration Layer for Amazing Ecosystem

位于用户输入层和 amazing-specialists 执行层之间，负责：
- 需求接收和澄清
- 请求结构化规范化
- 工作流路由和编排
- 执行结果解读和下一步推荐

## Development

本项目使用 [amazing-specialists](https://github.com/Burburton/amazing-specialists) 提供的 spec-driven 开发能力。

详见 `.opencode/config.json` 配置。

## Rules

- 所有开发遵循 spec-driven 流程
- Feature 开发记录存放在 `specs/` 目录
- 业务代码存放在 `src/` 目录