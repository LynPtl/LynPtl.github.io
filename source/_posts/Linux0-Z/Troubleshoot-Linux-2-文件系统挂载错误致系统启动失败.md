---
title: Troubleshoot Linux 2 文件系统挂载错误致系统启动失败
date: 2025-11-22 22:29:10
tags:
  - Linux
  - Troubleshooting
  - Mount
categories:
  - Linux入门
  - Linux排错
---
# troubleshoot:文件系统挂载错误致系统启动失败

![1763789078147.jpg](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/uploads/1763789168462-3ov28o-1763789078147.jpg)

今天启动虚拟机直接进紧急模式了，大概率是因为/etc/fstab文件配置错误：例如你之前挂载了一个磁盘，后来把磁盘删了，但忘记删除配置文件里的挂载项。

获取root权限之后使用：
```bash
journalctl -xb | grep failed
```
查看日志。

Job dev-sdb1.device/start failed with result 'timeout' (等待 sdb1 设备超时)

Dependency failed for mnt-data.mount - /mnt/data (因为找不到设备，所以无法挂载到 /mnt/data)
a
系统找不到 /dev/sdb1 这个分区。

问题就锁定好了。

## troubleshoot
1. 获取写权限:现在的系统通常是“只读”的，必须先重新挂载为“读写”模式，否则无法保存修改。输入以下命令并回车：
```bash
mount -o remount,rw /
```
2. 修改配置文件，把之前关于/dev/sdb1的那一行注释掉。
```bash
vi /etc/fstab
```
3. reboot

## 复盘

问题的根源是我新添加了一块和这个/dev/sdb完全一样大小的磁盘。这在 Linux 运维中是非常经典的“盘符漂移”事故。

### 发生了什么？

Linux 系统分配 `/dev/sda`, `/dev/sdb` 等名字的规则极其简单粗暴：**排队领号，先到先得**。它不认硬盘的“脸”（数据），只认硬盘“进门”的顺序。

1.  **以前的情况：**

      * 系统盘 -\> 抢到了 `sda`
      * 你的数据盘 -\> 抢到了 `sdb`
      * `/etc/fstab` 里写着：**“启动时去挂载 `/dev/sdb1`”**。

2.  **刚才的操作：**

      * 你加了一块新硬盘。
      * 在虚拟机的底层（SCSI 总线）顺序中，这块**新硬盘**可能插在了**旧硬盘**的前面（或者仅仅是因为扫描顺序的随机扰动）。

3.  **现在的启动顺序（漂移发生）：**

      * 系统盘 -\> 依然是 `sda`。
      * **新硬盘** -\> 被内核先发现了，它抢走了 **`sdb`** 的名字。
      * **旧硬盘**（原本的数据盘） -\> 被挤到了后面，变成了 **`sdc`**。

4.  **为什么会报错 Timeout？**

      * 系统根据 `/etc/fstab` 去找 `/dev/sdb1`。
      * 现在的 `/dev/sdb` 是刚加的那块**崭新的空盘**。
      * 空盘没有分区，自然就没有 `sdb1` 这个分区设备。
      * 系统找不到 `sdb1`，等了 90 秒（默认超时时间），最后报错 `Timeout`，被踢进紧急模式。

### 建议使用UUID来作为盘名

![VirtualBoxVM_RQzNBudtvu.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_RQzNBudtvu.png)

使用`lsblk`我们可以看到那个我们曾经的数据盘的确到/dev/sdc1上去了。

1.  **查看真·数据盘的 UUID：**

    ```bash
    blkid /dev/sdc1
    ```

    复制输出的 `UUID="xxxx-xxxx..."` 那一串。

2.  **修改 `/etc/fstab`：**
    把：

    ```text
    /dev/sdb1  /mnt/data  xfs  defaults  0 0
    ```

    改成：

    ```text
    UUID=刚刚复制的UUID  /mnt/data  xfs  defaults  0 0
    ```
![VirtualBoxVM_I76zkBZIpH.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_I76zkBZIpH.png)

这样改完后，无论以后加多少硬盘，插在什么顺序，系统都只认这个“身份证号”，再也不会认错人了。