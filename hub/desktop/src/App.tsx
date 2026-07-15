import { listTools, type ToolDepotMeta } from '@tooldepot/hub-core';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { type ToolEntry, toolAccentColors, toolMap } from './toolViews';

const STORAGE_KEY = 'tooldepot:lastTool';
const SETTINGS_KEY = 'tooldepot:settings';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  animations: boolean;
  autoSaveTool: boolean;
  showToolHints: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'zh',
  animations: true,
  autoSaveTool: true,
  showToolHints: true,
};

// Simple i18n translations
const translations: Record<string, { zh: string; en: string }> = {
  ToolDepot: { zh: 'ToolDepot', en: 'ToolDepot' },
  开发者工具集: { zh: '开发者工具集', en: 'Developer Toolkit' },
  搜索工具: { zh: '搜索工具', en: 'Search tools' },
  日常: { zh: '日常', en: 'Daily' },
  '（暂无日常工具）': { zh: '（暂无日常工具）', en: '(No daily tools)' },
  开发者: { zh: '开发者', en: 'Developers' },
  无匹配工具: { zh: '无匹配工具', en: 'No matching tools' },
  设置: { zh: '设置', en: 'Settings' },
  'JSON 格式化': { zh: 'JSON 格式化', en: 'JSON Formatter' },
  'Base64 编解码': { zh: 'Base64 编解码', en: 'Base64 Encode/Decode' },
  'URL 编码转换': { zh: 'URL 编码转换', en: 'URL Encode/Decode' },
  时间戳转换: { zh: '时间戳转换', en: 'Timestamp Converter' },
  '哈希计算 (MD5/SHA)': { zh: '哈希计算 (MD5/SHA)', en: 'Hash (MD5/SHA)' },
  正则表达式测试: { zh: '正则表达式测试', en: 'Regex Tester' },
  颜色值转换: { zh: '颜色值转换', en: 'Color Converter' },
  二维码生成: { zh: '二维码生成', en: 'QR Code Generator' },
  'UUID 生成': { zh: 'UUID 生成', en: 'UUID Generator' },
  单位换算: { zh: '单位换算', en: 'Unit Converter' },
  主题模式: { zh: '主题模式', en: 'Theme Mode' },
  语言: { zh: '语言', en: 'Language' },
  动画效果: { zh: '动画效果', en: 'Animations' },
  '启用/禁用界面动画和过渡效果': {
    zh: '启用/禁用界面动画和过渡效果',
    en: 'Enable/disable UI animations and transitions',
  },
  记住上次打开的工具: { zh: '记住上次打开的工具', en: 'Remember last opened tool' },
  下次启动自动恢复上次使用的工具: {
    zh: '下次启动自动恢复上次使用的工具',
    en: 'Auto-restore last used tool on startup',
  },
  显示工具提示: { zh: '显示工具提示', en: 'Show Tool Hints' },
  在欢迎页显示工具功能简介: { zh: '在欢迎页显示工具功能简介', en: 'Show tool feature intros on welcome page' },
  数据管理: { zh: '数据管理', en: 'Data Management' },
  清除工具历史记录: { zh: '清除工具历史记录', en: 'Clear Tool History' },
  重置所有设置: { zh: '重置所有设置', en: 'Reset All Settings' },
  浅色: { zh: '浅色', en: 'Light' },
  深色: { zh: '深色', en: 'Dark' },
  跟随系统: { zh: '跟随系统', en: 'System' },
  中文: { zh: '中文', en: 'Chinese' },
  English: { zh: 'English', en: 'English' },
  设置按钮: { zh: '设置', en: 'Settings' },
  关闭: { zh: '关闭', en: 'Close' },
  '确定要清除所有工具历史记录吗？此操作不可恢复。': {
    zh: '确定要清除所有工具历史记录吗？此操作不可恢复。',
    en: 'Clear all tool history? This cannot be undone.',
  },
  '确定要重置所有设置为默认值吗？': { zh: '确定要重置所有设置为默认值吗？', en: 'Reset all settings to defaults?' },
  转换类: { zh: '转换类', en: 'Convert' },
  编码类: { zh: '编码类', en: 'Encode' },
  格式类: { zh: '格式类', en: 'Format' },
  加密类: { zh: '加密类', en: 'Crypto' },
  时间类: { zh: '时间类', en: 'Datetime' },
  生成类: { zh: '生成类', en: 'Generate' },
  实用类: { zh: '实用类', en: 'Utility' },
  开发者标题: { zh: '开发者', en: 'Developer' },
  工作: { zh: '工作', en: 'Work' },
  生活: { zh: '生活', en: 'Life' },
  开发: { zh: '开发', en: 'Develop' },
};

function t(key: string, lang: 'zh' | 'en'): string {
  return translations[key]?.[lang] ?? key;
}

const CATEGORY_LABELS: Record<string, string> = {
  work: '工作',
  life: '生活',
  dev: '开发',
};

function _categoryLabel(cat: string, lang: 'zh' | 'en'): string {
  const key = CATEGORY_LABELS[cat] ?? cat;
  return t(key, lang);
}

