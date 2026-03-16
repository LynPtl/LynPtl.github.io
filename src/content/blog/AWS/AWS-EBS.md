---
title: AWS EBS
date: 2026-01-21 17:42:48
tags:
  - AWS
  - EBS
  - Storage
categories:
  - AWS
---
# Amazon EBS (弹性块存储)

## 第一章：核心定义与本质

<strong>Amazon EBS</strong> 是一种易于使用、高性能、可扩展的<strong>块级存储服务</strong>，专为与 Amazon EC2 配合使用而设计。

<em> <strong>块存储 vs 文件存储：</strong> 它提供的是裸露的、未格式化的块设备。你可以把它想象成一块硬盘，挂载到 EC2 后需要格式化并创建文件系统（如 ext4, NTFS）。
</em> <strong>低延迟与持久性：</strong> 适用于对时延敏感的工作负载，如数据库、文件系统或任何需要细粒度更新的应用。
<em> <strong>可用区级限制：</strong> 这是一个关键考点——EBS 卷是<strong>可用区 (AZ) 级别</strong>的资源。它会自动在所属可用区内复制以防止硬件故障，但它<strong>不能</strong>直接跨 AZ 挂载。

---

## 第二章：EBS 卷类型

考试通常会给你一个性能需求和预算限制，让你选择最合适的卷类型。

### 1. SSD 系列（适用于事务性工作负载）

</em> <strong>General Purpose SSD (gp2/gp3)：</strong>
<em> <strong>平衡型：</strong> 适合绝大多数工作负载（系统盘、开发环境）。
</em> <strong>gp3 (推荐)：</strong> 允许独立配置 IOPS 和吞吐量，比 gp2 成本更低且性能更可预测。


<em> <strong>Provisioned IOPS SSD (io1/io2)：</strong>
</em> <strong>高性能：</strong> 专为关键业务、对 IOPS 极其敏感的数据库（如 SAP HANA, Oracle）设计。
<em> <strong>特性：</strong> 提供最高级别的 IOPS 和吞吐量，支持 <strong>EBS Multi-Attach</strong>（允许多个实例同时挂载同一个卷）。



### 2. HDD 系列（适用于大吞吐量工作负载）

</em> <strong>Throughput Optimized HDD (st1)：</strong> 适合频繁访问、大吞吐量的负载，如 MapReduce、Kafka、日志处理。
<em> <strong>Cold HDD (sc1)：</strong> 成本最低，适合不常访问的数据，如归档存储。
</em> <strong>注意：</strong> HDD 系列<strong>不能</strong>用作 EC2 的启动卷（Boot Volume）。

---

## 第三章：数据持久性与快照 (Snapshots)

### 1. 快照的本质

<em> <strong>增量备份：</strong> 只有自上次快照以来更改的数据块才会被保存，节省 S3 存储成本。
</em> <strong>存储位置：</strong> 快照最终存储在 <strong>Amazon S3</strong> 中（虽然你在 S3 桶里看不到它们），因此具有 11 个 9 的持久性。
<em> <strong>跨 AZ 迁移：</strong> 虽然 EBS 卷限制在某个 AZ，但你可以通过“创建快照 -> 在另一个 AZ 将快照还原为卷”的方法实现数据搬家。

### 2. 快照生命周期管理 (Data Lifecycle Manager)

</em> 你可以使用 <strong>Amazon DLM</strong> 自动创建、保留和删除快照，无需手动操作或编写脚本。

---

## 第四章：安全性——加密 (Encryption)

<em> <strong>一键加密：</strong> 使用 AES-256 算法，支持使用 AWS KMS 管理密钥。
</em> <strong>加密范围：</strong> 静态数据、快照以及从快照创建的所有卷都会被自动加密。
<em> <strong>注意：</strong> 你无法直接在现有的未加密卷上开启加密。必须通过“创建快照 -> 拷贝快照并选择加密 -> 从加密快照创建新卷”来完成转换。

---

## 第五章：高级特性与优化

### 1. Elastic Volumes (弹性卷)

</em> <strong>无需停机：</strong> 可以在实例运行的情况下，动态增加卷容量、更改卷类型或调整 IOPS 性能。

### 2. EBS-Optimized Instances (EBS 优化实例)

<ul><li><strong>专用带宽：</strong> 确保 EC2 和 EBS 之间有专属的网络通道，避免与其他网络流量竞争，从而保证稳定的 IOPS 表现。</li></ul>

---

## 第六章：架构师思维（场景决策对比）

| 需求场景 | 推荐卷类型 / 功能 |
| --- | --- |
| <strong>部署大型 MySQL/Oracle 生产数据库</strong> | <strong>io2 (Provisioned IOPS)</strong> |
| <strong>低成本存储 TB 级别的日志分析数据</strong> | <strong>st1 (Throughput Optimized)</strong> |
| <strong>需要将数据从美东 1 区迁移到美西 2 区</strong> | <strong>Snapshot + Copy Snapshot</strong> |
| <strong>想要多个实例同时读写一个卷（集群文件系统）</strong> | <strong>io1/io2 + Multi-Attach</strong> |
| <strong>系统盘的最佳性价比选择</strong> | <strong>gp3</strong> |

---


1. [ ] <strong>AZ 属性：</strong> 记住 EBS 是 AZ 级别的，跨 AZ 必须用 Snapshot。
2. [ ] <strong>启动卷：</strong> 记住只有 SSD (gp/io) 才能当系统启动盘。
3. [ ] <strong>增量性：</strong> 理解快照是增量的（Incremental），但还原时它表现得像完整备份。
4. [ ] <strong>实例存储 (Instance Store)：</strong> 这个是 EBS 的死对头（临时存储，断电丢数据），考试中如果强调“数据不可丢失”，绝对不要选 Instance Store。
