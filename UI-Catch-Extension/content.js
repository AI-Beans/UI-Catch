// 防止重复注入
if (!window.__UI_CATCH_ACTIVE) {
  window.__UI_CATCH_ACTIVE = true;
  
  console.log('🐾 UI-Catch: 探针已成功注入！');

  const createSVG = (svgString) => {
    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
    return document.adoptNode(doc.documentElement);
  };

  // 1. 注入高亮样式
  const styleId = 'ui-catch-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '.ui-catch-hover { outline: 3px solid #facc15 !important; outline-offset: -3px !important; background-color: rgba(250, 204, 21, 0.2) !important; cursor: crosshair !important; transition: all 0.1s; }';
    document.head.appendChild(style);
  }

  // --- 精灵光标系统 ---
  let spriteImg = null;
  let spriteCanvas = null;
  let spriteCtx = null;
  let spriteInterval = null;
  let currentFrame = 0;
  let spriteMouseX = -100;
  let spriteMouseY = -100;
  let spriteActive = false;
  let spriteFps = parseInt(localStorage.getItem('ui-catch-sprite-fps')) || 8;
  let spriteSize = parseInt(localStorage.getItem('ui-catch-sprite-size')) || 128;
  let settingsDropdown = null;
  let previewCanvas = null;
  let previewCtx = null;
  let dropdownOutsideListener = null;
  let activeFrames = Array(16).fill(true);
  let anchorX = parseFloat(localStorage.getItem('ui-catch-anchor-x')) || 0;
  let anchorY = parseFloat(localStorage.getItem('ui-catch-anchor-y')) || 0;
  const scanCanvas = document.createElement('canvas');
  const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });

  const detectActiveFrames = (img) => {
    const fw = img.naturalWidth / 4;
    const fh = img.naturalHeight / 4;
    scanCanvas.width = fw;
    scanCanvas.height = fh;
    const result = [];
    for (let i = 0; i < 16; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      scanCtx.clearRect(0, 0, fw, fh);
      scanCtx.drawImage(img, col * fw, row * fh, fw, fh, 0, 0, fw, fh);
      const data = scanCtx.getImageData(0, 0, fw, fh).data;
      let opaquePixels = 0;
      const totalPixels = fw * fh;
      for (let p = 3; p < data.length; p += 4) {
        if (data[p] > 0) opaquePixels++;
      }
      result.push(opaquePixels / totalPixels > 0.1);
    }
    return result;
  };

  const nextActiveFrame = (from) => {
    let f = (from + 1) % 16;
    let tries = 0;
    while (!activeFrames[f] && tries < 16) {
      f = (f + 1) % 16;
      tries++;
    }
    return activeFrames[f] ? f : from;
  };

  const createSpriteCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483645;width:' + spriteSize + 'px;height:' + spriteSize + 'px;image-rendering:pixelated;display:none;';
    document.body.appendChild(canvas);
    return canvas;
  };

  spriteCanvas = createSpriteCanvas();
  spriteCtx = spriteCanvas.getContext('2d');
  spriteCtx.imageSmoothingEnabled = false;

  const glowDot = document.createElement('div');
  glowDot.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.9);box-shadow:0 0 6px 2px rgba(250,204,21,0.8),0 0 12px 4px rgba(250,204,21,0.4);transform:translate(-50%,-50%);display:none;';
  document.body.appendChild(glowDot);

  const updateCursorStyle = () => {
    const styleEl = document.getElementById(styleId);
    if (!styleEl) return;
    styleEl.textContent = '.ui-catch-hover { outline: 3px solid #facc15 !important; outline-offset: -3px !important; background-color: rgba(250, 204, 21, 0.2) !important; cursor: crosshair !important; transition: all 0.1s; }';
  };

  const updateSpriteFrame = () => {
    if (!spriteImg || !spriteCtx) return;
    if (!activeFrames[currentFrame]) {
      currentFrame = nextActiveFrame(currentFrame);
    }
    const frameW = spriteImg.naturalWidth / 4;
    const frameH = spriteImg.naturalHeight / 4;
    const col = currentFrame % 4;
    const row = Math.floor(currentFrame / 4);
    spriteCtx.clearRect(0, 0, 256, 256);
    spriteCtx.drawImage(spriteImg, col * frameW, row * frameH, frameW, frameH, 0, 0, 256, 256);
    if (previewCtx) {
      previewCtx.clearRect(0, 0, 128, 128);
      previewCtx.drawImage(spriteCanvas, 0, 0, 256, 256, 0, 0, 128, 128);
    }
    currentFrame = nextActiveFrame(currentFrame);
  };

  const startSpriteAnimation = () => {
    stopSpriteAnimation();
    updateSpriteFrame();
    spriteInterval = setInterval(updateSpriteFrame, Math.round(1000 / spriteFps));
  };

  const stopSpriteAnimation = () => {
    if (spriteInterval) {
      clearInterval(spriteInterval);
      spriteInterval = null;
    }
    currentFrame = 0;
  };

  const initSpriteCursor = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      spriteImg = img;
      activeFrames = detectActiveFrames(img);
      const firstActive = activeFrames.findIndex(f => f);
      if (firstActive !== -1) currentFrame = firstActive;
      spriteActive = true;
      spriteCanvas.style.display = 'block';
      glowDot.style.display = 'block';
      spriteCanvas.style.left = spriteMouseX + 'px';
      spriteCanvas.style.top = spriteMouseY + 'px';
      updateCursorStyle();
      startSpriteAnimation();
      if (previewCanvas) previewCanvas.style.display = 'block';
      if (typeof updateAnchorVisual === 'function') updateAnchorVisual();
    };
    img.src = dataUrl;
  };

  const removeSpriteCursor = () => {
    stopSpriteAnimation();
    spriteImg = null;
    spriteActive = false;
    activeFrames = Array(16).fill(true);
    anchorX = 0;
    anchorY = 0;
    localStorage.removeItem('ui-catch-anchor-x');
    localStorage.removeItem('ui-catch-anchor-y');
    spriteCanvas.style.display = 'none';
    glowDot.style.display = 'none';
    spriteCtx.clearRect(0, 0, 256, 256);
    if (previewCtx) previewCtx.clearRect(0, 0, 128, 128);
    if (previewCanvas) previewCanvas.style.display = 'none';
    localStorage.removeItem('ui-catch-sprite');
    updateCursorStyle();
  };

  const loadSavedSprite = () => {
    const saved = localStorage.getItem('ui-catch-sprite');
    if (saved) initSpriteCursor(saved);
  };
  // --- /精灵光标系统 ---

  // 2. 模式切换工具栏 (Shadow DOM)
  let currentMode = 'pick';
  const toolbarHost = document.createElement('div');
  toolbarHost.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
  const toolbarShadow = toolbarHost.attachShadow({ mode: 'open' });
  const toolbarStyle = document.createElement('style');
  toolbarStyle.textContent = '.tb{display:flex;align-items:center;gap:2px;background:rgba(15,15,15,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:4px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.3);} .mb{padding:8px 16px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.5);background:transparent;font-family:inherit;} .mb:hover{color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.08);} .mb.on{color:#000;background:#facc15;border:2px solid #000;border-bottom:3px solid #000;box-shadow:2px 2px 0px 0px rgba(0,0,0,0.3);} .mb.on:hover{box-shadow:1px 1px 0px 0px rgba(0,0,0,0.3);transform:translate(1px,1px);} .cb{padding:8px 10px;border:none;border-radius:8px;cursor:pointer;color:#fff;background:transparent;transition:all 0.2s;display:flex;align-items:center;justify-content:center;} .cb:hover{color:#fff;background:rgba(255,255,255,0.1);}';
  const toolbar = document.createElement('div');
  toolbar.setAttribute('class', 'tb');

  const pickBtn = document.createElement('button');
  pickBtn.setAttribute('class', 'mb on');
  pickBtn.textContent = '精准选取';

  const marqueeBtn = document.createElement('button');
  marqueeBtn.setAttribute('class', 'mb');
  marqueeBtn.textContent = '区域框选';

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('class', 'cb');
  closeBtn.textContent = '\u00D7';

  const settingsBtn = document.createElement('button');
  settingsBtn.setAttribute('class', 'cb');
  settingsBtn.textContent = '\u2699';

  document.body.appendChild(toolbarHost);


  // --- 自定义通知系统 (Shadow DOM 封装) ---
  const showModal = (type, data) => {
    const isSuccess = type === 'success';
    const accentColor = isSuccess ? '#facc15' : '#ff9a9a';

    const host = document.createElement('div');
    host.setAttribute('data-ui-catch-modal', '');
    host.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    const shadow = host.attachShadow({ mode: 'open' });

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'position:relative;background:rgba(15,15,15,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px 32px;max-width:480px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05);color:#fff;transform:translateY(20px);opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);';

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00D7';
    closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:300;line-height:1;padding:0;transition:all 0.2s;';
    closeBtn.onmouseenter = () => { closeBtn.style.background='rgba(255,255,255,0.15)'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background='rgba(255,255,255,0.08)'; };

    // 头部
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;';
    const iconSvg = isSuccess
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9a9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    header.appendChild(createSVG(iconSvg));
    const titleSpan = document.createElement('span');
    titleSpan.style.cssText = `font-size:16px;font-weight:700;color:${accentColor};`;
    titleSpan.textContent = data.title || '';
    header.appendChild(titleSpan);

    // 内容区
    const body = document.createElement('div');
    body.style.cssText = 'color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6;';

    // 系统提示预设
    const sysLabel = document.createElement('div');
    sysLabel.style.cssText = 'font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:6px;letter-spacing:0.5px;text-transform:uppercase;';
    sysLabel.textContent = '系统提示预设';
    body.appendChild(sysLabel);

    const sysTextarea = document.createElement('textarea');
    sysTextarea.value = data.systemPreset || localStorage.getItem('ui-catch-system') || '你是一位资深全栈开发专家，精通 React、Vue、Tailwind CSS 和现代前端设计系统。我在调整前端 UI，请帮我处理下面这个元素：';
    sysTextarea.style.cssText = 'width:100%;min-height:72px;resize:vertical;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;font-family:inherit;font-size:13px;color:#e8e8e8;line-height:1.5;outline:none;box-sizing:border-box;margin-bottom:14px;';
    sysTextarea.onfocus = () => { sysTextarea.style.borderColor = 'rgba(250,204,21,0.4)'; };
    sysTextarea.onblur = () => { sysTextarea.style.borderColor = 'rgba(255,255,255,0.08)'; };
    body.appendChild(sysTextarea);

    // 元素详情（可折叠）
    if (data.details) {
      const detailsToggle = document.createElement('button');
      detailsToggle.style.cssText = 'width:100%;text-align:left;padding:8px 0;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;margin-bottom:8px;font-family:inherit;';
      detailsToggle.innerHTML = '<span style="font-size:10px;">▶</span> 元素详情';

      const detailsPanel = document.createElement('div');
      detailsPanel.style.cssText = 'display:none;padding:12px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;margin-bottom:16px;font-family:"SF Mono",Monaco,monospace;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.7;white-space:pre-wrap;word-break:break-all;';
      detailsPanel.textContent = data.details;

      let expanded = false;
      detailsToggle.addEventListener('click', () => {
        expanded = !expanded;
        detailsPanel.style.display = expanded ? 'block' : 'none';
        detailsToggle.innerHTML = `<span style="font-size:10px;">${expanded ? '▼' : '▶'}</span> 元素详情`;
      });

      body.appendChild(detailsToggle);
      body.appendChild(detailsPanel);
    }

    // 我的需求
    const demandLabel = document.createElement('div');
    demandLabel.style.cssText = 'font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:6px;letter-spacing:0.5px;text-transform:uppercase;';
    demandLabel.textContent = '我的需求';
    body.appendChild(demandLabel);

    const demandTextarea = document.createElement('textarea');
    demandTextarea.value = localStorage.getItem('ui-catch-demand') || '';
    demandTextarea.placeholder = '例如：改成圆角按钮，颜色换成蓝色...';
    demandTextarea.style.cssText = 'width:100%;min-height:80px;resize:vertical;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;font-family:inherit;font-size:13px;color:#e8e8e8;line-height:1.5;outline:none;box-sizing:border-box;margin-bottom:14px;';
    demandTextarea.onfocus = () => { demandTextarea.style.borderColor = 'rgba(250,204,21,0.4)'; };
    demandTextarea.onblur = () => { demandTextarea.style.borderColor = 'rgba(255,255,255,0.08)'; };
    body.appendChild(demandTextarea);

    // 底部操作栏
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:8px;';

    const badge = document.createElement('div');
    badge.style.cssText = 'display:none;padding:4px 10px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.25);border-radius:20px;font-size:11px;font-weight:600;color:#facc15;letter-spacing:0.5px;';
    badge.textContent = '已复制到剪贴板';

    const copyBtn = document.createElement('button');
    copyBtn.style.cssText = 'padding:8px 20px;background:#facc15;color:#000;border:2px solid #000;border-bottom:3px solid #000;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px;box-shadow:2px 2px 0px 0px rgba(0,0,0,0.3);';
    copyBtn.textContent = '复制到剪贴板';
    copyBtn.onmouseenter = () => { copyBtn.style.background = '#fde047'; copyBtn.style.boxShadow = '1px 1px 0px 0px rgba(0,0,0,0.3)'; copyBtn.style.transform = 'translate(1px,1px)'; };
    copyBtn.onmouseleave = () => { copyBtn.style.background = '#facc15'; copyBtn.style.boxShadow = '2px 2px 0px 0px rgba(0,0,0,0.3)'; copyBtn.style.transform = 'translate(0,0)'; };
    copyBtn.addEventListener('click', async () => {
      const parts = [sysTextarea.value.trim()];
      if (data.details) parts.push(data.details);
      const demand = demandTextarea.value.trim();
      if (demand) parts.push('【我的需求】\n' + demand);
      const text = parts.join('\n\n') + '\n';

      localStorage.setItem('ui-catch-system', sysTextarea.value);
      localStorage.setItem('ui-catch-demand', demandTextarea.value);

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        copyBtn.textContent = '已复制';
        copyBtn.style.background = 'rgba(250,204,21,0.2)';
        copyBtn.style.color = '#facc15';
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

    card.appendChild(closeBtn);
    card.appendChild(header);
    card.appendChild(body);
    shadow.appendChild(backdrop);
    shadow.appendChild(card);
    document.body.appendChild(host);

    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.opacity = '1';
    });

    const dismiss = () => {
      backdrop.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.opacity = '0';
      setTimeout(() => host.remove(), 350);
    };

    closeBtn.addEventListener('click', dismiss);
    backdrop.addEventListener('click', dismiss);
  };
  // --- /自定义通知系统 ---

  // --- 元素分析工具集 ---

  // 唯一 CSS Selector 生成 (finder 风格: ID → data-testid → class → nth-of-type)
  const getUniqueSelector = (el) => {
    if (el.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(el.id)) {
      return '#' + CSS.escape(el.id);
    }

    const testId = el.getAttribute('data-testid');
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;

    const tag = el.tagName.toLowerCase();
    const cls = (el.getAttribute('class') || '').replace('ui-catch-hover', '').trim();
    const classTokens = cls.split(/\s+/).filter(c => c && /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(c));

    if (classTokens.length > 0) {
      const selector = tag + '.' + classTokens.map(c => CSS.escape(c)).join('.');
      if (document.querySelectorAll(selector).length === 1) return selector;

      for (let comboLen = classTokens.length; comboLen >= 1; comboLen--) {
        for (let start = 0; start <= classTokens.length - comboLen; start++) {
          const combo = classTokens.slice(start, start + comboLen);
          const s = tag + '.' + combo.map(c => CSS.escape(c)).join('.');
          if (document.querySelectorAll(s).length === 1) return s;
        }
      }
    }

    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      if (siblings.length === 1) return tag;
      const idx = siblings.indexOf(el) + 1;
      return tag + ':nth-of-type(' + idx + ')';
    }
    return tag;
  };

  // 完整 CSS Path 生成 (DevTools DOMPath 风格)
  const getCSSPath = (el) => {
    const steps = [];
    let node = el;
    while (node && node !== document.documentElement) {
      let step = node.tagName.toLowerCase();
      if (node.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(node.id)) {
        steps.push(step + '#' + CSS.escape(node.id));
        break;
      }
      const cls = (node.getAttribute('class') || '').replace('ui-catch-hover', '').trim();
      const tokens = cls.split(/\s+/).filter(c => c && /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(c));
      if (tokens.length > 0) {
        step += '.' + tokens.map(c => CSS.escape(c)).join('.');
      }
      const parent = node.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
        if (siblings.length > 1) {
          step += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
        }
      }
      steps.push(step);
      node = node.parentElement;
    }
    if (node === document.documentElement) steps.push('html');
    return steps.reverse().join(' > ');
  };

  // XPath 生成
  const getXPath = (el) => {
    if (el.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(el.id)) {
      return '//*[@id="' + el.id + '"]';
    }
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1) {
      let idx = 1;
      let sib = node.previousSibling;
      while (sib) {
        if (sib.nodeType === 1 && sib.tagName === node.tagName) idx++;
        sib = sib.previousSibling;
      }
      const tag = node.tagName.toLowerCase();
      parts.push(tag + '[' + idx + ']');
      node = node.parentElement;
    }
    return '/' + parts.reverse().join('/');
  };

  // 框架感知: React Fiber / Vue 实例 → 组件名
  const getComponentInfo = (el) => {
    const result = { framework: null, componentName: null, props: null };

    // React Fiber (支持 React 16+ 的内部属性名)
    const fiberKey = Object.keys(el).find(k =>
      k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    if (fiberKey) {
      let fiber = el[fiberKey];
      result.framework = 'react';
      // 向上遍历 Fiber 树找有 name 的组件
      let depth = 0;
      while (fiber && depth < 15) {
        if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
          result.componentName = fiber.type.name;
          if (fiber.pendingProps) {
            const safeProps = {};
            for (const [k, v] of Object.entries(fiber.pendingProps)) {
              if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                safeProps[k] = v;
              }
            }
            if (Object.keys(safeProps).length > 0) result.props = safeProps;
          }
          break;
        }
        if (fiber.type && typeof fiber.type === 'object' && fiber.type.name) {
          result.componentName = fiber.type.name;
          break;
        }
        fiber = fiber.return;
        depth++;
      }
      return result;
    }

    // Vue 2/3 实例
    const vueKey = Object.keys(el).find(k => k.startsWith('__vue__') || k.startsWith('__vue_app__'));
    if (vueKey) {
      result.framework = 'vue';
      const instance = el[vueKey];
      if (instance.$options && instance.$options.name) {
        result.componentName = instance.$options.name;
      } else if (instance._ && instance._.type && instance._.type.name) {
        result.componentName = instance._.type.name;
      }
      return result;
    }

    return result;
  };

  // --- /元素分析工具集 ---

  // --- 区域框选工具集 ---

  const findElementsInRect = (rect) => {
    const found = [];
    const walk = (root) => {
      for (const child of root.children) {
        if (child === marquee || child === toolbarHost || child.id === styleId || child === spriteCanvas) continue;
        const r = child.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 &&
            r.left >= rect.left && r.top >= rect.top &&
            r.right <= rect.right && r.bottom <= rect.bottom) {
          found.push(child);
        }
        if (child.children.length > 0) walk(child);
      }
    };
    walk(document.body);
    return found;
  };

  // Lowest Common Ancestor: 找到能装下所有被框元素的最近公共父节点
  const getLowestCommonAncestor = (elements) => {
    if (elements.length === 0) return document.body;
    if (elements.length === 1) return elements[0];

    const getPath = (el) => {
      const path = [];
      let node = el;
      while (node) { path.unshift(node); node = node.parentElement; }
      return path;
    };

    const paths = elements.map(getPath);
    let lca = paths[0][0];
    const minLen = Math.min(...paths.map(p => p.length));

    for (let i = 0; i < minLen; i++) {
      if (paths.every(p => p[i] === paths[0][i])) {
        lca = paths[0][i];
      } else break;
    }

    if (lca === document.body || lca === document.documentElement) {
      return elements[0].parentElement;
    }
    return lca;
  };

  const flashElement = (el) => {
    el.style.transition = 'outline 0.3s ease, background-color 0.3s ease';
    el.style.outline = '3px solid #facc15';
    el.style.backgroundColor = 'rgba(250,204,21,0.15)';
    setTimeout(() => {
      el.style.outline = '';
      el.style.backgroundColor = '';
      setTimeout(() => { el.style.transition = ''; }, 300);
    }, 800);
  };

  // --- /区域框选工具集 ---

  // 3. Marquee 覆盖层
  const marquee = document.createElement('div');
  marquee.style.cssText = 'position:fixed;border:2px dashed #facc15;background:rgba(250,204,21,0.08);z-index:2147483646;pointer-events:none;display:none;border-radius:4px;';
  document.body.appendChild(marquee);

  let dragState = 'idle';
  let startX = 0, startY = 0;
  const DRAG_THRESHOLD = 5;

  // 工具栏组装 (依赖 createSVG 和 marquee 已就绪)
  pickBtn.addEventListener('click', () => {
    currentMode = 'pick';
    pickBtn.setAttribute('class', 'mb on');
    marqueeBtn.setAttribute('class', 'mb');
  });
  marqueeBtn.addEventListener('click', () => {
    currentMode = 'marquee';
    marqueeBtn.setAttribute('class', 'mb on');
    pickBtn.setAttribute('class', 'mb');
    document.querySelectorAll('.ui-catch-hover').forEach(el => el.classList.remove('ui-catch-hover'));
    marquee.style.display = 'none';
    dragState = 'idle';
  });
  closeBtn.addEventListener('click', () => cleanup());

  const toolbarSpacer = document.createElement('div');
  toolbarSpacer.style.cssText = 'width:1px;height:20px;background:rgba(255,255,255,0.15);margin:0 4px;';

  toolbar.appendChild(pickBtn);
  toolbar.appendChild(marqueeBtn);
  toolbar.appendChild(toolbarSpacer);
  toolbar.appendChild(settingsBtn);
  toolbar.appendChild(closeBtn);
  toolbarShadow.appendChild(toolbarStyle);
  toolbarShadow.appendChild(toolbar);

  // Settings dropdown panel
  settingsDropdown = document.createElement('div');
  settingsDropdown.style.cssText = 'position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(15,15,15,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.3);min-width:220px;display:none;z-index:10;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

  const uploadSection = document.createElement('div');
  uploadSection.style.cssText = 'margin-bottom:14px;';

  const uploadLabel = document.createElement('label');
  uploadLabel.style.cssText = 'display:block;padding:8px 14px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.2);border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-align:center;transition:all 0.2s;font-family:inherit;';
  uploadLabel.textContent = '\u{1F4E4} 上传精灵图';

  const uploadInput = document.createElement('input');
  uploadInput.type = 'file';
  uploadInput.accept = 'image/*';
  uploadInput.style.display = 'none';
  uploadLabel.appendChild(uploadInput);

  uploadLabel.addEventListener('mouseenter', () => { uploadLabel.style.borderColor = 'rgba(250,204,21,0.4)'; uploadLabel.style.color = 'rgba(255,255,255,0.9)'; });
  uploadLabel.addEventListener('mouseleave', () => { uploadLabel.style.borderColor = 'rgba(255,255,255,0.2)'; uploadLabel.style.color = 'rgba(255,255,255,0.7)'; });

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem('ui-catch-sprite', dataUrl);
      initSpriteCursor(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  uploadSection.appendChild(uploadLabel);
  settingsDropdown.appendChild(uploadSection);

  // FPS slider section
  const fpsSection = document.createElement('div');
  fpsSection.style.cssText = 'margin-bottom:14px;';

  const fpsHeader = document.createElement('div');
  fpsHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';

  const fpsTitle = document.createElement('span');
  fpsTitle.style.cssText = 'font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.5px;text-transform:uppercase;';
  fpsTitle.textContent = '动画速度';
  fpsHeader.appendChild(fpsTitle);

  const fpsValue = document.createElement('span');
  fpsValue.style.cssText = 'font-size:11px;font-weight:600;color:#facc15;';
  fpsValue.textContent = spriteFps + ' FPS';
  fpsHeader.appendChild(fpsValue);

  fpsSection.appendChild(fpsHeader);

  const fpsSlider = document.createElement('input');
  fpsSlider.type = 'range';
  fpsSlider.min = '1';
  fpsSlider.max = '30';
  fpsSlider.value = String(spriteFps);
  fpsSlider.style.cssText = 'width:100%;accent-color:#facc15;cursor:pointer;';
  fpsSlider.addEventListener('input', (e) => {
    spriteFps = parseInt(e.target.value);
    fpsValue.textContent = spriteFps + ' FPS';
    localStorage.setItem('ui-catch-sprite-fps', String(spriteFps));
    if (spriteActive) startSpriteAnimation();
  });
  fpsSection.appendChild(fpsSlider);
  settingsDropdown.appendChild(fpsSection);

  const anchorSection = document.createElement('div');
  anchorSection.style.cssText = 'margin-bottom:14px;';

  const anchorTitle = document.createElement('div');
  anchorTitle.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
  const anchorLabel = document.createElement('span');
  anchorLabel.style.cssText = 'font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.5px;text-transform:uppercase;';
  anchorLabel.textContent = '\u{1F3AF} 锚点定位';
  anchorTitle.appendChild(anchorLabel);
  const anchorCoords = document.createElement('span');
  anchorCoords.style.cssText = 'font-size:11px;font-weight:600;color:#facc15;';
  anchorCoords.textContent = `(${Math.round(anchorX * 100)}%, ${Math.round(anchorY * 100)}%)`;
  anchorTitle.appendChild(anchorCoords);
  anchorSection.appendChild(anchorTitle);

  const anchorInputs = document.createElement('div');
  anchorInputs.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;';

  const makeAnchorInput = (labelText, axis) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;align-items:center;gap:4px;';
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);';
    lbl.textContent = labelText;
    wrap.appendChild(lbl);
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.value = String(Math.round((axis === 'x' ? anchorX : anchorY) * 100));
    input.style.cssText = 'width:50px;padding:4px 6px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#facc15;font-size:12px;font-weight:600;text-align:center;outline:none;font-family:inherit;';
    input.addEventListener('input', () => {
      const val = Math.max(0, Math.min(100, parseInt(input.value) || 0));
      if (axis === 'x') anchorX = val / 100;
      else anchorY = val / 100;
      localStorage.setItem('ui-catch-anchor-x', String(anchorX));
      localStorage.setItem('ui-catch-anchor-y', String(anchorY));
      anchorCoords.textContent = `(${Math.round(anchorX * 100)}%, ${Math.round(anchorY * 100)}%)`;
      updateAnchorVisual();
    });
    wrap.appendChild(input);
    const pct = document.createElement('span');
    pct.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.3);';
    pct.textContent = '%';
    wrap.appendChild(pct);
    return { wrap, input };
  };

  const anchorInputX = makeAnchorInput('X', 'x');
  const anchorInputY = makeAnchorInput('Y', 'y');
  anchorInputs.appendChild(anchorInputX.wrap);
  anchorInputs.appendChild(anchorInputY.wrap);
  anchorSection.appendChild(anchorInputs);

  const anchorHint = document.createElement('div');
  anchorHint.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:6px;';
  anchorHint.textContent = '\u{1F446} 点击预览图：白点=鼠标，精灵跟随移动';
  anchorSection.appendChild(anchorHint);

  const previewBox = document.createElement('div');
  previewBox.style.cssText = 'position:relative;width:160px;height:160px;margin:0 auto;background:repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, transparent 0% 50%) 0 0/16px 16px;border-radius:8px;overflow:hidden;cursor:crosshair;border:1px solid rgba(255,255,255,0.06);';

  previewCanvas = document.createElement('canvas');
  previewCanvas.width = 128;
  previewCanvas.height = 128;
  previewCanvas.style.cssText = 'position:absolute;image-rendering:pixelated;display:none;';
  previewCtx = previewCanvas.getContext('2d');
  previewCtx.imageSmoothingEnabled = false;

  const previewGlow = document.createElement('div');
  previewGlow.style.cssText = 'position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.9);box-shadow:0 0 6px 2px rgba(250,204,21,0.8),0 0 12px 4px rgba(250,204,21,0.4);transform:translate(-50%,-50%);pointer-events:none;z-index:2;';

  const previewOutline = document.createElement('div');
  previewOutline.style.cssText = 'position:absolute;border:1px dashed rgba(250,204,21,0.3);pointer-events:none;z-index:1;display:none;';

  previewBox.appendChild(previewCanvas);
  previewBox.appendChild(previewOutline);
  previewBox.appendChild(previewGlow);
  anchorSection.appendChild(previewBox);

  const updateAnchorVisual = () => {
    if (!spriteImg) {
      previewCanvas.style.display = 'none';
      previewOutline.style.display = 'none';
      previewGlow.style.left = '50%';
      previewGlow.style.top = '50%';
      return;
    }
    previewCanvas.style.display = 'block';
    previewOutline.style.display = 'block';

    const boxSize = 160;
    const spriteDisplaySize = 128;
    const offset = (boxSize - spriteDisplaySize) / 2;

    const spriteLeft = boxSize / 2 - anchorX * spriteDisplaySize;
    const spriteTop = boxSize / 2 - anchorY * spriteDisplaySize;

    previewCanvas.style.width = spriteDisplaySize + 'px';
    previewCanvas.style.height = spriteDisplaySize + 'px';
    previewCanvas.style.left = spriteLeft + 'px';
    previewCanvas.style.top = spriteTop + 'px';

    previewOutline.style.width = spriteDisplaySize + 'px';
    previewOutline.style.height = spriteDisplaySize + 'px';
    previewOutline.style.left = spriteLeft + 'px';
    previewOutline.style.top = spriteTop + 'px';

    previewGlow.style.left = '50%';
    previewGlow.style.top = '50%';

    anchorCoords.textContent = `(${Math.round(anchorX * 100)}%, ${Math.round(anchorY * 100)}%)`;
  };

  previewBox.addEventListener('click', (e) => {
    if (!spriteImg) return;
    const rect = previewCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const displaySize = rect.width;
    anchorX = Math.max(0, Math.min(1, clickX / displaySize));
    anchorY = Math.max(0, Math.min(1, clickY / displaySize));
    localStorage.setItem('ui-catch-anchor-x', String(anchorX));
    localStorage.setItem('ui-catch-anchor-y', String(anchorY));
    anchorInputX.input.value = String(Math.round(anchorX * 100));
    anchorInputY.input.value = String(Math.round(anchorY * 100));
    updateAnchorVisual();
  });

  settingsDropdown.appendChild(anchorSection);

  if (spriteImg) {
    updateAnchorVisual();
  }

  // Clear button
  const clearSpriteBtn = document.createElement('button');
  clearSpriteBtn.style.cssText = 'width:100%;padding:8px;border:1px solid rgba(255,154,154,0.3);border-radius:8px;background:rgba(255,154,154,0.08);color:#ff9a9a;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;';
  clearSpriteBtn.textContent = '移除精灵光标';
  clearSpriteBtn.addEventListener('click', () => {
    removeSpriteCursor();
  });
  clearSpriteBtn.addEventListener('mouseenter', () => { clearSpriteBtn.style.background = 'rgba(255,154,154,0.15)'; });
  clearSpriteBtn.addEventListener('mouseleave', () => { clearSpriteBtn.style.background = 'rgba(255,154,154,0.08)'; });
  settingsDropdown.appendChild(clearSpriteBtn);

  const collabBar = document.createElement('div');
  collabBar.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;gap:6px;';

  const collabP = document.createElement('span');
  collabP.style.cssText = 'font-size:9px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:0.3px;';
  collabP.textContent = 'UI-Catch';
  collabBar.appendChild(collabP);

  const collabX = document.createElement('span');
  collabX.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.12);';
  collabX.textContent = '\u00D7';
  collabBar.appendChild(collabX);

  const collabPM = document.createElement('span');
  collabPM.style.cssText = 'font-size:9px;font-weight:700;color:rgba(250,204,21,0.35);letter-spacing:0.3px;';
  collabPM.textContent = 'PixelMotionAI';
  collabBar.appendChild(collabPM);

  const collabDesc = document.createElement('div');
  collabDesc.style.cssText = 'text-align:center;font-size:8px;color:rgba(255,255,255,0.15);margin-top:4px;letter-spacing:0.2px;';
  collabDesc.textContent = '\u{1F3A8} Powered by PixelMotionAI \u2014 Make Pixel Art Alive';
  collabBar.appendChild(collabDesc);

  settingsDropdown.appendChild(collabBar);

  toolbarShadow.appendChild(settingsDropdown);

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = settingsDropdown.style.display !== 'none';
    settingsDropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible && spriteActive && spriteImg) {
      updateSpriteFrame();
    }
  });

  dropdownOutsideListener = (e) => {
    if (settingsDropdown && settingsDropdown.style.display !== 'none' && !toolbarHost.contains(e.target)) {
      settingsDropdown.style.display = 'none';
    }
  };
  document.addEventListener('click', dropdownOutsideListener);

  let over, out, onMousedown, onMousemove, onMouseup, keydown;

  const cleanup = () => {
    document.removeEventListener('mouseover', over, true);
    document.removeEventListener('mouseout', out, true);
    document.removeEventListener('mousedown', onMousedown, true);
    document.removeEventListener('mousemove', onMousemove, true);
    document.removeEventListener('mouseup', onMouseup, true);
    document.removeEventListener('keydown', keydown, true);
    document.getElementById(styleId)?.remove();
    if (marquee && marquee.parentNode) marquee.remove();
    if (toolbarHost && toolbarHost.parentNode) toolbarHost.remove();
    if (spriteInterval) { clearInterval(spriteInterval); spriteInterval = null; }
    if (spriteCanvas && spriteCanvas.parentNode) spriteCanvas.remove();
    if (glowDot && glowDot.parentNode) glowDot.remove();
    if (dropdownOutsideListener) { document.removeEventListener('click', dropdownOutsideListener); dropdownOutsideListener = null; }
    settingsDropdown = null;
    document.querySelectorAll('.ui-catch-hover').forEach(el => el.classList.remove('ui-catch-hover'));
    dragState = 'idle';
    window.__UI_CATCH_ACTIVE = false;
    console.log('🐾 UI-Catch: 探针已安全退出。');
  };

  // 判断是否为插件自身 UI 元素 (跳过拦截)
  const isOwnUI = (el) => el === toolbarHost || el === marquee || el.closest?.('[data-ui-catch-modal]');

  // 4. 模式分流: pick=精准选取 / marquee=区域框选
  over = e => {
    if (currentMode !== 'pick' || isOwnUI(e.target)) return;
    e.target.classList.add('ui-catch-hover');
  };
  out = e => {
    if (currentMode !== 'pick' || isOwnUI(e.target)) return;
    e.target.classList.remove('ui-catch-hover');
  };

  onMousedown = e => {
    if (e.button !== 0 || isOwnUI(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (currentMode === 'marquee') {
      startX = e.clientX;
      startY = e.clientY;
      dragState = 'pending';
    }
  };

  onMousemove = e => {
    spriteMouseX = e.clientX;
    spriteMouseY = e.clientY;
    if (spriteActive && spriteCanvas) {
      spriteCanvas.style.left = (e.clientX - anchorX * spriteSize) + 'px';
      spriteCanvas.style.top = (e.clientY - anchorY * spriteSize) + 'px';
      glowDot.style.left = e.clientX + 'px';
      glowDot.style.top = e.clientY + 'px';
    }
    if (currentMode !== 'marquee' || dragState === 'idle') return;
    if (dragState === 'pending') {
      if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD) {
        dragState = 'dragging';
      }
    }
    if (dragState === 'dragging') {
      marquee.style.display = 'block';
      marquee.style.left = Math.min(startX, e.clientX) + 'px';
      marquee.style.top = Math.min(startY, e.clientY) + 'px';
      marquee.style.width = Math.abs(e.clientX - startX) + 'px';
      marquee.style.height = Math.abs(e.clientY - startY) + 'px';
    }
  };

  onMouseup = e => {
    if (isOwnUI(e.target)) return;
    e.preventDefault();
    e.stopPropagation();

    if (currentMode === 'pick') {
      captureSingle(e);
    } else if (currentMode === 'marquee' && dragState !== 'idle') {
      if (dragState === 'dragging') {
        marquee.style.display = 'none';
        const rect = {
          left: Math.min(startX, e.clientX),
          top: Math.min(startY, e.clientY),
          right: Math.max(startX, e.clientX),
          bottom: Math.max(startY, e.clientY)
        };
        const elements = findElementsInRect(rect);
        if (elements.length === 0) {
          showModal('error', { title: '未选中任何元素', message: '框选区域内没有找到元素，请重新框选。' });
          dragState = 'idle';
          return;
        }
        const container = getLowestCommonAncestor(elements);
        flashElement(container);
        captureArea(container, elements.length);
      }
      dragState = 'idle';
    }
  };

  keydown = e => {
    if (e.key === 'Escape') {
      marquee.style.display = 'none';
      dragState = 'idle';
      cleanup();
    }
  };

  // 单元素捕获
  const captureSingle = (e) => {
    const el = e.target;
    el.classList.remove('ui-catch-hover');

    const cls = (el.getAttribute('class') || '').replace('ui-catch-hover', '').trim();
    const tag = el.tagName.toLowerCase();
    const id = el.id ? ` id="${el.id}"` : '';
    const cStr = cls ? ` class="${cls}"` : '';
    let txt = (el.innerText || el.textContent || '').replace(/\n/g, ' ').trim();
    if (txt.length > 40) txt = txt.substring(0, 40) + '...';
    const fp = `<${tag}${id}${cStr}>${txt}</${tag}>`;

    let bestSelector = '', selectorLabel = '';
    if (el.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(el.id)) {
      bestSelector = '#' + CSS.escape(el.id);
      selectorLabel = 'ID';
    } else if (el.getAttribute('data-testid')) {
      bestSelector = `[data-testid="${CSS.escape(el.getAttribute('data-testid'))}"]`;
      selectorLabel = 'data-testid';
    } else {
      const unique = getUniqueSelector(el);
      if (unique !== tag || document.querySelectorAll(tag).length === 1) {
        bestSelector = unique;
        selectorLabel = 'Selector';
      } else {
        bestSelector = getCSSPath(el);
        selectorLabel = 'Path';
      }
    }

    const componentInfo = getComponentInfo(el);
    let details = `【特征指纹】\n${fp}\n\n【定位${selectorLabel}】\n${bestSelector}`;
    if (componentInfo.framework && componentInfo.componentName) {
      details += `\n\n【组件】\n<${componentInfo.componentName}> (${componentInfo.framework})`;
    }

    showModal('success', {
      title: 'UI-Catch 捕捉成功！',
      details: details
    });
    cleanup();
  };

  // 区域捕获
  const captureArea = (container, childCount) => {
    const cls = (container.getAttribute('class') || '').replace('ui-catch-hover', '').trim();
    const tag = container.tagName.toLowerCase();
    const id = container.id ? ` id="${container.id}"` : '';
    const cStr = cls ? ` class="${cls}"` : '';
    let txt = (container.innerText || container.textContent || '').replace(/\n/g, ' ').trim();
    if (txt.length > 60) txt = txt.substring(0, 60) + '...';
    const fp = `<${tag}${id}${cStr}>${txt}</${tag}>`;

    let bestSelector = '', selectorLabel = '';
    if (container.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(container.id)) {
      bestSelector = '#' + CSS.escape(container.id);
      selectorLabel = 'ID';
    } else {
      bestSelector = getUniqueSelector(container);
      selectorLabel = 'Selector';
    }

    const componentInfo = getComponentInfo(container);
    let details = `【容器特征指纹】\n${fp}\n\n【定位${selectorLabel}】\n${bestSelector}\n\n【包含子元素】${childCount} 个`;
    if (componentInfo.framework && componentInfo.componentName) {
      details += `\n\n【组件】\n<${componentInfo.componentName}> (${componentInfo.framework})`;
    }

    showModal('success', {
      title: 'UI-Catch 区域捕捉成功！',
      details: details
    });
    cleanup();
  };

  loadSavedSprite();

  document.addEventListener('mouseover', over, true);
  document.addEventListener('mouseout', out, true);
  document.addEventListener('mousedown', onMousedown, true);
  document.addEventListener('mousemove', onMousemove, true);
  document.addEventListener('mouseup', onMouseup, true);
  document.addEventListener('keydown', keydown, true);
}
