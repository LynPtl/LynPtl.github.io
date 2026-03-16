---
title: 4.Docker数据持久化和网络与多容器编排
date: 2026-01-08 23:17:57
tags:
  - Docker
  - Volume
  - Network
  - Compose
categories:
  - Docker
---
# Docker 学习笔记 (四)：数据持久化、网络与多容器编排

## 1. 数据持久化 (Docker Volumes)

在之前的章节中，我们学会了如何运行容器。但你可能会发现一个问题：当容器被删除 (<code>docker rm</code>) 后，你在容器内产生的数据（比如数据库里的记录、日志文件）也随之消失了。

### 1.1 为什么要使用 Volume？
默认情况下，容器的文件系统是临时的。<strong>Docker Volumes</strong> 的出现是为了解决数据持久化的问题，它允许我们将数据存储在容器的生命周期之外。

<strong>核心优势</strong>：
<em>   <strong>数据持久化 (Data Persistence)</strong>：即使容器停止或被删除，数据依然存在。
</em>   <strong>数据共享 (Data Sharing)</strong>：多个容器可以同时挂载同一个 Volume 来共享数据。
<em>   <strong>解耦 (Decoupling)</strong>：将数据与应用运行环境分离，便于管理和备份。

### 1.2 Volume 的三种类型

根据使用场景不同，Docker 提供了三种挂载方式：

| 类型 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| <strong>Bind Mounts</strong> | 直接将宿主机的特定目录或文件映射到容器中。 | <strong>开发环境</strong>。例如将本地源代码目录挂载进容器，代码修改后容器内实时生效。 |
| <strong>Named Volumes</strong> | 由 Docker 在宿主机的一个特定区域（通常是 <code>/var/lib/docker/volumes</code>）管理。用户给它起个名字，方便复用。 | <strong>生产环境持久化数据</strong>。例如数据库文件，这是最推荐的方式。 |
| <strong>Anonymous Volumes</strong> | 类似于 Named Volumes，但没有名字（只有一串随机 ID）。 | 通常用于不需要持久化太久或不关心具体位置的临时数据。 |

### 1.3 常用 Volume 操作命令 (Volume CLI)

仅仅理解概念是不够的，这里是如何在命令行中实际操作 Volume：

</em>   <strong>创建 Volume</strong>:
    ``<code>bash
    docker volume create my-vol
    </code>`<code>
<em>   <strong>挂载 Volume 启动容器</strong>:
    使用 </code>-v<code> 参数将 </code>my-vol<code> 挂载到容器内的 </code>/app/data<code> 目录。
    </code>`<code>bash
    docker run -d -v my-vol:/app/data mongo
    </code>`<code>
</em>   <strong>查看所有 Volume</strong>:
    </code>`<code>bash
    docker volume ls
    </code>`<code>
<em>   <strong>查看 Volume 详情</strong> (如在宿主机上的具体路径):
    </code>`<code>bash
    docker volume inspect my-vol
    </code>`<code>
</em>   <strong>删除 Volume</strong> (注意：必须先删除使用该 Volume 的容器):
    </code>`<code>bash
    docker volume rm my-vol
    </code>`<code>

---

## 2. 进阶配置 (Advanced Topics)

除了基础运行，我们在生产环境中还需要关注容器的稳定性和资源控制。

### 2.1 资源限制 (Resource Limits)
如果不加限制，一个容器可能会吃掉宿主机所有的 CPU 和内存，导致机器卡死。我们可以通过参数进行限制：

<em>   <strong>CPU 限制</strong>：控制容器能使用的计算能力。
</em>   <strong>内存限制</strong>：防止内存泄漏导致 OOM (Out Of Memory)。

</code>`<code>bash
# 示例：限制容器最多使用 0.5 个 CPU 核和 512MB 内存
docker run -d --cpus="0.5" --memory="512m" nginx
</code>`<code>

### 2.2 重启策略 (Restart Policies)
定义容器退出（Exit）后的行为，这对保证服务高可用非常重要。

<em>   </code>no<code>: 默认值。不管什么情况，挂了就不重启。
</em>   </code>on-failure<code>: 只有在非正常退出（退出码非 0）时才重启。
<em>   </code>always<code>: 只要容器停止了就重启（手动 stop 除外）。
</em>   </code>unless-stopped<code>: 类似于 always，但在 Docker 守护进程重启时（比如服务器重启），如果容器之前是人为停止的，就不会自动启动。

---

## 3. Docker 网络 (Networking)

Docker 网络提供了容器间通信的基础设施，同时保持了隔离性。

### 3.1 网络驱动模式 (Network Drivers)

| 驱动 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| <strong>Bridge (默认)</strong> | 在宿主机创建一个私有网络。容器通过端口映射与外部通信，容器间通过 IP 通信。 | 单机环境下的绝大多数应用。 |
| <strong>Host</strong> | 移除网络隔离，容器直接使用宿主机的 IP 和端口。 | 需要极致网络性能，或不需要隔离的场景。 |
| <strong>None</strong> | 禁用网络，容器只有本地回环地址。 | 极高安全要求的隔离环境。 |
| <strong>Overlay</strong> | 允许跨多台宿主机的容器通信。 | <strong>Docker Swarm</strong> 或集群环境。 |

### 3.2 最佳实践：用户自定义网络
不要依赖默认的 </code>bridge<code> 网络。创建一个自定义网络可以让容器通过<strong>容器名 (Container Name)</strong> 互相访问（内置 DNS 解析），而不需要记随时变动的 IP 地址。

</code>`<code>bash
# 1. 创建网络
docker network create my-app-net

