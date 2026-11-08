import type { TemplateId } from './types'

export interface TemplateMeta {
  id: TemplateId
  name: string
  subtitle: string
  category: '专业' | '创意' | '经典'
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'modern', name: '织绿', subtitle: '现代清晰', category: '专业' },
  { id: 'minimal', name: '留白', subtitle: '极简克制', category: '专业' },
  { id: 'editorial', name: '铅字', subtitle: '编辑风', category: '经典' },
  { id: 'midnight', name: '夜航', subtitle: '深色商务', category: '专业' },
  { id: 'sidebar', name: '侧影', subtitle: '彩色侧栏', category: '专业' },
  { id: 'warm', name: '燕麦', subtitle: '柔和居中', category: '经典' },
  { id: 'ocean', name: '潮汐', subtitle: '清爽蓝调', category: '创意' },
  { id: 'mono', name: '墨刻', subtitle: '黑白秩序', category: '专业' },
  { id: 'citrus', name: '柑橘', subtitle: '活力明快', category: '创意' },
  { id: 'lavender', name: '鸢尾', subtitle: '优雅紫调', category: '创意' },
  { id: 'swiss', name: '瑞格', subtitle: '瑞士网格', category: '专业' },
  { id: 'tech', name: '矩阵', subtitle: '科技理性', category: '专业' },
  { id: 'classic', name: '典藏', subtitle: '传统经典', category: '经典' },
  { id: 'sakura', name: '樱笺', subtitle: '轻盈柔美', category: '创意' },
  { id: 'forest', name: '林间', subtitle: '自然沉稳', category: '经典' },
  { id: 'neon', name: '霓虹', subtitle: '深色创意', category: '创意' },
  { id: 'newspaper', name: '晨报', subtitle: '报刊双栏', category: '经典' },
  { id: 'executive', name: '峰会', subtitle: '高管商务', category: '专业' },
]
