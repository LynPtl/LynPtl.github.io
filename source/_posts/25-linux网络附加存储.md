---
title: 25.linux网络附加存储
date: 2025-11-23 00:07:23
categories:
  - Linux入门
---
# Linux 网络附加存储：NFS 与 Samba

本章将介绍两种在 Linux 环境中常用的网络附加存储技术：NFS (网络文件系统) 和 Samba，内容将严格遵循原始教学材料。

## 1. 网络文件系统 (NFS)

NFS (Network File System) 是由 Sun Microsystems 开发的一种客户端/服务器文件系统协议，它允许用户像访问本地文件一样访问网络上其他计算机上的文件。

通过 NFS，服务器可以“导出”其文件系统的一部分，而客户端则可以“挂载”这些导出的目录，从而实现跨网络的文件共享。

![NFS_Diagram.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/NFS_Diagram.png)

### NFS 服务器配置步骤

以下是在服务器端设置 NFS 共享的基本步骤。

#### 步骤 1: 安装 NFS 软件包

```bash
# (大多数情况下已经预装)
yum install nfs-utils libnfsidmap
```

#### 步骤 2: 启用并启动 NFS 服务

```bash
systemctl enable rpcbind
systemctl enable nfs-server
systemctl start rpcbind
systemctl start nfs-server
systemctl start rpc-statd
systemctl start nfs-idmapd
```

#### 步骤 3: 防火墙配置

确保防火墙允许 NFS 通信。对于生产环境，应添加永久规则。

```bash
# 允许NFS服务
firewall-cmd --permanent --add-service=nfs
# 允许RPC绑定和挂载服务
firewall-cmd --permanent --add-service=rpc-bind
firewall-cmd --permanent --add-service=mountd
# 重新加载防火墙配置
firewall-cmd --reload
```
> **测试环境注意**: 如果在测试环境中遇到连接问题，可以临时禁用防火墙以进行故障排除，但不建议在生产环境中使用。
> ```bash
> systemctl stop firewalld
> systemctl disable firewalld
> ```

#### 步骤 4: 创建并配置共享目录

1.  创建一个用于共享的目录。

    ```bash
    mkdir /mypretzels
    chmod a+rwx /mypretzels
    ```

2.  编辑 `/etc/exports` 文件，定义共享规则。

    `/etc/exports` 文件的格式为： `<共享目录> <客户端地址>(<选项>)`

    ```bash
    # 示例1: 仅共享给单个主机
    /mypretzels 192.168.12.7(rw,sync,no_root_squash)

    # 示例2: 共享给所有主机
    /mypretzels *(rw,sync,no_root_squash)
    ```
    *   **rw**: 允许读写操作。
    *   **sync**: 所有文件系统更改会立即同步写入磁盘。
    *   **no_root_squash**: 允许客户端的 root 用户以服务器端 root 用户的身份访问文件，具有最高权限。

#### 步骤 5: 应用配置

使 `exports` 文件中的配置生效。

```bash
exportfs -rv
```

### NFS 客户端配置步骤

以下是在客户端挂载 NFS 共享的步骤。

#### 步骤 1: 安装 NFS 软件包

```bash
yum install nfs-utils rpcbind
```

#### 步骤 2: 启动 RPC 服务

```bash
systemctl rpcbind start
```

#### 步骤 3: 查看服务器上的可用共享

```bash
# (NFS 服务器 IP)
showmount -e 192.168.1.5
```

#### 步骤 4: 创建挂载点并挂载

```bash
mkdir /mnt/kramer
mount 192.168.1.5:/mypretzels /mnt/kramer
```

#### 步骤 5: 验证和卸载

```bash
# 验证挂载
df -h
# 卸载
umount /mnt/kramer
```

---

## 2. Samba：下载、安装和配置

*   Samba 是一个 Linux 工具或实用程序，允许将 Linux 资源（如文件和打印机）共享给其他操作系统。
*   它的工作方式与 NFS 完全一样，但区别在于 NFS 在 Linux 或类 Unix 系统内部共享，而 Samba 则与其他操作系统（如 Windows, MAC 等）共享。
*   例如，计算机 "A" 使用 Samba 共享其文件系统给计算机 "B"，那么计算机 "B" 将会看到这个共享文件系统，就好像它被挂载为本地文件系统一样。
*   Samba 通过一种名为 **SMB** (Server Message Block) 的协议来共享其文件系统，该协议由 IBM 发明。
*   另一个用于共享 Samba 的协议是 **CIFS** (Common Internet File System)，由微软发明，也称为 NMB (NetBios Name server)。
*   CIFS 成为了 SMB 的扩展，现在微软已经推出了更新版本的 SMB v2 和 v3，它们在行业中被广泛使用。
*   简单来说，当人们使用 SMB 或 CIFS 时，他们谈论的是完全相同的东西。这两者不仅在讨论中可以互换，在应用中也是如此，即说 CIFS 的客户端可以与说 SMB 的服务器通信，反之亦然。因为 CIFS 是 SMB 的一种形式。

