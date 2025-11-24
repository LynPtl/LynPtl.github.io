---
title: 20.linux ACL控制文件访问
date: 2025-11-15 03:06:30
categories:
  - Linux入门
---
# Linux ACL 控制文件访问

## 什么是 ACL？

*   访问控制列表（ACL）为文件系统提供了一种额外的、更灵活的权限机制。
*   它旨在辅助标准的 UNIX 文件权限（用户、组、其他）。
*   ACL 允许您为文件或目录的属主和属组之外的特定用户或组设置精细的读、写、执行权限。

## ACL 的用途

*   设想一个场景：用户 `alice` 需要访问 `/data/report.txt`，但这个文件属于 `bob`，属组是 `sales`，而 `alice` 不在 `sales` 组里。在不改变文件所有权或将 `alice` 加入 `sales` 组的情况下，ACL 可以轻松地为 `alice` 单独授予访问权限。
*   基本上，ACL 用于在 Linux 中实现更灵活、更细粒度的权限管理。

## ACL 命令

### getfacl：查看 ACL 权限

`getfacl` 命令用于显示文件或目录的访问控制列表。

*   **查看文件 ACL**
    ```bash
    getfacl /path/to/file
    ```
    *   **输出示例:**
        ```
        # file: my_file.txt
        # owner: alice
        # group: alice
        user::rw-
        user:bob:r--
        group::r--
        mask::r--
        other::r--
        ```
![VirtualBoxVM_RKvvoYDfbI.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_RKvvoYDfbI.png)

### setfacl：设置或修改 ACL 权限

`setfacl` 命令用于修改文件或目录的 ACL。

*   **为用户添加/修改权限 (`-m`)**
    ```bash
    setfacl -m u:bob:rwx /path/to/file
    ```

*   **为组添加/修改权限 (`-m`)**
    ```bash
    setfacl -m g:developers:rw /path/to/file
    ```

*   **设置默认 ACL (`-d`)**
    默认 ACL 只对目录有效。设置后，在该目录下创建的新文件或子目录会自动继承此默认 ACL。
    ```bash
    # 为目录设置默认 ACL，让新文件自动给 bob 用户读权限
    setfacl -d -m u:bob:r /path/to/dir
    ```

*   **移除一个特定的 ACL 条目 (`-x`)**
    ```bash
    setfacl -x u:bob /path/to/file
    ```

*   **移除所有扩展 ACL 条目 (`-b`)**
    此命令会移除所有扩展的 ACL 条目，只保留基本的用户、组和其他权限。
    ```bash
    setfacl -b /path/to/file
    ```

## 注意事项

*   **`ls -l` 中的 `+` 号**
    当一个文件或目录设置了 ACL 后，`ls -l` 命令显示的权限末尾会有一个 `+` 号，提示您该文件有扩展的 ACL 权限。
    ```
    -rwxr--r--+ 1 alice alice 0 Nov 15 10:30 my_file.txt
    ```

*   **文件删除权限**
    能否删除一个文件，取决于对该文件**所在的父目录**是否具有**写（w）和执行（x）权限**。对文件本身的写权限（`w`）只允许修改文件内容，与能否删除该文件无关。
