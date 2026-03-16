---
title: 12.linux网络管理
date: 2025-10-30 23:58:19
tags:
  - Linux
  - Network
categories:
  - Linux入门
---
# Linux 网络管理

## 1. 静态 IP vs. DHCP

<em>   IP 是互联网协议的缩写，分配给您的计算机以便访问网络。私有 IP 用于内网通信，公有 IP 用于互联网/外网通信。
</em>   <strong>静态 IP</strong>: 地址不会改变。
<em>   <strong>动态 IP</strong>: 系统重启后地址会改变。

---

## 2. 操作系统网络组件

</em>   网络接口
<em>   MAC 地址
</em>   子网掩码
<em>   网关
</em>   DNS (域名系统)

---

## 3. NetworkManager 入门

<em>   NetworkManager 是一项服务和一组工具，旨在简化 Linux 系统上的网络配置管理，是 RHEL 8 上的默认网络管理服务。
</em>   它使网络管理更容易。
<em>   它为用户提供了简单的连接设置。
</em>   NetworkManager 通过不同的工具提供管理，例如 GUI、nmtui 和 nmcli。

---

## 4. 网络配置方法

<em>   <strong>nmcli</strong>: NetworkManager 命令行界面的缩写。当图形环境不可用时，此工具很有用，也可以在脚本中使用以进行网络配置更改。
![VirtualBoxVM_BYqsZF83PH.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_BYqsZF83PH.png)
</em>   <strong>nmtui</strong>: NetworkManager 文本用户界面的缩写。该工具可以在任何终端窗口中运行，并允许通过菜单选择和输入数据进行更改。
<em>   <strong>nm-connection-editor</strong>: 一个完整的图形管理工具，提供对大多数 NetworkManager 配置选项的访问。只能通过桌面或控制台访问。
![VirtualBoxVM_RXVjnuTjYe.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_RXVjnuTjYe.png)
</em>   <strong>GNOME 设置</strong>: GNOME 桌面设置应用程序的网络屏幕允许执行基本的网络管理任务。
<code>gnome-control-center</code>
![VirtualBoxVM_ReOmgUE50u.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_ReOmgUE50u.png)

---

## 5. 网络文件和基本命令

### 文件:

<ul><li>  <code>/etc/NetworkManager/system-connections/</code></li></ul>
![VirtualBoxVM_eV442ZqdqZ.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_eV442ZqdqZ.png)
<em>   <code>/etc/hosts</code>
![VirtualBoxVM_QcRSakWw8P.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_QcRSakWw8P.png)
跟踪ip->主机名。
</em>   <code>/etc/hostname</code>
如果你需要修改你的主机名，你只需要把你的名字写入这里，之后重启NetworkManager。
<em>   <code>/etc/resolv.conf</code>
![VirtualBoxVM_hAvXNY1pVE.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_hAvXNY1pVE.png)
这里是保存你使用的DNS服务器信息的文件。当你需要域名解析的时候，系统就会访问这个文件查询你使用的DNS服务器，从而向该地址发动DNS请求。
</em>   <code>/etc/nsswitch.conf</code>
![VirtualBoxVM_pQHoDxZ8Z9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_pQHoDxZ8Z9.png)
这里展示了系统对于这些需求的使用方案，比如networks这里，会先考虑files然后才是dns。注意看上面的注释里面写到，请你不要手动修改这个文件。

### 命令:

<em>   <code>ping</code>
    </em>   <strong>解释</strong>: 用于测试网络连接性，向目标主机发送 ICMP 回显请求，并等待回显回复。
    <em>   <strong>示例</strong>: <code>ping google.com</code> 或 <code>ping 8.8.8.8</code>
</em>   <code>ifconfig</code> 或 <code>ip addr</code>
    <em>   <strong>解释</strong>: <code>ifconfig</code> (较旧) 和 <code>ip addr</code> (较新，推荐) 用于显示和配置网络接口信息，如 IP 地址、MAC 地址等。
    </em>   <strong>示例</strong>: <code>ip addr show</code> 或 <code>ifconfig -a</code>
![VirtualBoxVM_5OlYxeDG26.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_5OlYxeDG26.png)
<em>   <code>ifup</code> 或 <code>ifdown</code>
    </em>   <strong>解释</strong>: 用于激活 (<code>ifup</code>) 或禁用 (<code>ifdown</code>) 网络接口。通常与 <code>/etc/sysconfig/network-scripts</code> 中的配置文件一起使用。
    <em>   <strong>示例</strong>: <code>ifup eth0</code> (激活 eth0 接口)
