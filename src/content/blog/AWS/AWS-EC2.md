---
title: AWS EC2
date: 2026-01-16 23:54:42
tags:
  - AWS
  - EC2
  - Cloud Computing
  - SAA
categories:
  - AWS
---

# AWS EC2 Deep Dive

## 1. Amazon EC2 基础与架构 (EC2 Basics & Architecture)

Amazon Elastic Compute Cloud (Amazon EC2) 提供可调整大小的计算容量，允许用户在几分钟内启动虚拟服务器。

### 1.1 核心价值与限制
<em>   <strong>全球覆盖 (Global Reach)</strong>：部署在 30 多个地理区域 (Regions) 和本地区域 (Local Zones)。
</em>   <strong>安全性 (Security)</strong>：通过 NitroTPM 实现验证启动，通过 VPC 实现网络隔离。
<em>   <strong>灵活性 (Flexible)</strong>：支持多种处理器（Intel, AMD, Graviton）和购买模式。
</em>   <strong>限制 (Limits)</strong>：
    <em>   <strong>On-Demand</strong>：基于 vCPU 数量的软限制。
    </em>   <strong>Reserved Instances</strong>：默认限制购买 20 个。
    <em>   <strong>Spot Instances</strong>：每个区域有动态的 Spot 限制。

### 1.2 AWS Nitro System
EC2 的下一代底层平台，将虚拟化功能卸载到专用硬件。
</em>   <strong>优势</strong>：提供接近裸机（Bare Metal）的性能，更高的安全性，以及更低的成本。
<em>   <strong>NitroTPM</strong>：利用 Nitro System 提供加密验证，验证实例身份和软件完整性（"Verify me" 模型）。

### 1.3 实例类型 (Instance Types)
考试中需要根据场景选择正确的类型系列：

| 类型系列 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| <strong>通用型 (General Purpose)</strong> | <code>t-type</code>, <code>m-type</code> | Web 服务器、平衡负载、代码库。 |
| <strong>计算优化型 (Compute Optimized)</strong> | <code>c-type</code> | 批处理、高性能 Web 服务器、科学建模、机器学习推理。 |
| <strong>内存优化型 (Memory Optimized)</strong> | <code>r-type</code>, <code>x-type</code>, <code>z-type</code> | 高性能数据库、分布式内存缓存 (Redis)。 |
| <strong>存储优化型 (Storage Optimized)</strong> | <code>d-type</code>, <code>h-type</code>, <code>i-type</code> | NoSQL 数据库、数据仓库、分布式文件系统。 |
| <strong>加速计算型 (Accelerated Computing)</strong> | <code>p-type</code>, <code>g-type</code>, <code>inf-type</code> | 机器学习训练 (Trainium)、图形处理 (GPU)。 |

---

## 2. 购买选项与定价 (Purchase Options & Pricing)

这是 SAA 考试中关于<strong>成本优化</strong>的绝对核心考点。

### 2.1 购买选项详解

| 选项 | 描述 | 承诺期 | 适用场景 |
| :--- | :--- | :--- | :--- |
| <strong>On-Demand (按需)</strong> | 按秒/小时计费。无预付，无承诺。 | 无 | 短期、突发、不可预测的工作负载。开发/测试。 |
| <strong>Savings Plans (推荐)</strong> | 承诺每小时花费 (如 $10/hr)，比 RI 更灵活。高达 72% 折扣。 | 1年/3年 | <strong>首选推荐</strong>。EC2/Fargate/Lambda 混合使用。 |
| <strong>Reserved Instances (RI)</strong> | 承诺使用特定配置。 | 1年/3年 | 稳态使用 (Steady-state)。长期数据库。 |
| <strong>Spot Instances (竞价)</strong> | 利用闲置容量，折扣最高 90%。可能被中断 (2分钟警告)。 | 无 | 无状态、容错、批处理、CI/CD、HPC。 |
| <strong>Dedicated Hosts</strong> | 专用物理服务器。完全隔离。支持 <strong>BYOL</strong>。 | 可选 | <strong>自带许可 (BYOL)</strong> 场景（如 Windows/SQL Server），合规性要求。 |
| <strong>Dedicated Instances</strong> | 专用硬件上的实例，但不指定物理服务器。 | 无 | 仅需硬件隔离，无 BYOL 需求。 |
| <strong>Capacity Reservations</strong> | 在特定 AZ 预留容量。<strong>不提供价格折扣</strong>（需结合 RI/Savings Plan 使用）。 | 任意 | 确保在灾难恢复或特定活动期间有机器可用。 |

### 2.2 预留实例 (RI) 类型对比

