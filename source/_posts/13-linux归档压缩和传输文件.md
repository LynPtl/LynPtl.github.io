---
title: 13.linux归档压缩和传输文件
date: 2025-11-01 01:21:37
categories:
  - Linux入门
---
# Linux 归档压缩和传输文件

## 1. 压缩和解压缩文件

*   `tar`: 用于创建和提取归档文件。归档文件是将多个文件和目录组合成一个文件，以便于传输或备份。

![WindowsTerminal_HrPrb2QEqj.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_HrPrb2QEqj.png)
在你第一次使用之前，一定要看一下使用方法。

比如我想要把当前目录的所有内容打包成一个tar：
![WindowsTerminal_5wvza0vn0D.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_5wvza0vn0D.png)

看到这一行`tar: ./goscript.tar: archive cannot contain itself; not dumped`了吗？意思是：“压缩包不能包含它自己”。
在你**运行命令之前**，`goscript.tar` 这个文件确实不存在。

关键点在于 `tar` 命令的 **执行顺序**：

当你运行 `tar -cvf goscript.tar .` 时，`tar` 的工作流程是：

1.  **第一步：创建目标文件。** `tar` 看到 `-f goscript.tar`，它的第一个动作就是在当前目录（`.`）下，**立即创建**一个空的 `goscript.tar` 文件。它需要这个“壳”来往里面塞东西。
2.  **第二步：扫描源目录。** 创造完“壳”之后，`tar` 才开始扫描你指定的源（`.`，代表当前目录），看看有哪些东西需要被塞进去。
3.  **第三步：打包并报错。**
    * 它找到了 `hello1.go`，塞进去了。
    * 它找到了 `hello2.go`，塞进去了。
    * 接着，它找到了 `goscript.tar` —— 也就是它在第一步刚刚创建的那个文件！
    * `tar` 就懵了：你要我把我自己（`goscript.tar`）也塞进我自己（`goscript.tar`）里面？
    * 于是它就报了 `archive cannot contain itself` 这个错误。

所以，**并不是因为文件“事先存在”，而是因为 `tar` 命令“先创建了目标文件”，而这个目标文件“恰好”又在它要扫描打包的源目录里**。又学到了机制！

之后我们查看一下压缩包里的内容：
![WindowsTerminal_UvVdXUmJdO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_UvVdXUmJdO.png)

有没有注意到这里多了一个./的目录？

这个 `./` **就是你试图打包的那个目录本身**。

`./` 在 Linux/Unix 系统里是一个特殊的符号，代表“**当前目录**”。在你的例子里，它就代表 `gostudy` 这个文件夹。
### 为什么它会出现在这里？

这和上一步**出错的命令** `tar -cvf goscript.tar .` 直接相关。

`tar` 命令在执行时，是按顺序来的：

1.  它首先在当前目录创建了一个空的 `goscript.tar`。
2.  然后它开始扫描你让它打包的源：`.` (当前目录)。
3.  `tar` 存档时，会**先把目录本身的信息（元数据）打包进去**，然后再打包目录里的文件。

所以，你现在用 `tar -tvf` (t = test/list) 命令看到的列表，其实是 `tar` **在报错停止前**，已经塞进去的东西：

* `drwxr-xr-x ... ./`: 这是 `tar` 扫描到的**第一个条目**，也就是 `.` (gostudy 目录) 自己的信息。
    * 你看它开头的 `d`，就代表**d**irectory (目录)。
    * 你原来的目录里当然“看”不到它，因为它不是一个实体文件，而是对目录本身的引用。
* `-rw-r--r-- ... ./hello1.go`: 这是 `tar` 扫描到的第二个条目，是目录里的文件。
* `-rw-r--r-- ... ./hello2.go`: 这是 `tar` 扫描到的第三个条目，是目录里的另一个文件。

在这之后，`tar` 才继续扫描，然后发现了 `goscript.tar`，它意识到不能打包自己，于是报错 `archive cannot contain itself` 并停止了。

但它**已经打包进去的**（前面这三行）就被保存下来了，所以你现在才能`list` (列出) 它们。

这个 `./` 不是你创建的“文件”，而是 `tar` 命令在打包 `.` (当前目录) 时，自动放进去的**“目录元数据”**。

如果你当时用的是 `tar -cvf goscript.tar *.go`，那么你现在`tar -tvf` 就不会看到那个 `./` 目录了，只会看到两个 `.go` 文件。

之后我们尝试解包：
![WindowsTerminal_Rw0HY27rRr.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_Rw0HY27rRr.png)

