---
title: AWS Organizations
date: 2026-02-22 18:32:43
tags:
---
#### title: AWS Organizations Deep Dive
#### date: 2026-01-28
#### tags: AWS, Management & Governance, SAA, Organizations, Security

### AWS Organizations (多账号管理与治理)

#### 第一章：基础概念与架构
AWS Organizations 是一项账户管理服务，使你能够将多个 AWS 账户整合到你创建并集中管理的组织中。

*   **核心组件**：
    *   **Organization (组织)**：由多个 AWS 账户组成的实体。
    *   **Management Account (管理账户)**：
        *   组织的“老大”，创建组织的账户。
        *   **支付人 (Payer)**：负责支付所有成员账户的费用。
        *   **权限**：拥有最高管理权限，不可更改，不可被限制（SCP 对管理账户本身无效，只对成员账户有效）。
    *   **Member Account (成员账户)**：组织中的其他所有账户。
    *   **Organizational Unit (OU, 组织单元)**：
        *   账户的容器。可以嵌套（OU 里面套 OU），深度最多 5 层。
        *   **用途**：按照环境（Dev/Prod）、部门（HR/Finance）对账户进行分组，以便应用不同的策略。
    *   **Administrative Root (根)**：组织层次结构的顶层容器。应用在这里的策略会继承给下面的所有 OU 和账户。

*   **两种功能模式 (Feature Sets)**：
    *   **Consolidated Billing Only (仅整合计费)**：只提供共享账单功能，无法使用高级安全控制（如 SCP）。
    *   **All Features Enabled (启用所有功能)**：默认推荐。支持 SCP、标签策略等所有高级治理功能。

--------------------------------------------------------------------------------

#### 第二章：服务控制策略 (Service Control Policies - SCPs)
这是 Organizations 在 SAA 考试中 **最重要** 的考点。SCP 是组织层面的“总开关”。

*   **核心机制**：
    *   **过滤器 (Filter)**：SCP **不授予** 权限。它只是定义了成员账户中 IAM 用户和角色（包括根用户）**能够拥有的最大权限边界**。
    *   **Deny 优先**：如果 SCP 显式 Deny 了某个操作（如 `s3:*`），那么成员账户里的 Admin 即使有 `AdministratorAccess` 也无法操作 S3。
    *   **继承 (Inheritance)**：策略可以挂载在 Root、OU 或 Account 上。子级会自动继承父级的策略。
*   **黑白名单逻辑**：
    *   **默认策略**：AWS 默认在 Root 上挂载了一个 `FullAWSAccess` 的 SCP（Allow *）。
    *   **白名单模式**：移除默认的 Allow *，只显式允许特定服务（如只允许 EC2 和 S3）。
    *   **黑名单模式**：保留默认的 Allow *，显式 Deny 特定操作（如 Deny `DisableCloudTrail`）。

*   **典型应用场景 (Guardrails)**：
    *   **禁止关闭审计**：Deny `cloudtrail:StopLogging`。
    *   **限制区域**：Deny 在未批准的区域（如 `eu-central-1` 以外）启动资源。
    *   **强制实例类型**：Deny 启动非 `t2.micro` 的实例（控制成本）。

--------------------------------------------------------------------------------

#### 第三章：整合计费 (Consolidated Billing)
解决“如何帮老板省钱”的问题。

*   **统一账单**：管理账户收到一张包含所有成员账户费用的总账单。
*   **容量聚合折扣 (Volume Discounts)**：
    *   **机制**：将所有账户的使用量合并计算。例如，S3 存储费是阶梯定价的（存得越多单价越便宜），合并后更容易达到更便宜的阶梯。
    *   **Reserved Instances (RI) & Savings Plans 共享**：
        *   如果账户 A 买了 RI 但没用完，闲置的 RI 额度会自动应用到账户 B 的匹配实例上，从而减少浪费。
        *   *注意*：可以在计费设置中关闭特定账户的 RI 共享。

--------------------------------------------------------------------------------

#### 第四章：账户管理与访问
##### 1. 邀请与创建
*   **邀请现有账户**：可以邀请独立的 AWS 账户加入组织。
*   **创建新账户**：直接在 Organizations 控制台创建新账户，无需重新绑定信用卡。

##### 2. 跨账户访问 (Cross-Account Access)
*   **OrganizationAccountAccessRole**：
    *   **场景**：管理账户需要通过控制台或 API 管理成员账户。
    *   **机制**：当你在组织中**创建**新账户时，AWS 自动在该新账户中创建这个 IAM Role，并信任管理账户。管理账户的用户可以通过“切换角色 (Switch Role)”获得成员账户的 Admin 权限。
    *   *注意*：如果是**邀请**进来的旧账户，需要手动在成员账户里创建这个 Role。

--------------------------------------------------------------------------------

#### 第五章：高级治理功能
*   **Tag Policies (标签策略)**：强制执行标签规则（如必须包含 `CostCenter` 标签，且值的大小写必须正确），解决成本分配标签混乱的问题。
*   **Backup Policies**：集中管理和监控所有账户的 AWS Backup 计划。
*   **Artificial Intelligence (AI) Opt-out Policies**：控制 AWS 是否可以使用你的数据来改进其 AI/ML 服务。

--------------------------------------------------------------------------------

#### 第六章：最佳实践总结 (Exam Tips & Decision Matrix)
结合模拟题和常见考点：

*   **治理 vs 权限**：
    *   **SCP** 是用来“限制”最大权限的（如禁止所有人动 CloudTrail）。
    *   **IAM Policy** 是用来“授予”实际权限的。
    *   **决策逻辑**：如果题目问“如何确保没有任何账户（包括 root）能关闭 CloudTrail”，选 **SCP**。

*   **多账户架构**：
    *   **环境隔离**：将 Prod 和 Dev 账户放在不同的 OU，对 Prod OU 应用更严格的 SCP，对 Dev OU 应用较宽松的 SCP。
    *   **最小化爆炸半径 (Blast Radius)**：如果一个成员账户被黑，其他账户不受影响（因为资源隔离）。

*   **管理现有账户 (Scenario)**：
    *   **场景**：公司收购了另一家公司，有多个 AWS 账户，需要集中管理和获得 Admin 权限。
    *   **步骤**：
        1.  从管理账户发送**邀请 (Invite)**。
        2.  成员账户接受邀请。
        3.  （关键点）在成员账户中**手动创建 IAM Role** (通常命名为 `OrganizationAccountAccessRole`) 并授予管理账户 AssumeRole 权限。

*   **成本优化**：
    *   看到“多个账户”、“账单分散”、“想要享受批量折扣” -> **AWS Organizations Consolidated Billing**。

*   **服务集成**：
    *   **AWS Control Tower**：如果想要“一键式”建立符合最佳实践的多账户环境（Landing Zone），包含预配置的 Organizations、SSO、Logging 等，选 Control Tower。它是 Organizations 的上层封装。
    *   **AWS RAM (Resource Access Manager)**：如果要在账户间共享**资源**（如 VPC Subnets, Transit Gateway），用 RAM，而不是 Organizations（Organizations 是管账户的，RAM 是管资源的）。