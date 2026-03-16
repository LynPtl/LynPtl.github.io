---
title: 5.linux本地用户和组管理
date: 2025-10-22 01:38:58
tags:
  - Linux
  - User Management
categories:
  - Linux入门
---

# Linux 本地用户和组管理

## 1. 概述

Linux 系统中的用户和组管理是权限控制的基础。它允许系统管理员定义谁可以访问哪些资源以及他们可以执行哪些操作。

## 2. 用户和组管理命令

### 2.1 用户管理命令
<em>   <code>useradd</code>: 添加用户
</em>   <code>userdel</code>: 删除用户
<em>   <code>usermod</code>: 修改用户属性

### 2.2 组管理命令
</em>   <code>groupadd</code>: 添加组
<em>   <code>groupdel</code>: 删除组

### 2.3 权限切换命令
</em>   <code>su - username</code>: 切换到指定用户（<code>-</code> 表示切换到该用户的环境）。
<em>   <code>sudo command</code>: 以超级用户权限执行命令。
</em>   <code>visudo</code>: 编辑 <code>/etc/sudoers</code> 文件，用于配置 <code>sudo</code> 权限。

## 3. 用户和组相关配置文件

<em>   <code>/etc/passwd</code>: 用户账户信息
</em>   <code>/etc/group</code>: 组信息
<em>   <code>/etc/gshadow</code>: 组密码和组管理员信息
</em>   <code>/etc/sudoers</code>: 配置哪些用户或组可以使用 <code>sudo</code> 以及他们可以执行哪些命令。

## 4. 实操演示

在Linux系统中，配置用户和组（例如使用 useradd, groupadd, userdel, groupdel, usermod 等命令）通常需要 root 用户的权限。这是因为用户和组的管理涉及到系统级别的安全和资源分配，只有 root 用户（或通过 sudo 获得 root 权限的用户）才能执行这些操作，以确保系统的稳定性和安全性。

### 4.1 切换到 Root 用户

首先我们使用<code>su -</code>来切换到root。

![VirtualBoxVM_pxqixFiB5Q.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_pxqixFiB5Q.png)

### 4.2 添加用户

然后我们可以尝试使用<code>useradd</code>来添加一个账户。

![VirtualBoxVM_FQLiI4LrjL.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_FQLiI4LrjL.png)

可以看到我们的账户已经创建完毕了，并且我们的/home目录下也多了一个目录。

### 4.3 创建组

接下来我们创建一个组试试。

![VirtualBoxVM_B1mVSA6bGw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_B1mVSA6bGw.png)

![VirtualBoxVM_QNr99TvNze.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_QNr99TvNze.png)

在<code>/etc/group</code>里面可以看到所有关于组和其id的信息。

### 4.4 删除用户

如果我们要删除用户的话，如果仅仅使用<code>userdel noob</code>，noob的home目录以及mailbox file仍然会存在，建议使用<code>-r</code>选项，在删除用户的同时，也移除该用户的家目录和邮箱文件。

![VirtualBoxVM_ukurkiXySM.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_ukurkiXySM.png)

### 4.5 修改用户属性 (<code>usermod</code>)

然后我们尝试一下使用usermod。

![VirtualBoxVM_xEu4SD6qtp.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_xEu4SD6qtp.png)

<code>usermod -G</code>用于修改一个用户所属的“附加组”，在 Linux 中，一个用户必须属于一个“主组” (primary group)，并且可以同时属于多个“附加组”。

但是你有没有发现，我们执行完之后，/home目录下的noob目录仍然属于noob组。因为noob的主组还是noob。

如果你这时候使用<code>usermod -g</code>这个小写的g，它也只会改变用户在系统中的“默认主组”设置（即 /etc/passwd 文件中的 GID）。它不会自动去修改该用户已经拥有的所有文件（比如 /home/noob 目录）的属组。

### 4.6 修改文件属组 (<code>chgrp</code>)

