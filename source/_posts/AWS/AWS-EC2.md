---
title: AWS EC2
date: 2026-01-16 23:54:42
tags:
  - AWS
  - EC2
  - Cloud Computing
categories:
  - AWS
---
# Amazon EC2

## 1. Amazon EC2 核心概述 (Core Overview)

Amazon Elastic Compute Cloud (Amazon EC2) 是 AWS 最核心的计算服务，提供安全、可调整大小的云端计算容量。它让开发者能够轻松进行 Web 规模的云计算，并完全控制计算资源。

### 1.1 核心价值
*   **全球覆盖 (Global Reach)**：部署在 30 多个地理区域 (Regions) 和本地区域 (Local Zones)。
*   **安全性 (Security)**：通过 NitroTPM 实现验证启动，通过 VPC 实现网络隔离。
*   **灵活性 (Flexible)**：支持多种处理器（Intel, AMD, Graviton）和购买模式（Spot, On-Demand, Savings Plans）。

### 1.2 关键限制 (Limits)
*   **On-Demand 限制**：基于 vCPU 数量的限制。
*   **Reserved Instances**：默认限制购买 20 个。
*   **Spot Instances**：每个区域有动态的 Spot 限制。

---

## 2. 核心组件与架构 (Components & Architecture)

### 2.1 底层架构：AWS Nitro System
EC2 的下一代底层平台。传统 Hypervisor 需要负责保护硬件、虚拟化 CPU/存储/网络。
*   **Nitro 优势**：将这些功能卸载到专用硬件和软件上。
*   **性能**：提供几乎与裸金属 (Bare Metal) 无异的性能，优于旧版 Xen Hypervisor。
*   **成本**：通过专用硬件卸载，降低了实例成本。

### 2.2 实例类型 (Instance Types)
考试中需要根据场景选择正确的类型系列：

| 类型系列 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| **通用型 (General Purpose)** | `t-type`, `m-type` | Web 服务器、代码库、平衡负载。 |
| **计算优化型 (Compute Optimized)** | `c-type` | 批处理、高性能 Web 服务器、科学建模、机器学习推理。 |
| **内存优化型 (Memory Optimized)** | `r-type`, `x-type`, `z-type` | 高性能数据库、分布式内存缓存 (Redis)。 |
| **存储优化型 (Storage Optimized)** | `d-type`, `h-type`, `i-type` | NoSQL 数据库、数据仓库、分布式文件系统。 |
| **加速计算型 (Accelerated Computing)** | `p-type`, `g-type`, `inf-type` | 机器学习训练 (Trainium)、图形处理、浮点数计算。 |

### 2.3 存储选项深度对比：EBS vs Instance Store

| 特性 | Amazon EBS-backed (EBS 卷) | Instance Store-backed (实例存储) |
| :--- | :--- | :--- |
| **定义** | 持久化的块级存储，网络连接。 | 直接连接到宿主机的物理磁盘 (Ephemeral)。 |
| **数据持久性** | **持久**。实例停止/重启后数据仍在。 | **临时**。实例**停止 (Stop)** 或 **终止 (Terminate)** 后数据丢失。 |
| **生命周期** | 独立于实例。可以分离并挂载到其他实例。 | 与实例生命周期绑定。不可分离。 |
| **启动时间** | 通常 < 1 分钟。 | 通常 < 5 分钟 (需从 S3 加载数据到磁盘)。 |
| **停止状态** | **支持 Stop 操作**。 | **不支持 Stop 操作**（只能重启或终止）。 |
| **计费** | 实例运行费 + EBS 存储费 + 快照费。 | 仅实例运行费 + S3 存储费 (AMI)。 |
| **典型场景** | 数据库、文件系统、需持久化数据。 | 缓存、缓冲区、无状态应用、高 I/O 临时处理。 |

> **架构师笔记**：Instance Store 提供极高的 I/O 性能（因为是本地磁盘），但必须在应用层处理数据冗余（如 RAID 或复制到 S3/EBS），否则硬件故障会导致数据永久丢失。

