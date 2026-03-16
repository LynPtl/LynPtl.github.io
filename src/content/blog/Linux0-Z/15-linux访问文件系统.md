---
title: 15.linux访问文件系统
date: 2025-11-03 01:51:43
tags:
  - Linux
  - File System
categories:
  - Linux入门
---
# Linux 访问文件系统

<em>   文件系统是一种结构化的方式，用于存储所有文件和目录。
</em>   要访问这些文件，我们需要使用导航工具。
<em>   以下是用于访问 Linux 文件系统的基本工具或命令：

    </em>   <code>ls</code>：列出目录内容
        <em>   <code>ls</code> 命令用于显示指定目录中的文件和子目录。如果不指定目录，则显示当前目录的内容。
        </em>   <strong>基础用法示例</strong>：
            ``<code>bash
            # 列出当前目录的内容
            ls

            # 列出/home目录的内容
            ls /home

            # 以长格式（long format）列出内容，显示权限、所有者、大小和修改日期等详细信息
            ls -l

            # 列出所有文件，包括隐藏文件（以.开头的文件）
            ls -a
            </code>`<code>

    <em>   </code>cd<code>：更改目录
        </em>   </code>cd<code> (Change Directory) 命令用于从一个目录切换到另一个目录。
        <em>   <strong>基础用法示例</strong>：
            </code>`<code>bash
            # 切换到 /var/log 目录
            cd /var/log

            # 切换到上一级目录
            cd ..

            # 快速返回当前用户的主目录
            cd ~
            # 或者直接使用 cd
            cd
            </code>`<code>

    </em>   </code>pwd<code>：显示当前工作目录
        <em>   </code>pwd<code> (Print Working Directory) 命令用于显示您当前所在的完整目录路径。
        </em>   <strong>基础用法示例</strong>：
            </code>`<code>bash
            # 打印出当前工作目录的绝对路径
            pwd
            </code>`<code>

    <em>   </code>df<code>：报告文件系统磁盘空间使用情况
        </em>   </code>df<code> (Disk Free) 命令用于显示文件系统的总空间、已用空间、可用空间和挂载点。
        <em>   <strong>基础用法示例</strong>：
            </code>`<code>bash
            # 显示所有已挂载文件系统的空间使用情况
            df

            # 以人类可读的格式（例如 KB, MB, GB）显示，更易于阅读
            df -h
            </code>`<code>

    </em>   </code>du<code>：估算文件空间使用情况
        <em>   </code>du<code> (Disk Usage) 命令用于估算文件和目录占用的磁盘空间大小。
        </em>   <strong>基础用法示例</strong>：
            </code>`<code>bash
            # 显示当前目录下每个子目录占用的空间
            du

            # 以人类可读的格式显示当前目录的总大小
            du -sh .

            # 以人类可读的格式显示/home目录下所有文件和目录的大小
            du -h /home
            </code>`<code>

    <em>   </code>fdisk<code>：操作磁盘分区表
        </em>   </code>fdisk<code> 是一个强大的命令行工具，用于查看、创建和管理磁盘分区。此命令通常需要管理员权限。
        <em>   <strong>基础用法示例</strong>：
            </code>`<code>bash
            # 列出所有磁盘及其分区表（需要root或sudo权限）
            sudo fdisk -l
            </code>`<code>

</em>   <strong>绝对路径和相对路径</strong>
    <em>   在 Linux 中，路径是定位文件或目录的方式。
    </em>   <strong>绝对路径</strong>：路径总是从根目录 </code>/<code> 开始。它是一个完整的、明确的路径，无论您当前在哪个目录下，它都指向同一个位置。例如：</code>/home/user/documents/file.txt<code>。
    <em>   <strong>相对路径</strong>：路径是相对于您当前的“工作目录”而言的。它不以 </code>/<code> 开头。例如，如果您在 </code>/home/user<code> 目录下，那么 </code>documents/file.txt<code> 就是一个相对路径。

</em>   <strong>特殊目录符号</strong>
    <em>   </code>~<code> (波浪号/Tilde)：代表当前用户的主目录。例如，如果您的用户名是 </code>alex<code>，那么 </code>~<code> 就等同于 </code>/home/alex<code>。
    </em>   </code>.<code> (单个点)：代表当前目录。
    *   </code>..` (两个点)：代表上一级（父）目录。