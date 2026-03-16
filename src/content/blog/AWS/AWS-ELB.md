---
title: AWS ELB
date: 2026-01-21 17:55:39
tags:
  - AWS
  - ELB
  - Load Balancing
  - Network
categories:
  - AWS
---
# AWS Elastic Load Balancing (ELB)

## 第一章：ELB 核心概念
<strong>Elastic Load Balancing (ELB)</strong> 是一种高度可用且可扩展的服务，它能自动将传入的应用程序或网络流量分发到多个目标（如 EC2 实例、容器 ECS、Lambda 函数和 IP 地址）。

### 1. 核心运行逻辑
<em> <strong>多可用区部署</strong>：创建负载均衡器时，必须从至少两个可用区（AZ）中各指定一个公共子网。这确保了当某个 AZ 发生故障时，流量可以自动导向其他健康的 AZ。
</em> <strong>健康检查</strong>：ELB 持续监控注册目标的健康状况，并仅将请求路由到健康的实例。
<em> <strong>删除保护</strong>：建议开启此功能，防止负载均衡器被意外删除。
</em> <strong>SSL 卸载 (SSL Offloading)</strong>：ELB 可以终止来自客户端的 SSL 连接，并以非加密形式将请求发送到后端，从而减轻后端服务器的计算压力。

### 2. 基础组件与目标类型
<em> <strong>Listener (监听器)</strong>：检查连接请求的进程，配置前端要监听的协议和端口。
</em> <strong>Target Group (目标组)</strong>：后端资源的逻辑分组。ELB 将请求路由到目标组，而不是直接路由到单一实例。
<em> <strong>目标类型 (Target Types)</strong>：
    </em> <strong>Instance ID</strong>：传统的 EC2 实例。
    <em> <strong>IP Address</strong>：可以是 VPC 内的私有 IP，也可以是<strong>本地数据中心</strong>的 IP（通过 VPN/DX 连接，实现混合云负载均衡）。
    </em> <strong>Lambda Function</strong>：仅 ALB 支持。
    <em> <strong>ALB</strong>：NLB 的目标组可以指向一个 ALB（即 <code>NLB -> ALB -> EC2</code> 架构），用于同时获得静态 IP 和 Layer 7 路由功能。

---

## 第二章：三种核心负载均衡器类型对比

### 1. Application Load Balancer (ALB) —— 应用层 (L7)
ALB 工作在 OSI 模型的第七层，专门处理 HTTP 和 HTTPS 流量。

</em> <strong>智能路由规则</strong>：
    <em> <strong>基于路径的路由</strong>：例如将 <code>/api</code> 发往一组服务器，将 <code>/images</code> 发往另一组。
    </em> <strong>基于主机名的路由</strong>：例如根据域名 <code>example.com</code> 或 <code>test.com</code> 进行分发。
    <em> <strong>基于查询字符串/HTTP 标头/HTTP 方法的路由</strong>。
</em> <strong>高级功能</strong>：
    <em> <strong>支持重定向</strong>：可将 HTTP 请求自动重定向到 HTTPS。
    </em> <strong>自定义响应</strong>：可以直接返回固定的 HTML 页面或响应（如 404/200，或 503 维护页面），无需转发给后端。
    <em> <strong>Lambda 集成</strong>：可以将 Lambda 函数作为目标组。
    </em> <strong>gRPC 支持</strong>：适用于高性能微服务通信。
    <em> <strong>WebSocket & HTTP/2</strong>：原生支持。
    </em> <strong>身份验证</strong>：支持 OIDC 兼容的身份提供商和 Amazon Cognito。
    <em> <strong>双栈支持</strong>：支持 IPv4 和 IPv6 目标。

### 2. Network Load Balancer (NLB) —— 传输层 (L4)
NLB 工作在第四层，专门处理 TCP、UDP 和 TLS 流量，适合对性能要求极高的场景。