---

## 3. 深度特性解析 (Deep Dive)

### 3.1 实例生命周期 (Instance States)
*   **Start**：正常运行，持续计费。
*   **Stop**：
    *   **EBS-backed 实例**：保留 EBS 数据，丢失 Instance Store 数据。
    *   **不计费**：停止期间不收取计算费用（但收取 EBS 存储费）。
    *   **可修改属性**：实例类型、内核、用户数据 (User Data) 等可在停止时修改。
*   **Hibernate (休眠)**：
    *   将内存 (RAM) 状态写入根 EBS 卷，然后关机。
    *   **要求**：根卷必须是加密的 EBS 卷。
    *   **优势**：启动速度快，恢复之前的内存状态。
*   **Terminate**：
    *   永久删除。
    *   **根卷行为**：默认情况下，根 EBS 卷会随实例一起删除（可配置保留）。非根卷默认保留。

### 3.2 放置组 (Placement Groups)
控制实例在物理硬件上的分布策略。

| 策略 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| **集群 (Cluster)** | 将实例紧密打包在**单个可用区 (AZ)** 内。 | **低延迟、高吞吐**网络需求。如 HPC、紧密耦合的计算任务。 |
| **分布 (Spread)** | 将实例严格分布在不同的底层硬件机架上。跨机架隔离。 | **关键任务**应用，即使硬件故障也不影响整体。每 AZ 限制 7 个实例。 |
| **分区 (Partition)** | 将实例分布在逻辑分区中，分区之间不共享硬件。 | 大型分布式工作负载，如 **Hadoop, Cassandra, Kafka**。感知机架拓扑。 |

### 3.3 Amazon Machine Images (AMI)
*   **定义**：包含 OS、应用服务器和应用程序的模板。
*   **区域性**：AMI 是区域性的。要在其他区域使用，必须执行 **Copy AMI**（会产生数据传输费）。
*   **回收站 (Recycle Bin)**：支持恢复意外删除的 AMI，可设置保留规则。
*   **UEFI Secure Boot**：确保实例只启动经过加密签名的软件。

---

## 4. 监控、网络与安全 (Ops, Monitoring & Security)

### 4.1 安全组 (Security Groups) vs 网络 ACL (NACL)
虽然 Cheat Sheet 主要提到安全组，但理解其区别是考点。

*   **安全组**：**有状态 (Stateful)**。允许入站流量会自动允许出站回包。作用于**实例级别**。
*   **默认行为**：拒绝所有入站，允许所有出站。
*   **规则**：只能是“允许 (Allow)”规则，不能设置“拒绝 (Deny)”。

### 4.2 弹性 IP (Elastic IP)
*   静态 IPv4 地址。
*   **收费陷阱**：如果 EIP **未关联**到运行中的实例，或者关联到了停止的实例，AWS 会收取**闲置费用**（惩罚浪费公共 IP 资源）。

### 4.3 网络接口与加速
*   **ENI (Elastic Network Interface)**：虚拟网卡。可以分离并挂载到同一 AZ 的其他实例（用于故障转移）。
*   **增强网络 (Enhanced Networking)**：使用 SR-IOV 提供高性能、低 CPU 占用。
*   **EFA (Elastic Fabric Adapter)**：专为 **HPC 和机器学习** 设计。绕过 OS 网络栈，提供极低延迟和高吞吐。**考点：紧密耦合 (Tightly Coupled) 任务首选 EFA。**

### 4.4 监控 (CloudWatch)
*   **默认监控**：5 分钟粒度。
*   **详细监控 (Detailed Monitoring)**：1 分钟粒度（需额外付费）。
*   **状态检查**：
    *   **系统状态检查 (System Status)**：AWS 基础设施问题（需 AWS 修复）。
    *   **实例状态检查 (Instance Status)**：你的 OS/网络配置问题（需你修复，如重启）。