export function App() {
  const [metas, setMetas] = useState<ToolDepotMeta[]>([]);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({ work: true, life: true, dev: true });
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  // Translation function
  const tr = (key: string) => t(key, settings.language);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const applySystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (settings.theme === 'dark' || (settings.theme === 'system' && e.matches)) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else if (settings.theme === 'light' || (settings.theme === 'system' && !e.matches)) {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };
    // Check current preference immediately
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    applySystemTheme(mql);
    // Live-update when OS theme changes (only relevant in 'system' mode, but
    // the effect re-runs when settings.theme changes so stale listeners die)
    mql.addEventListener('change', applySystemTheme);
    // Language attribute for potential i18n
    root.lang = settings.language;
    return () => mql.removeEventListener('change', applySystemTheme);
  }, [settings.theme, settings.language]);

  // Apply reduced motion
  useEffect(() => {
    if (!settings.animations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  }, [settings.animations]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    const list = listTools();
    setMetas(list);
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    const initial = saved && settings.autoSaveTool && list.some((t) => t.id === saved) ? saved : (list[0]?.id ?? null);
    setActiveId(initial);
  }, [settings.autoSaveTool]);

  const selectTool = (id: string) => {
    setActiveId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* storage unavailable — non-fatal */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return metas;
    return metas.filter((t) => t.id.toLowerCase().includes(q) || (t.name ?? '').toLowerCase().includes(q));
  }, [metas, query]);

  const groups = useMemo(() => {
    const g: { work: ToolDepotMeta[]; life: ToolDepotMeta[]; dev: ToolDepotMeta[] } = { work: [], life: [], dev: [] };
    for (const m of filtered) {
      const cat = (m.category === 'work' || m.category === 'life' || m.category === 'dev' ? m.category : 'dev') as
        | 'work'
        | 'life'
        | 'dev';
      g[cat].push(m);
    }
    return g;
  }, [filtered]);

  const sections = ['work', 'life', 'dev'] as const;

  const entry: ToolEntry | undefined = activeId ? toolMap[activeId] : undefined;
  const ActiveComponent = entry?.Component;
  const activeTool = entry?.tool;
  const activeAccent = activeId ? (toolAccentColors[activeId] ?? '#E8751A') : '#E8751A';

  // Chinese name/description come from the generated registry (toolRegistry,
  // surfaced via listTools()/metas). The core `tool` object is English (used by
  // the CLI), so the header must read localized strings from the registry with a
  // safe fallback to the core object if a registry entry is missing.
  const registryInfo = useMemo(() => {
    const map: Record<string, { name: string; description: string }> = {};
    for (const m of metas) {
      map[m.id] = { name: m.name, description: m.description };
    }
    return map;
  }, [metas]);

  // Expose the active tool's accent as a CSS variable on the document root so
  // canvas components can read it via getComputedStyle(document.documentElement).
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', activeAccent);
  }, [activeAccent]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--text)',
        background: 'var(--main-bg)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--sidebar-bg)',
          color: 'var(--text)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${'var(--border)'}`,
        }}
      >
        {/* Header + Search */}
        <div style={{ padding: '14px 14px 10px' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: 'var(--text)' }}>ToolDepot</div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr('搜索工具')}
            className="tool-input"
            style={{ width: '100%', boxSizing: 'border-box', fontSize: 13 }}
          />
        </div>

        {/* Tool List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
          {sections.map((key) => {
            const open = sectionOpen[key] || query.trim() !== '';
            const items = groups[key];
            return (
              <div key={key} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setSectionOpen((s) => ({ ...s, [key]: !s[key] }))}
                  className="sidebar-item"
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.3px',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      transition: 'transform 0.18s ease',
                      display: 'inline-block',
                      transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▶
                  </span>
                  {tr(CATEGORY_LABELS[key] ?? key)}
                </button>
                {open && (
                  <div className="sidebar-list" style={{ marginTop: 2 }}>
                    {items.map((t) => {
                      const isActive = activeId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => selectTool(t.id)}
                          className="sidebar-item"
                          style={{
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--active-text)' : 'var(--text)',
                            background: isActive ? (toolAccentColors[t.id] ?? '#E8751A') : 'transparent',
                            borderRadius: 6,
                            fontSize: 13,
                            padding: '6px 10px',
                          }}
                        >
                          {t.name || t.id}
                        </button>
                      );
                    })}
                    {items.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 8px', opacity: 0.6 }}>
                        {tr('无匹配工具')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div style={{ padding: 10, borderTop: `1px solid ${'var(--border)'}` }}>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            title={tr('设置')}
            className="sidebar-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text)',
              padding: '6px 10px',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>{tr('设置')}</title>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {tr('设置')}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main
        className="tool-content"
        style={{
          flex: 1,
          padding: 28,
          overflowY: 'auto',
          background: 'var(--main-bg)',
        }}
      >
        {entry && ActiveComponent && activeTool ? (
          <div style={{ '--accent': activeAccent } as React.CSSProperties}>
            {/* Tool Header */}
            <div className="tool-card animate-fade-in-up" style={{ marginBottom: 20 }}>
              <h1 className="tool-title">{registryInfo[activeTool.id]?.name ?? activeTool.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
                  {registryInfo[activeTool.id]?.description ?? activeTool.description}
                </p>
                <span className="category-tag">{tr(CATEGORY_LABELS[activeTool.category] ?? activeTool.category)}</span>
              </div>
              <div className="tool-title-underline" />
            </div>

            {/* Tool Component */}
            <Suspense
              fallback={
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
              }
            >
              <ActiveComponent tool={activeTool} />
            </Suspense>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 56px)',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: '#2D2D2D', letterSpacing: '-0.5px' }}>
                ToolDepot
              </span>
              <span
                style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8751A', display: 'inline-block' }}
              />
            </div>
            <div style={{ fontSize: 18, color: '#888', marginTop: 8, marginBottom: 28 }}>{tr('开发者工具集')}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
                gap: '10px 28px',
                maxWidth: 560,
              }}
            >
              {[
                'JSON 格式化',
                'Base64 编解码',
                'URL 编码转换',
                '时间戳转换',
                '哈希计算 (MD5/SHA)',
                '正则表达式测试',
                '颜色值转换',
                '二维码生成',
                'UUID 生成',
                '单位换算',
              ].map((name, i) => (
                <div
                  key={name}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${0.1 + i * 0.05}s`,
                    animationFillMode: 'forwards',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: '#555',
                    justifyContent: 'flex-start',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CCFF22', flexShrink: 0 }} />
                  {tr(name)}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div
          className="modal-overlay animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={tr('设置')}
          tabIndex={-1}
          onClick={() => setShowSettings(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowSettings(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-label={tr('设置')}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSettings(false);
            }}
            style={{
              background: 'var(--main-bg)',
              borderRadius: 12,
              padding: 24,
              width: '90%',
              maxWidth: 480,
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{tr('设置')}</h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 4,
                  lineHeight: 1,
                }}
                aria-label={tr('关闭')}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Theme */}
              <div>
                <span
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}
                >
                  {tr('主题模式')}
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, theme: t }))}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${settings.theme === t ? 'var(--accent)' : 'var(--border)'}`,
                        background:
                          settings.theme === t
                            ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                            : 'var(--surface)',
                        color: settings.theme === t ? 'var(--accent)' : 'var(--text)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t === 'light' ? tr('浅色') : t === 'dark' ? tr('深色') : tr('跟随系统')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <span
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}
                >
                  {tr('语言')}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['zh', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, language: l }))}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${settings.language === l ? 'var(--accent)' : 'var(--border)'}`,
                        background:
                          settings.language === l
                            ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                            : 'var(--surface)',
                        color: settings.language === l ? 'var(--accent)' : 'var(--text)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {l === 'zh' ? tr('中文') : tr('English')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{tr('动画效果')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {tr('启用/禁用界面动画和过渡效果')}
                  </div>
                </div>
                <label style={{ position: 'relative', width: 48, height: 28 }}>
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={(e) => setSettings((s) => ({ ...s, animations: e.target.checked }))}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: settings.animations ? 'var(--accent)' : 'var(--border)',
                      borderRadius: 14,
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: settings.animations ? 24 : 2,
                        width: 20,
                        height: 20,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Auto Save Tool */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{tr('记住上次打开的工具')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {tr('下次启动自动恢复上次使用的工具')}
                  </div>
                </div>
                <label style={{ position: 'relative', width: 48, height: 28 }}>
                  <input
                    type="checkbox"
                    checked={settings.autoSaveTool}
                    onChange={(e) => setSettings((s) => ({ ...s, autoSaveTool: e.target.checked }))}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: settings.autoSaveTool ? 'var(--accent)' : 'var(--border)',
                      borderRadius: 14,
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: settings.autoSaveTool ? 24 : 2,
                        width: 20,
                        height: 20,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Show Tool Hints */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{tr('显示工具提示')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tr('在欢迎页显示工具功能简介')}</div>
                </div>
                <label style={{ position: 'relative', width: 48, height: 28 }}>
                  <input
                    type="checkbox"
                    checked={settings.showToolHints}
                    onChange={(e) => setSettings((s) => ({ ...s, showToolHints: e.target.checked }))}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: settings.showToolHints ? 'var(--accent)' : 'var(--border)',
                      borderRadius: 14,
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: settings.showToolHints ? 24 : 2,
                        width: 20,
                        height: 20,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Data Management */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>
                  {tr('数据管理')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(tr('确定要清除所有工具历史记录吗？此操作不可恢复。'))) {
                        try {
                          localStorage.removeItem(STORAGE_KEY);
                          for (const key of Object.keys(localStorage)) {
                            if (key.startsWith('tooldepot:history:')) localStorage.removeItem(key);
                          }
                        } catch {}
                      }
                    }}
                    className="tool-btn secondary"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    {tr('清除工具历史记录')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(tr('确定要重置所有设置为默认值吗？'))) {
                        setSettings(DEFAULT_SETTINGS);
                        try {
                          localStorage.removeItem(SETTINGS_KEY);
                        } catch {}
                      }
                    }}
                    className="tool-btn secondary"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    {tr('重置所有设置')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
