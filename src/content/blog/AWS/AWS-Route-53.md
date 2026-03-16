---
title: AWS Route 53
date: 2026-02-22 09:45:02
tags:
  - AWS
  - Networking
  - SAA
  - Route 53
  - DNS
categories:
  - AWS
---

# AWS Route 53

## 1. Route 53 基础与架构

Amazon Route 53 是一种高可用、可扩展的云域名系统 (DNS) Web 服务。它主要负责将域名（如 `www.example.com`）转换为 IP 地址（如 `192.0.2.1`）。

*   **核心概念**：
    *   **全球服务 (Global Service)**：Route 53 是全球性的，不局限于特定区域。
    *   **Hosted Zones (托管区域)**：
        *   **Public Hosted Zone (公有托管区域)**：管理面向互联网的域名的记录（如 `google.com`）。
        *   **Private Hosted Zone (私有托管区域)**：管理仅在 VPC 内部可见的域名的记录（如 `db.internal`）。使用私有托管区域时，必须在 VPC 设置中启用 `enableDnsHostnames` 和 `enableDnsSupport`。
    *   **Split-view DNS (分离视图)**：可以使用同名域名（如 `example.com`），在公网解析到公网 IP，在 VPC 内部解析到私有 IP（通过同时创建一个 Public 和一个 Private Hosted Zone 实现）。

---

## 2. 记录类型 (Record Types)

考试中最常混淆的是 Alias 和 CNAME 的区别，这是必须掌握的“决策断言”。

### 2.1 常见记录类型
*   **A Record**：将主机名映射到 **IPv4** 地址。
*   **AAAA Record**：将主机名映射到 **IPv6** 地址。
*   **CNAME Record (Canonical Name)**：将主机名映射到另一个主机名（非 IP）。
    *   *限制*：**不能** 用于 Zone Apex（顶级域名，即根域名，如 `example.com`），只能用于子域名（如 `www.example.com`）。
*   **NS Record (Name Server)**：指定托管区域的权威 DNS 服务器。
*   **SOA Record (Start of Authority)**：包含域名的管理信息（如 TTL、管理员邮箱）。

### 2.2 Alias Record (别名记录) —— AWS 专属神器
Alias 是 Route 53 对 DNS 功能的扩展，专门用于指向 AWS 资源。

| 特性 | **CNAME Record** | **Alias Record** |
| :--- | :--- | :--- |
| **指向目标** | 任何 DNS 记录 | 仅限 AWS 资源 (ELB, CloudFront, S3, API Gateway, VPC Endpoint) 或同一 Zone 内的其他记录 |
| **Zone Apex 支持** | **不支持** (不能用于根域名 `example.com`) | **支持** (这是使用 Alias 的核心原因) |
| **计费** | 收费 | 对指向 AWS 资源的 Alias 查询 **免费** |
| **性能** | 需二次解析 | 原生集成，性能更好，自动跟随资源 IP 变化 |

> **决策断言**：
> *   **当解析目标为 AWS 内部资源（如 ELB/S3 等），或需要在根域名（Zone Apex）上配置映射时**：请毫不犹豫地选择 **Alias Record**。
> *   **当解析目标为一般的第三方域名，且配置位置并非根域名时**：此时选择 **CNAME Record** 即可。

---

## 3. 路由策略 (Routing Policies)

这是 Route 53 的灵魂，也是 SAA 考试中 Scenario 题的重灾区。请务必记住每个策略的 **Trigger Words**。

### 3.1 Simple Routing (简单路由)
*   **机制**：将一个域名映射到一个或多个 IP。
*   **行为**：如果映射了多个 IP，Route 53 会随机返回所有 IP（轮询），客户端自行选择。
*   **限制**：**不支持健康检查 (Health Checks)**。如果某个 IP 挂了，Route 53 依然会返回它。

### 3.2 Weighted Routing (加权路由)
*   **机制**：按指定比例分发流量。
*   **场景**：**蓝绿部署 (Blue/Green Deployment)**、A/B 测试、逐步迁移流量（如 10% 去新版，90% 去旧版）。
*   **决策信号**：题目提到 "split traffic", "percentage", "testing new version"。

### 3.3 Latency-based Routing (延迟路由)
*   **机制**：根据用户到 AWS 区域的网络延迟（Latency），将用户路由到**响应最快**的区域。
*   **场景**：全球化应用，追求极致性能。
*   **决策信号**：题目提到 "best performance", "lowest latency", "user experience"。

### 3.4 Failover Routing (故障转移路由)
*   **机制**：配置主 (Primary) 和备 (Secondary) 资源。
*   **行为**：正常情况下流量走 Primary；当 Primary 健康检查失败时，自动切换到 Secondary。
*   **场景**：**灾难恢复 (DR)** (Active-Passive 模式)。
*   **注意**：必须配合 Health Checks 使用。

