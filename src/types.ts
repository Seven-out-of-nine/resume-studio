export type ModuleType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'awards'
  | 'custom'

export type TemplateId =
  | 'modern' | 'minimal' | 'editorial' | 'midnight' | 'sidebar' | 'warm'
  | 'ocean' | 'mono' | 'citrus' | 'lavender' | 'swiss' | 'tech'
  | 'classic' | 'sakura' | 'forest' | 'neon' | 'newspaper' | 'executive'
export type FontId = 'sans' | 'serif' | 'humanist'
export type DensityId = 'comfortable' | 'compact'

export interface Profile {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  avatar: string
  tagline: string
}

export interface ResumeItem {
  id: string
  [key: string]: string | string[]
}

export interface ResumeModule {
  id: string
  type: ModuleType
  title: string
  visible: boolean
  content?: string
  items: ResumeItem[]
}

export interface ThemeSettings {
  template: TemplateId
  accent: string
  font: FontId
  density: DensityId
}

export interface ResumeData {
  profile: Profile
  modules: ResumeModule[]
  theme: ThemeSettings
  updatedAt: number
}

export interface ResumeHistoryEntry {
  id: string
  label: string
  savedAt: number
  resume: ResumeData
}

export type ActiveSelection = 'profile' | string
