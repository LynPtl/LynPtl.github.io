---
title: 4.Linux文本编辑器
date: 2025-10-20 22:53:35
tags:
  - Linux
  - Vim
  - Editor
categories:
  - Linux入门
---

# Linux 文本编辑器

## 一、vi/vim 简介

<strong>文本编辑器</strong>是一个能够让您在Linux文件中创建和操作文本数据的程序。<code>vi</code> 是一个强大的可视化编辑器，几乎所有Linux发行版都内置，而 <code>vim</code> 是其功能更全面的增强版。

除了 <code>vi</code>/<code>vim</code>，Linux中还有其他文本编辑器，例如：
- <code>ed</code>: 标准行编辑器
- <code>ex</code>: 扩展行编辑器
- <code>emacs</code>: 全屏编辑器
- <code>pico</code>: 初学者编辑器

## 二、基本操作入门

### 1. 创建文件并进入 vi

首先，使用 <code>vi</code> 命令加上一个文件名来创建或打开文件。例如 <code>vi myfile</code>。
![VirtualBoxVM_x6PHLmwQd0.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_x6PHLmwQd0.png)

按下回车后，您将进入 <code>vi</code> 的<strong>普通模式</strong>。
![VirtualBoxVM_ckyRSkSg8s.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_ckyRSkSg8s.png)

> 此时左下角显示新文件名 <code>myfile_file[New]</code>，表明您正处于普通模式下。

### 2. 插入模式：输入文本

在普通模式下，按下 <code>i</code> 键，即可进入<strong>插入模式</strong>。
![VirtualBoxVM_FWOWlMC0nh.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_FWOWlMC0nh.png)

> 左下角出现 <code>-- INSERT --</code>，表示您现在可以输入文本了。

现在，输入一些示例文字。
![VirtualBoxVM_8MG3O4dQik.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_8MG3O4dQik.png)

### 3. 保存与退出

输入完成后，需要先回到普通模式才能进行保存。
按下 <code>Esc</code> 键，左下角的 <code>-- INSERT --</code> 消失，返回普通模式。
![VirtualBoxVM_n2RuJesUL2.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_n2RuJesUL2.png)

您有两种常用的方式来保存并退出：

<strong>方式一：命令模式</strong>
1.  键入冒号 <code>:</code> 进入<strong>命令模式</strong>。
2.  输入 <code>wq</code> (<code>w</code>代表写入，<code>q</code>代表退出) 后按回车。

![VirtualBoxVM_0ho7TE31XQ.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_0ho7TE31XQ.png)

<strong>方式二：快捷键</strong>
在普通模式下，连续按两次大写的 <code>Z</code> (即 <code>Shift + z</code> 两次)，同样可以保存并退出。

回到命令行后，可以使用 <code>cat myfile</code> 命令查看文件内容，确认已保存。
![VirtualBoxVM_MAywsgnCki.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_MAywsgnCki.png)

## 三、常用命令参考

### 1. 命令模式 (按 <code>:</code> 进入)

| 命令 | 功能 |
| :--- | :--- |
| <code>:w</code> | <strong>保存</strong>文件 (Write) |
| <code>:q</code> | <strong>退出</strong>编辑器 (Quit) |
| <code>:wq</code> | <strong>保存并退出</strong> |
| <code>:q!</code> | <strong>强制退出</strong>，不保存任何修改 |
| <code>:w new_filename</code> | 将当前内容<strong>另存为</strong> <code>new_filename</code> |
| <code>:set nu</code> | 显示行号 |
| <code>:set nonu</code> | 隐藏行号 |

### 2. 普通模式 - 编辑操作

vi/vim 中，“复制” 称为 “Yank” (<code>y</code>)，“删除” 称为 “Delete” (<code>d</code>)，“粘贴” 称为 “Put” (<code>p</code>)。

<strong>删除</strong>
- <code>x</code>: 删除当前光标所在的<strong>一个字符</strong>。
- <code>dw</code>: 删除从当前光标到<strong>下一个单词开头</strong>的内容 (Delete Word)。
- <code>d$</code>: 删除从当前光标到<strong>行尾</strong>的内容。
- <code>dd</code>: <strong>删除当前整行</strong> (被删除的内容会被自动复制)。
- <code>5dd</code>: 一次性删除 5 行。

<strong>复制</strong>
- <code>yw</code>: <strong>复制</strong>一个单词 (Yank Word)。
- <code>yy</code>: <strong>复制当前整行</strong> (Yank Line)。
- <code>5yy</code>: 一次性复制 5 行。

<strong>粘贴</strong>
- <code>p</code>: 在光标<strong>之后</strong>粘贴 (Put)。
- <code>P</code>: 在光标<strong>之前</strong>粘贴。

<strong>撤销/重做/替换</strong>
- <code>u</code>: <strong>撤销</strong>上一步操作 (Undo)。
- <code>Ctrl + r</code>: <strong>重做</strong>上一步被撤销的操作 (Redo)。
- <code>r</code>: 替换光标所在的<strong>一个字符</strong> (按 <code>r</code> 后再按你想替换的字符)。

### 3. 普通模式 - 搜索操作

- <code>/search_term</code>: <strong>向下搜索</strong> "search_term"。
- <code>?search_term</code>: <strong>向上搜索</strong> "search_term"。
- <code>n</code>: 跳到<strong>下一个</strong>搜索结果 (Next)。
- <code>N</code>: 跳到<strong>上一个</strong>搜索结果。
- <code>*</code>: <strong>向下</strong>搜索光标当前所在的单词。
- <code>#</code>: <strong>向上</strong>搜索光标当前所在的单词。

![VirtualBoxVM_8AxnWVGnP9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_8AxnWVGnP9.png)
