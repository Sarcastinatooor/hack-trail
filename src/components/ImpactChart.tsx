"use client"

import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'

export interface Point { ts: number; value: number }
interface Props {
  title: string
  data: Point[]
  color?: string
  unit?: string
  incidentTs?: number
  contagionEndTs?: number
  highlightIncident?: boolean
  fitY?: boolean
  subtitle?: string
}

function compact(value: number, unit: string, precision = 2) {
  const abs = Math.abs(value)
  if (abs >= 1e9) return `${unit}${(value / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${unit}${(value / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${unit}${(value / 1e3).toFixed(2)}K`
  return `${unit}${value.toFixed(precision)}`
}

export function ImpactChart({ title, data, color = '#00d4ff', unit = '$', incidentTs, contagionEndTs, highlightIncident = true, fitY = true, subtitle }: Props) {
  const [mode, setMode] = useState<'value' | 'percent'>('value')
  const [type, setType] = useState<'line' | 'bar'>('line')
  const points = useMemo(() => data.filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.value)).toSorted((a,b) => a.ts-b.ts), [data])
  const first = points[0]
  const latest = points.at(-1)
  const canNormalize = !!first && first.value !== 0
  const percent = mode === 'percent' && canNormalize
  const plot = points.map((p) => ({ ts: p.ts, value: percent ? (p.value / first.value - 1) * 100 : p.value }))
  const min = plot.length ? Math.min(...plot.map((p) => p.value)) : 0
  const max = plot.length ? Math.max(...plot.map((p) => p.value)) : 1
  const span = max-min || Math.abs(max)*0.1 || 1
  const precision = Math.min(8, Math.max(2, Math.ceil(-Math.log10(span / 4)) + 1))
  const format = (value: number) => percent ? `${value.toFixed(1)}%` : compact(value, unit, precision)
  const change = canNormalize && latest ? (latest.value / first.value - 1)*100 : null
  const marker = highlightIncident && incidentTs && first && latest && incidentTs >= first.ts && incidentTs <= latest.ts
  const csv = ['timestamp_utc,value', ...points.map((p) => `${new Date(p.ts*1000).toISOString()},${p.value}`)].join('\n')
  const option = {
    backgroundColor: 'transparent', useUTC: true, animationDuration: 350,
    grid: { left: 4, right: 12, top: 18, bottom: 12, containLabel: true },
    tooltip: {
      trigger: 'axis', confine: true, renderMode: 'richText',
      backgroundColor: '#101014', borderColor: '#ffffff25', padding: 10,
      textStyle: { color: '#e5e5e5', fontSize: 11, fontFamily: 'monospace' },
      axisPointer: { type: 'line', lineStyle: { color: '#ffffff40', type: 'dashed' } },
      formatter: (items: { value: [number, number] }[]) => {
        const point = items[0]?.value
        return point ? `${new Date(point[0]).toISOString().replace('T',' ').slice(0,16)} UTC\n${format(point[1])}` : ''
      },
    },
    xAxis: { type: 'time', splitNumber: 4, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { hideOverlap: true, color: '#85858f', fontSize: 10, margin: 14, fontFamily: 'monospace' } },
    yAxis: { type: 'value', splitNumber: 4, scale: true,
      min: fitY ? (percent || min < 0 ? min-span*0.1 : Math.max(0,min-span*0.1)) : 0,
      max: max+span*0.1,
      axisLine: { show: false }, axisTick: { show: false }, axisLabel: { hideOverlap: true, color: '#85858f', fontFamily: 'monospace', fontSize: 10, formatter: format },
      splitLine: { lineStyle: { color: '#ffffff09', width: 1 } },
    },
    series: [{ type, name: title, smooth: false, showSymbol: false, symbolSize: 4,
      lineStyle: { color, width: 1.5 }, itemStyle: { color }, barMaxWidth: 14,
      emphasis: { focus: 'series' }, data: plot.map((p) => [p.ts*1000,p.value]),
      markLine: marker ? { silent: true, symbol: 'none', label: { show: false }, lineStyle: { color: '#ff2255', width: 1, type: 'dashed', opacity: 0.65 }, data: [{ xAxis: incidentTs*1000 }] } : undefined,
      markArea: marker && contagionEndTs ? { silent: true, itemStyle: { color: '#ff225506' }, data: [[{ xAxis: incidentTs*1000 }, { xAxis: contagionEndTs*1000 }]] } : undefined,
    }],
  }
  return <section className="impact-panel" aria-label={`${title} chart`}>
    <header className="impact-panel-header">
      <div className="min-w-0"><h3>{title}</h3><p>{subtitle ?? 'Historical observations · UTC'}</p></div>
      <div className="impact-chart-actions">
        <div role="group" aria-label={`${title} chart type`}>{(['line','bar'] as const).map((value) => <button key={value} aria-pressed={type===value} onClick={() => setType(value)}>{value==='line' ? 'Line' : 'Bars'}</button>)}</div>
        <div role="group" aria-label={`${title} units`}>{(['value','percent'] as const).map((value) => <button key={value} title={value==='percent' && !canNormalize ? 'Percentage change needs a nonzero starting value' : undefined} disabled={value==='percent' && !canNormalize} aria-pressed={mode===value} onClick={() => setMode(value)}>{value==='value' ? (unit.trim() || 'Value') : '%'}</button>)}</div>
        <a aria-label={`Download ${title} CSV`} title="Download CSV" download={`${title.toLowerCase().replaceAll(' ','-')}.csv`} href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}>↓</a>
      </div>
    </header>
    {latest ? <>
      <div className="impact-readout"><strong style={{color}}>{compact(latest.value,unit,precision)}</strong>{change !== null && <span className={change < 0 ? 'text-[#ff2255]' : 'text-[#00ff88]'}>{change>0?'+':''}{change.toFixed(2)}% <small className="text-neutral-500">over displayed period</small></span>}</div>
      <ReactECharts notMerge option={option} style={{ height: 270, width: '100%' }} opts={{ renderer: 'svg' }} />
      <footer className="impact-chart-footer"><span>{new Date(first.ts*1000).toISOString().slice(0,10)} — {new Date(latest.ts*1000).toISOString().slice(0,10)}</span><span>{marker ? 'Incident ┆ · ' : ''}{points.length} samples{percent ? ' · change from first sample' : ''}</span></footer>
    </> : <div className="flex h-[322px] items-center justify-center text-xs text-neutral-500">Historical data unavailable from provider</div>}
  </section>
}