### 4.5 用户数据 (User Data)
*   用于在实例**首次启动**时运行引导脚本 (Bootstrapping)。
*   **执行频率**：默认仅在**首次启动**时执行。重启/停止再启动不会再次执行（除非特殊配置）。
*   **元数据 (Instance Metadata)**：通过 `http://169.254.169.254/latest/meta-data/` 获取实例自身信息（IP、AMI ID、角色等）。

---

## 5. 定价模型深度解析 (Pricing)

AWS 提供多种购买选项，适应不同成本需求：

### 5.1 购买选项对比

| 选项 | 描述 | 承诺期 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **On-Demand** | 按秒/小时计费。无预付，无承诺。 | 无 | 短期、突发、不可预测的工作负载。开发/测试。 |
| **Reserved Instances (RI)** | 承诺使用特定配置，换取大幅折扣 (最高 72%)。 | 1年 或 3年 | 稳态使用 (Steady-state)。长期数据库。 |
| **Savings Plans** | 承诺每小时花费 (如 $10/hr)，比 RI 更灵活。 | 1年 或 3年 | **首选推荐**。EC2/Fargate/Lambda 混合使用。 |
| **Spot Instances** | 使用闲置容量，折扣最高 90%。可能会被中断 (2分钟警告)。 | 无 | 无状态、容错、批处理、CI/CD、HPC。 |
| **Dedicated Hosts** | 专用物理服务器。完全隔离。 | 可选 | **自带许可 (BYOL)** 场景（如 Windows/SQL Server），合规性要求。 |
| **Dedicated Instances** | 专用硬件上的实例，但不指定物理服务器。 | 无 | 仅需硬件隔离，无 BYOL 需求。 |
| **Capacity Reservations** | 在特定 AZ 预留容量。**不提供价格折扣**（需结合 RI/Savings Plan 使用）。 | 任意 | 确保在灾难恢复或特定活动期间有机器可用。 |

### 5.2 预留实例 (RI) 类型详解

| 特性 | Standard RI (标准) | Convertible RI (可转换) |
| :--- | :--- | :--- |
| **折扣力度** | 最高 (最高 72%) | 较低 (最高 54%) |
| **灵活性** | 可修改 AZ、网络类型、实例大小 (Linux)。**不可改系列**。 | **可修改实例系列** (如 C4 变 C5)、OS、租户。 |
| **转售** | 可以在 RI Marketplace 出售。 | **不可转售**。 |

---

## 6. 实战场景/考题自测 (Scenarios & Validation)

### 场景 A：合规性与软件许可
**问题**：一家公司需要迁移现有的 Microsoft SQL Server 负载到 AWS。他们已经拥有基于 CPU 插槽 (Per-Socket) 的软件许可证，且必须遵守“运行在专用物理服务器上”的合规性要求。哪种购买选项最合适？
1.  Dedicated Instances
2.  On-Demand Instances
3.  Reserved Instances
4.  **Dedicated Hosts**

> **答案：4**。
> **解析**：只有 **Dedicated Hosts** 提供对物理服务器插槽/核心的可见性，支持 **BYOL (Bring Your Own License)** 模式以满足基于插槽的许可要求。Dedicated Instances 虽然硬件隔离，但不暴露物理插槽信息。

### 场景 B：HPC 高性能计算网络优化
**问题**：架构师正在部署一个跨多个实例的风洞模拟模型（HPC）。应用表现出高延迟，导致计算缓慢。节点间通信紧密耦合 (Tightly Coupled)。最佳解决方案是什么？
1.  跨多个区域部署 Spread Placement Group。
2.  使用 Direct Connect。
3.  **在单个 AZ 内配置 Cluster Placement Group。**
4.  使用 Dedicated Instances。

> **答案：3**。
> **解析**：**Cluster Placement Group** 将实例物理上紧密放置在一起，提供最低的延迟和最高的单流吞吐量，专为 HPC 场景设计。选项 1 Spread 组是为了隔离故障，反而可能增加延迟；选项 2 Direct Connect 是连接本地数据中心的，与内部互联无关。
