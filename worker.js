// A Map to store our CORS headers
const corsHeaders = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*', // Will be overridden by specific origin
};

// --- 用于处理 OPTIONS 的函数 ---
async function handleOptions(request, env) {
  try {
    const origin = `https://${env.GITHUB_USERNAME}.github.io`;
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origin,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: 'OPTIONS handler failed',
      message: e.message,
      stack: e.stack
    }), { status: 500 });
  }
}

// --- 用于处理 POST 的函数 ---
async function handlePost(request, env) {
  // --- 关键：用 try...catch 包裹所有逻辑 ---
  try {
    // --- 文件处理 ---
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response('File not found', { status: 400, headers: corsHeaders });
    }

    // --- R2 上传 ---
    const fileExtension = file.name.split('.').pop();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${Date.now()}-${randomString}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // 调试日志 2: 检查 R2 绑定是否存在
    if (!env.MY_BUCKET) {
      return new Response(JSON.stringify({ error: 'R2 binding "MY_BUCKET" is not configured or name is incorrect' }), { status: 500 });
    }

    await env.MY_BUCKET.put(filePath, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // --- 成功响应 ---
    // 调试日志 3: 检查 R2_PUBLIC_URL 是否存在
    const publicUrl = env.R2_PUBLIC_URL;
    if (!publicUrl) {
      return new Response(JSON.stringify({ error: 'R2_PUBLIC_URL secret is not set in Worker environment' }), { status: 500 });
    }
    
    const finalUrl = `${publicUrl}/${filePath}`;
    const markdownLink = `![${file.name}](${finalUrl})`;
    const responsePayload = { url: finalUrl, markdown: markdownLink };

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `https://${env.GITHUB_USERNAME}.github.io`,
      },
    });

  // --- 关键：捕获所有未知错误 ---
  } catch (e) {
    // 这将返回详细的错误信息
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred in POST handler',
      message: e.message,
      stack: e.stack,
    }), {
      status: 500, // 500 Internal Server Error
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `https://${env.GITHUB_USERNAME}.github.io`,
      },
    });
  }
}

// --- 主 fetch 处理程序 ---
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }
    if (request.method === 'POST') {
      return handlePost(request, env);
    }
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    });
  },
};