| 特性 | Standard RI (标准) | Convertible RI (可转换) |
| :--- | :--- | :--- |
| <strong>折扣力度</strong> | 最高 (最高 72%) | 较低 (最高 54%) |
| <strong>灵活性</strong> | 可修改 AZ、网络类型、实例大小 (Linux)。<strong>不可改系列</strong>。 | <strong>可修改实例系列</strong> (如 C4 变 C5)、OS、租户。 |
| <strong>转售</strong> | 可以在 RI Marketplace 出售。 | <strong>不可转售</strong>。 |

### 2.3 Spot 策略
</em>   <strong>Spot Fleet 策略</strong>：
    <em>   <strong>LowestPrice</strong>：从价格最低的池中启动实例（成本最低）。
    </em>   <strong>Diversified</strong>：跨所有池分布实例（可用性最高）。
    <em>   <strong>CapacityOptimized</strong>：从容量最充裕的池中启动（中断风险最低，<strong>推荐</strong>）。

---

## 3. 存储选项 (Storage Options: Instance Store vs EBS)

理解根卷（Root Volume）的行为差异至关重要。

| 特性 | <strong>Instance Store (临时存储)</strong> | <strong>EBS (Elastic Block Store)</strong> |
| :--- | :--- | :--- |
| <strong>定义</strong> | 直接附加在物理服务器上的磁盘 (Ephemeral)。 | 网络连接的持久化块存储。 |
| <strong>持久性</strong> | <strong>临时性</strong>。停止 (Stop) 或终止 (Terminate) 时数据丢失。 | <strong>持久性</strong>。独立于实例生命周期（默认根卷随实例删除，但可配置保留）。 |
| <strong>性能</strong> | 极高的 I/O 性能（物理连接）。 | 取决于卷类型和网络带宽。 |
| <strong>停止行为</strong> | <strong>不支持 Stop</strong> 操作。只能重启或终止。 | 支持 Stop 和 Start。停止期间数据保留。 |
| <strong>主要用途</strong> | 缓存、临时缓冲区、无状态应用、复制的数据集群。 | 数据库、持久文件系统、引导卷。 |

> <strong>架构师笔记</strong>：Instance Store 提供极高的 I/O 性能，但必须在应用层处理数据冗余（如 RAID 0/1/10 或复制到 S3/EBS），否则硬件故障会导致数据永久丢失。此外，Instance Store 实例启动时间通常比 EBS 实例慢（需从 S3 加载数据）。

### 3.1 Amazon Machine Images (AMI)
</em>   <strong>区域性</strong>：AMI 是区域（Region）级别的资源。如需在另一区域使用，必须 <strong>Copy AMI</strong>。
<em>   <strong>EC2 Image Builder</strong>：自动化创建、维护、验证和修补 AMI 的托管服务。
</em>   <strong>回收站 (Recycle Bin)</strong>：支持恢复意外删除的 AMI。
<em>   <strong>UEFI Secure Boot</strong>：确保实例只启动经过加密签名的软件，防止恶意软件在引导过程中加载。

---

## 4. 网络与放置组 (Networking & Placement Groups)

### 4.1 IP 地址与 ENI
</em>   <strong>Elastic IP (EIP)</strong>：静态公有 IPv4 地址。如果 EIP <strong>未关联</strong>到运行中的实例，AWS 会收取闲置费。
<em>   <strong>ENI (Elastic Network Interface)</strong>：虚拟网卡。可以分离并附加到另一台实例（同一 AZ 内），用于故障转移。
</em>   <strong>EC2 Instance Connect</strong>：通过 SSH (Linux) 或 RDP (Windows) 安全连接实例，无需管理 SSH 密钥。

### 4.2 放置组 (Placement Groups)
控制实例在物理硬件上的分布策略。

<em>   <strong>Cluster (集群)</strong>：
    </em>   <strong>机制</strong>：将实例紧密打包在<strong>单个 AZ</strong> 内。
    <em>   <strong>场景</strong>：低延迟、高网络吞吐量（如 HPC 高性能计算）。
</em>   <strong>Spread (分散)</strong>：
    <em>   <strong>机制</strong>：将每个实例放置在不同的物理机架上。
    </em>   <strong>限制</strong>：每个 AZ 最多 7 个运行实例。
    <em>   <strong>场景</strong>：关键任务，避免单点硬件故障。
</em>   <strong>Partition (分区)</strong>：
    <em>   <strong>机制</strong>：将实例分布在逻辑分区中，分区之间不共享硬件。
    </em>   <strong>场景</strong>：大型分布式工作负载（如 Hadoop, Kafka, Cassandra）。

