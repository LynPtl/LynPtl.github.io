---
title: AWS CloudWatch
date: 2026-02-18 00:52:50
tags:
  - AWS
  - Management Tools
  - SAA
  - CloudWatch
  - Monitoring
categories:
  - AWS
---

# AWS CloudWatch Deep Dive

## 1. CloudWatch 基础与架构 (CloudWatch Basics & Architecture)

Amazon CloudWatch 是一项针对 AWS 资源和应用程序的监控服务。它本质上是一个**指标存储库 (Metrics Repository)**。

### 1.1 核心机制
*   **指标推送**：AWS 服务（如 EC2）会将指标（Metrics）推送到存储库，你根据这些指标检索统计数据。
*   **自定义指标**：你也可以推送自定义指标（Custom Metrics）。
*   **区域性 vs 全球性**：
    *   **指标 (Metrics)**：完全是区域性的（Region-specific）。不能跨区域聚合数据（除非使用跨区域仪表板）。
    *   **仪表板 (Dashboards)**：是**全球性**的。可以在一个视图中显示来自多个区域的指标图表。

---

## 2. 指标 (Metrics)

指标是 CloudWatch 的基本概念，代表随时间变化的数据点。

### 2.1 基本属性
*   **Namespace (命名空间)**：指标的容器（例如 `AWS/EC2`）。
*   **Dimensions (维度)**：用于过滤指标的名称/值对（例如 `InstanceId=i-123456`）。
*   **Timestamp**：数据点的时间戳。

### 2.2 分辨率 (Resolution)
*   **标准分辨率 (Standard Resolution)**：默认情况，粒度为 **1 分钟**（60秒）。
*   **高分辨率 (High Resolution)**：用于自定义指标，粒度可达 **1 秒**。

### 2.3 保留策略 (Retention)
数据点不会永久保留。
*   < 60 秒的数据点保留 3 小时。
*   1 分钟的数据点保留 15 天。
*   所有指标最长保留 **15 个月**。随着时间推移，旧数据会被聚合（降低精度）。

---

## 3. CloudWatch Logs (日志)

用于收集、监控和分析日志文件（如 EC2 系统日志、应用日志、Lambda 日志、VPC Flow Logs）。

### 3.1 CloudWatch Agent
*   **默认监控 vs 自定义监控**：EC2 默认推送到 CloudWatch 的指标包括 CPU、网络、磁盘 I/O 等，但 **不包括** 内存 (RAM) 利用率和磁盘空间 (Disk Space) 使用率。
*   **解决方案**：必须在 EC2 实例内部安装并配置 **CloudWatch Agent**，才能收集内存、磁盘空间以及系统层面的日志文件。

### 3.2 Metric Filters (指标筛选器)
*   **作用**：从日志数据中提取指标。
*   **场景**：统计 Web 服务器日志中出现 "Error 500" 的次数。
*   **机制**：创建一个过滤模式，每当日志中出现匹配项时，CloudWatch 就会增加对应的指标计数。
*   **注意**：过滤器不具有追溯性，只能过滤创建之后的新日志。

### 3.3 CloudWatch Logs Insights
*   **作用**：用于交互式搜索和分析日志数据。
*   **机制**：使用专用查询语法查询日志组。例如，快速找出过去 1 小时内所有延迟超过 500ms 的 Lambda 请求。

---

## 4. CloudWatch Alarms (报警)

报警用于持续监控指标，并在指标违反阈值时执行操作。

### 4.1 报警状态
*   **OK**：指标在阈值范围内。
*   **ALARM**：指标超出阈值。
*   **INSUFFICIENT_DATA**：数据不足。

### 4.2 缺失数据的处理 (Missing Data)
这是一个常见考点，你可以配置报警如何处理缺失的数据点：
*   **missing (默认)**：不改变报警状态。
*   **notBreaching**：视为“良好”。
*   **breaching**：视为“糟糕”（例如，如果心跳丢失，说明服务器挂了，应触发报警）。
*   **ignore**：维持当前状态。

### 4.3 报警操作 (Actions)
当报警进入 ALARM 状态时，可以触发：
*   **EC2 Action**：停止、终止、重启或恢复实例。
*   **Auto Scaling Action**：触发扩容或缩容策略。
*   **SNS Notification**：发送邮件、短信或触发 Lambda。

---

## 5. CloudWatch Events (Amazon EventBridge)

CloudWatch Events 正在被 Amazon EventBridge 取代，两者底层相同，但 EventBridge 功能更强。

*   **作用**：提供近实时的系统事件流。
*   **常见模式**：
    1.  **计划任务 (Schedule)**：类似于 Cron Job（例如：每晚 12 点触发 Lambda 备份数据库）。
    2.  **事件模式 (Event Pattern)**：响应服务状态变化（例如：“当 EC2 实例状态变为 Terminated 时” -> 触发 SNS 通知管理员）。
*   **规则与目标**：规则定义捕获什么事件，目标定义事件发送到哪里。

---

## 6. 高级功能与仪表板 (Advanced Features & Dashboards)

### 6.1 CloudWatch Dashboards
*   **特性**：可定制的主页，用于在一个视图中监控跨多个区域的资源。
*   **共享**：支持公开共享、电子邮件/密码限制访问、SSO（集成 Cognito）限制访问。

### 6.2 Application Insights & Container Insights
*   **Application Insights**：自动设置监控，检测 .NET 和 SQL Server 等应用程序堆栈的问题。
*   **Container Insights**：专门用于 ECS、EKS 和 Kubernetes，收集容器层面的指标和日志。

---

## 7. 最佳实践总结 (Exam Tips)

> **Note - EC2 内存监控**：如果题目问“如何监控 EC2 内存使用率”或“如何根据磁盘剩余空间进行自动扩展”，答案永远是：**安装 CloudWatch Agent** 并推送自定义指标。

> **Note - 详细监控 (Detailed Monitoring)**：
> *   默认监控频率是 **5 分钟**。如果需要 **1 分钟** 的粒度，必须开启 **Detailed Monitoring**（需额外付费）。
> *   如果需要 **1 秒** 的粒度（如高频交易），使用 **High Resolution Custom Metrics**。

> **Note - 日志分析**：如果需要“实时”计算日志中的错误率，使用 **Metric Filters**；如果需要“查询”特定时间段的日志细节，使用 **Logs Insights**。

> **Note - 警报状态**：如果报警一直处于 `INSUFFICIENT_DATA`，检查指标是否还在发送，或者考虑修改“缺失数据处理”策略。

> **Note - 高可用性**：CloudWatch 是区域性服务，但仪表板可以跨区域展示。

> **Note - 导出日志**：可以将 CloudWatch Logs 导出到 S3 进行长期存储，但这不是实时的（可能需要几小时）。如果是实时分析，建议使用 Subscription Filters 将日志流式传输到 Kinesis 或 Lambda。