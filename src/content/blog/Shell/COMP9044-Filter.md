---
title: "Unix/Linux 文本处理利器：常用过滤器 (Unix Text Processing Filters)"
date: 2026-02-19 15:25:37
tags:
  - Unix
  - Linux
  - Shell
  - Text Processing
categories:
  - Shell入门
---

# Unix/Linux 文本处理利器：常用过滤器指南

在 Unix/Linux 环境下，一切皆文件。高效处理文本数据是系统管理、日志分析和日常开发的核心技能。本文总结了最高频率使用的文本“过滤器”命令，助你快速掌握管道 (Pipeline) 哲学的精髓。

---

## 一、 核心搜索与匹配 (Search & Match)

搜索是处理文本的第一步，<code>grep</code> 是其中绝对的王者。

### <strong>1. <code>grep</code> (Global Regular Expression Print)</strong>
<em>   <strong>功能</strong>：在输入流或文件中搜索符合特定模式 (Pattern) 的行，并将匹配行输出。
</em>   <strong>核心记忆点</strong>：它是按 <strong>行</strong> 处理的过滤器。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong><code>-E</code></strong> | 使用扩展正则表达式 (Extended Regex) | <strong>E</strong>xtended | <strong>必记</strong>。建议默认开启，否则 <code>+</code>, <code>?</code>, <code>\|</code> 等符号需转义。 |
| <strong><code>-F</code></strong> | 按<strong>固定字符串</strong>匹配 (Fixed) | <strong>F</strong>ixed | <strong>必考</strong>。取消模式中所有正则符号的特殊含义，视为纯文本。 |
| <strong><code>-P</code></strong> | 使用 <strong>Perl</strong> 兼容正则 | <strong>P</strong>erl | <strong>最强正则</strong>。支持非贪婪匹配、零宽断言 (Lookahead) 等高级功能。 |
| <strong><code>-i</code></strong> | 忽略大小写 | <strong>I</strong>gnore case | 匹配 <code>error</code> 同时也能匹配 <code>Error</code> 或 <code>ERROR</code>。 |
| <strong><code>-v</code></strong> | 反向匹配，打印<strong>不</strong>匹配的行 | In<strong>V</strong>ert | 用于过滤掉已知无关信息。 |
| <strong><code>-c</code></strong> | 只打印匹配行的<strong>数量</strong> | <strong>C</strong>ount | 仅输出统计数字，不显示行内容。 |
| <strong><code>-w</code></strong> | 强制匹配整个单词 | <strong>W</strong>ord | 避免 <code>cat</code> 误匹配到 <code>category</code>。 |
| <strong><code>-n</code></strong> | 显示匹配行所在的行号 | <strong>N</strong>umber | 方便快速定位。 |
| <strong><code>-l</code></strong> | 只输出匹配的<strong>文件名</strong> | <strong>L</strong>ist files | 查找存在指定模式的文件名，不显示内容。 |
| <strong><code>-r</code></strong> | 递归搜索目录 | <strong>R</strong>ecursive | <code>grep -r "pattern" ./dir</code> 在目录下所有文件中找。 |
| <strong><code>-A</code> / <code>-B</code> / <code>-C</code></strong> | 打印上下文行 | <strong>A</strong>fter/ <strong>B</strong>efore/ <strong>C</strong>ontext | <code>-C 2</code> 打印匹配行及前后各两行 (看日志报错上下文必备)。 |

