---
title: AWS S3
date: 2026-02-15 00:17:13
tags:
  - AWS
  - Storage
  - SAA
  - S3
categories:
  - AWS
---
# AWS S3 Deep Dive

## 1. S3 基础与架构 (S3 Basics & Architecture)

Amazon S3 是一种对象存储服务，提供无限的存储容量，数据以对象（Object）的形式存储在存储桶（Bucket）中。

### 1.1 基本概念
*   **Bucket (存储桶)**：存储对象的容器。
    *   **命名规则**：必须是全局唯一的 DNS 兼容名称（全 AWS 唯一）。创建后不能更改名称或区域。
    *   **限制**：默认每个账号 10,000 个存储桶（可申请提升至 100 万个）。
    *   **目录存储桶 (Directory Buckets)**：专用于 S3 Express One Zone 的新类型，旨在实现个位数毫秒级延迟。
*   **Object (对象)**：由文件数据和元数据组成。每个对象通过 **Key** (唯一标识符) 在桶内进行索引。
    *   **大小限制**：单个对象最大支持 5 TB。超过 5 GB 的对象必须使用分段上传 (Multipart Upload) API。
*   **区域性**：虽然 Bucket 名称是全局的，但数据物理存储在创建时选择的区域（Region）中，除非配置复制，否则数据不会离开该区域。

### 1.2 数据一致性模型 (Data Consistency Model)
*   **强一致性 (Strong Consistency)**：对于所有 S3 操作（包括 PUT 新对象、覆盖或删除现有对象），S3 现在提供“写入后读取”的强一致性。写入成功后，任何后续的读取请求都会立即收到最新版本。
*   **最终一致性 (例外情况)**：仅适用于 Bucket 级别的配置更改（如启用版本控制）或 Bucket 的删除列表。

---

## 2. 存储类型 (Storage Classes)

选择正确的存储类型是 SAA 考试的重点，主要基于访问频率和持久性需求。

### 2.1 频繁访问层 (Frequently Accessed)
*   **S3 Standard**：
    *   **适用场景**：通用型存储，适用于频繁访问的数据。
    *   **可用性**：99.99% 可用性，数据存储在 >=3 个可用区 (AZ)。
*   **S3 Express One Zone**：
    *   **适用场景**：高性能、延迟敏感型应用。
    *   **性能**：提供个位数毫秒级延迟（比 Standard 快 10 倍），成本降低 50%。
    *   **架构**：数据仅存储在 **1 个 AZ** (Directory Bucket)，持久性较低。

### 2.2 不频繁访问层 (Infrequently Accessed)
适用于长期存储但偶尔需要立即访问的数据。对象最小计费容量为 128 KB，最短存储期限为 30 天。

*   **S3 Standard-IA (Infrequent Access)**：
    *   **架构**：数据存储在 >=3 个 AZ。适用于需要高持久性但访问较少的数据。
*   **S3 One Zone-IA**：
    *   **架构**：数据仅存储在 **1 个 AZ**。
    *   **风险**：成本比 Standard-IA 低 20%，但如果是物理 AZ 损毁，数据将丢失。适用于可重建的数据或辅助备份。

### 2.3 智能分层 (Intelligent-Tiering)
*   **机制**：监控访问模式并在不同层级间自动移动对象，无检索费用，无管理开销。
*   **层级流转**：
    *   **频繁层** -> (30天无访问) -> **不频繁访问层**。
    *   -> (90天无访问) -> **归档即时访问层 (Archive Instant Access)**。
    *   **可选异步归档**：可配置在 90 天或 180 天后移动到 Deep Archive。
*   **自动恢复**：如果对象被访问，它会自动移回频繁访问层。

### 2.4 归档层 (Glacier)
用于长期归档，成本极低，但检索需要时间（除 Instant Retrieval 外）。

*   **S3 Glacier Instant Retrieval**：
    *   **特点**：毫秒级检索，适用于每季度访问一次的数据。节省存储成本但检索费用高于 Standard-IA。
*   **S3 Glacier Flexible Retrieval**：
    *   **检索模式**：
        *   Expedited (加急): 1-5 分钟。
        *   Standard (标准): 3-5 小时（默认）。
        *   Bulk (批量): 5-12 小时（最便宜/免费检索）。
    *   **最短存储期**：90 天。
*   **S3 Glacier Deep Archive**：
    *   **特点**：最低成本存储（替代磁带库）。
    *   **检索时间**：12 小时 (Standard) 或 48 小时 (Bulk)。
    *   **最短存储期**：180 天。

---

## 3. 存储桶管理与高级功能

### 3.1 版本控制 (Versioning)
*   **作用**：防止意外覆盖和删除。启用后，所有版本都会保留（包括删除标记 Delete Marker）。
*   **删除逻辑**：
    *   如果不指定版本 ID 进行 DELETE，S3 仅插入一个“删除标记”，对象看起来已删除（404错误），但可恢复。
    *   只有指定版本 ID 才能永久删除对象。
*   **MFA Delete**：要求在更改版本状态或永久删除对象版本时提供 MFA 令牌，增加安全性。

### 3.2 生命周期管理 (Lifecycle Management)
通过规则自动管理对象生命周期。
*   **转换操作 (Transition)**：将对象移动到更便宜的存储类（例如：Standard -> IA -> Glacier）。
    *   *限制*：转入 S3-IA 或 One Zone-IA 前必须在当前层存储至少 30 天。
*   **过期操作 (Expiration)**：定义对象何时过期并由 S3 自动删除。