</em> <strong>极致性能</strong>：能够处理每秒数百万次的突发请求，延迟极低。
<em> <strong>静态 IP 地址</strong>：每个启用的可用区都会获得一个静态 IP，并且可以关联弹性 IP (EIP)。这是需要防火墙白名单场景的首选。
</em> <strong>源 IP 保留</strong>：对于实例类型目标，NLB 可以直接透传客户端的原始 IP 到后端。
<em> <strong>ALB 作为目标</strong>：NLB 可以直接将流量转发到 ALB（仅限 TCP 监听器）。
</em> <strong>QUIC 协议支持</strong>：适用于超低延迟的流媒体和通信。
<em> <strong>适用场景</strong>：游戏服务器、实时流媒体、即时通讯、需要静态入口 IP 的应用。

### 3. Gateway Load Balancer (GWLB) —— 网络层 (L3)
GWLB 用于在 VPC 前端部署、扩展和管理第三方虚拟防火墙、入侵检测系统 (IDS/IPS) 等设备。

</em> <strong>透明代理</strong>：在网络层运行，流量透明地传递给注册的安全设备，不执行 SSL 卸载等操作。
<em> <strong>封装协议</strong>：使用 <strong>GENEVE</strong> 协议 (端口 6081) 跨网络边界封装和传递流量给后端设备。
</em> <strong>GWLB 终端节点</strong>：通过终端节点创建安全、低延迟的连接。

---

## 第三章：关键高级特性深度解析

### 1. 跨可用区负载均衡 (Cross-Zone Load Balancing)
<em> <strong>机制</strong>：开启后，负载均衡器会将其流量均匀分发到所有已启用的 AZ 中的<strong>所有</strong>注册目标。如果不开启，每个负载均衡器节点只分配给自己所在 AZ 的目标（可能导致 AZ 间节点数量不对称时，部分节点负载极高）。
</em> <strong>默认状态</strong>：ALB 默认启用（不收跨区流量费用）；NLB 默认禁用（开启后跨区流量收费）。

### 2. 会话保持 (Sticky Sessions / Session Affinity)
<em> <strong>功能</strong>：将同一用户的多次请求始终导向同一个后端目标。
</em> <strong>ALB 实现</strong>：通过负载均衡器生成的 Cookie 或应用程序自定义的 Cookie 来实现，适用于有状态应用。
<em> <strong>NLB 实现</strong>：基于源 IP 地址。

### 3. 连接排空 / 注销延迟 (Connection Draining / Deregistration Delay)
</em> <strong>功能</strong>：当某个实例进行缩容、被注销或健康检查失败时，ELB 会停止向其发送新请求，但允许现有的在途请求在超时时间内完成处理，防止切断用户正在进行的事务。
<em> <strong>默认时间</strong>：默认 300 秒。

### 4. 慢启动模式 (Slow Start)
</em> <strong>功能</strong>：给新加入的目标组的实例一段时间进行“预热”，在这段时间内，发送给它的请求量会逐渐增加。

### 5. 获取真实客户端 IP
<em> <strong>ALB</strong>：由于经过 L7 代理，后端看到的“源 IP”是 ALB 的私有 IP。真实的客户端 IP 存储在 HTTP Header <code>X-Forwarded-For</code> 中，后端应用必须解析该 Header 才能获取真实用户 IP。
</em> <strong>NLB</strong>：可以配置开启 <strong>Preserve Client IP (源 IP 保留)</strong> 属性，直接将客户端 IP 透传到后端，无需解析 Header。

---

## 第四章：健康检查状态全解析
目标在负载均衡器中会有以下几种状态：
<em> <strong>Initial</strong>：正在注册目标或健康检查正在进行中。
</em> <strong>Healthy</strong>：目标健康，可以接收流量。
<em> <strong>Unhealthy</strong>：目标未响应健康检查或检查失败。
</em> <strong>Unused</strong>：目标未注册到目标组，或者目标组未关联到监听器规则。
<em> <strong>Draining</strong>：目标正在注销，正在进行连接排空处理。

---

## 第五章：安全与合规

