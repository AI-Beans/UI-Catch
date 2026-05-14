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
    style.textContent = '.ui-catch-hover { outline: 3px solid #deff9a !important; outline-offset: -3px !important; background-color: rgba(222, 255, 154, 0.2) !important; cursor: crosshair !important; transition: all 0.1s; }';
    document.head.appendChild(style);
  }

  // 2. 模式切换工具栏 (Shadow DOM)
  let currentMode = 'pick';
  const toolbarHost = document.createElement('div');
  toolbarHost.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
  const toolbarShadow = toolbarHost.attachShadow({ mode: 'open' });
  const toolbarStyle = document.createElement('style');
  toolbarStyle.textContent = '.tb{display:flex;align-items:center;gap:2px;background:rgba(15,15,15,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:4px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.3);} .mb{padding:8px 16px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.5);background:transparent;font-family:inherit;} .mb:hover{color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.08);} .mb.on{color:#000;background:#deff9a;} .cb{padding:8px 10px;border:none;border-radius:8px;cursor:pointer;color:#fff;background:transparent;transition:all 0.2s;display:flex;align-items:center;justify-content:center;} .cb:hover{color:#fff;background:rgba(255,255,255,0.1);}';
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

  document.body.appendChild(toolbarHost);


  // --- 自定义通知系统 (Shadow DOM 封装) ---
  const showModal = (type, data) => {
    const isSuccess = type === 'success';
    const accentColor = isSuccess ? '#deff9a' : '#ff9a9a';
    
    // Shadow DOM Host
    const host = document.createElement('div');
    host.setAttribute('data-ui-catch-modal', '');
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
    closeBtn.textContent = '\u00D7';
    closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:300;line-height:1;padding:0;transition:all 0.2s;';
    closeBtn.onmouseenter = () => { closeBtn.style.background='rgba(255,255,255,0.15)'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background='rgba(255,255,255,0.08)'; };
    
    // 头部：图标 + 标题
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:20px;';
    const iconSvg = isSuccess
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#deff9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9a9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    header.appendChild(createSVG(iconSvg));
    
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
      textarea.style.cssText = 'width:100%;min-height:200px;max-height:400px;resize:vertical;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px 16px;font-family:"SF Mono",Monaco,Inconsolata,"Fira Code","Cascadia Code",monospace;font-size:12px;color:#e8e8e8;line-height:1.6;outline:none;box-sizing:border-box;';
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
        if (child === marquee || child === toolbarHost || child.id === styleId) continue;
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
    el.style.outline = '3px solid #deff9a';
    el.style.backgroundColor = 'rgba(222,255,154,0.15)';
    setTimeout(() => {
      el.style.outline = '';
      el.style.backgroundColor = '';
      setTimeout(() => { el.style.transition = ''; }, 300);
    }, 800);
  };

  // --- /区域框选工具集 ---

  // 3. Marquee 覆盖层
  const marquee = document.createElement('div');
  marquee.style.cssText = 'position:fixed;border:2px dashed #deff9a;background:rgba(222,255,154,0.08);z-index:2147483646;pointer-events:none;display:none;border-radius:4px;';
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
  toolbar.appendChild(pickBtn);
  toolbar.appendChild(marqueeBtn);
  toolbar.appendChild(closeBtn);
  toolbarShadow.appendChild(toolbarStyle);
  toolbarShadow.appendChild(toolbar);

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

    let prompt = `我在调整前端 UI。请帮我修改下面这个特定元素：\n\n【特征指纹】\n${fp}\n\n【定位${selectorLabel}】\n${bestSelector}`;
    if (componentInfo.framework && componentInfo.componentName) {
      prompt += `\n\n【组件】\n<${componentInfo.componentName}> (${componentInfo.framework})`;
    }
    prompt += `\n\n【我的需求】\n1. `;

    showModal('success', { title: 'UI-Catch 捕捉成功！', prompt: prompt, autoDismiss: false });
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

    let prompt = `我在调整前端 UI。请帮我处理下面这个【区块/容器】：\n\n【容器特征指纹】\n${fp}\n\n【定位${selectorLabel}】\n${bestSelector}\n\n【包含子元素】${childCount} 个`;
    if (componentInfo.framework && componentInfo.componentName) {
      prompt += `\n\n【组件】\n<${componentInfo.componentName}> (${componentInfo.framework})`;
    }
    prompt += `\n\n【我的需求】\n1. `;

    console.log("📝 区域 Prompt:\n", prompt);
    showModal('success', { title: 'UI-Catch 区域捕捉成功！', prompt: prompt, autoDismiss: false });
    cleanup();
  };

  document.addEventListener('mouseover', over, true);
  document.addEventListener('mouseout', out, true);
  document.addEventListener('mousedown', onMousedown, true);
  document.addEventListener('mousemove', onMousemove, true);
  document.addEventListener('mouseup', onMouseup, true);
  document.addEventListener('keydown', keydown, true);
}
