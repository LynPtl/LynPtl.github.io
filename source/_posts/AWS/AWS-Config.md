---
title: AWS Config
date: 2026-02-23 13:23:17
tags:
  - AWS
  - Config
  - Management & Governance
  - SAA
  - Security
  - Compliance
categories:
  - AWS
---

# AWS Config (配置与合规性审计)

## 1. 基础概念与架构
AWS Config 是一项完全托管的服务，提供 AWS 资源清单、配置历史记录和配置更改通知，以实现安全性与监管。

*   **核心作用**：
    *   **资源清单 (Inventory)**：发现并记录账号下有哪些资源（EC2, S3, RDS 等）。
    *   **配置历史 (Configuration History)**：记录资源配置随时间的变化（例如：上周五谁把安全组的 22 端口对 0.0.0.0/0 开放了？）。
    *   **合规性审计 (Compliance Auditing)**：根据预定义的规则检查资源配置是否合规（例如：所有 EBS 卷是否都加密了？）。

*   **关键组件**：
    *   **Configuration Item (CI, 配置项)**：Config 的基本单位，代表资源在特定时间点的配置快照。包含元数据、属性、关系等。
    *   **Configuration Recorder (配置记录器)**：负责检测变更并生成 CI。默认记录区域内的所有支持资源，也可以自定义记录特定类型。
    *   **Configuration Stream**：CI 的自动更新流。
    *   **Resource Relationship**：Config 会自动映射资源关系（例如：EC2 实例 A 关联了安全组 B 和 EBS 卷 C）。

---

## 2. Config Rules (配置规则)
这是 SAA 考试的**绝对核心**。规则定义了“什么样的配置才是合规的”。

### 2.1 规则类型
*   **AWS Managed Rules (托管规则)**：
    *   AWS 预置的规则（超过 100 种），开箱即用。
    *   *常见示例*：`encrypted-volumes` (检查 EBS 是否加密), `s3-bucket-public-write-prohibited` (检查 S3 是否公开写入), `instances-in-vpc` (检查 EC2 是否在 VPC 内)。
*   **Custom Rules (自定义规则)**：
    *   如果你有特殊的合规需求，可以编写 **AWS Lambda** 函数来定义逻辑。
    *   Config 会调用 Lambda，Lambda 返回 `COMPLIANT` 或 `NON_COMPLIANT`。

### 2.2 触发机制 (Trigger Types)
决定规则何时运行评估：
*   **Configuration Changes (配置变更触发)**：当资源配置发生变化时立即触发。例如：一旦有新的 S3 Bucket 创建，立刻检查是否开启了加密。
*   **Periodic (周期性触发)**：按固定频率运行（例如每 24 小时）。

### 2.3 修复 (Remediation)
*   **SSM Automation 集成**：当规则发现资源不合规时，可以使用 AWS Systems Manager (SSM) Automation 文档自动修复。
    *   *示例*：规则发现安全组开放了 SSH (22)，自动触发 SSM 脚本将其关闭。

---

## 3. 一致性包 (Conformance Packs)
*   **定义**：一个包含 Config 规则和修复操作的集合（通常是一个 YAML 模板）。
*   **作用**：将一整套合规标准（如 PCI-DSS, HIPAA）打包部署。
*   **组织级部署**：可以跨整个 AWS Organization 部署一致性包，确保所有成员账号都遵循同一套合规基线。不可变，成员账号无法修改。

---

## 4. 多账号与多区域数据聚合 (Aggregation)
解决“如何在管理账号中看全公司的合规情况”的问题。

*   **Aggregator (聚合器)**：
    *   **作用**：从多个源（账号/区域）收集配置和合规性数据，汇聚到一个中心账号。
    *   **源类型**：
        1.  单独的账号 ID 列表。
        2.  **AWS Organization**（最常用）：自动添加组织内的所有账号，新加入组织的账号也会自动被包含。
    *   **视图**：提供企业级的合规性仪表板。

---

## 5. 监控与通知
*   **Amazon SNS**：Config 可以将配置变更和合规性状态变更发送到 SNS 主题。
    *   *场景*：当有人修改了生产环境的安全组，或者发现不合规资源时，管理员收到邮件告警。
*   **CloudWatch Events (EventBridge)**：捕获更细粒度的事件并触发自动化流程（如 Lambda）。

---

## 6. 最佳实践总结 (Exam Tips & Decision Matrix)

结合你的错题集逻辑，以下是 Config 的判断点：

{% note info "Config vs CloudTrail" %}
* **CloudTrail** 记录 **"Who made the call?"** (谁在什么时间调用了什么 API)。重点是 **API 调用日志**。
* **Config** 记录 **"What did the resource look like?"** (资源配置变成了什么样)。重点是 **资源状态快照**。
* **决策逻辑**：
  * 问“谁终止了实例？” -> **CloudTrail**。
  * 问“昨天的安全组规则是什么样的？” -> **Config**。
  * 问“如何确保所有 S3 桶都禁止公有访问？” -> **Config Rules**。
{% endnote %}

{% note info "Config vs Inspector vs Trusted Advisor" %}
* **Config**：关注配置合规性（如：是否加密、标签是否正确）。
* **Inspector**：关注 EC2 操作系统内部的漏洞（CVE）和网络可达性。
* **Trusted Advisor**：关注服务限制（Limits）、成本优化和基本安全概览（高级功能不如 Config 细致）。
{% endnote %}

{% note info "实战场景" %}
* **审计与合规**：看到 "Audit", "Compliance", "History of changes", "Resource Inventory" -> 选 **AWS Config**。
* **自动修复**：看到 "Non-compliant", "Auto-remediate" -> **Config Rules + SSM Automation**。
* **多账号治理**：看到 "Organization-wide compliance" -> **Config Aggregator** 或 **Conformance Packs**。
{% endnote %}

{% note info "成本注意" %}
* Config 是收费的（按记录的配置项数量和规则评估次数收费）。如果资源变动极其频繁（如 Auto Scaling 频繁创建销毁实例），Config 费用会很高。可以通过排除特定资源类型来优化。
{% endnote %}