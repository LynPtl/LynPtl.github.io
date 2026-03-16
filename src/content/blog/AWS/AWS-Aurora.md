---
title: AWS Aurora
date: 2026-02-22 09:57:53
tags:
  - AWS
  - Database
  - SAA
  - Aurora
categories:
  - AWS
---

# AWS Aurora

## 1. Aurora 基础与架构

Amazon Aurora 是 AWS 专为云打造的关系型数据库，兼容 <strong>MySQL</strong> 和 <strong>PostgreSQL</strong>。它的核心理念是将“计算”与“存储”分离。

<em>   <strong>核心优势</strong>：
    </em>   <strong>性能</strong>：宣称比标准 MySQL 快 5 倍，比 PostgreSQL 快 3 倍。
    <em>   <strong>存储架构 (The "Magic" Part)</strong>：
        </em>   <strong>共享存储卷 (Cluster Volume)</strong>：跨越多个可用区 (AZ) 的虚拟存储卷。
        <em>   <strong>6 份副本</strong>：数据自动在 3 个 AZ 中各存 2 份（共 6 份）。
        </em>   <strong>容错能力</strong>：即使失去 2 份副本（影响写入）或 3 份副本（影响读取），数据库仍能正常工作。
        <em>   <strong>自动修复</strong>：存储层具备自我修复能力，持续扫描并修复错误数据块。
    </em>   <strong>自动扩展存储</strong>：
        <em>   起始容量 10 GB，根据需求自动增长，最大支持 <strong>128 TiB</strong>。无需预置存储容量。

---

## 2. 集群与端点 (Endpoints)

理解不同的 Endpoint 是考试中配置应用连接的关键。

</em>   <strong>Cluster Endpoint (集群端点/写入端点)</strong>：
    <em>   <strong>唯一性</strong>：每个集群只有一个。
    </em>   <strong>指向</strong>：始终指向当前的 <strong>Primary Instance</strong> (主实例)。
    <em>   <strong>用途</strong>：处理所有的 <strong>写操作</strong> (DDL/DML) 和读操作。
</em>   <strong>Reader Endpoint (读者端点)</strong>：
    <em>   <strong>负载均衡</strong>：在所有可用的 <strong>Aurora Replicas</strong> (只读副本) 之间进行 DNS 级别的负载均衡。
    </em>   <strong>用途</strong>：处理 <strong>只读</strong> 流量。
    <em>   <strong>注意</strong>：不要用它做写操作，否则会报错。
</em>   <strong>Custom Endpoint (自定义端点)</strong>：
    <em>   <strong>场景</strong>：业务隔离。例如，你希望“分析型查询”只跑在两台高配的大内存副本上，而“普通查询”跑在小实例上。
    </em>   <strong>机制</strong>：你可以创建一个自定义端点，只包含特定的实例子集。
<em>   <strong>Instance Endpoint (实例端点)</strong>：
    </em>   直接连接到特定实例。通常仅用于排查特定节点故障，不建议用于生产流量。

---

## 3. 扩展性与副本 (Scaling & Replicas)

### 3.1 Aurora Replicas (只读副本)
<em>   <strong>数量限制</strong>：最多支持 <strong>15 个</strong> 只读副本（标准 RDS 仅支持 5 个）。
</em>   <strong>低延迟</strong>：由于共享底层存储，复制延迟通常在毫秒级（标准 RDS 依靠异步日志复制，延迟较高）。
<em>   <strong>故障转移 (Failover)</strong>：
    </em>   如果主实例挂了，Aurora 会自动将一个 Read Replica 提升为主实例（Tier 0 优先级最高）。
    <em>   <strong>无需更改 Endpoint</strong>：Cluster Endpoint 会自动指向新主实例，应用层感知极小。

### 3.2 Auto Scaling
</em>   <strong>机制</strong>：根据 CPU 利用率或连接数，自动添加或删除 Aurora Replicas。
<em>   <strong>适用场景</strong>：应对不可预测的读取流量峰值。

### 3.3 Aurora Global Database (全球数据库)
</em>   <strong>架构</strong>：跨越多个 AWS 区域 (Regions)。1 个主区域 (读写) + 最多 5 个从区域 (只读)。
<em>   <strong>物理复制</strong>：使用专用骨干网进行存储层复制，延迟极低（通常 < 1秒）。
</em>   <strong>RPO & RTO</strong>：
    <em>   <strong>RPO (数据丢失)</strong>：< 1 秒。
    </em>   <strong>RTO (恢复时间)</strong>：< 1 分钟。
<ul><li>  <strong>用途</strong>：灾难恢复 (DR) 和本地化低延迟读取。</li>
</ul>
---

## 4. Aurora Serverless

这是无需管理实例的按需选项，分为 V1 和 V2。

<em>   <strong>Aurora Serverless V2 (推荐/当前标准)</strong>：
    </em>   <strong>特点</strong>：毫秒级瞬间扩展，支持 Multi-AZ，支持 Global Database，支持只读副本。
    <em>   <strong>容量单位</strong>：ACU (Aurora Capacity Unit)。最小 0.5 ACU，最大 128 ACU。
    </em>   <strong>适用场景</strong>：生产环境、SaaS 应用、绝大多数波动负载。