# 2. 启动容器加入网络
docker run -d --name db --network my-app-net mongo
docker run -d --name web --network my-app-net -p 80:80 my-web-app
# 此时，web 容器里代码连接数据库只需要填主机名为 "db" 即可。
</code>`<code>

---

## 4. Docker Compose：多容器编排

### 4.1 痛点：手动管理的噩梦
在微服务架构中，一个应用可能包含前端、后端 API、数据库、Redis 缓存等多个服务。
如果只用 </code>docker run<code>：
1.  你需要分别启动 4 个容器。
2.  你需要记住复杂的启动命令（端口、环境变量、网络、挂载卷）。
3.  你需要手动控制启动顺序（先启数据库，再启后端）。

### 4.2 解决方案：Docker Compose
<strong>Docker Compose</strong> 是一个用于定义和运行多容器 Docker 应用程序的工具。我们使用 YAML 文件来配置应用的服务。

> <strong>💡 关于“服务名” (Service Name) 的命名：</strong>
> 在 </code>docker-compose.yml<code> 中，</code>services:<code> 下方的第一层缩进（如 </code>web:<code>, </code>db:<code>）就是<strong>服务名</strong>。
> 当你运行 </code>docker-compose up -d<code> 时，Compose 会基于这些服务名自动创建容器名（通常格式为 </code>项目名_服务名_1<code>）。
> 在后续操作中（如 </code>pause<code>, </code>logs<code>, </code>restart<code>），你只需要使用 YAML 文件中定义的<strong>服务名</strong>即可，Compose 会自动帮你找到对应的容器。

<strong>核心优势</strong>：
<em>   <strong>声明式配置</strong>：在一个文件中定义所有服务、网络和卷。
</em>   <strong>一键启动/停止</strong>：一条命令管理整个生命周期。
<em>   <strong>环境一致性</strong>：开发、测试、生产使用同一套配置。

### 4.3 </code>docker-compose.yml<code> 实战解析

下面是一个典型的全栈应用配置示例：

</code>`<code>yaml
version: '3.8'  # 指定 Compose 文件版本

services:
  # 1. 前端/Web 服务
  web:
    image: nginx:latest
    ports:
      - "80:80"       # 映射端口
    networks:
      - my_network    # 加入网络
    depends_on:
      - api           # 确保 api 服务先启动

  # 2. 后端 API 服务
  api:
    build: ./backend  # 支持直接从 Dockerfile 构建
    environment:
      - DB_HOST=db    # 环境变量配置
    networks:
      - my_network
    depends_on:
      - db

  # 3. 数据库服务
  db:
    image: mongo:latest
    volumes:
      - db-data:/data/db  # 使用 Named Volume 持久化数据
    networks:
      - my_network

# 定义全局 Volume
volumes:
  db-data:

# 定义全局网络
networks:
  my_network:
</code>`<code>

### 4.4 常用命令

</em>   <strong>启动所有服务</strong> (后台运行)：
    </code>`<code>bash
    docker-compose up -d
    </code>`<code>
<em>   <strong>停止所有服务</strong> (仅停止容器，不移除)：
    </code>`<code>bash
    docker-compose stop
    </code>`<code>
</em>   <strong>停止并移除所有资源</strong> (容器、网络、镜像等)：
    </code>`<code>bash
    docker-compose down
    </code>`<code>
    > <strong>⚠️ 注意 </code>stop<code> vs </code>down<code>：</strong>
    > </code>stop<code> 只是把容器关掉，容器还在；</code>down<code> 会把容器彻底删掉，网络也会被清理。

<em>   <strong>查看服务日志</strong>：
    </code>`<code>bash
    docker-compose logs -f
    </code>`<code>
</em>   <strong>暂停/恢复特定服务</strong> (这里的 </code>db<code> 就是我们在 YAML 里定义的那个名字)：
    </code>`<code>bash
    docker-compose pause db
    docker-compose unpause db
    </code>`<code>
<em>   <strong>停止特定服务</strong>:
    如果你只想停止 </code>db<code> 而不影响其他服务：
    </code>`<code>bash
    docker-compose stop db
    </code>`<code>
</em>   <strong>不在当前目录时指定文件</strong>:
    如果你不在 </code>docker-compose.yml<code> 所在的目录，可以使用 </code>-f<code> 参数指定文件路径：
    </code>`<code>bash
    # 比如你的配置文件在 /opt/myapp/docker-compose.yml
    docker-compose -f /opt/myapp/docker-compose.yml pause db
    </code>`<code>

---

## 总结 (Summary)

通过这四章的学习，你已经掌握了 Docker 的核心技能：
1.  <strong>概念</strong>：理解了容器 vs 虚拟机，以及镜像、容器、仓库的关系。
2.  <strong>操作</strong>：学会了 </code>run<code>, </code>build<code>, </code>push<code> 等生命周期管理命令。
3.  <strong>构建</strong>：能够编写 </code>Dockerfile` 制作自己的镜像。
4.  <strong>进阶</strong>：掌握了 <strong>Volume</strong> 数据持久化、<strong>Network</strong> 网络通信以及 <strong>Compose</strong> 多容器编排。

接下来的旅程，我们会进一步探索 <strong>Kubernetes (K8s)</strong>，它是容器编排的终极形态，用于管理成百上千个跨主机的容器。
