---
title: 1.Docker与容器介绍
date: 2025-12-26 22:08:31
tags:
  - Docker
  - Container
  - Intro
categories:
  - Docker
---

# Docker 学习笔记 (一)：容器化革命与架构原理

---

## 1. 为什么要使用容器？(Why Containers?)

### 1.1 传统应用部署的痛点

在容器技术普及之前，部署一个应用程序（比如 Node.js 应用）往往是一场“噩梦”。我们需要在服务器上：
<em>   安装 Node.js 及其特定的依赖版本。
</em>   安装应用程序本身的依赖库。
<em>   配置运行环境，最后启动应用。

<strong>但这带来了巨大的复杂性：</strong>
</em>   <strong>环境地狱</strong>：如果服务器上还要运行 Python、Java、Go 等其他语言的应用怎么办？
<em>   <strong>版本冲突</strong>：如果应用 A 需要 Node.js v14，而应用 B 需要 Node.js v18，如何让它们在同一台机器上和谐共存？
</em>   <strong>"Devs vs Ops" 的经典推诿</strong>：
    <em>   开发人员 (Devs) 写好了代码和部署脚本。
    </em>   运维人员 (Ops) 在服务器上运行脚本 —— <strong>报错了！</strong>
    <em>   Devs：“但在我的机器上是好的啊！”
    </em>   Ops：“那是你的机器，服务器环境不一样。”
    <em>   ...经历无数次调整脚本、安装依赖、调试后，应用终于上线了。

### 1.2 容器带来的救赎

Docker 容器的出现改变了这一切。

<strong>核心理念</strong>：容器将应用程序及其<strong>所有的依赖项</strong>和<strong>配置</strong>打包在一起。从外部看，所有的容器看起来都一样，运行方式也几乎相同。

<strong>由此带来的好处：</strong>
</em>   <strong>简化设置</strong>：不再需要繁琐的手动环境配置。
<em>   <strong>可移植性 (Portability)</strong>：在开发笔记本上能跑，就能在测试服、生产环境云服务器上跑，“一次构建，到处运行”。
</em>   <strong>环境一致性</strong>：消除了“在我的机器上没问题”这类借口。
<em>   <strong>隔离性</strong>：不同应用之间互不干扰。
</em>   <strong>更高效的资源利用</strong>：相比虚拟机更轻量。

<strong>新的协作模式</strong>：
1.  <strong>Devs</strong> 编写 <code>Dockerfile</code>，定义环境和依赖。
2.  <strong>Devs</strong> 构建并推送镜像 (Image)。
3.  <strong>Ops</strong> 只需要拿到镜像并部署，无需关心内部细节。

---

## 2. 容器与虚拟机 (Containers vs Virtual Machines)

这是面试和理解容器技术时最常见的问题：Docker 容器和 VMware/VirtualBox 这种虚拟机有什么区别？

### 2.1 架构对比

#### 虚拟化 (Virtualization) - "独栋别墅"
<em>   <strong>结构</strong>：硬件基础设施 -> 宿主机系统 (Host OS) -> <strong>Hypervisor</strong> -> <strong>客户机系统 (Guest OS)</strong> -> 依赖/代码。
</em>   <strong>特点</strong>：每个虚拟机 (VM) 都有自己完整的操作系统（Guest OS）。
<em>   <strong>比喻</strong>：就像一排独栋别墅，每一栋都有自己的地基、墙壁、水电设施，相互完全独立，但占地面积大，建设成本高。

#### 容器化 (Containerization) - "现代化公寓"
</em>   <strong>结构</strong>：硬件基础设施 -> 宿主机系统 (Host OS) -> <strong>容器引擎 (Container Engine)</strong> -> 容器 (代码/依赖)。
<em>   <strong>特点</strong>：所有容器<strong>共享</strong>宿主机的操作系统内核 (Kernel)，没有 Guest OS 这一层。
</em>   <strong>比喻</strong>：就像一栋公寓大楼，大家共享地基和基础设施（内核），但每个房间（容器）内部是独立的。这使得它非常轻量和高效。

![Acrobat_RHf8HLLsBg.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/12/Acrobat_RHf8HLLsBg.png)

### 2.2 核心特性 PK

