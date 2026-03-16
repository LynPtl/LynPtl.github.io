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

Amazon Route 53 是一种高可用、可扩展的云域名系统 (DNS) Web 服务。它主要负责将域名（如 <code>www.example.com</code>）转换为 IP 地址（如 <code>192.0.2.1</code>）。

<em>   <strong>核心概念</strong>：
    </em>   <strong>全球服务 (Global Service)</strong>：Route 53 是全球性的，不局限于特定区域。
    <em>   <strong>Hosted Zones (托管区域)</strong>：
        </em>   <strong>Public Hosted Zone (公有托管区域)</strong>：管理面向互联网的域名的记录（如 <code>google.com</code>）。
        <em>   <strong>Private Hosted Zone (私有托管区域)</strong>：管理仅在 VPC 内部可见的域名的记录（如 <code>db.internal</code>）。使用私有托管区域时，必须在 VPC 设置中启用 <code>enableDnsHostnames</code> 和 <code>enableDnsSupport</code>。
    </em>   <strong>Split-view DNS (分离视图)</strong>：可以使用同名域名（如 <code>example.com</code>），在公网解析到公网 IP，在 VPC 内部解析到私有 IP（通过同时创建一个 Public 和一个 Private Hosted Zone 实现）。

---

## 2. 记录类型 (Record Types)

考试中最常混淆的是 Alias 和 CNAME 的区别，这是必须掌握的“决策断言”。

### 2.1 常见记录类型
<em>   <strong>A Record</strong>：将主机名映射到 <strong>IPv4</strong> 地址。
</em>   <strong>AAAA Record</strong>：将主机名映射到 <strong>IPv6</strong> 地址。
<em>   <strong>CNAME Record (Canonical Name)</strong>：将主机名映射到另一个主机名（非 IP）。
    </em>   <em>限制</em>：<strong>不能</strong> 用于 Zone Apex（顶级域名，即根域名，如 <code>example.com</code>），只能用于子域名（如 <code>www.example.com</code>）。
<em>   <strong>NS Record (Name Server)</strong>：指定托管区域的权威 DNS 服务器。
</em>   <strong>SOA Record (Start of Authority)</strong>：包含域名的管理信息（如 TTL、管理员邮箱）。

### 2.2 Alias Record (别名记录) —— AWS 专属神器
Alias 是 Route 53 对 DNS 功能的扩展，专门用于指向 AWS 资源。

| 特性 | <strong>CNAME Record</strong> | <strong>Alias Record</strong> |
| :--- | :--- | :--- |
| <strong>指向目标</strong> | 任何 DNS 记录 | 仅限 AWS 资源 (ELB, CloudFront, S3, API Gateway, VPC Endpoint) 或同一 Zone 内的其他记录 |
| <strong>Zone Apex 支持</strong> | <strong>不支持</strong> (不能用于根域名 <code>example.com</code>) | <strong>支持</strong> (这是使用 Alias 的核心原因) |
| <strong>计费</strong> | 收费 | 对指向 AWS 资源的 Alias 查询 <strong>免费</strong> |
| <strong>性能</strong> | 需二次解析 | 原生集成，性能更好，自动跟随资源 IP 变化 |

> <strong>决策断言</strong>：
> <em>   <strong>当解析目标为 AWS 内部资源（如 ELB/S3 等），或需要在根域名（Zone Apex）上配置映射时</strong>：请毫不犹豫地选择 <strong>Alias Record</strong>。
> </em>   <strong>当解析目标为一般的第三方域名，且配置位置并非根域名时</strong>：此时选择 <strong>CNAME Record</strong> 即可。

---

## 3. 路由策略 (Routing Policies)

这是 Route 53 的灵魂，也是 SAA 考试中 Scenario 题的重灾区。请务必记住每个策略的 <strong>Trigger Words</strong>。

