---
title: "OWASP Top 10 2025: Insecure Data Handling (不安全的数据处理)"
date: 2026-02-19 14:23:58
tags:
  - OWASP Top 10
  - Web Security
  - Cryptography
  - Injection
  - Data Integrity
categories:
  - Security
  - OWASP
---

# OWASP Top 10 2025: Insecure Data Handling (不安全的数据处理)

## 简介 (Introduction)
本部分将介绍 **OWASP Top 10 2025** 列表中的 3 个类别。你将学习到与应用程序行为和用户输入相关的安全要素。我们将简要介绍这些漏洞、如何预防它们，并探讨其实际影响。

涵盖的类别包括：
*   **A04: 密码学失败 (Cryptographic Failures)**
*   **A05: 注入攻击 (Injection)**
*   **A08: 软件或数据完整性失败 (Software or Data Integrity Failures)**

---

## A04: 密码学失败 (Cryptographic Failures)
密码学失败再次出现在 OWASP Top 10 列表中。让我们在下面深入探讨其具体定义及缓解措施。

### 什么是密码学失败？ (What are Cryptographic Failures?)
**密码学失败 (Cryptographic Failures)** 发生在敏感数据因缺乏加密、实现错误或安全措施不足而未得到充分保护时。这包括在不进行哈希处理的情况下存储密码、使用过时或弱算法（如 MD5, SHA1 或 DES）、暴露加密密钥，或者未能确保传输过程中数据的安全。

一个典型的反面教材是应用程序或服务决定“自创密码算法 (Rolling their own cryptography)”，而不是使用经过广泛验证、审查且公认安全的标准加密算法。

### 如何预防密码学失败 (How to Prevent Cryptographic Failures)
预防密码学失败始于选择强大的现代算法并正确实施。诸如密码之类的敏感信息应使用强健的“慢哈希函数”进行处理，如 **bcrypt**, **scrypt** 或 **Argon2**。在加密数据时，严禁自创算法，而应依赖受信任的工业标准库。

切勿将访问凭据（例如第三方服务的 API Key）嵌入源代码、配置文件或代码仓库中。相反，应使用专门为存储秘密而设计的安全密钥管理系统或环境变量。

---

## A05: 注入攻击 (Injection)
注入攻击长期以来一直是 OWASP Top 10 列表中的“常客”，这并不令人意外。它依然是 Web 攻击中最经典的案例之一。

### 什么是注入攻击？ (What is Injection?)
**注入攻击 (Injection)** 发生在应用程序接收用户输入但处理不当时。应用程序没有安全地处理输入，而是将其直接传递给可以执行命令或查询的系统，例如数据库、Shell、模板引擎或 API。

你可能非常熟悉 **SQL 注入 (SQL Injection)**：攻击者将 SQL 查询插入到应用程序逻辑中（如登录表单），随后该查询被数据库执行。这发生在 Web 应用未能清理用户输入，而是直接用其构建查询语句时。例如，直接获取登录表单中的 `username` 输入并用于查询数据库。

以下是一些你可能熟悉的经典注入示例：
*   SQL 注入 (SQL Injection)
*   命令注入 (Command Injection)
*   AI 提示词注入 (AI Prompts/Prompt Injection)
*   服务端模板注入 (SSTI)

不幸的是，即使在 2025 年，这些攻击依然盛行。注入攻击具有极高的危险性，必须严阵以待。

### 如何预防注入攻击 (How to Prevent Injection)
预防注入攻击的第一步是确保**始终将输入视为不可信的**。不要直接解析输入，而是提取输入中的元素进行查询。对于 SQL 查询，这意味着使用 **预处理语句 (Prepared Statements)** 和 **参数化查询 (Parameterized Queries)**，而不是通过字符串拼接来构建查询。对于操作系统命令，应避免使用将输入直接传递给系统 Shell 的函数，而应依赖不调用 Shell 的安全 API 和进程。

输入验证和清理 (Sanitisation) 在预防此类攻击中起着至关重要的作用。在应用程序处理输入之前，应对危险字符进行转义，强制执行严格的数据类型，并进行过滤。

---

## A08: 软件或数据完整性失败 (Software or Data Integrity Failures)
软件或数据完整性失败同样是 OWASP Top 10 列表中的老面孔，在近两次版本中均有体现。

### 什么是软件或数据完整性失败？ (What Are Software or Data Integrity Failures?)
**软件或数据完整性失败 (Software or Data Integrity Failures)** 发生在应用程序依赖其“认为”安全的代码、更新或数据，但未验证其真实性、完整性或来源时。这包括在不验证的情况下信任软件更新、从不可信来源加载脚本或配置文件、未能验证影响业务逻辑的数据，或者在不确认是否被篡改的情况下接收二进制文件、模板或 JSON 文件。

### 如何避免软件及数据完整性失败 (How to Avoid Software & Data Integrity Failures)
预防这些失败始于建立 **信任边界 (Trust Boundaries)**。应用程序永远不应假设代码、更新或关键数据片段是合法的并自动给予信任；必须验证它们的完整性。这涉及使用加密检查（如校验和 **Checksums**）来验证更新包，并确保只有受信任的来源才能修改关键产物。

此外，对于应用程序而言，完整性和信任边界也应纳入 **CI/CD** 等构建过程中。