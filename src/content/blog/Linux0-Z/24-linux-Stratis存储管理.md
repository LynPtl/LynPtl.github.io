---
title: 24.linux Stratis存储管理
date: 2025-11-23 00:06:44
tags:
  - Linux
  - Stratis
  - Storage
categories:
  - Linux入门
---
# Linux Stratis 存储管理

本节将介绍 Red Hat 8 中引入的下一代卷管理解决方案 Stratis。

## 1. Stratis 简介

Stratis 是一种新型的本地存储管理解决方案，旨在简化存储配置并提供类似 ZFS 和 Btrfs 的高级功能。它通过在后台整合现有的存储技术（如 LVM 和 XFS），为系统管理员提供一个更易于使用和功能更丰富的接口。

### 架构对比：LVM vs. Stratis

Stratis 的核心优势在于其简化的架构。传统的 LVM 存储栈层次较多，管理相对复杂，而 Stratis 将多个层次合并为一个统一的“存储池”，大大降低了管理的复杂度。

> <strong>图示解读</strong>:
> <em>   <strong>LVM 架构</strong>: 从底向上依次是：硬盘 -> 分区 -> 物理卷 (PV) -> 卷组 (VG) -> 逻辑卷 (LV) -> 文件系统。管理员需要分别对这些层次进行操作。
> </em>   <strong>Stratis 架构</strong>: 从底向上依次是：一个或多个块设备 (Block devices) -> 单一的存储池 (Pool) -> 一个或多个文件系统 (Filesystem)。管理员的大部分操作都集中在“池”和“文件系统”这两个简单的概念上。

![Acrobat_S8CkfiJbOV.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Acrobat_S8CkfiJbOV.png)

### 核心概念

<em>   <strong>块设备 (Block Devices)</strong>: 指的是底层的物理存储，例如硬盘 (<code>/dev/sda</code>) 或磁盘分区 (<code>/dev/sdb1</code>)。
</em>   <strong>池 (Pool)</strong>: 由一个或多个块设备组成，是 Stratis 的核心存储单元。它汇集了所有物理存储，形成一个统一的、可灵活分配的资源池。
<em>   <strong>文件系统 (Filesystems)</strong>: 从池中创建，供用户实际使用。Stratis 的文件系统默认是精简配置 (thin-provisioned) 的，这意味着它们只在实际写入数据时才占用池空间，并且可以按需自动增长，无需手动扩容。

### 主要优势

</em>   <strong>简化管理</strong>: 将复杂的存储层次抽象为“池”和“文件系统”，命令更直观。
<em>   <strong>精简配置</strong>: 默认开启，提高了存储利用率。
</em>   <strong>快照与回滚</strong>: 支持对文件系统创建写时复制 (copy-on-write) 快照，便于备份和恢复。
<ul><li>  <strong>池化管理</strong>: 轻松添加新磁盘来扩展存储池的容量。</li></ul>

## 2. 安装与配置 Stratis

以下是安装和启用 Stratis 服务的基本步骤。

### 步骤 1: 安装 Stratis 软件包

使用 <code>yum</code> 或 <code>dnf</code> 安装 <code>stratis-cli</code> 和 <code>stratisd</code>。

``<code>bash
yum/dnf install stratis-cli stratisd
</code>`<code>
![VirtualBoxVM_J1p09o0PLm.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_J1p09o0PLm.png)

### 步骤 2: 启动并启用 Stratis 服务

使用 </code>systemctl<code> 启动并设置为开机自启。

</code>`<code>bash
systemctl enable --now stratisd
</code>`<code>
> <strong>注意</strong>: </code>enable --now<code> 相当于同时执行 </code>enable<code> 和 </code>start<code>。

## 3. 创建 Stratis 存储池 (Pool)

存储池是由一个或多个块设备组成的。

### 步骤 1: 准备块设备

首先，需要有可用的块设备。例如，可以从虚拟化软件中添加两个 5GB 的新磁盘。添加后，使用 </code>lsblk<code> 命令验证它们在操作系统中是否可见（例如 </code>/dev/sdb<code>, </code>/dev/sdc<code>）。

</code>`<code>bash
lsblk
</code>`<code>

### 步骤 2: 创建一个新的 Stratis 池

使用 </code>stratis pool create<code> 命令创建一个名为 </code>pool1<code> 的新池，并将设备 </code>/dev/sdb<code> 加入其中。

</code>`<code>bash
stratis pool create pool1 /dev/sdb
</code>`<code>

### 步骤 3: 查看池列表

验证池是否已成功创建。

</code>`<code>bash
stratis pool list
</code>`<code>

### 步骤 4: 扩展存储池

如果需要增加池的容量，可以将新的块设备（例如 </code>/dev/sdc<code>）添加到现有池中。

</code>`<code>bash
stratis pool add-data pool1 /dev/sdc
</code>`<code>
> <strong>检查</strong>: 再次运行 </code>stratis pool list<code> 可以看到池的容量增加了。

## 4. 创建 Stratis 文件系统

文件系统是在 Stratis 池之上创建的。

### 步骤 1: 创建一个新的文件系统

在 </code>pool1<code> 池中创建一个名为 </code>fs1<code> 的文件系统。

</code>`<code>bash
stratis filesystem create pool1 fs1
</code>`<code>
> <strong>说明</strong>: 文件系统的初始大小会很小（例如 546MB），因为它采用了精简配置，会根据数据的写入自动增长。

### 步骤 2: 查看文件系统列表

验证文件系统是否已创建。

</code>`<code>bash
stratis filesystem list
</code>`<code>

### 步骤 3: 创建挂载点并挂载

创建一个目录作为挂载点，然后将 Stratis 文件系统挂载上去。

</code>`<code>bash
mkdir /bigdata
mount /dev/stratis/pool1/fs1 /bigdata
lsblk
</code>`<code>

### 步骤 4: 实现开机自动挂载

为了让系统重启后能自动挂载，需要将条目添加到 </code>/etc/fstab<code> 文件中。

> <strong>注意</strong>: 下面的 UUID 是一个示例，你需要用 </code>lsblk -o +UUID<code> 或 </code>blkid<code> 命令查找你自己的文件系统 UUID。

</code>`<code>
UUID="asf-0887afgdja-" /fs1 xfs defaults,x-systemd.requires=stratisd.service 0 0
</code>`<code>

## 5. 创建文件系统快照

Stratis 支持为其文件系统创建快照。

### 步骤 1: 创建快照

为 </code>pool1<code> 池中的 </code>fs1<code> 文件系统创建一个名为 </code>fs1-snap<code> 的快照。

</code>`<code>bash
stratis filesystem snapshot pool1 fs1 fs1-snap
</code>`<code>
> <strong>注意</strong>: PDF原文中的 </code>startis<code> 疑似为 </code>stratis<code> 的拼写错误，已在此修正。

### 步骤 2: 查看快照

可以使用 </code>stratis filesystem list<code> 命令查看已创建的文件系统和快照。

</code>`<code>bash
stratis filesystem list
</code>``
