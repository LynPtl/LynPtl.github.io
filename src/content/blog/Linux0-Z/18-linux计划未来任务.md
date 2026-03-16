---
title: 18.linux计划未来任务
date: 2025-11-13 01:32:39
tags:
  - Linux
  - Cron
categories:
  - Linux入门
---
# Linux 计划未来任务

## Crontab：重复性任务调度

<code>crontab</code> 是 "cron table" 的缩写，它允许用户根据预设的时间表重复执行命令或脚本。这是在固定时间（例如每天、每周、每月）自动执行维护任务、备份或其他常规操作的理想选择。

### 主要命令

您可以使用 <code>crontab</code> 命令管理您的定时任务：

<em>   <code>crontab -e</code>：编辑当前用户的 crontab 文件。如果是第一次运行，系统可能会提示您选择一个文本编辑器。
</em>   <code>crontab -l</code>：列出当前用户的所有 cron jobs。
<em>   <code>crontab -r</code>：<strong>（请谨慎使用）</strong> 删除当前用户的所有 cron 任务。
</em>   <code>crontab -i</code>：在删除前进行提示，通常与 <code>-r</code> 结合使用 (<code>crontab -ri</code>) 以增加安全性。

### Crontab 语法

crontab 文件中的每一行都代表一个任务，并遵循以下格式：

``<code>
分 时 日 月 周 命令
</code>`<code>

- <strong>分 (Minute)</strong>: 0 - 59
- <strong>时 (Hour)</strong>: 0 - 23
- <strong>日 (Day of Month)</strong>: 1 - 31
- <strong>月 (Month)</strong>: 1 - 12 (或使用 JAN, FEB, MAR 等)
- <strong>周 (Day of Week)</strong>: 0 - 7 (0 和 7 都代表星期日，或使用 SUN, MON, TUE 等)
- <strong>命令 (Command)</strong>: 您希望执行的命令或脚本的绝对路径。

#### 特殊字符

- </code><em><code> (星号): 代表所有可能的值。例如，在“小时”字段中表示“每小时”。
- </code>,<code> (逗号): 用于指定一个列表。例如，</code>1,15,30<code> 在“分钟”字段中表示在第1、15和30分钟执行。
- </code>-<code> (连字符): 用于指定一个范围。例如，</code>1-5<code> 在“周”字段中表示从星期一到星期五。
- </code>/<code> (斜杠): 用于指定步长。例如，</code></em>/10<code> 在“分钟”字段中表示“每10分钟”。

### 使用样例

1.  <strong>每天凌晨2点执行备份脚本:</strong>
    </code>`<code>bash
    0 2 <em> </em> <em> /home/user/scripts/backup.sh
    </code>`<code>

2.  <strong>每小时的第15分钟和第45分钟执行一次检查:</strong>
    </code>`<code>bash
    15,45 </em> <em> </em> <em> /home/user/scripts/check.sh
    </code>`<code>

3.  <strong>在每个工作日（周一至周五）的下午5点发送报告:</strong>
    </code>`<code>bash
    0 17 </em> <em> 1-5 /home/user/scripts/send_report.sh
    </code>`<code>

4.  <strong>每10分钟执行一次监控脚本:</strong>
    </code>`<code>bash
    </em>/10 <em> </em> <em> </em> /home/user/scripts/monitor.sh
    </code>`<code>

5.  <strong>每月的第一天上午9点清理临时文件:</strong>
    </code>`<code>bash
    0 9 1 <em> </em> /home/user/scripts/clean_tmp.sh
    </code>`<code>

<strong>重要提示:</strong> cron 在一个最小化的环境中运行，这意味着您在 </code>.bashrc<code> 或 </code>.profile<code> 中设置的环境变量可能不会被加载。因此，在您的脚本中，<strong>强烈建议始终使用命令和文件的绝对路径</strong>（例如，使用 </code>/bin/rm<code> 而不是 </code>rm<code>）。

![VirtualBoxVM_0ou3cuoUMj.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_0ou3cuoUMj.png)

现在的RHEL10已经有了删除自动备份的功能...

![VirtualBoxVM_gKiHXfV81F.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_gKiHXfV81F.png)

---

## at：一次性任务调度

</code>at<code> 命令用于安排一个命令或脚本在未来的某个特定时间点<strong>执行一次</strong>。这对于不需要重复的、一次性的任务非常有用。

在使用 </code>at<code> 之前，请确保 </code>atd<code> 服务正在运行。您可以使用 </code>sudo systemctl status atd<code> 来检查其状态。

### 主要命令

<em>   </code>at [时间]<code>：开始一个交互式的 </code>at<code> 会话，在 </code>at><code> 提示符下输入您想执行的命令。按 </code>Ctrl+D<code> 保存并退出。
</em>   </code>atq<code> 或 </code>at -l<code>：列出当前用户所有待处理的 </code>at<code> 任务。
<em>   </code>atrm [任务编号]<code> 或 </code>at -d [任务编号]<code>：删除一个已安排的 </code>at<code> 任务。
</em>   </code>at -c [任务编号]<code>：查看指定任务的具体内容。
<em>   </code>at -f [文件] [时间]<code>：从指定文件中读取命令并在指定时间执行。

### 时间格式

</code>at<code> 命令在时间格式上非常灵活：

</em>   <strong>绝对时间</strong>: </code>HH:MM<code> (例如 </code>14:30<code>), </code>HH:MM AM/PM<code> (例如 </code>02:30 PM<code>)。
<em>   <strong>关键字</strong>: </code>now<code>, </code>midnight<code> (午夜), </code>noon<code> (中午), </code>teatime<code> (下午4点)。
</em>   <strong>相对时间</strong>: </code>now + N minutes/hours/days/weeks<code> (例如 </code>now + 1 hour<code>)。
<ul><li>  <strong>日期</strong>: </code>today<code> (今天), </code>tomorrow<code> (明天), 或具体的日期如 </code>Jan 31<code>, </code>2025-12-25<code>。</li></ul>

### 使用样例

1.  <strong>10分钟后重启服务器:</strong>
    </code>`<code>bash
    echo "sudo reboot" | at now + 10 minutes
    </code>`<code>

2.  <strong>明天下午3点发送一个提醒:</strong>
    (进入交互模式)
    </code>`<code>bash
    at 3pm tomorrow
    </code>`<code>
    然后输入:
    </code>`<code>
    at> echo "记得参加会议" | wall
    at> (按 Ctrl+D 结束)
    </code>`<code>
    </code>wall<code> 命令会将消息广播给所有登录的用户。

3.  <strong>在2025年12月31日的23:59执行一个脚本:</strong>
    </code>`<code>bash
    at -f /home/user/scripts/end_of_year.sh 23:59 12/31/2025
    </code>`<code>

4.  <strong>查看并删除一个任务:</strong>
    首先，列出所有任务：
    </code>`<code>bash
    atq
    # 假设输出显示任务号为 4
    # 4    Fri Nov 14 15:00:00 2025 a user
    </code>`<code>
    然后，删除这个任务：
    </code>`<code>bash
    atrm 4
    </code>``