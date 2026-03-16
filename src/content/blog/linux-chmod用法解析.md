---
title: linux-chmod用法解析
date: 2026-01-10 13:47:03
tags:
  - Linux
  - chmod
  - 权限管理
categories:
  - Linux命令
---
# 解析 Linux chmod 的数字模式与符号模式

在学习 AWS 认证（如 SAA）或进行 DevOps 实操时，我们经常会遇到这样一个报错：
<code>WARNING: UNPROTECTED PRIVATE KEY FILE!</code> 
这是因为 SSH 客户端要求私钥文件（.pem）必须具备严格的权限控制。解决它的核心命令就是 <code>chmod</code>。

本文将带你彻底搞懂 <code>chmod</code> 的两种操作方式：<strong>数字模式 (Numeric Mode)</strong> 与 <strong>符号模式 (Symbolic Mode)</strong>。

---

## 一、 数字模式：逻辑严密的八进制法

数字模式是 Linux 系统中最常用的方式，它通过三个（或四个）八进制数字来定义权限。

### 1. 核心权重计算
每一个数字代表一个特定角色的权限总和。你只需要记住 <strong>4 (读)、2 (写)、1 (执行)</strong>：

| 权限 | 缩写 | 数字权重 |
| :--- | :--- | :--- |
| <strong>读取 (Read)</strong> | <code>r</code> | <strong>4</strong> |
| <strong>写入 (Write)</strong> | <code>w</code> | <strong>2</strong> |
| <strong>执行 (Execute)</strong> | <code>x</code> | <strong>1</strong> |
| <strong>无权限</strong> | <code>-</code> | <strong>0</strong> |

<strong>计算公式：</strong> 最终权限 = $Read + Write + Execute$。
<em> 例如：<code>rwx</code> = 4 + 2 + 1 = <strong>7</strong>
</em> 例如：<code>rw-</code> = 4 + 2 + 0 = <strong>6</strong>
<em> 例如：<code>r--</code> = 4 + 0 + 0 = <strong>4</strong>

### 2. 三位数的含义
一个典型的数字命令如 <code>chmod 755</code>，其数字位置对应不同的对象：

1. <strong>第一位</strong>：文件所有者 (User/Owner)
2. <strong>第二位</strong>：所属组 (Group)
3. <strong>第三位</strong>：其他人 (Others)

> <strong>典型案例：</strong> <code>chmod 400 my-key.pem</code>
> 意味着：所有者仅读 (4)，组和其他人无任何权限 (00)。这是 AWS 私钥的安全标准。

---

## 二、 符号模式：直观的语义表达

如果你不想做算术题，符号模式提供了更具可读性的方式。它的语法结构是：<strong>谁 (Who) 操作 (Operator) 权限 (Permission)</strong>。

### 1. 组成部分
</em> <strong>Who（对象）</strong>：<code>u</code> (用户), <code>g</code> (组), <code>o</code> (其他人), <code>a</code> (所有人)
<em> <strong>Operator（操作）</strong>：<code>+</code> (增加), <code>-</code> (移除), <code>=</code> (精确设定/覆盖)
</em> <strong>Permission（权限）</strong>：<code>r</code> (读), <code>w</code> (写), <code>x</code> (执行)

### 2. 常用操作对比

| 需求 | 符号命令 | 说明 |
| :--- | :--- | :--- |
| <strong>增加执行权</strong> | <code>chmod +x script.sh</code> | 给所有人增加执行权限 |
| <strong>移除写权限</strong> | <code>chmod go-w file.txt</code> | 移除组和其他人的写权限 |
| <strong>精确设置权限</strong> | <code>chmod u=rwx,go=rx file</code> | 所有者全开，其他人只读/执行 |
| <strong>保护私钥</strong> | <code>chmod u=r,go= key.pem</code> | <strong>精确设置</strong>所有者只读，其余留空 |

---

## 三、 实战：为什么 AWS 私钥非要 400？

当你从 AWS 下载 <code>.pem</code> 文件后，默认权限通常是 <code>0644</code> (针对 Linux) 或更高。

<em> <strong>0644 的危险之处：</strong> 这意味着系统里的其他用户可以读取你的私钥，从而可能盗取你的服务器访问权。
</em> <strong>SSH 的强制校验：</strong> SSH 协议设计者为了安全性，会在连接前检查私钥权限。如果权限超过 <code>0400</code>（即除了所有者，其他人有任何权限），连接就会被强制中断。

<strong>解决方案对比：</strong>
<em> <strong>数字法：</strong> <code>chmod 400 my-key.pem</code>（最推荐，简单快捷）
</em> <strong>符号法：</strong> <code>chmod u=r,go= my-key.pem</code>（最清晰，明确清空他人权限）

---

## 四、 总结：我该选哪种？

<em> <strong>选择数字模式</strong>：当你需要快速、一次性设置完整的权限位时（如 <code>755</code>, <code>644</code>, <code>400</code>）。这在编写自动化脚本、Ansible 配置时是行业标准。
</em> <strong>选择符号模式</strong>：当你只想微调现有权限时（如“我想给这个文件加个执行权”，即 <code>chmod +x</code>），或者你觉得计算数字太麻烦时。

---

<strong>💡 小贴士：</strong> 你可以使用 <code>ls -l</code> 命令来查看修改后的结果。如果看到权限位显示为 <code>-r--------</code>，那么恭喜你，你的私钥现在非常安全！

![WindowsTerminal_cKSZwHPfFB.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2026/01/WindowsTerminal_cKSZwHPfFB.png)