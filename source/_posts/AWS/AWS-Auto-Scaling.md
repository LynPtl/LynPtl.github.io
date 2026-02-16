---
title: AWS Auto Scaling
date: 2026-01-28 00:00:00
tags:
  - AWS
  - Compute
  - SAA
  - Auto Scaling
categories:
  - AWS
---

# AWS Auto Scaling Deep Dive

AWS Auto Scaling 允许你根据定义的条件自动增加或减少资源容量，确保在需求高峰时保持性能，在需求低谷时降低成本。它不仅限于 EC2，而是能够横跨多种 AWS 服务进行资源管理。

---

## 第一章：基础概念与架构

### 1.1 核心价值
*   **提高可用性 (Availability)**：自动替换不健康实例，确保高峰期有足够资源。
*   **降低成本 (Cost Optimization)**：低谷期自动减量，避免为闲置资源付费。
*   **自动化管理**：消除人工干预，实现系统自愈。

### 1.2 Auto Scaling Group (ASG)
ASG 是管理 EC2 实例集合的逻辑单元：
*   **容量设置**：
    *   **Minimum (最小容量)**：ASG 必须保持的最少实例数。
    *   **Maximum (最大容量)**：允许扩展到的最大实例数，防止成本失控。
    *   **Desired Capacity (期望容量)**：当前应运行的数量。ASG 会不断监控以确保实际数量等于期望值。
*   **跨可用区平衡 (AZ Rebalancing)**：ASG 会尝试在多个可用区 (AZ) 之间均匀分布实例。如果某个 AZ 的实例过多，它在缩容时会先在该 AZ 终止实例。

---

## 第二章：启动配置 (Launch Configuration) vs 启动模板 (Launch Template)

定义“扩展时启动什么样机器”的基础配置。

| 特性 | Launch Configuration (旧) | Launch Template (新/推荐) |
| :--- | :--- | :--- |
| **可修改性** | 不可修改 (Immutable)，必须新建替换 | **支持版本控制 (Versioning)**，可轻松修改并保存 |
| **特性支持** | 较少，不支持新特性 | 支持 T2/T3 无限模式、Spot Fleet、专属主机等 |
| **混合策略** | 单一实例类型 | **混合实例策略**：支持在同一 ASG 混合按需与 Spot，以及不同类型组合 |
| **使用建议** | 遗留系统使用 | **新项目首选**，更灵活且支持更多高级属性 |

---

## 第三章：扩展策略 (Scaling Policies)

### 3.1 动态扩展 (Dynamic Scaling)
*   **目标跟踪 (Target Tracking)**：**最推荐**。设置目标值（如“保持 CPU 50%”），ASG 自动创建警报并自动伸缩。
*   **步进扩展 (Step Scaling)**：根据警报严重程度分阶段操作。如 CPU > 50% (+1)，> 80% (+3)。
*   **简单扩展 (Simple Scaling)**：基于单一警报执行单一操作，强依赖于**冷却时间 (Cooldown)** 以防止抖动。

### 3.2 预测性扩展 (Predictive Scaling)
*   **机制**：使用机器学习分析历史流量模式，提前预置容量。
*   **优势**：消除了响应式扩展的延迟，使实例在流量到达前就绪。目前**仅适用于 EC2 Auto Scaling**。

### 3.3 计划扩展 (Scheduled Scaling)
*   **机制**：基于已知的时间表（如 Cron 表达式）进行扩展。比如每周五下午 5 点或每月第一天。

---

## 第四章：健康检查与生命周期

### 4.1 健康检查 (Health Checks)
*   **EC2 Status Checks (默认)**：仅监控基础设施或系统层。Web 应用挂了但 OS 没挂时，检查可能仍显示健康。
*   **ELB Health Checks (推荐)**：关联负载均衡器。如果 ELB 发现应用层（如 HTTP 200）响应失败，ASG 会自动终止并替换该实例。
*   **Standby 状态**：将实例设为 Standby 可暂时将其移出服务进行排错，此时不会触发健康检查。

