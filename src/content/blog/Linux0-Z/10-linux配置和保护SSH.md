---
title: 10.linux配置和保护SSH
date: 2025-10-29 02:15:15
tags:
  - Linux
  - SSH
  - Security
categories:
  - Linux入门
---
# Linux 配置和保护 SSH

## 1. SSH 基础

-   <strong>SSH (Secure Shell)</strong>: 一种安全的网络协议，用于在不安全的网络上安全地操作网络服务。
-   <strong>功能</strong>: 提供了一个与 Linux 系统交互的加密命令行界面，接收你的命令并将其传输给内核以管理硬件。
-   <strong>相关组件</strong>:
    -   <strong>软件包</strong>: OpenSSH
    -   <strong>服务守护进程</strong>: <code>sshd</code>
    -   <strong>默认端口</strong>: 22

---

## 2. 增强 SSH 安全性的配置

尽管 SSH 本身是安全的（通信全程加密），但管理员应采取额外措施来进一步加固 SSH 服务。

### 2.1. 配置空闲超时

-   <strong>目的</strong>: 自动断开长时间处于空闲状态的 SSH 会话，防止未经授权的访问。
-   <strong>操作步骤</strong>:
    1.  以 <code>root</code> 用户身份编辑 <code>/etc/ssh/sshd_config</code> 文件。
    2.  添加或修改以下两行：
        ``<code>bash
        # 设置客户端存活探测间隔为600秒（10分钟）
        ClientAliveInterval 600
        # 设置在断开连接前，客户端可以无响应的次数为0
        ClientAliveCountMax 0
        </code>`<code>
    3.  重启 SSH 服务以应用更改：
        </code>`<code>bash
        # systemctl restart sshd
        </code>`<code>
-   <strong>注解</strong>: </code>ClientAliveInterval<code> 设置了服务器向客户端发送“空消息”以检查其是否仍然连接的时间间隔（以秒为单位）。如果客户端在 </code>ClientAliveInterval * ClientAliveCountMax<code> 秒内没有响应，连接将被关闭。

![VirtualBoxVM_gL32R7dcAX.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_gL32R7dcAX.png)
在进行修改配置文件之前，强烈建议你先使用</code>cp<code>命令进行备份，这样一旦出了问题你还能还原。

之后我们使用</code>vi<code>来编辑这个配置文件，使用</code>g<code>直达文件末尾，之后</code>o<code>另起新行并且开始插入以下内容：

![VirtualBoxVM_so4Ria1KdI.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_so4Ria1KdI.png)

最后保存并退出，重启服务。

![VirtualBoxVM_JWcYOh3Lru.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_JWcYOh3Lru.png)


### 2.2. 禁用 root 用户登录

-   <strong>目的</strong>: 阻止直接使用 </code>root<code> 账户进行远程登录，这是系统安全的基本最佳实践之一。
-   <strong>操作步骤</strong>:
    1.  编辑 </code>/etc/ssh/sshd_config<code> 文件。
    2.  将 </code>PermitRootLogin yes<code> 修改为 </code>no<code>：
        </code>`<code>bash
        PermitRootLogin no
        </code>`<code>
    3.  重启 </code>sshd<code> 服务。
-   <strong>注解</strong>: 禁用 root 登录后，管理员应使用普通用户登录，然后使用 </code>su<code> 或 </code>sudo<code> 命令提权至 root，这增加了系统的可审计性。

![VirtualBoxVM_AYumCBpnou.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_AYumCBpnou.png)

默认是prohibit-password，我们修改成no。
![VirtualBoxVM_ICcbKG8eGm.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_ICcbKG8eGm.png)

保存并退出，别忘了重启服务。

### 2.3. 禁止空密码登录

-   <strong>目的</strong>: 增加安全性，防止配置了空密码的账户通过远程 SSH 登录。
-   <strong>操作步骤</strong>:
    1.  编辑 </code>/etc/ssh/sshd_config<code> 文件。
    2.  找到并确保以下行的设置为 </code>no<code>（如果被注释，请取消注释）：
        </code>`<code>bash
        PermitEmptyPasswords no
        </code>`<code>
    3.  重启 </code>sshd<code> 服务。

![VirtualBoxVM_Ih5Q55OTF9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_Ih5Q55OTF9.png)

取消注释，保存并退出。

![VirtualBoxVM_CdKSGCG3MJ.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_CdKSGCG3MJ.png)

别忘了重启服务。


### 2.4. 限制特定用户的 SSH 访问

-   <strong>目的</strong>: 作为额外的安全层，只允许授权用户列表中的用户进行 SSH 登录。
-   <strong>操作步骤</strong>:
    1.  编辑 </code>/etc/ssh/sshd_config<code> 文件。
    2.  添加 </code>AllowUsers<code> 指令，后面跟上允许登录的用户名列表：
        </code>`<code>bash
        AllowUsers user1 user2
        </code>`<code>
    3.  重启 </code>sshd<code> 服务。

![VirtualBoxVM_qmo30mTynt.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_qmo30mTynt.png)


### 2.5. 更改默认 SSH 端口

-   <strong>目的</strong>: 默认的 22 端口是自动化攻击的常见目标。更改端口可以减少被扫描和攻击的风险。
-   <strong>操作步骤</strong>:
    1.  编辑 </code>/etc/ssh/sshd_config<code> 文件。
    2.  找到 </code>#Port 22<code> 这一行，取消注释并修改为新的端口号（例如 </code>2222<code>）：
        </code>`<code>bash
        Port 2222
        </code>`<code>
    3.  重启 </code>sshd<code> 服务。
-   <strong>注解</strong>: 更改端口后，连接时需要明确指定新端口，例如 </code>ssh user@hostname -p 2222<code>。同时，需要确保新的端口在防火墙（如 firewalld）和 SELinux 策略中是允许的。

![VirtualBoxVM_6BfpjJCZt3.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_6BfpjJCZt3.png)

---

## 3. 使用 SSH 密钥实现无密码认证

-   <strong>目的</strong>: 提高安全性和便利性，尤其适用于自动化脚本和频繁登录的场景。
-   <strong>工作原理</strong>: 使用公钥/私钥对进行身份验证，而不是传统的密码。
-   <strong>操作步骤</strong>:
    1.  <strong>在客户端生成密钥对</strong>: 
        </code>`<code>bash
        # ssh-keygen
        </code>`<code>
        这会在 </code>~/.ssh/<code> 目录下创建 </code>id_rsa<code> (私钥) 和 </code>id_rsa.pub<code> (公钥)。
    2.  <strong>将公钥复制到服务器</strong>: 
        </code>`<code>bash
        # ssh-copy-id <user>@<server_ip>
        </code>`<code>
        此命令会将客户端的公钥追加到服务器上 </code>~/.ssh/authorized_keys<code> 文件中。
    3.  <strong>无密码登录</strong>: 完成以上步骤后，从客户端 SSH 到服务器将不再需要输入密码。
        </code>`<code>bash
        # ssh <user>@<server_ip>
        </code>``

