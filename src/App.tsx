import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { cloneDefaultResume, createBlankResume, createModule, MODULE_META, uid } from './data'
import type { ActiveSelection, ModuleType, ResumeData, ResumeHistoryEntry, ResumeModule } from './types'
import { TEMPLATES } from './templates'
import { EditorPanel } from './components/EditorPanel'
import { Icon } from './components/Icon'
import { ModuleLibrary } from './components/ModuleLibrary'
import { ResumePreview } from './components/ResumePreview'

const STORAGE_KEY = 'jianli-studio-resume-v1'
const HISTORY_KEY = 'jianli-studio-history-v1'
const MAX_HISTORY = 30

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function normalizeImportedResume(value: unknown): ResumeData | null {
  if (!value || typeof value !== 'object') return null
  const root = value as Record<string, unknown>
  const candidate = ('resume' in root ? root.resume : value) as Partial<ResumeData> | undefined
  if (!candidate?.profile || !candidate.theme || !Array.isArray(candidate.modules)) return null

  const moduleTypes = new Set(Object.keys(MODULE_META))
  const modules = candidate.modules.filter((module): module is ResumeModule => (
    Boolean(module)
    && typeof module.id === 'string'
    && moduleTypes.has(module.type)
    && typeof module.title === 'string'
    && typeof module.visible === 'boolean'
    && Array.isArray(module.items)
  ))
  if (modules.length !== candidate.modules.length) return null

  const blank = createBlankResume()
  const profile = candidate.profile as Partial<ResumeData['profile']>
  const theme = candidate.theme as Partial<ResumeData['theme']>
  const text = (field: keyof ResumeData['profile']) => typeof profile[field] === 'string' ? profile[field] : blank.profile[field]

  return {
    profile: {
      name: text('name'),
      title: text('title'),
      email: text('email'),
      phone: text('phone'),
      location: text('location'),
      website: text('website'),
      avatar: text('avatar'),
      tagline: text('tagline'),
    },
    modules,
    theme: {
      template: TEMPLATES.some((template) => template.id === theme.template) ? theme.template! : blank.theme.template,
      accent: typeof theme.accent === 'string' ? theme.accent : blank.theme.accent,
      font: theme.font === 'serif' || theme.font === 'humanist' ? theme.font : 'sans',
      density: theme.density === 'compact' ? 'compact' : 'comfortable',
    },
    updatedAt: Date.now(),
  }
}

function loadResume(): ResumeData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return cloneDefaultResume()
    const parsed = JSON.parse(stored) as ResumeData
    if (!parsed.profile || !Array.isArray(parsed.modules) || !parsed.theme) return cloneDefaultResume()
    return parsed
  } catch {
    return cloneDefaultResume()
  }
}

function normalizeHistoryEntries(value: unknown): ResumeHistoryEntry[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const candidate = entry as Partial<ResumeHistoryEntry>
    const normalizedResume = normalizeImportedResume(candidate.resume)
    if (!normalizedResume || typeof candidate.id !== 'string' || typeof candidate.savedAt !== 'number') return []
    return [{
      id: candidate.id,
      label: typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label : '未命名简历',
      savedAt: candidate.savedAt,
      resume: normalizedResume,
    }]
  }).slice(0, MAX_HISTORY)
}

function loadHistory(): ResumeHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? normalizeHistoryEntries(JSON.parse(stored)) : []
  } catch {
    return []
  }
}

const cloneResume = (resume: ResumeData): ResumeData => JSON.parse(JSON.stringify({ ...resume, updatedAt: Date.now() })) as ResumeData

const formatHistoryTime = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
}).format(timestamp)

