---
title: 14.linux安装更新和管理软件包
date: 2025-11-02 01:38:12
categories:
  - Linux入门
---
# Linux 安装更新和管理软件包（或许在施工中）

# 安装和更新软件包

*   软件(Software)是您在计算机上运行的任何应用程序。
*   软件包(Package)是一个包含与软件相关的程序、文件和可执行文件的容器。

# 系统更新和软件仓库

*   `yum` (用于 CentOS) / `apt-get` (用于其他 Linux 发行版)
*   `rpm` (红帽软件包管理器)

这里我使用yum安装ftp包作为一个例子。昨天的笔记中有在ubuntu中使用apt安装ftp的例子。

![VirtualBoxVM_c7cN03nWKq.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_c7cN03nWKq.png)

你可以使用`rpm -qa`来查看所有你已经安装的包。
![VirtualBoxVM_vvIFUAYmWy.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_vvIFUAYmWy.png)

使用管道到`wc -l`可以统计列数，就是已安装的包的数量。

![VirtualBoxVM_RDUKq6er9w.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_RDUKq6er9w.png)

# RPM vs. YUM

`rpm` 和 `yum` 都是用于在基于 Red Hat 的 Linux 系统上管理软件包的工具，但它们在功能和使用方式上有本质的区别。

*   **RPM (Red Hat Package Manager)**
    *   **底层工具**: `rpm` 是一个底层的软件包管理器。它直接处理 `.rpm` 文件，可以进行安装、查询、卸载、升级和验证等操作。
    *   **不自动处理依赖**: 这是 `rpm` 最重要的一个特点。当你使用 `rpm` 安装一个软件包时，如果这个包依赖于其他未安装的包，`rpm` 会报错并失败。你需要手动去寻找并安装所有这些依赖包，这个过程可能非常繁琐。
    *   **用途**: `rpm` 更适合用于对单个 `.rpm` 文件进行操作，或者在无法连接到互联网的环境下进行离线安装（前提是你已经准备好了所有的依赖包）。

*   **YUM (Yellowdog Updater, Modified)**
    *   **高层工具**: `yum` 是一个更高层次的软件包管理工具，它构建在 `rpm` 之上，旨在简化软件包管理过程。
    *   **自动解决依赖关系**: 这是 `yum` 最大的优势。当你使用 `yum` 安装一个软件包时，它会自动检查所有依赖关系，并从配置好的软件仓库（repository）中下载并安装所有需要的依赖包。这极大地简化了软件安装过程。
    *   **基于软件仓库**: `yum` 从远程或本地的软件仓库中查找、下载和安装软件包。这些仓库包含了大量的软件包及其元数据（包括依赖信息）。
    *   **用途**: `yum` 是日常进行系统更新、软件安装和管理的首选工具，因为它非常方便。

# 卸载软件包

## 使用 YUM 卸载

`yum remove <package_name>`: 这是卸载软件包的首选方法，因为它会自动处理依赖关系。当您卸载一个软件包时，`yum` 会检查是否有其他软件包依赖于它。如果没有，`yum` 会将其卸载；如果有，`yum` 会提示您是否也卸载这些依赖包（如果它们不再被其他任何包需要）。

**示例:**
```bash
yum remove ftp
```
此命令会卸载 `ftp` 软件包及其不再需要的依赖项。

## 使用 RPM 卸载

`rpm -e <package_name>`: 使用 `rpm` 卸载软件包时，需要非常小心，因为它不会自动处理依赖关系。如果一个软件包被其他已安装的软件包所依赖，`rpm -e` 命令会失败并报错，除非强制卸载。

**示例:**
```bash
rpm -e ftp
```
如果 `ftp` 软件包没有被其他包依赖，这个命令会成功。如果存在依赖，您可能会看到类似以下的错误：
```
error: Failed dependencies:
    ftp is needed by (installed) some_other_package
```
在这种情况下，需要先卸载依赖 `ftp` 的 `some_other_package`，或者使用 `--nodeps` 选项强制卸载（不推荐，可能导致系统不稳定）。

**强制卸载 (不推荐):**
```bash
rpm -e --nodeps ftp
```
**注意**: 强制卸载可能会破坏系统上其他软件包的功能，因为它们可能依赖于正在卸载的软件包。除非非常清楚自己在做什么，否则应尽量避免使用 `--nodeps` 选项。

# 系统升级/补丁管理

*   两种类型的升级：
    *   主版本升级 (Major version) = 例如从 5.x 升级到 6.x 或 7.x
    *   次版本升级 (Minor version) = 例如从 7.3 升级到 7.4

*   `yum update` vs. `yum upgrade`
    *   `upgrade` = 删除旧的包
    *   `update` = 保留旧的包

*   主版本升级 = `yum` 命令 是不支持的
*   次版本升级 = `yum update` 可以升级


```
yum update -y
```
意思更新目前所有的已安装软件包，并且不要询问我，我会同意安装中的所有询问。

![VirtualBoxVM_DbhUcvFWnn.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_DbhUcvFWnn.png)

如果你所有的软件包都是最新的，那么`yum update`是不会有更新的。

### rpm

有时候你可能会通过curl或者访问某包的官网下载他们的rpm包。

比如你本地有了一个`.rpm`文件，你就可以使用比较常用的

```
rpm -Uvh packagename.rpm
```

-U（Update）
如果这个软件已经安装了，它会将其升级到新版本。
如果这个软件尚未安装，它会直接安装它。

-h (hash - 哈希/进度条)
这个选项会在安装过程中显示一个进度条，通常是用井号（#）来表示。这能让你直观地看到安装的进度，非常有用。

-v (verbose - 详细)
这个选项会显示详细的运行信息，比如它正在检查什么、正在执行什么步骤。

上面的这个命令也经常会使用通配符，因为通常这个文件名会很长。

比如`3cpio-0.11.0-2.el10_2.x86_64.rpm`,就可以使用：
```
rpm -Uvh 3cpio*rpm
```

`rpm -qi`可以展示关于已安装的该软件包的信息：

![VirtualBoxVM_Chy9bjlMkA.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_Chy9bjlMkA.png)

`rpm -qc`可以查看该软件包的配置文件目录：

![VirtualBoxVM_tiOHMwFzR1.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_tiOHMwFzR1.png)

`rpm -qf`可以查询该目录隶属于哪个包
![VirtualBoxVM_jsN38lQab6.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/VirtualBoxVM_jsN38lQab6.png)