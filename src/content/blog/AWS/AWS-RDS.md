---
title: AWS RDS
date: 2026-01-28 14:40:42
tags:
---
# Amazon RDS (关系型数据库服务)

## 第一章：RDS 基础与架构
Amazon RDS 是一种托管的关系型数据库服务，负责备份、软件补丁、自动错误检测和恢复。

<em> <strong>DB 实例限制</strong>：每个账号默认最多可拥有 40 个 RDS 实例。
</em> <strong>基本单位</strong>：DB Instance 是云中隔离的数据库环境。
<em> <strong>DB 引擎支持</strong>：Aurora, MySQL, MariaDB, PostgreSQL, Oracle, Microsoft SQL Server。
</em> <strong>自动迁移</strong>：支持通过控制台利用 AWS DMS 将 EC2 上的自建数据库自动迁移至 RDS。

---

## 第二章：数据库引擎细节与限制

### 1. MySQL / MariaDB
<em> <strong>存储引擎</strong>：推荐使用 InnoDB（它是唯一支持崩溃恢复的引擎，是 RDS 的强制要求）。
</em> <strong>表数量限制</strong>：对于 MySQL，若使用 PIOPS 或通用存储且容量 >= 200 GiB，限制为 10,000 张表；若容量 < 200 GiB，限制为 1,000 张表。
<ul><li><strong>安全特性</strong>：支持 <code>validate_password</code> 插件强制执行密码策略。</li></ul>

### 2. Microsoft SQL Server
<em> <strong>许可模式</strong>：支持“包含许可 (License Included)”和“自带许可 (BYOL)”。
</em> <strong>数据库限制</strong>：单个实例支持的数据库数量取决于实例类和可用模式（如 Single-AZ, Multi-AZ DBM/AG），范围从 30 到 100 个不等。

### 3. Oracle
<em> <strong>架构支持</strong>：支持多租户架构（CDB/PDB）。
</em> <strong>标识符</strong>：使用 <code>ORACLE_SID</code> 进行连接。
<em> <strong>安全集成</strong>：支持通过 AWS Secrets Manager 管理主用户密码。

---

## 第三章：存储与自动扩展

### 1. 存储类型
</em> <strong>通用型 SSD (gp2/gp3)</strong>：适用于大多数数据库工作负载。
<em> <strong>预置 IOPS SSD (io1)</strong>：专为 OLTP 业务设计。MySQL/MariaDB/Postgres/Oracle 支持最高 80,000 IOPS，SQL Server 支持最高 64,000 IOPS。
</em> <strong>磁性存储 (Magnetic)</strong>：传统类型，不支持弹性卷，最大 3 TiB 且限 1,000 IOPS。

### 2. 存储自动扩展 (Storage Auto Scaling)
<em> <strong>机制</strong>：在无停机的情况下，根据工作负载增长自动增加存储容量。
</em> <strong>限制</strong>：SQL Server 在使用磁性存储时不支持此功能。

---

## 第四章：高可用性 (Multi-AZ) 深度解析

Multi-AZ 是 RDS 的灾难恢复（DR）解决方案。

<em> <strong>同步复制</strong>：主实例数据实时同步到不同 AZ 的备用实例（Standby）。
</em> <strong>故障转移触发条件</strong>：
    1. 可用区 (AZ) 停机。
    2. 主实例发生故障。
    3. 更改了实例规格（Instance Class）。
    4. 操作系统进行软件补丁维护。
    5. 用户手动启动重启（带故障转移选项）。
<em> <strong>故障转移机制 (Failover Mechanism)</strong>：
    RDS 的故障转移是自动处理的，无需人工干预。当主实例发生故障时，Amazon RDS 会自动将实例的 <strong>规范名称记录 (CNAME)</strong> 指向备用实例，随后备用实例被提升为新的主实例。这种机制允许应用程序在尽量短的时间内恢复数据库操作。
</em> <strong>性能注意</strong>：备份操作会在备用实例上运行，以消除主实例的 I/O 停顿。

---

## 第五章：只读副本 (Read Replicas)

只读副本用于扩展读取性能。

<em> <strong>异步复制</strong>：从主实例异步同步数据。
</em> <strong>扩展能力</strong>：最多支持 5 个只读副本。
<em> <strong>跨区域能力</strong>：支持跨区域只读副本，用于降低全球延迟。
</em> <strong>备份要求</strong>：创建只读副本前，主实例必须开启自动备份（保留期 > 0）。
<em> <strong>引擎差异</strong>：PostgreSQL 使用物理复制；MySQL 和 MariaDB 使用逻辑复制。
</em> <strong>提升功能</strong>：可以将只读副本提升为独立的单实例数据库。

---

## 第六章：备份与恢复

<em> <strong>自动备份 (Automated Backups)</strong>：
    </em> 捕获整个实例的快照和事务日志。
    <em> 保留期：0（关闭）到 35 天。
    </em> 删除实例时，自动备份会被一并删除，除非手动选择保留。
<em> <strong>手动快照 (DB Snapshots)</strong>：
    </em> 由用户触发，存储在 S3。
    <em> 即使删除 DB 实例，手动快照也会永久保留。
</em> <strong>恢复逻辑</strong>：恢复操作总是创建一个带有新终端节点（Endpoint）的新 DB 实例。

---

## 第七章：安全性与连接

<em> <strong>IAM 数据库身份验证</strong>：适用于 MySQL 和 PostgreSQL，使用 IAM 角色/用户生成的临时令牌登录，无需在应用中存储密码。
</em> <strong>加密</strong>：使用 AWS KMS 密钥。无法在现有的未加密实例上直接开启加密，必须通过“快照 -> 拷贝并加密快照 -> 还原”来转换。
<em> <strong>SSL/TLS</strong>：支持加密客户端与数据库之间的传输数据。
</em> <strong>RDS Proxy</strong>：
    <em> 建立连接池以减少 CPU/内存开销。
    </em> 将故障转移时间缩短约 66%。
    <em> 增加安全性（支持 Secrets Manager 集成）。

---

## 第八章：高级部署与集成

</em> <strong>Blue/Green 部署</strong>：创建一个绿色（Staging）环境镜像生产环境，用于安全地测试变更（如引擎升级）。支持存储初始化以缓解“懒加载”导致的性能抖动。
<em> <strong>Zero-ETL 集成</strong>：支持将数据从 RDS (PostgreSQL/Oracle) 自动同步到 Amazon Redshift 进行分析，无需构建复杂的 ETL 流。
</em> <strong>增强监控 (Enhanced Monitoring)</strong>：
    <em> <strong>CloudWatch</strong>：从 Hypervisor 层获取指标（如 CPU）。
    </em> <strong>增强监控</strong>：通过实例上的 Agent 获取 OS 层的指标（如各进程的 IOPS、延迟、队列深度）。

---

## 第九章：最佳实践总结

<em> <strong>DNS TTL</strong>：如果应用缓存了 DNS，务必将 TTL 设置为少于 30 秒，否则故障转移后应用可能仍尝试连接旧 IP。
</em> <strong>性能排查</strong>：使用 Performance Insights 可视化分析 SQL 查询导致的等待时间。
<em> <strong>实例维护</strong>：数据库状态显示为 <code>maintenance</code> 时，表示正在应用计划内的系统更新。
</em> <strong>存储预警</strong>：务必设置 CloudWatch 报警监控存储空间，避免进入 <code>storage-full</code> 这一关键状态。