这里我们就不做示范了。如果你有这个需求的话你是自己一定会实操一次的。我曾经也做过这样的事情，在我之前的一篇ssh文章里。不过那篇文章的图床全部挂掉了，有一些可惜。

这里最后简单介绍一下公私钥是什么：

-   <strong>公钥 (Public Key)</strong>: 可以公开分享给任何人。它用于加密数据或验证数字签名。
-   <strong>私钥 (Private Key)</strong>: 必须严格保密，只能由所有者持有。它用于解密公钥加密的数据或创建数字签名。

<strong>非对称加密 (Asymmetric Encryption)</strong>:
-   <strong>原理</strong>: 非对称加密使用一对密钥，即公钥和私钥。公钥用于加密数据，私钥用于解密数据；反之，私钥也可以用于签名，公钥用于验证签名。
-   <strong>公钥加密，私钥解密</strong>: 当A想向B发送加密信息时，A使用B的公钥加密信息，然后发送给B。B收到信息后，使用自己的私钥解密。由于只有B拥有其私钥，因此只有B能解密该信息，确保了信息的机密性。
-   <strong>私钥签名，公钥验证</strong>: 当A想证明信息确实由自己发出时，A使用自己的私钥对信息进行签名。B收到信息和签名后，使用A的公钥验证签名的有效性。如果验证成功，则证明信息确实由A发出，且未被篡改，确保了信息的完整性和不可否认性。
-   <strong>与公私钥的关系</strong>: 公钥和私钥是非对称加密技术的核心组成部分。它们成对生成，数学上相关联，但无法从其中一个推导出另一个。这种机制使得在不安全通道上进行安全通信成为可能。