### 3.5 Geolocation Routing (地理位置路由)
*   **机制**：根据用户的**实际地理位置**（IP 来源国家/洲）来路由。
*   **场景**：
    *   **内容本地化**（给法国用户看法语页面）。
    *   **合规性/数据驻留**（德国用户的数据必须留在德国服务器，不能流出）。
    *   **分发限制**（版权限制，某些内容仅特定国家可见）。
*   **决策信号**：题目提到 "compliance", "data sovereignty", "specific country/region"。

### 3.6 Geoproximity Routing (地理邻近路由)
*   **机制**：基于资源和用户的地理位置，但引入了 **Bias (偏置值)**。
*   **特色**：可以通过调整 Bias 来扩大或缩小某个区域的覆盖范围（吸走邻近区域的流量）。
*   **场景**：需要人为干预地理覆盖范围，必须通过 **Traffic Flow** (可视化编辑器) 来配置。

### 3.7 Multivalue Answer Routing (多值应答路由)
*   **机制**：类似于 Simple Routing，但**支持健康检查**。
*   **行为**：返回多达 8 个**健康**的记录。
*   **本质**：客户端侧的负载均衡（Client-side Load Balancing）。

---

## 4. 健康检查 (Health Checks)

Route 53 不仅做解析，还是监控服务。

*   **监控对象**：
    1.  **Endpoint**：监控特定 IP 或域名的健康状况（HTTP/HTTPS/TCP）。
    2.  **CloudWatch Alarm**：基于 CloudWatch 报警状态（如 DynamoDB 节流）来判断健康。
    3.  **其他 Health Checks**：计算即算健康检查（Calculated Health Checks），如“3 个子检查中有 2 个通过即算通过”。
*   **工作原理**：全球多个健康检查器向目标发送请求。如果超过阈值（如连续 3 次超时）未响应，则标记为 Unhealthy，Route 53 停止向其发送流量（Failover）。
*   **私有资源监控**：如果资源在 VPC 私有子网，Route 53 无法直接访问。解决方法是创建一个 CloudWatch Alarm 监控该资源，然后 Route 53 监控该 Alarm。

---

## 5. 混合云 DNS (Resolver)

解决本地数据中心 (On-Premises) 和 AWS VPC 之间 DNS 解析互通的问题。

*   **Route 53 Resolver (原 .2 DNS)**：VPC 内部默认的 DNS 服务器。
*   **Outbound Endpoint (出站端点)**：
    *   **场景**：AWS 资源想要解析本地数据中心的域名（如 `corp.local`）。
    *   **流向**：AWS -> Direct Connect/VPN -> On-Prem DNS。
*   **Inbound Endpoint (入站端点)**：
    *   **场景**：本地服务器想要解析 AWS VPC 内部的私有域名。
    *   **流向**：On-Prem -> Direct Connect/VPN -> Inbound Endpoint -> AWS DNS。

---

## 6. 安全性与高级功能

*   **DNSSEC (域名系统安全扩展)**：
    *   **作用**：防止 DNS 欺骗（DNS Spoofing）和中间人攻击。确保解析结果确实来自权威源且未被篡改。
    *   **支持**：Route 53 支持域名注册和托管区域的 DNSSEC 签名。
*   **Route 53 Resolver DNS Firewall**：
    *   **作用**：在 VPC 级别过滤出站 DNS 查询。
    *   **场景**：防止 VPC 内的受损实例向恶意域名（C&C 服务器）发送请求（DNS Exfiltration）。支持允许列表 (Allowlist) 和拒绝列表 (Blocklist)。

---

## 7. 最佳实践总结 (Exam Tips)

> **Note - 高可用架构**：
> *   **Active-Active**：使用 Weighted 或 Latency 路由，所有资源都承载流量。
> *   **Active-Passive**：使用 Failover 路由，备用资源平时闲置（或作为只读）。

> **Note - 域名注册 vs DNS 解析**：
> Route 53 既是注册商 (Registrar) 也是解析商。你可以只买域名不用它的解析，也可以只用它的解析而在别处买域名。

> **Note - 决策逻辑复习**：
> 在遇到不同的实际场景时，可以通过以下线索快速匹配合适的策略：
> *   **当业务追求极致性能或最低延迟时**（如提到 "Latency" / "Performance" 等词汇）：果断选择 **Latency Routing**。
> *   **当业务受限于合规性、版权要求或数据驻留法规时**（如涉及 "Legal" / "Compliance" / "Data Residency" 等）：使用 **Geolocation Routing** 是最恰当的方案。
> *   **当需要通过偏置值来人为转移或倾斜部分区域的流量覆盖范围时**（如存在 "Shift traffic" / "Bias" 等动作）：应当考虑 **Geoproximity Routing**。
> *   **当需要对普通的 TCP/UDP 流量做简单负载均衡，但由于某些原因没有使用 ELB 系统时**：可以配置 **Multivalue Answer Routing**，让 Route 53 充当带有基础健康检查功能的客户端负载器。
> *   **当配置目标位于根域名（Zone Apex）时**：必须使用 **Alias Record**，直接排除掉 CNAME 选项。