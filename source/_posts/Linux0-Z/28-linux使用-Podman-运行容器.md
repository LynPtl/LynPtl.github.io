---
title: 28.linux使用 Podman 运行容器
date: 2025-11-23 00:09:31
categories:
  - Linux入门
---
# Linux 使用 Podman 运行容器

本章将介绍容器的基本概念，以及如何在 RHEL 系统上使用 `podman` 工具来运行和管理容器。

## 1. 容器技术简介

### 什么是容器？

“容器”这个术语和概念源于海运集装箱。

*   这些集装箱在城市与城市、国家与国家之间运输。
*   无论你走到世界哪个角落，你都会发现这些集装箱的尺寸完全相同…… **你知道为什么吗???**
*   因为世界各地的码头、卡车、轮船和仓库都是为了方便运输和存储这些标准化的集装箱而建造的。


当我们谈论 IT 领域的容器时，我们也在实现类似的目标。

> **请注意:**
> *   容器技术主要由**开发者**或**程序员**使用，他们编写代码来构建应用程序。
> *   作为**系统管理员**，你的工作是**安装、配置和管理**它们。

一个操作系统可以同时运行单个或多个容器。

### 容器软件：Docker 与 Podman

| 软件   | Podman                                                              | Docker                            |
| :----- | :------------------------------------------------------------------ | :-------------------------------- |
| **开发者** | Red Hat                                                             | Solomon Hykes                     |
| **发布日期** | 2018年8月                                                         | 2013年3月20日                     |
| **特点**   | 是 Docker 的一个替代品；RHEL 8 不支持 Docker；无守护进程，开源，Linux 原生。 | 最初的容器管理软件，通过后台守护进程工作。 |

---

## 2. 熟悉 Red Hat 容器技术

Red Hat 提供了一套无需容器引擎即可运行的命令行工具，包括：

*   **`podman`**: 用于直接管理 Pod、容器和容器镜像（run, stop, start, ps, attach 等）。
*   **`buildah`**: 用于构建、推送和签名容器镜像。
*   **`skopeo`**: 用于复制、检查、删除和签名镜像。
*   **`runc`**: 为 `podman` 和 `buildah` 提供容器运行和构建功能。
*   **`crun`**: 一个可选的运行时，可提供更大的灵活性、控制力和安全性，用于无根 (rootless) 容器。

### 熟悉 `podman` 容器技术

当您听到“容器”时，您还应该了解以下术语：

*   **`images` (镜像)**: 容器可以通过镜像创建，容器也可以被转换回镜像。
*   **`pods` (Pod)**: 一组部署在同一主机上的容器。在 `podman` 的 Logo 中，有3个海豹组合在一起，象征着一个 Pod。

---

## 3. 构建、运行和管理容器

### 软件包安装与环境准备

*   **安装 podman**
    ```bash
    yum/dnf install podman -y
    # 对于 Docker 用户
    # yum install docker -y
    ```
*   **创建别名以兼容 docker 命令**
    ```bash
    alias docker=podman
    ```
*   **获取帮助**
    ```bash
    podman --help
    # 或者
    man podman
    ```
*   **检查版本**
    ```bash
    podman -v
    ```
*   **检查 `podman` 环境和仓库信息**
    ```bash
    # 如果您尝试加载一个容器镜像，它会先查找本地机器，然后按顺序列出的每个注册中心进行查找。
    podman info
    ```

### 镜像管理

*   **在仓库中搜索特定镜像**
    ```bash
    podman search httpd
    ```
*   **下载可用镜像**
    ```bash
    podman pull docker.io/library/httpd
    ```
*   **列出本地已下载的镜像**
    ```bash
    podman images
    ```

### 容器生命周期管理

*   **运行一个下载好的 httpd 容器**
    ```bash
    podman run -dt -p 8080:80/tcp docker.io/library/httpd
    ```
    > *   `d` = detach (分离模式，即后台运行)
    > *   `t` = get the tty shell (获取 tty 终端)
    > *   `p` = port (端口映射)

*   **列出正在运行的容器**
    ```bash
    podman ps
    ```
    > 运行此命令后，您可以通过 Web 浏览器访问 `http://<主机IP>:8080` 来检查 httpd 服务是否正常。

*   **查看容器日志**
    ```bash
    # -l 表示查看最新创建的那个容器的日志
    podman logs -l
    ```
*   **停止一个正在运行的容器**
    ```bash
    # con-name/con-id 可以从 podman ps 命令的输出中获得
    podman stop <con-name or con-id>
    ```
*   **通过改变端口号来运行多个 httpd 容器**
    ```bash
    podman run -dt -p 8081:80/tcp docker.io/library/httpd
    podman run -dt -p 8082:80/tcp docker.io/library/httpd
    podman ps
    ```
*   **停止和启动一个先前运行的容器**
    ```bash
    podman stop|start <con-name or con-id>
    ```

*   **从已下载的镜像创建一个新容器（但不启动）**
    ```bash
    podman create --name httpd-con docker.io/library/httpd
    ```

*   **启动一个已创建的容器**
    ```bash
    podman start httpd-con
    ```

## 4. 通过 `systemd` 管理容器

为了让容器能作为系统服务被管理（例如开机自启），可以为其生成 `systemd` 单元文件。

1.  **生成单元文件**
    > 首先，您必须有一个已创建的容器（例如我们之前创建的 `httpd-con`）。
    ```bash
    podman generate systemd --new --files --name httpd-con
    ```

2.  **复制单元文件到 `systemd` 目录**
    ```bash
    cp container-httpd-con.service /etc/systemd/system/
    ```

3.  **启用服务**
    ```bash
    systemctl enable container-httpd-con.service
    ```

4.  **启动服务**
    ```bash
    systemctl start container-httpd-con.service
    ```
