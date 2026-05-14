// 防止重复注入
if (!window.__UI_CATCH_ACTIVE) {
  window.__UI_CATCH_ACTIVE = true;
  
  console.log('🐾 UI-Catch: 探针已成功注入！');

  // 1. 注入高亮样式
  const styleId = 'ui-catch-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .ui-catch-hover { 
        outline: 3px solid #deff9a !important; 
        outline-offset: -3px !important; 
        background-color: rgba(222, 255, 154, 0.2) !important; 
        cursor: crosshair !important; 
        transition: all 0.1s; 
      }
    `;
    document.head.appendChild(style);
  }

  // 2. 页面顶部弹出提示
  const toast = document.createElement('div');
  toast.innerHTML = 'UI-Catch 抓抓已开启！请点击目标元素 (按 Esc 取消)';
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(15,15,15,0.9);color:#deff9a;padding:10px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;font-weight:600;z-index:2147483647;box-shadow:0 8px 32px rgba(0,0,0,0.3);border:1px solid rgba(222,255,154,0.3);backdrop-filter:blur(12px);pointer-events:none;letter-spacing:0.3px;';
  document.body.appendChild(toast);

  // --- 自定义通知系统 (Shadow DOM 封装) ---
  const showModal = (type, data) => {
    const isSuccess = type === 'success';
    const accentColor = isSuccess ? '#deff9a' : '#ff9a9a';
    
    // Shadow DOM Host
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
    
    const shadow = host.attachShadow({ mode: 'open' });
    
    // 背景遮罩
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s ease;';
    
    // 卡片主体
    const card = document.createElement('div');
    card.style.cssText = 'position:relative;background:rgba(15,15,15,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px 32px;max-width:480px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05);color:#fff;transform:translateY(20px);opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);';
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;padding:0;transition:all 0.2s;';
    closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.onmouseenter = () => { closeBtn.style.background='rgba(255,255,255,0.15)'; closeBtn.style.color='#fff'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background='rgba(255,255,255,0.08)'; closeBtn.style.color='rgba(255,255,255,0.6)'; };
    
    // 头部：图标 + 标题
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:20px;';
    const iconSvg = isSuccess
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#deff9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9a9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    header.innerHTML = iconSvg;
    
    const titleSpan = document.createElement('span');
    titleSpan.style.cssText = `font-size:18px;font-weight:700;color:${accentColor};`;
    titleSpan.textContent = data.title || '';
    header.appendChild(titleSpan);
    
    // 内容区域
    const body = document.createElement('div');
    body.style.cssText = 'color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6;';
    
    if (data.prompt) {
      const msgDiv = document.createElement('div');
      msgDiv.style.cssText = 'margin-bottom:12px;font-size:13px;color:rgba(255,255,255,0.6);';
      msgDiv.textContent = '可编辑后复制到剪贴板';
      body.appendChild(msgDiv);
      
      const textarea = document.createElement('textarea');
      textarea.value = data.prompt;
      textarea.style.cssText = 'width:100%;min-height:140px;max-height:300px;resize:vertical;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px 16px;font-family:"SF Mono",Monaco,Inconsolata,"Fira Code","Cascadia Code",monospace;font-size:12px;color:#e8e8e8;line-height:1.6;outline:none;box-sizing:border-box;';
      textarea.onfocus = () => { textarea.style.borderColor = 'rgba(222,255,154,0.5)'; };
      textarea.onblur = () => { textarea.style.borderColor = 'rgba(255,255,255,0.1)'; };
      body.appendChild(textarea);

      const bottomRow = document.createElement('div');
      bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:14px;';

      const badge = document.createElement('div');
      badge.style.cssText = 'display:none;padding:4px 10px;background:rgba(222,255,154,0.12);border:1px solid rgba(222,255,154,0.25);border-radius:20px;font-size:11px;font-weight:600;color:#deff9a;letter-spacing:0.5px;';
      badge.textContent = '已复制到剪贴板';

      const copyBtn = document.createElement('button');
      copyBtn.style.cssText = 'padding:8px 20px;background:#deff9a;color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px;';
      copyBtn.textContent = '复制到剪贴板';
      copyBtn.onmouseenter = () => { copyBtn.style.background = '#e8ffb5'; copyBtn.style.transform = 'scale(1.02)'; };
      copyBtn.onmouseleave = () => { copyBtn.style.background = '#deff9a'; copyBtn.style.transform = 'scale(1)'; };
      copyBtn.addEventListener('click', async () => {
        const text = textarea.value;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); ta.remove();
          }
          copyBtn.textContent = '已复制';
          copyBtn.style.background = 'rgba(222,255,154,0.2)';
          copyBtn.style.color = '#deff9a';
          badge.style.display = 'inline-block';
        } catch(e) {
          copyBtn.textContent = '复制失败';
          copyBtn.style.background = 'rgba(255,154,154,0.2)';
          copyBtn.style.color = '#ff9a9a';
        }
      });

      bottomRow.appendChild(badge);
      bottomRow.appendChild(copyBtn);
      body.appendChild(bottomRow);
    } else if (data.message) {
      body.style.whiteSpace = 'pre-line';
      body.textContent = data.message;
    }
    
    card.appendChild(closeBtn);
    card.appendChild(header);
    card.appendChild(body);
    shadow.appendChild(backdrop);
    shadow.appendChild(card);
    document.body.appendChild(host);
    
    // 入场动画
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.opacity = '1';
    });
    
    let autoDismissTimer;
    const dismiss = () => {
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
      backdrop.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.opacity = '0';
      setTimeout(() => host.remove(), 350);
    };
    
    closeBtn.addEventListener('click', dismiss);
    backdrop.addEventListener('click', dismiss);
    
    if (isSuccess && data.autoDismiss !== false) {
      autoDismissTimer = setTimeout(dismiss, 4000);
    }
  };
  // --- /自定义通知系统 ---

  // 3. 通用清理函数 (恢复页面原状)
  const cleanup = () => {
    document.removeEventListener('mouseover', over, true);
    document.removeEventListener('mouseout', out, true);
    document.removeEventListener('click', click, true);
    document.removeEventListener('keydown', keydown, true);
    document.getElementById(styleId)?.remove();
    if(toast && toast.parentNode) toast.remove();
    document.querySelectorAll('.ui-catch-hover').forEach(el => el.classList.remove('ui-catch-hover'));
    window.__UI_CATCH_ACTIVE = false;
    console.log('🐾 UI-Catch: 探针已安全退出。');
  };

  // 4. 核心拦截器
  const over = e => { e.target.classList.add('ui-catch-hover'); };
  const out = e => { e.target.classList.remove('ui-catch-hover'); };
  
  const keydown = e => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  const click = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const el = e.target;
    // 提前去除 hover 效果，防止脏数据
    el.classList.remove('ui-catch-hover');
    
    console.log("🎯 UI-Catch 捕获到原始 DOM 节点:", el);
    
    // ⚠️ 修复核心 Bug：使用 getAttribute 获取安全字符串，防止 SVG 元素导致崩溃
    const cls = (el.getAttribute('class') || '').replace('ui-catch-hover', '').trim();
    const tag = el.tagName.toLowerCase();
    const id = el.id ? ` id="${el.id}"` : '';
    const cStr = cls ? ` class="${cls}"` : '';
    
    // 提取文本（去除多余换行，增加 textContent 兼容一些没有 innerText 的特殊标签）
    let txt = (el.innerText || el.textContent || '').replace(/\n/g, ' ').trim();
    if (txt.length > 40) txt = txt.substring(0, 40) + '...';
    
    const fp = `<${tag}${id}${cStr}>${txt}</${tag}>`;
    
    // 提取最近的带有 ID 的父节点作为上下文
    let pCtx = 'body';
    let curr = el.parentElement;
    for(let i=0; i<3 && curr; i++) {
      if(curr.id) { 
        pCtx = `<${curr.tagName.toLowerCase()} id="${curr.id}">`; 
        break; 
      }
      curr = curr.parentElement;
    }
    
    const prompt = `我在调整前端 UI。请帮我修改下面这个特定元素：\n\n【特征指纹】\n${fp}\n\n【上下文位置】\n在 ${pCtx} 内部\n\n【我的需求】\n1. `;
    console.log("📝 准备复制的 Prompt:\n", prompt);
    
    // 直接弹出可编辑模态框，用户自行修改后点击复制
    showModal('success', { title: 'UI-Catch 捕捉成功！', prompt: prompt });
    
    // 任务完成，清理所有监听和样式
    cleanup();
  };
  
  // 挂载监听器（必须在捕获阶段拦截 true，防止被业务代码阻止）
  document.addEventListener('mouseover', over, true);
  document.addEventListener('mouseout', out, true);
  document.addEventListener('click', click, true);
  document.addEventListener('keydown', keydown, true);
}
