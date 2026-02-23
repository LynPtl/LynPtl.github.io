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

让我们通过运行一个最基础的容器来开始我们的 Docker 之旅：`hello-world`。这是一个官方提供的极简镜像，专门用于测试 Docker 环境是否安装配置正确。

### 1.1 执行命令

在终端中输入以下命令：

```bash
docker run hello-world
```

### 1.2 输出解析

执行后，你将看到类似的输出，让我们逐行解析 Docker 到底做了什么：

![hello-world](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/12/WindowsTerminal_FMyTXZuwLh.png)

```text
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
```

### 1.3 幕后流程
正如我们在第一章中所学，这完美演示了 Docker 的工作流：
1.  **Client** 发送 `run` 指令。
2.  **Daemon** 检查本地无镜像，从 **Registry** 拉取。
3.  **Daemon** 创建新容器，运行可执行文件产生输出。
4.  **Daemon** 将输出流回 **Client** 显示给你。

---

## 2. 容器生命周期详解 (Container Lifecycle)

理解容器在其生命周期内发生的变化至关重要。下图展示了容器从创建、运行、暂停、停止到最终移除的完整流程及对应的命令。

### 2.1 核心状态流转

#### 容器运行中 (Container running)
这是容器的主要工作状态。
*   **进入方式**：
    *   `docker run <image>`：直接从镜像创建并启动容器。
    *   `docker create` + `docker start`：先创建容器实例，再手动启动。
*   **可用操作**：
    *   日志查看：`docker logs` —— 查看应用日志。
    *   检查详情：`docker inspect` —— 查看容器元数据（IP、端口映射等）。
    *   执行命令：`docker exec` —— 在运行的容器内执行额外命令（如进入 Shell）。

#### 暂停状态 (Paused)
*   **操作**：
    *   `docker pause <cId>`：暂停容器。此时容器**并未真正停止**，而是保留内存内容，进程被挂起。
    *   `docker unpause <cId>`：解除暂停，恢复到运行状态。

#### 停止状态 (Container stopped)
容器不再运行，但其实例仍然保留在系统中。
*   **进入方式**：
    1.  **优雅停止**：`docker stop <cId>` —— 容器优雅退出，内存内容被清除。
    2.  **强制停止**：`docker kill <cId>` —— 强制发送 `SIGKILL` 信号终止进程（默认）。
    3.  **自然退出**：
        *   `exit 0`：进程无错误正常退出。
        *   `exit <non-zero>`：进程因错误退出。
*   **状态特征**：
    *   假设没有设置重启策略 (Assuming no restart policy in place)。
    *   容器实例**依然存在**，可以通过 `docker ps -a` 查看到。
    *   仍然可以执行 `docker logs` 和 `docker inspect`。
    *   可以通过 `docker start <cId>` 将其重新拉起。

#### 容器移除 (Container removed)
*   **操作**：
    *   `docker rm <cId>`：移除一个已停止的容器。
*   **结果**：
    *   容器及其包含的所有内容（文件修改等）被**永久移除**，不再可用。

---

### 2.2 生命周期命令速查表

| 起始状态 | 命令 | 目标状态 | 说明 |
| :--- | :--- | :--- | :--- |
| **(None)** | `docker run` | **Running** | 创建并启动 |
| **Running** | `docker pause` | **Paused** | 挂起进程，保留内存 |
| **Paused** | `docker unpause` | **Running** | 恢复进程 |
| **Running** | `docker stop` | **Stopped** | 优雅停止，清除内存 |
| **Running** | `docker kill` | **Stopped** | 强制停止 |
| **Running** | `exit` | **Stopped** | 进程自行退出 |
| **Stopped** | `docker start` | **Running** | 重新启动已有容器 |
| **Stopped** | `docker rm` | **Removed** | 彻底删除容器实例 |
