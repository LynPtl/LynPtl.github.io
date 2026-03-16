---
title: WSL2使用windows主机代理
date: 2025-12-17 17:42:21
tags:
  - 代理
  - WSL
  - Windows
categories:
  - 工具
---
# WSL2 使用 Windows 主机代理

## 1. 问题背景

在使用 Windows 10 的 WSL2 (Windows Subsystem for Linux 2) 进行开发时，经常会遇到一个痛点：**WSL2 无法直接使用 Windows 主机上已经配置好的代理软件**。

当你打开 WSL 终端时，可能会看到如下提示：
> `wsl: A localhost proxy configuration was detected but not mirrored into WSL. WSL in NAT mode does not support localhost proxies.`

![image-compressed.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/uploads/1765964127739-1a937p-image-compressed.png)

### 为什么会这样？
这涉及到底层的网络架构差异：
* **WSL 1**：与 Windows 共享网络栈，`localhost` 指向同一个接口。
* **WSL 2 (NAT 模式)**：本质上是一个运行在 Hyper-V 里的轻量级虚拟机。它拥有独立的虚拟网卡和 IP 地址。
    * 在 WSL2 里访问 `localhost`，访问的是**虚拟机自己**，而不是外面的 Windows。
    * Windows 主机对于 WSL2 来说，类似于局域网里的“网关”。

**注意**：Windows 11 支持“镜像网络模式 (Mirrored Mode)”可以完美解决此问题，但 Windows 10 用户只能通过 NAT 穿透的方式来解决。

---

## 2. 解决方案核心步骤

我们要做的只有两件事：
1.  **Windows 端**：允许代理软件接受来自“局域网”的连接。
2.  **WSL 端**：动态获取 Windows 主机的 IP，并将流量转发过去。

### 第一步：配置 Windows 代理软件 (Allow LAN)

WSL2 对 Windows 来说是外部设备，所以必须开启“允许局域网连接”。

1.  打开你的代理软件（Clash, v2rayN 等）。
2.  找到 **Allow LAN** (允许局域网连接) 开关并**开启**。
3.  记下软件的 **HTTP/Port** 端口号。
    * *Clash 默认为 `7890`*
    * *v2rayN 默认为 `10809`*

> **提示**：如果开启后仍然不通，请检查 Windows 防火墙，确保该代理软件在“允许应用通过防火墙”的列表中，或者暂时关闭防火墙测试。

![image-compressed.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/uploads/1765964250713-1wljpm-image-compressed.png)

### 第二步：配置 WSL 环境变量 (自动脚本)

由于 WSL2 每次重启后，宿主机的虚拟 IP 可能会变，我们不能写死 IP 地址。我们需要一段脚本来自动提取 IP。

在 WSL 终端中操作：

1.  **编辑 Shell 配置文件**
    如果你用的是 `zsh` (Ubuntu 默认推荐)：
    ```bash
    nano ~/.zshrc
    ```
    *(如果你用的是 bash，请编辑 `~/.bashrc`)*

2.  **添加自动配置脚本**
    在文件末尾追加以下内容：

    ```bash
    # ====================================================
    # WSL2 Proxy Auto-Configuration
    # ====================================================

    # 1. 获取 Windows 宿主机在虚拟网络中的 IP 地址
    # 原理：读取路由表，找到 default 路由，提取其网关 IP
    export hostip=$(ip route show | grep default | awk '{print $3}')

    # 2. 设置代理端口 (请根据你实际使用的软件修改端口号，例如 7890 或 10809)
    export PROXY_PORT=7890 

    # 3. 设置环境变量
    export https_proxy="http://${hostip}:${PROXY_PORT}"
    export http_proxy="http://${hostip}:${PROXY_PORT}"
    export all_proxy="socks5://${hostip}:${PROXY_PORT}" #如果软件支持Socks5

    # 4. (可选) 调试信息：每次打开终端显示当前代理地址
    # echo "-> Proxy points to Windows Host: ${hostip}:${PROXY_PORT}"
    
    # ====================================================
    ```
    
    ![image-compressed.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/uploads/1765964419953-mw7ric-image-compressed.png)

3.  **保存并生效**
    * 按 `Ctrl + O` 保存，`Ctrl + X` 退出编辑器。
    * 执行命令使配置生效：
        ```bash
        source ~/.zshrc
        ```

---

## 3. 验证连接

配置完成后，使用 `curl` 命令测试连通性（建议测试 Google 或 GitHub）：

```bash
curl -I [https://www.google.com](https://www.google.com)