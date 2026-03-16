---
title: 26.linux控制引导过程
date: 2025-11-23 00:08:25
tags:
  - Linux
  - Boot
  - Grub
categories:
  - Linux入门
---
# Linux 控制引导过程

本章内容旨在帮助您理解现代 Linux 的引导过程，设置默认的 `systemd` 目标，以及处理一些常见的引导问题，如恢复 root 密码和修复文件系统损坏。

## 1. Linux 引导过程 (较新版本)

*   CentOS/Redhat 7 及以上版本的引导顺序发生了变化。
*   `systemd` 是 CentOS/RHEL 7 中的新服务管理器，负责管理引导序列。
*   它向后兼容旧版 RedHat Linux (包括 RHEL 6) 中使用的 `SysV init` 脚本。
*   每一位系统管理员都需要理解操作系统的引导过程，以便能够有效地进行故障排查。

### `systemd` 引导流程详解

1.  **BIOS** = 基本输入输出设置 (固件接口)
    *   执行 **POST** = 开机自检。

2.  **MBR** = 主引导记录
    *   信息保存在硬盘的第一个扇区，它指明了 GRUB2 的位置，以便将其加载到计算机内存 (RAM) 中。

3.  **GRUB2** = Grand Unified Boot Loader v2
    *   加载 Linux 内核。
    *   配置文件: `/boot/grub2/grub.cfg`。

4.  **Kernel** = 操作系统核心
    *   从 `initrd.img` 加载所需的驱动程序。
    *   启动第一个操作系统进程 (`systemd`)。

5.  **Systemd** = 系统守护进程 (PID # 1)
    *   启动所有必需的进程。
    *   读取 `/etc/systemd/system/default.target` 文件，将系统带入指定的运行级别。
    *   总共有 7 个运行级别 (0 到 6)。

---

## 2. 如何重启/关机

*   要从命令行关闭或重启系统，您可以使用 `systemctl` 命令。
*   `systemctl poweroff` = 停止所有正在运行的服务，卸载所有文件系统，然后关闭系统。
*   `systemctl reboot` = 停止所有正在运行的服务，卸载所有文件系统，然后重启系统。
*   您也可以使用这些命令的缩短版，如 `shutdown`, `poweroff` 和 `reboot`，它们是指向 `systemctl` 对应功能的符号链接。

---

## 3. 选择 `systemd` 目标 (Target)

`systemd` 是决定操作系统需要进入哪个运行级别的第一个 Linux 进程。这些运行级别现在被称为“目标 (targets)”。

### 重要目标列表

| 目标 (Target)         | 描述                                                       |
| --------------------- | ---------------------------------------------------------- |
| `graphical.target`    | 系统支持多用户、图形化及文本方式登录。                 |
| `multi-user.target`   | 系统支持多用户、仅支持文本方式登录。                     |
| `rescue.target`       | 完成基础系统初始化后，进入一个 `sulogin` 提示符。        |
| `emergency.target`    | `initramfs` pivot 完成后，系统 root 被挂载为只读，并进入一个 `sulogin` 提示符。 |

### 管理和查看目标

*   **检查当前目标或运行级别**
    ```bash
    systemctl get-default
    who -r
    ```
*   **目标的依赖关系**
    一个目标可以是另一个目标的一部分。例如，`graphical.target` 包含了 `multi-user.target`，而后者又依赖于 `basic.target` 和其他目标。
    *   您可以使用以下命令查看这些依赖关系：
        ```bash
        systemctl list-dependencies graphical.target | grep target
        ```
*   **显示新的运行级别/目标**
    *   您可以通过以下命令显示新的运行级别/目标文件：
        ```bash
        ls -al /lib/systemd/system/runlevel*
        ```
*   **设置默认目标**
    ```bash
    systemctl set-default graphical.target
    ```

---

## 4. 故障排查

### 场景一：恢复 root 密码

如果忘记了 root 密码，可以通过修改内核引导参数来重置。

1.  **重启计算机**并在 GRUB2 引导菜单出现时按 `e` 键，进入编辑模式。
2.  找到以 `linux` 或 `linux16` 开头的行。
3.  在该行的末尾添加 `rd.break`。
4.  按 `Ctrl + x` 启动系统，这将使您进入一个临时的 root shell。
5.  以读写模式重新挂载根文件系统：
    ```bash
    mount -o remount,rw /sysroot
    ```
6.  切换到系统的真实根环境：
    ```bash
    chroot /sysroot
    ```
7.  使用 `passwd` 命令修改 root 密码。
8.  如果系统启用了 SELinux，需要创建一个 `.autorelabel` 文件以在下次启动时重建 SELinux 标签：
    ```bash
    touch /.autorelabel
    ```
9.  输入 `exit` 两次或直接重启 (`reboot -f`)，系统将使用新密码重启。

### 场景二：修复文件系统损坏

当您在 `/etc` 配置文件中出错或磁盘级文件系统损坏时，都可能导致文件系统损坏。在这些情况下，`systemd` 将无法在预设的目标中启动系统，而是会将系统带入紧急模式。

#### 常见问题与现象

| 问题                                       | 系统现象                                                   |
| ------------------------------------------ | ---------------------------------------------------------- |
| 文件系统损坏                               | `systemd` 会尝试自动修复。如果问题严重，系统会进入紧急 Shell。 |
| `/etc/fstab` 中引用了不存在的设备或 UUID | `systemd` 会等待一段时间。超时后，系统进入紧急 Shell。    |
| `/etc/fstab` 中指定了不存在的挂载点     | 系统直接进入紧急 Shell。                                   |
| `/etc/fstab` 中指定了错误的挂载选项     | 系统直接进入紧急 Shell。                                   |

#### 修复步骤

*   在任何情况下，管理员都可以使用紧急目标来诊断和修复问题，因为在显示紧急 shell 之前，没有文件系统被挂载。
*   当使用紧急 shell 修复文件系统问题时，**在编辑 `/etc/fstab` 后，不要忘记运行 `systemctl daemon-reload`**。如果不执行此重新加载操作，`systemd` 可能会继续使用旧版本（的配置）。