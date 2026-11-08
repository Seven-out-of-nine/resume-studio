import { MODULE_META } from '../data'
import type { ActiveSelection, ModuleType, ResumeModule } from '../types'
import { Icon } from './Icon'

interface Props {
  modules: ResumeModule[]
  active: ActiveSelection
  onSelect: (selection: ActiveSelection) => void
  onAdd: (type: ModuleType) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onMoveStep: (id: string, direction: -1 | 1) => void
}

const types = Object.keys(MODULE_META) as ModuleType[]

export function ModuleLibrary({ modules, active, onSelect, onAdd, onToggle, onRemove, onMoveStep }: Props) {
  const added = new Set(modules.map((module) => module.type))

  return (
    <aside className="module-library panel-shell">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">BUILD</span>
          <h2>搭建你的简历</h2>
        </div>
        <span className="step-badge">01</span>
      </div>

      <button className={`profile-entry ${active === 'profile' ? 'is-active' : ''}`} onClick={() => onSelect('profile')}>
        <span className="module-icon"><Icon name="user" /></span>
        <span><strong>基本信息</strong><small>姓名、职位与联系方式</small></span>
        <span className="entry-arrow">→</span>
      </button>

      <div className="section-label"><span>模块库</span><small>拖入中间简历</small></div>
      <div className="module-grid">
        {types.map((type) => {
          const meta = MODULE_META[type]
          const isAdded = added.has(type) && type !== 'custom'
          return (
            <button
              key={type}
              className={`library-card ${isAdded ? 'is-added' : ''}`}
              draggable={!isAdded}
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-resume-module', type)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => !isAdded && onAdd(type)}
              disabled={isAdded}
            >
              <span className="library-icon"><Icon name={meta.icon as Parameters<typeof Icon>[0]['name']} /></span>
              <span className="library-copy"><strong>{meta.label}</strong><small>{isAdded ? '已添加到简历' : meta.description}</small></span>
              <span className="add-mark">{isAdded ? <Icon name="check" size={14} /> : <Icon name="plus" size={15} />}</span>
            </button>
          )
        })}
      </div>

      <div className="section-label structure-label"><span>当前结构</span><small>{modules.length} 个模块</small></div>
      <div className="structure-list">
        {modules.map((module, index) => (
          <div
            key={module.id}
            className={`structure-row ${active === module.id ? 'is-active' : ''} ${!module.visible ? 'is-muted' : ''}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/x-resume-existing', module.id)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onSelect(module.id)}
          >
            <span className="drag-handle" title="拖动排序"><Icon name="grip" size={17} /></span>
            <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
            <strong>{module.title}</strong>
            <button className="icon-button order-button up" disabled={index === 0} title="上移模块" onClick={(event) => { event.stopPropagation(); onMoveStep(module.id, -1) }}>
              <Icon name="chevronDown" size={14} />
            </button>
            <button className="icon-button order-button" disabled={index === modules.length - 1} title="下移模块" onClick={(event) => { event.stopPropagation(); onMoveStep(module.id, 1) }}>
              <Icon name="chevronDown" size={14} />
            </button>
            <button className="icon-button" title={module.visible ? '隐藏模块' : '显示模块'} onClick={(event) => { event.stopPropagation(); onToggle(module.id) }}>
              <Icon name={module.visible ? 'eye' : 'eyeOff'} size={16} />
            </button>
            <button className="icon-button danger" title="删除模块" onClick={(event) => { event.stopPropagation(); onRemove(module.id) }}>
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="library-tip"><Icon name="spark" size={16} /><span>建议把最匹配目标岗位的经历放在前面。</span></div>
    </aside>
  )
}
