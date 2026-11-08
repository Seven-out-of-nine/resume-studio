import { uid } from '../data'
import { TEMPLATES } from '../templates'
import type { ActiveSelection, ResumeData, ResumeItem, ResumeModule, ThemeSettings } from '../types'
import { Icon } from './Icon'

interface Props {
  resume: ResumeData
  active: ActiveSelection
  onProfileChange: (key: keyof ResumeData['profile'], value: string) => void
  onModuleChange: (id: string, patch: Partial<ResumeModule>) => void
  onThemeChange: (patch: Partial<ThemeSettings>) => void
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Area({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} placeholder={placeholder} rows={4} onChange={(event) => onChange(event.target.value)} />
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}

const valueOf = (item: ResumeItem, key: string) => {
  const value = item[key]
  return Array.isArray(value) ? value.join('\n') : (value ?? '')
}

const defaultItem = (type: ResumeModule['type']): ResumeItem => {
  if (type === 'skills' || type === 'languages') return { id: uid(), name: '', value: '' }
  if (type === 'certifications' || type === 'awards') return { id: uid(), name: '', organization: '', date: '', description: [] }
  return { id: uid(), role: '', organization: '', location: '', link: '', start: '', end: '', description: [] }
}

function ItemEditor({ module, item, index, onUpdate, onRemove }: {
  module: ResumeModule
  item: ResumeItem
  index: number
  onUpdate: (key: string, value: string | string[]) => void
  onRemove: () => void
}) {
  const simple = module.type === 'skills' || module.type === 'languages'
  const credential = module.type === 'certifications' || module.type === 'awards'

  return (
    <div className="item-editor">
      <div className="item-editor-head">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <strong>{simple ? (module.type === 'skills' ? '技能分组' : '语言') : credential ? '条目' : '经历'}</strong>
        <button className="icon-button danger" onClick={onRemove} title="删除此条"><Icon name="trash" size={15} /></button>
      </div>
      {simple ? (
        <div className="field-stack compact-fields">
          <Field label={module.type === 'skills' ? '分组名称' : '语言'} value={valueOf(item, 'name')} onChange={(value) => onUpdate('name', value)} placeholder={module.type === 'skills' ? '例如：产品能力' : '例如：英语'} />
          <Field label={module.type === 'skills' ? '技能内容' : '熟练程度'} value={valueOf(item, 'value')} onChange={(value) => onUpdate('value', value)} placeholder={module.type === 'skills' ? '用 / 分隔多个技能' : '例如：专业工作能力'} />
        </div>
      ) : credential ? (
        <div className="field-stack compact-fields">
          <Field label={module.type === 'awards' ? '奖项名称' : '证书名称'} value={valueOf(item, 'name')} onChange={(value) => onUpdate('name', value)} />
          <div className="field-row">
            <Field label="颁发方" value={valueOf(item, 'organization')} onChange={(value) => onUpdate('organization', value)} />
            <Field label="时间" value={valueOf(item, 'date')} onChange={(value) => onUpdate('date', value)} />
          </div>
          <Area label="补充说明" value={valueOf(item, 'description')} onChange={(value) => onUpdate('description', value.split('\n'))} placeholder="每行一条说明" />
        </div>
      ) : (
        <div className="field-stack compact-fields">
          <Field label={module.type === 'projects' ? '项目名称' : module.type === 'education' ? '专业与学历' : '职位 / 角色'} value={valueOf(item, 'role')} onChange={(value) => onUpdate('role', value)} />
          <Field label={module.type === 'projects' ? '项目角色' : module.type === 'education' ? '学校' : '公司 / 组织'} value={valueOf(item, 'organization')} onChange={(value) => onUpdate('organization', value)} />
          <div className="field-row">
            <Field label="开始时间" value={valueOf(item, 'start')} onChange={(value) => onUpdate('start', value)} placeholder="2023.01" />
            <Field label="结束时间" value={valueOf(item, 'end')} onChange={(value) => onUpdate('end', value)} placeholder="至今" />
          </div>
          <Field
            label={module.type === 'projects' ? '项目链接（选填）' : '地点（选填）'}
            value={valueOf(item, module.type === 'projects' ? 'link' : 'location')}
            onChange={(value) => onUpdate(module.type === 'projects' ? 'link' : 'location', value)}
          />
          <Area label="成果与说明" value={valueOf(item, 'description')} onChange={(value) => onUpdate('description', value.split('\n'))} placeholder="每行一条，用数据描述你的成果" hint="每一行会自动显示为一个要点" />
        </div>
      )}
    </div>
  )
}

function AppearanceEditor({ theme, onChange }: { theme: ThemeSettings; onChange: (patch: Partial<ThemeSettings>) => void }) {
  const colors = ['#18665b', '#3156a3', '#a4432f', '#6d4ca3', '#20252b']
  return (
    <section className="appearance-editor">
      <div className="editor-section-title"><Icon name="palette" size={17} /><span>外观设置</span></div>
      <div className="appearance-row column">
        <span>简历模板</span>
        <div className="segmented small template-segmented">
          {TEMPLATES.map((template) => (
            <button key={template.id} title={template.subtitle} className={theme.template === template.id ? 'is-active' : ''} onClick={() => onChange({ template: template.id })}>{template.name}</button>
          ))}
        </div>
      </div>
      <div className="appearance-row">
        <span>主题色</span>
        <div className="swatches">
          {colors.map((color) => <button key={color} className={`swatch ${theme.accent === color ? 'is-active' : ''}`} style={{ background: color }} title={color} onClick={() => onChange({ accent: color })} />)}
          <label className="custom-color" title="自定义颜色"><input type="color" value={theme.accent} onChange={(event) => onChange({ accent: event.target.value })} /><Icon name="plus" size={14} /></label>
        </div>
      </div>
      <div className="appearance-row column">
        <span>字体气质</span>
        <div className="segmented small">
          <button className={theme.font === 'sans' ? 'is-active' : ''} onClick={() => onChange({ font: 'sans' })}>现代</button>
          <button className={theme.font === 'humanist' ? 'is-active' : ''} onClick={() => onChange({ font: 'humanist' })}>人文</button>
          <button className={theme.font === 'serif' ? 'is-active' : ''} onClick={() => onChange({ font: 'serif' })}>衬线</button>
        </div>
      </div>
      <div className="appearance-row column">
        <span>内容密度</span>
        <div className="segmented small two">
          <button className={theme.density === 'comfortable' ? 'is-active' : ''} onClick={() => onChange({ density: 'comfortable' })}>舒展</button>
          <button className={theme.density === 'compact' ? 'is-active' : ''} onClick={() => onChange({ density: 'compact' })}>紧凑</button>
        </div>
      </div>
    </section>
  )
}

export function EditorPanel({ resume, active, onProfileChange, onModuleChange, onThemeChange }: Props) {
  const module = resume.modules.find((entry) => entry.id === active)

  const updateItem = (itemId: string, key: string, value: string | string[]) => {
    if (!module) return
    onModuleChange(module.id, { items: module.items.map((item) => item.id === itemId ? { ...item, [key]: value } : item) })
  }

  const uploadAvatar = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onProfileChange('avatar', String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <aside className="editor-panel panel-shell">
      <div className="panel-heading">
        <div><span className="eyebrow">EDIT</span><h2>{active === 'profile' ? '基本信息' : module?.title ?? '内容编辑'}</h2></div>
        <span className="step-badge">02</span>
      </div>

      <div className="editor-scroll">
        {active === 'profile' ? (
          <section className="editor-content">
            <div className="avatar-editor">
              <div className="avatar-preview">
                {resume.profile.avatar ? <img src={resume.profile.avatar} alt="头像预览" /> : <span>{resume.profile.name.slice(0, 1) || '你'}</span>}
              </div>
              <div><strong>个人照片</strong><small>推荐使用清晰、简洁的职业照</small><div className="avatar-actions"><label className="mini-button">上传照片<input type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} /></label>{resume.profile.avatar && <button className="text-button" onClick={() => onProfileChange('avatar', '')}>移除</button>}</div></div>
            </div>
            <div className="field-stack">
              <Field label="姓名" value={resume.profile.name} onChange={(value) => onProfileChange('name', value)} placeholder="你的姓名" />
              <Field label="求职方向 / 职位" value={resume.profile.title} onChange={(value) => onProfileChange('title', value)} placeholder="例如：产品设计师" />
              <Field label="一句话主张" value={resume.profile.tagline} onChange={(value) => onProfileChange('tagline', value)} placeholder="一句话介绍你自己" />
              <div className="field-row"><Field label="邮箱" type="email" value={resume.profile.email} onChange={(value) => onProfileChange('email', value)} /><Field label="电话" value={resume.profile.phone} onChange={(value) => onProfileChange('phone', value)} /></div>
              <div className="field-row"><Field label="所在城市" value={resume.profile.location} onChange={(value) => onProfileChange('location', value)} /><Field label="个人网站" value={resume.profile.website} onChange={(value) => onProfileChange('website', value)} /></div>
            </div>
          </section>
        ) : module ? (
          <section className="editor-content">
            <Field label="模块标题" value={module.title} onChange={(value) => onModuleChange(module.id, { title: value })} />
            {module.type === 'summary' ? (
              <Area label="简介内容" value={module.content ?? ''} onChange={(value) => onModuleChange(module.id, { content: value })} placeholder="概括经验、擅长方向与职业目标" hint="推荐控制在 80–150 字" />
            ) : (
              <div className="items-stack">
                {module.items.map((entry, index) => (
                  <ItemEditor
                    key={entry.id}
                    module={module}
                    item={entry}
                    index={index}
                    onUpdate={(key, value) => updateItem(entry.id, key, value)}
                    onRemove={() => onModuleChange(module.id, { items: module.items.filter((item) => item.id !== entry.id) })}
                  />
                ))}
                <button className="add-item-button" onClick={() => onModuleChange(module.id, { items: [...module.items, defaultItem(module.type)] })}><Icon name="plus" size={16} />添加一条{module.type === 'skills' ? '技能分组' : '内容'}</button>
              </div>
            )}
          </section>
        ) : (
          <div className="empty-editor"><Icon name="spark" size={28} /><strong>选择一块内容开始编辑</strong><span>点击左侧结构或简历中的模块</span></div>
        )}

        <AppearanceEditor theme={resume.theme} onChange={onThemeChange} />
      </div>
    </aside>
  )
}
