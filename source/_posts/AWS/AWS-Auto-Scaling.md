---
title: AWS Auto Scaling
date: 2026-01-16 23:54:26
tags:
  - AWS
  - Auto Scaling
  - High Availability
categories:
  - AWS
---
# AWS Auto Scaling

## 1. 什么是 AWS Auto Scaling？

AWS Auto Scaling 是一项旨在根据业务需求自动调整 AWS 资源容量的服务。它不仅限于 EC2，而是能够横跨多种 AWS 服务进行资源管理。

### 1.1 核心价值
*   **提高可用性 (Availability)**：确保在流量高峰期，您的应用程序有足够的资源来处理请求，防止系统过载崩溃。
*   **降低成本 (Cost Optimization)**：在流量低谷期（如夜间或周末），自动减少资源使用量，避免为闲置资源付费。
*   **自动化管理**：消除人工干预，自动检测不健康的实例并进行替换。

### 1.2 基本概念
*   **扩容 (Scaling Out)**：增加资源组的大小（水平扩展）。
*   **缩容 (Scaling In)**：减小资源组的大小。
*   **容量限制**：每个组都有最小 (Minimum)、最大 (Maximum) 和期望 (Desired) 容量限制。

### 1.3 适用场景
*   **周期性流量**：如企业办公应用（朝九晚五）。
*   **开关型流量**：如定期的批处理作业、测试环境。
*   **不可预测的流量**：如营销活动、突发新闻导致的流量激增。

> **注意**：Auto Scaling 是**区域性 (Region-specific)** 服务，无法直接跨区域扩展资源。

---

## 2. 核心功能与特性

### 2.1 支持的资源类型 (Application Auto Scaling)
AWS Auto Scaling 是一个统一的扩展接口，支持以下服务：
1.  **Amazon EC2**：Auto Scaling 组 (ASG)。
2.  **EC2 Spot Fleet**：管理 Spot 实例请求，自动补充中断的实例。
3.  **Amazon ECS**：调整 ECS 服务中的任务 (Task) 数量。
4.  **Amazon DynamoDB**：调整表或全局二级索引 (GSI) 的预置读写容量 (RCU/WCU)。
5.  **Amazon Aurora**：动态调整 Aurora 只读副本的数量。
6.  **Amazon EMR**：调整集群节点。
7.  **AppStream 2.0**：调整 fleet 大小。
8.  **Amazon SageMaker**：调整端点变体 (Endpoint Variants)。
9.  **AWS Lambda**：调整预置并发 (Provisioned Concurrency)。
10. **Amazon MSK**：调整 Kafka 集群存储。
11. **自定义资源**：通过 API 支持自有服务的扩展。

### 2.2 扩展模式
*   **动态扩展 (Dynamic Scaling)**：基于实时指标（如 CPU 利用率 > 50%）进行响应。
*   **预测性扩展 (Predictive Scaling)**：
    *   **仅限 EC2**。
    *   使用机器学习分析历史流量模式。
    *   **优势**：在流量到来**之前**预先启动实例，解决冷启动延迟问题。

### 2.3 高级运维特性
*   **暖池 (Warm Pool)**：预先初始化实例并使其处于停止或运行状态，以减少启动延迟（适用于启动脚本复杂的应用）。
*   **根卷替换 (Root Volume Replacement)**：在实例刷新期间，仅替换根 EBS 卷而不重启/替换整个实例，加快更新速度。
*   **实例刷新 (Instance Refresh)**：滚动更新 ASG 中的实例（如更新 AMI）。
    *   **检查点 (Checkpoints)**：设置百分比检查点，如果通过则继续，否则回滚。
    *   **维护策略 (Maintenance Policies)**：控制是“先启动新实例后终止旧实例”还是反之。

---

## 3. Amazon EC2 Auto Scaling 详解

这是最核心的部分，主要通过 **Auto Scaling Group (ASG)** 进行管理。

### 3.1 核心组件

| 组件 | 说明 |
| :--- | :--- |
| **组 (Group)** | 逻辑单元。包含 EC2 实例集合。核心属性：Min, Max, Desired Capacity。 |
| **配置模板** | 定义实例规格。**Launch Template (推荐)** vs Launch Configuration (旧)。 |
| **扩展策略** | 定义何时执行扩缩容操作。 |

### 3.2 启动配置 vs 启动模板 (Launch Config vs Template)

| 特性 | Launch Configuration (旧) | Launch Template (新/推荐) |
| :--- | :--- | :--- |
| **可修改性** | 不可修改 (Immutable)，必须新建替换 | **可修改** (支持版本控制) |
| **实例类型** | 单一类型 | **混合类型** (如 t3.micro + m5.large) |
| **购买选项** | 仅按需或仅 Spot | **混合模式** (按需 + Spot 组合) |
| **T2/T3 无限模式** | 不支持 | **支持** |

**租户 (Tenancy) 行为对照表：**

