---
title: AWS EFS
date: 2026-01-21 17:47:47
tags:
  - AWS
  - EFS
  - Storage
  - NFS
categories:
  - AWS
---
# Amazon EFS (弹性文件系统)

## 第一章：核心定义与核心价值

<strong>Amazon EFS</strong> 是一种完全托管、无服务器（Serverless）、弹性且“设定后即忘”的网络文件存储服务。

<em> <strong>服务本质：</strong> 它使在 AWS 云中设置和扩展文件存储变得简单，自动管理所有底层基础设施，避免了部署、补丁和维护的复杂性。
</em> <strong>协议支持：</strong> 支持网络文件系统第 4 版（NFSv4.1 和 NFSv4.0）协议。
<em> <strong>平台兼容性：</strong> 可以挂载到运行 Linux 或 MacOS（Big Sur 及更新版本）的 EC2 实例上。<strong>注意：不支持 Windows</strong>。
</em> <strong>多资源共享：</strong> 除了 EC2，还支持挂载到 ECS 任务、EKS Pod 和 Lambda 函数。
<em> <strong>并发访问：</strong> 成千上万个 EC2 实例可以同时访问同一个 EFS 文件系统，为多实例运行的工作负载提供通用数据源。

---

## 第二章：存储类与生命周期管理

EFS 提供多种存储类，以根据访问频率优化成本。

### 1. 存储类划分

</em> <strong>Amazon EFS Standard：</strong> 用于跨多个可用区（AZ）存储频繁访问的文件。
<em> <strong>Amazon EFS Infrequent Access (EFS IA)：</strong> 为访问频率较低的文件提供成本优化。
</em> <strong>Amazon EFS Archive：</strong> 针对每年访问几次或更少的长生命周期数据进行优化，成本比 IA 低高达 50%。
<em> <strong>Amazon EFS One Zone：</strong> 将频繁访问的数据存储在单个 AZ 中，成本更低，但可用性也较低。
</em> <strong>Amazon EFS One Zone-IA：</strong> 在单个 AZ 中存储低频访问的数据。

### 2. 生命周期管理 (Lifecycle Management)

<em> <strong>自动迁移：</strong> EFS 会自动将设定周期内（如 7、14、30、60 或 90 天）未被访问的文件从 Standard 迁移到 IA，或从 IA 迁移到 Archive。

---

## 第三章：性能与吞吐量模式

### 1. 性能模式 (Performance Modes)

</em> <strong>通用模式 (General Purpose - 默认)：</strong> 理想的延迟敏感型用例选择。
<em> <strong>最大 I/O 模式 (Max I/O)：</strong> 可以扩展到更高水平的总吞吐量和每秒操作数，但文件操作延迟略高。适用于大数据分析、媒体处理和基因分析。

### 2. 吞吐量模式 (Throughput Modes)

</em> <strong>弹性模式 (Elastic - 推荐)：</strong> 吞吐量随工作负载活动自动扩展，只需为使用的量付费，无需提前配置。适合波峰明显或不可预测的工作负载。
<em> <strong>预置模式 (Provisioned)：</strong> 允许你指定文件系统的吞吐量，与其存储的数据量无关。
</em> <strong>突发模式 (Bursting)：</strong> 吞吐量随文件系统大小而增长。

---

## 第四章：架构组件与连接性

<em> <strong>挂载目标 (Mount Targets)：</strong> 要在 VPC 中访问 EFS，需在每个可用区创建一个挂载目标，它为 NFSv4 终端节点提供 IP 地址。
</em> <strong>DNS 挂载：</strong> 使用 DNS 名称挂载文件系统，它会自动解析为对应挂载目标的 IP 地址。
<em> <strong>访问点 (Access Points)：</strong> 简化应用程序对共享数据集的访问。它们与 IAM 配合工作，可以为通过访问点发出的每个请求强制执行特定的操作系统用户、组和目录。
</em> <strong>混合云访问：</strong> 本地服务器（必须是 Linux）可以通过 AWS Direct Connect 或 VPN 连接到 VPC 来挂载 EFS。

---

## 第五章：安全性与监控

<em> <strong>访问控制：</strong> 必须拥有有效凭证和相应权限才能创建或访问资源。
</em> <strong>安全组：</strong> 必须为 EC2 实例和 EFS 挂载目标指定相应的安全组。
<em> <strong>权限管理：</strong> 默认仅根用户（UID 0）拥有读写执行权限。可利用 IAM 策略和角色管理特定客户端的 NFS 访问权限。
</em> <strong>加密：</strong> 支持静态加密（At Rest）和传输中加密（In Transit）。
<em> <strong>数据保护：</strong> </em> 通过控制台创建的文件系统默认开启 <strong>AWS Backup</strong> 每日自动备份（保留 35 天）。
<em> <strong>AWS DataSync</strong> 可用于在不同区域或账号的 EFS 之间安全复制文件。


</em> <strong>监控：</strong> 利用 CloudWatch 指标（如 <code>PercentIOLimit</code>）监控 IOPS 利用率。

---

## 第六章：计费与计量细节

<em> <strong>按需计费：</strong> 你只需为文件系统使用的存储量付费。
</em> <strong>计量规则：</strong>
<em> <strong>普通文件：</strong> 逻辑大小向上舍入到下一个 4-KiB 增量进行计量。
</em> <strong>稀疏文件 (Sparse Files)：</strong> 如果实际存储使用量小于逻辑大小，EFS 按实际使用的存储报告计量大小。
<em> <strong>目录与链接：</strong> 目录按实际存储使用的结构大小计算；符号链接和特殊文件固定计量为 4 KiB。


</em> <strong>注意：</strong> 删除文件系统是破坏性操作且不可撤销，建议在删除前先卸载。

---

## 第七章：架构师对比表 (EFS vs EBS vs S3)

| 特性 | Amazon EFS | Amazon EBS (io2) | Amazon S3 |
| --- | --- | --- | --- |
| <strong>可用性与持久性</strong> | 跨多个 AZ 冗余存储 | 存储在单个 AZ 内 | 跨多个 AZ 冗余存储 |
| <strong>访问能力</strong> | 数千个 EC2 实例跨多 AZ 并发访问 | 通常单个 AZ 内的单个实例连接 | 通过 Web 提供百万级连接 |
| <strong>延迟</strong> | 低且一致的每操作延迟 | 最低且一致的延迟 | 低延迟且集成 CloudFront |
| <strong>典型用例</strong> | 大数据分析、内容管理、Web 服务、主目录 | 启动卷、事务型数据库、数据仓库、ETL | 静态 Web 托管、媒体分发、数据湖、备份 |

---
