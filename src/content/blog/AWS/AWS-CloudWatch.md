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

Amazon CloudWatch 是一项针对 AWS 资源和应用程序的监控服务。它本质上是一个<strong>指标存储库 (Metrics Repository)</strong>。

### 1.1 核心机制
<em>   <strong>指标推送</strong>：AWS 服务（如 EC2）会将指标（Metrics）推送到存储库，你根据这些指标检索统计数据。
</em>   <strong>自定义指标</strong>：你也可以推送自定义指标（Custom Metrics）。
<em>   <strong>区域性 vs 全球性</strong>：
    </em>   <strong>指标 (Metrics)</strong>：完全是区域性的（Region-specific）。不能跨区域聚合数据（除非使用跨区域仪表板）。
    <em>   <strong>仪表板 (Dashboards)</strong>：是<strong>全球性</strong>的。可以在一个视图中显示来自多个区域的指标图表。

---

## 2. 指标 (Metrics)

指标是 CloudWatch 的基本概念，代表随时间变化的数据点。

### 2.1 基本属性
</em>   <strong>Namespace (命名空间)</strong>：指标的容器（例如 <code>AWS/EC2</code>）。
<em>   <strong>Dimensions (维度)</strong>：用于过滤指标的名称/值对（例如 <code>InstanceId=i-123456</code>）。
</em>   <strong>Timestamp</strong>：数据点的时间戳。

### 2.2 分辨率 (Resolution)
<em>   <strong>标准分辨率 (Standard Resolution)</strong>：默认情况，粒度为 <strong>1 分钟</strong>（60秒）。
</em>   <strong>高分辨率 (High Resolution)</strong>：用于自定义指标，粒度可达 <strong>1 秒</strong>。

### 2.3 保留策略 (Retention)
数据点不会永久保留。
<em>   < 60 秒的数据点保留 3 小时。
</em>   1 分钟的数据点保留 15 天。
<ul><li>  所有指标最长保留 <strong>15 个月</strong>。随着时间推移，旧数据会被聚合（降低精度）。</li></ul>

---

## 3. CloudWatch Logs (日志)

用于收集、监控和分析日志文件（如 EC2 系统日志、应用日志、Lambda 日志、VPC Flow Logs）。

### 3.1 CloudWatch Agent
<em>   <strong>默认监控 vs 自定义监控</strong>：EC2 默认推送到 CloudWatch 的指标包括 CPU、网络、磁盘 I/O 等，但 <strong>不包括</strong> 内存 (RAM) 利用率和磁盘空间 (Disk Space) 使用率。
</em>   <strong>解决方案</strong>：必须在 EC2 实例内部安装并配置 <strong>CloudWatch Agent</strong>，才能收集内存、磁盘空间以及系统层面的日志文件。

### 3.2 Metric Filters (指标筛选器)
<em>   <strong>作用</strong>：从日志数据中提取指标。
</em>   <strong>场景</strong>：统计 Web 服务器日志中出现 "Error 500" 的次数。
<em>   <strong>机制</strong>：创建一个过滤模式，每当日志中出现匹配项时，CloudWatch 就会增加对应的指标计数。
</em>   <strong>注意</strong>：过滤器不具有追溯性，只能过滤创建之后的新日志。

### 3.3 CloudWatch Logs Insights
<em>   <strong>作用</strong>：用于交互式搜索和分析日志数据。
</em>   <strong>机制</strong>：使用专用查询语法查询日志组。例如，快速找出过去 1 小时内所有延迟超过 500ms 的 Lambda 请求。

---

## 4. CloudWatch Alarms (报警)

报警用于持续监控指标，并在指标违反阈值时执行操作。

### 4.1 报警状态
<em>   <strong>OK</strong>：指标在阈值范围内。
</em>   <strong>ALARM</strong>：指标超出阈值。
<em>   <strong>INSUFFICIENT_DATA</strong>：数据不足。

### 4.2 缺失数据的处理 (Missing Data)
这是一个常见考点，你可以配置报警如何处理缺失的数据点：
</em>   <strong>missing (默认)</strong>：不改变报警状态。
<em>   <strong>notBreaching</strong>：视为“良好”。
</em>   <strong>breaching</strong>：视为“糟糕”（例如，如果心跳丢失，说明服务器挂了，应触发报警）。
<em>   <strong>ignore</strong>：维持当前状态。

### 4.3 报警操作 (Actions)
当报警进入 ALARM 状态时，可以触发：
</em>   <strong>EC2 Action</strong>：停止、终止、重启或恢复实例。
<em>   <strong>Auto Scaling Action</strong>：触发扩容或缩容策略。
</em>   <strong>SNS Notification</strong>：发送邮件、短信或触发 Lambda。

---

## 5. CloudWatch Events (Amazon EventBridge)

CloudWatch Events 正在被 Amazon EventBridge 取代，两者底层相同，但 EventBridge 功能更强。

<em>   <strong>作用</strong>：提供近实时的系统事件流。
</em>   <strong>常见模式</strong>：
    1.  <strong>计划任务 (Schedule)</strong>：类似于 Cron Job（例如：每晚 12 点触发 Lambda 备份数据库）。
    2.  <strong>事件模式 (Event Pattern)</strong>：响应服务状态变化（例如：“当 EC2 实例状态变为 Terminated 时” -> 触发 SNS 通知管理员）。
<em>   <strong>规则与目标</strong>：规则定义捕获什么事件，目标定义事件发送到哪里。

---

## 6. 高级功能与仪表板 (Advanced Features & Dashboards)

### 6.1 CloudWatch Dashboards
</em>   <strong>特性</strong>：可定制的主页，用于在一个视图中监控跨多个区域的资源。
<em>   <strong>共享</strong>：支持公开共享、电子邮件/密码限制访问、SSO（集成 Cognito）限制访问。

### 6.2 Application Insights & Container Insights
</em>   <strong>Application Insights</strong>：自动设置监控，检测 .NET 和 SQL Server 等应用程序堆栈的问题。
<em>   <strong>Container Insights</strong>：专门用于 ECS、EKS 和 Kubernetes，收集容器层面的指标和日志。

---

## 7. 最佳实践总结 (Exam Tips)

> <strong>Note - EC2 内存监控</strong>：如果题目问“如何监控 EC2 内存使用率”或“如何根据磁盘剩余空间进行自动扩展”，答案永远是：<strong>安装 CloudWatch Agent</strong> 并推送自定义指标。

> <strong>Note - 详细监控 (Detailed Monitoring)</strong>：
> </em>   默认监控频率是 <strong>5 分钟</strong>。如果需要 <strong>1 分钟</strong> 的粒度，必须开启 <strong>Detailed Monitoring</strong>（需额外付费）。
> *   如果需要 <strong>1 秒</strong> 的粒度（如高频交易），使用 <strong>High Resolution Custom Metrics</strong>。

> <strong>Note - 日志分析</strong>：如果需要“实时”计算日志中的错误率，使用 <strong>Metric Filters</strong>；如果需要“查询”特定时间段的日志细节，使用 <strong>Logs Insights</strong>。

> <strong>Note - 警报状态</strong>：如果报警一直处于 <code>INSUFFICIENT_DATA</code>，检查指标是否还在发送，或者考虑修改“缺失数据处理”策略。

> <strong>Note - 高可用性</strong>：CloudWatch 是区域性服务，但仪表板可以跨区域展示。

> <strong>Note - 导出日志</strong>：可以将 CloudWatch Logs 导出到 S3 进行长期存储，但这不是实时的（可能需要几小时）。如果是实时分析，建议使用 Subscription Filters 将日志流式传输到 Kinesis 或 Lambda。