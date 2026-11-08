import type { SVGProps } from 'react'

type IconName =
  | 'award' | 'badge' | 'bolt' | 'briefcase' | 'check' | 'chevronDown' | 'database' | 'download'
  | 'education' | 'eye' | 'eyeOff' | 'grip' | 'language' | 'layers' | 'mail'
  | 'mapPin' | 'palette' | 'phone' | 'plus' | 'plusSquare' | 'redo' | 'spark'
  | 'trash' | 'upload' | 'user' | 'website' | 'x'

const paths: Record<IconName, React.ReactNode> = {
  award: <><circle cx="12" cy="8" r="5"/><path d="M8.5 12 7 22l5-3 5 3-1.5-10"/></>,
  badge: <><path d="M12 3 15 5l3.6.2.2 3.6L21 12l-2.2 3.2-.2 3.6-3.6.2-3 2-3-2-3.6-.2-.2-3.6L3 12l2.2-3.2.2-3.6L9 5l3-2Z"/><path d="m9 12 2 2 4-4"/></>,
  bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevronDown: <path d="m6 9 6 6 6-6"/>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
  education: <><path d="m2 10 10-5 10 5-10 5L2 10Z"/><path d="M6 12.5V17c3 2 9 2 12 0v-4.5M22 10v6"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="m3 3 18 18M10.5 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3.8-.7"/><path d="M9.8 9.8a3 3 0 0 0 4.4 4.4"/></>,
  grip: <><circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/></>,
  language: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  mapPin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  palette: <><circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M16 16c-1.5 0-2-1-2-2s1-2 2-2h1c2 0 4 1 4 3 0 4-5 6-9 6"/></>,
  phone: <path d="M6.5 3h3L11 7 9 8.5a15 15 0 0 0 6.5 6.5L17 13l4 1.5v3c0 2-1.5 3.5-3.5 3.5C9.5 21 3 14.5 3 6.5 3 4.5 4.5 3 6.5 3Z"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  plusSquare: <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></>,
  redo: <><path d="M20 7v5h-5"/><path d="M20 12a8 8 0 1 0-2.3 5.7"/></>,
  spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
  trash: <><path d="M4 7h16M9 3h6l1 4H8l1-4ZM7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  upload: <><path d="M12 16V4m0 0 5 5m-5-5L7 9"/><path d="M5 21h14"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  website: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  x: <path d="m6 6 12 12M18 6 6 18"/>,
}

export function Icon({ name, size = 18, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  )
}