| 特性 | 虚拟机 (VMs) | Docker 容器 |
| :--- | :--- | :--- |
| <strong>隔离性</strong> | <strong>强隔离</strong>：每个 VM 有独立的 OS，隔离彻底，安全性极高。 | <strong>进程级隔离</strong>：共享宿主机内核，通过 Namespace/Cgroup 实现隔离。 |
| <strong>大小/开销</strong> | <strong>庞大</strong>：包含完整 OS，镜像通常是 GB 级别。启动慢。 | <strong>轻量</strong>：仅包含应用和必要库，镜像通常是 MB 级别。秒级启动。 |
| <strong>可移植性</strong> | <strong>较弱</strong>：往往绑定特定的 Hypervisor 或 OS 配置。 | <strong>极佳</strong>：平台无关，只要有 Docker 引擎就能跑。 |

### 2.3 该怎么选？

<em>   <strong>选择虚拟机 (VM)</strong> 当：
    </em>   你需要极强的环境隔离（例如运行不同租户的敏感工作负载）。
    <em>   你需要运行完全不同的操作系统（如在 Linux 上跑 Windows）。
    </em>   你需要处理难以容器化的传统遗留应用。
<em>   <strong>选择容器 (Docker)</strong> 当：
    </em>   你正在构建现代的、云原生的微服务架构。
    <em>   你需要快速扩缩容，追求极致的启动速度。
    </em>   你需要跨环境（开发、测试、生产）的高度一致性。

---

## 3. Docker 架构组件 (Docker Components)

Docker 采用的是客户端-服务器 (C/S) 架构。理解这部分有助于排查连接问题。

### 3.1 三大核心组件

1.  <strong>Docker Client (客户端)</strong>
    <em>   这是用户与 Docker 交互的入口，也就是我们常用的 CLI (命令行界面)，例如执行 <code>docker build</code>, <code>docker run</code>。
    </em>   客户端通过 API 与 Docker Host 通信。

2.  <strong>Docker Host (主机)</strong>
    <em>   这是 Docker 实际干活的地方。
    </em>   <strong>Docker Daemon</strong>：后台守护进程，负责监听 API 请求，管理 Docker 对象（镜像、容器、网络、卷）。
    <em>   <strong>REST API</strong>：客户端和守护进程之间的通信桥梁。
    </em>   <strong>Images Cache</strong>：本地的镜像仓库。
    <em>   <strong>Containers</strong>：正在运行的容器实例。

3.  <strong>Image Registry (镜像仓库)</strong>
    </em>   存储镜像的地方。
    <em>   <strong>Docker Hub</strong> 是默认的公共仓库，也有企业私有的 Registry。

![Acrobat_hBtsZMVwZL.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/12/Acrobat_hBtsZMVwZL.png)

---

## 4. 深入理解 Docker 工作流 (Lifecycle)

让我们通过两个最常用的命令，看看 Docker 内部发生了什么。

### 场景一：运行一个容器 (<code>docker run</code>)

当你输入 <code>docker run <image></code> 时：

1.  <strong>指令发出</strong>：你在 CLI 输入命令。
2.  <strong>发送请求</strong>：CLI 将指令转换为 API 请求，发送给 Docker Host 的 REST API。
3.  <strong>检查本地缓存</strong>：Docker Host 首先检查本地 (<strong>Local Cache</strong>) 是否已经有这个镜像？
4.  <strong>拉取镜像 (Pull)</strong>：
    </em>   如果有：直接使用。
    *   如果没有：Host 会连接 <strong>Image Registry</strong>，下载（Pull）该镜像到本地。
5.  <strong>实例化</strong>：Docker Host 根据镜像创建一个新的容器实例并启动它。

### 场景二：构建并发布镜像 (<code>docker build</code> & <code>docker push</code>)

当你开发完代码，需要打包发布时：

1.  <strong>构建指令</strong>：你输入 <code>docker build</code> 命令。
2.  <strong>发送上下文</strong>：CLI 将请求发送给 Host，<strong>同时</strong>会把当前的“构建上下文” (Context，通常是当前目录下的文件) 和 <code>Dockerfile</code> 发送给 Docker Daemon。
3.  <strong>执行构建</strong>：Docker Host 按照 <code>Dockerfile</code> 的指令，一步步构建出镜像。
4.  <strong>保存镜像</strong>：构建好的镜像会被打上标签 (Tag) 并存储在本地缓存中。
5.  <strong>推送指令</strong>：你输入 <code>docker push</code>。
6.  <strong>上传</strong>：Docker Host 将本地的镜像上传到远端的 <strong>Image Registry</strong>，供其他人下载使用。