---
title: 23.linux管理逻辑卷LVM
date: 2025-11-22 22:28:34
tags:
  - Linux
  - LVM
  - Storage
categories:
  - Linux入门
---
# Linux 管理逻辑卷LVM

本文将介绍 Linux 中逻辑卷管理 (LVM) 的概念，它们是比传统分区更高级的存储管理技术。

## 1. LVM (Logical Volume Management)

LVM 是一种强大的存储管理技术，它允许你将多个物理磁盘或分区组合成一个或多个“卷组” (Volume Groups)，然后在这些卷组之上创建灵活的“逻辑卷” (Logical Volumes)。

### 核心优势

*   **灵活性**：可以轻松地调整逻辑卷的大小（扩大或缩小），而无需关心底层物理磁盘的布局。
*   **抽象化**：将物理存储抽象化，使存储管理更加便捷。
*   **跨磁盘**：一个逻辑卷可以跨越多个物理磁盘。

### LVM 架构

LVM 的架构分为几个层次，从底层到顶层依次是：

![Acrobat_oX1rBT6fuN.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Acrobat_oX1rBT6fuN.png)

1.  **硬盘 (Hard Disks)**：物理存储设备，如 `/dev/sda`, `/dev/sdb`。
2.  **分区 (Partitions)**：在硬盘上划分出的区域，需要将类型设置为 "Linux LVM"。
3.  **物理卷 (Physical Volumes - PV)**：将 LVM 类型的分区初始化后得到的，是 LVM 的基本构建块。
4.  **卷组 (Volume Groups - VG)**：一个或多个物理卷组成的存储池。
5.  **逻辑卷 (Logical Volumes - LV)**：从卷组中划分出的“虚拟分区”，可以像普通分区一样被格式化和挂载。
6.  **文件系统 (File System)**：在逻辑卷之上创建的文件系统，如 XFS, ext4。

> **图示解读**:
> *   多个物理磁盘 (Disks) 被组合成一个卷组 (Volume Group)。
> *   从卷组中可以划分出多个逻辑卷 (Logical Volumes)，例如 `home`, `system`, `data1` 等。
> *   这些逻辑卷可以被挂载到不同的目录，如 `/`, `/home`, `/data1`。

![Acrobat_QzYRN2lTUw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Acrobat_QzYRN2lTUw.png)

## 2. LVM 操作场景：扩容磁盘

当一个文件系统（例如 `/oracle`）空间不足时，LVM 提供了非常灵活的解决方案。

### 问题场景

假设 `/oracle` 目录挂载在一个 1GB 的逻辑卷上，现在空间已满。

### 解决方案

你有以下几种选择：

*   **清理文件**：删除旧的或不再需要的文件以释放空间。
*   **添加新物理磁盘**：添加一块全新的硬盘，创建分区、物理卷，然后将其加入现有的卷组，最后扩容逻辑卷。
*   **添加新虚拟磁盘**：与添加物理磁盘类似，但操作在虚拟化层完成。
*   **通过 LVM 扩容**：这是 LVM 最强大的功能之一。如果卷组中还有未分配的空间，可以直接扩展逻辑卷，然后扩展文件系统。

## 3. 实验：LVM 创建与管理

下面我们通过一个完整的实验来演示如何从一块新磁盘开始创建和管理 LVM。

### 准备工作：添加新磁盘并分区

首先，为虚拟机添加一块新的虚拟硬盘（本例中为 1GB）。然后使用 `fdisk` 对其进行分区。

> **注意**：请根据你的环境确认新磁盘的设备名，例如 `/dev/sdb`, `/dev/sdc` 等。

```bash
fdisk /dev/sdb
```

![VirtualBoxVM_tgl7RMmkEs.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_tgl7RMmkEs.png)

在 `fdisk` 交互界面中，按 `n` 创建一个新分区。

### 步骤 1: 修改分区类型为 "Linux LVM"

创建完分区后，不要立即写入退出。我们需要将分区类型更改为 LVM。

