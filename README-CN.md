# Cortex Lab

<p align="center">AI Agent 实验与提示词调试平台</p>

<p align="center">
  <img alt="Go Version" src="https://img.shields.io/github/go-mod/go-version/xichan96/cortex-lab?filename=backend%2Fgo.mod"/>
  <img alt="License" src="https://img.shields.io/github/license/xichan96/cortex-lab"/>
</p>

<p align="center">
  <a href="#项目概览">项目概览</a>
  · <a href="#核心特性">核心特性</a>
  · <a href="#技术架构">技术架构</a>
  · <a href="#快速开始">快速开始</a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

## 项目概览

Cortex Lab 旨在打造一个 **AI Agent 实验平台**，专门用于 **调试提示词和工具**。它提供了一个迭代环境，帮助开发者和提示词工程师精细化地打磨 AI 智能体。

> 本项目的 Agent 能力基于 [Cortex](https://github.com/xichan96/cortex) 框架构建。

## 核心特性

1.  **智能提示词工程**
    AI 将自动帮您编写或优化角色提示词，让 Prompt 编写变得更加智能和高效。

    ![智能提示词工程](docs/images/1.auto-prompt.GIF)

2.  **工具调用**
    轻松配置角色所需的工具。支持配置 **MCP (Model Context Protocol)** 和丰富的内置工具，扩展 Agent 的能力边界。

    ![工具调用](docs/images/2.tools.png)

3.  **经验管理**
    将有用的知识固化为“经验”。支持**渐进式披露** (Progressive Disclosure)，让 Agent 在合适的时机获取合适的上下文。

    ![经验管理](docs/images/3.experience.GIF)

4.  **角色互 Call**
    术业有专攻。支持角色之间的相互调用，就像一支分工明确的团队在协作解决复杂问题。

    ![角色互 Call](docs/images/4.call.png)

## 技术架构

Cortex Lab 采用模块化架构：

- **Frontend**: React + Vite + Tiptap + Shadcn/ui
- **Backend**: Go + Gin + MySQL + [Cortex Framework](https://github.com/xichan96/cortex)
- **MCP Integration**: 支持本地和远程 MCP Server。

## 快速开始

### Docker 快速启动

使用 Docker Compose 是启动 Cortex Lab 最简单的方式。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/xichan96/cortex-lab.git
    cd cortex-lab
    ```

2.  **启动服务**
    ```bash
    docker-compose up -d
    ```

3.  **访问应用**
    打开浏览器访问 [http://localhost](http://localhost)。

### 前置要求

- Go 1.21+
- Node.js 18+
- MySQL 8.0+

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/xichan96/cortex-lab.git
    cd cortex-lab
    ```

2.  **后端启动**
    ```bash
    cd backend
    # 请更新 config.yaml 中的数据库和 LLM 配置
    go mod download
    go run cmd/app/main.go
    ```

3.  **前端启动**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
