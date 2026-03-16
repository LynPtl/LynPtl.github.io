---
title: AWS Organizations
date: 2026-02-22 18:32:43
tags:
  - AWS
  - Organizations
  - Management & Governance
  - SAA
  - Security
categories:
  - AWS
---

# AWS Organizations (多账号管理与治理)

## 1. 基础概念与架构
AWS Organizations 是一项账户管理服务，使你能够将多个 AWS 账户整合到你创建并集中管理的组织中。

<em>   <strong>核心组件</strong>：
    </em>   <strong>Organization (组织)</strong>：由多个 AWS 账户组成的实体。
    <em>   <strong>Management Account (管理账户)</strong>：
        </em>   组织的“老大”，创建组织的账户。
        <em>   <strong>支付人 (Payer)</strong>：负责支付所有成员账户的费用。
        </em>   <strong>权限</strong>：拥有最高管理权限，不可更改，不可被限制（SCP 对管理账户本身无效，只对成员账户有效）。
    <em>   <strong>Member Account (成员账户)</strong>：组织中的其他所有账户。
    </em>   <strong>Organizational Unit (OU, 组织单元)</strong>：
        <em>   账户的容器。可以嵌套（OU 里面套 OU），深度最多 5 层。
        </em>   <strong>用途</strong>：按照环境（Dev/Prod）、部门（HR/Finance）对账户进行分组，以便应用不同的策略。
    <em>   <strong>Administrative Root (根)</strong>：组织层次结构的顶层容器。应用在这里的策略会继承给下面的所有 OU 和账户。

</em>   <strong>两种功能模式 (Feature Sets)</strong>：
    <em>   <strong>Consolidated Billing Only (仅整合计费)</strong>：只提供共享账单功能，无法使用高级安全控制（如 SCP）。
    </em>   <strong>All Features Enabled (启用所有功能)</strong>：默认推荐。支持 SCP、标签策略等所有高级治理功能。

---

## 2. 服务控制策略 (Service Control Policies - SCPs)
这是 Organizations 在 SAA 考试中 <strong>最重要</strong> 的考点。SCP 是组织层面的“总开关”。

<em>   <strong>核心机制</strong>：
    </em>   <strong>过滤器 (Filter)</strong>：SCP <strong>不授予</strong> 权限。它只是定义了成员账户中 IAM 用户和角色（包括根用户）<strong>能够拥有的最大权限边界</strong>。
    <em>   <strong>Deny 优先</strong>：如果 SCP 显式 Deny 了某个操作（如 <code>s3:</em></code>），那么成员账户里的 Admin 即使有 <code>AdministratorAccess</code> 也无法操作 S3。
    <em>   <strong>继承 (Inheritance)</strong>：策略可以挂载在 Root、OU 或 Account 上。子级会自动继承父级的策略。
</em>   <strong>黑白名单逻辑</strong>：
    <em>   <strong>默认策略</strong>：AWS 默认在 Root 上挂载了一个 <code>FullAWSAccess</code> 的 SCP（Allow </em>）。
    <em>   <strong>白名单模式</strong>：移除默认的 Allow </em>，只显式允许特定服务（如只允许 EC2 和 S3）。
    <em>   <strong>黑名单模式</strong>：保留默认的 Allow </em>，显式 Deny 特定操作（如 Deny <code>DisableCloudTrail</code>）。

<em>   <strong>典型应用场景 (Guardrails)</strong>：
    </em>   <strong>禁止关闭审计</strong>：Deny <code>cloudtrail:StopLogging</code>。
    <em>   <strong>限制区域</strong>：Deny 在未批准的区域（如 <code>eu-central-1</code> 以外）启动资源。
    </em>   <strong>强制实例类型</strong>：Deny 启动非 <code>t2.micro</code> 的实例（控制成本）。

---

## 3. 整合计费 (Consolidated Billing)
解决“如何帮老板省钱”的问题。

<em>   <strong>统一账单</strong>：管理账户收到一张包含所有成员账户费用的总账单。
</em>   <strong>容量聚合折扣 (Volume Discounts)</strong>：
    <em>   <strong>机制</strong>：将所有账户的使用量合并计算。例如，S3 存储费是阶梯定价的（存得越多单价越便宜），合并后更容易达到更便宜的阶梯。
    </em>   <strong>Reserved Instances (RI) & Savings Plans 共享</strong>：
        <em>   如果账户 A 买了 RI 但没用完，闲置的 RI 额度会自动应用到账户 B 的匹配实例上，从而减少浪费。
        </em>   <em>注意</em>：可以在计费设置中关闭特定账户的 RI 共享。