1.  按 `t` (change a partition's system id).
2.  系统会提示输入 Hex code。可以按 `L` 查看所有支持的类型。
3.  找到 "Linux LVM" 对应的代码，通常是 `8e`。
4.  输入 `8e` 并回车。

![VirtualBoxVM_kdZyWfuBRc.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_kdZyWfuBRc.png)

![VirtualBoxVM_dVUPcdZXT2.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_dVUPcdZXT2.png)

### 步骤 2: 保存分区表并创建物理卷 (PV)

1.  在 `fdisk` 中按 `w` 保存更改并退出。

![VirtualBoxVM_JOrWHPBagk.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_JOrWHPBagk.png)

2.  使用 `pvcreate` 命令在新创建的分区上初始化物理卷。

```bash
pvcreate /dev/sdb1
```

![VirtualBoxVM_jigkScShRG.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_jigkScShRG.png)

> **检查**: 你可以使用 `pvdisplay` 命令查看物理卷的详细信息。

### 步骤 3: 创建卷组 (VG)

使用 `vgcreate` 命令创建一个名为 `oracle_vg` 的新卷组，并将刚才创建的物理卷 `/dev/sdb1` 添加进去。

```bash
vgcreate oracle_vg /dev/sdb1
```

![VirtualBoxVM_6DwJ6paE0e.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_6DwJ6paE0e.png)

### 步骤 4: 创建逻辑卷 (LV)

从卷组 `oracle_vg` 中划分出一部分空间来创建逻辑卷。

*   `-n oracle_lv`: 指定逻辑卷的名称为 `oracle_lv`。
*   `-L 500M`: 指定逻辑卷的大小为 500MB。
*   `oracle_vg`: 从 `oracle_vg` 卷组中分配。

```bash
lvcreate -n oracle_lv -L 500M oracle_vg
```

![VirtualBoxVM_wlbMuOBTkw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_wlbMuOBTkw.png)

### 步骤 5: 创建文件系统并挂载

逻辑卷创建后，它是一个原始的块设备。我们需要在上面创建文件系统才能使用。

1.  格式化逻辑卷 (路径通常是 `/dev/卷组名/逻辑卷名`)。

```bash
mkfs.xfs /dev/oracle_vg/oracle_lv
```

2.  创建挂载点并挂载。

```bash
mkdir /oracle
mount /dev/oracle_vg/oracle_lv /oracle
```

![VirtualBoxVM_fmwKuEchmb.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_fmwKuEchmb.png)



## 4. 实验：LVM 扩容

现在，我们模拟一个场景：`/oracle` 目录空间不足，需要扩容。

### 准备工作：添加新磁盘

我们添加一块新的 512MB 虚拟磁盘，并重复之前的分区步骤，将其分区类型也设置为 `8e` (Linux LVM)。

![VirtualBox_vav1sSOK2G.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBox_vav1sSOK2G.png)

![VirtualBoxVM_lj8sBPqT2n.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_lj8sBPqT2n.png)

> **注意**: 添加新硬件后，建议重启或使用 `partprobe` 等命令让系统重新扫描磁盘。重启后请用 `fdisk -l` 再次确认新磁盘的设备名（例如 `/dev/sdc`）。

![VirtualBoxVM_NIsrwTd5u5.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_NIsrwTd5u5.png)

### 步骤 1: 创建新的物理卷 (PV)

在新磁盘的分区（例如 `/dev/sdc1`）上创建物理卷。

```bash
pvcreate /dev/sdc1
```

![VirtualBoxVM_U6T4WIqYrO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_U6T4WIqYrO.png)

### 步骤 2: 扩展卷组 (VG)

使用 `vgextend` 命令将新的物理卷加入到现有的 `oracle_vg` 卷组中，为卷组增加容量。

```bash
vgextend oracle_vg /dev/sdc1
```

> **检查**: 此时使用 `vgdisplay oracle_vg`，你会看到卷组的总大小 (VG Size) 已经增加了。

### 步骤 3: 扩展逻辑卷 (LV)

使用 `lvextend` 命令来扩展逻辑卷。

*   `-L +512M`: 表示在原有基础上增加 512MB。你也可以用 `-l +100%FREE` 来使用卷组中所有剩余的空闲空间。
*   `/dev/oracle_vg/oracle_lv`: 你要扩展的目标逻辑卷。

```bash
lvextend -L +512M /dev/oracle_vg/oracle_lv
```

![VirtualBoxVM_0QbTNw0zt0.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_0QbTNw0zt0.png)

### 步骤 4: 扩展文件系统

最后一步是通知文件系统去使用新增加的空间。**这是非常关键的一步，否则空间虽然分配了，但操作系统无法使用。**

对于 XFS 文件系统，使用 `xfs_growfs` 命令。

```bash
xfs_growfs /oracle
```

对于 ext2/3/4 文件系统，使用 `resize2fs` 命令。

```bash
# resize2fs /dev/oracle_vg/oracle_lv  (ext4示例)
```

![VirtualBoxVM_JQjPhpxp6c.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_JQjPhpxp6c.png)

### 最终检查

使用 `df -h` 命令检查 `/oracle` 目录，可以看到文件系统的大小确实已经扩展成功。

![VirtualBoxVM_C7zbaQP9YM.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_C7zbaQP9YM.png)