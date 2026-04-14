---
title: LeetCode 核心代码模式转 ACM 模式指南
date: 2026-04-14 12:00:00
tags:
  - LeetCode
  - Algorithm
  - ACM
  - Python
categories:
  - leetcode
---

# LeetCode 核心代码模式转 ACM 模式指南

> **题目链接**：[LeetCode 核心代码模式 → ACM 模式转换指南](https://leetcode.cn/)

面试通常是 ACM 模式（自己处理输入输出），而 LeetCode 是核心代码模式（只需写类和方法）。本指南帮助刷题者快速将 LeetCode 解法转换为 ACM 模式。

---

## 一、核心概念对比

| 要素 | 核心代码模式 | ACM 模式 |
|------|-------------|----------|
| 函数签名 | `class Solution` + 方法 | `main()` 入口 |
| 输入来源 | LeetCode 框架传入 | `stdin` |
| 输出方式 | `return` 结果 | `print()` |
| 调试方式 | 内置测试用例 | 手动运行验证 |

---

## 二、Python ACM 模式模板

```python
import sys

def main():
    # ========== 输入处理 ==========
    # 根据题目描述解析输入

    # ========== 调用解法 ==========
    sol = Solution()
    result = sol.原方法名(参数)

    # ========== 输出结果 ==========
    print(result)

if __name__ == "__main__":
    main()
```

---

## 三、常见输入格式处理

### 1. 单行整数数组

```python
# 输入: 1 2 3 4 5
data = sys.stdin.read().strip().split()
nums = list(map(int, data))
```

### 2. 两数之和类（数组 + 目标值）

```python
# 输入:
# 5
# 2 7 11 15
# 9
lines = sys.stdin.read().strip().split()
n = int(lines[0])
nums = list(map(int, lines[1:1+n]))
target = int(lines[1+n])
```

### 3. 矩阵/二维数组

```python
# 输入:
# 3 3        # m 行 n 列
# 1 2 3
# 4 5 6
# 7 8 9
data = sys.stdin.read().strip().split()
m, n = int(data[0]), int(data[1])
grid = []
idx = 2
for i in range(m):
    row = list(map(int, data[idx:idx+n]))
    grid.append(row)
    idx += n
```

### 4. 单行字符串

```python
# 输入: hello
s = sys.stdin.read().strip()
```

### 5. 多行字符串

```python
# 读取全部，保留换行
content = sys.stdin.read()
```

---

## 四、常用数据结构构建函数

### 链表（数组表示）

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_listnode(arr):
    """数组转链表，返回头节点"""
    dummy = ListNode(0)
    cur = dummy
    for v in arr:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def listnode_to_list(head):
    """链表转数组（用于输出）"""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result
```

### 二叉树（层序数组表示）

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    """层序遍历构建二叉树，None 表示空节点
    输入示例: 1 2 3 None 4 5 6
    """
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def tree_to_list(root):
    """层序遍历二叉树返回数组"""
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    # 去掉末尾的 None
    while result and result[-1] is None:
        result.pop()
    return result
```

---

## 五、实战示例：两数之和

### 核心代码模式（LeetCode）

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []
```

### ACM 模式

```python
import sys

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []

def main():
    # 输入格式:
    # 5
    # 2 7 11 15
    # 9
    lines = sys.stdin.read().strip().split()
    n = int(lines[0])
    nums = list(map(int, lines[1:1+n]))
    target = int(lines[1+n])

    sol = Solution()
    result = sol.twoSum(nums, target)
    print(result[0], result[1])

if __name__ == "__main__":
    main()
```

### 运行方式

```bash
# 本地测试
echo -e "5\n2 7 11 15\n9" | python solution.py
# 输出: 0 1
```

---

## 六、常见题目类型输入格式速查

| 题目类型 | 典型输入格式 |
|---------|-------------|
| 两数之和 | `n` + n个数字 + `target` |
| 合并两个有序链表 | `1 2 3` 回车 `4 5 6` |
| 矩阵路径 | `m n` + m×n 矩阵 |
| 二叉树 | 层序数组 `1 2 3 None 4 5` |
| 字符串处理 | 单行或多行文本 |

---

## 七、注意事项

1. **边界情况**：ACM 模式需要自己处理空输入、非法输入
2. **多结果输出**：如需输出多个结果，用空格或换行分隔
3. **调试技巧**：先 hardcode 几组测试用例本地验证，再切换到正式输入
4. **性能**：大规模输入可用 `sys.stdin.read()` 一次性读取，比 `input()` 更快
