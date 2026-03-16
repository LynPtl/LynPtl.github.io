---
title: 2.Agent智能体分类
date: 2026-01-11 16:00:13
tags:
categories:
  - Agent
---
# Agent 学习笔记 (二)：智能体的进化之路与分类图谱

## 1. 智能体的发展历程 (The Evolution of Agents)

### 1.1 从控制论到大模型：三个关键阶段

智能体并不是横空出世的概念，它的演进经历了从“硬编码”到“自我学习”，再到如今“常识推理”的跨越。

1. <strong>早期控制论 (Cybernetics & Symbolic AI)</strong>：
<em> <strong>特点</strong>：基于固定的逻辑门和专家系统。
</em> <strong>痛点</strong>：只能处理高度结构化的环境，稍微改变规则就会失效（脆性）。


2. <strong>强化学习时代 (Reinforcement Learning)</strong>：
<em> <strong>特点</strong>：Agent 通过“试错”和奖励机制（Reward）来学习策略。
</em> <strong>代表</strong>：AlphaGo。
<em> <strong>痛点</strong>：泛化能力极弱。下围棋的智能体没法帮你订机票，每个任务都需要从零训练。


3. <strong>大模型驱动时代 (LLM-based Agents)</strong>：
</em> <strong>特点</strong>：以大模型为“大脑”，利用海量的通用知识进行零样本（Zero-shot）推理。
<em> <strong>救赎</strong>：赋予了 Agent 真正的“通用性”，使其能够像人类一样通过自然语言理解复杂意图。
---

## 2. 智能体的核心分类 (Taxonomy of Agents)

在经典的 AI 理论（如《AIMA》）中，根据 Agent 的“聪明程度”和处理逻辑，通常将其分为以下五类。理解这些分类有助于我们在工程实践中选择最合适的架构。

| 类型 | 核心逻辑 | 适用场景 |
| --- | --- | --- |
| <strong>简单反射智能体 (Simple Reflex)</strong> | 根据当前感知直接做出反应 (Condition-Action)。 | 简单的自动化脚本（如：检测到 CPU 占用 > 90% 就告警）。 |
| <strong>基于模型的反射 (Model-based)</strong> | 能够维护一个“内部状态”，记录当前看不到的环境信息。 | 复杂的系统监控（需要结合历史状态判断当前异常）。 |
| <strong>基于目标的智能体 (Goal-based)</strong> | 拥有明确的目标，会主动寻找达成路径。 | <strong>我们目前学习的主流 Agent</strong>（如：帮我部署一套 K8s 集群）。 |
| <strong>基于效用的智能体 (Utility-based)</strong> | 不仅要完成目标，还要寻找“最优解”（如最省钱、最快速）。 | 资源调度优化、路径规划。 |
| <strong>学习智能体 (Learning Agents)</strong> | 能够从执行结果中学习，不断改进性能。 | 自我进化的代码修复 Agent。 |

---

## 3. 现代 LLM Agent 的架构范式 (Modern Paradigms)

在当前的工程实践中，我们更多地从“运作模式”来区分 Agent。这类似于 Docker Compose 中对不同 Service 的定义方式。

### 3.1 自主智能体 (Autonomous Agents)

</em> <strong>定义</strong>：给定一个高层目标（Goal），Agent 自行拆解步骤、调用工具并完成任务。
<em> <strong>例子</strong>：AutoGPT。你告诉它“帮我调研某项技术并写一份报告”，剩下的它全包。

### 3.2 协作智能体 (Multi-Agent Systems, MAS)

</em> <strong>定义</strong>：多个 Agent 扮演不同角色（如：程序员、测试员、架构师），通过对话协作完成复杂工程。
<em> <strong>类比</strong>：这非常像我们 IT 开发中的<strong>团队协作模式</strong>。每个 Agent 只需要精通自己的领域。

---

## 4. 深入理解：智能体的“心智模型” (Mindset of an Agent)

正如 Docker 容器需要镜像（Image）作为模板，Agent 的运行依赖于以下三个核心支柱的解耦：

1. <strong>Planning (规划能力)</strong>：将大目标拆解为子任务（Task Decomposition）。
2. <strong>Memory (记忆能力)</strong>：
</em> <strong>短期记忆</strong>：Context（上下文）。
<em> <strong>长期记忆</strong>：Vector DB（向量数据库 / RAG）。


3. <strong>Tool Use (工具调用)</strong>：通过 API 扩展能力边界。

---

## 5. 总结 (Summary)

Agent 的进化史本质上是<strong>“自动化程度”不断提升</strong>的过程。

</em> 从早期的 <code>If-Else</code> 到现在的 <code>LLM Reasoning</code>。
<ul><li>从单一任务的脚本到具备“心智”的自主实体。</li></ul>