---
title: 11.linux日志监控与时间同步
date: 2025-10-30 01:44:00
tags:
  - Linux
  - Logs
  - NTP
categories:
  - Linux入门
---

# Linux 日志监控与时间同步

## 1. 日志监控 (Log Monitoring)

-   <strong>目的</strong>: 系统管理中非常重要的一部分，用于分析系统事件和故障排除。
-   <strong>日志目录</strong>: <code>/var/log</code>
-   <strong>常见日志文件/目录</strong>:
    -   <code>boot</code>: 系统启动日志
    -   <code>chronyd</code>: NTP (Network Time Protocol) 服务日志
    -   <code>cron</code>: 计划任务日志
    -   <code>maillog</code>: 邮件服务日志
    -   <code>secure</code>: 安全相关日志 (如认证失败)
    -   <code>messages</code>: 核心系统日志
    -   <code>httpd</code>: Web 服务器 (Apache) 日志

![VirtualBoxVM_jsOwGTYJhf.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_jsOwGTYJhf.png)

![VirtualBoxVM_DA5KNbi58H.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_DA5KNbi58H.png)

对于那些<code>root</code>所有权的文件，我们作为一个普通用户是无权的。需要提权之后才能查看。
（当然有一部分并不是不能看，还记得我们的文件权限吗？那些最后对于所有人开放r权限的就可以看。）

切换到root用户后，我们尝试来看一个日志。

![VirtualBoxVM_kuvzsNnH8H.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_kuvzsNnH8H.png)

现在看的这个是boot.log，是启动日志。你的每一次开机新产生的启动日志都会覆盖这个文件。

对于这些日志具体有什么内容，请你自行学习。作为一个合格的管理员，你应该要知道出现什么样的问题需要看哪一个日志。

---

## 2. 维护精确时间 (Maintaining Accurate Time)

-   <strong>重要性</strong>:
    -   对于跨多个系统的日志文件分析至关重要。
    -   是生产环境中敏感应用程序 (如数据库) 的要求。
-   <strong>NTP (Network Time Protocol)</strong>:
    -   机器与 NTP 服务器同步时间的标准方式。
    -   NTP 服务器是专门的机器/计算机，响应客户端的时间同步请求。
-   <strong>chronyd</strong>:
    -   在较新的 Linux 版本中用于时间同步的 NTP 服务。

### 2.1. 时间管理相关命令

-   <strong>显示系统时间/日期</strong>:
    ``<code>bash
    date
    </code>`<code>
-   <strong>时间/日期和 NTP 设置命令</strong>: </code>timedatectl<code>
    -   <strong>获取帮助</strong>:
        </code>`<code>bash
        timedatectl --help
        </code>`<code>
    -   <strong>查看时区列表</strong>:
        </code>`<code>bash
        timedatectl list-timezones
        </code>`<code>
    -   <strong>设置时区</strong>:
        </code>`<code>bash
        timedatectl set-timezone America/New_York
        </code>`<code>
    -   <strong>设置时间 (HH:MM:SS)</strong>:
        </code>`<code>bash
        timedatectl set-time HH:MM:SS
        </code>`<code>
    -   <strong>设置时间与日期 (YYYY-MM-DD HH:MM:SS)</strong>:
        </code>`<code>bash
        timedatectl set-time 'YYYY-MM-DD HH:MM:SS'
        # 示例: timedatectl set-time '2021-08-18 20:15:50'
        </code>`<code>
    -   <strong>启用 NTP 同步</strong>:
        </code>`<code>bash
        timedatectl set-ntp true
        </code>`<code>

![VirtualBoxVM_kzrc58cNQp.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_kzrc58cNQp.png)

### 2.2. chronyd 详情

-   <strong>目的</strong>: 时间同步
-   <strong>包名</strong>: </code>chronyd<code>
-   <strong>配置文件</strong>: </code>/etc/chrony.conf<code>
-   <strong>日志文件</strong>: </code>/var/log/chrony<code>
-   <strong>服务管理</strong>:
    </code>`<code>bash
    systemctl start/restart chronyd
    </code>`<code>
-   <strong>程序命令</strong>: </code>chronyc<code>

![VirtualBoxVM_0fBDrctMqs.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_0fBDrctMqs.png)

如果你没有</code>chronyd<code>，请运行</code>yum install chrony<code>.

![VirtualBoxVM_mTxlrJbiq0.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_mTxlrJbiq0.png)

![VirtualBoxVM_56qInuPznr.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_56qInuPznr.png)

使用</code>chronyc<code>进入程序，你可以使用</code>help<code>来查看所支持的命令：

![VirtualBoxVM_0nXkuDhQUc.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_0nXkuDhQUc.png)

这里给了一个使用示范，我使用</code>sources<code>查看正在使用的。

![VirtualBoxVM_QwqPhB9EeR.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_QwqPhB9EeR.png)

最后题外话：

从 <strong>RHEL 7</strong> (Red Hat Enterprise Linux 7) 和 CentOS 7 开始，Red Hat 就已经将默认的 NTP 客户端从 </code>ntpd<code> 换成了 </code>chrony<code>。

  <em> </code>chrony<code> (即 </code>chronyd<code> 服务) 被证实<strong>同步速度更快</strong>，<strong>资源占用更低</strong>。
  </em> 它对<strong>虚拟机(VM)和网络连接不稳定</strong>的设备（比如笔记本电脑）支持得更好。

因此，在你现在使用的大多数现代 RHEL/CentOS/Rocky Linux/AlmaLinux 系统上：

1.  </code>ntpd<code> 服务（来自 </code>ntp<code> 软件包）<strong>默认不再安装</strong>。
2.  </code>chronyd<code> 服务（来自 </code>chrony<code> 软件包）<strong>是默认安装并启用的</strong>。

如果你想查看时间同步服务，你应该检查 </code>chrony<code> 的状态：

</code>`<code>bash
systemctl status chronyd
</code>`<code>

如果你确实<strong>特别</strong>需要使用 </code>ntpd<code>，你仍然可以手动安装它（比如 </code>sudo yum install ntp<code>），但在安装前你<strong>必须</strong>先停止并禁用 </code>chrony<code>，因为它们会占用相同的端口（UDP 123）而产生冲突。

不过，除非有特殊的老旧应用需求，否则强烈推荐使用现代的 </code>chrony`。