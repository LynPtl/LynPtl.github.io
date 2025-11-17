---
title: 22.linux管理基本存储
date: 2025-11-18 01:24:27
categories:
  - Linux入门
---
# Linux 管理基本存储

本文将介绍 Linux 中的基本存储概念，并提供一个从添加新硬盘到分区、格式化、并最终挂载使用的完整分步教程。

## 1. 核心概念

### 存储类型

首先，了解三种主要的存储类型：

*   **本地存储 (Local Storage)**：直接连接到计算机的物理磁盘，如 `/dev/sda`。
*   **SAN (Storage Area Network)**：一种专用的高速网络，用于将存储设备连接到服务器，通常表现为块设备。
*   **NAS (Network Attached Storage)**：一种专用的文件存储服务器，通过网络（如 NFS 或 SMB）向客户端提供文件服务。

### 常用命令

以下是管理磁盘和分区的两个基础命令：

*   `df`：报告文件系统的磁盘空间使用情况。使用 `-h` 选项可获得更易读的输出。
    ![df -h 命令的输出](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_PBll1SjDxm.png)
*   `fdisk`：一个强大的分区表编辑器。使用 `fdisk -l` 可以列出所有磁盘的分区信息。
    ![fdisk -l 命令的输出](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_IAtKpdLcCW.png)

### 理解 `fdisk -l` 的输出

以上图为例，物理硬盘 `/dev/sda` (一个 40 GiB 的 VBOX 硬盘) 被分成了三个主分区：

| Device | Size | Type | 描述 |
| :--- | :--- | :--- | :--- |
| **/dev/sda1** | 1M | BIOS boot | 用于 BIOS 启动的引导分区。 |
| **/dev/sda2** | 1G | Linux extended boot | 一个扩展的 Linux 启动分区。 |
| **/dev/sda3** | 39G | Linux LVM | LVM (逻辑卷管理) 分区，它本身可容纳多个逻辑卷。 |

---

#### 什么是逻辑卷 (LVM)？

你可能注意到截图中还有两个 "Disk"：

*   `Disk /dev/mapper/rhel-root` (36.95 GiB)
*   `Disk /dev/mapper/rhel-swap` (2.04 GiB)

> 这些**不是**物理分区，而是**逻辑卷 (Logical Volumes)**。它们都位于 `/dev/sda3` (Linux LVM) 物理分区**内部**。LVM 是一种高级磁盘管理技术，它允许在物理分区之上创建灵活的逻辑卷，可以轻松地调整大小、迁移数据，而无需改动底层的物理分区。
> *   `rhel-root` 是根文件系统 ( `/` )。
> *   `rhel-swap` 是交换空间 (swap)。

## 2. 教程：添加、分区和挂载新磁盘

本节将演示如何为系统添加一块新硬盘，并投入使用。

**重要提示**：以下操作涉及磁盘修改，建议在虚拟机中进行，并提前创建快照以便在出错时恢复。

### 步骤 1: 添加新磁盘 (物理或虚拟)

我通过 VirtualBox 为虚拟机添加了一块 1GB 的新虚拟磁盘。

![通过 VirtualBox 设置添加新磁盘](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBox_7367JWlICm.png)

![创建 VDI 格式的 1GB 磁盘](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBox_3qGUze67M3.png)

添加后，重启虚拟机。使用 `fdisk -l` 命令，你应该能看到新添加的磁盘，例如 `/dev/sdb`。

![fdisk 确认新磁盘 /dev/sdb](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_McqgmhvjuJ.png)

### 步骤 2: 为新磁盘创建分区 (`fdisk`)

1.  运行 `fdisk /dev/sdb` 进入分区编辑器。
    ![运行 fdisk /dev/sdb](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_ZMfEO8MMsG.png)
2.  在提示符下输入 `n` 创建一个新分区。
3.  按照提示配置分区类型、起始和结束扇区（通常可以直接接受默认值以使用整个磁盘）。
4.  最后，输入 `w` 将分区表写入磁盘并退出。
    ![fdisk 创建新分区并保存](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_rZltyB8I81.png)

再次运行 `fdisk -l /dev/sdb`，可以看到新的分区（如 `/dev/sdb1`）已经创建成功。

### 步骤 3: 创建文件系统 (`mkfs`)

分区创建后，需要对其进行格式化，即创建一个文件系统。这里我们使用 XFS 文件系统作为示例。

```bash
mkfs.xfs /dev/sdb1
```

![mkfs.xfs 格式化分区](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_ogEXferWPv.png)

### 步骤 4: 挂载文件系统 (`mount`)

> **什么是挂载？**
> 在 Linux 中，挂载 (Mounting) 是将一个存储设备（或其上的文件系统）附加到主文件系统树上的一个目录（称为“挂载点”）的过程。一旦挂载完成，对该挂载点目录的任何读写操作都会被透明地重定向到所附加的设备上。

1.  首先，创建一个目录作为挂载点：
    ```bash
    mkdir /mnt/data
    ```
2.  然后，将新分区挂载到该目录：
    ```bash
    mount /dev/sdb1 /mnt/data
    ```
3.  使用 `df -h` 验证挂载是否成功。
    ![mount 命令挂载分区](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_Yk1rhY1SRJ.png)

这种挂载是**临时**的，系统重启后会失效。

### 步骤 5: 实现永久挂载 (`/etc/fstab`)

为了让系统在每次启动时自动挂载该分区，我们需要编辑 `/etc/fstab` 文件。

在文件末尾添加一行：
```
/dev/sdb1    /mnt/data    xfs    defaults    0 0
```
![编辑 /etc/fstab 实现永久挂载](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_lRZYamSzP8.png)

现在，你可以使用 `reboot` 或 `init 6` 重启系统。重启后，再次使用 `df -h` 查看，分区应该被自动挂载了。

![重启后验证永久挂载](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_sGe3LXM393.png)

## 3. 总结与思考

### 取消挂载

你可以随时使用 `umount` 命令来卸载一个分区（请注意是 `umount` 而不是 `unmount`）：

```bash
umount /mnt/data
```

### 思考题解答

> **问题**：如果在 `/etc/fstab` 中配置了永久挂载，然后手动执行 `umount`，那么重启后挂载还会生效吗？
>
> **答案**：**会生效**。`umount` 命令只对当前会话有效，它会临时卸载文件系统。但由于 `/etc/fstab` 的配置会在系统每次启动时被读取和执行，因此下次重启后，该分区依然会被自动挂载到指定的挂载点。