> <strong>💡 技术贴士：<code>grep -F</code> 的“全文字面匹配”</strong>
> 当你需要搜索包含 <code>.</code>、<code><em></code>、<code>[</code> 或 <code>$</code> 等正则特殊字符，且不想写一堆反斜杠转义时，使用 <code>-F</code>。
> </em>   <strong>常规做法</strong>：<code>grep "127\.0\.0\.1"</code> (点号需转义)
> <em>   <strong><code>-F</code> 做法</strong>：<code>grep -F "127.0.0.1"</code> (所有字符均视为普通字符，速度也更快)。
> 
> > <strong>💡 技术贴士：<code>grep -P</code> 的“正则天花板”</strong>
> > 当 <code>-E</code> (ERE) 无法满足需求（如需要非贪婪匹配或逻辑断言）时，请祭出 <code>-P</code>。
> > </em>   <strong>非贪婪匹配</strong>：<code>grep -P "a.<em>?b"</code> (匹配到第一个 b 就停，而不是最后一个)。
> > </em>   <strong>零宽断言</strong>：<code>grep -P '(?<=User: )\w+'</code> (只提取 User: 后面的用户名，但不包含 User: 本身)。

<strong>使用示例：</strong>
<em>   <strong>样例文本 (<code>logs.txt</code>)</strong>：
    ``<code>text
    10:01 INFO User login: admin
    10:02 ERROR DB connection failed
    10:03 INFO Data saved
    </code>`<code>
</em>   <strong>样例命令</strong>：</code>grep "ERROR" logs.txt<code>
<em>   <strong>样例输出</strong>：
    </code>`<code>text
    10:02 ERROR DB connection failed
    </code>`<code>

---

## 二、 文本切片与提取 (Slicing)

用于从庞大的文本流中提取特定的部分（按行或按列）。

### <strong>2. </code>cut<code></strong>
</em>   <strong>功能</strong>：按 <strong>列</strong> (字段) 提取文本内容。
<em>   <strong>核心记忆点</strong>：处理表格化数据（如 CSV, </code>/etc/passwd<code>）。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-f<code></strong> | 指定提取字段 (Fields) | <strong>F</strong>ield | <strong>从 1 开始计数</strong>。支持列表和范围，如 </code>-f 1,3-5<code>。 |
| <strong></code>-d<code></strong> | 指定列的分隔符 (Delimiter) | <strong>D</strong>elimiter | <strong>默认为 Tab</strong>。处理 CSV 需显式用 </code>-d ','<code>。 |
| <strong></code>-c<code></strong> | 按字符位置提取 | <strong>C</strong>haracter | 如 </code>-c 1-5<code> 提取每行前 5 个字符。 |
| <strong></code>--complement<code></strong> | 补集提取 | <strong>Complement</strong> | 提取除指定列<strong>以外</strong>的所有列。 |

> <strong>💡 技术贴士：</code>cut<code> 的强迫症（列排序坑）</strong>
> 无论你指定的字段顺序如何，</code>cut<code> <strong>永远按照原文件中的列顺序输出</strong>。
> 例如：</code>cut -f 3,1 file<code> 和 </code>cut -f 1,3 file<code> 的输出结果是<strong>一模一样</strong>的（都是先输出第1列，再第3列）。它不能用于交换列的顺序！（需排版组合请用 </code>awk<code>）

<strong>使用示例：</strong>
</em>   <strong>样例文本 (</code>user.csv<code>)</strong>：
    </code>`<code>text
    id,name,email
    1,Alice,alice@example.com
    2,Bob,bob@example.com
    </code>`<code>
<em>   <strong>样例命令</strong>：</code>cut -d ',' -f 2 user.csv<code>
</em>   <strong>样例输出</strong>：
    </code>`<code>text
    name
    Alice
    Bob
    </code>`<code>

### <strong>3. </code>head<code> / </code>tail<code></strong>
<em>   <strong>功能</strong>：分别输出输入的 <strong>前 N 行</strong> 或 <strong>后 N 行</strong>。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-n<code></strong> | 指定显示的行数 | <strong>N</strong>umber | 如 </code>head -n 5<code>。若不指定，默认通常显示 10 行。 |
| <strong></code>-n +K<code></strong> | 从第 K 行开始输出到末尾 (tail特有) | | <strong>核心考点</strong>：</code>tail -n +2 file.csv<code> 常用于 <strong>跳过 CSV 表头</strong>。 |
| <strong></code>-f<code></strong> | 实时追踪文件增长 (tail 特有) | <strong>F</strong>ollow | 常用于实时查看日志。 |

---

## 三、 字符级转换 (Transformation)

### <strong>4. </code>tr<code> (Translate)</strong>
</em>   <strong>功能</strong>：基于 <strong>字符</strong> (而非单词) 进行替换、删除或压缩。
<em>   <strong>核心记忆点</strong>：</code>tr<code> <strong>不接受文件名作为参数</strong>，必须通过管道 </code>|<code> 或重定向 </code><<code> 接收输入。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-d<code></strong> | 删除匹配字符集中的字符 | <strong>D</strong>elete | 如 </code>tr -d '0-9'<code> 删除所有数字。 |
| <strong></code>-s<code></strong> | 将连续重复字符压缩为一个 | <strong>S</strong>queeze | 如 </code>tr -s ' '<code> 将多个连续空格压制为一个。 |
| <strong></code>-c<code></strong> | 对字符集取反 (Complement) | <strong>C</strong>omplement | 操作除指定字符集 <strong>以外</strong> 的字符。 |

> <strong>💡 技术贴士：</code>tr<code> 的“固执”设计</strong>
> </em>   <strong>纯粹的过滤器</strong>：</code>tr<code> 是 Unix 中极少数<strong>完全不支持</strong>文件名参数的命令。它没有 </code>tr 'a' 'b' file.txt<code> 这种用法，必须配合管道 </code>|<code> 或 </code><<code> 使用。
> <em>   <strong>字符 vs 单词</strong>：</code>tr<code> 处理的是 <strong>字符级</strong> 映射。</code>tr 'apple' 'ABCDE'<code> 并不是替换单词，而是把 a 换成 A，p 换成 B... 如果你需要处理单词，请使用 </code>sed<code>。


<strong>使用示例：</strong>
</em>   <strong>示例 1：基础字符替换 (管道)</strong>
    </code>echo "hello world" | tr 'a-z' 'A-Z'<code> -> </code>HELLO WORLD<code>
<em>   <strong>示例 2：文件输入与输出重定向 (核心用法)</strong>
    如果你想处理文件 </code>file.txt<code> 并保存到 </code>output.txt<code>：
    </code>`<code>bash
    tr 'a-z' 'A-Z' < file.txt > output.txt
    </code>`<code>
    </em>   </code>< file.txt<code> 将文件内容喂给 </code>tr<code> 的标准输入。
    *   </code>> output.txt<code> 将处理后的结果保存。
<em>   <strong>示例 3：压缩连续空格并删除数字</strong>
    </code>`<code>bash
    cat data.txt | tr -s ' ' | tr -d '0-9'
    </code>`<code>
    </em>(利用管道连接多个 </code>tr<code> 命令或从 </code>cat<code> 读取)<em>

---

## 四、 统计、排序与去重 (Aggregation & Sorting)

这三个命令通常组合使用，构建小型的数据处理流水线。

### <strong>5. </code>wc<code> (Word Count)</strong>
</em>   <strong>功能</strong>：统计行数、单词数和字节数。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-l<code></strong> | 只统计行数 | <strong>L</strong>ines | 统计查询结果总数时最常用。 |
| <strong></code>-w<code></strong> | 只统计单词数 | <strong>W</strong>ords | 以空白符为分隔依据。 |
| <strong></code>-c<code></strong> | 只统计字节数 | <strong>C</strong>haracter/Byte | |

> <strong>💡 技术贴士：</code>wc<code> 的输出细节</strong>
> <em>   <strong>作为命令参数</strong>：</code>wc -l file.txt<code> 会输出 </code>10 file.txt<code> (数字 + 文件名)。
> </em>   <strong>作为管道过滤</strong>：</code>cat file.txt | wc -l<code> 只输出 </code>10<code> (仅数字)。
> <em>   <strong>处理多文件</strong>：</code>wc -l </em>.txt<code> 会列出每个文件的行数，并在最后给出一个 </code>total<code> 总计。

### <strong>6. </code>sort<code></strong>
<em>   <strong>功能</strong>：对文本行进行排序。
</em>   <strong>核心记忆点</strong>：默认按 <strong>字典序</strong> (ASCII) 排序。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-n<code></strong> | 按 <strong>数值</strong> 大小排序 | <strong>N</strong>umeric | <strong>从小到大</strong>。处理数值数据时必须加此参数。 |
| <strong></code>-r<code></strong> | 逆序排列 (总) | <strong>R</strong>everse | 将整个排序结果反转。 |
| <strong></code>-k<code></strong> | 指定排序关键字 (Key) | <strong>K</strong>ey | 极为强大，支持字段范围、字符偏移和每列独立设置。 |
| <strong></code>-t<code></strong> | 指定列分隔符 | <strong>T</strong>ag / Separa<strong>T</strong>or | 默认为非空白到空白的转换。CSV 通常需 </code>-t ','<code>。 |
| <strong></code>-f<code></strong> | 忽略大小写 | <strong>F</strong>old case | |
| <strong></code>-u<code></strong> | 排序并去重 | <strong>U</strong>nique | 效果等同于 </code>sort \| uniq<code>，但效率更高。 |
| <strong></code>-s<code></strong> | 稳定排序 | <strong>S</strong>table | 保持值相同行的原始相对顺序。多列分阶段排序时强烈建议开启。 |

> <strong>💡 技术贴士：</code>sort -k<code> 的进阶黑魔法</strong>
> 
> 在 COMP9044 的实战中，</code>-k<code> 的用法远不止 </code>k 2<code>：
> 1. <strong>指定范围 (</code>-k FIELD_START,FIELD_END<code>)</strong>：
>    <em>   </code>-k 2,2<code>：<strong>只</strong>按第二列排序。
>    </em>   </code>-k 2<code>：从第二列开始，<strong>一直到行尾</strong>作为排序关键字。
> 2. <strong>每列独立参数</strong>：
>    *   </code>sort -k 1,1 -k 2,2rn<code>：第一列按字典序升序，第二列按<strong>数值降序</strong>。
>    *   这里的 </code>r<code> (reverse) 和 </code>n<code> (numeric) 可以直接挂在数字后面，只对该列生效。
> 3. <strong>精准到字符 (</code>-k F.C<code>)</strong>：
>    *   </code>-k 1.3,1.5<code>：按第一列的第 3 到第 5 个字符排序。
> 
> <strong>示例案例</strong>：
> *   数据：</code>Apple 10<code>, </code>Banana 5<code>, </code>Apple 5<code>
> <em>   需求：先按第一列升序，第一列相同时按第二列数值降序。
> </em>   命令：</code>sort -k 1,1 -k 2,2rn<code>

### <strong>7. </code>uniq<code> (Unique)</strong>
<em>   <strong>功能</strong>：去除或统计 <strong>相邻</strong> 的重复行。
</em>   <strong>核心记忆点</strong>：<strong>使用前必须先排序 (</code>sort<code>)</strong>。

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-c<code></strong> | 显示每行重复出现的次数 | <strong>C</strong>ount | 构建“热点数据统计”常用此项。 |
| <strong></code>-d<code></strong> | 只显示重复过的行 | <strong>D</strong>uplicate | |
| <strong></code>-u<code></strong> | 只显示从未重复的行 | <strong>U</strong>nique | |
| <strong></code>-i<code></strong> | 忽略大小写 | <strong>I</strong>gnore case | |
| <strong></code>-f N<code></strong> | 比较时跳过前 N 个字段 | <strong>F</strong>ields | 如 </code>uniq -f 1<code> (忽略第一列按空白符分割，只对比后面的内容)。 |

<strong>使用示例：</strong>
<em>   <strong>样例文本 (</code>fruits.txt<code>)</strong>：
    </code>`<code>text
    apple
    orange
    apple
    banana
    orange
    apple
    </code>`<code>
</em>   <strong>样例命令</strong>：</code>sort fruits.txt | uniq -c<code>
<em>   <strong>样例输出</strong>：
    </code>`<code>text
    3 apple
    1 banana
    2 orange
    </code>`<code>

---

## 五、 流编辑器 (Stream Editor)

### <strong>8. </code>sed<code></strong>
</em>   <strong>功能</strong>：通过编程方式编辑文本流（替换、删除、提取）。
<em>   <strong>核心逻辑</strong>：读取一行 -> 执行命令 -> 打印结果（除非加 -n）。

| 选项/命令 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>s<code></strong> | <strong>替换</strong>命令 (Substitute) | <strong>S</strong>ubstitute | </code>s/old/new/<code> 基础结构。加 </code>g<code> 代表全局替换。 |
| <strong></code>-E<code></strong> | 使用<strong>扩展</strong>正则 | <strong>E</strong>xtended | <strong>核心必加</strong>：使 </code>()<code>, </code>|<code>, </code>+<code>, </code>?<code> 无需转义。 |
| <strong></code>-n<code></strong> | 静默模式 | <strong>N</strong>o printing | 常配合 </code>p<code> 命令，如 </code>sed -n 's/A/B/p'<code> (仅打印替换成功的行)。 |
| <strong></code>p<code></strong> | <strong>打印</strong>命令 | <strong>P</strong>rint | 需要显示指定行时使用。 |
| <strong></code>d<code></strong> | <strong>删除</strong>命令 | <strong>D</strong>elete | 移除符合条件的行。 |
| <strong></code>-i<code></strong> | 直接修改原文件 | <strong>I</strong>n-place | 慎用。通常调试好后再添加此参数。 |

> <strong>💡 进阶：正则表达式兼容性与实战技巧</strong>
> 
> 在 COMP9044 的实战或考试中，理解 </code>sed<code> 的正则特性是拿高分的关键。
> 
> <strong>1. BRE vs ERE (基本 vs 扩展正则)</strong>
> </em>   <strong>默认 (BRE)</strong>：如果你不加 </code>-E<code>，那么 </code>( )<code>, </code>|<code>, </code>+<code> 必须加转义符号：</code>\( \)<code>, </code>\|<code>, </code>\+<code>。
> *   <strong>推荐使用 </code>-E<code></strong>：加了 </code>-E<code> 后，代码更简洁：
>     *   ❌ </code>sed 's/\(TODO\|FIXME\)//'<code>
>     *   ✅ </code>sed -E 's/(TODO|FIXME)//'<code>
> 
> <strong>2. 自定义定界符 (避免“倾斜牙签症”)</strong>
> <em>   </code>s<code> 命令不一定用 </code>/<code> 分离开。如果你处理含有路径或 </code>/<code> 的文本，可以用任意字符（如 </code>:<code> 或 </code>#<code>）。
>     </em>   <strong>示例</strong>：删除 C++ 注释 </code>//<code>
>     *   </code>sed -E 's://\s*(TODO|FIXME).*$::' program.c<code> (这里用 </code>:<code> 做分隔符，代码由于没有一堆 </code>\/<code> 而变得极度清晰)。
> 
> <strong>3. 后向引用 (Backreferences)</strong>
> <em>   在替换部分使用 </code>\1<code>, </code>\2<code> 代表前面括号捕获的组。
>     </em>   <strong>案例</strong>：将 </code>#include "file.h"<code> 改为 </code>#include <file.h><code>
>     <em>   </code>sed -E 's/^#include\s+"([^"]</em>)"/#include <\1>/' program.c<code>
> 
> <strong>4. 地址寻址 (Addressing & Ranges)</strong>
> *   <strong>正则过滤</strong>：</code>sed -n '/^\s<em>extern/p' file<code> (仅打印以 extern 开头的行)。
> </em>   <strong>行内范围处理</strong>：</code>sed '10,20d'<code> (删除 10-20 行)。
> <em>   <strong>正则范围处理</strong>：使用 </code>/pattern1/,/pattern2/<code> 处理区间。
>     </em>   <strong>案例</strong>：删除整个 </code>main<code> 函数
>     <em>   </code>sed '/^int main/,/^}/d' program.c<code>
> 
> <strong>5. 常用符号 </code>&<code></strong>
> </em>   在替换内容中，</code>&<code> 代表<strong>整个已匹配到的字符串</strong>。
>     *   <strong>场景</strong>：给所有数字两边加括号
>     <em>   </code>echo "Age: 25" | sed 's/[0-9]\+/(&)/g'<code> -> </code>Age: (25)<code>

<strong>使用示例：</strong>
</em>   <strong>样例输入</strong>：</code>echo "I love Python" | sed 's/Python/Linux/'<code>
<em>   <strong>样例输出</strong>：</code>I love Linux<code>

> <strong>💡 核心原理：Sed 的“状态机”本质与空间管理</strong>
> 
> 理解 </code>sed<code> 就像理解一个只有一个寄存器的 CPU。它有两个核心内存位：
> 
> 1.  <strong>Pattern Space (模式空间)</strong>：
>     </em>   <strong>“工作台”</strong>。</code>sed<code> 每次读取一行，丢进模式空间。
>     <em>   所有的 </code>s///<code> 或 </code>d<code> 操作都是在这个空间里完成的。
>     </em>   <strong>处理周期</strong>：读取行 -> 放入模式空间 -> 执行所有命令 -> 打印模式空间内容（如果没有 </code>-n<code>） -> <strong>清空模式空间</strong> -> 下一行。
> 
> 2.  <strong>Hold Space (保持空间)</strong>：
>     *   <strong>“备用寄存器”或“剪贴板”</strong>。它在处理不同行之间 <strong>不会被清空</strong>。
>     <em>   这让 </code>sed<code> 有了“记忆力”，从而能实现状态机逻辑。
> 
> <strong>常用的“空间搬运”命令：</strong>
> | 命令 | 动作 | 形象记忆 |
> | :--- | :--- | :--- |
> | <strong></code>h<code></strong> | Pattern Space <strong>覆盖</strong>到 Hold Space | 复制到剪贴板 |
> | <strong></code>H<code></strong> | Pattern Space <strong>追加</strong>到 Hold Space | 增加到剪贴板末尾 |
> | <strong></code>g<code></strong> | Hold Space <strong>覆盖</strong>到 Pattern Space | 粘贴并替换当前行 |
> | <strong></code>G<code></strong> | Hold Space <strong>追加</strong>到 Pattern Space | 在当前行后加一行粘贴内容 |
> | <strong></code>x<code></strong> | <strong>交换</strong> Pattern Space 和 Hold Space | 调换工作台和剪贴板 |
> 
> <strong>实战案例：状态机的逻辑体现</strong>
> </em>   <strong>反转文件的所有行 (类似 </code>tac<code>)</strong>：
>     </code>sed -n '1!G; h; $p' file<code>
>     *   <strong>逻辑拆解</strong>：
>         1.  </code>1!G<code>：如果不是第一行，就把 Hold Space (之前存的所有行) 贴到当前行后面。
>         2.  </code>h<code>：把现在的全结果覆盖存回 Hold Space。
>         3.  </code>$p<code>：到最后一行时，打印结果。
>     <em>   这个过程由于 Hold Space 跨行保存了数据，就像一个不断累积状态的机床。
> 
> </em>   <strong>范围触发器 (</code>/start/,/end/<code>)</strong>：
>     这是 </code>sed<code> 最常用的隐式状态机。当匹配到 </code>/start/<code> 时，</code>sed<code> 进入“ON”状态，对后续每一行执行操作，直到匹配到 </code>/end/<code> 切换回“OFF”。

---

## 六、 文件系统与逻辑连接

### <strong>9. </code>find<code></strong>
<em>   <strong>功能</strong>：在目录树中递归查找符合条件的文件。
</em>   <strong>核心语法</strong>：</code>find [路径] [表达式]<code>

| 选项 | 作用 | 记忆逻辑 (Mnemonic) | 注意事项 |
| :--- | :--- | :--- | :--- |
| <strong></code>-name<code></strong> | 按文件名查找 | <strong>Name</strong> | 支持通配符，如 </code>'*.log'<code>（建议加引号防止 Shell 提前展开）。 |
| <strong></code>-type<code></strong> | 按文件类型查找 | <strong>Type</strong> | </code>f<code> 代表文件，</code>d<code> 代表目录。 |
| <strong></code>-mtime<code></strong> | 按修改时间查找 | <strong>M</strong>-<strong>Time</strong> | </code>-1<code> 表示 24 小时内修改过的。 |
| <strong></code>-size<code></strong> | 按文件大小查找 | <strong>Size</strong> | </code>+1M<code> 大于1MB；</code>-10k<code> 小于10KB等。 |
| <strong></code>-exec<code></strong> | 对找到的文件执行命令 | <strong>Exec</strong>ute | 如 </code>find . -name "<em>.tmp" -exec rm {} \;<code>。与 </code>xargs<code> 作用类似。 |

> <strong>💡 </code>-type<code> 怎么用？</strong>
> 你不能直接写 </code>find -type f "filename"<code>。正确的逻辑是：</code>find [哪里找] -type [找什么类型] -name [叫什么名字]<code>。
> </em>   <strong>示例</strong>：在当前目录查找名为 </code>test.py<code> 的文件：</code>find . -type f -name "test.py"<code>

### <strong>10. </code>xargs<code></strong>
<em>   <strong>功能</strong>：参数构建器。将标准输入转换为命令行参数。

<strong>使用示例：</strong>
</em>   <strong>场景 1：基础用法 (参数在末尾)</strong>
    查找并删除：</code>find . -name "<em>.tmp" | xargs rm<code>
</em>   <strong>场景 2：进阶用法 (使用 </code>-I<code> 指定位置)</strong>
    如果你想把找到的文件移动到 </code>backup<code> 目录，</code>rm<code> 只接受末尾参数，但 </code>mv<code> 需要把文件放在中间：
    </code>find . -name "<em>.log" | xargs -I {} mv {} ./backup/<code>
    </em>(这里的 </code>{}<code> 是占位符，代表管道传过来的每一个文件名)<em>

---

## 七、 实战避坑指南 (Common Pitfalls)

在 COMP9044 的实验和考试中，以下三个“坑”最容易扣分：

### <strong>1. </code>cut<code> 无法处理连续空格</strong>
</code>cut<code> 非常死板。如果数据是 </code>1    Alice<code>（中间多个空格），</code>cut -d ' ' -f 2<code> 会得到一个空字符串。
</em>   <strong>解决方案</strong>：先用 </code>tr -s ' '<code> 压缩空格，或者改用强大的 </code>awk<code>。
    <em>   ❌ </code>ls -l | cut -d ' ' -f 5<code> (报错或结果不对)
    </em>   ✅ </code>ls -l | tr -s ' ' | cut -d ' ' -f 5<code>

### <strong>2. </code>find<code> 的通配符必须加引号</strong>
如果你执行 </code>find . -name <em>.txt<code>，Shell 会在 </code>find<code> 运行前就把 </code></em>.txt<code> 展开成当前目录的文件名。如果当前目录有多个 txt，</code>find<code> 会报 </code>paths must precede expression<code> 错误。
<em>   <strong>金律</strong>：<strong>永远</strong>对 </code>find<code> 的 </code>-name<code> 参数加引号：</code>find . -name "</em>.txt"<code>。

### <strong>3. </code>uniq<code> 必须紧跟在 </code>sort<code> 后面</strong>
</code>uniq<code> 只能去除<strong>相邻</strong>的重复行。
<em>   <strong>错误示例</strong>：输入 </code>A, B, A<code>，直接 </code>uniq<code> 还是 </code>A, B, A<code>。
</em>   <strong>正确写法</strong>：</code>sort file | uniq<code>。

### <strong>4. 文件名带空格的致命弱点 (</code>find<code> + </code>xargs<code> 最强闭坑)</strong>
如果文件名叫 </code>my file.txt<code>，默认的 </code>xargs<code> 会把空格当作分隔符，当成 </code>my<code> 和 </code>file.txt<code> 两个文件去传参，导致执行失败或误删。
<em>   <strong>完美解决方案</strong>：让 </code>find<code> 以 Null 字符 </code>\0<code> 结尾输出，让 </code>xargs<code> 也以 </code>\0<code> 为分隔符接收：
    ✅ </code>find . -name "</em>.txt" -print0 | xargs -0 rm<code>

---

## 总结：管道 (Pipeline) 组合拳

这就是 Unix 的哲学：<strong>每个工具只做好一件事，通过管道连接它们。</strong>

<strong>综合练习</strong>：统计访问日志中 TOP 10 的 IP 地址
</code>cat access.log | cut -d ' ' -f 1 | sort | uniq -c | sort -rn | head -n 10`