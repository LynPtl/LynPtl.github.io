# LynPtl.github.io

---

## 如何发布新文章

这是一个基于 Hexo 的博客，通过 GitHub Actions 自动部署。请遵循以下步骤来添加和发布新内容。

**核心原则：** 所有的源文件（文章、配置等）都在 `source` 分支，网站的最终静态页面会自动发布到 `master` 分支。您只需要在 `source` 分支上工作即可。

### 步骤 1：确保在 `source` 分支

在您的本地项目文件夹中，打开终端并运行以下命令，确保您位于 `source` 分支：

```bash
git checkout source
```

### 步骤 2：创建新文章

使用 Hexo 命令创建一篇新的 Markdown 文章文件：

```bash
hexo new "你的文章标题"
```

Hexo 会在 `source/_posts` 目录下创建一个名为 `你的文章标题.md` 的文件。

### 步骤 3：撰写文章

打开新创建的 Markdown 文件并开始写作。

### 步骤 4：（可选）本地预览

在发布前，您可以在本地预览网站效果。运行以下命令：

```bash
hexo server
```

然后在浏览器中打开 `http://localhost:4000` 查看。

### 步骤 5：提交并推送更改

文章写完后，将您的改动提交到 Git 并推送到 `source` 分支。

```bash
# 添加所有更改
git add .

# 创建一个提交记录
git commit -m "Add new post: 你的文章标题"

# 推送到 source 分支
git push origin source
```

### 步骤 6：等待自动部署

推送完成后，GitHub Actions 会被自动触发。它会自动完成清理、构建和部署网站的所有步骤。您可以在仓库的 "Actions" 标签页查看进度。整个过程大约需要一到两分钟。部署成功后，您的网站就会更新。

---

## 历史问题排错记录

本段落记录了搭建和修复此博客过程中遇到的所有问题及其最终解决方案，以供未来参考。

#### 问题 1：GitHub Actions 无法同步子模块

*   **现象**: CI 报错 `fatal: No url found for submodule path 'themes/landscape' in .gitmodules`。
*   **原因**: 项目合并后，`.gitmodules` 配置文件丢失，导致 Git 找不到 `themes/landscape` 这个子模块的远程仓库地址。
*   **解决**: 手动创建 `.gitmodules` 文件，并填入 `landscape` 主题的官方 Git 仓库地址。

#### 问题 2：GitHub Pages 使用 Jekyll 构建导致主题失败

*   **现象**: CI 报错 `build with jekyll` 和 `The landscape theme could not be found`。
*   **原因**: GitHub Pages 默认使用 Jekyll 引擎来构建网站，但本项目是 Hexo 项目，Jekyll 不识别 Hexo 的主题。
*   **解决**: 创建了自定义的 GitHub Actions 工作流程文件 (`.github/workflows/hexo-deploy.yml`)，指定使用 Node.js 和 Hexo 命令进行构建。

#### 问题 3：工作流程中 `hexo` 命令找不到

*   **现象**: CI 报错 `hexo: command not found`。
*   **原因**: 工作流程直接运行 `hexo generate`，但 `hexo` 命令并未在系统的全局路径中。
*   **解决**: 将构建命令从 `hexo generate` 修改为 `npm run build`。`npm` 会自动使用项目内 `node_modules` 中安装的 Hexo 可执行文件。

#### 问题 4：部署时权限不足

*   **现象**: CI 在部署步骤 `git push` 时报错 `Permission denied (403)`。
*   **原因**: 从 2023 年起，GitHub Actions 的默认 `GITHUB_TOKEN` 权限收紧，默认没有向仓库写入（`git push`）的权限。
*   **解决**: 在工作流程文件中为部署任务添加 `permissions: contents: write` 设置，明确授予写权限。

#### 问题 5：网站部署后不更新（分支错误）

*   **现象**: CI 显示成功，但 `github.io` 网站内容没有变化。
*   **原因**: 对于用户主页 (`<user>.github.io`)，GitHub Pages 只会从 `master` 分支读取内容。而当时的工作流程被配置为部署到 `gh-pages` 分支。
*   **解决**: 调整部署策略：创建 `source` 分支用于存放博客源码，修改工作流程，使其在 `source` 分支触发，并将构建好的静态网站强制推送到 `master` 分支。

#### 问题 6：网站部署后不更新（Pages 设置错误）

*   **现象**: 调整分支后，网站依然不更新。
*   **原因**: 在 GitHub Pages 的设置中，构建源被错误地设置为了 "GitHub Actions"，它期望一个特定的构建产物。而我们的流程是直接向 `master` 分支推送文件。
*   **解决**: 将 GitHub Pages 的构建源改回 "Deploy from a branch"，并指定 `master` 分支作为源。

#### 问题 7：网站内容陈旧

*   **现象**: 网站有更新，但显示的是非常旧的版本。
*   **原因**: Hexo 的构建过程可能存在缓存，`hexo generate` 没有清理掉旧的构建文件，导致部署了过期的内容。
*   **解决**: 在工作流程的构建步骤中，加入 `hexo clean` 命令。修改为 `npm run clean && npm run build`，确保每次都是全新的构建。

#### 问题 8：本地 `hexo server` 运行失败

*   **现象**: 本地服务无法启动，报错 `YAMLException: duplicated mapping key`。
*   **原因**: 在修复主题配置的过程中，自动化工具错误地在 `themes/landscape/_config.yml` 文件中添加了重复的菜单项 `图床`。
*   **解决**: 手动编辑该配置文件，删除重复的行，修复 YAML 语法错误。

#### 问题 9：CI 无法拉取子模块的特定提交

*   **现象**: CI 报错 `Direct fetching of that commit failed`。
*   **原因**: 在修复主题配置时，在子模块 `themes/landscape` 内部产生了一个本地提交。这个提交的记录被推送到了主仓库，但提交本身的内容并未被推送到主题的官方远程仓库（也无权限推送）。
*   **解决**: 采取“弹出”方案。将 `themes/landscape` 子模块彻底从项目中移除，并将其文件作为普通文件夹直接添加到主项目中，一劳永逸地解决了所有与子模块相关的复杂性。
