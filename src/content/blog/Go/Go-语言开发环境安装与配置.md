---
title: Go 语言开发环境安装与配置
date: 2025-11-25 02:48:11
tags:
  - Go
  - Environment
  - Installation
categories:
  - Golang入门
---
# Go 语言开发环境安装与配置

本文档将引导你完成 Go 语言的下载、安装和基础环境配置，帮助你快速搭建一个高效的 Go 开发环境。

## 第 1 步：下载 Go

首先，我们需要从 Go 语言的官方网站下载安装包。

- **官方下载地址**: [https://go.dev/dl/](https://go.dev/dl/)

请根据你的操作系统选择对应的安装包。通常：
- **Windows**: 选择 `.msi` 后缀的安装程序。
- **macOS**: 选择 `.pkg` 后缀的安装程序。
- **Linux**: 选择 `.tar.gz` 后缀的压缩包。

![firefox_TdbY6YfmzL.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/firefox_TdbY6YfmzL.png)

## 第 2 步：安装 Go

### Windows

1.  下载 `.msi` 安装文件后，双击运行。
2.  遵循安装向导的提示点击 "Next"。
3.  Go 将默认安装在 `C:\Program Files\Go` 目录下，并且安装程序会自动将 `C:\Program Files\Go\bin` 添加到你的系统环境变量 `Path` 中。
4.  点击 "Install" 完成安装。

### macOS

1.  下载 `.pkg` 安装文件后，双击运行。
2.  遵循安装向导的提示完成安装。
3.  Go 将默认安装在 `/usr/local/go` 目录下，安装程序会自动将 `/usr/local/go/bin` 添加到你的系统环境变量 `PATH` 中。

### Linux

我们提供两种安装方法：

**方法一：使用包管理器（最便捷）**

Go 可以在大多数 Linux 发行版上通过其各自的包管理器安装。

*   **Debian/Ubuntu 及其衍生版 (使用 `apt`)**:
    ```bash
    # 更新你的包列表
    sudo apt update
    # 安装 Go
    sudo apt install golang-go
    ```

*   **RHEL/CentOS/Fedora 及其衍生版 (使用 `yum` 或 `dnf`)**:
    ```bash
    # 更新你的包列表
    sudo yum update  # 或者 sudo dnf update
    # 安装 Go
    sudo yum install golang  # 或者 sudo dnf install golang
    ```
**注意**: 包管理器中的 Go 版本可能不是最新的。你可以通过 `go version` 命令检查安装的版本。如果需要最新版本，请使用方法二。

**方法二：手动安装（推荐，可安装最新版）**

这种方法可以确保你安装的是 Go 官方发布的最新版本。
1.  下载 `.tar.gz` 压缩包，并将其解压到 `/usr/local` 目录下。你可以使用以下命令（请将 `go1.x.x.linux-amd64.tar.gz` 替换为你下载的文件名）：
    ```bash
    # 如果之前安装过，先删除旧版本
    sudo rm -rf /usr/local/go
    # 解压到 /usr/local
    sudo tar -C /usr/local -xzf go1.x.x.linux-amd64.tar.gz
    ```
2.  将 Go 的二进制文件目录添加到环境变量 `PATH` 中。编辑你的 shell 配置文件（如 `~/.bashrc`, `~/.zshrc` 或 `~/.profile`），在文件末尾添加以下这行：
    ```bash
    export PATH=$PATH:/usr/local/go/bin
    ```
3.  保存文件后，在终端中执行以下命令使配置生效：
    ```bash
    source ~/.bashrc 
    # 或者 source ~/.zshrc, source ~/.profile
    ```

## 第 3 步：验证安装

打开一个新的终端（Windows 用户请打开命令提示符 `cmd` 或 `PowerShell`），然后输入以下命令：

```bash
go version
```

如果安装成功，你将看到类似以下的输出，显示了安装的 Go 版本号：
```
go version go1.21.4 windows/amd64
```

![WindowsTerminal_moS2GhqaHd.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/11/WindowsTerminal_moS2GhqaHd.png)

## 第 4 步：配置你的 Go 环境

Go 语言使用一些环境变量来进行配置。你可以通过 `go env` 命令查看所有 Go 相关的环境变量。

### GOPATH (工作区)

**在现代 Go 开发中，GOPATH 已经不是必须的了。**

自从 Go 1.11 引入 **Go Modules** 之后，你的项目可以存放在任何位置，不再需要强制放在 `GOPATH` 中。

**那为什么还需要了解它？**

`GOPATH` 现在的主要作用是作为存放 **全局工具** 的位置。当你运行 `go install` 安装一个第三方工具时（例如 `gopls`），这个工具的二进制文件会被默认存放在 `$GOPATH/bin` 目录下。

- **如果你不设置 `GOPATH`**：Go 会自动使用一个默认目录（在 Linux/macOS 上是 `$HOME/go`，在 Windows 上是 `%USERPROFILE%\go`）。
- **如果你设置了 `GOPATH`**：你可以自定义这些工具的安装位置。

**建议的操作：**
为了能够方便地在任何地方运行这些安装好的工具，建议将 `GOPATH` 的 `bin` 目录添加到系统的 `PATH` 环境变量中。你可以通过 `go env GOPATH` 命令查看你当前的 `GOPATH` 路径。

### GOPROXY (模块代理)

如果你在中国大陆，由于网络原因，可能无法直接从 `golang.org` 下载 Go 模块。配置一个国内的代理服务器可以解决这个问题。

推荐使用 `goproxy.cn`。在你的终端执行以下命令：
```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```
这会将你的模块下载请求代理到国内的服务器，`direct` 表示如果代理失败则尝试直连。

## 第 5 步：设置你的代码编辑器

一个好的代码编辑器能极大提升开发效率。**Visual Studio Code (VS Code)** 是目前最受欢迎的 Go 开发编辑器之一。

1.  **安装 VS Code**: 从 [https://code.visualstudio.com/](https://code.visualstudio.com/) 下载并安装。
2.  **安装 Go 扩展**:
    - 打开 VS Code。
    - 点击左侧边栏的 **扩展** 图标 (Extensions)。
    - 在搜索框中输入 "Go"。
    - 找到由 **Microsoft** 发布的官方 Go 扩展并点击 **Install**。
3.  **安装 Go 工具**: 安装完扩展后，VS Code 可能会在右下角提示你安装一些必要的 Go 工具（如 `gopls`, `dlv` 等）。点击 **Install All** 即可。你也可以随时通过按 `Ctrl+Shift+P` (或 `Cmd+Shift+P`)，然后输入 `Go: Install/Update Tools` 来手动安装或更新这些工具。

## 第 6 步：编写你的第一个 Go 程序

现在，你的环境已经准备就绪。让我们来编写一个经典的 "Hello, World!" 程序来测试一下。

1.  创建一个新的项目目录，例如 `hello-go`。
    ```bash
    mkdir hello-go
    cd hello-go
    ```
2.  初始化 Go 模块。这会创建一个 `go.mod` 文件来管理你项目的依赖。
    ```bash
    go mod init example/hello
    ```
3.  创建一个名为 `main.go` 的文件，并输入以下代码：
    ```go
    package main

    import "fmt"

    func main() {
        fmt.Println("Hello, World!")
    }
    ```
4.  在终端中运行你的程序：
    ```bash
    go run .
    ```
5.  你应该会在终端看到输出：
    ```
    Hello, World!
    ```
## 附录：在 WSL 中进行 Go 开发

对于 Windows 用户，使用 [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/zh-cn/windows/wsl/install) 是一个非常流行且强大的选择。它让你可以在 Windows 系统上无缝地运行一个真实的 Linux 环境，从而获得与原生 Linux 一致的开发体验。

### 为什么使用 WSL?
- **一致的环境**: 确保你的开发环境与线上服务器（通常是 Linux）的环境保持一致。
- **性能**: 对于大量文件操作和并发任务，WSL 2 的文件系统性能非常高。
- **工具链**: 可以无缝使用 Linux 生态下的各种开发工具。

### 在 WSL 中配置 Go 和 VS Code

1.  **安装 WSL 和 Linux 发行版**:
    - 打开 PowerShell 或 Windows 命令提示符，并以管理员身份运行。
    - 输入 `wsl --install`。这个命令会自动安装 WSL 并默认安装 Ubuntu 发行版。你也可以从 Microsoft Store 中选择其他发行版（如 Debian）。

2.  **在 WSL 中安装 Go**:
    - 打开你的 WSL 终端（例如，在开始菜单中搜索 "Ubuntu"）。
    - 我们提供两种安装方法：

    **方法一：使用包管理器（最便捷）**

    这是最简单的方法。如果你的 Linux 发行版是 Ubuntu 或 Debian，可以直接使用 `apt` 来安装。
    ```bash
    # 更新你的包列表
    sudo apt update
    # 安装 Go
    sudo apt install golang-go
    ```
    **注意**: 包管理器中的 Go 版本可能不是最新的。你可以通过 `go version` 命令检查安装的版本。如果需要最新版本，请使用方法二。

    **方法二：手动安装（可安装最新版）**

    这种方法可以确保你安装的是 Go 官方发布的最新版本。
    - 按照文档开头 **第 2 步：安装 Go** 中的 **Linux** 部分的指引，在 WSL 环境中下载并安装 Go。
    - 这种方式需要你手动在 `~/.bashrc` 或 `~/.zshrc` 文件中配置 `PATH` 环境变量。

    无论使用哪种方法安装，都建议按照 **第 4 步** 的说明配置 `GOPROXY` 以优化模块下载速度。

3.  **安装 VS Code 的 WSL 扩展**:
    - 在你的 **Windows 系统** 上打开 VS Code。
    - 前往扩展市场，搜索并安装名为 **"WSL"** 的扩展（由 Microsoft 发布）。

4.  **开始开发**:
    - 关闭所有 VS Code 窗口。
    - 打开你的 **WSL 终端**。
    - `cd` 到你存放 Go 项目的目录（例如 `cd ~` 进入主目录）。
    - 创建一个项目目录，例如 `mkdir my-wsl-project && cd my-wsl-project`。
    - 在这个目录下，输入 `code .` 命令。
    
    这个命令会触发 VS Code 在 Windows 上启动，并自动通过 WSL 扩展连接到你当前的 Linux 目录。你会看到 VS Code 左下角显示 `WSL: Ubuntu`（或你的发行版名称），这表明你已经连接成功。

5.  **工作流程**:
    - **编辑器**: VS Code UI 运行在 Windows 上，响应流畅。
    - **终端**: VS Code 中打开的终端（`` Ctrl+` ``）现在是一个 **WSL 终端**，你可以在这里直接运行 `go run`, `git` 等 Linux 命令。
    - **工具和扩展**: Go 扩展和所有相关的 Go 工具（`gopls` 等）都会被安装在 WSL 环境中，而不是 Windows 上。VS Code 会自动处理好这一切。你可能需要像在原生 VS Code 中一样，在首次连接时重新为 WSL 环境安装一次 Go 扩展。

现在，你就可以在享受 Windows 图形界面的同时，获得一个完整的 Linux Go 开发环境了。