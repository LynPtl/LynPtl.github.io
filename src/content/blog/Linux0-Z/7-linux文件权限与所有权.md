---
title: 7.linux文件权限与所有权
date: 2025-10-24 22:19:56
tags:
  - Linux
  - Permissions
  - Ownership
categories:
  - Linux入门
---

# Linux 文件权限与所有权

## 文件权限

在 UNIX 和 Linux 系统中，文件和目录的访问权限是系统安全的基础。

### 权限类型

每个文件和目录都有三种基本权限：

<em>   <strong><code>r</code> (Read - 读取):</strong>
    </em>   对于文件：可以查看文件内容。
    <em>   对于目录：可以列出目录中的文件和子目录。
</em>   <strong><code>w</code> (Write - 写入):</strong>
    <em>   对于文件：可以修改文件内容。
    </em>   对于目录：可以在目录中创建、删除或重命名文件。
<em>   <strong><code>x</code> (Execute - 执行):</strong>
    </em>   对于文件：可以将文件作为程序执行。
    <em>   对于目录：可以进入该目录（例如，使用 <code>cd</code> 命令）。

### 权限级别

这三种权限分别应用于三个不同的级别：

</em>   <strong><code>u</code> (User - 用户):</strong> 文件的所有者。
<em>   <strong><code>g</code> (Group - 组):</strong> 拥有该文件的用户组。
</em>   <strong><code>o</code> (Others - 其他):</strong> 系统上的所有其他用户。

### 查看权限

使用 <code>ls -l</code> 命令可以查看文件和目录的详细信息，包括其权限。

![VirtualBoxVM_HwRsK09O7B.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_HwRsK09O7B.png)

权限字符串（例如 <code>-rwxr-xr--</code>）的第一位表示文件类型（<code>-</code> 表示普通文件，<code>d</code> 表示目录）。接下来的九位分为三组，分别代表所有者、所属组和其他用户的权限。

<strong>示例分析 (<code>-rw-r--r--</code>):</strong>

<em>   <strong>所有者 (<code>rw-</code>):</strong> 可以读取和写入，但不能执行。
</em>   <strong>所属组 (<code>r--</code>):</strong> 只能读取。
<em>   <strong>其他用户 (<code>r--</code>):</strong> 只能读取。

### 修改权限 (<code>chmod</code>)

<code>chmod</code> 命令用于修改文件或目录的权限。

<strong>使用方法:</strong>

可以使用符号模式（<code>u</code>, <code>g</code>, <code>o</code>, <code>a</code> (all) 和 <code>+</code>, <code>-</code>, <code>=</code>）来添加、删除或设置权限。

![VirtualBoxVM_6rP9k0Ad3h.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_6rP9k0Ad3h.png)

<strong>示例:</strong>

</em>   为所属组添加写入权限：
    ``<code>bash
    chmod g+w error.log
    </code>`<code>

![VirtualBoxVM_UY52ik3ttn.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_UY52ik3ttn.png)

![VirtualBoxVM_JwZyceXRcl.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_JwZyceXRcl.png)

---

## 文件所有权

### 所有权概念

<em>   <strong>用户 (User):</strong> 文件或目录的创建者，即所有者。
</em>   <strong>组 (Group):</strong> 一个用户组，可以共享文件访问权限。

### 修改所有权

#### </code>chown<code> 命令

</code>chown<code> 命令用于更改文件或目录的所有者和/或所属组。

<strong>使用方法:</strong>
</code>`<code>bash
chown [选项] 新所有者[:新组] 文件或目录
</code>`<code>

<strong>示例:</strong>
<em>   将 </code>file.txt<code> 的所有者更改为 </code>user1<code>:
    </code>`<code>bash
    chown user1 file.txt
    </code>`<code>
</em>   同时更改所有者和所属组:
    </code>`<code>bash
    chown user1:group1 file.txt
    </code>`<code>

#### </code>chgrp<code> 命令

</code>chgrp<code> 命令仅用于更改文件或目录的所属组。

<strong>使用方法:</strong>
</code>`<code>bash
chgrp [选项] 新组 文件或目录
</code>`<code>

<strong>示例:</strong>
<em>   将 </code>file.txt<code> 的所属组更改为 </code>group1<code>:
    </code>`<code>bash
    chgrp group1 file.txt
    </code>`<code>

#### 递归更改 (</code>-R<code>)

</code>-R<code> 选项可以递归地更改目录及其所有内容的所 有权。

<strong>示例:</strong>
</em>   递归地将 </code>/data<code> 目录的所有权赋予 </code>user1<code>:
    </code>`<code>bash
    chown -R user1 /data
    </code>``