### 3.3 对象锁定 (Object Lock)
*   **WORM 模型**：Write Once, Read Many。防止对象在固定时间内被删除或覆盖。
*   **模式**：
    *   **Retention Period**：在保留期内锁定。
    *   **Legal Hold**：无限期锁定，直到手动移除。
*   *注意*：仅适用于启用了版本控制的存储桶。

### 3.4 性能优化功能
*   **S3 Transfer Acceleration**：利用 CloudFront 的全球边缘节点加速远距离上传/下载。启用后会获得专用端点 `bucket.s3-accelerate.amazonaws.com`。
*   **Multipart Upload**：对于 >5 GB 的文件必须使用，建议 >100 MB 时使用，以提高上传稳定性和速度。
*   **S3 Select**：使用 SQL 语句仅检索对象（CSV/JSON/Parquet）中的部分数据，减少传输流量并提高性能。

---

## 4. 安全性与访问控制

### 4.1 访问控制策略
S3 提供多层访问控制，默认情况下所有资源都是私有的。
*   **Bucket Policies (存储桶策略)**：
    *   基于资源的策略，控制整个存储桶的访问。
    *   可基于 IP、VPC 端点、MFA 等条件允许或拒绝访问。
    *   *强制 SSL*：通过策略拒绝 `aws:SecureTransport: false` 的请求来强制使用 HTTPS。
*   **ACLs (访问控制列表)**：
    *   旧版功能，默认禁用（Bucket Owner Enforced）。建议使用 Bucket Policy 替代。
*   **IAM Policies**：基于身份的策略，授予用户或角色访问 S3 的权限。

### 4.2 加密 (Encryption)
支持静态和传输中加密。
*   **服务端加密 (Server-Side Encryption)**：
    *   **SSE-S3**：使用 S3 托管密钥，现为所有桶的默认加密方式。
    *   **SSE-KMS**：使用 AWS KMS 密钥，提供审计跟踪（CloudTrail 记录）和更细粒度的权限控制。
    *   **SSE-C**：客户提供密钥，AWS 进行加密/解密操作，AWS 不存储密钥。
*   **客户端加密**：数据在上传前由客户端加密。

### 4.3 阻止公有访问 (Block Public Access)
AWS 建议在账号或存储桶级别启用此功能，防止意外的数据泄露。

---

## 5. 复制与数据保护

### 5.1 跨区域复制 (CRR) & 同区域复制 (SRR)
*   **前提条件**：源桶和目标桶都必须 **开启版本控制**。
*   **复制内容**：配置后创建的新对象、元数据、对象标签、SSE-S3 和 SSE-KMS 加密的对象（需额外配置）。
*   **不复制内容**：配置前的存量对象、SSE-C 加密对象、源桶中本身也是复制品的副本（不通过链式复制）。
*   **删除行为**：如果不指定版本 ID 的删除（即添加删除标记），删除标记会被复制；但指定版本的永久删除 **不会** 被复制，以防恶意删除。
*   **RTC (Replication Time Control)**：提供 SLA，保证 15 分钟内完成复制。

### 5.2 数据完整性
*   **Checksums**：S3 在上传和检索时使用 CRC 校验和验证数据完整性，自动修复损坏数据。

---

## 6. S3 新特性与特殊功能

### 6.1 S3 Tables
*   **用途**：基于 Apache Iceberg 格式存储表格数据，专为分析工作负载设计。
*   **优势**：相比通用 S3 桶，提供更高的查询吞吐量和自动维护（压缩、快照管理）。
*   **集成**：可直接与 Athena, Redshift, QuickSight 集成。

### 6.2 静态网站托管 (Static Website Hosting)
*   **端点区别**：
    *   **REST API 端点**：支持 SSL，支持私有内容。
    *   **网站端点**：不支持 SSL（需配合 CloudFront 实现 HTTPS），仅支持公开可读内容，支持重定向和索引文档。
*   **权限**：必须配置 Bucket Policy 允许 `s3:GetObject` 权限给所有人。

### 6.3 S3 Storage Lens
*   **功能**：全组织级别的可见性工具，用于分析存储使用情况、活动趋势，并提供成本优化建议。

---

## 7. 计费与定价模型

S3 遵循“按使用量付费”原则，主要收费点如下：
1.  **存储费**：按对象大小、存储时长和存储类型（Storage Class）收费。
2.  **请求费**：GET, PUT, LIST 等 API 调用次数。
3.  **检索费**：针对 Standard-IA, One Zone-IA 和 Glacier 类别的读取收费。
4.  **数据传输费**：
    *   传入数据（Inbound）：免费。
    *   传出数据（Outbound）：收费（传至同一区域的 EC2 或 CloudFront 免费）。
5.  **管理费**：如清单（Inventory）、分析、对象标签等。

*   **Requester Pays (请求者付费)**：
    *   配置后，请求数据的人支付请求费和数据传输费，桶主仅支付存储费。
    *   请求者必须在请求头中包含 `x-amz-request-payer`。

---

## 8. 最佳实践总结 (Exam Tips)

> **Note - 性能优化**：对于高吞吐量需求，S3 请求支持并行化。使用 Multipart Upload 加速大文件上传；使用 Range GET 并行下载文件部分。

> **Note - 安全性排查**：若无法通过 HTTPS 访问，检查 Bucket Policy 是否包含 `aws:SecureTransport` 条件。

> **Note - 合规性**：若要求数据保留特定时长且不可删除，务必使用 Object Lock (Compliance Mode)。

> **Note - 成本优化**：对于访问模式不可预测的数据，首选 **Intelligent-Tiering**。

> **Note - 跨账号访问**：可以通过 Bucket Policy（资源策略）直接授予另一个 AWS 账号权限，或者使用 IAM Role 进行跨账号访问。