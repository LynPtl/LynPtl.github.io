---
title: AWS API Gateway
date: 2026-02-22 18:19:36
tags:
  - AWS
  - Networking
  - Serverless
  - SAA
  - API Gateway
categories:
  - AWS
---

# AWS API Gateway

## 1. 基础与 API 类型

Amazon API Gateway 是一种完全托管的服务，使开发人员能够轻松创建、发布、维护、监控和保护任意规模的 API。它是应用程序的“前门”。

*   **核心特性**：
    *   **完全托管**：处理从每秒几个请求到数百万个请求的所有事务。
    *   **无服务器**：按调用次数和数据传输量付费，无预置费用。
    *   **协议支持**：支持 HTTPS（不直接支持 HTTP，必须加密）。

*   **API 类型 (考试必考区别)**：
    *   **REST API (经典版)**：
        *   **功能**：功能最全。支持 API 密钥、每客户端限制、请求验证、AWS WAF 集成、私有 API。
        *   **场景**：企业级应用，需要复杂控制和安全功能。
    *   **HTTP API (新版/轻量版)**：
        *   **功能**：比 REST API **快**（低延迟）且 **便宜**（约节省 71%）。
        *   **限制**：功能较少（例如：原生不支持 API 密钥缓存计划，但在不断更新）。
        *   **场景**：构建用于 Lambda 或 HTTP 后端的简单、高性能代理 API。
    *   **WebSocket API**：
        *   **特性**：**有状态 (Stateful)** 连接。服务器可以主动向客户端推送消息。
        *   **场景**：实时聊天应用、即时通讯、股票行情仪表板。

---

## 2. 端点类型 (Endpoint Types)

决定了 API 在网络层面上是可以从哪里被访问的。

1.  **Edge-Optimized (边缘优化 - 默认)**：
    *   **架构**：请求通过 CloudFront 的全球边缘网络路由到 API Gateway（位于特定区域）。
    *   **场景**：**全球分布**的客户端，为了降低连接延迟。
2.  **Regional (区域性)**：
    *   **架构**：直接在部署的区域接收请求，没有 CloudFront 层。
    *   **场景**：客户端和 API 在**同一区域**（如 EC2 调用 API），或者你想自己配置 CloudFront 发行版（例如为了控制 WAF 或自定义域名逻辑）。
3.  **Private (私有)**：
    *   **架构**：只能通过 **VPC Endpoint (Interface Endpoint)** 从 VPC 内部访问。
    *   **场景**：内部微服务通信，**绝对禁止**公网访问，为了极高的安全性。

---

## 3. 集成模式 (Integrations)

API Gateway 接到请求后，怎么传给后端？

### 3.1 Lambda Proxy Integration (Lambda 代理集成) —— **考试首选**
*   **机制**：API Gateway 将整个 HTTP 请求（Headers, Body, Params）原封不动地打包成一个 JSON 对象传给 Lambda。
*   **责任**：Lambda 负责解析请求，并必须返回特定格式的 JSON（包含 `statusCode`, `body`, `headers`）。
*   **优势**：简单、灵活，逻辑全在代码里。

### 3.2 HTTP Proxy Integration (HTTP 代理集成)
*   **机制**：直接将请求透传给后端的 HTTP 端点（如 ALB 后的 EC2 或本地服务器）。
*   **场景**：将旧的 API 系统通过 API Gateway 暴露出去，或作为 ALB 的前端。

### 3.3 AWS Service Integration (AWS 服务集成) —— **架构优化考点**
*   **机制**：API Gateway 直接调用其他 AWS 服务，**中间不需要 Lambda**。
*   **经典场景**：
    *   API Gateway -> **SQS** (异步解耦，高并发写入)。
    *   API Gateway -> **Kinesis** (数据流摄入)。
    *   API Gateway -> **DynamoDB** (简单的 CRUD)。
*   **优势**：**更低成本、更低延迟**（少了一层 Lambda 计算费用和冷启动）。

---

## 4. 性能、缓存与节流 (Performance)

这是你错题集中提到的重点，必须分清“保护谁”。

