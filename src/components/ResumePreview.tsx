import { useLayoutEffect, useRef, useState } from 'react'
import type { ActiveSelection, ModuleType, ResumeData, ResumeItem, ResumeModule } from '../types'
import { Icon } from './Icon'

interface Props {
  resume: ResumeData
  active: ActiveSelection
  onSelect: (selection: ActiveSelection) => void
  onAddAt: (type: ModuleType, index: number) => void
  onMove: (id: string, index: number) => void
}

const text = (item: ResumeItem, key: string) => {
  const value = item[key]
  return Array.isArray(value) ? value.join(' · ') : (value ?? '')
}

const lines = (item: ResumeItem, key = 'description') => {
  const value = item[key]
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []
}

function ModuleContent({ module }: { module: ResumeModule }) {
  if (module.type === 'summary') return <p className="summary-copy">{module.content}</p>

  if (module.type === 'skills') {
    return <div className="skills-list">{module.items.map((item) => <div className="skill-row" key={item.id}><strong>{text(item, 'name')}</strong><span>{text(item, 'value')}</span></div>)}</div>
  }

  if (module.type === 'languages') {
    return <div className="language-list">{module.items.map((item) => <div key={item.id}><strong>{text(item, 'name')}</strong><span>{text(item, 'value')}</span></div>)}</div>
  }

  if (module.type === 'certifications' || module.type === 'awards') {
    return (
      <div className="credential-list">
        {module.items.map((item) => (
          <article className="credential-item" key={item.id}>
            <div><strong>{text(item, 'name')}</strong><span>{text(item, 'organization')}</span></div>
            <time>{text(item, 'date')}</time>
            {lines(item).map((line, index) => <p key={index}>{line}</p>)}
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="timeline-list">
      {module.items.map((item) => (
        <article className="timeline-item" key={item.id}>
          <div className="timeline-main">
            <div className="timeline-title-row">
              <div><h4>{text(item, 'role')}</h4><strong>{text(item, 'organization')}</strong></div>
              <div className="timeline-meta"><time>{[text(item, 'start'), text(item, 'end')].filter(Boolean).join(' — ')}</time><span>{module.type === 'projects' ? text(item, 'link') : text(item, 'location')}</span></div>
            </div>
            {lines(item).length > 0 && <ul>{lines(item).map((line, index) => <li key={index}>{line}</li>)}</ul>}
          </div>
        </article>
      ))}
    </div>
  )
}

function DropZone({ index, active, onDrop, onEnter }: { index: number; active: boolean; onDrop: (event: React.DragEvent, index: number) => void; onEnter: (index: number) => void }) {
  return (
    <div
      className={`paper-drop-zone ${active ? 'is-active' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); onEnter(index) }}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-resume-module') ? 'copy' : 'move' }}
      onDrop={(event) => onDrop(event, index)}
    >
      <span><Icon name="plus" size={13} />放在这里</span>
    </div>
  )
}

export function ResumePreview({ resume, active, onSelect, onAddAt, onMove }: Props) {
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [contentScale, setContentScale] = useState(1)
  const [contentOverflow, setContentOverflow] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const visibleModules = resume.modules.filter((module) => module.visible)

  useLayoutEffect(() => {
    const paper = paperRef.current
    const layout = layoutRef.current
    if (!paper || !layout) return

    const accent = paper.querySelector<HTMLElement>('.paper-accent')
    const pxPerMillimeter = paper.clientWidth / 210
    const footerReserve = pxPerMillimeter * 14
    const availableHeight = paper.clientHeight - (accent?.offsetHeight ?? 0) - footerReserve
    const minimumScale = 0.5

    const applyScale = (scale: number) => {
      paper.style.setProperty('--content-fit', scale.toFixed(4))
      paper.style.setProperty('--content-width', `${(100 / scale).toFixed(3)}%`)
    }

    applyScale(1)
    if (layout.scrollHeight <= availableHeight) {
      setContentScale(1)
      setContentOverflow(false)
      return
    }

    applyScale(minimumScale)
    const overflowsAtMinimum = layout.scrollHeight * minimumScale > availableHeight
    let low = minimumScale
    let high = 1

    if (!overflowsAtMinimum) {
      for (let iteration = 0; iteration < 11; iteration += 1) {
        const candidate = (low + high) / 2
        applyScale(candidate)
        if (layout.scrollHeight * candidate <= availableHeight) low = candidate
        else high = candidate
      }
    }

    const fittedScale = overflowsAtMinimum ? minimumScale : Math.max(minimumScale, low - 0.004)
    applyScale(fittedScale)
    setContentScale(fittedScale)
    setContentOverflow(overflowsAtMinimum)
  }, [resume])

  const handleDrop = (event: React.DragEvent, index: number) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/x-resume-module') as ModuleType
    const id = event.dataTransfer.getData('application/x-resume-existing')
    if (type) onAddAt(type, index)
    else if (id) onMove(id, index)
    setDropIndex(null)
  }

  const style = {
    '--accent': resume.theme.accent,
    '--content-fit': contentScale.toFixed(4),
    '--content-width': `${(100 / contentScale).toFixed(3)}%`,
  } as React.CSSProperties
  const contact = [
    { icon: 'mail' as const, value: resume.profile.email },
    { icon: 'phone' as const, value: resume.profile.phone },
    { icon: 'mapPin' as const, value: resume.profile.location },
    { icon: 'website' as const, value: resume.profile.website },
  ].filter((entry) => entry.value)

  return (
    <main className="preview-column">
      <div className="preview-toolbar">
        <div><span className="live-dot" />实时预览</div>
        <div className="preview-scale" title="内容会自动缩放以保持在单页 A4 内">
          <span>A4 固定</span><span>·</span>
          <span className={contentOverflow ? 'fit-warning' : ''}>{contentOverflow ? '内容过多' : `布局 ${Math.round(contentScale * 100)}%`}</span>
          <span>·</span><span className="preview-zoom-label">100%</span>
        </div>
      </div>
      <div className="canvas-scroll" onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropIndex(null) }}>
        <div className="canvas-stage">
          <div ref={paperRef} className={`resume-paper template-${resume.theme.template} font-${resume.theme.font} density-${resume.theme.density}`} style={style}>
            <div className="paper-accent" />
            <div ref={layoutRef} className="resume-layout">
              <header className={`resume-header ${active === 'profile' ? 'is-selected' : ''}`} onClick={() => onSelect('profile')}>
              <div className="header-identity">
                <div className="name-kicker">CURRICULUM VITAE <span>·</span> 2026</div>
                <h1>{resume.profile.name || '你的姓名'}</h1>
                <h2>{resume.profile.title || '求职方向'}</h2>
                {resume.profile.tagline && <p>{resume.profile.tagline}</p>}
              </div>
              <div className="header-side">
                {resume.profile.avatar && <div className="resume-avatar"><img src={resume.profile.avatar} alt="个人头像" /></div>}
                <div className="contact-list">
                  {contact.map((entry) => <div key={entry.icon}><Icon name={entry.icon} size={12} /><span>{entry.value}</span></div>)}
                </div>
              </div>
              <span className="selected-label">编辑基本信息</span>
              </header>

              <div className="resume-body" onDragOver={(event) => event.preventDefault()}>
              {visibleModules.map((module, index) => (
                <div className="module-drop-group" key={module.id}>
                  <DropZone index={index} active={dropIndex === index} onDrop={handleDrop} onEnter={setDropIndex} />
                  <section
                    className={`resume-section section-${module.type} ${active === module.id ? 'is-selected' : ''}`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/x-resume-existing', module.id)
                      event.dataTransfer.effectAllowed = 'move'
                    }}
                    onClick={() => onSelect(module.id)}
                  >
                    <div className="resume-section-heading"><span>{String(index + 1).padStart(2, '0')}</span><h3>{module.title}</h3><i /></div>
                    <ModuleContent module={module} />
                    <span className="selected-label">点击编辑 · 拖动排序</span>
                  </section>
                </div>
              ))}
              <DropZone index={visibleModules.length} active={dropIndex === visibleModules.length} onDrop={handleDrop} onEnter={setDropIndex} />
              {visibleModules.length === 0 && <div className="empty-paper"><Icon name="plusSquare" size={26} /><strong>拖入第一个模块</strong><span>从左侧模块库开始搭建你的简历</span></div>}
              </div>
            </div>

            <footer className="resume-footer"><span>{resume.profile.name || '个人简历'}</span><span>RESUME · {new Date().getFullYear()}</span></footer>
          </div>
        </div>
      </div>
    </main>
  )
}
