---
title: AWS-lambda
date: 2026-01-23 21:11:20
tags:
  - AWS
  - Lambda
  - Serverless
  - Cloud Computing
categories:
  - AWS
---
# AWS Lambda

## 第一章：核心定义与本质

<strong>AWS Lambda</strong> 是一种无服务器（Serverless）、事件驱动的计算服务。它让你无需预置或管理服务器即可运行代码，只需为使用的计算时间付费。

<em> <strong>服务本质</strong>：你只需上传代码，Lambda 会自动处理运行代码所需的一切，包括服务器管理、操作系统维护、容量缩放和代码监控。
</em> <strong>计费模式</strong>：按请求次数和执行时长（以毫秒为单位）计费。如果没有代码运行，则无需付费。
<em> <strong>弹性缩放</strong>：Lambda 会根据传入事件的数量自动水平缩放。它可以从零增加到数千个并发实例。
</em> <strong>无状态性</strong>：函数是无状态的，不与任何底层基础设施建立持久连接。

---

## 第二章：核心组件与配置

### 1. 函数 (Function)

<em> <strong>代码</strong>：你上传的用于处理事件的可执行程序。
</em> <strong>运行时 (Runtime)</strong>：Lambda 支持多种语言，包括 Node.js、Python、Java、Go、C#、Ruby，也支持自定义运行时（Custom Runtime）。
<em> <strong>处理程序 (Handler)</strong>：代码中的入口点，Lambda 在开始执行时会调用该方法。

### 2. 触发器 (Trigger)

</em> 触发器是集成到 Lambda 函数中的 AWS 服务或资源，用于启动函数执行。例如 S3 对象创建、API Gateway 请求或状态更改。

### 3. 环境与资源控制

<em> <strong>内存 (Memory)</strong>：可配置范围为 128 MB 到 10,240 MB。CPU 功率与内存大小成正比。
</em> <strong>超时 (Timeout)</strong>：单次执行的最长时间上限为 <strong>15 分钟</strong>。
<em> <strong>临时存储 (/tmp)</strong>：每个函数提供 512 MB 到 10 GB 的非持久性磁盘空间。
</em> <strong>环境变量</strong>：用于将配置设置传递给函数代码，而无需修改代码本身。

---

## 第三章：调用类型 (Invocation Types)

理解调用方式是架构设计的关键考点：

### 1. 同步调用 (Synchronous)

<em> <strong>逻辑</strong>：客户端等待函数处理完成并返回响应。
</em> <strong>典型场景</strong>：API Gateway、Elastic Load Balancing (ALB)、Cognito。
<em> <strong>错误处理</strong>：由客户端负责重试。

### 2. 异步调用 (Asynchronous)

</em> <strong>逻辑</strong>：Lambda 将事件放入队列中并立即向客户端返回成功响应，随后在后台处理。
<em> <strong>典型场景</strong>：S3、SNS、CloudWatch Logs。
</em> <strong>错误处理</strong>：Lambda 默认会自动重试两次。
<em> <strong>目的地 (Destinations)</strong>：执行成功或失败后，可以将记录发送到 SQS、SNS、Lambda 或 EventBridge。

### 3. 事件源映射 (Event Source Mapping)

</em> <strong>逻辑</strong>：Lambda 读取流或队列并调用函数（轮询模式）。
<em> <strong>典型场景</strong>：Kinesis、DynamoDB Streams、SQS。
</em> <strong>错误处理</strong>：通常基于批处理。如果一批数据失败，Lambda 会反复重试直到数据过期。

---

## 第四章：并发管理 (Concurrency)

<em> <strong>预留并发 (Reserved Concurrency)</strong>：
</em> 为特定函数预留一部分账户总并发配额。
<em> <strong>作用</strong>：确保关键函数始终有容量可用，同时可作为“终止开关”限制某个函数的最大并发量，防止过度消耗资源或影响后端数据库。


</em> <strong>预置并发 (Provisioned Concurrency)</strong>：
<em> 提前初始化一定数量的函数实例，使其处于“热”状态。
</em> <strong>作用</strong>：消除冷启动（Cold Start）延迟，确保函数能够立即响应突发流量。



---

## 第五章：网络与安全性

### 1. VPC 网络

<em> <strong>默认情况</strong>：Lambda 运行在 AWS 管理的安全网络中，可以直接访问互联网和公共 AWS 服务 API。
</em> <strong>访问私有资源</strong>：若需访问 VPC 内的资源（如 RDS、私有子网中的 EC2），必须配置 Lambda 关联特定的 <strong>子网 (Subnets)</strong> 和 <strong>安全组 (Security Groups)</strong>。
<em> <strong>注意</strong>：一旦关联 VPC，Lambda 默认失去互联网访问权限。若需上网，必须通过私有子网中的 <strong>NAT Gateway</strong>。

### 2. 权限管理 (IAM)

</em> <strong>执行角色 (Execution Role)</strong>：这是一个 IAM 角色，授予函数访问其他 AWS 服务（如写日志到 CloudWatch、读取 S3 桶）的权限。
<em> <strong>基于资源的策略 (Resource-based Policy)</strong>：定义哪些服务或账号有权调用（Invoke）该函数。

---

## 第六章：高级特性

</em> <strong>版本 (Versions)</strong>：你可以发布函数的一个或多个版本，每个版本拥有唯一的 ARN 且不可更改。
<em> <strong>别名 (Aliases)</strong>：指向特定版本的指针（如 <code>PROD</code> 指向版本 1）。支持流量切换，例如 10% 流量发往 <code>BETA</code> 别名，实现金丝雀发布。
</em> <strong>层 (Layers)</strong>：将公共库、依赖项或自定义运行时打包在一起。多个函数可以共享同一个层，减少部署包的大小。
<ul><li><strong>Lambda@Edge</strong>：在 CloudFront 边缘节点运行代码，为全球用户提供极低延迟的处理。</li></ul>

---

## 第七章：架构师自考与最佳实践

| 需求场景 | 推荐方案 |
| --- | --- |
| <strong>消除由于初始化过慢导致的冷启动延迟</strong> | 开启 <strong>Provisioned Concurrency</strong> |
| <strong>防止某个非核心函数消耗掉整个账号的并发额度</strong> | 设置 <strong>Reserved Concurrency</strong> 上限 |
| <strong>函数需要访问 VPC 内的 RDS 数据库</strong> | 配置 VPC Subnets 和 Security Group |
| <strong>需要跨多个函数共享一段通用的 Python 库代码</strong> | 使用 <strong>Lambda Layers</strong> |
| <strong>处理失败的异步调用请求，防止数据丢失</strong> | 配置 <strong>On-failure Destinations</strong> 指向 SQS 或 SNS |
| <strong>需要为生产环境提供稳定的访问路径而不受版本更新影响</strong> | 使用 <strong>Aliases (别名)</strong> |

