---
title: 2.Docker运行容器与生命周期
date: 2025-12-28 00:29:02
tags:
  - Docker
  - Container
  - Lifecycle
categories:
  - Docker
---
# Docker 学习笔记 (二)：运行容器与生命周期

## 1. 运行你的第一个容器 (Run your first container)

让我们通过运行一个最基础的容器来开始我们的 Docker 之旅：<code>hello-world</code>。这是一个官方提供的极简镜像，专门用于测试 Docker 环境是否安装配置正确。

### 1.1 执行命令

在终端中输入以下命令：

``<code>bash
docker run hello-world
</code>`<code>

### 1.2 输出解析

执行后，你将看到类似的输出，让我们逐行解析 Docker 到底做了什么：

![hello-world](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/12/WindowsTerminal_FMyTXZuwLh.png)

</code>`<code>text
Unable to find image 'hello-world:latest' locally
# 1. Docker 客户端先在本地查找镜像，发现没有找到。

latest: Pulling from library/hello-world
# 2. Docker 客户端联系 Docker Hub (默认仓库)，开始拉取 'hello-world' 镜像。

Pull complete
# 3. 镜像下载完成（这个镜像非常小）。

Digest: sha256:xxxx
Status: Downloaded newer image for hello-world:latest
# 4. 镜像已准备就绪。

Hello from Docker!
This message shows that your installation appears to be working correctly.
# 5. 容器启动！运行了镜像中的程序，打印出了这段欢迎信息。
</code>`<code>

### 1.3 幕后流程
正如我们在第一章中所学，这完美演示了 Docker 的工作流：
1.  <strong>Client</strong> 发送 </code>run<code> 指令。
2.  <strong>Daemon</strong> 检查本地无镜像，从 <strong>Registry</strong> 拉取。
3.  <strong>Daemon</strong> 创建新容器，运行可执行文件产生输出。
4.  <strong>Daemon</strong> 将输出流回 <strong>Client</strong> 显示给你。

---

## 2. 容器生命周期详解 (Container Lifecycle)

理解容器在其生命周期内发生的变化至关重要。下图展示了容器从创建、运行、暂停、停止到最终移除的完整流程及对应的命令。

### 2.1 核心状态流转

#### 容器运行中 (Container running)
这是容器的主要工作状态。
<em>   <strong>进入方式</strong>：
    </em>   </code>docker run <image><code>：直接从镜像创建并启动容器。
    <em>   </code>docker create<code> + </code>docker start<code>：先创建容器实例，再手动启动。
</em>   <strong>可用操作</strong>：
    <em>   日志查看：</code>docker logs<code> —— 查看应用日志。
    </em>   检查详情：</code>docker inspect<code> —— 查看容器元数据（IP、端口映射等）。
    <em>   执行命令：</code>docker exec<code> —— 在运行的容器内执行额外命令（如进入 Shell）。

#### 暂停状态 (Paused)
</em>   <strong>操作</strong>：
    <em>   </code>docker pause <cId><code>：暂停容器。此时容器<strong>并未真正停止</strong>，而是保留内存内容，进程被挂起。
    </em>   </code>docker unpause <cId><code>：解除暂停，恢复到运行状态。

#### 停止状态 (Container stopped)
容器不再运行，但其实例仍然保留在系统中。
<em>   <strong>进入方式</strong>：
    1.  <strong>优雅停止</strong>：</code>docker stop <cId><code> —— 容器优雅退出，内存内容被清除。
    2.  <strong>强制停止</strong>：</code>docker kill <cId><code> —— 强制发送 </code>SIGKILL<code> 信号终止进程（默认）。
    3.  <strong>自然退出</strong>：
        </em>   </code>exit 0<code>：进程无错误正常退出。
        <em>   </code>exit <non-zero><code>：进程因错误退出。
</em>   <strong>状态特征</strong>：
    <em>   假设没有设置重启策略 (Assuming no restart policy in place)。
    </em>   容器实例<strong>依然存在</strong>，可以通过 </code>docker ps -a<code> 查看到。
    <em>   仍然可以执行 </code>docker logs<code> 和 </code>docker inspect<code>。
    </em>   可以通过 </code>docker start <cId><code> 将其重新拉起。

#### 容器移除 (Container removed)
<em>   <strong>操作</strong>：
    </em>   </code>docker rm <cId><code>：移除一个已停止的容器。
<em>   <strong>结果</strong>：
    </em>   容器及其包含的所有内容（文件修改等）被<strong>永久移除</strong>，不再可用。

---

### 2.2 生命周期命令速查表

| 起始状态 | 命令 | 目标状态 | 说明 |
| :--- | :--- | :--- | :--- |
| <strong>(None)</strong> | </code>docker run<code> | <strong>Running</strong> | 创建并启动 |
| <strong>Running</strong> | </code>docker pause<code> | <strong>Paused</strong> | 挂起进程，保留内存 |
| <strong>Paused</strong> | </code>docker unpause<code> | <strong>Running</strong> | 恢复进程 |
| <strong>Running</strong> | </code>docker stop<code> | <strong>Stopped</strong> | 优雅停止，清除内存 |
| <strong>Running</strong> | </code>docker kill<code> | <strong>Stopped</strong> | 强制停止 |
| <strong>Running</strong> | </code>exit<code> | <strong>Stopped</strong> | 进程自行退出 |
| <strong>Stopped</strong> | </code>docker start<code> | <strong>Running</strong> | 重新启动已有容器 |
| <strong>Stopped</strong> | </code>docker rm` | <strong>Removed</strong> | 彻底删除容器实例 |
