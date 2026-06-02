import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1)}k`
  }
  return formatCurrency(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getMonthName(month: number): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return months[month - 1] || ''
}

export function getFullMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return months[month - 1] || ''
}

export function calcVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function formatCompetencia(competencia: string): string {
  const [year, month] = competencia.split('-')
  return `${getFullMonthName(parseInt(month))} ${year}`
}

export function getColorForType(tipo: string): string {
  const colors: Record<string, string> = {
    receita: 'emerald',
    deducao: 'red',
    custo: 'orange',
    despesa_admin: 'blue',
    despesa_comercial: 'purple',
    despesa_financeira: 'pink',
    imposto: 'amber',
  }
  return colors[tipo] || 'slate'
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    financeiro: 'Financeiro',
    gestor: 'Gestor',
    visualizacao: 'Visualização',
  }
  return labels[role] || role
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(rows: string[][], filename: string) {
  const content = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const BOM = '﻿'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printPage() {
  window.print()
}

export function openPrintWindow(title: string, bodyHtml: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;padding:32px}
  h1{font-size:18px;font-weight:700;margin-bottom:4px}
  h2{font-size:14px;font-weight:600;margin:20px 0 8px}
  .meta{font-size:11px;color:#64748b;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#f1f5f9;text-align:left;padding:7px 10px;font-size:11px;font-weight:600;border-bottom:2px solid #e2e8f0}
  td{padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:12px}
  tr:last-child td{border-bottom:none}
  .right{text-align:right}
  .bold{font-weight:700}
  .positive{color:#059669}
  .negative{color:#dc2626}
  .blue{color:#2563eb}
  .total-row td{background:#eff6ff;font-weight:700;border-top:2px solid #bfdbfe}
  .group-row td{background:#f8fafc;font-weight:600}
  .result-row td{background:#ecfdf5;font-weight:700;color:#065f46}
  .result-row-red td{background:#fef2f2;font-weight:700;color:#991b1b}
  .separator td{border:none;padding:4px}
  .deduction{color:#dc2626}
  .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8}
  @media print{body{padding:16px}}
</style>
</head><body>
${bodyHtml}
<div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} — FinancePro</div>
</body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}
