import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: npm run new -- <文章标题>');
  console.log('示例: npm run new -- 我的第一篇博客');
  process.exit(1);
}

const title = args.join(' ');
const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
const filename = `${title}.md`;
const filepath = path.join('src/content/blog', filename);

const template = `---
title: ${title}
date: ${date}
tags:
  - 
categories:
  - 
---
`;

fs.writeFileSync(filepath, template);
console.log(`✓ 已创建 ${filepath}`);