</em> <strong>TLS 1.3 支持</strong>：ALB 和 NLB 均支持最新的 TLS 1.3 协议。
<em> <strong>SNI (Server Name Indication)</strong>：允许一个监听器托管多个 SSL 证书，服务于多个域名。ALB 和 NLB 都支持。
</em> <strong>WAF 集成</strong>：可以直接挂载 AWS WAF 防御 Web 攻击（仅 ALB 支持。如果使用 NLB 又需要 WAF，通常需要在前端加 CloudFront）。
<em> <strong>身份验证</strong>：ALB 支持 JWT (JSON Web Token) 验证和相互 TLS (mTLS) 身份验证。
</em> <strong>安全组</strong>：可以直接将安全组关联到 ALB 和 NLB，以过滤进出负载均衡器的流量。
<em> <strong>证书管理</strong>：最佳实践是在 ACM (AWS Certificate Manager) 中集中管理 SSL 证书并绑定到 ELB 监听器上，而不是在每台后端 EC2 上配置证书。

---

## 第六章：架构师对比与决策速查

| 特性 | Application (ALB) | Network (NLB) | Gateway (GWLB) |
| :--- | :--- | :--- | :--- |
| <strong>层级</strong> | Layer 7 | Layer 4 | Layer 3 |
| <strong>协议</strong> | HTTP, HTTPS, gRPC | TCP, UDP, TLS | IP |
| <strong>性能</strong> | 高 (秒级扩展) | 极致 (亚秒级扩展) | 高 |
| <strong>固定 IP</strong> | 不支持 (仅 DNS) | 支持 (静态 IP / EIP) | 不支持 |
| <strong>路由</strong> | 路径、主机、查询参数 | 仅监听器端口/协议 | 不支持 |
| <strong>身份验证</strong> | 支持 | 不支持 | 不支持 |
| <strong>SSL 卸载</strong> | 支持 | 支持 | 不支持 |

<blockquote class="note"><strong>架构选型速查表</strong>
</em> 满足 <strong>[HTTP/HTTPS]</strong> + <strong>[Layer 7 routing / URL path]</strong> 要求 $\rightarrow$ <strong>ALB</strong>。
<em> 满足 <strong>[千万级并发请求]</strong> 或 <strong>[超低延迟]</strong> 或 <strong>[必须静态 IP]</strong> $\rightarrow$ <strong>NLB</strong>。
</em> 处理 <strong>[第三方防火墙 / IPS / IDS]</strong> 等安全设备 $\rightarrow$ <strong>GWLB</strong>。
<em> 适合 <strong>[微服务 / 容器组]</strong> 与 <strong>[动态端口映射]</strong> $\rightarrow$ <strong>ALB</strong>。
</blockquote>

---

## 第七章：监控与日志
</em> <strong>CloudWatch 指标</strong>：实时获取请求计数、延迟、错误率等数据。
<em> <strong>访问日志 (Access Logs)</strong>：详细记录发往负载均衡器的每一个请求（例如客户端 IP、请求路径等），日志会<strong>存储在 S3</strong> 桶中。默认是关闭的，需要手动开启。
</em> <strong>VPC Flow Logs</strong>：监控进入 NLB 的网络流数据。
<em> <strong>CloudTrail</strong>：审计所有对 ELB API 的调用。

## 第八章：计费逻辑
</em> <strong>ALB/NLB</strong>：按小时计费，并按使用的 <strong>LCU</strong>（负载均衡器容量单位）计费。
<em> <strong>GWLB</strong>：按小时计费，并按使用的 <strong>GLCU</strong> 计费。
</em> <strong>CLB</strong>：按小时计费，并按数据传输量（GB）计费。

---

## 第九章：常见故障排查 (Troubleshooting)

掌握 ELB 返回的经典 HTTP 状态码对于排查异常至关重要：

<em> <strong><code>502 Bad Gateway</code> (错误网关)</strong>：通常是 ELB 无法连接到后端实例。原因可能是后端服务挂掉不响应，或后端返回了格式错误的响应。
</em> <strong><code>503 Service Unavailable</code> (服务不可用)</strong>：目标组里没有任何健康的目标（All Targets Unhealthy），或者所有的后端都处于满载状态导致无法处理新请求。
<ul><li><strong><code>504 Gateway Timeout</code> (网关超时)</strong>：后端实例处理请求的时间过长（超过了 ELB 的 Idle Timeout 配置），或是网络连接超时（例如后端的 Security Group 拒绝了来自 ELB 的流量）。</li></ul>