</em>   <code>netstat</code>
    <em>   <strong>解释</strong>: 显示网络连接、路由表、接口统计等信息。
    </em>   <strong>示例</strong>: <code>netstat -tuln</code> (显示所有 TCP 和 UDP 监听端口)
    <em>   <code>netstat -rnv</code>显示网关信息。
![VirtualBoxVM_DT62ideXQV.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_DT62ideXQV.png)
查看网关信息
</em>   <code>traceroute</code>
    <em>   <strong>解释</strong>: 跟踪数据包从本地主机到目标主机的路径，显示每个跳的延迟。
    </em>   <strong>示例</strong>: <code>traceroute google.com</code>
<em>   <code>tcpdump</code>
    </em>   <strong>解释</strong>: 强大的网络抓包工具，用于捕获和分析网络数据包。
    <em>   <strong>示例</strong>: <code>tcpdump -i eth0 host 192.168.1.1</code> (捕获 eth0 接口上与 192.168.1.1 相关的数据包)
</em>   <code>nslookup</code> 或 <code>dig</code>
    <em>   <strong>解释</strong>: 用于查询 DNS (域名系统) 服务器，解析域名到 IP 地址，或反之。<code>dig</code> 功能更强大。
    </em>   <strong>示例</strong>: <code>nslookup google.com</code> 或 <code>dig google.com</code>
![VirtualBoxVM_XZPIo2ioIR.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_XZPIo2ioIR.png)
<em>   <code>ethtool</code>
    </em>   <strong>解释</strong>: 用于查询和控制以太网卡的驱动程序和硬件设置。
    <em>   <strong>示例</strong>: <code>ethtool eth0</code> (显示 eth0 接口的详细信息)
![VirtualBoxVM_Vp04fHDiRI.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_Vp04fHDiRI.png)
---

## 6. 尝试使用 nmcli 配置网络

这里我们就不给示范了，因为这里写的示例ip对于你来说并不是通用的，而且你也不知道这个<code>/24</code>是什么意思，你只需要这个位置是你需要改且能改的ip地址。你了解一下下文在干什么就可以了。

### 使用 nmcli 配置静态 IP

</em>   <code>nmcli device</code>: 获取网络接口列表。
<em>   <code>nmcli connection modify enp0s3 ipv4.addresses 10.253.1.211/24</code>: 修改 <code>enp0s3</code> 连接的 IPv4 地址和子网掩码。
</em>   <code>nmcli connection modify enp0s3 ipv4.gateway 10.253.1.1</code>: 修改 <code>enp0s3</code> 连接的 IPv4 网关。
<em>   <code>nmcli connection modify enp0s3 ipv4.method manual</code>: 将 <code>enp0s3</code> 连接的 IPv4 配置方法设置为手动。
</em>   <code>nmcli connection modify enp0s3 ipv4.dns 8.8.8.8</code>: 修改 <code>enp0s3</code> 连接的 IPv4 DNS 服务器。
<em>   <code>nmcli connection down enp0s3 && nmcli connection up enp0s3</code>: 重新启动 <code>enp0s3</code> 连接以应用更改。
</em>   <code>ip address show enp0s3</code>: 显示 <code>enp0s3</code> 接口的 IP 地址信息。

### 使用 nmcli 添加辅助静态 IP

<em>   <code>nmcli device status</code>: 查看设备状态。
</em>   <code>nmcli connection show --active</code>: 显示活动的连接。
<em>   <code>ifconfig</code>: 显示网络接口信息 (也可以使用 <code>ip addr</code>)。
</em>   <code>nmcli connection modify enp0s3 +ipv4.addresses 10.0.0.211/24</code>: 为 <code>enp0s3</code> 连接添加一个辅助 IPv4 地址。
<em>   <code>nmcli connection reload</code>: 重新加载连接配置。
</em>   <code>systemctl reboot</code>: 重启系统以使更改生效。
<ul><li>  <code>ip address show</code>: 显示所有接口的 IP 地址信息。</li></ul>



## 题外话

对于测试网络而言，第六节的所有命令都是常用且有用的。但是如果你没有网络的基础理解起来会很费劲。比如什么是DNS？DHCP是什么？IP/TCP/UDP又都是什么？内网和外网说的又是什么？那个<code>/24</code>变长子网掩码又是什么意思？这些都是属于网络的知识了。作为一个linux管理员，你必须要了解基础的网络知识，而上面说的这一点点都是最基础的最冰山一角的了。或许以后再做一个网络的笔记吧。