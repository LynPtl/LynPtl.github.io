---
title: AWS VPC
date: 2026-02-15 13:19:09
tags:
  - AWS
  - Networking
  - SAA
  - VPC
categories:
  - AWS
---

# AWS VPC Deep Dive

## 1. VPC 基础与架构 (VPC Basics & Architecture)

Amazon VPC 允许你在 AWS 云中预置一个逻辑隔离的部分，在这个部分中，你可以启动定义的虚拟网络中的 AWS 资源。

### 1.1 核心概念
*   **Region (区域) 级别**：VPC 是跨越整个区域（Region）的，覆盖该区域内所有的可用区（AZ）。
*   **CIDR 块 (Classless Inter-Domain Routing)**：
    *   创建 VPC 时必须指定 IPv4 CIDR 块（例如 `10.0.0.0/16`）。
    *   **主要 CIDR 不可修改**，但可以添加辅助 IPv4 CIDR 块。
    *   支持双栈模式（同时使用 IPv4 和 IPv6）。
*   **Subnet (子网)**：
    *   **AZ 级别**：子网必须位于单个可用区内，**不可跨越 AZ**。
    *   **保留地址**：每个子网有 **5 个 IP 地址** 被 AWS 保留，不可使用（例如：`.0` 网络地址, `.1` 路由器, `.2` DNS, `.3` 预留, `.255` 广播地址）。
*   **子网类型**：
    *   **公有子网 (Public Subnet)**：路由表中包含指向 Internet Gateway (IGW) 的路由。
    *   **私有子网 (Private Subnet)**：没有直接指向 IGW 的路由。
    *   **VPN-only 子网**：流量路由到 Virtual Private Gateway (VGW)。

### 1.2 默认 VPC vs 非默认 VPC
*   **默认 VPC**：每个 Region 自带，自动配置了 IGW，实例启动时自动分配公有 IP。
*   **非默认 VPC**：完全隔离，需要手动配置 IGW、路由表等。

---

## 2. 路由与互联网连接 (Routing & Connectivity)

如何让 VPC 内部的资源访问互联网或被互联网访问，取决于网关配置。

### 2.1 Internet Gateway (IGW)
*   **作用**：实现 VPC 与互联网之间的双向通信（IPv4/IPv6）。
*   **特性**：水平扩展、高可用、无带宽限制。
*   **配置**：一个 VPC 只能附加一个 IGW。必须在路由表中配置 `0.0.0.0/0` 指向 IGW。

### 2.2 NAT 设备 (仅 IPv4)
用于允许**私有子网**中的实例访问互联网（如下载补丁），但阻止互联网主动发起连接。
*   **NAT Gateway (推荐)**：
    *   **托管服务**：AWS 负责高可用和扩展性。
    *   **位置**：必须部署在 **公有子网** 中。
    *   **IP 要求**：必须绑定一个 **Elastic IP (EIP)**。
    *   **可用性**：虽然 NAT Gateway 是区域级服务，但它是在特定 AZ 中创建的。为了实现多 AZ 高可用，应在每个 AZ 创建一个 NAT Gateway。
    *   **限制**：不支持安全组（Security Groups），使用 NACL 控制流量。
*   **NAT Instance (旧版)**：
    *   使用 EC2 实例配置。需手动管理修补和扩容。
    *   **关键配置**：必须在 EC2 实例设置中 **禁用源/目标检查 (Disable Source/Destination Check)**。

### 2.3 Egress-Only Internet Gateway (仅 IPv6)
*   **作用**：IPv6 版本的 NAT。允许 VPC 内的 IPv6 实例出站通信，拒绝入站通信。
*   **特性**：有状态（Stateful），即出站请求的返回流量是被允许的。

---

## 3. 安全性 (Security)

SAA 考试核心考点：必须清晰区分安全组和网络 ACL。

| 特性 | 安全组 (Security Group) | 网络 ACL (Network ACL) |
| :--- | :--- | :--- |
| **作用级别** | **实例级别** (Instance Level) | **子网级别** (Subnet Level) |
| **状态** | **有状态 (Stateful)**：允许入站的请求，自动允许出站响应（反之亦然）。 | **无状态 (Stateless)**：入站和出站流量必须分别明确允许。 |
| **规则类型** | 仅支持 **ALLOW** (允许) 规则。 | 支持 **ALLOW** 和 **DENY** (拒绝) 规则。 |
| **评估顺序** | 评估所有规则后决定。 | 按数字顺序评估 (从小到大)，匹配即停止。 |
| **应用场景** | 第一道防线，针对具体应用。 | 第二道防线，用于屏蔽特定恶意 IP。 |

*   **临时端口 (Ephemeral Ports)**：配置 NACL 时，记得允许 1024-65535 端口的返回流量，否则 NAT Gateway 或 Lambda 可能无法工作。
*   **VPC Block Public Access (BPA)**：新功能，可在 VPC 或子网级别声明性地阻止互联网访问。