### 分步安装说明

**第一步，请务必为您的虚拟机创建一个快照。**

#### 步骤 1: 安装 Samba 软件包

```bash
# 成为 root 用户
# 安装 samba 相关的包
yum install samba samba-client samba-common
```

#### 步骤 2: 配置防火墙

*   **选项 A: (推荐) 允许 Samba 通过防火墙**
    ```bash
    firewall-cmd --permanent --zone=public --add-service=samba
    firewall-cmd --reload
    ```
*   **选项 B: (仅测试) 停止并禁用防火墙**
    ```bash
    systemctl stop firewalld
    systemctl disable firewalld
    ```

#### 步骤 3: 创建共享目录并设置权限

```bash
mkdir -p /samba/morepretzels
chmod a+rwx /samba/morepretzels
# 将目录所有者设为 nobody，用于匿名访问
chown -R nobody:nobody /samba
```

#### 步骤 4: 配置 SELinux

*   **选项 A: (推荐) 设置 SELinux 安全上下文**
    > (仅当 SELinux 启用时)
    ```bash
    # 为 samba 共享目录设置正确的上下文
    chcon -t samba_share_t /samba/morepretzels
    ```
*   **选项 B: (仅测试) 禁用 SELinux**
    ```bash
    # 检查 SELinux 状态
    sestatus
    # 编辑配置文件
    vi /etc/selinux/config
    # 将 SELINUX=enforcing 修改为 SELINUX=disabled
    # 重启
    reboot
    ```

#### 步骤 5: 修改 `smb.conf` 文件以添加新的共享文件系统
> **注意: 请务必创建 `smb.conf` 文件的副本。**
> 删除 `smb.conf` 文件中的所有内容，并添加以下参数：

```ini
[global]
    workgroup = WORKGROUP
    netbios name = centos
    security = user
    map to guest = bad user
    dns proxy = no

[Anonymous]
    path = /samba/morepretzels
    browsable = yes
    writable = yes
    guest ok = yes
    guest only = yes
    read only = no
```

#### 步骤 6: 验证设置并启动服务

```bash
# 验证配置
testparm
# 启用并启动 Samba 服务
systemctl enable smb
systemctl enable nmb
systemctl start smb
systemctl start nmb
```

---

### 客户端挂载

#### 在 Windows 客户端上挂载

1.  转到“开始”菜单或“搜索栏”。
2.  输入 `\\192.168.1.95` (这是我的服务器 IP，您可以通过运行 `ifconfig` 命令来检查您的 Linux CentOS IP)。
3.  访问 `Anonymous` 共享。

#### 在 Linux 客户端上挂载

```bash
# 成为 root 用户
# 安装 cifs-utils
yum -y install cifs-utils samba-client
# 创建挂载点目录
mkdir /mnt/sambashare
# 挂载 samba 共享 (入口无需密码)
mount -t cifs //192.168.1.95/Anonymous /mnt/sambashare/
```

---

### 配置安全的 Samba 服务器

#### 步骤 1: 创建用于认证的用户和组

```bash
# 添加用户 larry 和组 smbgrp
useradd larry
groupadd smbgrp
# 将 larry 添加到 smbgrp 组
usermod -a -G smbgrp larry
# 为 larry 设置 Samba 密码
smbpasswd -a larry
# --> 输入并重复您的 SAMBA 密码
```

#### 步骤 2: 创建新的安全共享目录并设置权限

```bash
mkdir /samba/securepretzels
chown -R larry:smbgrp /samba/securepretzels
chmod -R 0770 /samba/securepretzels
chcon -t samba_share_t /samba/securepretzels
```

#### 步骤 3: 编辑配置文件 `/etc/samba/smb.conf`
> (创建备份副本)
> 添加以下行：

```ini
[Secure]
    path = /samba/securepretzels
    valid users = @smbgrp
    guest ok = no
    writable = yes
    browsable = yes
```

#### 步骤 4: 重启服务

```bash
systemctl restart smb
systemctl restart nmb
```
现在，只有 `smbgrp` 组内的用户才能使用其 Samba 密码访问 `Secure` 共享。
