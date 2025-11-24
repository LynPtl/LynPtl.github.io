---
title: 18.linux计划未来任务
date: 2025-11-13 01:32:39
categories:
  - Linux入门
---
# Linux 计划未来任务

## Crontab：重复性任务调度

`crontab` 是 "cron table" 的缩写，它允许用户根据预设的时间表重复执行命令或脚本。这是在固定时间（例如每天、每周、每月）自动执行维护任务、备份或其他常规操作的理想选择。

### 主要命令

您可以使用 `crontab` 命令管理您的定时任务：

*   `crontab -e`：编辑当前用户的 crontab 文件。如果是第一次运行，系统可能会提示您选择一个文本编辑器。
*   `crontab -l`：列出当前用户的所有 cron jobs。
*   `crontab -r`：**（请谨慎使用）** 删除当前用户的所有 cron 任务。
*   `crontab -i`：在删除前进行提示，通常与 `-r` 结合使用 (`crontab -ri`) 以增加安全性。

### Crontab 语法

crontab 文件中的每一行都代表一个任务，并遵循以下格式：

```
分 时 日 月 周 命令
```

- **分 (Minute)**: 0 - 59
- **时 (Hour)**: 0 - 23
- **日 (Day of Month)**: 1 - 31
- **月 (Month)**: 1 - 12 (或使用 JAN, FEB, MAR 等)
- **周 (Day of Week)**: 0 - 7 (0 和 7 都代表星期日，或使用 SUN, MON, TUE 等)
- **命令 (Command)**: 您希望执行的命令或脚本的绝对路径。

#### 特殊字符

- `*` (星号): 代表所有可能的值。例如，在“小时”字段中表示“每小时”。
- `,` (逗号): 用于指定一个列表。例如，`1,15,30` 在“分钟”字段中表示在第1、15和30分钟执行。
- `-` (连字符): 用于指定一个范围。例如，`1-5` 在“周”字段中表示从星期一到星期五。
- `/` (斜杠): 用于指定步长。例如，`*/10` 在“分钟”字段中表示“每10分钟”。

### 使用样例

1.  **每天凌晨2点执行备份脚本:**
    ```bash
    0 2 * * * /home/user/scripts/backup.sh
    ```

2.  **每小时的第15分钟和第45分钟执行一次检查:**
    ```bash
    15,45 * * * * /home/user/scripts/check.sh
    ```

3.  **在每个工作日（周一至周五）的下午5点发送报告:**
    ```bash
    0 17 * * 1-5 /home/user/scripts/send_report.sh
    ```

4.  **每10分钟执行一次监控脚本:**
    ```bash
    */10 * * * * /home/user/scripts/monitor.sh
    ```

5.  **每月的第一天上午9点清理临时文件:**
    ```bash
    0 9 1 * * /home/user/scripts/clean_tmp.sh
    ```

**重要提示:** cron 在一个最小化的环境中运行，这意味着您在 `.bashrc` 或 `.profile` 中设置的环境变量可能不会被加载。因此，在您的脚本中，**强烈建议始终使用命令和文件的绝对路径**（例如，使用 `/bin/rm` 而不是 `rm`）。

![VirtualBoxVM_0ou3cuoUMj.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_0ou3cuoUMj.png)

现在的RHEL10已经有了删除自动备份的功能...

![VirtualBoxVM_gKiHXfV81F.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_gKiHXfV81F.png)

---

## at：一次性任务调度

`at` 命令用于安排一个命令或脚本在未来的某个特定时间点**执行一次**。这对于不需要重复的、一次性的任务非常有用。

在使用 `at` 之前，请确保 `atd` 服务正在运行。您可以使用 `sudo systemctl status atd` 来检查其状态。

### 主要命令

*   `at [时间]`：开始一个交互式的 `at` 会话，在 `at>` 提示符下输入您想执行的命令。按 `Ctrl+D` 保存并退出。
*   `atq` 或 `at -l`：列出当前用户所有待处理的 `at` 任务。
*   `atrm [任务编号]` 或 `at -d [任务编号]`：删除一个已安排的 `at` 任务。
*   `at -c [任务编号]`：查看指定任务的具体内容。
*   `at -f [文件] [时间]`：从指定文件中读取命令并在指定时间执行。

### 时间格式

`at` 命令在时间格式上非常灵活：

*   **绝对时间**: `HH:MM` (例如 `14:30`), `HH:MM AM/PM` (例如 `02:30 PM`)。
*   **关键字**: `now`, `midnight` (午夜), `noon` (中午), `teatime` (下午4点)。
*   **相对时间**: `now + N minutes/hours/days/weeks` (例如 `now + 1 hour`)。
*   **日期**: `today` (今天), `tomorrow` (明天), 或具体的日期如 `Jan 31`, `2025-12-25`。

### 使用样例

1.  **10分钟后重启服务器:**
    ```bash
    echo "sudo reboot" | at now + 10 minutes
    ```

2.  **明天下午3点发送一个提醒:**
    (进入交互模式)
    ```bash
    at 3pm tomorrow
    ```
    然后输入:
    ```
    at> echo "记得参加会议" | wall
    at> (按 Ctrl+D 结束)
    ```
    `wall` 命令会将消息广播给所有登录的用户。

3.  **在2025年12月31日的23:59执行一个脚本:**
    ```bash
    at -f /home/user/scripts/end_of_year.sh 23:59 12/31/2025
    ```

4.  **查看并删除一个任务:**
    首先，列出所有任务：
    ```bash
    atq
    # 假设输出显示任务号为 4
    # 4    Fri Nov 14 15:00:00 2025 a user
    ```
    然后，删除这个任务：
    ```bash
    atrm 4
    ```