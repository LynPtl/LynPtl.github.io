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
<em>   <strong>Bucket (存储桶)</strong>：存储对象的容器。
    </em>   <strong>命名规则</strong>：必须是全局唯一的 DNS 兼容名称（全 AWS 唯一）。创建后不能更改名称或区域。
    <em>   <strong>限制</strong>：默认每个账号 10,000 个存储桶（可申请提升至 100 万个）。
    </em>   <strong>目录存储桶 (Directory Buckets)</strong>：专用于 S3 Express One Zone 的新类型，旨在实现个位数毫秒级延迟。
<em>   <strong>Object (对象)</strong>：由文件数据和元数据组成。每个对象通过 <strong>Key</strong> (唯一标识符) 在桶内进行索引。
    </em>   <strong>大小限制</strong>：单个对象最大支持 5 TB。超过 5 GB 的对象必须使用分段上传 (Multipart Upload) API。
<em>   <strong>区域性</strong>：虽然 Bucket 名称是全局的，但数据物理存储在创建时选择的区域（Region）中，除非配置复制，否则数据不会离开该区域。

### 1.2 数据一致性模型 (Data Consistency Model)
</em>   <strong>强一致性 (Strong Consistency)</strong>：对于所有 S3 操作（包括 PUT 新对象、覆盖或删除现有对象），S3 现在提供“写入后读取”的强一致性。写入成功后，任何后续的读取请求都会立即收到最新版本。
<em>   <strong>最终一致性 (例外情况)</strong>：仅适用于 Bucket 级别的配置更改（如启用版本控制）或 Bucket 的删除列表。

---

## 2. 存储类型 (Storage Classes)

选择正确的存储类型是 SAA 考试的重点，主要基于访问频率和持久性需求。

### 2.1 频繁访问层 (Frequently Accessed)
</em>   <strong>S3 Standard</strong>：
    <em>   <strong>适用场景</strong>：通用型存储，适用于频繁访问的数据。
    </em>   <strong>可用性</strong>：99.99% 可用性，数据存储在 >=3 个可用区 (AZ)。
<em>   <strong>S3 Express One Zone</strong>：
    </em>   <strong>适用场景</strong>：高性能、延迟敏感型应用。
    <em>   <strong>性能</strong>：提供个位数毫秒级延迟（比 Standard 快 10 倍），成本降低 50%。
    </em>   <strong>架构</strong>：数据仅存储在 <strong>1 个 AZ</strong> (Directory Bucket)，持久性较低。

### 2.2 不频繁访问层 (Infrequently Accessed)
适用于长期存储但偶尔需要立即访问的数据。对象最小计费容量为 128 KB，最短存储期限为 30 天。

<em>   <strong>S3 Standard-IA (Infrequent Access)</strong>：
    </em>   <strong>架构</strong>：数据存储在 >=3 个 AZ。适用于需要高持久性但访问较少的数据。
<em>   <strong>S3 One Zone-IA</strong>：
    </em>   <strong>架构</strong>：数据仅存储在 <strong>1 个 AZ</strong>。
    <em>   <strong>风险</strong>：成本比 Standard-IA 低 20%，但如果是物理 AZ 损毁，数据将丢失。适用于可重建的数据或辅助备份。

### 2.3 智能分层 (Intelligent-Tiering)
</em>   <strong>机制</strong>：监控访问模式并在不同层级间自动移动对象，无检索费用，无管理开销。
<em>   <strong>层级流转</strong>：
    </em>   <strong>频繁层</strong> -> (30天无访问) -> <strong>不频繁访问层</strong>。
    <em>   -> (90天无访问) -> <strong>归档即时访问层 (Archive Instant Access)</strong>。
    </em>   <strong>可选异步归档</strong>：可配置在 90 天或 180 天后移动到 Deep Archive。
<em>   <strong>自动恢复</strong>：如果对象被访问，它会自动移回频繁访问层。

### 2.4 归档层 (Glacier)
用于长期归档，成本极低，但检索需要时间（除 Instant Retrieval 外）。

</em>   <strong>S3 Glacier Instant Retrieval</strong>：
    <em>   <strong>特点</strong>：毫秒级检索，适用于每季度访问一次的数据。节省存储成本但检索费用高于 Standard-IA。
