---
title: "OWASP Top 10: Broken Access Control (失效的访问控制)"
date: 2026-02-19 14:00:03
tags:
  - OWASP Top 10
  - Web Security
  - Broken Access Control
  - Access Control
categories:
  - Security
---

# OWASP 失效的访问控制 (Broken Access Control)

## 访问控制简介 (Introduction to Access Control)

### 什么是访问控制？ (What is Access Control?)

访问控制（Access Control）是一种安全机制，用于控制哪些用户或系统被允许访问特定的资源或系统。在计算机系统中实施访问控制是为了确保只有授权用户才能访问资源，例如文件、目录、数据库和网页。访问控制的主要目标是保护敏感数据，并确保只有获得授权的人员才能访问。

![访问控制示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/c0163e47202f8fb14d0d9bf407fb65df.png)

访问控制的实现方式多种多样，取决于受保护资源的类型以及系统的安全要求。常见的访问控制机制包括：

1. **自主访问控制 (Discretionary Access Control, DAC)**：在这种类型中，资源所有者或管理员决定谁被允许访问资源以及他们被允许执行哪些操作。DAC 常用于操作系统和文件系统。通俗地说，想象一座城堡，国王可以将钥匙交给他的顾问，允许他们随心所欲地打开任何门。这就是 DAC：控制自己资源的自由。拥有控制权的人（如城堡之王）可以向任何他们喜欢的人发放权限，决定谁可以进出。
    
    ![自主访问控制示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/fda89930eb8e0fe0be0bc2b0050df2bb.png)
    
2. **强制访问控制 (Mandatory Access Control, MAC)**：在这种类型中，资源的访问由系统强制执行的一组预定义规则或策略决定。MAC 常用于高安全性环境，如政府和军事系统。通俗地说，想象一个拥有严密安全协议的堡垒。只有具有特定安全清除级别（Clearance）的特定个人才能访问某些区域，且没有任何商量余地。最高指挥官设定规则，规则被严格执行。这就是 MAC 的运作方式，就像一位不讲情面的安保人员，不允许任何例外。
    
    ![强制访问控制示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/680f5f2a359b86e88a01f75509b48976.png)
    
3. **基于角色的访问控制 (Role-Based Access Control, RBAC)**：在这种类型中，用户被分配不同的“角色”，每个角色定义了其访问资源的级别。RBAC 常用于企业系统，用户根据其工作职责拥有不同级别的权限。通俗地说，想象一家现代企业。由于有经理、高管、销售人员等职位，他们进入大楼的权限各不相同。有些人可以进入董事会会议室，有些人可以进入销售区。这就是 RBAC 的本质——根据个人在组织中的角色来分配访问权限。
    
    ![基于角色的访问控制示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/951b891b22025b3a67b2675361b23415.png)
    
4. **基于属性的访问控制 (Attribute-Based Access Control, ABAC)**：在这种类型中，资源的访问由一组属性（如用户角色、时间、地点和设备）决定。ABAC 常用于云环境和 Web 应用程序。通俗地说，想象一个高度先进的科幻安全系统，它会扫描个人的某些属性。也许它会检查他们是否来自特定星球，是否携带特定设备，或者是否尝试在特定时间访问资源。这就是 ABAC，像未来一样智能且灵活。
    
    ![基于属性的访问控制示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/0057e9b8b5ea7f0e1bed9c33f586163b.png)
    

实施访问控制有助于防止安全漏洞和对敏感数据的未经授权访问。然而，访问控制并非百分之百安全，可能容易受到各种攻击，如提权攻击和失效的访问控制漏洞。因此，定期审查和测试访问控制机制以确保其按预期工作至关重要。

---

## 失效的访问控制 (Broken Access Control)

失效的访问控制（Broken Access Control）漏洞是指访问控制机制未能正确限制用户对资源或数据的访问。以下是一些常见的利用方式及示例：

1. **水平提权 (Horizontal Privilege Escalation)**：当攻击者能够访问属于具有相同访问权限级别的其他用户的资源或数据时，就会发生水平提权。例如，用户可能通过更改 URL 中的用户 ID 来访问另一个用户的账户。
2. **垂直提权 (Vertical Privilege Escalation)**：当攻击者能够访问属于具有更高访问权限级别用户的资源或数据时，就会发生垂直提权。例如，普通用户通过操纵隐藏的表单字段或 URL 参数来访问管理功能。
    
    ![](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/fa3bb36f2fde2bd29aa290ff2610428d.png)
    
