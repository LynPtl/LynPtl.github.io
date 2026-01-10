---
title: 1.Agent从大模型到智能体
date: 2026-01-10 15:27:22
tags:
categories:
  - Agent
---
# Agent 学习笔记 (一)：从大语言模型到自主智能体

## 1. 为什么要从 LLM 转向 Agent？(From LLM to Agent)

### 1.1 纯语言模型的局限性

虽然像 Gemini-3 这样的大语言模型（LLM）已经非常强大，但作为开发者，我们常会遇到以下“痛点”：

* **无法主动执行**：它只能“说”，不能“做”。你让它改代码，它只能给你代码片段，却没法直接提交到你的 GitHub 仓库。
* **时效性短板**：它的知识停留在训练截止日期，无法感知现实世界的实时变化。
* **幻觉风险**：在面对复杂任务时，LLM 往往会“一本正经地胡说八道”，缺乏实地验证。

### 1.2 Agent 带来的范式转移

**Agent (智能体)** 的出现解决了这些问题。如果说 LLM 是一个博学但“瘫痪”的大脑，那么 Agent 就是给大脑接上了**感官（感知环境）和四肢（执行任务）**。

**核心理念**：Agent = LLM + 规划 (Planning) + 记忆 (Memory) + 工具使用 (Tool Use)。

---

## 2. 什么是智能体？(Understanding Agents)

### 2.1 智能体的定义

在计算机科学中，智能体是一个能够感知环境、进行推理、并采取行动以实现特定目标的系统。

### 2.2 核心设计框架：PEAS 模型

要设计一个 Agent，我们首先需要从四个维度进行定义，这类似于我们在 Docker 中定义网络和卷：

| 维度 | 说明 | 例子 (以“DevOps 助手”为例) |
| --- | --- | --- |
| **P (Performance)** | **性能标准**：衡量任务是否成功的指标。 | 代码修复成功率、构建通过率。 |
| **E (Environment)** | **环境**：Agent 运行的场所。 | GitHub 仓库、Linux 服务器、CI/CD 流水线。 |
| **A (Actuators)** | **执行器**：Agent 用来改变环境的工具。 | Git 命令、Shell 脚本执行器、API 请求。 |
| **S (Sensors)** | **传感器**：Agent 获取信息的来源。 | 编译报错日志、用户反馈、监控指标。 |

---

## 3. 智能体 vs. 传统自动化 (Agent vs. Workflow)

为了更深入地理解，我们将 Agent 与我们常用的传统自动化脚本进行对比：

| 特性 | 传统自动化 (Deterministic) | LLM 驱动智能体 (Probabilistic) |
| --- | --- | --- |
| **执行逻辑** | 硬编码的 If-Else 逻辑，路径固定。 | 基于 LLM 推理，动态生成执行路径。 |
| **错误处理** | 遇到预设外的错误直接 Crash。 | 能够感知错误，并尝试通过新行动修复。 |
| **交互能力** | 只能处理结构化数据。 | 能理解模糊的自然语言指令。 |
| **适用场景** | 确定性的重复任务（如：定时备份）。 | 开放性的复杂任务（如：根据需求写代码并测试）。 |

---

## 4. 深入理解 Agent 工作流 (Agent Lifecycle)

让我们通过一个典型的任务执行过程，看看 Agent 内部发生了什么。

### 核心循环：ReAct 模式 (Reason + Act)

当你向 Agent 发出一个指令（如：“帮我修复服务器上的 404 报错”）时，它会进入以下闭环：

1. **感知 (Perception)**：
* 从传感器获取初始 Observation（观察），比如读取 Nginx 的 `access.log`。


2. **思考 (Thought)**：
* **分析**：LLM 分析日志发现是静态资源路径配置错误。
* **规划**：决定先备份配置文件，再修改 root 路径。


3. **行动 (Action)**：
* **执行**：调用执行器（Actuators）运行 `sed` 命令修改配置。


4. **观察 (Observation)**：
* **反馈**：重启服务并检测状态码，获取新的执行结果。



**如果目标未达成，则跳转回第 2 步循环执行。**

---

## 5. 动手实践：构建最简单的推理循环

以下是一个高度简化的 Agent 伪代码，体现了核心的“思考-行动”逻辑：

```python
# 模拟 Agent 的核心循环
def run_agent(user_goal):
    history = [f"User Goal: {user_goal}"]
    
    for step in range(max_steps):
        # 1. 思考 (Thought): 调用 LLM 决定下一步做什么
        thought = llm.generate(f"{history}\nWhat is your next thought and action?")
        
        # 2. 行动 (Action): 解析 LLM 提取出的工具调用
        tool_call = parse_tool_call(thought)
        
        # 3. 观察 (Observation): 执行工具并获取反馈
        result = execute_tool(tool_call)
        
        # 将结果反馈给 LLM，形成闭环
        history.append(f"Action: {tool_call}, Observation: {result}")
        
        if "Task Complete" in result:
            break

```

---

## 6. 总结 (Summary)

本章我们明确了 Agent 的基本定义：它不再是简单的问答机器，而是一个**闭环系统**。

* 它具备**自主性**：能自己决定下一步。
* 它具备**适应性**：能根据环境反馈调整策略。

在下一章中，我们将深入探讨 **Agent 的发展史**，从早期的控制论到今天的 Agentic-RL，看看这项技术是如何一步步演进至今的。