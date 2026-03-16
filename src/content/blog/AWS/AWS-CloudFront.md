---
title: AWS CloudFront
date: 2026-02-16 00:14:25
tags:
  - AWS
  - Networking
  - SAA
  - CloudFront
  - CDN
categories:
  - AWS
---

# AWS CloudFront Deep Dive

## 1. CloudFront 基础与架构 (CloudFront Basics & Architecture)

Amazon CloudFront 是 AWS 的全球内容分发网络 (CDN)，旨在通过全球边缘节点网络加速静态、动态和流媒体 Web 内容的分发。

### 1.1 核心组件
*   **Edge Locations (边缘节点)**：分布在全球的站点，最接近最终用户。CloudFront 在这里缓存内容以降低延迟。
*   **Regional Edge Caches (区域边缘缓存)**：位于边缘节点和源站之间。当边缘节点没有缓存数据时，会向区域缓存请求，而不是直接回源站，进一步减少源站负载。
*   **Distribution (分配)**：配置 CloudFront 的单位，定义了源站、缓存行为等。

### 1.2 支持的源站 (Origins)
*   **S3 Bucket**：用于分发静态文件。
*   **MediaPackage / MediaStore**：用于视频流媒体。
*   **ELB (Application Load Balancer)**：用于动态内容。
*   **EC2 实例**：直接作为 HTTP 服务器。
*   **自定义 HTTP 后端**：任何非 AWS 的本地服务器。

---

## 2. 缓存行为与性能 (Caching & Performance)

控制 CloudFront 如何缓存和分发内容是考试重点。

### 2.1 缓存控制
*   **TTL (Time to Live)**：
    *   默认缓存时间为 **24 小时**。
    *   通过配置 Cache Behaviors 或源站发送的 Cache-Control 标头来修改对象的 TTL。
*   **缓存失效 (Invalidation)**：
    *   如果在 TTL 到期前需要更新内容（如紧急修复），可以提交 Invalidation 请求。
    *   *注意*：失效操作可能产生费用，且不如使用带版本号的文件名（Versioning）高效。
*   **压缩**：支持对支持的文件类型自动进行 Gzip 压缩，减少传输数据量。

### 2.2 缓存键 (Cache Key)
*   **Query Strings & Headers**：默认情况下，CloudFront 可能忽略查询字符串。你可以配置 CloudFront 根据特定的 Query String、Headers 或 Cookies 来缓存不同版本的对象（例如，根据 `Language` header 缓存不同语言的页面）。

### 2.3 高可用性 (Origin Groups)
*   **源站故障转移 (Origin Failover)**：
    *   创建 **Origin Groups**，包含一个主源站和一个辅助源站。
    *   如果主源站返回特定错误代码（如 500, 502, 503, 504），CloudFront 会自动将请求路由到辅助源站。

---

## 3. 安全性 (Security)

CloudFront 是保护 Web 应用的第一道防线。

### 3.1 HTTPS 与 SSL/TLS
*   **Viewer Protocol Policy (查看器协议策略)**：控制客户端到 CloudFront 的连接。
    *   **HTTP and HTTPS**：允许两者。
    *   **Redirect HTTP to HTTPS**：强制重定向（推荐）。
    *   **HTTPS Only**：只允许加密连接。
*   **Origin Protocol Policy (源站协议策略)**：控制 CloudFront 到源站的连接。
    *   **HTTP Only**。
    *   **HTTPS Only**。
    *   **Match Viewer**：如果客户端用 HTTPS，CloudFront 回源也用 HTTPS。
*   **自定义 SSL**：支持上传自定义证书（ACM 或 IAM）以支持自定义域名（如 `www.example.com`）。
    *   **SNI (Server Name Indication)**：允许在同一个 IP 上通过主机名区分多个 SSL 证书，是现代浏览器的标准，且**免费**。
    *   **Dedicated IP**：为支持不支持 SNI 的旧客户端，需要支付高额费用（每 IP 每月 $600）。