</em>   <strong>S3 Glacier Flexible Retrieval</strong>：
    <em>   <strong>检索模式</strong>：
        </em>   Expedited (加急): 1-5 分钟。
        <em>   Standard (标准): 3-5 小时（默认）。
        </em>   Bulk (批量): 5-12 小时（最便宜/免费检索）。
    <em>   <strong>最短存储期</strong>：90 天。
</em>   <strong>S3 Glacier Deep Archive</strong>：
    <em>   <strong>特点</strong>：最低成本存储（替代磁带库）。
    </em>   <strong>检索时间</strong>：12 小时 (Standard) 或 48 小时 (Bulk)。
    <em>   <strong>最短存储期</strong>：180 天。

---

## 3. 存储桶管理与高级功能

### 3.1 版本控制 (Versioning)
</em>   <strong>作用</strong>：防止意外覆盖和删除。启用后，所有版本都会保留（包括删除标记 Delete Marker）。
<em>   <strong>删除逻辑</strong>：
    </em>   如果不指定版本 ID 进行 DELETE，S3 仅插入一个“删除标记”，对象看起来已删除（404错误），但可恢复。
    <em>   只有指定版本 ID 才能永久删除对象。
</em>   <strong>MFA Delete</strong>：要求在更改版本状态或永久删除对象版本时提供 MFA 令牌，增加安全性。

### 3.2 生命周期管理 (Lifecycle Management)
通过规则自动管理对象生命周期。
<em>   <strong>转换操作 (Transition)</strong>：将对象移动到更便宜的存储类（例如：Standard -> IA -> Glacier）。
    </em>   <em>限制</em>：转入 S3-IA 或 One Zone-IA 前必须在当前层存储至少 30 天。
<em>   <strong>过期操作 (Expiration)</strong>：定义对象何时过期并由 S3 自动删除。

### 3.3 对象锁定 (Object Lock)
</em>   <strong>WORM 模型</strong>：Write Once, Read Many。防止对象在固定时间内被删除或覆盖。
<em>   <strong>模式</strong>：
    </em>   <strong>Retention Period</strong>：在保留期内锁定。
    <em>   <strong>Legal Hold</strong>：无限期锁定，直到手动移除。
</em>   <em>注意</em>：仅适用于启用了版本控制的存储桶。

### 3.4 性能优化功能
<em>   <strong>S3 Transfer Acceleration</strong>：利用 CloudFront 的全球边缘节点加速远距离上传/下载。启用后会获得专用端点 <code>bucket.s3-accelerate.amazonaws.com</code>。
</em>   <strong>Multipart Upload</strong>：对于 >5 GB 的文件必须使用，建议 >100 MB 时使用，以提高上传稳定性和速度。
<em>   <strong>S3 Select</strong>：使用 SQL 语句仅检索对象（CSV/JSON/Parquet）中的部分数据，减少传输流量并提高性能。

---

## 4. 安全性与访问控制

### 4.1 访问控制策略
S3 提供多层访问控制，默认情况下所有资源都是私有的。
</em>   <strong>Bucket Policies (存储桶策略)</strong>：
    <em>   基于资源的策略，控制整个存储桶的访问。
    </em>   可基于 IP、VPC 端点、MFA 等条件允许或拒绝访问。
    <em>   </em>强制 SSL<em>：通过策略拒绝 <code>aws:SecureTransport: false</code> 的请求来强制使用 HTTPS。
</em>   <strong>ACLs (访问控制列表)</strong>：
    <em>   旧版功能，默认禁用（Bucket Owner Enforced）。建议使用 Bucket Policy 替代。
</em>   <strong>IAM Policies</strong>：基于身份的策略，授予用户或角色访问 S3 的权限。

### 4.2 加密 (Encryption)
支持静态和传输中加密。
<em>   <strong>服务端加密 (Server-Side Encryption)</strong>：
    </em>   <strong>SSE-S3</strong>：使用 S3 托管密钥，现为所有桶的默认加密方式。
    <em>   <strong>SSE-KMS</strong>：使用 AWS KMS 密钥，提供审计跟踪（CloudTrail 记录）和更细粒度的权限控制。
    </em>   <strong>SSE-C</strong>：客户提供密钥，AWS 进行加密/解密操作，AWS 不存储密钥。
