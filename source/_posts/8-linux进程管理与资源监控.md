---
title: 8.linux进程管理与资源监控
date: 2025-10-25 15:00:43
categories:
  - Linux入门
---

# Linux 进程管理与资源监控(施工中)

---

# 进程与作业 (Processes and Jobs)

在计算中，我们经常遇到与“进程”和“作业”相关的几个核心概念。下图总结了这些关键术语，它们是理解操作系统如何管理程序执行的基础：

*   **应用程序 (Application) = 服务 (Service)**: 应用程序可以作为服务在后台运行。
*   **脚本 (Script)**: 由解释器执行的一系列命令。
*   **进程 (Process)**: 正在执行的程序的实例。
*   **守护进程 (Daemon)**: 在后台运行以执行特定任务的特殊进程。
*   **线程 (Threads)**: 进程内的执行单元。
*   **作业 (Job)**: 由shell管理的一组进程。

---

# 监控和管理进程

*   当操作系统启动时，许多程序会加载到系统内存中。这些进程或程序需要被管理和监控，因为它们主要消耗三种系统资源：CPU、内存和磁盘空间。

*   这里有一些用于管理系统资源的监控命令：

    *   `df`
    *   `du`
    *   `uptime`
    *   `top`
    *   `free`
    *   `lsof`
    *   `tcpdump`
    *   `netstat`
    *   `ps`
    *   `kill`

*   其他一些命令是 `vmstat`, `iostat`, `iftop` 等。

---

## 命令详解

*   **`df` (disk free)**: 显示文件系统的磁盘空间使用情况。

![VirtualBoxVM_PuiHdwUw0L.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_PuiHdwUw0L.png)

建议你使用`-h`选项，获得更方便阅读的结果。这些文件系统是做什么用的请你自行搜索学习。

![VirtualBoxVM_JJMn5j5Owq.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_JJMn5j5Owq.png)

此外`-T`选项也很重要。这个结果向你展示了文件系统的类型(Type)。

* **`xfs`**：
    * 这是一种高性能的**日志文件系统 (Journaling File System)**。
    * "日志"意味着它会记录即将对磁盘进行的更改，如果系统意外崩溃（比如断电），它能很快恢复数据一致性，而不需要长时间扫描整个磁盘。
    * `xfs` 这种类型的文件系统是**持久化**的，意味着它存储在你的物理硬盘上，关机后数据**不会**丢失。
    * 在你的例子中，你的**根目录 (`/`)** 和 **启动目录 (`/boot`)** 都使用了 `xfs`。

* **`tmpfs`** (Temporary File System):
    * 这是一种**临时的、基于内存的文件系统**。
    * 它把所有数据都存储在**RAM（内存）** 和/或交换空间 (swap) 中。
    * **优点**：读写速度极快，因为它操作的是内存。
    * **缺点**：它是**易失**的（Volatile），意味着**系统一旦重启，`tmpfs` 上的所有数据都会丢失**。
    * 它非常适合存放那些“用完即走”的临时运行时数据。

* **`devtmpfs`**:
    * 这是一种特殊的 `tmpfs`，专门用于 `/dev` 目录。
    * 它的任务是由内核在系统启动时动态创建和管理**设备文件**（比如你的硬盘 `/dev/sda`、终端 `/dev/tty1` 等）。


*   **`du` (disk usage)**: 估算文件和目录的磁盘使用空间。

![VirtualBoxVM_urfc4V40pw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_urfc4V40pw.png)

这个命令`du -k / | sort -nr | more`是从根目录 (/) 开始计算所有目录的磁盘占用空间（以KB为单位），然后将结果按空间大小从大到小排序，最后把这个排好序的列表用分页器（more）显示出来，方便查看。

此外上面的这些 cannot access 的提示都是正常现象。它们只是告诉你在 du 扫描整个系统的过程中，有几个瞬时的 /proc 文件消失了，并且有几个属于其他用户的 FUSE 挂载点拒绝了你的访问。你可以忽略这些。

![VirtualBoxVM_n4U5YRi4Rr.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_n4U5YRi4Rr.png)

同样`du`命令也有`-h`选项。

你可以通过这个命令查看什么文件占据了很大的空间，从而对其进行管理。

*   **`uptime`**: 显示系统已经运行了多长时间，当前登录的用户数，以及系统在过去1、5、15分钟内的平均负载。

![VirtualBoxVM_8z0XOpWpGp.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_8z0XOpWpGp.png)

*   **`top`**: 实时显示系统中各个进程的资源占用状况，类似于 Windows 的任务管理器。
![VirtualBoxVM_XFtEG4kLOO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_XFtEG4kLOO.png)

我没法做到向你解释所有的命令里面的所有信息的内容，这花费的时间太长了，如果你有任何看不懂的信息请你自行搜索一下。

* **PID**: 进程ID。
* **USER**: 进程的所有者。
* **PR**: 进程优先级。
* **NI**: 进程的 nice 值。
* **VIRT**: 进程使用的虚拟内存量。
* **RES**: 进程使用的常驻内存量。
* **SHR**: 进程使用的共享内存量。
* **S**: 进程状态。（请参阅下面的列表了解此字段可能的值）。
* **%CPU**: 自上次更新以来进程所使用的 CPU 时间百分比。
* **%MEM**: 进程所使用的物理内存百分比。
* **TIME+**: 任务所使用的总 CPU 时间，单位为 1/100 秒。
* **COMMAND**: 命令名称或命令行（名称 + 选项）。


*   **`free`**: 显示系统内存的使用情况，包括物理内存、交换内存(swap)和内核缓冲区。
![VirtualBoxVM_n7VTVrh1MK.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_n7VTVrh1MK.png)

如果你想以`MB`为单位，只需要加上`-m`选项。

*   **`lsof` (list open files)**: 列出当前系统打开的文件。

有些时候，当你停止了某个进程，它所正在查找的文件仍然处于被打开的状态。
*   **`tcpdump`**: 一个强大的网络抓包工具，用于捕获和分析网络流量。
*   **`netstat`**: 显示网络连接、路由表、接口统计等网络相关信息。
*   **`ps` (process status)**: 显示当前系统的进程状态。
*   **`kill`**: 用于向进程发送信号，通常用于终止进程。
*   **`vmstat` (virtual memory statistics)**: 报告关于虚拟内存、进程、CPU活动、I/O等的统计信息。
*   **`iostat` (input/output statistics)**: 报告CPU统计信息和输入/输出设备的统计信息。
*   **`iftop` (interface top)**: 实时监控网络接口的流量。
