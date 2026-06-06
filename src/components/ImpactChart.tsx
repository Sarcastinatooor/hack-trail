"use client"

import ReactECharts from "echarts-for-react"

export interface Point {
  ts: number
  value: number
}

function fmtAxis(v: number, unit = "$") {
  if (!isFinite(v)) return ""
  const a = Math.abs(v)
  if (a >= 1e9) return `${unit}${(v / 1e9).toFixed(1)}B`
  if (a >= 1e6) return `${unit}${(v / 1e6).toFixed(1)}M`
  if (a >= 1e3) return `${unit}${(v / 1e3).toFixed(1)}k`
  return `${unit}${v.toFixed(2)}`
}

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

export function ImpactChart({
  title,
  data,
  color = "#00d4ff",
  unit = "$",
  incidentTs,
  contagionEndTs,
  highlightIncident = true,
  fitY = true,
  subtitle,
}: Props) {
  if (!data.length) {
    return (
      <div className="neon-card-static p-6 text-center">
        <div className="text-neutral-400 text-sm">{title}</div>
        <div className="text-neutral-600 text-xs mt-1 mono">No data available</div>
      </div>
    )
  }

  const values = data.map((d) => d.value).filter((v) => isFinite(v))
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const span = max - min || 1
  const yMin = fitY ? Math.max(0, min - span * 0.15) : 0
  const yMax = max + span * 0.1

  const peak = data.reduce((a, b) => (a.value > b.value ? a : b))
  const trough = data.reduce((a, b) => (a.value < b.value ? a : b))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markLineData: any[] = []
  if (highlightIncident && incidentTs) {
    markLineData.push({
      xAxis: incidentTs * 1000,
      lineStyle: { color: "#ff2255", type: "dashed", width: 1.5, opacity: 0.6 },
      label: { show: true, formatter: "INCIDENT", color: "#ff2255", fontSize: 9, fontFamily: "JetBrains Mono" },
    })
  }

  const markArea = highlightIncident && incidentTs && contagionEndTs
    ? {
        silent: true,
        data: [
          [
            { xAxis: incidentTs * 1000, itemStyle: { color: "rgba(255,34,85,0.04)" } },
            { xAxis: contagionEndTs * 1000 },
          ],
        ],
      }
    : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const option: any = {
    backgroundColor: "transparent",
    title: {
      text: title,
      subtext: subtitle,
      left: 0,
      textStyle: { color: "#f0f0f0", fontSize: 12, fontWeight: 600, fontFamily: "Inter" },
      subtextStyle: { color: "#52525b", fontSize: 10, fontFamily: "JetBrains Mono" },
    },
    grid: { left: 55, right: 25, top: subtitle ? 58 : 38, bottom: 28 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0a0a0f",
      borderColor: "rgba(0, 255, 136, 0.1)",
      textStyle: { color: "#e5e7eb", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
      extraCssText: "border-radius: 8px; box-shadow: 0 0 20px rgba(0,255,136,0.05);",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const p = params[0]
        if (!p) return ""
        const date = new Date(p.value[0]).toUTCString().slice(5, 16)
        return `<div style="min-width:180px;font-family:JetBrains Mono,monospace">
          <div style="opacity:.5;font-size:10px;margin-bottom:4px">${date}</div>
          <div style="display:flex;justify-content:space-between;gap:18px">
            <span style="color:${color};text-transform:uppercase;font-size:10px">${title}</span>
            <span style="font-weight:600">${fmtAxis(p.value[1], unit)}</span>
          </div>
        </div>`
      },
    },
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      axisLabel: { color: "#52525b", fontSize: 9, fontFamily: "JetBrains Mono" },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: yMin,
      max: yMax,
      axisLine: { show: false },
      axisLabel: {
        color: "#52525b",
        fontSize: 9,
        fontFamily: "JetBrains Mono",
        formatter: (v: number) => fmtAxis(v, unit),
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.03)" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { color, width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + "25" },
              { offset: 1, color: color + "03" },
            ],
          },
        },
        data: data.map((d) => [d.ts * 1000, d.value]),
        markPoint: {
          symbol: "circle",
          symbolSize: 5,
          label: {
            fontSize: 9,
            color: "#e5e7eb",
            fontFamily: "JetBrains Mono",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (p: any) => fmtAxis(p.value, unit),
          },
          data: [
            {
              coord: [peak.ts * 1000, peak.value],
              itemStyle: { color: "#00ff88" },
              label: { position: "top" },
            },
            {
              coord: [trough.ts * 1000, trough.value],
              itemStyle: { color: "#ff2255" },
              label: { position: "bottom" },
            },
          ],
        },
        markLine: markLineData.length
          ? { symbol: "none", data: markLineData }
          : undefined,
        markArea,
      },
    ],
  }

  return (
    <div className="neon-card-static p-4">
      <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: "canvas" }} />
    </div>
  )
}
