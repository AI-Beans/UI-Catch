import React, { useState, useEffect, useCallback } from 'react';

/* ─── Icons ─── */
const Icons = {
  Copy: ({ size = 16 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  ),
  Save: ({ size = 14 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Upload: ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  ChevronDown: ({ size = 14 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: ({ size = 14 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
};

/* ─── Design Tokens ─── */
const T = {
  canvasPage: '#FBFBFA',
  canvas: '#ffffff',
  surface: '#f6f5f4',
  surfaceSoft: '#fafaf9',
  hairline: '#e9e9e6',
  hairlineStrong: '#d3d3d0',
  ink: '#37352f',
  inkSecondary: '#5d5b54',
  inkMuted: '#787671',
  inkPlaceholder: '#a4a097',
  selection: '#f1f1ef',
  primary: '#5645d4',
  tintLavender: '#e6e0f5',
  tintPeach: '#ffe8d4',
  tintMint: '#d9f3e1',
};

const PERSPECTIVE_TINT = {
  authentic: { bg: T.tintLavender, text: '#391c57', label: '本我', emoji: '🌱' },
  visual: { bg: T.tintPeach, text: '#793400', label: '获得', emoji: '⚡' },
  cocreate: { bg: T.tintMint, text: '#0d5e24', label: '共创', emoji: '💬' },
};

/* ─── DEV_FALLBACK_DATA ─── */
const DEV_FALLBACK_DATA = {
  "schemaVersion": "1.0.0",
  "repoName": "PixelMotion",
  "activeBranch": "main",
  "lastGeneratedAt": "2026-05-26T17:23:00Z",
  "developerName": "KKD",
  "stats": { "totalCommits": 4, "totalWords": 1420 },
  "commits": [
    {
      "id": 1, "hash": "a1c89f2", "branch": "main", "dateLabel": "03.10",
      "timestamp": "2026-03-10T14:32:00Z",
      "commitTitle": "像素渲染内核上线",
      "commitMessage": "feat: core pixelization algorithm",
      "codeDiffSnippet": "",
      "story": "你的图片一键变成 FC 游戏机的像素画。拖入即转，秒回 8-bit 时代。第一版功能上线了。",
      "selectedPerspective": { "perspective": "visual", "reason": "Feature launch → user pain+relief" },
      "perspectives": {
        "authentic": { "title": "第一行像素代码动起来的时候", "content": "今天我把第一行像素渲染代码合进了 main。算法枯燥但看到测试图变成 8-bit 复古小人的那一刻，熬夜都值了。", "brandVoiceTag": "🌱 真实不装", "visualHint": "📸 Canvas 视口截图" },
        "visual": { "title": "一键将图片转成像素画！", "content": "支持 JPG/PNG 一键提取 8-bit 复古像素风。拒绝繁琐配置，拖入即转。让你的创作多一种像素表达。", "brandVoiceTag": "⚡ 极速获得", "visualHint": "📸 功能演示 GIF" },
        "cocreate": { "title": "为什么我要自己写一个像素转换器？", "content": "做独立游戏时饱受逐帧绘制像素动作的苦。第一版上线了，很想听听你们的意见！下个功能想加点什么？", "brandVoiceTag": "💬 用户共创", "visualHint": "📸 群聊截图" }
      },
      "activePerspective": "visual", "isPublished": true, "socialMetrics": { "likes": 241, "bookmarks": 85 }
    },
    {
      "id": 2, "hash": "f4e209a", "branch": "main", "dateLabel": "04.12",
      "timestamp": "2026-04-12T10:15:00Z",
      "commitTitle": "序列帧打包导出",
      "commitMessage": "feat: sprite-sheet packing for Unity",
      "codeDiffSnippet": "",
      "story": "还在 Photoshop 里手动对齐像素帧？一键打包标准 Sprite Sheet，直接拖进 Unity 就能动。省下的时间去做关卡设计吧。",
      "selectedPerspective": { "perspective": "visual", "reason": "Feature launch → user pain+relief" },
      "perspectives": {
        "authentic": { "title": "Unity 老哥们催更的 SpriteSheet 搞定了", "content": "群里做游戏的老哥天天催要序列帧。四天重写拼图算法，一键打包 PNG 序列帧大图。", "brandVoiceTag": "🌱 听取吐槽", "visualHint": "📸 导出流程 GIF" },
        "visual": { "title": "一键 SpriteSheet 导出，告别手动对齐", "content": "一键拼接标准 Sprite Sheet，直接拖入 Unity/Godot。把重复对齐交给工具，留精力做设计。", "brandVoiceTag": "⚡ 效率利器", "visualHint": "📸 before/after 对比" },
        "cocreate": { "title": "被群友逼着做出来的功能", "content": "收到十几位群友深度测试反馈。拼图算法赶工完成，快去体验，有 bug 继续砸向我！", "brandVoiceTag": "💬 温暖互助", "visualHint": "📸 群聊截图" }
      },
      "activePerspective": "visual", "isPublished": true, "socialMetrics": { "likes": 512, "bookmarks": 194 }
    },
    {
      "id": 3, "hash": "c7b521d", "branch": "hotfix/traffic", "dateLabel": "05.10",
      "timestamp": "2026-05-10T08:12:00Z",
      "commitTitle": "扩容应对破万流量",
      "commitMessage": "hotfix: scale Redis under traffic surge",
      "codeDiffSnippet": "",
      "story": "注册悄悄破了 12,000 人。服务器被挤爆，连夜扩容 Redis + 优化冷启动。现在高峰期零排队。谢谢包容这个「草台班子」。",
      "selectedPerspective": { "perspective": "authentic", "reason": "Hotfix → developer conviction about reliability" },
      "perspectives": {
        "authentic": { "title": "服务器被挤爆了", "content": "博主自发安利，带宽瞬间爆了。一边扩容一边流冷汗。等拉回来，注册已破万。有你们在，底气真足。", "brandVoiceTag": "🌱 暴露脆弱", "visualHint": "📸 后台告警截图" },
        "visual": { "title": "1.2w 像素画手都在用", "content": "注册突破 12,000 人。服务器扩容完毕，响应提升 300%，高峰期零排队。", "brandVoiceTag": "⚡ 数据佐证", "visualHint": "📸 用户增长图" },
        "cocreate": { "title": "谢谢陪我从 0 到 1.2w", "content": "服务器报警时大家没有催促，反而帮我测延迟。底层优化已合入，尽情折腾！", "brandVoiceTag": "💬 温暖互助", "visualHint": "📸 群聊截图" }
      },
      "activePerspective": "authentic", "isPublished": true, "socialMetrics": { "likes": 982, "bookmarks": 421 }
    },
    {
      "id": 4, "hash": "e93ab5c", "branch": "feat/showcase", "dateLabel": "05.23",
      "timestamp": "2026-05-23T23:11:00Z",
      "commitTitle": "资产角色橱窗上线",
      "commitMessage": "feat: showcase card component",
      "codeDiffSnippet": "",
      "story": "生成了一堆像素角色找不到？按角色 ID 自动分类归档，每个像素人有自己的展示单间。不用再翻文件夹了。",
      "selectedPerspective": { "perspective": "visual", "reason": "Feature launch → user pain+relief" },
      "perspectives": {
        "authentic": { "title": "不能让像素宝贝散养了", "content": "看到用户晒出上千张像素小人，不能让他们散养在文件夹里。角色橱柜上线，每个小人有了专属展示单间。", "brandVoiceTag": "🌱 浪漫本我", "visualHint": "📸 橱窗 UI 截图" },
        "visual": { "title": "别让像素角色吃灰了", "content": "按角色 ID 自动分类归档，精致卡片展示间一目了然。给你的像素小人安个家。", "brandVoiceTag": "⚡ 直击痛点", "visualHint": "📸 before/after 截图" },
        "cocreate": { "title": "你们要的「像素单间」盖好了", "content": "群友吐槽找图太费劲。角色橱柜功能上线，不满意的继续呼叫我！", "brandVoiceTag": "💬 极速迭代", "visualHint": "📸 群聊截图" }
      },
      "activePerspective": "visual", "isPublished": false, "socialMetrics": { "likes": 0, "bookmarks": 0 }
    }
  ]
};

/* ─── Helpers ─── */
function getStoryText(commit) {
  if (commit.story) return commit.story;
  const key = commit.activePerspective || 'authentic';
  return commit.perspectives?.[key]?.content || '';
}

/* ─── Toast ─── */
function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{
        backgroundColor: T.ink,
        color: '#fff',
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.4,
        padding: '6px 18px',
        borderRadius: 9999,
        boxShadow: '0 8px 32px rgba(15,15,15,0.12)',
      }}
    >
      {message}
    </div>
  );
}

/* ─── Drop Overlay ─── */
function DropOverlay() {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(55,53,47,0.04)', border: '2px dashed rgba(211,211,208,0.6)' }}
    >
      <span style={{ fontSize: 14, color: T.inkMuted }}>松手载入数据</span>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: T.canvasPage }}>
      <div
        className="flex items-center justify-center mb-6"
        style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: T.surface,
        }}
      >
        <Icons.Upload size={22} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.3, marginBottom: 8 }}>
        Git2Content
      </h1>
      <p style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.5, textAlign: 'center', maxWidth: 280, marginBottom: 24 }}>
        将 chronicle.json 拖入此处，<br />查看你的社媒文案。
      </p>
      <div
        style={{
          border: `1px dashed ${T.hairlineStrong}`,
          borderRadius: 12,
          padding: '20px 40px',
          fontSize: 13,
          color: T.inkPlaceholder,
        }}
      >
        拖入 chronicle.json 文件
      </div>
    </div>
  );
}