---

## 4. 网络组件与服务 (Network Components & Services)

### 4.1 Route Tables (路由表)
*   **规则**：
    *   每个子网必须关联一个路由表（未显式关联则使用主路由表）。
    *   **最长前缀匹配 (Longest Prefix Match)**：路由优先级由最具体的路由决定（CIDR 范围越小优先级越高）。
    *   **Local 路由**：每个路由表自带一条 `Local` 路由，用于 VPC 内部通信，不可删除。

### 4.2 IP 地址
*   **Elastic IP (EIP)**：静态公有 IPv4 地址。如果分配了 EIP 但未附加到运行中的实例，AWS 会收取闲置费。
*   **DHCP Option Sets**：配置域名服务器和域名。创建后不可修改，只能新建并关联。

### 4.3 DNS 支持
*   要使 VPC 内的实例拥有公有 DNS 主机名，必须将 VPC 属性 `enableDnsHostnames` 和 `enableDnsSupport` 都设置为 `true`。

---

## 5. VPC 连接选项 (Peering & Endpoints)

### 5.1 VPC Peering (对等连接)
*   **作用**：连接两个 VPC（同账号或跨账号、同区域或跨区域），流量走 AWS 骨干网。
*   **限制**：
    *   CIDR 块不能重叠。
    *   **不可传递 (Non-transitive)**：A 连接 B，B 连接 C，A 不能直接访问 C（除非再建立 A-C 连接）。

### 5.2 VPC Endpoints (终端节点)
无需通过公网（IGW/NAT）即可私有访问 AWS 服务（如 S3, DynamoDB）。
*   **Gateway Endpoints (网关终端节点)**：
    *   **支持服务**：**仅支持 S3 和 DynamoDB**。
    *   **原理**：在路由表中添加一条路由，目标是 AWS 服务的 Prefix List。
    *   **成本**：免费。
*   **Interface Endpoints (接口终端节点 / PrivateLink)**：
    *   **支持服务**：大多数其他 AWS 服务（如 SQS, SNS, Kinesis 等）。
    *   **原理**：在子网中创建一个带有私有 IP 的弹性网络接口 (ENI)。
    *   **成本**：按小时和流量收费。

### 5.3 VPN & Direct Connect
*   **AWS Managed VPN**：通过 Internet 建立 IPSec 隧道。
    *   **VGW (Virtual Private Gateway)**：AWS 端的 VPN 集中器。
    *   **CGW (Customer Gateway)**：客户本地数据中心的物理或软件设备。
*   **Direct Connect (DX)**：专用物理专线，不经过公网，提供更稳定和高带宽的连接。

---

## 6. 监控与高级功能 (Monitoring & Advanced Features)

### 6.1 VPC Flow Logs (流日志)
*   **作用**：捕获进出 VPC 网络接口的 IP 流量元数据（源 IP、目标 IP、端口、协议、接受/拒绝状态）。
*   **存储**：可发布到 CloudWatch Logs 或 S3。
*   **限制**：不是实时包捕获（Packet Capture），不包含数据包内容，仅包含元数据。
*   **用途**：故障排查（如查看为何 SSH 被拒绝）、安全审计。

### 6.2 VPC Traffic Mirroring (流量镜像)
*   **作用**：复制实际的网络流量（Payload）并发送到安全设备或监控设备进行深度包检测。

### 6.3 IPAM (IP Address Manager)
*   **作用**：集中规划、跟踪和监控整个 AWS 组织中的 IP 地址使用情况，防止 IP 重叠。

---

## 7. 最佳实践总结 (Exam Tips)

> **Note - S3 访问问题**：如果私有子网中的实例访问 S3 超时，检查是否配置了 Gateway Endpoint。如果是跨区域访问 S3，Gateway Endpoint 不支持，需使用 Interface Endpoint 或 NAT Gateway。

> **Note - Bastion Host (堡垒机)**：应部署在公有子网，安全组仅允许来自管理员 IP 的 SSH/RDP 访问。

> **Note - 排查连接性问题**：
> *   如果由 Security Group 引起：出站通常是通的，检查入站规则。
> *   如果由 NACL 引起：检查出站和入站规则（因为它是无状态的）。
> *   检查路由表是否正确指向了 IGW 或 NAT。

> **Note - IPv4 耗尽**：如果子网 IP 不够用，无法扩展现有 CIDR，但可以向 VPC 添加辅助 CIDR 块（Secondary CIDR），然后在新 CIDR 中创建新子网。或者使用 IPv6 子网。

> **Note - High Availability (HA)**：始终在至少两个可用区（AZ）中设计架构。NAT Gateway 和 Bastion Host 都应是多 AZ 部署。