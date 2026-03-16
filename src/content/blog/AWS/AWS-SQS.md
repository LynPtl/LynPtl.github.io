---
title: AWS SQS
date: 2026-02-15 01:11:30
tags:
  - AWS
  - Application Integration
  - SAA
  - SQS
categories:
  - AWS
---

# AWS SQS Deep Dive

## 1. SQS 基础与架构 (SQS Basics & Architecture)

Amazon SQS 是一种完全托管的消息队列服务，用于解耦（Decouple）和集成微服务、分布式系统及无服务器应用程序。

### 1.1 核心机制
<em>   <strong>Pull Based (基于拉取)</strong>：SQS 不会将消息推送给消费者。消费者必须主动轮询（Poll）队列以检查新消息。
</em>   <strong>解耦</strong>：生产者（Producer）和消费者（Consumer）不需要同时在线。消息会存储在队列中，直到被处理或过期。
<em>   <strong>持久性</strong>：消息存储在多个服务器上以确保持久性。
</em>   <strong>消息大小限制</strong>：
    <em>   单个消息最大 <strong>256 KB</strong>。
    </em>   若需传输更大的数据，需配合 Amazon S3 使用（通常称为 SQS Extended Client Library 模式，将数据存 S3，消息存 S3 的引用）。
<em>   <strong>消息保留期 (Retention Period)</strong>：
    </em>   默认：4 天。
    <em>   范围：1 分钟 到 14 天。

---

## 2. 队列类型 (Queue Types)

这是考试中极高频的考点，必须清晰区分两种队列的适用场景。

### 2.1 标准队列 (Standard Queues)
</em>   <strong>适用场景</strong>：吞吐量要求高，对顺序要求不严格的场景。
<em>   <strong>吞吐量</strong>：<strong>几乎无限</strong> (Unlimited Throughput)。
</em>   <strong>排序</strong>：<strong>Best-Effort Ordering</strong>（尽力而为的排序）。消息可能不会按照发送顺序被接收。
<em>   <strong>交付保证</strong>：<strong>At-Least-Once Delivery</strong>（至少一次交付）。极少数情况下，同一条消息可能会被传递多次（消费者必须设计为<strong>幂等性</strong> Idempotent，即处理多次和处理一次结果相同）。

### 2.2 FIFO 队列 (先进先出)
</em>   <strong>适用场景</strong>：必须严格保证顺序，且不能有重复消息的场景（如银行交易、库存扣减）。
<em>   <strong>命名规则</strong>：名称必须以 <code>.fifo</code> 结尾。
</em>   <strong>吞吐量</strong>：
    <em>   默认：最高 300 TPS (发送/接收/删除)。
    </em>   启用批处理 (Batching)：最高 3,000 TPS。
<em>   <strong>排序</strong>：<strong>First-In-First-Out</strong>（严格保序）。
</em>   <strong>交付保证</strong>：<strong>Exactly-Once Processing</strong>（精确一次处理）。通过去重机制防止重复消息。
<em>   <strong>去重机制</strong>：
    </em>   <strong>Message Deduplication ID</strong>：用于识别重复消息。
    <em>   <strong>Message Group ID</strong>：用于在同一队列中对消息进行分组，组内有序，不同组并行处理。

---

## 3. 轮询与可见性超时 (Polling & Visibility)

### 3.1 短轮询 vs 长轮询 (Short Polling vs Long Polling)
</em>   <strong>短轮询 (Short Polling)</strong>：
    <em>   <strong>行为</strong>：立即返回响应，即使队列为空。只查询部分服务器，可能无法返回所有可用消息。
    </em>   <strong>缺点</strong>：如果队列经常为空，会导致大量的空请求，增加 API 调用成本。
    <em>   <strong>设置</strong>：<code>ReceiveMessageWaitTimeSeconds</code> = 0。
</em>   <strong>长轮询 (Long Polling)</strong>：
    <em>   <strong>行为</strong>：如果队列为空，SQS 会等待一段时间（最长 20 秒），直到有消息到达才返回。
    </em>   <strong>优势</strong>：<strong>降低成本</strong>（减少空响应的 API 调用），消除假空响应。
    <em>   <strong>设置</strong>：<code>ReceiveMessageWaitTimeSeconds</code> > 0（通常设为 20秒）。

> <strong>Note</strong>: 长轮询是考试中的<strong>推荐/考点</strong>。

### 3.2 可见性超时 (Visibility Timeout)
</em>   <strong>机制</strong>：当消费者接收到消息后，该消息不会立即从队列删除，而是在一段时间内对其他消费者“不可见”。这防止了多个消费者处理同一条消息。
<em>   <strong>时间设置</strong>：
    </em>   默认：30 秒。
    <em>   范围：0 秒 到 12 小时。