| 启动配置租户设置 | VPC 租户 = default | VPC 租户 = dedicated |
| :--- | :--- | :--- |
| **未指定 (null)** | 共享 (Shared) | 专用 (Dedicated) |
| **default** | 共享 (Shared) | 专用 (Dedicated) |
| **dedicated** | 专用 (Dedicated) | 专用 (Dedicated) |

### 3.3 生命周期 (Lifecycle)
![Auto Scaling Lifecycle](AWS%20Auto%20Scaling%20Cheat%20Sheet_files/AWSTrainingAWSAutoScaling1.jpg)

**生命周期钩子 (Lifecycle Hooks)**：
*   **Pending:Wait**：实例启动后，进入 InService 之前。用于安装软件、下载代码。
*   **Terminating:Wait**：实例终止前。用于上传日志、优雅关闭连接。
*   **超时控制**：默认等待 1 小时，可延长。超时后可选择 `CONTINUE` 或 `ABANDON`。

### 3.4 扩展策略类型
1.  **目标跟踪 (Target Tracking)**：
    *   **最推荐**。设定一个目标值（如 CPU 50%），ASG 自动计算需要多少实例。
    *   支持“禁用缩容 (Disable Scale-in)”选项。
2.  **步进扩展 (Step Scaling)**：
    *   根据报警严重程度分级响应。
    *   例如：CPU 50-60% (+1)，60-80% (+3)，>80% (+5)。
    *   支持**实例预热 (Warmup)** 时间，防止指标抖动。
3.  **简单扩展 (Simple Scaling)**：
    *   单一动作。
    *   依赖**冷却时间 (Cooldown Period)**：扩展后锁定一段时间，防止过度扩展。
4.  **计划扩展 (Scheduled Scaling)**：
    *   基于 Cron 表达式（如每周一早 8 点）。
    *   适用于完全可预测的流量。

### 3.5 终止策略 (Termination Policies)
当需要缩容时，ASG 如何选择删除哪台实例？

![Termination Policy](AWS%20Auto%20Scaling%20Cheat%20Sheet_files/AWSTrainingAWSAutoScaling2.jpg)

**默认策略 (Default Termination Policy) 执行顺序：**
1.  **可用区平衡 (AZ Rebalancing)**：首先选择实例数量最多的 AZ（确保高可用）。
2.  **启动模板/配置版本**：在选定 AZ 中，选择使用**最旧**启动模板/配置的实例（帮助更新版本）。
3.  **计费小时**：选择最接近下一个计费小时结束的实例（保护已付费时长）。
4.  **随机**：如果以上都一样，随机选择。

**自定义策略选项**：`OldestInstance` (删最旧), `NewestInstance` (删最新), `OldestLaunchConfiguration`。

> **实例保护 (Instance Protection)**：开启后，该实例不会被缩容操作终止，但仍可被健康检查失败终止。

---

## 4. 监控与管理

### 4.1 健康检查 (Health Checks) 类型
1.  **EC2 (系统级)**：
    *   检查实例是否处于 `running` 状态。
    *   检查系统状态检查 (System Status Checks) 是否通过。
2.  **ELB (应用级)**：
    *   **推荐开启**。
    *   如果负载均衡器认为实例不健康（例如 HTTP 500 或超时），ASG 会收到通知并替换该实例。
3.  **自定义 (Custom)**：
    *   通过 API `SetInstanceHealth` 手动标记实例为 Unhealthy。

> **Standby 状态**：将实例设为 Standby 可以将其移出服务（不接流量）且**不触发健康检查**，用于排错或维护。

### 4.2 CloudWatch 集成
*   **指标**：GroupMinSize, GroupMaxSize, GroupDesiredCapacity, GroupInServiceInstances 等。
*   **指标数学 (Metric Math)**：目标跟踪策略支持使用指标数学聚合多个指标。

### 4.3 通知
*   **SNS**：支持以下事件通知：
    *   `autoscaling:EC2_INSTANCE_LAUNCH`
    *   `autoscaling:EC2_INSTANCE_TERMINATE`
    *   `autoscaling:EC2_INSTANCE_LAUNCH_ERROR`
    *   `autoscaling:EC2_INSTANCE_TERMINATE_ERROR`

---

## 5. 安全性 (Security)

*   **IAM 角色**：
    *   需要授予用户配置 ASG 的权限。
    *   **Service-Linked Role (AWSServiceRoleForAutoScaling)**：AWS 预定义的角色，赋予 ASG 调用 EC2、ELB、CloudWatch 等服务的权限。
*   **权限更新**：服务相关角色已更新，支持根卷替换和资源组权限。

---

## 6. 定价 (Pricing)

*   **Auto Scaling 服务本身：免费**。
*   **收费项目**：
    *   **EC2 实例**：按正常费率收费。
    *   **CloudWatch 警报**：每个警报每月约 $0.10。
    *   **CloudWatch 自定义指标**：如果使用非标准指标（如内存利用率，需安装 Agent）会收费。
    *   **其他资源**：如被扩展的 DynamoDB 容量、Aurora 副本等。

---

## 9. 认证考试高频场景实战 (Validate Your Knowledge)