/* ─── Commit Card ─── */
function CommitCard({ commit, isExpanded, onToggleExpand, onCopy }) {
  const story = getStoryText(commit);
  const selected = commit.selectedPerspective;
  const meta = selected ? PERSPECTIVE_TINT[selected.perspective] : null;

  return (
    <article
      style={{
        backgroundColor: T.canvas,
        borderRadius: 12,
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 2px 8px rgba(15,15,15,0.06)',
        padding: 24,
        marginBottom: 16,
      }}
    >
      {/* Header row: date + title + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
              fontSize: 12,
              color: T.inkPlaceholder,
              flexShrink: 0,
            }}
          >
            {commit.dateLabel}
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, color: T.ink }}>
            {commit.commitTitle}
          </h2>
        </div>
        {meta && (
          <span
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 500,
              color: T.inkMuted,
              backgroundColor: T.surface,
              padding: '2px 10px',
              borderRadius: 9999,
              whiteSpace: 'nowrap',
            }}
          >
            {meta.emoji} {meta.label}
          </span>
        )}
      </div>

      {/* Story text — the reading protagonist */}
      {story && (
        <p
          style={{
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.6,
            color: T.ink,
            whiteSpace: 'pre-line',
            marginBottom: 16,
          }}
        >
          {story}
        </p>
      )}

      {/* Actions row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => onCopy(story)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 500,
            color: T.inkMuted,
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            transition: 'color 120ms ease, background-color 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.surface; e.currentTarget.style.color = T.ink; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = T.inkMuted; }}
        >
          <Icons.Copy size={14} /> 复制
        </button>
        <button
          onClick={onToggleExpand}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: T.inkMuted,
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            transition: 'color 120ms ease, background-color 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.surface; e.currentTarget.style.color = T.ink; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = T.inkMuted; }}
        >
          {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />} {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      {/* Expanded drawer */}
      {isExpanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.hairline}`,
          }}
        >
          {/* 3 Perspectives */}
          {commit.perspectives && Object.entries(commit.perspectives).map(([key, p]) => {
            const tint = PERSPECTIVE_TINT[key] || { bg: T.surfaceSoft, text: T.inkSecondary, emoji: '', label: key };
            return (
              <div
                key={key}
                style={{
                  backgroundColor: tint.bg,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tint.text }}>
                    {tint.emoji} {tint.label} · {p.title}
                  </span>
                  <button
                    onClick={() => onCopy(p.content)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T.inkMuted,
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    复制
                  </button>
                </div>
                <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: T.inkSecondary, whiteSpace: 'pre-line' }}>
                  {p.content}
                </p>
                {p.visualHint && (
                  <p style={{ fontSize: 12, color: T.inkPlaceholder, marginTop: 6 }}>{p.visualHint}</p>
                )}
              </div>
            );
          })}

          {/* Technical metadata */}
          <div style={{ fontSize: 12, color: T.inkPlaceholder, lineHeight: 1.5 }}>
            <p>
              <span style={{ fontFamily: 'ui-monospace, SF Mono, Menlo, monospace' }}>{commit.hash}</span>
              {' · '}
              {commit.commitMessage}
            </p>
            {commit.codeDiffSnippet && (
              <pre
                style={{
                  backgroundColor: T.selection,
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 11,
                  fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
                  overflowX: 'auto',
                  maxHeight: 160,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {commit.codeDiffSnippet}
              </pre>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ─── App ─── */
export default function App() {
  const [data, setData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const handleDrop = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.commits?.length) { showToast('JSON 格式不正确'); return; }
      setData(parsed);
      showToast('数据已加载');
    } catch { showToast('JSON 解析失败'); }
  }, [showToast]);

  useEffect(() => {
    const onDragEnter = (e) => { e.preventDefault(); setDragActive(true); };
    const onDragOver = (e) => { e.preventDefault(); };
    const onDragLeave = (e) => {
      if (!e.relatedTarget || e.relatedTarget === document.documentElement) setDragActive(false);
    };
    const onDrop = (e) => {
      e.preventDefault(); setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => handleDrop(ev.target.result);
      reader.readAsText(file);
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [handleDrop]);

  const copyText = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
  }, [showToast]);

  const copyAll = useCallback(() => {
    if (!data) return;
    const all = data.commits.map((c) => {
      const story = getStoryText(c);
      return story ? `${c.commitTitle}\n${story}` : '';
    }).filter(Boolean).join('\n\n---\n\n');
    navigator.clipboard.writeText(all).then(() => showToast('已复制全部文案'));
  }, [data, showToast]);

  const exportJson = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${data.repoName || 'chronicle'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [data]);

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.canvasPage }}>
      <Toast message={toast} />
      {dragActive && <DropOverlay />}

      {!data ? (
        <EmptyState />
      ) : (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
          {/* Header */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 24,
              marginBottom: 32,
              borderBottom: `1px solid ${T.hairline}`,
            }}
          >
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>
                {data.repoName}
              </h1>
              <p style={{ fontSize: 13, color: T.inkMuted, lineHeight: 1.4, marginTop: 2 }}>
                {data.developerName} · {data.activeBranch} · {data.commits.length} 条文案
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={copyAll}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 500, color: T.inkMuted,
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${T.hairline}`, background: T.canvas,
                  cursor: 'pointer',
                  transition: 'border-color 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.hairlineStrong; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.hairline; }}
              >
                <Icons.Copy size={13} /> 复制全部
              </button>
              <button
                onClick={exportJson}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 500, color: T.inkMuted,
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${T.hairline}`, background: T.canvas,
                  cursor: 'pointer',
                  transition: 'border-color 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.hairlineStrong; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.hairline; }}
              >
                <Icons.Save size={13} /> 保存
              </button>
            </div>
          </header>

          {/* Feed */}
          <div>
            {data.commits.map((commit) => (
              <CommitCard
                key={commit.id}
                commit={commit}
                isExpanded={expanded.has(commit.id)}
                onToggleExpand={() => toggleExpand(commit.id)}
                onCopy={copyText}
              />
            ))}
          </div>

          {/* Footer */}
          <footer
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: `1px solid ${T.hairline}`,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 500,
              color: T.inkPlaceholder,
            }}
          >
            Git2Content · 拖入新的 chronicle.json 可刷新数据
          </footer>
        </div>
      )}
    </div>
  );
}
