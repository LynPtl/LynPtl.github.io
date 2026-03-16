---
title: Troubleshoot Linux 1 修改sshd端口重启报错
date: 2025-10-30 00:02:11
tags:
  - Linux
  - Troubleshooting
  - SSH
categories:
  - Linux入门
  - Linux排错
---
# Troubleshoot: 修改sshd端口号后重启服务报错255

![VirtualBoxVM_wYe3UkV9yU.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_wYe3UkV9yU.png)

把端口从 22 改成了 22222。在 RHEL 10 这样的系统上，<strong>最常见的原因是 SELinux 策略</strong> 阻止了 <code>sshd</code> 绑定到非标准的端口（默认只允许 22）。

从<code>journalctl -xeu sshd.service</code>中也能看到<code>bind to port 2222</code>失败是因为<code>Permission denied</code>。

请尝试按以下步骤解决问题：

### 1\. 检查 SSH 配置文件语法

首先，我们来确保你的配置文件 <code>/etc/ssh/sshd_config</code> 没有语法错误。运行：

``<code>bash
sshd -t
</code>`<code>

  <em> 如果这条命令<strong>没有任何输出</strong>，说明语法正确。
  </em> 如果有错误提示，请根据提示修改 </code>/etc/ssh/sshd_config<code> 文件中的错误。

### 更新 SELinux 策略

如果语法正确，那么几乎可以肯定是 SELinux 问题。你需要告诉 SELinux 允许 </code>sshd<code> 使用 </code>22222<code> 端口。

<strong>a. 使用</code>semanage<code>添加新的端口策略</strong>
运行以下命令，将 </code>22222<code> 端口的 SELinux 上下文标记为 </code>ssh_port_t<code> 类型：

</code>`<code>bash
sudo semanage port -a -t ssh_port_t -p tcp 22222
</code>`<code>

  <em> </code>-a<code> 是添加 (add)
  </em> </code>-t<code> 是类型 (type)
  * </code>-p<code> 是协议 (protocol)

### 3\. 重新启动 sshd 服务

更新 SELinux 策略后，再次尝试启动 </code>sshd<code>：

</code>`<code>bash
sudo systemctl restart sshd
</code>`<code>

然后马上检查它的状态：

</code>`<code>bash
sudo systemctl status sshd
</code>`<code>

如果 </code>Active:<code> 行显示 </code>active (running)<code>，那么恭喜你，问题解决了！

![VirtualBoxVM_XGvE3P2U58.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_XGvE3P2U58.png)

-----

### ⚠️ 重要提醒：更新防火墙

在你确认 </code>sshd<code> 服务成功运行后，<strong>千万别忘了</strong>在 </code>firewalld<code> 防火墙上放行你的新端口 </code>22222<code>，否则你将无法从外部连接到这台机器：

</code>`<code>bash
# 永久添加 22222/tcp 端口到防火墙规则
sudo firewall-cmd --permanent --add-port=22222/tcp

# 重新加载防火墙规则使之生效
sudo firewall-cmd --reload
</code>``

![VirtualBoxVM_wXgQWSylXx.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/10/VirtualBoxVM_wXgQWSylXx.png)

