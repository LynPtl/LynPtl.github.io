// Reading progress bar
const progressBar = document.querySelector('.progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + '%';
});

// Back to top
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Lightbox for images
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox-close');

// Make external links open in new tab
document.querySelectorAll('.content a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
  }
});

document.querySelectorAll('.content img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Copy text to clipboard with fallback
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

// Add copy button to code blocks
document.querySelectorAll('.content pre').forEach(pre => {
  // Check if already has wrapper
  if (pre.parentNode.classList && pre.parentNode.classList.contains('code-block-wrapper')) {
    return;
  }
  
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block-wrapper';
  pre.parentNode.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1h-8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-8 16h-2v-14h2v14zm4 0h-2v-14h2v14zm4 0h-2v-14h2v14zm-8-2h-2v-14h2v14zm4 0h-2v-14h2v14zm4 0h-2v-14h2v14z"/></svg>`;
  copyBtn.title = '复制代码';
  
  copyBtn.addEventListener('click', async () => {
    const code = pre.querySelector('code');
    const text = code ? code.textContent : pre.textContent;
    try {
      await copyToClipboard(text);
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.42-1.41z"/></svg>`;
      // Show toast
      if (window.showToast) window.showToast('已复制');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1h-8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-8 16h-2v-14h2v14zm4 0h-2v-14h2v14zm4 0h-2v-14h2v14z"/></svg>`;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      if (window.showToast) window.showToast('复制失败');
    }
  });
  
  wrapper.appendChild(copyBtn);
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Toast notification
const toast = document.getElementById('toast');
window.showToast = function(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Copy link button
document.querySelectorAll('.share-btn.copy-link').forEach(btn => {
  btn.addEventListener('click', async () => {
    const url = btn.dataset.url;
    try {
      await copyToClipboard(url);
      if (window.showToast) window.showToast('链接已复制');
    } catch (err) {
      console.error('Failed to copy:', err);
      if (window.showToast) window.showToast('复制失败');
    }
  });
});