3. **访问控制检查不足 (Insufficient Access Control Checks)**：当访问控制检查执行得不正确或不一致时，会允许攻击者绕过它们。例如，应用程序可能允许用户在不验证其适当权限的情况下查看敏感数据。
4. **不安全的直接对象引用 (Insecure Direct Object References, IDOR)**：当攻击者通过利用应用程序访问控制机制中的弱点来访问资源或数据时，就会发生 IDOR。例如，应用程序可能为敏感数据使用可预测或易于猜测的标识符，使攻击者更容易访问。
    
    ![IDOR 示例](https://tryhackme-images.s3.amazonaws.com/user-uploads/645b19f5d5848d004ab9c9e2/room-content/55df42c444edbd2a24f7973b5792b769.png)

通过实施强大的访问控制机制并定期进行审查和测试，可以预防这些利用行为。

---

## 缓解策略 (Mitigation)

可以采取以下几个步骤来减轻 PHP 应用程序中失效访问控制漏洞的风险：

1. **实施基于角色的访问控制 (RBAC)**：RBAC 是一种根据企业内部个人用户的角色来管理计算机或网络资源访问的方法。通过定义组织中的角色并为这些角色分配访问权限，你可以控制用户在系统上执行的操作。以下代码片段演示了如何定义角色（如 'admin'、'editor' 或 'user'）及其关联的权限。`hasPermission` 函数检查特定角色的用户是否具有指定权限。
    
    **示例代码**
    
    ```php
     // 定义角色和权限
     $roles = [
         'admin' => ['create', 'read', 'update', 'delete'],
         'editor' => ['create', 'read', 'update'],
         'user' => ['read'],
     ];
    
     // 检查用户权限
     function hasPermission($userRole, $requiredPermission) {
         global $roles;
         return in_array($requiredPermission, $roles[$userRole]);
     }
    
     // 使用示例
     if (hasPermission('admin', 'delete')) {
         // 允许删除操作
     } else {
         // 拒绝删除操作
     }
    ```
    
2. **使用参数化查询 (Parameterized Queries)**：参数化查询是保护 PHP 应用程序免受 SQL 注入攻击的一种方式。通过使用占位符而不是直接在 SQL 查询中包含用户输入，可以显著降低 SQL 注入攻击的风险。以下示例展示了如何使用预处理语句（Prepared Statements）来确保查询安全，它将 SQL 语法与数据分离，并安全地处理用户输入。
    
    **示例代码**
    
    ```php
     // 易受攻击的查询示例
     $username = $_POST['username'];
     $password = $_POST['password'];
     $query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
    
     // 使用预处理语句的安全查询示例
     $username = $_POST['username'];
     $password = $_POST['password'];
     $stmt = $pdo->prepare("SELECT * FROM users WHERE username=? AND password=?");
     $stmt->execute([$username, $password]);
     $user = $stmt->fetch();
    ```
    
3. **完善的会话管理 (Proper Session Management)**：完善的会话管理可确保已认证的用户能够及时且适当地访问资源，从而降低未经授权访问敏感信息的风险。这包括使用安全 Cookie、设置会话超时以及限制用户可拥有的活动会话数量。代码片段显示了如何初始化会话、设置会话变量以及通过检查最后活动时间来验证会话有效性。
    
    **示例代码**
    
    ```php
     // 启动会话
     session_start();
    
     // 设置会话变量
     $_SESSION['user_id'] = $user_id;
     $_SESSION['last_activity'] = time();
    
     // 检查会话是否仍然有效
     if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
         // 会话已过期
         session_unset();
         session_destroy();
     }
    ```
    
4. **使用安全编码规范 (Secure Coding Practices)**：安全编码规范涉及防止引入安全漏洞的方法。开发人员应清理（Sanitize）和验证用户输入，以防止恶意数据造成危害，并避免使用不安全的函数或库。以下示例显示了如何使用 PHP 的 `filter_input` 函数清理用户输入，并演示了如何使用 `password_hash` 安全地哈希密码，而不是使用像 `md5` 这样不安全的函数。
    
    **示例代码**
    
    ```php
     // 验证用户输入
     $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
     $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);
    
     // 避免使用不安全函数
     // 使用 md5 的不安全代码示例
     $password = md5($password);
     // 使用 password_hash 的安全代码示例
     $password = password_hash($password, PASSWORD_DEFAULT);
    ```

---

## 结论 (Conclusion)

失效的访问控制（Broken Access Control）是一种安全漏洞，发生在系统未能正确执行访问限制时，这可能导致未经授权的用户获得访问敏感信息的权限，或执行他们未被授权的操作。

**水平提权** 发生在用户能够在自己的权限级别内访问他人数据或执行他人操作时。这非常危险，因为一旦攻击者进入系统，就可以在网络中横移并访问更多资源或敏感数据。

**垂直提权** 发生在用户能够访问保留给更高权限级别用户的权限（如系统管理员）时。这甚至更加危险，因为它可能允许攻击者获得系统的完全控制权，并可能接管整个网络。

这些类型的提权影响因具体系统和获得的访问级别而异。然而，总体而言，后果可能包括敏感信息泄露、数据丢失或被盗、关键系统或服务中断，甚至整个网络沦陷。因此，实施强大的访问控制并定期监控任何未经授权的访问或活动迹象至关重要。
