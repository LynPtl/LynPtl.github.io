---
title: 5.linux本地用户和组管理
date: 2025-10-22 01:38:58
categories:
  - Linux入门
---

# Linux 本地用户和组管理（上半）**

### **用户账户管理**

**命令:**
    `useradd`: 添加用户
    `groupadd`: 添加组
    `userdel`: 删除用户
    `groupdel`: 删除组
    `usermod`: 修改用户属性

**相关文件:**
    `/etc/passwd`: 用户账户信息
    `/etc/group`: 组信息
    `/etc/shadow`: 用户密码和账户过期信息

**示例:**
    `useradd -g superheros -s /bin/bash -c “user description" -m -d /home/spiderman spiderman`
        创建一个名为 `spiderman` 的用户。
        `-g superheros`: 将用户添加到 `superheros` 组。
        `-s /bin/bash`: 设置用户的默认 shell 为 `/bin/bash`。
        `-c “user description"`: 添加用户描述。
        `-m`: 创建用户主目录。
        `-d /home/spiderman`: 指定用户主目录为 `/home/spiderman`。

### **`/etc/login.def` 文件**

此文件定义了用户账户的默认策略，例如密码的最大/最小天数、警告期等。

**`chage` 命令 - 针对每个用户**

`chage` 命令用于修改用户密码的有效期信息。

**示例:**
`chage [-m mindays] [-M maxdays] [-d lastday] [-I inactive] [-E expiredate] [-W warndays] user`

**`/etc/login.def` 文件中的重要参数:**
    `PASS_MAX_DAYS 99999`: 密码最长有效期（天）。
    `PASS_MIN_DAYS 0`: 密码最短有效期（天）。
    `PASS_MIN_LEN 5`: 密码最小长度。
    `PASS_WARN_AGE 7`: 密码过期前多少天开始警告用户。

### **`chage` 命令详解**

`chage` 命令用于管理用户密码的有效期。

**参数说明:**
    `-d = 3. Last password change (lastchanged)`: 密码上次更改的日期（自1970年1月1日以来的天数）。
    `-m = 4. Minimum`: 密码更改之间的最短天数。
    `-M = 5. Maximum`: 密码的最长有效期（天），超过此天数用户将被强制更改密码。
    `-W = 6. Warn`: 密码过期前警告用户的天数。
    `-I = 7. Inactive`: 密码过期后账户被禁用的天数。
    `-E = 8. Expire`: 账户被禁用的绝对日期（自1970年1月1日以来的天数）。

### **切换用户和 `sudo` 访问**

**命令:**
    `su - username`: 切换到指定用户（`-` 表示切换到该用户的环境）。
    `sudo command`: 以超级用户权限执行命令。
    `visudo`: 编辑 `/etc/sudoers` 文件，用于配置 `sudo` 权限。

**相关文件:**
    `/etc/sudoers`: 配置哪些用户或组可以使用 `sudo` 以及他们可以执行哪些命令。

---

在Linux系统中，配置用户和组（例如使用 useradd, groupadd, userdel, groupdel, usermod 等命令）通常需要 root 用户的权限。

这是因为用户和组的管理涉及到系统级别的安全和资源分配，只有 root 用户（或通过 sudo 获得 root 权限的用户）才能执行这些操作，以确保系统的稳定性和安全性。

首先我们使用`su -`来切换到root。

![VirtualBoxVM_pxqixFiB5Q.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_pxqixFiB5Q.png)

然后我们可以尝试使用`useradd`来添加一个账户。

![VirtualBoxVM_FQLiI4LrjL.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_FQLiI4LrjL.png)

可以看到我们的账户已经创建完毕了，并且我们的/home目录下也多了一个目录。接下来我们创建一个组试试。

![VirtualBoxVM_B1mVSA6bGw.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_B1mVSA6bGw.png)

![VirtualBoxVM_QNr99TvNze.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_QNr99TvNze.png)

在`/etc/group`里面可以看到所有关于组和其id的信息。

如果我们要删除用户的话，如果仅仅使用`userdel noob`，noob的home目录以及mailbox file仍然会存在，建议使用-r选项，在删除用户的同时，也移除该用户的家目录和邮箱文件。

![VirtualBoxVM_ukurkiXySM.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_ukurkiXySM.png)

然后我们尝试一下使用usermod。

![VirtualBoxVM_xEu4SD6qtp.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_xEu4SD6qtp.png)

`usermod -G`用于修改一个用户所属的“附加组”，在 Linux 中，一个用户必须属于一个“主组” (primary group)，并且可以同时属于多个“附加组”。

但是你有没有发现，我们执行完之后，/home目录下的noob目录仍然属于noob组。因为noob的主组还是noob。

如果你这时候使用`usermod -g`这个小写的g，它也只会改变用户在系统中的“默认主组”设置（即 /etc/passwd 文件中的 GID）。它不会自动去修改该用户已经拥有的所有文件（比如 /home/noob 目录）的属组。

如果你修改隶属于noob的所有文件变为fools所属的话，我们就需要使用change group命令`chgrp`：

![VirtualBoxVM_JQAyISr3ei.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_JQAyISr3ei.png)

`chgrp -R` 中的 `-R` 选项代表 "Recursive"（递归）。它的意思是：不仅改变你指定目录的属组，还要进入这个目录，改变里面所有文件、所有子目录、以及子目录里的所有文件的属组，一直重复下去，直到覆盖所有内容。

现在我们来看一看刚才提到的`/etc/passwd有什么内容：

![VirtualBoxVM_poiJUg52KB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_poiJUg52KB.png)

可以看到每当你创建一个新用户的时候，最下方就会被添加新的信息。

`/etc/passwd` 是一个用冒号分隔的文本文件，其中每一行都代表一个系统用户账户。

它定义了用户的核心信息，如**用户名**（第1字段）、**用户ID (UID)**（第3字段）、**主组ID (GID)**（第4字段）。

它还指定了用户的**家目录**（第6字段）和登录时运行的 **Shell 程序**（第7字段），其中 `/usr/sbin/nologin` 表示该账户禁止登录。