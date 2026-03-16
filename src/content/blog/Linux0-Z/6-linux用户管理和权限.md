---
title: 6.linux用户管理和权限
date: 2025-10-24 01:42:44
tags:
  - Linux
  - Permissions
  - User Management
categories:
  - Linux入门
---

# Linux 用户管理和权限

## 引言

在管理Linux系统时，尤其是在需要批量创建和管理用户账户的场景下，手动为每个用户进行繁琐的参数配置显然效率低下。为了简化这一过程并确保安全策略的一致性，Linux提供了强大的配置文件和命令来帮助我们集中管理用户策略和权限。本文将重点介绍如何通过<code>/etc/login.defs</code>文件、<code>chage</code>命令以及<code>su</code>和<code>sudo</code>命令，高效地进行用户安全设置和权限管理。

## 一、 设置用户默认策略：<code>/etc/login.defs</code> 文件

当我们创建新用户时，系统会根据<code>/etc/login.defs</code>文件中的预设值来为用户配置初始属性。这个文件定义了用户账户的全局默认策略，例如密码的有效期、长度要求等。

![VirtualBoxVM_SzIhON8hUd.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_SzIhON8hUd.png)

#### <code>login.defs</code> 文件中的重要参数

- <code>PASS_MAX_DAYS 99999</code>: 密码最长有效期（天）。
- <code>PASS_MIN_DAYS 0</code>: 密码最短有效期（天）。
- <code>PASS_MIN_LEN 5</code>: 密码最小长度。
- <code>PASS_WARN_AGE 7</code>: 密码过期前多少天开始警告用户。

除此之外，该文件还包含了用户ID（UID）和组ID（GID）的范围等信息。了解并根据安全需求配置此文件，是实现标准化用户管理的第一步。

![VirtualBoxVM_SKsdGHyAQB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_SKsdGHyAQB.png)

## 二、 精细化用户密码策略：<code>chage</code> 命令

<code>chage</code>命令允许我们针对单个用户，精细化地修改其密码的有效期信息，覆盖<code>/etc/login.defs</code>中的全局设置。

#### <code>chage</code> 命令详解

<strong>语法示例:</strong>
<code>chage [-m mindays] [-M maxdays] [-d lastday] [-I inactive] [-E expiredate] [-W warndays] user</code>

<strong>常用参数说明:</strong>
- <code>-d, --lastday LAST_DAY</code>: 密码上次更改的日期（自1970-01-01以来的天数）。
- <code>-m, --mindays MIN_DAYS</code>: 密码更改之间的最短天数。
- <code>-M, --maxdays MAX_DAYS</code>: 密码的最长有效期（天）。
- <code>-W, --warndays WARN_DAYS</code>: 密码过期前警告用户的天数。
- <code>-I, --inactive INACTIVE</code>: 密码过期后账户被禁用的天数。
- <code>-E, --expiredate EXPIRE_DATE</code>: 账户被禁用的绝对日期。

<strong>操作示例：</strong>
我们可以使用<code>chage</code>命令查看和修改特定用户的密码策略。

![VirtualBoxVM_BAOKfnlfgB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_BAOKfnlfgB.png)

## 三、 权限切换与提升：<code>su</code> 和 <code>sudo</code>

在日常管理中，我们经常需要在不同用户间切换，或者以更高的权限执行特定命令。

### 1. 切换用户：<code>su</code> 命令

<code>su - <username></code>命令可以让我们切换到指定的用户，并加载该用户的环境变量（<code>-</code>的作用）。

- 从<code>root</code>用户切换到任何其他用户，不需要输入密码。
- 从普通用户切换到<code>root</code>或其他用户，需要输入目标用户的密码。

<em>注意：在使用<code>su</code>切换到新用户前，如果该用户没有密码，<code>root</code>用户需要先使用<code>passwd <username></code>为其设置密码。</em>

![VirtualBoxVM_fcp2asq46q.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_fcp2asq46q.png)

### 2. 提升命令权限：<code>sudo</code> 命令

<code>sudo</code>命令允许普通用户以超级用户（root）的权限执行特定的、经过授权的命令，而无需知道<code>root</code>用户的密码。这是一种更安全、更可控的权限管理方式。

![VirtualBoxVM_CpJYblRhZB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_CpJYblRhZB.png)

#### 配置 <code>sudo</code> 权限

要让一个用户能够使用<code>sudo</code>，必须在<code>/etc/sudoers</code>文件中进行配置。<strong>强烈建议使用<code>visudo</code>命令来编辑此文件</strong>，因为它会在保存时检查语法错误，防止配置错误导致系统无法使用<code>sudo</code>。

我们切换到<code>root</code>用户，执行<code>visudo</code>。

![VirtualBoxVM_jqgS8JZFnb.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_jqgS8JZFnb.png)

有两种常见的方式为用户授予<code>sudo</code>权限：

<strong>方法一：直接在<code>sudoers</code>文件中添加用户</strong>

在文件中添加如下格式的行：
<code>username ALL=(ALL) ALL</code>

![VirtualBoxVM_6HFNqO3JKO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_6HFNqO3JKO.png)

<strong>方法二：将用户添加到<code>wheel</code>组（推荐）</strong>

在很多Linux发行版中，<code>/etc/sudoers</code>文件默认配置允许<code>wheel</code>组的成员执行所有命令。

![VirtualBoxVM_Xwx2TsqYAU.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_Xwx2TsqYAU.png)

因此，我们只需将用户添加为<code>wheel</code>组的附加组即可，这是一种更简洁、更易于管理的方式。

``<code>bash
usermod -aG wheel lpt
</code>`<code>

![VirtualBoxVM_nUP7Xr6rZH.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_nUP7Xr6rZH.png)

完成配置后，该用户就可以成功使用</code>sudo<code>执行命令了。

![VirtualBoxVM_gIQxh4kcmj.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_gIQxh4kcmj.png)

## 总结

本文介绍了Linux中与用户账户策略和权限管理相关的几个核心工具。通过配置</code>/etc/login.defs<code>实现全局用户策略，使用</code>chage<code>命令对单个用户进行密码时效的精细化调整，以及利用</code>su<code>和</code>sudo`进行灵活的权限切换和提升。掌握这些工具，将使你的Linux系统管理工作更加高效和安全。
