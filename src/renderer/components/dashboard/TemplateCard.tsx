import {
  FileText,
  Briefcase,
  Users,
  ShieldCheck,
  GraduationCap,
  PersonStanding
} from 'lucide-react'
import type { CourseTemplate } from '@/types/course'

const iconMap: Record<string, typeof FileText> = {
  FileText,
  Briefcase,
  Users,
  ShieldCheck,
  GraduationCap,
  PersonStanding
}

interface TemplateCardProps {
  template: CourseTemplate
  onSelect: (template: CourseTemplate) => void
}

export function TemplateCard({ template, onSelect }: TemplateCardProps): JSX.Element {
  const Icon = iconMap[template.icon] || FileText

  return (
    <button
      onClick={() => onSelect(template)}
      className="
        flex flex-col items-center gap-2 p-4
        rounded-xl border border-[var(--border-default)]
        bg-[var(--bg-surface)]
        hover:bg-[var(--bg-hover)] hover:shadow-[var(--shadow-sm)]
        transition-all duration-[var(--duration-fast)]
        cursor-pointer text-center
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
      "
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center">
        <Icon size={20} className="text-[var(--text-brand)]" />
      </div>
      <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
        {template.name}
      </span>
      <span className="text-xs text-[var(--text-tertiary)] line-clamp-2">
        {template.description}
      </span>
    </button>
  )
}
