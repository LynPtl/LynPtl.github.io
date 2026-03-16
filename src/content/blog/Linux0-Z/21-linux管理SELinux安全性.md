---
title: 21.linux管理SELinux安全性
date: 2025-11-15 23:38:23
tags:
  - Linux
  - SELinux
  - Security
categories:
  - Linux入门
---
# Linux 管理 SELinux 安全性 （补图中）

## 什么是 SELinux？

<em>   Security-Enhanced Linux (SELinux) 是一个 Linux 内核安全模块，它提供了一种支持访问控制安全策略的机制，包括强制访问控制 (MAC)。
</em>   它是美国国家安全局 (NSA) 和 SELinux 社区的一个项目。
<em>   与标准的自由访问控制 (DAC)（如 <code>chmod</code>）不同，SELinux 强制执行系统范围的策略，即使是 root 用户也可能受到限制。
 
![image.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/uploads/1763208961600-pq0szv-image.png)


</em>上图解释：在传统的 DAC 模型下，如果 Apache 服务被攻破，攻击者可能获得该进程的所有者权限，从而访问用户主目录中的文件。在 SELinux (MAC) 模型下，即使服务被攻破，SELinux 策略也会阻止它访问策略之外的资源（如用户主目录），除非有明确的规则允许。<em>

## SELinux (Security Enhanced Linux)

### SELinux 模式

</em>   <strong>Enforcing</strong>: 默认启用。强制执行 SELinux 安全策略，阻止并记录所有违反策略的活动。
<em>   <strong>Permissive</strong>: 禁用强制执行，但会记录所有违反策略的活动。这对于调试和排查问题非常有用。
</em>   <strong>Disabled</strong>: 完全禁用 SELinux，不记录任何活动。

### 检查 SELinux 状态

您可以使用 <code>sestatus</code> 或 <code>getenforce</code> 命令来查看 SELinux 的当前状态。

``<code>bash
# 查看详细的 SELinux 状态
sestatus