### 4.3 高性能网络
<em>   <strong>Enhanced Networking (增强联网)</strong>：使用 SR-IOV 提供更高的 PPS 和更低的延迟。
</em>   <strong>Elastic Fabric Adapter (EFA)</strong>：用于 HPC 和机器学习的专用网络接口，绕过操作系统内核直接通信。<strong>紧密耦合任务首选</strong>。

---

## 5. 生命周期与状态管理 (Lifecycle & State Management)

### 5.1 实例状态
<em>   <strong>Stop (停止)</strong>：EBS 卷保留，Instance Store 数据丢失。不收取计算费用，但收取 EBS 存储费。
</em>   <strong>Terminate (终止)</strong>：实例被删除。默认情况下根 EBS 卷会被删除（除非设置 <code>DeleteOnTermination</code> 为 false）。
<em>   <strong>Hibernate (休眠)</strong>：
    </em>   将内存 (RAM) 中的状态写入根 EBS 卷，然后关机。
    <em>   启动时从硬盘加载内存状态，快速恢复进程。
    </em>   <strong>要求</strong>：根卷必须是加密的 EBS 卷。

### 5.2 实例元数据与用户数据
<em>   <strong>Instance Metadata</strong>：实例通过 <code>http://169.254.169.254/latest/meta-data/</code> 获取自身信息（IP、AMI-ID、IAM 角色等）。
</em>   <strong>User Data</strong>：启动时运行的脚本。<strong>仅在首次启动时执行一次</strong>。
<em>   <strong>IMDSv2</strong>：元数据服务的第 2 版，要求基于会话的 Token 身份验证，安全性更高。

---

## 6. 安全性与监控 (Security & Monitoring)

### 6.1 Security Groups vs Network ACLs
| 特性 | 安全组 (Security Group) | 网络 ACL (Network ACL) |
| :--- | :--- | :--- |
| <strong>作用级别</strong> | 实例级别 | 子网级别 |
| <strong>状态</strong> | <strong>有状态 (Stateful)</strong>：入站允许则出站自动允许。 | <strong>无状态 (Stateless)</strong>：需分别配置出入站。 |
| <strong>规则</strong> | 仅支持 ALLOW。 | 支持 ALLOW 和 DENY。 |

### 6.2 监控 (CloudWatch)
</em>   <strong>默认监控</strong>：每 5 分钟推送一次指标（免费）。
<em>   <strong>详细监控</strong>：每 1 分钟推送一次（收费）。
</em>   <strong>状态检查</strong>：
    <em>   <strong>System Status Checks</strong>：AWS 基础设施层面的问题（需 AWS 修复）。
    </em>   <strong>Instance Status Checks</strong>：你的 OS/配置层面的问题（需用户修复，如重启）。

---

## 7. 最佳实践总结 (Exam Tips & Scenarios)

> <strong>Note - 高性能计算 (HPC)</strong>：如果题目提到“低延迟、节点间通信紧密”，首选 <strong>Cluster Placement Group</strong> + <strong>Enhanced Networking/EFA</strong>。

> <strong>Note - 成本优化</strong>：
> *   长时间稳定运行 -> <strong>Savings Plans / RI</strong>。
> *   批处理、容错任务 -> <strong>Spot Instances</strong>。
> *   软件许可证绑定物理核心 -> <strong>Dedicated Hosts</strong>。

> <strong>Note - 数据恢复</strong>：如果无法连接到实例（如 Key 丢失或配置错误），可以将根 EBS 卷分离，附加到另一台临时实例作为数据盘进行修复，然后再挂载回去。

> <strong>Note - 启动故障</strong>：如果启动时遇到 <code>InsufficientInstanceCapacity</code>，尝试稍后重试或更换 AZ；如果是 Spot 实例，考虑更改价格或策略。

### 实战场景自测

<strong>场景 A：合规性与软件许可</strong>
> <strong>问题</strong>：公司需要迁移现有的 Microsoft SQL Server 负载到 AWS，拥有基于 CPU 插槽 (Per-Socket) 的许可证，且必须遵守“运行在专用物理服务器上”的要求。
> <strong>答案</strong>：选择 <strong>Dedicated Hosts</strong>。只有它提供对物理服务器插槽/核心的可见性，支持 <strong>BYOL</strong>。

<strong>场景 B：HPC 高性能计算网络优化</strong>
> <strong>问题</strong>：跨多个实例的风洞模拟模型（HPC），节点间通信紧密耦合 (Tightly Coupled)，要求低延迟。
> <strong>答案</strong>：在单个 AZ 内配置 <strong>Cluster Placement Group</strong>。提供最低延迟和最高单流吞吐量。
