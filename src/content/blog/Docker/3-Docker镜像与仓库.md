---
title: 3.Docker镜像与仓库
date: 2025-12-31 10:34:10
tags:
  - Docker
  - Image
  - Registry
categories:
  - Docker
---
# Docker 学习笔记 (三)：理解镜像与仓库

---

## 1. 什么是 Docker 镜像？(Docker Images Deep Dive)

在前两章中，我们使用了 `hello-world` 镜像。但镜像本质上是什么？

### 1.1 镜像的本质
镜像是一个**只读的模板 (Read-only Template)**，它包含了运行应用程序所需的一切：
*   **代码 (Application Code)**
*   **运行时环境 (Runtime Environment)**：如 Node.js, Python。
*   **依赖库 (Libraries & Dependencies)**
*   **配置文件 (Configuration)**
*   **基础操作系统 (Base Layer)**：如 Alpine, Ubuntu (通常是裁剪版)。

你可以把它想象成应用程序的“DNA”或者“快照 (Snapshot)”，一旦创建，其中的内容就是不可变的。

### 1.2 分层架构 (Layered Architecture)
Docker 镜像不是一个单一的大文件，而是由**多层 (Layers)** 组成的。
*   **结构**：每一层通常对应 `Dockerfile` 中的一条指令。
*   **优势**：这种分层机制使得存储和传输非常高效。例如，如果多个镜像都使用 `Ubuntu` 作为基础镜像，那么宿主机只需要存储一份 `Ubuntu` 的层，所有容器都可以共享它。

---

## 2. 镜像仓库 (Container Registries)

镜像构建好后，需要一个地方存储和分发，这就是镜像仓库。

### 2.1 核心作用
*   **协作 (Collaboration)**：团队成员之间共享镜像。
*   **版本控制 (Versioning)**：通过 Tag (标签) 追踪不同版本的镜像，方便回滚和更新。
*   **安全性 (Security)**：企业级仓库通常提供漏洞扫描和访问控制。
*   **自动化 (Automation)**：与 CI/CD 流水线集成，自动构建和推送。

### 2.2 仓库类型
1.  **公共仓库 (Public Registries)**：如 **Docker Hub**，对所有人开放，拥有海量开源软件镜像。
2.  **私有仓库 (Private Registries)**：用于存储专有软件或敏感数据。
    *   **SaaS 服务**：如 Docker Hub Private Repos, Quay.io。
    *   **自托管 (Self-Hosted)**：如 Harbor, JFrog Artifactory。
    *   **云厂商服务**：AWS ECR, Google GCR, Azure ACR。

---

## 3. 编写 Dockerfile (Building Images)

手动安装环境太麻烦且不可复现。`Dockerfile` 是构建镜像的脚本文件，体现了 "Infrastructure as Code" 的理念。

### 3.1 核心指令解析

一个典型的 `Dockerfile` 结构如下：

```dockerfile
# 1. 指定基础镜像 (Base Image)
FROM node:18-alpine

# 2. 设置工作目录 (Working Directory)
WORKDIR /app

# 3. 复制依赖定义并安装 (Dependencies)
COPY package.json package-lock.json ./
RUN npm install --production

# 4. 复制源代码 (Application Code)
COPY . .

# 5. 定义容器启动命令 (Command)
CMD ["node", "server.js"]
```

*   **FROM**: 每一份 Dockerfile 的起点。尽量选择轻量级的镜像（如 `alpine` 版本）。
*   **WORKDIR**: 相当于 `cd`，后续命令都会在这个目录下执行。
*   **COPY**: 将宿主机的文件复制到容器内部。
*   **RUN**: 在**构建镜像时**执行的命令（如安装软件、解压文件）。每执行一次 `RUN` 就会建立一个新的层。
*   **CMD**: 在**启动容器时**默认执行的命令。

### 3.2 构建与上下文
构建命令通常为：
```bash
docker build -t my-app:v1 .
```
注意最后的 `.`，它代表**构建上下文 (Build Context)**。Docker 客户端会将该目录下的**所有文件**发送给 Docker Daemon 进行构建。

---

## 4. 镜像优化与最佳实践 (Advanced Topics)

### 4.1 使用 `.dockerignore`
类似于 `.gitignore`。构建时，我们不应该把本地的 `node_modules`、日志文件、临时文件发送给 Docker Daemon。使用 `.dockerignore` 可以显著减小构建上下文的大小，加快构建速度并提高安全性。

### 4.2 多阶段构建 (Multistage Builds)
这是一个高级技巧，用于优化镜像体积。
*   **问题**：编译 Go 或 Java 应用需要安装大量的编译器和工具 (SDK)，但运行只需要一个二进制文件。如果把 SDK 都打包进最终镜像，体积会非常大。
*   **解决**：使用多阶段构建。
    *   **Stage 1 (Build)**: 包含编译器，负责编译代码。
    *   **Stage 2 (Run)**: 仅包含基础 OS。
    *   **操作**：从 Stage 1 复制编译好的产物到 Stage 2。最终镜像只包含 Stage 2 的内容，体积极小。

### 4.3 Distroless 镜像
这是一种为了安全性极致优化的镜像。
*   **特点**：不包含 Shell (bash/sh)、包管理器 (apt/apk) 等任何多余工具。
*   **优势**：体积微小，攻击面极小（黑客即使利用漏洞进入容器，也没有 Shell 可以执行命令）。
*   **挑战**：由于没有 Shell，调试 (Debug) 会变得非常困难。
