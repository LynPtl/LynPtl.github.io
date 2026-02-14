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
*   **Pull Based (基于拉取)**：SQS 不会将消息推送给消费者。消费者必须主动轮询（Poll）队列以检查新消息。
*   **解耦**：生产者（Producer）和消费者（Consumer）不需要同时在线。消息会存储在队列中，直到被处理或过期。
*   **持久性**：消息存储在多个服务器上以确保持久性。
*   **消息大小限制**：
    *   单个消息最大 **256 KB**。
    *   若需传输更大的数据，需配合 Amazon S3 使用（通常称为 SQS Extended Client Library 模式，将数据存 S3，消息存 S3 的引用）。
*   **消息保留期 (Retention Period)**：
    *   默认：4 天。
    *   范围：1 分钟 到 14 天。

---

## 2. 队列类型 (Queue Types)

这是考试中极高频的考点，必须清晰区分两种队列的适用场景。

### 2.1 标准队列 (Standard Queues)
*   **适用场景**：吞吐量要求高，对顺序要求不严格的场景。
*   **吞吐量**：**几乎无限** (Unlimited Throughput)。
*   **排序**：**Best-Effort Ordering**（尽力而为的排序）。消息可能不会按照发送顺序被接收。
*   **交付保证**：**At-Least-Once Delivery**（至少一次交付）。极少数情况下，同一条消息可能会被传递多次（消费者必须设计为**幂等性** Idempotent，即处理多次和处理一次结果相同）。

### 2.2 FIFO 队列 (先进先出)
*   **适用场景**：必须严格保证顺序，且不能有重复消息的场景（如银行交易、库存扣减）。
*   **命名规则**：名称必须以 `.fifo` 结尾。
*   **吞吐量**：
    *   默认：最高 300 TPS (发送/接收/删除)。
    *   启用批处理 (Batching)：最高 3,000 TPS。
*   **排序**：**First-In-First-Out**（严格保序）。
*   **交付保证**：**Exactly-Once Processing**（精确一次处理）。通过去重机制防止重复消息。
*   **去重机制**：
    *   **Message Deduplication ID**：用于识别重复消息。
    *   **Message Group ID**：用于在同一队列中对消息进行分组，组内有序，不同组并行处理。

---

## 3. 轮询与可见性超时 (Polling & Visibility)

### 3.1 短轮询 vs 长轮询 (Short Polling vs Long Polling)
*   **短轮询 (Short Polling)**：
    *   **行为**：立即返回响应，即使队列为空。只查询部分服务器，可能无法返回所有可用消息。
    *   **缺点**：如果队列经常为空，会导致大量的空请求，增加 API 调用成本。
    *   **设置**：`ReceiveMessageWaitTimeSeconds` = 0。
*   **长轮询 (Long Polling)**：
    *   **行为**：如果队列为空，SQS 会等待一段时间（最长 20 秒），直到有消息到达才返回。
    *   **优势**：**降低成本**（减少空响应的 API 调用），消除假空响应。
    *   **设置**：`ReceiveMessageWaitTimeSeconds` > 0（通常设为 20秒）。

> **Note**: 长轮询是考试中的**推荐/考点**。

### 3.2 可见性超时 (Visibility Timeout)
*   **机制**：当消费者接收到消息后，该消息不会立即从队列删除，而是在一段时间内对其他消费者“不可见”。这防止了多个消费者处理同一条消息。
*   **时间设置**：
    *   默认：30 秒。
    *   范围：0 秒 到 12 小时。
*   **处理逻辑**：
    *   **处理成功**：消费者必须在超时前显式调用 `DeleteMessage` 删除消息。
    *   **处理失败/超时**：如果超时时间内未删除，消息会重新变回“可见”状态，其他消费者可以再次接收并处理（重试机制）。
    *   **延长超时**：如果处理时间长于预期，消费者需调用 `ChangeMessageVisibility` API 延长超时时间。

---

## 4. 高级功能与架构模式