### 3.1 Simple Routing (简单路由)
<em>   <strong>机制</strong>：将一个域名映射到一个或多个 IP。
</em>   <strong>行为</strong>：如果映射了多个 IP，Route 53 会随机返回所有 IP（轮询），客户端自行选择。
<em>   <strong>限制</strong>：<strong>不支持健康检查 (Health Checks)</strong>。如果某个 IP 挂了，Route 53 依然会返回它。

### 3.2 Weighted Routing (加权路由)
</em>   <strong>机制</strong>：按指定比例分发流量。
<em>   <strong>场景</strong>：<strong>蓝绿部署 (Blue/Green Deployment)</strong>、A/B 测试、逐步迁移流量（如 10% 去新版，90% 去旧版）。
</em>   <strong>决策信号</strong>：题目提到 "split traffic", "percentage", "testing new version"。

### 3.3 Latency-based Routing (延迟路由)
<em>   <strong>机制</strong>：根据用户到 AWS 区域的网络延迟（Latency），将用户路由到<strong>响应最快</strong>的区域。
</em>   <strong>场景</strong>：全球化应用，追求极致性能。
<em>   <strong>决策信号</strong>：题目提到 "best performance", "lowest latency", "user experience"。

### 3.4 Failover Routing (故障转移路由)
</em>   <strong>机制</strong>：配置主 (Primary) 和备 (Secondary) 资源。
<em>   <strong>行为</strong>：正常情况下流量走 Primary；当 Primary 健康检查失败时，自动切换到 Secondary。
</em>   <strong>场景</strong>：<strong>灾难恢复 (DR)</strong> (Active-Passive 模式)。
<em>   <strong>注意</strong>：必须配合 Health Checks 使用。

### 3.5 Geolocation Routing (地理位置路由)
</em>   <strong>机制</strong>：根据用户的<strong>实际地理位置</strong>（IP 来源国家/洲）来路由。
<em>   <strong>场景</strong>：
    </em>   <strong>内容本地化</strong>（给法国用户看法语页面）。
    <em>   <strong>合规性/数据驻留</strong>（德国用户的数据必须留在德国服务器，不能流出）。
    </em>   <strong>分发限制</strong>（版权限制，某些内容仅特定国家可见）。
<em>   <strong>决策信号</strong>：题目提到 "compliance", "data sovereignty", "specific country/region"。

### 3.6 Geoproximity Routing (地理邻近路由)
</em>   <strong>机制</strong>：基于资源和用户的地理位置，但引入了 <strong>Bias (偏置值)</strong>。
<em>   <strong>特色</strong>：可以通过调整 Bias 来扩大或缩小某个区域的覆盖范围（吸走邻近区域的流量）。
</em>   <strong>场景</strong>：需要人为干预地理覆盖范围，必须通过 <strong>Traffic Flow</strong> (可视化编辑器) 来配置。

### 3.7 Multivalue Answer Routing (多值应答路由)
<em>   <strong>机制</strong>：类似于 Simple Routing，但<strong>支持健康检查</strong>。
</em>   <strong>行为</strong>：返回多达 8 个<strong>健康</strong>的记录。
<em>   <strong>本质</strong>：客户端侧的负载均衡（Client-side Load Balancing）。

---

## 4. 健康检查 (Health Checks)

Route 53 不仅做解析，还是监控服务。

</em>   <strong>监控对象</strong>：
    1.  <strong>Endpoint</strong>：监控特定 IP 或域名的健康状况（HTTP/HTTPS/TCP）。
    2.  <strong>CloudWatch Alarm</strong>：基于 CloudWatch 报警状态（如 DynamoDB 节流）来判断健康。
    3.  <strong>其他 Health Checks</strong>：计算即算健康检查（Calculated Health Checks），如“3 个子检查中有 2 个通过即算通过”。