<em>   <strong>客户端加密</strong>：数据在上传前由客户端加密。

### 4.3 阻止公有访问 (Block Public Access)
AWS 建议在账号或存储桶级别启用此功能，防止意外的数据泄露。

---

## 5. 复制与数据保护

### 5.1 跨区域复制 (CRR) & 同区域复制 (SRR)
</em>   <strong>前提条件</strong>：源桶和目标桶都必须 <strong>开启版本控制</strong>。
<em>   <strong>复制内容</strong>：配置后创建的新对象、元数据、对象标签、SSE-S3 和 SSE-KMS 加密的对象（需额外配置）。
</em>   <strong>不复制内容</strong>：配置前的存量对象、SSE-C 加密对象、源桶中本身也是复制品的副本（不通过链式复制）。
<em>   <strong>删除行为</strong>：如果不指定版本 ID 的删除（即添加删除标记），删除标记会被复制；但指定版本的永久删除 <strong>不会</strong> 被复制，以防恶意删除。
</em>   <strong>RTC (Replication Time Control)</strong>：提供 SLA，保证 15 分钟内完成复制。

### 5.2 数据完整性
<em>   <strong>Checksums</strong>：S3 在上传和检索时使用 CRC 校验和验证数据完整性，自动修复损坏数据。

---

## 6. S3 新特性与特殊功能

### 6.1 S3 Tables
</em>   <strong>用途</strong>：基于 Apache Iceberg 格式存储表格数据，专为分析工作负载设计。
<em>   <strong>优势</strong>：相比通用 S3 桶，提供更高的查询吞吐量和自动维护（压缩、快照管理）。
</em>   <strong>集成</strong>：可直接与 Athena, Redshift, QuickSight 集成。

### 6.2 静态网站托管 (Static Website Hosting)
<em>   <strong>端点区别</strong>：
    </em>   <strong>REST API 端点</strong>：支持 SSL，支持私有内容。
    <em>   <strong>网站端点</strong>：不支持 SSL（需配合 CloudFront 实现 HTTPS），仅支持公开可读内容，支持重定向和索引文档。
</em>   <strong>权限</strong>：必须配置 Bucket Policy 允许 <code>s3:GetObject</code> 权限给所有人。

### 6.3 S3 Storage Lens
<em>   <strong>功能</strong>：全组织级别的可见性工具，用于分析存储使用情况、活动趋势，并提供成本优化建议。

---

## 7. 计费与定价模型

S3 遵循“按使用量付费”原则，主要收费点如下：
1.  <strong>存储费</strong>：按对象大小、存储时长和存储类型（Storage Class）收费。
2.  <strong>请求费</strong>：GET, PUT, LIST 等 API 调用次数。
3.  <strong>检索费</strong>：针对 Standard-IA, One Zone-IA 和 Glacier 类别的读取收费。
4.  <strong>数据传输费</strong>：
    </em>   传入数据（Inbound）：免费。
    <em>   传出数据（Outbound）：收费（传至同一区域的 EC2 或 CloudFront 免费）。
5.  <strong>管理费</strong>：如清单（Inventory）、分析、对象标签等。

</em>   <strong>Requester Pays (请求者付费)</strong>：
    *   配置后，请求数据的人支付请求费和数据传输费，桶主仅支付存储费。
    *   请求者必须在请求头中包含 <code>x-amz-request-payer</code>。

---

## 8. 最佳实践总结 (Exam Tips)

> <strong>Note - 性能优化</strong>：对于高吞吐量需求，S3 请求支持并行化。使用 Multipart Upload 加速大文件上传；使用 Range GET 并行下载文件部分。

> <strong>Note - 安全性排查</strong>：若无法通过 HTTPS 访问，检查 Bucket Policy 是否包含 <code>aws:SecureTransport</code> 条件。

> <strong>Note - 合规性</strong>：若要求数据保留特定时长且不可删除，务必使用 Object Lock (Compliance Mode)。

> <strong>Note - 成本优化</strong>：对于访问模式不可预测的数据，首选 <strong>Intelligent-Tiering</strong>。

> <strong>Note - 跨账号访问</strong>：可以通过 Bucket Policy（资源策略）直接授予另一个 AWS 账号权限，或者使用 IAM Role 进行跨账号访问。