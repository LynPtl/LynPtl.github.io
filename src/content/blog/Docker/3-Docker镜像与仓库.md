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

在前两章中，我们使用了 <code>hello-world</code> 镜像。但镜像本质上是什么？

### 1.1 镜像的本质
镜像是一个<strong>只读的模板 (Read-only Template)</strong>，它包含了运行应用程序所需的一切：
<em>   <strong>代码 (Application Code)</strong>
</em>   <strong>运行时环境 (Runtime Environment)</strong>：如 Node.js, Python。
<em>   <strong>依赖库 (Libraries & Dependencies)</strong>
</em>   <strong>配置文件 (Configuration)</strong>
<em>   <strong>基础操作系统 (Base Layer)</strong>：如 Alpine, Ubuntu (通常是裁剪版)。

你可以把它想象成应用程序的“DNA”或者“快照 (Snapshot)”，一旦创建，其中的内容就是不可变的。

### 1.2 分层架构 (Layered Architecture)
Docker 镜像不是一个单一的大文件，而是由<strong>多层 (Layers)</strong> 组成的。
</em>   <strong>结构</strong>：每一层通常对应 <code>Dockerfile</code> 中的一条指令。
<em>   <strong>优势</strong>：这种分层机制使得存储和传输非常高效。例如，如果多个镜像都使用 <code>Ubuntu</code> 作为基础镜像，那么宿主机只需要存储一份 <code>Ubuntu</code> 的层，所有容器都可以共享它。

---

## 2. 镜像仓库 (Container Registries)

镜像构建好后，需要一个地方存储和分发，这就是镜像仓库。

### 2.1 核心作用
</em>   <strong>协作 (Collaboration)</strong>：团队成员之间共享镜像。
<em>   <strong>版本控制 (Versioning)</strong>：通过 Tag (标签) 追踪不同版本的镜像，方便回滚和更新。
</em>   <strong>安全性 (Security)</strong>：企业级仓库通常提供漏洞扫描和访问控制。
<em>   <strong>自动化 (Automation)</strong>：与 CI/CD 流水线集成，自动构建和推送。

### 2.2 仓库类型
1.  <strong>公共仓库 (Public Registries)</strong>：如 <strong>Docker Hub</strong>，对所有人开放，拥有海量开源软件镜像。
2.  <strong>私有仓库 (Private Registries)</strong>：用于存储专有软件或敏感数据。
    </em>   <strong>SaaS 服务</strong>：如 Docker Hub Private Repos, Quay.io。
    <em>   <strong>自托管 (Self-Hosted)</strong>：如 Harbor, JFrog Artifactory。
    </em>   <strong>云厂商服务</strong>：AWS ECR, Google GCR, Azure ACR。

---

## 3. 编写 Dockerfile (Building Images)

手动安装环境太麻烦且不可复现。<code>Dockerfile</code> 是构建镜像的脚本文件，体现了 "Infrastructure as Code" 的理念。

### 3.1 核心指令解析

一个典型的 <code>Dockerfile</code> 结构如下：

``<code>dockerfile
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
</code>`<code>

<em>   <strong>FROM</strong>: 每一份 Dockerfile 的起点。尽量选择轻量级的镜像（如 </code>alpine<code> 版本）。
</em>   <strong>WORKDIR</strong>: 相当于 </code>cd<code>，后续命令都会在这个目录下执行。
<em>   <strong>COPY</strong>: 将宿主机的文件复制到容器内部。
</em>   <strong>RUN</strong>: 在<strong>构建镜像时</strong>执行的命令（如安装软件、解压文件）。每执行一次 </code>RUN<code> 就会建立一个新的层。
<em>   <strong>CMD</strong>: 在<strong>启动容器时</strong>默认执行的命令。

### 3.2 构建与上下文
构建命令通常为：
</code>`<code>bash
docker build -t my-app:v1 .
</code>`<code>
注意最后的 </code>.<code>，它代表<strong>构建上下文 (Build Context)</strong>。Docker 客户端会将该目录下的<strong>所有文件</strong>发送给 Docker Daemon 进行构建。

---

## 4. 镜像优化与最佳实践 (Advanced Topics)

### 4.1 使用 </code>.dockerignore<code>
类似于 </code>.gitignore<code>。构建时，我们不应该把本地的 </code>node_modules<code>、日志文件、临时文件发送给 Docker Daemon。使用 </code>.dockerignore` 可以显著减小构建上下文的大小，加快构建速度并提高安全性。

### 4.2 多阶段构建 (Multistage Builds)
这是一个高级技巧，用于优化镜像体积。
</em>   <strong>问题</strong>：编译 Go 或 Java 应用需要安装大量的编译器和工具 (SDK)，但运行只需要一个二进制文件。如果把 SDK 都打包进最终镜像，体积会非常大。
<em>   <strong>解决</strong>：使用多阶段构建。
    </em>   <strong>Stage 1 (Build)</strong>: 包含编译器，负责编译代码。
    <em>   <strong>Stage 2 (Run)</strong>: 仅包含基础 OS。
    </em>   <strong>操作</strong>：从 Stage 1 复制编译好的产物到 Stage 2。最终镜像只包含 Stage 2 的内容，体积极小。

### 4.3 Distroless 镜像
这是一种为了安全性极致优化的镜像。
<em>   <strong>特点</strong>：不包含 Shell (bash/sh)、包管理器 (apt/apk) 等任何多余工具。
</em>   <strong>优势</strong>：体积微小，攻击面极小（黑客即使利用漏洞进入容器，也没有 Shell 可以执行命令）。
<ul><li>  <strong>挑战</strong>：由于没有 Shell，调试 (Debug) 会变得非常困难。</li></ul>