<em>   <strong>工作原理</strong>：全球多个健康检查器向目标发送请求。如果超过阈值（如连续 3 次超时）未响应，则标记为 Unhealthy，Route 53 停止向其发送流量（Failover）。
</em>   <strong>私有资源监控</strong>：如果资源在 VPC 私有子网，Route 53 无法直接访问。解决方法是创建一个 CloudWatch Alarm 监控该资源，然后 Route 53 监控该 Alarm。

---

## 5. 混合云 DNS (Resolver)

解决本地数据中心 (On-Premises) 和 AWS VPC 之间 DNS 解析互通的问题。

<em>   <strong>Route 53 Resolver (原 .2 DNS)</strong>：VPC 内部默认的 DNS 服务器。
</em>   <strong>Outbound Endpoint (出站端点)</strong>：
    <em>   <strong>场景</strong>：AWS 资源想要解析本地数据中心的域名（如 <code>corp.local</code>）。
    </em>   <strong>流向</strong>：AWS -> Direct Connect/VPN -> On-Prem DNS。
<em>   <strong>Inbound Endpoint (入站端点)</strong>：
    </em>   <strong>场景</strong>：本地服务器想要解析 AWS VPC 内部的私有域名。
    <em>   <strong>流向</strong>：On-Prem -> Direct Connect/VPN -> Inbound Endpoint -> AWS DNS。

---

## 6. 安全性与高级功能

</em>   <strong>DNSSEC (域名系统安全扩展)</strong>：
    <em>   <strong>作用</strong>：防止 DNS 欺骗（DNS Spoofing）和中间人攻击。确保解析结果确实来自权威源且未被篡改。
    </em>   <strong>支持</strong>：Route 53 支持域名注册和托管区域的 DNSSEC 签名。
<em>   <strong>Route 53 Resolver DNS Firewall</strong>：
    </em>   <strong>作用</strong>：在 VPC 级别过滤出站 DNS 查询。
    <em>   <strong>场景</strong>：防止 VPC 内的受损实例向恶意域名（C&C 服务器）发送请求（DNS Exfiltration）。支持允许列表 (Allowlist) 和拒绝列表 (Blocklist)。

---

## 7. 最佳实践总结 (Exam Tips)

> <strong>Note - 高可用架构</strong>：
> </em>   <strong>Active-Active</strong>：使用 Weighted 或 Latency 路由，所有资源都承载流量。
> <em>   <strong>Active-Passive</strong>：使用 Failover 路由，备用资源平时闲置（或作为只读）。

> <strong>Note - 域名注册 vs DNS 解析</strong>：
> Route 53 既是注册商 (Registrar) 也是解析商。你可以只买域名不用它的解析，也可以只用它的解析而在别处买域名。

> <strong>Note - 决策逻辑复习</strong>：
> 在遇到不同的实际场景时，可以通过以下线索快速匹配合适的策略：
> </em>   <strong>当业务追求极致性能或最低延迟时</strong>（如提到 "Latency" / "Performance" 等词汇）：果断选择 <strong>Latency Routing</strong>。
> <em>   <strong>当业务受限于合规性、版权要求或数据驻留法规时</strong>（如涉及 "Legal" / "Compliance" / "Data Residency" 等）：使用 <strong>Geolocation Routing</strong> 是最恰当的方案。
> </em>   <strong>当需要通过偏置值来人为转移或倾斜部分区域的流量覆盖范围时</strong>（如存在 "Shift traffic" / "Bias" 等动作）：应当考虑 <strong>Geoproximity Routing</strong>。
> <em>   <strong>当需要对普通的 TCP/UDP 流量做简单负载均衡，但由于某些原因没有使用 ELB 系统时</strong>：可以配置 <strong>Multivalue Answer Routing</strong>，让 Route 53 充当带有基础健康检查功能的客户端负载器。
> </em>   <strong>当配置目标位于根域名（Zone Apex）时</strong>：必须使用 <strong>Alias Record</strong>，直接排除掉 CNAME 选项。