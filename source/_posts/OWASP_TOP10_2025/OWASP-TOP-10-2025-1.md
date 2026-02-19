---
title: "OWASP Top 10 2025: IAAA Failures (IAAA 失败)"
date: 2026-02-18 15:49:05
tags:
  - OWASP Top 10
  - Web Security
  - IAAA
  - Access Control
categories:
  - Security
  - OWASP
---

# OWASP Top 10 2025: IAAA Failures (IAAA 失败)

## 简介 (Introduction)
本内容详细解析了 **OWASP Top 10 2025** 中与 **IAAA** 模型实施失败相关的三个类别。**IAAA** 代表 **身份 (Identity)**、**认证 (Authentication)**、**授权 (Authorisation)** 和 **问责 (Accountability)**。

涵盖的类别包括：
1.  **A01: 失效的访问控制 (Broken Access Control)**
2.  **A07: 认证失败 (Authentication Failures)**
3.  **A09: 安全日志和监控失败 (Logging & Alerting Failures)**

## 什么是 IAAA？ (What is IAAA?)
**IAAA** 是理解应用程序如何验证用户及其操作的一种简单方式。每一项都起着至关重要的作用，且无法跳过任何一级。如果前一项未被执行，就无法执行后续项。

这四个项目分别是：
*   **身份 (Identity)**：代表一个人或服务的唯一账户（例如：用户 ID 或电子邮件）。
*   **认证 (Authentication)**：证明该身份的过程（例如：密码、一次性密码 OTP、通行密钥 Passkeys）。
*   **授权 (Authorisation)**：该身份被允许做什么。
*   **问责 (Accountability)**：记录并对“谁在何时、何地做了什么”进行告警。

这里的弱点极具破坏性，因为它可能允许 **威胁行为者 (Threat Actors)** 访问其他用户的数据，或获得超出其应有权限的特权。

## A01: 失效的访问控制 (Broken Access Control)
当服务器没有在每一个请求上正确强制执行“谁可以访问什么”时，就会发生 **失效的访问控制 (Broken Access Control)**。

*   **常见表现形式**：**不安全的直接对象引用 (Insecure Direct Object Reference, IDOR)**。如果更改 ID（例如将 `?id=7` 改为 `?id=6`）就能让你查看或编辑其他人的数据，说明访问控制已破坏。
*   **实际后果**：
    *   **水平提权 (Horizontal Privilege Escalation)**：同一角色，访问其他用户的东西。
    *   **垂直提权 (Vertical Privilege Escalation)**：跳跃到仅限管理员 (Admin-only) 的操作。
*   **根本原因**：应用程序过分信任客户端。

## A07: 认证失败 (Authentication Failures)
当应用程序无法可靠地验证或绑定用户的身份时，就会发生 **认证失败 (Authentication Failures)**。

常见问题包括：
*   **用户名枚举 (Username Enumeration)**。
*   **弱口令/可猜测的密码 (Weak/Guessable Passwords)**（没有锁定或速率限制）。
*   登录/注册流程中的 **逻辑漏洞 (Logic Flaws)**。
*   不安全的 **会话 (Session)** 或 **Cookie** 处理。

如果存在上述任何一种情况，攻击者通常可以伪装成其他人登录，或将会话绑定到错误的账户上。
*   **案例示例**：理想情况下，应用程序应正确处理用户名的大小写（规范化）。如果未能做到这一点，注册一个名为 `aDmiN` 的用户可能会欺骗应用程序，使其授予对 `admin` 账户的访问权限。

## A09: 安全日志和监控失败 (Logging & Alerting Failures)
当应用程序不记录或不对安全相关事件进行告警时，防御者就无法检测或调查攻击。良好的日志记录是 **问责 (Accountability)** 的基础（即能够证明谁在何时、从何地做了什么）。

实际中的失败表现为：
*   缺失 **认证事件 (Authentication Events)**。
*   模糊的错误日志。
*   对 **暴力破解 (Brute-force)** 或权限变更没有告警。
*   日志保留时间过短。
*   日志存储在攻击者可以篡改的地方。

## 结论与最佳实践 (Conclusion & Best Practices)
为了确保 IAAA 的安全并防止相关漏洞，应遵循以下核心原则：

*   **A01 失效的访问控制 (Broken Access Control)**：在**每一个**请求上强制执行服务器端检查。
*   **A07 认证失败 (Authentication Failures)**：对规范化形式 (Canonical Form) 强制执行唯一索引，对 **暴力破解 (Brute-force)** 实施速率限制/锁定，并在密码/权限变更时轮换会话。
*   **A09 安全日志和监控失败 (Logging & Alerting Failures)**：记录完整的认证生命周期（失败/成功、密码/2FA/角色变更、管理员操作），将日志集中存储在主机之外并保留，以及对 **异常 (Anomalies)**（如暴力破解爆发、权限提升）进行告警。

---

## 参考资料 (References)
* [OWASP Top 10 2025 官方网站](https://owasp.org/Top10/2025/)