*   `gzip`: 用于压缩文件，减小文件大小。

![WindowsTerminal_W1eJRLsXAq.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_W1eJRLsXAq.png)

可以看到文件的大小的确被压缩了。聪明的你会不会想把.gz再继续用gzip压缩呢？实际上gzip有一个防呆设计，对于.gz结尾的文件他会提示你已经被压缩过了：

![WindowsTerminal_uGw3OBun5x.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_uGw3OBun5x.png)

但是实际上如果你修改后缀，改成不是gz结尾，那就可以再继续进行gzip，但是实际上这样做的意义很小，已经压缩过的文件再度压缩大小几乎不会变，甚至可能因为多了一个 gzip 的“外壳”而反而变大一点点。如同你在windows试图多重压缩压缩包一样。如果你没有尝试过的话可以试一试，看看压缩包的大小变化是如何的？

*   `gzip -d` 或 `gunzip`: 用于解压缩由gzip压缩的文件。

![WindowsTerminal_xpNB0Aegyz.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_xpNB0Aegyz.png)

---

## 2. FTP - 文件传输协议

*   文件传输协议（FTP）是一种标准的网络协议，用于在客户端和服务器之间传输计算机文件。
*   协议 = 计算机用于通信的规则集
*   默认FTP端口 = 21

### 在远程服务器上安装和配置FTP

*   `# yum install vsftpd`: 使用yum包管理器安装vsftpd（一个FTP服务器软件）。
*   `# vi /etc/vsftpd/vsftpd.conf`: 使用vi文本编辑器打开vsftpd的配置文件进行编辑。
    *   `anonymous_enable=NO`: 禁止匿名用户登录FTP服务器。
    *   `ascii_upload_enable=YES`: 允许以ASCII模式上传文件。
    *   `ascii_download_enable=YES`: 允许以ASCII模式下载文件。
    *   `ftpd_banner=Welcome to UNIXMEN FTP service.`: 设置FTP服务器的欢迎横幅。
*   `# systemctl start vsftpd`: 启动vsftpd服务。
*   `# systemctl enable vsftpd`: 设置vsftpd服务开机自启。

首先我开始配置服务端，安装vsftpd并且使用vi编辑`/etc/vsftpd/vsftpd.conf`进行一些基础的配置。
![VirtualBoxVM_yuKueavXuW.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_yuKueavXuW.png)

![VirtualBoxVM_h0yNSeCoCY.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_h0yNSeCoCY.png)

![VirtualBoxVM_jytvWgspJI.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_jytvWgspJI.png)

随后我启用vsftpd，并且关闭防火墙（目的是为了放行ftp端口）：

![VirtualBoxVM_X7tQpSJ4A2.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_X7tQpSJ4A2.png)

### FTP客户端命令

*   `ftp 192.168.1.x`: 连接到指定IP地址的FTP服务器。
*   `bin`: 将文件传输模式设置为二进制模式，适用于传输非文本文件（如图片、程序）。
*   `hash`: 开启文件传输进度显示，每传输一定数据量就显示一个“#”号。
*   `put hello1.go`: 将本地文件“hello1.go”上传到FTP服务器。
*   `bye`: 断开与FTP服务器的连接并退出FTP客户端。


首先我需要先安装ftp。我的第二台机子用的是Ubuntu，所以我用的是`apt install ftp`:
![WindowsTerminal_sEUN5LgNyR.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_sEUN5LgNyR.png)

之后使用ftp命令，连接服务器端之后（服务器端的地址用ip addr来查看），输入服务端的用户名和密码就可以连接到ftp服务器端了。之后开启二进制模式和传输进度显示，将我的hello1.go文件传送过去。
![Code_ZNcZXmCdlt.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/Code_ZNcZXmCdlt.png)

可以看到该文件已经被传输到服务器端的home目录下：

![VirtualBoxVM_H76bRQmbAw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_H76bRQmbAw.png)

---

## 3. SCP - 安全复制协议

*   安全复制协议（SCP）有助于安全地将计算机文件从本地主机传输到远程主机。
*   默认SCP端口 = 22（与SSH相同）

### SCP命令

*   `scp jack lpt@192.168.1.x:/home/lpt`: 将本地文件“jack”安全地复制到远程服务器`192.168.1.x`上用户`lpt`的主目录`/home/lpt`下。


scp实际上使用的是ssh，所以你的发送端必须要有访问接受端的ssh权限。这里就不截图了。
---
