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
``<code>bash
journalctl -xb | grep failed
</code>`<code>
查看日志。

Job dev-sdb1.device/start failed with result 'timeout' (等待 sdb1 设备超时)

Dependency failed for mnt-data.mount - /mnt/data (因为找不到设备，所以无法挂载到 /mnt/data)
a
系统找不到 /dev/sdb1 这个分区。

问题就锁定好了。

## troubleshoot
1. 获取写权限:现在的系统通常是“只读”的，必须先重新挂载为“读写”模式，否则无法保存修改。输入以下命令并回车：
</code>`<code>bash
mount -o remount,rw /
</code>`<code>
2. 修改配置文件，把之前关于/dev/sdb1的那一行注释掉。
</code>`<code>bash
vi /etc/fstab
</code>`<code>
3. reboot

## 复盘

问题的根源是我新添加了一块和这个/dev/sdb完全一样大小的磁盘。这在 Linux 运维中是非常经典的“盘符漂移”事故。

### 发生了什么？

Linux 系统分配 </code>/dev/sda<code>, </code>/dev/sdb<code> 等名字的规则极其简单粗暴：<strong>排队领号，先到先得</strong>。它不认硬盘的“脸”（数据），只认硬盘“进门”的顺序。

1.  <strong>以前的情况：</strong>

      * 系统盘 -\> 抢到了 </code>sda<code>
      <em> 你的数据盘 -\> 抢到了 </code>sdb<code>
      </em> </code>/etc/fstab<code> 里写着：<strong>“启动时去挂载 </code>/dev/sdb1<code>”</strong>。

2.  <strong>刚才的操作：</strong>

      <em> 你加了一块新硬盘。
      </em> 在虚拟机的底层（SCSI 总线）顺序中，这块<strong>新硬盘</strong>可能插在了<strong>旧硬盘</strong>的前面（或者仅仅是因为扫描顺序的随机扰动）。

3.  <strong>现在的启动顺序（漂移发生）：</strong>

      <em> 系统盘 -\> 依然是 </code>sda<code>。
      </em> <strong>新硬盘</strong> -\> 被内核先发现了，它抢走了 <strong></code>sdb<code></strong> 的名字。
      <em> <strong>旧硬盘</strong>（原本的数据盘） -\> 被挤到了后面，变成了 <strong></code>sdc<code></strong>。

4.  <strong>为什么会报错 Timeout？</strong>

      </em> 系统根据 </code>/etc/fstab<code> 去找 </code>/dev/sdb1<code>。
      <em> 现在的 </code>/dev/sdb<code> 是刚加的那块<strong>崭新的空盘</strong>。
      </em> 空盘没有分区，自然就没有 </code>sdb1<code> 这个分区设备。
      * 系统找不到 </code>sdb1<code>，等了 90 秒（默认超时时间），最后报错 </code>Timeout<code>，被踢进紧急模式。

### 建议使用UUID来作为盘名

![VirtualBoxVM_RQzNBudtvu.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_RQzNBudtvu.png)

使用</code>lsblk<code>我们可以看到那个我们曾经的数据盘的确到/dev/sdc1上去了。

1.  <strong>查看真·数据盘的 UUID：</strong>

    </code>`<code>bash
    blkid /dev/sdc1
    </code>`<code>

    复制输出的 </code>UUID="xxxx-xxxx..."<code> 那一串。

2.  <strong>修改 </code>/etc/fstab<code>：</strong>
    把：

    </code>`<code>text
    /dev/sdb1  /mnt/data  xfs  defaults  0 0
    </code>`<code>

    改成：

    </code>`<code>text
    UUID=刚刚复制的UUID  /mnt/data  xfs  defaults  0 0
    </code>``
![VirtualBoxVM_I76zkBZIpH.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_I76zkBZIpH.png)

这样改完后，无论以后加多少硬盘，插在什么顺序，系统都只认这个“身份证号”，再也不会认错人了。