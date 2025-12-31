---
title: 27.linux使用防火墙管理网络安全
date: 2025-11-23 00:08:58
tags:
  - Linux
  - Firewall
  - Security
categories:
  - Linux入门
---
# Linux 使用 firewalld 管理网络安全

本章将介绍 `firewalld`，这是现代 Linux 发行版中用于管理网络安全的动态防火墙守护进程。

## 1. 防火墙简介

*   **什么是防火墙?**
    *   广义上，防火墙是一道阻止火势蔓延的墙。
    *   在 IT 领域，当数据包进出一个服务器时，防火墙会根据预设的规则来检测数据包信息，以决定是允许还是阻止其通过。
    *   简单来说，防火墙就像一个“看门人”、“保安”或“盾牌”，它根据给定的规则来决定谁可以进出。

*   **防火墙的两种类型:**
    *   **软件防火墙**: 运行在操作系统之上。
    *   **硬件防火墙**: 内置了防火墙软件的专用设备。

![Acrobat_UxVTFAFdh1.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Acrobat_UxVTFAFdh1.png)

## 2. `firewalld` 概述

`firewalld` 的工作方式与 `iptables` 类似，但它有自己的命令行工具 `firewall-cmd`。

*   **预定义服务**: 它内置了一些预定义的服务规则（如 NFS, NTP, HTTPD 等），可以轻松开启或关闭。
*   **核心组件**: `firewalld` 同样包含以下组件：
    *   表 (Table)
    *   链 (Chains)
    *   规则 (Rules)
    *   目标 (Targets)

## 3. `firewalld` 基础设置与命令

#### `firewalld` 与 `iptables`

您可以选择运行 `iptables` 或 `firewalld`，但通常只运行其中一个。为确保 `firewalld` 正常工作，建议停止并禁用 `iptables`。

```bash
# 确保 iptables 服务被停止、禁用并屏蔽
systemctl stop iptables
systemctl disable iptables
systemctl mask iptables
```

#### 安装与启动

```bash
# 检查 firewalld 软件包是否已安装
rpm -qa | grep firewalld

# 启动并设置 firewalld 开机自启
systemctl start firewalld
systemctl enable firewalld
```

#### 常用查看命令

```bash
# 查看防火墙的完整规则集
firewall-cmd --list-all

# 获取所有 firewalld 支持的预定义服务列表
firewall-cmd --get-services

# 重新加载防火墙配置，使永久规则生效
firewall-cmd --reload
```

## 4. `firewalld` 实践示例

### 区域 (Zones) 管理

`firewalld` 拥有多个区域，可以为不同的网络环境设置不同的安全策略。

```bash
# 获取所有可用区域的列表
firewall-cmd --get-zones

# 获取当前活动的区域及其关联的网卡
firewall-cmd --get-active-zones

# 获取 public 区域的防火墙规则
# (如果 public 是默认区域，则 --zone=public 是可选的)
firewall-cmd --zone=public --list-all
# 或者
firewall-cmd --list-all
```

### 服务 (Service) 管理

```bash
# 添加 http 服务 (运行时配置，重启后失效)
firewall-cmd --add-service=http

# 移除 http 服务
firewall-cmd --remove-service=http

# 重新加载配置 (例如，在一个永久规则被修改后)
firewall-cmd --reload

# 永久添加 http 服务 (重启后保留)
firewall-cmd --add-service=http --permanent

# 永久移除 http 服务
firewall-cmd --remove-service=http --permanent
# (注意: 修改永久规则后需 --reload 才能立即生效)
```

### 端口 (Port) 管理

```bash
# 添加一个端口 (例如 1110/tcp)
firewall-cmd --add-port=1110/tcp

# 移除一个端口
firewall-cmd --remove-port=1110/tcp
```

### 高级规则：富规则 (Rich Rules) 与直接规则 (Direct Rules)

#### 使用富规则拒绝特定 IP

```bash
# 拒绝来自 IP 192.168.0.25 的所有流量
firewall-cmd --add-rich-rule='rule family="ipv4" source address="192.168.0.25" reject'
```

#### 阻止 ICMP (Ping) 流量

```bash
# 阻止传入的 ICMP 请求
firewall-cmd --add-icmp-block-inversion

# 解除 ICMP 阻止
firewall-cmd --remove-icmp-block-inversion
```

#### 使用直接规则阻止出站流量

直接规则允许您插入原生的 `iptables` 规则。

```bash
# 1. 查找网站对应的 IP 地址
host -t a www.facebook.com

# 2. 添加一条直接规则来阻止到该 IP 的出站流量
# (假设查到的 IP 是 31.13.71.36)
firewall-cmd --direct --add-rule ipv4 filter OUTPUT 0 -d 31.13.71.36 -j DROP
```

## 5. 添加自定义服务

如果您有一个未被 `firewalld` 预定义的第三方服务，可以为其创建服务文件。

1.  **定位服务目录**:
    `firewalld` 的服务文件位于 `/usr/lib/firewalld/services/`。

2.  **创建服务文件**:
    最简单的方式是复制一个现有的 `.xml` 文件，然后修改其服务名和端口号。下图演示了如何创建一个名为 `test.xml` 的文件来定义一个端口为 `22` 的 `SSH` 服务。

![Acrobat_mnt93iut9h.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Acrobat_mnt93iut9h.png)

    *   `<short>`: 服务的短名称。
    *   `<description>`: 服务的描述。
    *   `<port>`: 定义服务的协议和端口。

3.  **应用自定义服务**:
    以添加一个非预定义的 `sap` 服务为例 (假设其服务文件 `sap.xml` 已按上述方法创建好)。
    ```bash
    # 重启 firewalld 以加载新的服务文件
    systemctl restart firewalld

    # 验证新服务是否已被识别
    firewall-cmd --get-services

    # 将新服务添加到防火墙规则中
    firewall-cmd --add-service=sap
    ```