如果你修改隶属于noob的所有文件变为fools所属的话，我们就需要使用change group命令<code>chgrp</code>：

![VirtualBoxVM_JQAyISr3ei.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_JQAyISr3ei.png)

<code>chgrp -R</code> 中的 <code>-R</code> 选项代表 "Recursive"（递归）。它的意思是：不仅改变你指定目录的属组，还要进入这个目录，改变里面所有文件、所有子目录、以及子目录里的所有文件的属组，一直重复下去，直到覆盖所有内容。

### 4.7 深入理解配置文件

现在我们来看一看刚才提到的<code>/etc/passwd</code>有什么内容：

![VirtualBoxVM_poiJUg52KB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_poiJUg52KB.png)

可以看到每当你创建一个新用户的时候，最下方就会被添加新的信息。

<code>/etc/passwd</code> 是一个用冒号分隔的文本文件，其中每一行都代表一个系统用户账户。它定义了用户的核心信息，如<strong>用户名</strong>（第1字段）、<strong>用户ID (UID)</strong>（第3字段）、<strong>主组ID (GID)</strong>（第4字段）。它还指定了用户的<strong>家目录</strong>（第6字段）和登录时运行的 <strong>Shell 程序</strong>（第7字段），其中 <code>/usr/sbin/nologin</code> 表示该账户禁止登录。

我们继续看一看其他的文件都是什么内容，对于<code>/etc/group</code>：

![VirtualBoxVM_VHeuCP5Yu9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_VHeuCP5Yu9.png)

<code>/etc/group</code> 文件中的每一行都定义了一个用户组，它通过冒号分隔，依次显示了<strong>组名</strong>、占位符 (<code>x</code>)、<strong>组ID (GID)</strong>、以及<strong>该组的附加成员列表</strong>（用逗号分隔）。这个文件是 Linux 权限系统的核心，它通过 GID 来标识组，并通过附加成员列表来决定哪些用户可以“共享”这个组的权限。

在 <code>/etc/group</code> 文件的上下文中，那个 <code>x</code> 占位符的意思是：<strong>"这个组的加密密码存储在别处。"</strong>

这个“别处”就是 <code>/etc/gshadow</code> 文件。

1.  <strong>历史原因：</strong> 在非常古老的 Unix/Linux 系统中，组的加密密码（如果设置了的话）会<em>直接</em>存放在 <code>/etc/group</code> 文件的第二个字段。
2.  <strong>安全问题：</strong> <code>/etc/group</code> 文件需要被系统上所有用户读取（以便知道谁在哪个组里）。如果密码也存在这里，任何用户都可以拿到所有组的加密密码去尝试破解。
3.  <strong>现代方案：</strong> 为了安全，系统把真正的组密码（如果有的话）转移到了一个只有 <code>root</code> 用户才能读取的 <code>/etc/gshadow</code> 文件中。原来的位置就用一个 <code>x</code> 来“占位”，表示“密码已启用并已转移”。

<strong>一句话总结：</strong> 那个 <code>x</code> 是一个安全改进的产物，它告诉你这个组的真实密码信息被安全地存放在 <code>/etc/gshadow</code> 文件里了。

（P.S. 实际上，“组密码”这个功能本身现在已经非常非常少用了。大多数组（如 <code>x</code> 所示）虽然启用了 shadow 密码，但并没有设置实际的密码。）

接下来我们来看看<code>/etc/gshadow</code>：

![VirtualBoxVM_gAqw7fhMRa.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_gAqw7fhMRa.png)

<code>/etc/gshadow</code> 文件是 <code>/etc/group</code> 文件的“影子文件”，它以安全的方式存储<strong>组密码</strong>和<strong>组管理员</strong>信息，并且为了安全，它<strong>只能被 <code>root</code> 用户读取</strong>。

它的每一行也由冒号 <code>:</code> 分隔，包含 <code>4</code> 个字段：

