import type { ModuleType, ResumeData, ResumeItem, ResumeModule } from './types'

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const MODULE_META: Record<ModuleType, { label: string; description: string; icon: string }> = {
  summary: { label: '个人简介', description: '用几句话概括你的优势', icon: 'spark' },
  experience: { label: '工作经历', description: '公司、职位与关键成果', icon: 'briefcase' },
  education: { label: '教育经历', description: '学校、专业与学习经历', icon: 'education' },
  projects: { label: '项目经历', description: '展示有说服力的项目', icon: 'layers' },
  skills: { label: '专业技能', description: '工具、技术与能力标签', icon: 'bolt' },
  languages: { label: '语言能力', description: '语言及熟练程度', icon: 'language' },
  certifications: { label: '证书资质', description: '行业证书与专业认证', icon: 'badge' },
  awards: { label: '荣誉奖项', description: '奖项、比赛与认可', icon: 'award' },
  custom: { label: '自定义模块', description: '创建专属于你的内容', icon: 'plusSquare' },
}

const item = (values: Omit<ResumeItem, 'id'>): ResumeItem => ({ id: uid(), ...values })

export function createModule(type: ModuleType): ResumeModule {
  const base = { id: uid(), type, title: MODULE_META[type].label, visible: true }
  switch (type) {
    case 'summary':
      return { ...base, content: '6 年数字产品设计经验，擅长把复杂业务转化为清晰、易用的产品体验。具备从用户研究、策略定义到设计落地的完整能力，持续用设计推动业务增长。', items: [] }
    case 'experience':
      return {
        ...base,
        items: [item({ role: '高级产品设计师', organization: '远山科技', location: '上海', start: '2022.06', end: '至今', description: ['负责企业协作产品从 0 到 1 的体验设计，推动核心任务完成率提升 32%', '建立跨端设计系统与协作规范，使设计交付效率提升 40%'] })],
      }
    case 'education':
      return {
        ...base,
        items: [item({ role: '数字媒体艺术 · 本科', organization: '江南大学', location: '无锡', start: '2014.09', end: '2018.06', description: ['主修交互设计、信息可视化与品牌设计'] })],
      }
    case 'projects':
      return {
        ...base,
        items: [item({ role: '企业数据驾驶舱', organization: '核心项目 · 体验负责人', link: '', start: '2023.03', end: '2023.11', description: ['梳理 12 类业务角色的决策路径，重构信息架构与指标体系', '上线后周活跃用户增长 58%，客户培训成本下降 25%'] })],
      }
    case 'skills':
      return {
        ...base,
        items: [
          item({ name: '设计能力', value: '用户研究 / 交互设计 / 视觉设计 / 设计系统' }),
          item({ name: '工具', value: 'Figma / Sketch / Principle / After Effects' }),
        ],
      }
    case 'languages':
      return { ...base, items: [item({ name: '英语', value: '专业工作能力 · CET-6' })] }
    case 'certifications':
      return { ...base, items: [item({ name: 'Google UX Design', organization: 'Google', date: '2023', description: [] })] }
    case 'awards':
      return { ...base, items: [item({ name: '年度体验创新奖', organization: '远山科技', date: '2024', description: ['企业数据产品设计项目'] })] }
    case 'custom':
      return { ...base, title: '社区与分享', items: [item({ role: '设计分享者', organization: 'Design Weekend', start: '2023', end: '至今', description: ['持续分享设计系统与复杂产品设计实践'] })] }
  }
}

export const defaultResume: ResumeData = {
  profile: {
    name: '林知夏',
    title: 'PRODUCT DESIGNER',
    email: 'hello@linzhixia.design',
    phone: '138 0000 0000',
    location: '上海 · 中国',
    website: 'linzhixia.design',
    avatar: '',
    tagline: '用设计把复杂，变得简单。',
  },
  modules: [createModule('summary'), createModule('experience'), createModule('projects'), createModule('education'), createModule('skills')],
  theme: {
    template: 'modern',
    accent: '#18665b',
    font: 'sans',
    density: 'comfortable',
  },
  updatedAt: Date.now(),
}

export const cloneDefaultResume = (): ResumeData => JSON.parse(JSON.stringify(defaultResume)) as ResumeData

export const createBlankResume = (): ResumeData => ({
  profile: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    avatar: '',
    tagline: '',
  },
  modules: [
    { ...createModule('summary'), content: '', items: [] },
    { ...createModule('experience'), items: [] },
    { ...createModule('education'), items: [] },
    { ...createModule('skills'), items: [] },
  ],
  theme: {
    template: 'modern',
    accent: '#18665b',
    font: 'sans',
    density: 'comfortable',
  },
  updatedAt: Date.now(),
})
