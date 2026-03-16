---
title: 19.linux优化系统性能
date: 2025-11-15 02:53:21
tags:
  - Linux
  - Performance
categories:
  - Linux入门
---
# Linux 优化系统性能

Linux 系统在默认安装后已经经过了良好的调整，但仍可以根据系统性能和应用程序要求进行一些调整。

## 什么是 tuned？

*   `tuned` 的发音是 "tune-d"
*   `Tune` 用于系统调优，`d` 代表守护进程
*   它是一个 `systemd` 服务，用于调整 Linux 系统性能
*   `tuned` 软件包的名称是 `tuned`
*   `tuned` 服务附带预定义的配置文件和设置
*   根据选择的配置文件，`tuned` 服务会自动调整系统以获得最佳性能。例如，如果您正在下载大文件，`tuned` 将调整网络，或者如果检测到高存储读/写，它将调整 IO 设置
*   `tuned` 守护进程在服务启动时或选择新的调优配置文件时应用系统设置。

## tuned 配置文件

| Tuned profile | Purpose |
| :--- | :--- |
| balanced | 适用于需要在节能和性能之间取得平衡的系统 |
| desktop | 源自 balanced 配置文件。提供更快的交互式应用程序响应 |
| throughput-performance | 调整系统以实现最大吞吐量 |
| latency-performance | 适用于需要低延迟且以功耗为代价的服务器系统 |
| network-latency | 源自 latency-performance 配置文件。它启用其他网络调整参数以提供低网络延迟 |
| network-throughput | 源自 throughput-performance 配置文件。应用其他网络调整参数以实现最大网络吞吐量 |
| powersave | 调整系统以实现最大节能 |
| oracle | 针对基于吞吐量性能配置文件的 Oracle 数据库负载进行了优化 |
| virtual-guest | 如果在虚拟机上运行，则调整系统以获得最大性能 |
| virtual-host | 如果作为虚拟机的主机，则调整系统以获得最大性能 |

## tuned 命令

*   检查是否已安装 tuned 软件包
    *   `rpm -qa | grep tuned`
*   如果尚未安装，请安装 tuned 软件包
    *   `yum install tuned`
*   检查 tuned 服务状态
    *   `systemctl status|enable|start tuned`
    *   `systemctl enable tuned` (在启动时启用)
![VirtualBoxVM_uR9da9NXI9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_uR9da9NXI9.png)
*   用于更改 tuned 守护进程设置的命令
    *   `tuned-adm`
*   检查哪个配置文件处于活动状态
    *   `tuned-adm active` 当你想知道系统当前正应用哪一套优化规则时，使用此命令。
*   列出可用的配置文件
    *   `tuned-adm list` 这会显示一个列表，包含像 balanced, powersave, throughput-performance 等所有可用的预设配置文件，方便您从中选择。
![VirtualBoxVM_6XzVHGPiKq.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_6XzVHGPiKq.png)
*   更改为所需的配置文件
    *   `tuned-adm profile profile-name` 切换到指定的性能配置文件。
    *   例如: `tuned-adm profile virtual-guest` 会将系统优化设置为最适合虚拟机客户机的模式。
*   检查 tuned 的建议
    *   `tuned-adm recommend` 让 tuned 根据它对您当前系统硬件和状态的分析，推荐一个最合适的配置文件。
*   关闭 tuned 设置守护进程
    *   `tuned-adm off` 关闭 tuned 的动态调优功能。tuned 将停止监控系统并停止应用任何优化规则。系统参数会恢复到 tuned 干预之前的状态。如果想完全禁用，除了 off 之外，还应该用 systemctl disable --now tuned 来停止并禁用该服务。
*   通过 Web 控制台更改配置文件
    *   登录到 `https://192.168.1.x:9090` （记不记得这是之前我们介绍过的那个Cockpit）
    *   `Overview` -> `Configuration` -> `Performance profile`

## nice/renice

*   保持系统微调的另一种方法是通过 `nice` 和 `renice` 命令确定进程的优先级
*   如果服务器有 1 个 CPU，那么它一次只能执行 1 个计算/进程，而其他进程必须等待（先进先出）
*   使用 `nice` 和 `renice` 命令，我们可以使系统优先处理某些进程
*   此优先级可以设置在 40 个不同的级别
*   `nice` 级别值的范围从 -20（最高优先级）到 19（最低优先级），默认情况下，进程继承其父进程的 `nice` 级别，通常为 0。

## 检查进程优先级

*   检查进程优先级
    *   `top`
*   `Ni` 值是就是Nice值，是用户空间和优先级，`PR` 是 Linux 内核使用的进程的实际优先级。在 Linux 系统中，优先级范围是 0 到 139，其中 0 到 99 用于实时，100 到 139 用于用户
![VirtualBoxVM_eh0IlmMQxw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_eh0IlmMQxw.png)
*   也可以通过 `ps` 命令以及正确的选项查看进程优先级
    *   `$ ps axo pid,comm,nice,cls --sort=-nice`
![VirtualBoxVM_HgLhq1XXrO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_HgLhq1XXrO.png)

## 设置/更改进程优先级

*   设置进程优先级
    *   `nice -n # process-name`
    *   例如 `nice -n -15 top`
*   更改进程优先级
    *   `renice -n # process-name`
    *   例如 `renice -n 12 PID`