# 或者只查看当前模式
getenforce
</code>`<code>

![VirtualBoxVM_2QqUku9Tn5.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_2QqUku9Tn5.png)

### SELinux 设置

<em>   <strong>临时更改模式</strong>
    您可以使用 </code>setenforce<code> 命令在 </code>Enforcing<code> 和 </code>Permissive<code> 模式之间切换。这在系统重启后会失效。
    </code>`<code>bash
    # 切换到 Permissive 模式
    setenforce 0

    # 切换回 Enforcing 模式
    setenforce 1
    </code>`<code>

</em>   <strong>永久更改模式</strong>
    要永久更改 SELinux 模式，需要修改配置文件 </code>/etc/selinux/config<code>。
    </code>`<code>bash
    # 编辑配置文件
    # 将 SELINUX=enforcing 修改为 SELINUX=permissive 或 SELINUX=disabled
    vi /etc/selinux/config
    </code>`<code>
    <strong>注意</strong>: 修改此文件后需要重启系统才能生效。

<em>   <strong></code>.autorelabel<code> 文件</strong>
    如果在禁用 SELinux 后重新启用它，或者文件系统的 SELinux 标签出现问题，您可以在根目录下创建一个名为 </code>.autorelabel<code> 的空文件，然后重启系统。这会强制系统在下次启动时重新标记所有文件。
    </code>`<code>bash
    touch /.autorelabel
    reboot
    </code>`<code>

### SELinux 的两个核心概念

</em>   <strong>标签 (Labeling)</strong>: SELinux 为系统中的每个主体（进程）和客体（文件、目录、端口等）分配一个安全上下文（Context）。
<em>   <strong>类型强制 (Type Enforcement)</strong>: SELinux 的主要决策机制。它通过策略规则来控制一个特定类型的主体（如 </code>httpd_t<code>）能否访问一个特定类型的客体（如 </code>httpd_sys_content_t<code>）。


### 查看文件/目录的 SELinux 标签

</em>   使用 </code>ls -lZ<code> 或 </code>ls -dZ<code> 命令可以查看文件或目录的 SELinux 上下文。

    </code>`<code>bash
    # 查看 /usr/sbin/httpd 文件的标签
    [root@localhost ~]# ls -lZ /usr/sbin/httpd
    -rwxr-xr-x. root root system_u:object_r:httpd_exec_t:s0 /usr/sbin/httpd

    # 查看 /etc/httpd 目录的标签
    [root@localhost ~]# ls -dZ /etc/httpd
    drwxr-xr-x. root root system_u:object_r:httpd_config_t:s0 /etc/httpd
    </code>`<code>

### 查看进程和套接字的 SELinux 标签

<em>   <strong>查看进程标签</strong>: 使用 </code>ps axZ<code>
    </code>`<code>bash
    # 查看 httpd 进程的标签
    [root@localhost ~]# ps axZ | grep httpd
    system_u:system_r:httpd_t:s0   21289 ?      Ss   0:00 /usr/sbin/httpd -DFOREGROUND
    </code>`<code>

</em>   <strong>查看套接字（端口）标签</strong>: 使用 </code>netstat -tnlpZ<code>
    </code>`<code>bash
    # 查看 httpd 监听的端口标签
    [root@localhost ~]# netstat -tnlpZ | grep http
    tcp6       0      0 :::80                   :::<em>                    LISTEN      system_u:system_r:httpd_t:s0 21289/httpd
    </code>`<code>

### SELinux 标签（安全上下文）详解

SELinux 标签也称为安全上下文，其标准格式为 </code>user:role:type:level<code>。让我们用 </code>system_u:object_r:httpd_exec_t:s0<code> 这个例子来详细解释每个部分：

1.  <strong>User (</code>system_u<code>)</strong>: 代表 <strong>SELinux 用户</strong>。这与常规的 Linux 用户账户（如 </code>root<code>）不同。它定义了该用户在 SELinux 策略中的权限范围。</code>system_u<code> 是一个用于系统进程和对象的通用 SELinux 用户。

2.  <strong>Role (</code>object_r<code>)</strong>: 代表 <strong>SELinux 角色</strong>。它作为“用户”和“类型”之间的桥梁。对于文件、目录等资源（即“客体”），其角色几乎总是 </code>object_r<code>。对于正在运行的进程（即“主体”），您通常会看到 </code>system_r<code> 角色。

3.  <strong>Type (</code>httpd_exec_t<code>)</strong>: 这是日常 SELinux 管理中<strong>最关键的部分</strong>。<strong>类型</strong>定义了一个文件或进程的“身份”。SELinux 的所有策略规则都是基于类型来制定的。例如：
    </em>   </code>httpd_exec_t<code>: 表示这是一个可供 Apache (httpd) 服务<strong>执行</strong>的文件。
    <em>   </code>httpd_config_t<code>: 表示这是一个 Apache 服务的<strong>配置文件</strong>。
    </em>   </code>httpd_t<code>: 表示这是正在运行的 Apache 服务<strong>进程</strong>自身的类型。

    SELinux 的核心机制是“类型强制 (Type Enforcement)”，它会制定类似这样的规则：“类型为 </code>httpd_t<code> 的进程，被允许读取类型为 </code>httpd_config_t<code> 的文件，并执行类型为 </code>httpd_exec_t<code> 的文件。”

4.  <strong>Level (</code>s0<code>)</strong>: 这与一个叫做“多级别安全 (MLS)”的高级功能相关。它定义了一个“敏感度级别”，其中 </code>s0<code> 是最低级别。该机制用于防止信息从高密级流向低密级。在大多数标准服务器配置中，这个值通常固定为 </code>s0<code>，您一般无需关心。

总而言之，在处理 SELinux 问题时，<strong>类型 (Type)</strong> 是您最需要关注的部分。它精确地告诉 SELinux 系统中的每个文件和进程是什么，以便 SELinux 能够严格执行策略，决定“谁可以对谁做什么”。


### 管理 SELinux 设置的命令

<em>   </code>semanage<code> 命令用于管理 SELinux 的设置，包括：
    </em>   </code>login<code>：管理 SELinux 用户到 Linux 用户的映射。
    <em>   </code>user<code>：管理 SELinux 用户。
    </em>   </code>port<code>：管理端口的 SELinux 类型。
    <em>   </code>interface<code>：管理网络接口的 SELinux 类型。
    </em>   </code>module<code>：管理 SELinux 策略模块。
    <em>   </code>node<code>：管理网络节点的 SELinux 类型。
    </em>   </code>file context<code>：管理文件上下文的映射规则。
    <em>   </code>boolean<code>：管理 SELinux 布尔值，用于启用或禁用策略中的特定规则。
    </em>   </code>permissive state<code>：管理域的宽容状态。
    <em>   </code>dontaudit<code>：管理 </code>dontaudit<code> 规则，用于隐藏某些拒绝消息。

### 使用布尔值和 chcon

#### SELinux 布尔值 (Boolean)

布尔值是 SELinux 中的一种开关机制（ON / OFF），用于在运行时动态修改策略行为，而无需重写或重新加载整个策略。

</em>   SELinux 提供了许多预定义的布尔值。
<em>   例如，您可以通过布尔值来控制：
    </em>   是否允许 FTP 服务访问用户主目录 (</code>ftp_home_dir<code>)。
    <em>   Web 服务器是否可以连接到 LDAP 服务器 (</code>httpd_can_network_connect<code>)。

</em>   <strong>列出所有布尔值及其当前状态</strong>
    </code>`<code>bash
    getsebool -a
    # 或者
    semanage boolean -l
    </code>`<code>

<em>   <strong>启用或禁用一个布尔值</strong>
    使用 </code>setsebool<code> 命令。</code>-P<code> 标志使其永久生效（即重启后保持不变）。
    </code>`<code>bash
    # 永久开启一个名为 boolean_name 的布尔值
    setsebool -P boolean_name on
    </code>`<code>

#### 检查 SELinux 错误

当 SELinux 阻止某个操作时，相关的错误信息通常会被记录到审计日志中。您可以使用 </code>journalctl<code> 来查看它们。

</code>`<code>bash
# 过滤与 "avc: denied" 相关的日志
journalctl -g "avc: denied"
</code>`<code>

#### 更改文件或目录的类型标签

在某些情况下，您可能需要手动更改文件或目录的 SELinux 类型以匹配策略。

</em>   <strong>临时更改 (chcon)</strong>
    </code>chcon<code> 命令可以立即更改文件或目录的类型，但这种更改是临时的。如果系统执行了文件系统重新标记 (</code>restorecon<code> 或 </code>touch /.autorelabel<code>)，这些更改将会丢失。
    </code>`<code>bash
    chcon -t httpd_sys_content_t /path/to/your/file
    </code>`<code>

<em>   <strong>永久更改 (semanage fcontext)</strong>
    要进行永久性更改，您应该使用 </code>semanage fcontext<code> 来定义一个文件路径的默认上下文规则，然后使用 </code>restorecon<code> 来应用这个规则。
    </code>`<code>bash
    # 1. 添加一个新的上下文规则
    semanage fcontext -a -t httpd_sys_content_t "/path/to/your/directory(/.</em>)?"

    # 2. 应用规则，恢复默认上下文
    restorecon -Rv /path/to/your/directory
    </code>``