---

## 4. 账户管理与访问
### 4.1 邀请与创建
<em>   <strong>邀请现有账户</strong>：可以邀请独立的 AWS 账户加入组织。
</em>   <strong>创建新账户</strong>：直接在 Organizations 控制台创建新账户，无需重新绑定信用卡。

### 4.2 跨账户访问 (Cross-Account Access)
<em>   <strong>OrganizationAccountAccessRole</strong>：
    </em>   <strong>场景</strong>：管理账户需要通过控制台或 API 管理成员账户。
    <em>   <strong>机制</strong>：当你在组织中<strong>创建</strong>新账户时，AWS 自动在该新账户中创建这个 IAM Role，并信任管理账户。管理账户的用户可以通过“切换角色 (Switch Role)”获得成员账户的 Admin 权限。
    </em>   <em>注意</em>：如果是<strong>邀请</strong>进来的旧账户，需要手动在成员账户里创建这个 Role。

---

## 5. 高级治理功能
<em>   <strong>Tag Policies (标签策略)</strong>：强制执行标签规则（如必须包含 <code>CostCenter</code> 标签，且值的大小写必须正确），解决成本分配标签混乱的问题。
</em>   <strong>Backup Policies</strong>：集中管理和监控所有账户的 AWS Backup 计划。
<em>   <strong>Artificial Intelligence (AI) Opt-out Policies</strong>：控制 AWS 是否可以使用你的数据来改进其 AI/ML 服务。

---

## 6. 最佳实践总结 (Exam Tips & Decision Matrix)

结合模拟题和常见考点，以下是应对多账号管理相关题目的决策断言：

<blockquote class="note"><strong>治理 vs 权限控制</strong>
</em> <strong>SCP (服务控制策略)</strong> 是用来“限制”最大权限的边界（例如禁止所有人修改 CloudTrail，或者限制特定区域）。<strong>它不授予权限</strong>。
<em> <strong>IAM Policy</strong> 是用来“授予”实际操作权限的。
</em> <strong>决策断言</strong>：如果题目问“如何确保组织内没有任何账户（包括 root 用户）能绕过安全策略关闭 CloudTrail”，核心方案必然是 <strong>SCP</strong>，仅仅修改 IAM 是防不住 Root 的。
</blockquote>

<blockquote class="note"><strong>多账户架构的最佳实践</strong>
<em> <strong>环境隔离</strong>：将 Prod（生产）和 Dev（开发）账户放在不同的 Organizational Unit (OU) 中，对 Prod OU 应用更严格的 SCP，对 Dev OU 应用较宽松的 SCP。
</em> <strong>最小化爆炸半径 (Blast Radius)</strong>：如果某个成员账户遭到入侵，其他账户不受影响，实现了物理级别的资源隔离。
</blockquote>

<blockquote class="note"><strong>管理现有/收购账户 (Scenario)</strong>
<em> <strong>场景</strong>：公司收购了另一家公司，面临多个现有的 AWS 账户，需要集中管理并获得 Admin 权限。
</em> <strong>正确步骤</strong>：
  1. 从管理账户发送 <strong>邀请 (Invite)</strong>。
  2. 成员账户接受邀请。
  3. <strong>(关键考点)</strong>：由于是邀请进来的旧账户，必须在成员账户中<strong>手动创建 IAM Role</strong> (通常命名为 <code>OrganizationAccountAccessRole</code>)，并信任（授予 AssumeRole 权限给）管理账户。
</blockquote>

<blockquote class="note"><strong>成本优化与服务集成</strong>
<em> <strong>成本合并</strong>：当遇到“有多个独立账户”、“面临账单分散管理困难”、“想要通过使用量叠加享受批量定价折扣 (Volume Discounts)” -> 请选择 <strong>AWS Organizations Consolidated Billing</strong>。
</em> <strong>AWS Control Tower</strong>：如果需求是“一键式”建立符合最佳实践的多账户自动化环境（Landing Zone），且要求开箱即用（包含预配置的 Organizations、IAM Identity Center (SSO)、Logging 等），请选择 <strong>AWS Control Tower</strong>（它是 Organizations 的上层编排封装）。
<ul><li><strong>AWS RAM (Resource Access Manager)</strong>：如果考题是要在账户间共享<strong>具体的资源级对象</strong>（如 VPC Subnets, Transit Gateway），请用 <strong>AWS RAM</strong>，而不是用 Organizations（Organizations 管账户结构，RAM 管资源共享）。</li>
</ul></blockquote>