### 3.2 访问控制
*   **OAC (Origin Access Control) / OAI (Origin Access Identity)**：
    *   **场景**：限制用户只能通过 CloudFront 访问 S3，而不能直接访问 S3 URL。
    *   **机制**：创建一个特殊的 CloudFront 身份，修改 S3 Bucket Policy 仅允许该身份访问。**OAC** 是新一代推荐标准，支持更高级的安全特性（如 SSE-KMS）；OAI 是旧标准。
*   **Signed URLs vs Signed Cookies**：
    *   用于分发付费或私有内容。
    *   **Signed URLs**：适用于单个文件（如安装包下载）。
    *   **Signed Cookies**：适用于多个文件（如访问整个会员网站区域、流媒体 HLS 分片）。
*   **Geo-restriction (地理限制)**：
    *   基于白名单（Allowlist）或黑名单（Blocklist）限制特定国家的访问。

### 3.3 防护集成
*   **AWS WAF**：直接集成在 CloudFront 上，防御应用层攻击（如 SQL 注入、XSS）。
*   **AWS Shield Standard**：默认开启，防御 DDoS 攻击。

---

## 4. 边缘计算 (Edge Compute)

在离用户更近的地方运行代码，无需管理服务器。

| 特性 | **CloudFront Functions** | **Lambda@Edge** |
| :--- | :--- | :--- |
| **运行时** | 仅 JavaScript (轻量级) | Node.js, Python (完整运行时) |
| **位置** | 边缘节点 (Edge Locations) - **最近** | 区域边缘缓存 (Regional Edge Caches) |
| **启动速度** | 亚毫秒级 | 毫秒级 |
| **网络访问** | 不支持 (不能访问互联网/AWS 服务) | 支持 (可访问 DynamoDB、S3 等) |
| **请求体访问**| 否 (仅能处理 Header/URL) | 是 (可处理 Body) |
| **适用场景** | URL 重写、Header 操作、JWT 验证、简单的重定向。 | 复杂的逻辑、服务器端渲染 (SSR)、图像调整大小、需要访问外部服务的鉴权。 |

---

## 5. 高级功能与报告 (Advanced Features & Reports)

### 5.1 价格等级 (Price Class)
为了节省成本，可以选择不使用全球所有节点。
*   **Price Class All**：使用全球所有节点（性能最好，成本最高）。
*   **Price Class 200**：排除最昂贵的区域（如南美、澳大利亚）。
*   **Price Class 100**：仅使用美国、加拿大、欧洲节点（成本最低）。

### 5.2 监控与日志
*   **Standard Access Logs**：记录详细请求信息，延迟存入 S3。
*   **Real-time Logs**：通过 Kinesis Data Streams 实时获取日志。
*   **Reports**：控制台提供缓存统计、热门对象、查看器数据等报告。

---

## 6. 最佳实践总结 (Exam Tips)

> **Note - 私有内容分发**：
> *   如果题目要求通过 CloudFront 安全地分发 S3 中的文件，答案通常是：配置 **OAC/OAI** 限制 S3 访问 + 使用 **Signed URLs/Cookies** 控制用户权限。

> **Note - 性能优化**：
> *   如果需要上传大文件，不要只想到 S3 Transfer Acceleration，**CloudFront 也支持上传**（PUT/POST）。
> *   静态内容 + 动态内容混合：使用 **Cache Behaviors**（缓存行为）。根据路径模式（如 `*.jpg` 去 S3，`/api/*` 去 ELB）将请求路由到不同的源站。

> **Note - 证书管理**：
> *   如果在 CloudFront 上使用自定义域名，SSL 证书必须请求/导入到 **US East (N. Virginia) us-east-1** 区域的 ACM 中，否则 CloudFront 无法识别。

> **Note - SNI vs Dedicated IP**：
> *   题目若提到“支持旧版浏览器/不支持 SNI 的客户端”，才选 Dedicated IP（贵）。否则默认选 SNI。

> **Note - HTTP 错误处理**：
> *   可以配置 **Custom Error Pages**，将源站返回的 4xx/5xx 错误替换为自定义的 HTML 页面（如将 S3 的 403 Access Denied 替换为友好的“请注册”页面），并返回 200 状态码。