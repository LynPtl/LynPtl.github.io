---
title: 28.linux使用 Podman 运行容器
date: 2025-11-23 00:09:31
tags:
  - Linux
  - Podman
  - Container
categories:
  - Linux入门
---
# Linux 使用 Podman 运行容器

本章将介绍容器的基本概念，以及如何在 RHEL 系统上使用 <code>podman</code> 工具来运行和管理容器。

## 1. 容器技术简介

### 什么是容器？

“容器”这个术语和概念源于海运集装箱。

<em>   这些集装箱在城市与城市、国家与国家之间运输。
</em>   无论你走到世界哪个角落，你都会发现这些集装箱的尺寸完全相同…… <strong>你知道为什么吗???</strong>
<em>   因为世界各地的码头、卡车、轮船和仓库都是为了方便运输和存储这些标准化的集装箱而建造的。


当我们谈论 IT 领域的容器时，我们也在实现类似的目标。

> <strong>请注意:</strong>
> </em>   容器技术主要由<strong>开发者</strong>或<strong>程序员</strong>使用，他们编写代码来构建应用程序。
> <em>   作为<strong>系统管理员</strong>，你的工作是<strong>安装、配置和管理</strong>它们。

一个操作系统可以同时运行单个或多个容器。

### 容器软件：Docker 与 Podman

| 软件   | Podman                                                              | Docker                            |
| :----- | :------------------------------------------------------------------ | :-------------------------------- |
| <strong>开发者</strong> | Red Hat                                                             | Solomon Hykes                     |
| <strong>发布日期</strong> | 2018年8月                                                         | 2013年3月20日                     |
| <strong>特点</strong>   | 是 Docker 的一个替代品；RHEL 8 不支持 Docker；无守护进程，开源，Linux 原生。 | 最初的容器管理软件，通过后台守护进程工作。 |

---

## 2. 熟悉 Red Hat 容器技术

Red Hat 提供了一套无需容器引擎即可运行的命令行工具，包括：

</em>   <strong><code>podman</code></strong>: 用于直接管理 Pod、容器和容器镜像（run, stop, start, ps, attach 等）。
<em>   <strong><code>buildah</code></strong>: 用于构建、推送和签名容器镜像。
</em>   <strong><code>skopeo</code></strong>: 用于复制、检查、删除和签名镜像。
<em>   <strong><code>runc</code></strong>: 为 <code>podman</code> 和 <code>buildah</code> 提供容器运行和构建功能。
</em>   <strong><code>crun</code></strong>: 一个可选的运行时，可提供更大的灵活性、控制力和安全性，用于无根 (rootless) 容器。

### 熟悉 <code>podman</code> 容器技术

当您听到“容器”时，您还应该了解以下术语：

<em>   <strong><code>images</code> (镜像)</strong>: 容器可以通过镜像创建，容器也可以被转换回镜像。
</em>   <strong><code>pods</code> (Pod)</strong>: 一组部署在同一主机上的容器。在 <code>podman</code> 的 Logo 中，有3个海豹组合在一起，象征着一个 Pod。

---

## 3. 构建、运行和管理容器

### 软件包安装与环境准备

<em>   <strong>安装 podman</strong>
    ``<code>bash
    yum/dnf install podman -y
    # 对于 Docker 用户
    # yum install docker -y
    </code>`<code>
</em>   <strong>创建别名以兼容 docker 命令</strong>
    </code>`<code>bash
    alias docker=podman
    </code>`<code>
<em>   <strong>获取帮助</strong>
    </code>`<code>bash
    podman --help
    # 或者
    man podman
    </code>`<code>
</em>   <strong>检查版本</strong>
    </code>`<code>bash
    podman -v
    </code>`<code>
<em>   <strong>检查 </code>podman<code> 环境和仓库信息</strong>
    </code>`<code>bash
    # 如果您尝试加载一个容器镜像，它会先查找本地机器，然后按顺序列出的每个注册中心进行查找。
    podman info
    </code>`<code>

### 镜像管理

</em>   <strong>在仓库中搜索特定镜像</strong>
    </code>`<code>bash
    podman search httpd
    </code>`<code>
<em>   <strong>下载可用镜像</strong>
    </code>`<code>bash
    podman pull docker.io/library/httpd
    </code>`<code>
</em>   <strong>列出本地已下载的镜像</strong>
    </code>`<code>bash
    podman images
    </code>`<code>

### 容器生命周期管理

<ul><li>  <strong>运行一个下载好的 httpd 容器</strong></li></ul>
    </code>`<code>bash
    podman run -dt -p 8080:80/tcp docker.io/library/httpd
    </code>`<code>
    > *   </code>d<code> = detach (分离模式，即后台运行)
    > <em>   </code>t<code> = get the tty shell (获取 tty 终端)
    > </em>   </code>p<code> = port (端口映射)

<em>   <strong>列出正在运行的容器</strong>
    </code>`<code>bash
    podman ps
    </code>`<code>
    > 运行此命令后，您可以通过 Web 浏览器访问 </code>http://<主机IP>:8080<code> 来检查 httpd 服务是否正常。

</em>   <strong>查看容器日志</strong>
    </code>`<code>bash
    # -l 表示查看最新创建的那个容器的日志
    podman logs -l
    </code>`<code>
<em>   <strong>停止一个正在运行的容器</strong>
    </code>`<code>bash
    # con-name/con-id 可以从 podman ps 命令的输出中获得
    podman stop <con-name or con-id>
    </code>`<code>
</em>   <strong>通过改变端口号来运行多个 httpd 容器</strong>
    </code>`<code>bash
    podman run -dt -p 8081:80/tcp docker.io/library/httpd
    podman run -dt -p 8082:80/tcp docker.io/library/httpd
    podman ps
    </code>`<code>
<em>   <strong>停止和启动一个先前运行的容器</strong>
    </code>`<code>bash
    podman stop|start <con-name or con-id>
    </code>`<code>

</em>   <strong>从已下载的镜像创建一个新容器（但不启动）</strong>
    </code>`<code>bash
    podman create --name httpd-con docker.io/library/httpd
    </code>`<code>

<ul><li>  <strong>启动一个已创建的容器</strong></li></ul>
    </code>`<code>bash
    podman start httpd-con
    </code>`<code>

## 4. 通过 </code>systemd<code> 管理容器

为了让容器能作为系统服务被管理（例如开机自启），可以为其生成 </code>systemd<code> 单元文件。

1.  <strong>生成单元文件</strong>
    > 首先，您必须有一个已创建的容器（例如我们之前创建的 </code>httpd-con<code>）。
    </code>`<code>bash
    podman generate systemd --new --files --name httpd-con
    </code>`<code>

2.  <strong>复制单元文件到 </code>systemd<code> 目录</strong>
    </code>`<code>bash
    cp container-httpd-con.service /etc/systemd/system/
    </code>`<code>

3.  <strong>启用服务</strong>
    </code>`<code>bash
    systemctl enable container-httpd-con.service
    </code>`<code>

4.  <strong>启动服务</strong>
    </code>`<code>bash
    systemctl start container-httpd-con.service
    </code>``
