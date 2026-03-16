---
title: 17.linux_shell入门
date: 2025-11-11 01:16:23
tags:
  - Linux
  - Shell
  - Bash
categories:
  - Linux入门
---
# Linux Shell入门

Linux shell 脚本是系统管理员用来自动执行日常重复性任务的强大工具。

## Shell简介

<ul><li>  什么是 Shell？</li></ul>
    *   它就像一个容器
    *   用户和内核/操作系统之间的接口
    *   CLI 是一个 Shell
<ul><li>  查找您的 Shell</li></ul>
    *   <code>echo $0</code>
    *   可用的 Shell “<code>cat /etc/shells</code>”
        ![VirtualBoxVM_KGa19AcOH9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_KGa19AcOH9.png)
    *   那些用户们的 Shell？<code>/etc/passwd</code> （如果这个文件里面的内容是什么你忘记了，那你就应该要复习了）
<ul><li>  Windows GUI 是一个 shell</li></ul>
<ul><li>  Linux KDE GUI 是一个 shell</li></ul>
<ul><li>  Linux sh、bash 等都是 shell</li></ul>

## Shell脚本

<ul><li>  什么是 Shell 脚本？</li></ul>
    *   shell 脚本是一个可执行文件，其中包含按顺序执行的多个 shell 命令。该文件可以包含：
    *   Shell (<code>#!/bin/bash</code>)
    *   注释 (<code># comments</code>)
    *   命令 (<code>echo</code>, <code>cp</code>, <code>grep</code> 等)
    *   语句 (<code>if</code>, <code>while</code>, <code>for</code> 等)
<ul><li>  Shell 脚本应具有可执行权限（例如 <code>-rwxr-xr-x</code>）</li></ul>
<ul><li>  Shell 脚本可以从绝对路径调用（例如 <code>/home/userdir/script.bash</code>）</li></ul>
<ul><li>  如果从当前位置调用，则为 <code>./script.bash</code></li></ul>

![VirtualBoxVM_8ZjB94MngO.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_8ZjB94MngO.png)、

这个例子就是想要告诉你，你需要赋予该脚本文件可执行权限。

我们再写一个别的试试看？

![VirtualBoxVM_g3SNULXNQv.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_g3SNULXNQv.png)

## Shell 变量例

![VirtualBoxVM_dXJ0I2osJZ.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_dXJ0I2osJZ.png)

## Shell 获取用户输出

![VirtualBoxVM_jujQamtBu9.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_jujQamtBu9.png)

![VirtualBoxVM_iD4y7sPlQ4.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_iD4y7sPlQ4.png)

shell是空格敏感的，建议定义变量的时候等号左右两边不要有任何空格。

## Shell 脚本 - 基本脚本

<ul><li>  使用 <code>echo</code> 输出到屏幕</li></ul>
<ul><li>  创建任务</li></ul>
    *   告诉您的 id、当前位置、您的文件/目录、系统信息
    *   创建文件或目录
    <em>   输出到文件 “<code>></code>”
</em>   通过脚本过滤/文本处理器 (<code>cut</code>, <code>awk</code>, <code>grep</code>, <code>sort</code>, <code>uniq</code>, <code>wc</code>)

## if-then 脚本

<em>   If then 语句
    </em>   <code>If this happens = do this</code>
    <em>   <code>Otherwise = do that</code>

![VirtualBoxVM_Szp4KJ0pdP.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_Szp4KJ0pdP.png)

我们再随便写一个别的例子：

![VirtualBoxVM_wrrs9ox1sX.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_wrrs9ox1sX.png)


## For-Loop 脚本

</em>   For 循环
    <em>   <code>Keep running until specified number of variable</code>
    </em>   <code>e.g: variable = 10 then run the script 10 times</code>
    <em>   <code>OR</code>
    </em>   <code>variable = green, blue, red (then run the script 3 times for each color.</code>

![VirtualBoxVM_AHARnsN3BW.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_AHARnsN3BW.png)

![VirtualBoxVM_eJNjG6LWnW.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_eJNjG6LWnW.png)

## grep/egrep - 文本处理器命令

<em>   什么是 grep？
    </em>   grep 命令代表“全局正则表达式打印”，它逐行处理文本并打印与指定模式匹配的任何行
<em>   <code>grep --version</code> 或 <code>grep --help</code> = 检查版本或帮助
</em>   <code>grep keyword file</code> = 从文件中搜索关键字
<em>   <code>grep -c keyword file</code> = 搜索关键字并计数
</em>   <code>grep -i KEYword file</code> = 搜索关键字忽略大小写
<em>   <code>grep -n keyword file</code> = 显示匹配的行及其行号
</em>   <code>grep -v keyword file</code> = 显示除关键字外的所有内容
<em>   <code>grep keyword file | awk '{print $1}'</code> = 搜索关键字然后只给出第一个字段
</em>   <code>ls -l | grep Desktop</code> = 这个你肯定知道什么意思
<ul><li>  <code>egrep -i "keyword|keyword2" file</code> = 搜索 2 个关键字。</li></ul>
  
![VirtualBoxVM_Ib6tN0ffoT.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_Ib6tN0ffoT.png)

你可以将这些选项组合使用，请问你<code>-vi</code>选项是什么意思呢？