</em>   <strong>处理逻辑</strong>：
    <em>   <strong>处理成功</strong>：消费者必须在超时前显式调用 <code>DeleteMessage</code> 删除消息。
    </em>   <strong>处理失败/超时</strong>：如果超时时间内未删除，消息会重新变回“可见”状态，其他消费者可以再次接收并处理（重试机制）。
    <em>   <strong>延长超时</strong>：如果处理时间长于预期，消费者需调用 <code>ChangeMessageVisibility</code> API 延长超时时间。

---

## 4. 高级功能与架构模式

### 4.1 死信队列 (Dead-Letter Queue, DLQ)
</em>   <strong>作用</strong>：用于隔离无法被成功处理的消息（Poison Pill），方便后续排查分析。
<em>   <strong>触发条件</strong>：当消息的接收次数（<code>MaximumReceives</code>）超过设定阈值时，SQS 自动将消息移动到 DLQ。
</em>   <strong>限制</strong>：
    <em>   标准队列的 DLQ 必须是标准队列。
    </em>   FIFO 队列的 DLQ 必须是 FIFO 队列。
<em>   <strong>Redrive Policy</strong>：定义将消息移动到 DLQ 的规则。

### 4.2 延迟队列 (Delay Queues)
</em>   <strong>作用</strong>：让新发送到队列的消息在特定时间内（DelaySeconds）对消费者不可见。
<em>   <strong>范围</strong>：0 秒 到 15 分钟。
</em>   <strong>区别</strong>：
    <em>   </em>Delay Queue<em>：作用于队列级别，所有新消息都延迟。
    </em>   <em>Message Timer</em>：作用于单条消息级别，仅特定消息延迟。

### 4.3 扇出模式 (Fan-Out Pattern)
<em>   <strong>架构</strong>：SNS Topic + SQS Queues。
</em>   <strong>流程</strong>：消息发送到 SNS Topic，然后 SNS 将消息推送到订阅了该 Topic 的多个 SQS 队列。
<em>   <strong>优势</strong>：实现并行异步处理。例如，一个订单消息发送到 SNS，被推送到“库存队列”和“邮件通知队列”，两个系统互不影响。

---

## 5. 安全性与监控

### 5.1 访问控制
</em>   <strong>IAM Policies</strong>：控制谁可以访问 SQS API（用户、角色）。
<em>   <strong>SQS Queue Access Policy</strong>（基于资源的策略）：
    </em>   类似于 S3 Bucket Policy。
    <em>   <strong>跨账号访问</strong>：允许其他 AWS 账号访问你的队列。
    </em>   <strong>服务集成</strong>：允许其他 AWS 服务（如 S3 Event Notifications, SNS）向队列发送消息。

### 5.2 网络安全
<em>   <strong>VPC Endpoints (Interface Endpoint)</strong>：
    </em>   通过 AWS PrivateLink 在 VPC 内部访问 SQS，无需经过公网，无需配置 Internet Gateway 或 NAT。
    <em>   可以配置 VPC Endpoint Policy 限制访问。

### 5.3 加密
</em>   <strong>SSE (Server-Side Encryption)</strong>：
    <em>   使用 SSE-SQS（默认）或 SSE-KMS（可自定义密钥权限）。
    </em>   加密静态数据（消息正文），但<strong>不加密</strong>队列元数据（如队列名称、属性）。

---

## 6. 计费与限制

1.  <strong>计费</strong>：按请求数量计费（每 100 万次请求）。
    <em>   批量操作（Batch Send/Delete, 10条消息或256KB以内）视为 1 次请求，有助于降低成本。
    </em>   数据传输费用（出站流量收费，同一区域 EC2 传入免费）。
2.  <strong>限制</strong>：
    *   <strong>Inflight Messages (传输中消息)</strong>：
        *   标准队列：约 120,000 条。
        *   FIFO 队列：20,000 条。
        *   *定义*：已被消费者接收但尚未删除或未过期的消息。

---

## 7. 最佳实践总结 (Exam Tips)

> <strong>Note - 成本优化</strong>：如果发现空响应很多，或者 API 调用费用过高，<strong>务必启用长轮询 (Long Polling)</strong>。

> <strong>Note - 应用解耦</strong>：当题目提到“EC2 实例处理速度跟不上请求速度”或“需要缓冲流量峰值”时，首选 SQS。

> <strong>Note - 顺序性与性能</strong>：
> *   如果只需高性能，不介意极少数重复或乱序 -> <strong>Standard Queue</strong>。
> *   如果必须保证顺序（如银行流水）-> <strong>FIFO Queue</strong>。

> <strong>Note - 超时处理</strong>：如果任务处理时间不确定，建议在代码中不断“心跳”并调用 <code>ChangeMessageVisibility</code> 延长超时，而不是一开始设置巨大的超时时间。

> <strong>Note - Lambda 集成</strong>：SQS 可以作为 Lambda 的事件源（Event Source），Lambda 会自动轮询队列。如果是 FIFO 队列触发 Lambda，Lambda 会按顺序处理每组消息，失败会阻塞后续同组消息的处理。