<em>   <strong>Aurora Serverless V1 (旧版/限制多)</strong>：
    </em>   <strong>特点</strong>：缩容到 0 时会暂停计算（冷启动有延迟）。不支持很多高级特性。
    <em>   <strong>适用场景</strong>：不常用的开发/测试环境，允许冷启动延迟的业务。
</em>   <strong>Data API</strong>：
    <em>   <strong>机制</strong>：通过 HTTPS API 执行 SQL，无需建立持久的数据库连接（Connection Pooling）。
    </em>   <strong>搭档</strong>：<strong>AWS Lambda</strong> 的最佳拍档。解决了 Lambda 大量并发连接耗尽数据库连接池的问题。

---

## 5. 高级功能 (Advanced Features)

### 5.1 Aurora Multi-Master
<em>   <strong>机制</strong>：所有节点都可以写入。
</em>   <strong>适用场景</strong>：需要<strong>持续写入可用性</strong>的极端场景。如果一个节点挂了，其他节点可以立即接管写入，零停机时间。
<em>   </em>注意<em>：仅支持 MySQL，且有一定性能开销和复杂性。

### 5.2 Backtrack (回溯)
</em>   <strong>机制</strong>：像时光机一样，将数据库“倒带”到过去的任意时间点（例如倒回到 30 分钟前）。
<em>   <strong>特点</strong>：极快，不涉及数据恢复操作，直接在存储层操作。
</em>   <strong>限制</strong>：仅限 Aurora MySQL。不替代备份（回溯窗口有限，如 72 小时）。

### 5.3 Cloning (克隆)
<em>   <strong>机制</strong>：Copy-on-Write (写时复制) 技术。
</em>   <strong>速度</strong>：瞬间完成，无论数据库多大。最初不占用额外存储空间，只有当源或新库修改数据时才产生差异存储费。
<em>   <strong>场景</strong>：快速创建生产环境的副本用于测试 (Staging/Test)。

### 5.4 Zero-ETL Integration with Redshift
</em>   <strong>机制</strong>：Aurora 数据自动、近实时地同步到 Redshift 数仓，无需编写 ETL 管道（Glue/Lambda）。

---

## 6. 最佳实践总结 (Exam Tips)

结合以往易错知识点，以下是几个在实际应用和考试中常见的判断场景：

> <strong>Note - 高可用架构选型</strong>：
> <em>   <strong>当需要跨区域容灾且要求极低的数据丢失率（RPO < 1s）时</strong>：优先选择 <strong>Global Database</strong>。尽量避免使用跨区域只读副本（Cross-Region Read Replica），因为其复制延迟较高且提升为主节点的过程较为繁琐。
> </em>   <strong>当仅需要单区域高可用时</strong>：默认启动 <strong>Multi-AZ</strong> 即可，Aurora 会在底层自动处理跨 AZ 的数据同步和故障转移。
> <em>   <strong>当业务要求写入操作必须零停机时</strong>：考虑使用 <strong>Multi-Master</strong> 架构，让多个节点同时具备写入能力。

> <strong>Note - 性能优化策略</strong>：
> </em>   <strong>当面对突发的大量读取流量时</strong>：建议配置 <strong>Aurora Auto Scaling</strong> 来动态增减只读副本（Read Replicas）。
> <em>   <strong>当繁重的报表查询拖慢了主业务性能时</strong>：可以通过创建 <strong>Custom Endpoint（自定义端点）</strong>，将这些分析型查询专门路由到指定的副本实例上。
> </em>   <strong>当频繁的短连接（如来自 Lambda）耗尽数据库连接数时</strong>：引入 <strong>RDS Proxy</strong> 进行连接池管理，或者改用 <strong>Aurora Serverless Data API</strong> 来执行操作。

> <strong>Note - 成本管理与日常运维</strong>：
> <em>   <strong>对于存在明显波峰波谷，或者只是偶尔使用的开发/测试环境</strong>：<strong>Aurora Serverless V2</strong> 是个省心省钱的选择（如果对冷启动延迟不敏感，V1 也是一种方案）。
> </em>   <strong>当需要快速复制出一个和生产库一模一样的测试库时</strong>：务必使用 <strong>Database Cloning（数据库克隆）</strong>。比起传统的快照恢复，它不仅速度极快，还能省下大量初始的存储成本。

> <strong>Note - Aurora 与传统 RDS 的区别线索</strong>：
> 遇到以下场景或需求时，通常是 Aurora 发挥优势的地方：
> <em>   提到 <strong>"Storage Auto Scaling"</strong>（无需预置，存储容量随需自动扩展）。
> </em>   需要强悍的读扩展能力（最多支持 <strong>15 个</strong> Read Replicas）。
> *   强调 <strong>"Instant Crash Recovery"</strong>（瞬间奔溃恢复，得益于不依赖 redo log 重放的存储引擎）。