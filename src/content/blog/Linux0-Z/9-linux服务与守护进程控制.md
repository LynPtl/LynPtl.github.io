---
title: 9.linux服务与守护进程控制
date: 2025-10-28 01:36:08
tags:
  - Linux
  - Systemd
  - Services
categories:
  - Linux入门
---
# Linux 服务与守护进程控制

## 1. 服务与守护进程基础

-   <strong>服务 (Service)</strong> 或 <strong>应用程序 (Application)</strong> 在启动后会创建进程。当这些进程在后台持续运行时，它们就变成了 <strong>守护进程 (Daemon)</strong>。
-   大多数服务都是守护进程。
-   服务由 <code>systemctl</code> 命令控制。
-   <code>systemctl</code> 是一个 <code>systemd</code> 工具，负责控制 <code>systemd</code> 系统和服务管理器。
-   <code>systemd</code> 是一系列系统管理守护进程、工具和库的集合，它取代了 System V init 守护进程。
-   <code>systemd</code> 是大多数守护进程的父进程。
-   控制服务的命令是 <code>systemctl</code>。

---

## 2. systemctl 命令详解与使用场景

-   <strong>检查系统是否安装了 systemd</strong>:
    ``<code>bash
    systemctl --version
    </code>`<code>
    ![VirtualBoxVM_CrBKqMAkpw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_CrBKqMAkpw.png)

-   <strong>检查 systemd 是否正在运行</strong>:
    </code>`<code>bash
    ps -ef | grep system
    </code>`<code>
    ![VirtualBoxVM_RNswmKmk94.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_RNswmKmk94.png)
-   <strong>检查所有正在运行的服务</strong>:
    </code>`<code>bash
    systemctl --all
    </code>`<code>
    列出所有 </code>systemd<code> 单元，包括非活动状态的。
    ![VirtualBoxVM_VcBiaiBH6u.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_VcBiaiBH6u.png)
-   <strong>管理服务状态 (status|start|stop|restart)</strong>:
    </code>`<code>bash
    systemctl status|start|stop|restart application.service
    </code>`<code>
    <em>   </code>status<code>: 查看服务详细状态和日志。
    </em>   </code>start<code>: 启动已停止的服务。
    <em>   </code>stop<code>: 停止正在运行的服务。
    </em>   </code>restart<code>: 重启服务，常用于配置更新后。

    比如我们尝试一下查看</code>firewalld<code>服务：
    ![VirtualBoxVM_VBCgftyiKu.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_VBCgftyiKu.png)
    你在这里可以看到服务的状态，服务的路径等等信息。

    ![VirtualBoxVM_BrAi99nD5r.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_BrAi99nD5r.png)

    这里我们尝试用</code>systemctl stop<code>杀掉这个服务尝试一下。

    ![VirtualBoxVM_too14Rx5eu.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_too14Rx5eu.png)

    这里使用</code>ps<code>命令发现这里没有什么信息了。

    ![VirtualBoxVM_nTRFg6ryiG.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_nTRFg6ryiG.png)

    再尝试用</code>system start<code>重启这个服务。

    有的时候你可能更改了某些配置，你想重启该服务获取新的状态，你就可以使用</code>systemctl restart<code>来实现。

    停止服务的最好方法就是使用</code>systemctl stop<code>，而不是</code>kill<code>。你可以使用</code>kill<code>之后使用</code>systemctl status<code>来观察和使用</code>systemctl stop<code>的区别在哪里。
-   <strong>重新加载服务的配置</strong>:
    </code>`<code>bash
    systemctl reload application.service
    </code>`<code>
    在不中断服务的情况下应用新的配置。
    重新加载不会影响你的服务，而停止和启动是会影响的。如果你在配置的时候停止一个服务，那服务在停止的时候就会失效。但是如果你更改配置文件并使用reload，他会将配置文件重新加载到systemctl，而无需停止和启动应用程序。
-   <strong>设置服务开机自启 (enable|disable)</strong>:
    </code>`<code>bash
    systemctl enable|disable application.service
    </code>`<code>
    <em>   </code>enable<code>: 配置服务在系统启动时自动启动。
    </em>   </code>disable<code>: 阻止服务在系统启动时自动启动。
-   <strong>彻底禁用服务 (mask|unmask)</strong>:
    </code>`<code>bash
    systemctl mask|unmask application.service
    </code>`<code>
    <em>   </code>mask<code>: 强制禁用服务，防止其被任何方式启动。
    </em>   </code>unmask`: 解除服务的强制禁用状态。