### 4.1 Throttling (节流/限流)
*   **算法**：令牌桶算法 (Token Bucket)。
*   **层级**：
    *   **账号级**：默认每秒 10,000 请求 (RPS)。
    *   **API 级** / **Stage 级** / **Method 级**：可自定义。
    *   **429 Too Many Requests**：当超过限制时返回的错误码。
*   **保护后端**：如果你的后端是脆弱的旧系统（如传统关系型数据库），**必须**配置 API Gateway Throttling 来拦截流量洪峰，防止后端崩溃。

### 4.2 Caching (缓存)
*   **机制**：在指定的时间（TTL，默认 300s）内缓存后端响应。后续相同的请求直接由 API Gateway 返回，不打扰后端。
*   **优势**：降低延迟，减少后端负载，节省 Lambda/数据库费用。
*   **Key**：可以基于 URL 参数或 Header 进行缓存隔离。

---

## 5. 部署与生命周期 (Deployment)

*   **Deployment (部署)**：对 API 的修改必须“部署”才能生效。
*   **Stages (阶段)**：类似于环境（Dev, Test, Prod）。每个 Stage 指向一个 Deployment。
*   **Canary Deployment (金丝雀发布)**：
    *   **机制**：允许在同一个 Stage 中将一小部分流量（如 10%）引导到新版本的 API。
    *   **作用**：安全地测试新版本，如果报错，可以立即回滚。

---

## 6. 安全性与认证 (Security)

考试常考：针对不同用户群，选什么认证方式？

| 认证方式 | 适用场景 / 触发词 |
| :--- | :--- |
| **IAM Authorization** | **内部系统**、EC2 实例、其他 AWS 服务调用 API。使用 SigV4 签名。 |
| **Amazon Cognito User Pools** | **移动 App 用户**、Web 用户、需要注册/登录/社交登录（Facebook/Google）。 |
| **Lambda Authorizer** (Custom) | **第三方认证**（OAuth, SAML, LDAP）、复杂的自定义逻辑、Token 校验。 |
| **API Keys** | **计量与配额**（Usage Plans）。主要用于将 API 作为 SaaS 产品卖给客户，限制不同等级客户的调用次数，而不是为了安全性（Key 容易泄露）。 |

*   **资源策略 (Resource Policy)**：
    *   类似于 S3 Bucket Policy。可以限制特定的 IP 地址或 VPC 访问 API。

---

## 7. 最佳实践总结 (Exam Tips)

结合以往易错知识点，以下是几个在实际应用和考试中常见的判断场景：

> **Note - 处理突发流量策略**：
> *   **当后端系统（如传统 RDS 数据库或旧版架构）无法承受突发的并发连接时**：强烈建议配置 **API Gateway Throttling（节流/限流）**，设定合理的 RPS 上限，超出部分直接返回 429 错误，以保护后端不被压垮。
> *   **当需要削峰填谷以缓解后端压力，并且业务允许异步处理时**：最强的解耦模式是将请求发往 **SQS（队列）**，然后由 Lambda 或消费者实例慢慢处理，而不是让 API Gateway 持续等待后端响应。

> **Note - 超时问题与错误码排查**：
> *   API Gateway 的最大超时时间是 **29 秒**。这是一个无法修改的硬限制。如果后端处理时间超过 29 秒，API Gateway 会强制返回 **504 Gateway Timeout**。遇到此类长时间处理任务，建议转为异步模式（例如发送到 SQS，前端通过其他方式轮询结果）。
> *   收到 **429** 返回码：说明请求频率过高，触发了限流。
> *   收到 **502 Bad Gateway** 返回码：这通常是 **Lambda Proxy** 集成配置问题，Lambda 必须返回包含正确格式的 JSON 对象（如必须带有 `statusCode`, `body`）。
> *   收到 **504 Gateway Timeout** 返回码：典型的后端处理超时事件（处理时长超过了 API Gateway 允许的 29 秒）。

> **Note - 特殊 API 场景快速定位**：
> *   **当需求提到实时性强的数据交互（如 “Real-time” 实时、“Chat app” 聊天应用、“Push notification” 服务器主动推送）时**：毋庸置疑，选择 **WebSocket API**。
> *   **当要求在 VPC 内部安全地访问 API，且绝对不能将其外露给公共互联网时**：必须使用 **Private API** 配合 **VPC Interface Endpoint** 实现内网直连隔离。