export default function App() {
  const [resume, setResume] = useState<ResumeData>(loadResume)
  const [active, setActive] = useState<ActiveSelection>('profile')
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [toast, setToast] = useState('')
  const [mobileView, setMobileView] = useState<'modules' | 'preview' | 'edit'>('preview')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches)
  const [history, setHistory] = useState<ResumeHistoryEntry[]>(loadHistory)
  const [historyOpen, setHistoryOpen] = useState(false)
  const toastTimer = useRef<number | null>(null)
  const backupInput = useRef<HTMLInputElement | null>(null)
  const dataMenu = useRef<HTMLDetailsElement | null>(null)

  const visibleCount = useMemo(() => resume.modules.filter((module) => module.visible).length, [resume.modules])

  useEffect(() => {
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...resume, updatedAt: Date.now() }))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [resume])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      setSaveState('error')
    }
  }, [history])

  useEffect(() => {
    if (!historyOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHistoryOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [historyOpen])

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const markInstalled = () => {
      setInstallPrompt(null)
      setIsStandalone(true)
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', markInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
      window.removeEventListener('appinstalled', markInstalled)
    }
  }, [])

  const notify = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  const historyLabel = (source: ResumeData) => [
    source.profile.name.trim() || '未命名简历',
    source.profile.title.trim(),
  ].filter(Boolean).join(' · ')

  const archiveResume = (source: ResumeData, label?: string, announce = false) => {
    const entry: ResumeHistoryEntry = {
      id: uid(),
      label: label || historyLabel(source),
      savedAt: Date.now(),
      resume: cloneResume(source),
    }
    setHistory((current) => [entry, ...current].slice(0, MAX_HISTORY))
    if (announce) notify(`已保存历史版本「${entry.label}」`)
    return entry
  }

  const saveHistorySnapshot = () => {
    archiveResume(resume, undefined, true)
    closeDataMenu()
  }

  const showHistory = () => {
    closeDataMenu()
    setHistoryOpen(true)
  }

  const restoreHistory = (entry: ResumeHistoryEntry) => {
    if (!window.confirm(`确定恢复「${entry.label}」吗？当前版本会先自动存入历史。`)) return
    archiveResume(resume, `恢复前 · ${historyLabel(resume)}`)
    setResume(cloneResume(entry.resume))
    setActive('profile')
    setMobileView('preview')
    setHistoryOpen(false)
    notify(`已恢复「${entry.label}」`)
  }

  const deleteHistory = (entry: ResumeHistoryEntry) => {
    if (!window.confirm(`确定删除历史版本「${entry.label}」吗？`)) return
    setHistory((current) => current.filter((item) => item.id !== entry.id))
    notify('历史版本已删除')
  }

  const updateProfile = (key: keyof ResumeData['profile'], value: string) => {
    setResume((current) => ({ ...current, profile: { ...current.profile, [key]: value } }))
  }

  const updateModule = (id: string, patch: Partial<ResumeModule>) => {
    setResume((current) => ({ ...current, modules: current.modules.map((module) => module.id === id ? { ...module, ...patch } : module) }))
  }

  const addModule = (type: ModuleType, visibleIndex = visibleCount) => {
    const existing = resume.modules.find((module) => module.type === type)
    if (existing && type !== 'custom') {
      setActive(existing.id)
      setMobileView('edit')
      notify(`${MODULE_META[type].label}已经在简历中了`)
      return
    }
    const next = createModule(type)
    setResume((current) => {
      const visible = current.modules.filter((module) => module.visible)
      const targetId = visible[visibleIndex]?.id
      const actualIndex = targetId ? current.modules.findIndex((module) => module.id === targetId) : current.modules.length
      const modules = [...current.modules]
      modules.splice(actualIndex, 0, next)
      return { ...current, modules }
    })
    setActive(next.id)
    notify(`已添加「${next.title}」`)
  }

  const moveModule = (id: string, visibleTargetIndex: number) => {
    setResume((current) => {
      const source = current.modules.find((module) => module.id === id)
      if (!source) return current
      const originalVisible = current.modules.filter((module) => module.visible)
      const sourceVisibleIndex = originalVisible.findIndex((module) => module.id === id)
      let adjustedTarget = visibleTargetIndex
      if (sourceVisibleIndex >= 0 && sourceVisibleIndex < visibleTargetIndex) adjustedTarget -= 1
      const remaining = current.modules.filter((module) => module.id !== id)
      const remainingVisible = remaining.filter((module) => module.visible)
      const targetId = remainingVisible[Math.max(0, adjustedTarget)]?.id
      const actualTarget = targetId ? remaining.findIndex((module) => module.id === targetId) : remaining.length
      remaining.splice(actualTarget, 0, source)
      return { ...current, modules: remaining }
    })
  }

  const moveModuleStep = (id: string, direction: -1 | 1) => {
    setResume((current) => {
      const index = current.modules.findIndex((module) => module.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.modules.length) return current
      const modules = [...current.modules]
      const [moved] = modules.splice(index, 1)
      modules.splice(target, 0, moved)
      return { ...current, modules }
    })
  }

  const removeModule = (id: string) => {
    const removed = resume.modules.find((module) => module.id === id)
    if (removed && !window.confirm(`确定删除「${removed.title}」吗？其中已填写的内容也会被移除。`)) return
    setResume((current) => ({ ...current, modules: current.modules.filter((module) => module.id !== id) }))
    if (active === id) setActive('profile')
    if (removed) notify(`已移除「${removed.title}」`)
  }

  const exportPdf = () => {
    const originalTitle = document.title
    const safeName = resume.profile.name.trim() || '个人'
    document.title = `${safeName}-简历`
    notify('正在打开 PDF 导出窗口…')
    window.setTimeout(() => {
      window.print()
      document.title = originalTitle
    }, 150)
  }

  const closeDataMenu = () => {
    if (dataMenu.current) dataMenu.current.open = false
  }

  const resetResume = () => {
    if (!window.confirm('确定恢复示例内容吗？你当前填写的信息会被替换。')) return
    archiveResume(resume, `恢复示例前 · ${historyLabel(resume)}`)
    setResume(cloneDefaultResume())
    setActive('profile')
    closeDataMenu()
    notify('已恢复示例简历')
  }

  const startBlankResume = () => {
    if (!window.confirm('确定新建空白简历吗？当前内容会自动存入历史简历。')) return
    archiveResume(resume, `新建前 · ${historyLabel(resume)}`)
    setResume(createBlankResume())
    setActive('profile')
    setMobileView('edit')
    closeDataMenu()
    notify('已新建空白简历')
  }

  const exportBackup = () => {
    const payload = JSON.stringify({
      app: 'resume-studio',
      version: 2,
      exportedAt: new Date().toISOString(),
      resume: { ...resume, updatedAt: Date.now() },
      history,
    }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const anchor = document.createElement('a')
    const safeName = resume.profile.name.trim().replace(/[\\/:*?"<>|]/g, '-') || '我的'
    anchor.href = url
    anchor.download = `${safeName}-简历备份.json`
    anchor.click()
    URL.revokeObjectURL(url)
    closeDataMenu()
    notify('JSON 备份已导出')
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const imported = normalizeImportedResume(parsed)
      if (!imported) throw new Error('invalid backup')
      if (parsed && typeof parsed === 'object' && 'history' in parsed) {
        setHistory(normalizeHistoryEntries((parsed as Record<string, unknown>).history))
      }
      setResume(imported)
      setActive('profile')
      setMobileView('preview')
      notify('简历与历史记录已恢复')
    } catch {
      notify('无法恢复：请选择本应用导出的 JSON 文件')
    }
  }

  const installApp = async () => {
    closeDataMenu()
    if (isStandalone) {
      notify('应用已经安装到当前设备')
      return
    }
    if (!installPrompt) {
      notify('可在浏览器菜单中选择“安装应用”')
      return
    }
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') notify('应用安装已开始')
    setInstallPrompt(null)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark"><span>简</span><i /></div>
          <div className="brand-copy"><strong>简历造物所</strong><small>RESUME STUDIO</small></div>
        </div>

        <div className="template-switcher" aria-label="选择简历模板">
          <span className="template-label">模板</span>
          {TEMPLATES.map((template) => (
            <button key={template.id} className={resume.theme.template === template.id ? 'is-active' : ''} onClick={() => setResume((current) => ({ ...current, theme: { ...current.theme, template: template.id } }))}>
              <i className={`template-thumb thumb-${template.id}`} /><span><strong>{template.name}</strong><small>{template.subtitle}</small></span>
            </button>
          ))}
        </div>

        <div className="header-actions">
          <span className={`save-status is-${saveState}`} aria-live="polite"><i />{saveState === 'saved' ? '已自动保存' : saveState === 'saving' ? '正在保存' : '保存失败'}</span>
          <details className="data-menu" ref={dataMenu}>
            <summary className="reset-button" title="新建、备份与恢复"><Icon name="database" size={16} /><span>数据</span><Icon name="chevronDown" size={13} /></summary>
            <div className="data-popover">
              <div className="data-popover-heading"><strong>简历数据</strong><small>本地保存 · 随时备份</small></div>
              <button onClick={startBlankResume}><Icon name="plusSquare" size={17} /><span><strong>新建空白简历</strong><small>从基础模块开始填写</small></span></button>
              <button onClick={saveHistorySnapshot}><Icon name="check" size={17} /><span><strong>保存历史版本</strong><small>记录当前内容与风格</small></span></button>
              <button onClick={showHistory}><Icon name="layers" size={17} /><span><strong>历史简历 <i className="history-count">{history.length}</i></strong><small>查看、恢复或删除旧版本</small></span></button>
              <button onClick={exportBackup}><Icon name="download" size={17} /><span><strong>导出 JSON 备份</strong><small>保存全部内容与样式</small></span></button>
              <button onClick={() => { closeDataMenu(); backupInput.current?.click() }}><Icon name="upload" size={17} /><span><strong>恢复 JSON 备份</strong><small>换设备也能继续编辑</small></span></button>
              <button onClick={resetResume}><Icon name="redo" size={17} /><span><strong>恢复示例内容</strong><small>重新体验完整功能</small></span></button>
              <button onClick={installApp}><Icon name="website" size={17} /><span><strong>{isStandalone ? '应用已安装' : '安装到当前设备'}</strong><small>支持桌面图标与离线启动</small></span></button>
            </div>
          </details>
          <input ref={backupInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importBackup} />
          <button className="export-button" onClick={exportPdf}><Icon name="download" size={17} /><span>导出 PDF</span></button>
        </div>
      </header>

      <div className="workspace-meta">
        <div><span className="meta-index">01</span><p><strong>模块化搭建</strong><small>拖入、排序、填写，所见即所得</small></p></div>
        <div className="privacy-note"><span>仅保存在你的浏览器</span><i /><span>{visibleCount} 个可见模块</span></div>
      </div>

      <div className={`workspace-grid mobile-${mobileView}`}>
        <ModuleLibrary
          modules={resume.modules}
          active={active}
          onSelect={(selection) => { setActive(selection); setMobileView('edit') }}
          onAdd={addModule}
          onToggle={(id) => updateModule(id, { visible: !resume.modules.find((module) => module.id === id)?.visible })}
          onRemove={removeModule}
          onMoveStep={moveModuleStep}
        />
        <ResumePreview resume={resume} active={active} onSelect={(selection) => { setActive(selection); if (window.innerWidth < 900) setMobileView('edit') }} onAddAt={addModule} onMove={moveModule} />
        <EditorPanel resume={resume} active={active} onProfileChange={updateProfile} onModuleChange={updateModule} onThemeChange={(patch) => setResume((current) => ({ ...current, theme: { ...current.theme, ...patch } }))} />
      </div>

      {historyOpen && (
        <div className="history-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setHistoryOpen(false) }}>
          <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
            <header className="history-header">
              <div><span className="eyebrow">LOCAL ARCHIVE</span><h2 id="history-title">历史简历</h2><p>保存不同岗位版本，恢复时会自动备份当前简历。</p></div>
              <button className="history-close" onClick={() => setHistoryOpen(false)} aria-label="关闭历史简历"><Icon name="x" size={18} /></button>
            </header>
            <div className="history-toolbar">
              <span><strong>{history.length}</strong> / {MAX_HISTORY} 个版本</span>
              <button onClick={() => archiveResume(resume, undefined, true)}><Icon name="plus" size={16} />保存当前版本</button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty"><span><Icon name="layers" size={26} /></span><h3>还没有历史简历</h3><p>保存当前版本后，你可以放心修改成不同岗位的简历。</p><button onClick={() => archiveResume(resume, undefined, true)}>保存第一个版本</button></div>
              ) : history.map((entry, index) => {
                const template = TEMPLATES.find((item) => item.id === entry.resume.theme.template)
                return (
                  <article className="history-card" key={entry.id}>
                    <div className="history-card-index">{String(index + 1).padStart(2, '0')}</div>
                    <i className={`template-thumb thumb-${entry.resume.theme.template}`} />
                    <div className="history-card-copy">
                      <h3>{entry.label}</h3>
                      <p><span>{template?.name || '默认风格'}</span><i />{entry.resume.modules.filter((module) => module.visible).length} 个模块<i />{formatHistoryTime(entry.savedAt)}</p>
                    </div>
                    <div className="history-card-actions">
                      <button className="history-restore" onClick={() => restoreHistory(entry)}>恢复</button>
                      <button className="history-delete" onClick={() => deleteHistory(entry)} aria-label={`删除 ${entry.label}`}><Icon name="trash" size={16} /></button>
                    </div>
                  </article>
                )
              })}
            </div>
            <footer className="history-footer"><Icon name="check" size={14} />历史记录只保存在当前浏览器，并会包含在 JSON 备份中。</footer>
          </section>
        </div>
      )}

      <nav className="mobile-nav" aria-label="移动端工作区导航">
        <button className={mobileView === 'modules' ? 'is-active' : ''} onClick={() => setMobileView('modules')}><Icon name="layers" size={18} /><span>模块</span></button>
        <button className={mobileView === 'preview' ? 'is-active' : ''} onClick={() => setMobileView('preview')}><Icon name="eye" size={18} /><span>预览</span></button>
        <button className={mobileView === 'edit' ? 'is-active' : ''} onClick={() => setMobileView('edit')}><Icon name="user" size={18} /><span>编辑</span></button>
      </nav>

      {toast && <div className="toast"><Icon name="check" size={16} /><span>{toast}</span></div>}
    </div>
  )
}
