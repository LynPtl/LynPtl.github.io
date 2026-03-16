import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: npm run new -- <文章标题>');
  console.log('示例: npm run new -- 我的第一篇博客');
  process.exit(1);
}

const title = args.join('-');
const date = new Date().toISOString().split('T')[0];
const filename = `${date}-${title}.md`;
const filepath = path.join('src/content/blog', filename);

const template = `---
title: ${title}
date: ${date}
tags:
  - 
categories:
  - 
---

在这里写你的文章内容...

## 二级标题

正文内容...

### 三级标题

更多内容...

\`\`\`javascript
// 代码示例
console.log('Hello World');
\`\`\`

$O(N)$ 行内公式

$$E = mc^2$$ 块级公式
`;

fs.writeFileSync(filepath, template);
console.log(`✅ 已创建: ${filepath}`);