### 4.1 死信队列 (Dead-Letter Queue, DLQ)
*   **作用**：用于隔离无法被成功处理的消息（Poison Pill），方便后续排查分析。
*   **触发条件**：当消息的接收次数（`MaximumReceives`）超过设定阈值时，SQS 自动将消息移动到 DLQ。
*   **限制**：
    *   标准队列的 DLQ 必须是标准队列。
    *   FIFO 队列的 DLQ 必须是 FIFO 队列。
*   **Redrive Policy**：定义将消息移动到 DLQ 的规则。

### 4.2 延迟队列 (Delay Queues)
*   **作用**：让新发送到队列的消息在特定时间内（DelaySeconds）对消费者不可见。
*   **范围**：0 秒 到 15 分钟。
*   **区别**：
    *   *Delay Queue*：作用于队列级别，所有新消息都延迟。
    *   *Message Timer*：作用于单条消息级别，仅特定消息延迟。

### 4.3 扇出模式 (Fan-Out Pattern)
*   **架构**：SNS Topic + SQS Queues。
*   **流程**：消息发送到 SNS Topic，然后 SNS 将消息推送到订阅了该 Topic 的多个 SQS 队列。
*   **优势**：实现并行异步处理。例如，一个订单消息发送到 SNS，被推送到“库存队列”和“邮件通知队列”，两个系统互不影响。

---

## 5. 安全性与监控

### 5.1 访问控制
*   **IAM Policies**：控制谁可以访问 SQS API（用户、角色）。
*   **SQS Queue Access Policy**（基于资源的策略）：
    *   类似于 S3 Bucket Policy。
    *   **跨账号访问**：允许其他 AWS 账号访问你的队列。
    *   **服务集成**：允许其他 AWS 服务（如 S3 Event Notifications, SNS）向队列发送消息。

### 5.2 网络安全
*   **VPC Endpoints (Interface Endpoint)**：
    *   通过 AWS PrivateLink 在 VPC 内部访问 SQS，无需经过公网，无需配置 Internet Gateway 或 NAT。
    *   可以配置 VPC Endpoint Policy 限制访问。

### 5.3 加密
*   **SSE (Server-Side Encryption)**：
    *   使用 SSE-SQS（默认）或 SSE-KMS（可自定义密钥权限）。
    *   加密静态数据（消息正文），但**不加密**队列元数据（如队列名称、属性）。

---

## 6. 计费与限制

1.  **计费**：按请求数量计费（每 100 万次请求）。
    *   批量操作（Batch Send/Delete, 10条消息或256KB以内）视为 1 次请求，有助于降低成本。
    *   数据传输费用（出站流量收费，同一区域 EC2 传入免费）。
2.  **限制**：
    *   **Inflight Messages (传输中消息)**：
        *   标准队列：约 120,000 条。
        *   FIFO 队列：20,000 条。
        *   *定义*：已被消费者接收但尚未删除或未过期的消息。

---

## 7. 最佳实践总结 (Exam Tips)

> **Note - 成本优化**：如果发现空响应很多，或者 API 调用费用过高，**务必启用长轮询 (Long Polling)**。

> **Note - 应用解耦**：当题目提到“EC2 实例处理速度跟不上请求速度”或“需要缓冲流量峰值”时，首选 SQS。

> **Note - 顺序性与性能**：
> *   如果只需高性能，不介意极少数重复或乱序 -> **Standard Queue**。
> *   如果必须保证顺序（如银行流水）-> **FIFO Queue**。

> **Note - 超时处理**：如果任务处理时间不确定，建议在代码中不断“心跳”并调用 `ChangeMessageVisibility` 延长超时，而不是一开始设置巨大的超时时间。

> **Note - Lambda 集成**：SQS 可以作为 Lambda 的事件源（Event Source），Lambda 会自动轮询队列。如果是 FIFO 队列触发 Lambda，Lambda 会按顺序处理每组消息，失败会阻塞后续同组消息的处理。