### 4.2 冷却时间与预热
*   **Cooldown (冷却时间)**：在扩展完成后暂停后续操作（默认 300s），主要用于简单扩展。
*   **Warmup (实例预热)**：用于步进/目标跟踪策略，让新实例在产生有效指标前不计入聚合计算。

### 4.3 生命周期挂钩 (Lifecycle Hooks)
在实例启动 (Pending:Wait) 或终止 (Terminating:Wait) 时暂停流程，以便执行自定义脚本（如下载代码、上传日志、清理缓存）。默认等待 1 小时。

---

## 第五章：终止策略 (Termination Policies)

当 ASG 需要缩容 (Scale In) 时，决定先删除哪台实例：

1.  **默认策略 (Default)**：
    *   优先选实例最多的可用区 (AZ Rebalancing)。
    *   选择使用最旧启动模板/配置的实例。
    *   选择最接近下一个计费小时的实例。
2.  **自定义策略**：
    *   `OldestInstance`：删除最旧实例（用于升级整个组）。
    *   `NewestInstance`：删除最新实例（用于测试）。
    *   `Scale-In Protection`：受保护的实例不会因缩容而被终止。

---

## 第六章：高级运维功能

*   **实例刷新 (Instance Refresh)**：滚动更新 ASG 中的实例（如更新 AMI）。支持检查点 (Checkpoints) 和回滚。
*   **热池 (Warm Pools)**：维护一组预初始化（已启动并停止）的实例，显著缩短扩展时的启动时间。
*   **根卷替换 (Root Volume Replacement)**：在不替换整个实例的情况下刷新根 EBS 卷。

---

## 第七章：Application Auto Scaling

Auto Scaling 是一项通用服务，除 EC2 外还支持：
*   **Amazon ECS**：调整任务 (Task) 数量。
*   **Amazon DynamoDB**：调整预置读写容量 (RCU/WCU)。
*   **Amazon Aurora**：动态调整读取副本的数量。
*   **AWS Lambda**：调整预置并发量。

---

## 第八章：安全性与定价

*   **安全性 (IAM)**：使用 **Service-Linked Role** (AWSServiceRoleForAutoScaling) 赋予 ASG 调用 EC2、ELB 等服务的权限。
*   **定价**：Auto Scaling 服务本身**免费**。仅对所创建的 EC2、CloudWatch 警报或相关底层资源按正常费率收费。

---

## 第九章：最佳实践总结 (Exam Tips)

*   **高可用性 (HA)**：始终跨至少两个 AZ 部署，设置 Min 值 > 0。
*   **健康检查配置**：如果使用了负载均衡器，**务必启用 ELB Health Checks**。
*   **扩容与缩容不平衡**：通常扩容要敏捷，缩容要平缓，以确保用户体验优先。
*   **故障排查**：如果实例启动后立即终止，检查 Grace Period（宽限期）是否过短，或 User Data 脚本是否报错。
*   **成本优化**：结合 **混合实例策略**，利用 Spot 实例节省高达 90% 的成本。

---

## 第十章：认证考试高频场景实战

#### **Question 1**
一家公司正在其 VPC 中构建两层 Web 应用程序。数据层使用 OLTP 数据库，Web 层需要具备弹性和可扩展性。应使用哪些服务构建 Web 层？
1.  Elastic Load Balancing, Amazon EC2, and Auto Scaling
2.  Elastic Load Balancing, Amazon RDS with Multi-AZ, and Amazon S3
3.  Amazon RDS with Multi-AZ and Auto Scaling
4.  Amazon EC2, Amazon DynamoDB, and Amazon S3
**正确答案：1**。Web 层的扩展与弹性核心组件即为 ELB + ASG + EC2。

#### **Question 2**
某 CRM 应用在上午 9 点到下午 5 点被广泛使用，用户抱怨早晨启动时性能慢。哪种策略最有效？
1.  基于 CPU 的动态扩展。
2.  基于内存的动态扩展。
3.  **基于已知时间表的计划扩展 (Scheduled Scaling)**。
4.  预测性扩展。
**正确答案：3**。既然高峰时间完全可预测，使用计划扩展在办公开始前预置容量是操作上最有效的。