#### **Question 1**
一家大型菲律宾业务流程外包 (BPO) 公司正在其 VPC 中构建一个两层 Web 应用程序，以提供基于动态事务的内容。数据层利用 Online Transactional Processing (OLTP) 数据库，但对于 Web 层，他们仍在决定使用哪种服务。

您应该利用哪些 AWS 服务来构建弹性和可扩展的 Web 层？

1. Elastic Load Balancing, Amazon EC2, and Auto Scaling
2. Elastic Load Balancing, Amazon RDS with Multi-AZ, and Amazon S3
3. Amazon RDS with Multi-AZ and Auto Scaling
4. Amazon EC2, Amazon DynamoDB, and Amazon S3

**Correct Answer: 1**

**解析 (Detailed Explanation):**
Amazon RDS 是一种适用于在线事务处理 (OLTP) 应用程序的数据库服务。但是，该问题要求列出 Web 层的 AWS 服务，而不是数据库层。此外，当涉及到为 Web 层提供可扩展性和弹性的服务时，应立即想到 Auto Scaling 和 Elastic Load Balancer。因此，正确的答案是：**Elastic Load Balancing, Amazon EC2, and Auto Scaling。**

要构建弹性和高可用的 Web 层，您可以使用 Amazon EC2、Auto Scaling 和 Elastic Load Balancing。您可以将 Web 服务器部署在 Auto Scaling 组的一组 EC2 实例上，该组将自动监控您的应用程序并自动调整容量，以最低的成本保持稳定、可预测的性能。负载平衡是提高系统可用性的有效方法。发生故障的实例可以在负载均衡器后面无缝替换，而其他实例继续运行。Elastic Load Balancing 可用于平衡一个区域中多个可用区的实例。

其余选项均不正确，因为它们没有提及构建高可用和可扩展 Web 层所需的所有服务，例如 EC2、Auto Scaling 和 Elastic Load Balancer。虽然具有 Multi-AZ 的 Amazon RDS 和 DynamoDB 是高度可扩展的数据库，但该场景更侧重于构建其 Web 层，而不是数据库层。

#### **Question 2**
一家科技公司有一个 CRM 应用程序，托管在包含不同实例类型和大小的 On-Demand EC2 实例的 Auto Scaling 组上。该应用程序在上午 9 点到下午 5 点的办公时间内被广泛使用。他们的用户抱怨说，应用程序的性能在一天开始时很慢，但在几个小时后又能正常工作。

实施以下哪项解决方案在操作上最有效，以确保应用程序在一天开始时正常工作？

1. Configure a Dynamic scaling policy for the Auto Scaling group to launch new instances based on the CPU utilization.
2. Configure a Dynamic scaling policy for the Auto Scaling group to launch new instances based on the Memory utilization.
3. Configure a Scheduled scaling policy for the Auto Scaling group to launch new instances before the start of the day.
4. Configure a Predictive scaling policy for the Auto Scaling group to automatically adjust the number of Amazon EC2 instances

**Correct Answer: 3**

**解析 (Detailed Explanation):**
基于计划的扩展允许您响应可预测的负载变化来扩展应用程序。例如，您的 Web 应用程序的流量每周三开始增加，周四保持高位，周五开始减少。您可以根据 Web 应用程序的可预测流量模式规划扩展活动。

要配置 Auto Scaling 组根据计划进行扩展，您需要创建一个计划操作 (scheduled action)。计划操作告诉 Amazon EC2 Auto Scaling 在指定时间执行扩展操作。要创建计划扩展操作，您需要指定扩展操作生效的开始时间，以及扩展操作的新最小、最大和期望大小。在指定时间，Amazon EC2 Auto Scaling 使用扩展操作指定的最小、最大和期望大小值更新组。您可以创建仅扩展一次或按定期计划扩展的计划操作。

因此，**配置 Auto Scaling 组的 Scheduled scaling policy 以在一天开始前启动新实例**是正确的答案。您需要配置 Scheduled scaling policy。这将确保实例在一天开始之前就已经扩展并准备就绪，因为这是应用程序使用最多的时间。

以下选项均不正确。虽然这些是有效的解决方案，但最好配置 Scheduled scaling policy，因为您已经知道应用程序的确切高峰时间。当 CPU 或内存达到峰值时，应用程序已经出现性能问题，因此您需要使用 Scheduled scaling policy 提前确保完成扩展：
*   Configure a Dynamic scaling policy for the Auto Scaling group to launch new instances based on the CPU utilization.
*   Configure a Dynamic scaling policy for the Auto Scaling group to launch new instances based on the Memory utilization.

**Configure a Predictive scaling policy for the Auto Scaling group to automatically adjust the number of Amazon EC2 instances** 的选项是不正确的。虽然这种类型的扩展策略可用于此场景，但它并不是操作上最有效的选项。请注意，该场景提到 Auto Scaling 组由具有不同实例类型和大小的 Amazon EC2 实例组成。Predictive scaling 假设您的 Auto Scaling 组是同构的，这意味着所有 EC2 实例具有相同的容量。如果在 Auto Scaling 组中使用各种 EC2 实例大小和类型，则预测容量可能不准确。
