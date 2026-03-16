---
title:  Windows 与 WSL2 的终端代理配置
date: 2025-12-26
tags:
  - 代理
  - WSL
  - Windows
categories:
  - 工具
---

## 问题背景

作为开发者，我们经常需要在终端（Terminal）中使用各种 CLI 工具，例如 <code>git</code>、<code>npm</code>、<code>curl</code> 或者最近热门的 <code>gemini-cli</code>。

你可能遇到过这种反直觉的情况：
<strong>明明电脑上的代理软件（Clash/v2rayN）已经开启了“全局模式”，浏览器访问 Google/GitHub 毫无压力，但只要在终端运行命令，依然报错 <code>Connection timed out</code>。</strong>

---

## Part 1: Windows 本地终端 (PowerShell/CMD)

### 1.1 原理：此“代理”非彼“代理”
当我们开启代理软件的“系统代理”时，实际上修改的是 Windows 的 <strong>IE 代理设置</strong>。这只对浏览器（Edge, Chrome）生效。
而大多数命令行工具（CLI）不读系统设置，它们只认特定的环境变量：<code>HTTP_PROXY</code> 和 <code>HTTPS_PROXY</code>。

### 1.2 解决方案：配置永久环境变量
为了让所有终端工具（包括 VS Code 内置终端）自动走代理，建议将配置写入系统环境变量。

1.  <strong>获取代理端口</strong>：查看你的代理软件设置，找到 HTTP 端口（例如 Clash 默认为 <code>7890</code>，v2rayN 默认为 <code>10809</code>）。
2.  <strong>打开设置</strong>：按 <code>Win + S</code>，搜索 <strong>“编辑系统环境变量”</strong>。
3.  <strong>添加变量</strong>：点击“环境变量”，在 <strong>“用户变量”</strong> 区域新建以下两项：
    <em> 变量名: <code>HTTP_PROXY</code> | 变量值: <code>http://127.0.0.1:7890</code>
    </em> 变量名: <code>HTTPS_PROXY</code> | 变量值: <code>http://127.0.0.1:7890</code>
4.  <strong>重启终端</strong>：关闭并重新打开 PowerShell，配置即刻生效。

![SystemPropertiesAdvanced_hpOEU6Pxj2.png](https://pub-85d4dcece16844bf8290aa4b33608ccd.r2.dev/ShareX/2025/12/SystemPropertiesAdvanced_hpOEU6Pxj2.png)

### 1.3 验证
``<code>powershell
curl -I [https://www.google.com](https://www.google.com)
# 预期输出: HTTP/1.1 200 OK

</code>`<code>

## Part 3: 常见工具的独立配置

有些工具（如 Git, NPM）有时会忽略环境变量，或者需要单独设置。

### 3.1 Git

如果 </code>git clone<code> 依然很慢，手动指定代理：

</code>`<code>bash
# 设置
git config --global http.proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)
git config --global https.proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)

# 取消
# git config --global --unset http.proxy

</code>`<code>

<em>(注：在 WSL 2 中，将 </code>127.0.0.1<code> 替换为 </code>$hostip<code>)</em>

### 3.2 NPM / Yarn

</code>`<code>bash
npm config set proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)
npm config set https-proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)

</code>`<code>

### 3.3 Gemini CLI

如果你在使用 Google 的 </code>gemini-cli<code>，它强依赖 </code>HTTPS_PROXY<code> 环境变量。只要 Part 1 或 Part 2 配置正确，通常无需额外设置。如果报错，请检查 API Key 是否有效，或尝试强制指定：

</code>`<code>bash
# 强制指定代理运行
export HTTPS_PROXY=[http://127.0.0.1:7890](http://127.0.0.1:7890); gemini prompt "Hello"

</code>`<code>

---

## 总结

<em> <strong>Windows 终端</strong>：设置永久用户环境变量 (</code>HTTP_PROXY<code>)。
</em> <strong>WSL 2</strong>：开启代理软件的 Allow LAN，并在 </code>.zshrc` 中使用脚本动态指向 Host IP。
<ul><li><strong>核心原则</strong>：CLI 工具不走系统代理，必须显式喂给它环境变量。</li></ul>