1.  <strong>组名</strong> (Group Name)
    <em> 对应于 <code>/etc/group</code> 中的组名。

2.  <strong>加密的组密码</strong> (Encrypted Password)
    </em> 这才是真正存储组密码的地方（而不是 <code>/etc/group</code> 里的 <code>x</code>）。
    <em> 如果这里是 <code>!</code> 或 <code></em></code>，意味着这个组被锁定了，或者<strong>没有设置密码</strong>（这是最常见的情况）。
    <em> 如果这里是空的，表示该组没有密码。

3.  <strong>组管理员</strong> (Group Administrators)
    </em> 一个用逗号分隔的用户名列表，这些人可以管理这个组的成员（比如添加或删除成员）。
    <em> 这个字段<strong>通常是空的</strong>。

4.  <strong>组成员</strong> (Group Members)
    </em> 一个用逗号分隔的用户名列表，这些人是这个组的成员。
    <em> 这和 <code>/etc/group</code> 文件的第 4 字段（附加成员列表）功能基本一样。

### 4.8 组合命令示例

接下来我们尝试一下组合命令：

![VirtualBoxVM_D6DYVhjxvN.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_D6DYVhjxvN.png)

<code>useradd -g fools -s /bin/bash -c "second noob" -m -d /home/noob2 noob2</code>

</em>   <strong><code>useradd</code></strong>: “添加用户”的主命令。

<em>   <strong><code>-g fools</code></strong>:
    </em>   <code>-g</code> (group) 指定用户的<strong>“主组”</strong>。
    <em>   强制将新用户 <code>noob2</code> 的主组设为 <code>fools</code> 组。
    </em>   <em>(后面的 <code>id noob2</code> 命令也确认了这一点，显示 <code>gid=1002(fools)</code>)</em>

<em>   <strong><code>-s /bin/bash</code></strong>:
    </em>   <code>-s</code> (shell) 指定用户的<strong>“登录 Shell”</strong>。
    <em>   将 <code>noob2</code> 的 Shell 设为 <code>/bin/bash</code>，这意味着该用户可以正常登录和使用命令行。

</em>   <strong><code>-c "second noob"</code></strong>:
    <em>   <code>-c</code> (comment) 添加<strong>“备注”</strong>信息，通常是用户的全名。
    </em>   备注内容是 "second noob"。
    <em>   </em>(后面的 <code>tac /etc/passwd</code> 命令确认了这一点)<em>

</em>   <strong><code>-m</code></strong>:
    <em>   <code>-m</code> (create home) 这是“<strong>创建家目录</strong>”的选项。
    </em>   它告诉 <code>useradd</code> 命令：“<strong>如果家目录不存在，就必须创建它</strong>。”

<em>   <strong><code>-d /home/noob2</code></strong>:
    </em>   <code>-d</code> (directory) 指定<strong>“家目录的路径”</strong>。
    <em>   把 <code>noob2</code> 的家目录路径设为 <code>/home/noob2</code>。

</em>   <strong><code>noob2</code></strong>:
    <em>   放在命令最后的是你要创建的<strong>用户名</strong>。

### <code>-m</code> 和 <code>-d</code> 是如何协同工作的？

这两个选项一起使用是标准操作：
1.  <strong><code>-d /home/noob2</code></strong> 告诉系统：“这个用户的家目录路径是 <code>/home/noob2</code>。”
2.  <strong><code>-m</code></strong> 告诉系统：“现在，<strong>请真的去创建 <code>/home/noob2</code> 这个目录</strong>。”

<strong>如果没有 <code>-m</code> 会怎样？</strong>
系统只会在 <code>/etc/passwd</code> 文件里</em>记录*家目录是 <code>/home/noob2</code>，但<strong>不会真的在磁盘上创建这个文件夹</strong>。当 <code>noob2</code> 登录时就会因为找不到家目录而出错。
