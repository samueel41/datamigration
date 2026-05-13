import { useEffect, useMemo, useState } from 'react'
import { calculateResults, formatCurrencyRange } from './utils/migrationEngine'
import migrationConfig from './config/migration-config.json'

const STORAGE_OPTIONS = [
  'MS SQL Server',
  'Synapse',
  'Azure SQL',
  'AWS',
  'Data Lake',
  'Other'
]

const ETL_OPTIONS = ['Wherescape', 'TimeXtender', 'SSIS', 'Data Factory', 'Other']
const TARGET_OPTIONS = ['Microsoft Fabric', 'Databricks', 'Snowflake', 'Other']
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const trackEvent = (name, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

const defaultFormData = {
  storagePlatforms: ['MS SQL Server'],
  etlTool: 'Wherescape',
  usesDataVault: false,
  environmentSize: 'M',
  targetPlatform: 'Microsoft Fabric',
  usePinjaFabricStandard: true,
  microsoftPartnershipSupport: false,
  databricksPartnershipSupport: false
}

function TechIcon({ label }) {
  switch (label) {
    case 'MS SQL Server':
      return (
        <svg className="arch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <ellipse cx="10" cy="5.5" rx="7" ry="2.5" fill="#90c8f8" />
          <path d="M3 5.5V14.5C3 15.88 6.13 17 10 17C13.87 17 17 15.88 17 14.5V5.5" fill="#3b82f6" opacity="0.55" />
          <ellipse cx="10" cy="14.5" rx="7" ry="2.5" fill="#60a5fa" />
          <text x="10" y="12.2" textAnchor="middle" fill="white" fontSize="4.2" fontWeight="bold" fontFamily="sans-serif">SQL</text>
        </svg>
      )
    case 'Synapse':
    case 'Azure SQL':
    case 'Data Lake':
    case 'Data Factory':
      return (
        <svg className="arch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2L2 14H7.6L10 10.2L12.4 14H18L10 2Z" fill="#50b0ff" />
          <path d="M2 14L7 17.5H13L18 14H2Z" fill="#0078d4" opacity="0.75" />
        </svg>
      )
    case 'AWS':
      return (
        <svg className="arch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 8.5C3 6.3 4.8 4.5 7 4.5C7.7 4.5 8.3 4.7 8.9 5.1C9.6 4.4 10.6 4 11.7 4C14 4 15.8 5.8 15.8 8C17 8.4 17.8 9.5 17.8 10.8C17.8 12.5 16.4 14 14.6 14H5.4C3.6 14 2 12.5 2 10.7C2 9.5 2.8 8.5 4 8.2" fill="#ff9900" opacity="0.9" />
          <path d="M6.5 16.5C8.3 17.8 11.7 17.8 13.5 16.5" stroke="#ff9900" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 15.2L13.5 16.5L12 17.8" stroke="#ff9900" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'Microsoft Fabric':
    case 'SSIS':
    case 'Microsoft Partnership':
      return (
        <svg className="arch-icon" viewBox="0 0 21 21" aria-hidden="true">
          <rect x="0.5" y="0.5" width="9" height="9" fill="#f25022" />
          <rect x="11.5" y="0.5" width="9" height="9" fill="#7fba00" />
          <rect x="0.5" y="11.5" width="9" height="9" fill="#00a4ef" />
          <rect x="11.5" y="11.5" width="9" height="9" fill="#ffb900" />
        </svg>
      )
    case 'Databricks':
    case 'Databricks Partnership':
      return (
        <svg className="arch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <polygon points="10,2 17.5,6.5 17.5,15.5 10,18 2.5,15.5 2.5,6.5" stroke="#ff6b47" strokeWidth="1.5" fill="rgba(255,107,71,0.13)" />
          <polyline points="2.5,6.5 10,11 17.5,6.5" stroke="#ff6b47" strokeWidth="1.5" />
          <line x1="10" y1="11" x2="10" y2="18" stroke="#ff6b47" strokeWidth="1.5" />
        </svg>
      )
    case 'Snowflake':
      return (
        <svg className="arch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="10" y1="1" x2="10" y2="19" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="10" x2="19" y2="10" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
          <line x1="3.5" y1="3.5" x2="16.5" y2="16.5" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
          <line x1="16.5" y1="3.5" x2="3.5" y2="16.5" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2.2" fill="#29b5e8" />
        </svg>
      )
    default:
      return null
  }
}

function WhatYouGetIcon({ iconType }) {
  const baseClasses = 'wug-icon'
  switch (iconType) {
    case 'brain':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 11V18M9 11C7.5 11 6 11.5 6 13C6 14.5 7 15 8 15M15 11C16.5 11 18 11.5 18 13C18 14.5 17 15 16 15M8 15L7 17C6.5 17.5 6.5 18.5 7 19M16 15L17 17C17.5 17.5 17.5 18.5 17 19M9 18C9 19.5 9.5 20 10 20M15 18C15 19.5 14.5 20 14 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'trophy':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3H18V9C18 11.5 16 14 12 14C8 14 6 11.5 6 9V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 5H18M8 3V2C8 1.4 7.6 1 7 1H5C4.4 1 4 1.4 4 2V5M16 3V2C16 1.4 16.4 1 17 1H19C19.6 1 20 1.4 20 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14V20M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'graduation':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V9C2 15 7 20 12 22C17 20 22 15 22 9V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'checkmark':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'lightning':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H11L11 22L21 10H13L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    default:
      return null
  }
}

function currentStackItems(formData) {
  const items = []
  formData.storagePlatforms.forEach((p) => items.push({ label: p, category: 'source' }))
  items.push({ label: formData.etlTool, category: 'etl' })
  if (formData.usesDataVault) items.push({ label: 'Data Vault 2.0', category: 'feature' })
  items.push({ label: `Size: ${formData.environmentSize}`, category: 'meta' })
  return items
}

function targetStackItems(formData) {
  const items = [{ label: formData.targetPlatform, category: 'platform' }]
  if (formData.targetPlatform === 'Microsoft Fabric' && formData.usePinjaFabricStandard) {
    items.push({ label: 'Pinja Fabric Standard', category: 'pinja' })
  }
  if (formData.microsoftPartnershipSupport) {
    items.push({ label: 'Microsoft Partnership', category: 'partner' })
  }
  if (formData.databricksPartnershipSupport) {
    items.push({ label: 'Databricks Partnership', category: 'partner' })
  }
  items.push({ label: 'Pinja Migration Agent', category: 'agent' })
  return items
}

function ArchChip({ item }) {
  const icon = TechIcon({ label: item.label })
  return (
    <div className={`arch-chip arch-chip-${item.category}`}>
      {icon ?? (
        <span className="arch-badge-letter" aria-hidden="true">
          {item.label.charAt(0)}
        </span>
      )}
      <span className="arch-chip-label">{item.label}</span>
    </div>
  )
}

const sumWeeks = (timeline) => timeline.reduce((sum, phase) => sum + phase.weeks, 0)

const weeksToMonths = (weeks) => Math.ceil(weeks / 4.33)
const roundToFiveK = (value) => Math.round(value / 5000) * 5000

function buildTraditionalTimeline(pinjaTimeline) {
  const pinjaTotalWeeks = sumWeeks(pinjaTimeline)
  const getPhaseWeeks = (name) =>
    pinjaTimeline.find((phase) => phase.name === name)?.weeks

  const assessmentWeeks = Math.max(1, getPhaseWeeks('Assessment') ?? 2)
  const pinjaTestingWeeks = Math.max(1, getPhaseWeeks('Testing') ?? 3)
  const pinjaGoLiveWeeks = Math.max(1, getPhaseWeeks('Go-Live') ?? 1)

  return [
    { name: 'Assessment', weeks: assessmentWeeks },
    { name: 'Migration', weeks: Math.max(2, Math.round(pinjaTotalWeeks * 2)) },
    { name: 'Testing', weeks: Math.max(4, Math.round(pinjaTestingWeeks * 2.5)) },
    { name: 'Go-Live', weeks: Math.max(3, Math.round(pinjaGoLiveWeeks * 3.5)) }
  ]
}

function applyDataVaultTraditionalAdjustment(traditionalTimeline, usesDataVault) {
  if (!usesDataVault) return traditionalTimeline

  return traditionalTimeline.map((phase) => ({
    ...phase,
    weeks: Math.max(1, Math.round(phase.weeks * 1.4))
  }))
}

function buildScaledSegments(timeline, scaleMaxWeeks) {
  let currentPercent = 0

  return timeline.map((phase) => {
    const widthPercent = (phase.weeks / scaleMaxWeeks) * 100
    const startPercent = currentPercent
    const centerPercent = startPercent + widthPercent / 2
    currentPercent += widthPercent

    return {
      ...phase,
      widthPercent,
      startPercent,
      centerPercent
    }
  })
}

export default function App() {
  const [formData, setFormData] = useState(defaultFormData)
  const [submitted, setSubmitted] = useState(false)

  const results = useMemo(() => calculateResults(formData), [formData])
  const timelineComparison = useMemo(() => {
    const pinjaTimeline = results.timeline
    const traditionalTimeline = applyDataVaultTraditionalAdjustment(
      buildTraditionalTimeline(pinjaTimeline),
      formData.usesDataVault
    )

    const pinjaTotalWeeks = sumWeeks(pinjaTimeline)
    const traditionalTotalWeeks = sumWeeks(traditionalTimeline)
    const scaleMaxWeeks = Math.max(pinjaTotalWeeks, traditionalTotalWeeks)
    const timeSavedWeeks = Math.max(0, traditionalTotalWeeks - pinjaTotalWeeks)
    const timeSavedMonths = Math.round(timeSavedWeeks / 4.33)
    const shorterPercent =
      traditionalTotalWeeks > 0
        ? Math.round((timeSavedWeeks / traditionalTotalWeeks) * 100)
        : 0

    const phaseRowsMap = new Map()
    pinjaTimeline.forEach((phase) => {
      phaseRowsMap.set(phase.name, {
        phase: phase.name,
        pinjaWeeks: phase.weeks,
        traditionalWeeks: 0
      })
    })

    traditionalTimeline.forEach((phase) => {
      if (!phaseRowsMap.has(phase.name)) {
        phaseRowsMap.set(phase.name, {
          phase: phase.name,
          pinjaWeeks: 0,
          traditionalWeeks: phase.weeks
        })
      } else {
        phaseRowsMap.get(phase.name).traditionalWeeks = phase.weeks
      }
    })

    return {
      scaleMaxWeeks,
      timeSavedWeeks,
      timeSavedMonths,
      shorterPercent,
      phaseRows: [...phaseRowsMap.values()],
      pinja: {
        label: 'Pinja Accelerated Project',
        totalWeeks: pinjaTotalWeeks,
        totalMonths: weeksToMonths(pinjaTotalWeeks),
        segments: buildScaledSegments(pinjaTimeline, scaleMaxWeeks)
      },
      traditional: {
        label: 'Traditional Migration Project',
        totalWeeks: traditionalTotalWeeks,
        totalMonths: weeksToMonths(traditionalTotalWeeks),
        segments: buildScaledSegments(traditionalTimeline, scaleMaxWeeks)
      }
    }
  }, [formData.usesDataVault, results.timeline])

  const costComparison = useMemo(() => {
    const pinjaMin = results.estimatedRange.min
    const pinjaMax = results.estimatedRange.max

    const pinjaWeeks = Math.max(1, timelineComparison.pinja.totalWeeks)
    const traditionalWeeks = Math.max(1, timelineComparison.traditional.totalWeeks)
    const timelineMultiplier = traditionalWeeks / pinjaWeeks

    const traditionalMin = roundToFiveK(pinjaMin * timelineMultiplier)
    const traditionalMax = roundToFiveK(pinjaMax * timelineMultiplier)

    const pinjaMid = (pinjaMin + pinjaMax) / 2
    const traditionalMid = (traditionalMin + traditionalMax) / 2
    const percentSavings = Math.max(
      0,
      Math.round((1 - pinjaMid / Math.max(traditionalMid, 1)) * 100)
    )

    return {
      pinjaLabel: formatCurrencyRange(pinjaMin, pinjaMax),
      traditionalLabel: formatCurrencyRange(traditionalMin, traditionalMax),
      timelineMultiplier,
      percentSavings
    }
  }, [results.estimatedRange.max, results.estimatedRange.min, timelineComparison.pinja.totalWeeks, timelineComparison.traditional.totalWeeks])

  useEffect(() => {
    if (!submitted) return
    trackEvent('results_viewed', {
      target_platform: formData.targetPlatform,
      etl_tool: formData.etlTool,
      environment_size: formData.environmentSize
    })
  }, [submitted, formData.environmentSize, formData.etlTool, formData.targetPlatform])

  const onStorageToggle = (option) => {
    setFormData((current) => {
      const exists = current.storagePlatforms.includes(option)
      const updated = exists
        ? current.storagePlatforms.filter((item) => item !== option)
        : [...current.storagePlatforms, option]

      return {
        ...current,
        storagePlatforms: updated
      }
    })
  }

  const onTargetChange = (targetPlatform) => {
    setFormData((current) => ({
      ...current,
      targetPlatform,
      usePinjaFabricStandard:
        targetPlatform === 'Microsoft Fabric' ? current.usePinjaFabricStandard : false,
      microsoftPartnershipSupport:
        targetPlatform === 'Microsoft Fabric'
          ? current.microsoftPartnershipSupport
          : false,
      databricksPartnershipSupport:
        targetPlatform === 'Databricks'
          ? current.databricksPartnershipSupport
          : false
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)

    trackEvent('form_submitted', {
      target_platform: formData.targetPlatform,
      etl_tool: formData.etlTool,
      environment_size: formData.environmentSize,
      uses_dv2: String(formData.usesDataVault),
      source_count: formData.storagePlatforms.length
    })

    trackEvent('popular_combination_selected', {
      combination: `${formData.etlTool} -> ${formData.targetPlatform} (${formData.environmentSize})`
    })

    requestAnimationFrame(() => {
      const section = document.getElementById('results')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-magenta" />
      <div className="ambient ambient-cyan" />

      <header className="topbar">
        <a href="https://pinja.com" target="_blank" rel="noreferrer" className="logo-link">
          <img 
            src="https://pinja.com/hubfs/2025/Pinja_nimilogo.svg" 
            alt="Pinja" 
            className="logo"
          />
        </a>
        <a className="ghost-link" href="https://pinja.com" target="_blank" rel="noreferrer">
          Visit pinja.com
        </a>
      </header>

      <main className="content-wrap">
        <section className="hero-card glass">
          <p className="eyebrow">Pinja Migration Configurator</p>
          <h1>Model your migration path in minutes.</h1>
          <p>
            Configure your current environment and target stack to generate a dynamic
            architecture view, delivery timeline, and cost-savings estimate.
          </p>
        </section>

        <section className="form-section glass">
          <h2>Migration Inputs</h2>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Storage / Source platform</label>
              <div className="chips-grid">
                {STORAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`chip ${
                      formData.storagePlatforms.includes(option) ? 'chip-active' : ''
                    }`}
                    onClick={() => onStorageToggle(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label htmlFor="etl">ETL tool</label>
                <select
                  id="etl"
                  value={formData.etlTool}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, etlTool: e.target.value }))
                  }
                >
                  {ETL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="size">Environment size (fact table count)</label>
                <select
                  id="size"
                  value={formData.environmentSize}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, environmentSize: e.target.value }))
                  }
                >
                  {SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <label className="toggle-card">
                <span>Data Vault 2.0 in use?</span>
                <input
                  type="checkbox"
                  checked={formData.usesDataVault}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, usesDataVault: e.target.checked }))
                  }
                />
              </label>
            </div>

            <div className="field-row">
              <div className="field-group full-width">
                <label htmlFor="target">Target platform</label>
                <select
                  id="target"
                  value={formData.targetPlatform}
                  onChange={(e) => onTargetChange(e.target.value)}
                >
                  {TARGET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.targetPlatform === 'Microsoft Fabric' && (
              <div className="field-row">
                <label className="toggle-card">
                  <span>Use Pinja Fabric Standard?</span>
                  <input
                    type="checkbox"
                    checked={formData.usePinjaFabricStandard}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        usePinjaFabricStandard: e.target.checked
                      }))
                    }
                  />
                </label>
                <label className="toggle-card">
                  <span>Microsoft partnership support</span>
                  <input
                    type="checkbox"
                    checked={formData.microsoftPartnershipSupport}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        microsoftPartnershipSupport: e.target.checked
                      }))
                    }
                  />
                </label>
              </div>
            )}

            {formData.targetPlatform === 'Databricks' && (
              <div className="field-row">
                <label className="toggle-card">
                  <span>Databricks partnership support</span>
                  <input
                    type="checkbox"
                    checked={formData.databricksPartnershipSupport}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        databricksPartnershipSupport: e.target.checked
                      }))
                    }
                  />
                </label>
              </div>
            )}

            <button className="primary-btn" type="submit">
              Generate Results
            </button>
          </form>
        </section>

        {submitted && (
          <section className="results-panel" id="results">
            <h2>Results</h2>

            <div className="result-card glass">
              <h3>1. Architecture Diagram</h3>
              <div className="arch-layout">
                <div className="arch-panel arch-panel-current">
                  <p className="arch-panel-title">Current Stack</p>
                  <div className="arch-chips">
                    {currentStackItems(formData).map((item) => (
                      <ArchChip key={item.label} item={item} />
                    ))}
                  </div>
                </div>

                <div className="arch-bridge">
                  <svg className="arch-bridge-arrow" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="arrowGrad" x1="0" y1="24" x2="48" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#eb007f" />
                        <stop offset="1" stopColor="#27d3d0" />
                      </linearGradient>
                    </defs>
                    <line x1="4" y1="24" x2="34" y2="24" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <polyline points="26,14 40,24 26,34" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="arch-bridge-label">powered by</span>
                  <div className="arch-agent-pill">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="arch-agent-star" aria-hidden="true">
                      <path d="M8 0l1.8 5.7H16l-4.9 3.6 1.9 5.7L8 11.4l-5 3.6 1.9-5.7L0 5.7h6.2z" />
                    </svg>
                    Pinja Migration Agent
                  </div>
                </div>

                <div className="arch-panel arch-panel-target">
                  <p className="arch-panel-title">Target Stack</p>
                  <div className="arch-chips">
                    {targetStackItems(formData).map((item) => (
                      <ArchChip key={item.label} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="result-card glass">
              <h3>2. Project Timeline</h3>
              <div className="timeline-compare">
                <div className="timeline-kpi">
                  <p className="timeline-kpi-main">
                    Pinja delivery is <strong>{timelineComparison.timeSavedMonths} months faster</strong>
                  </p>
                  <p className="timeline-kpi-sub">
                    {timelineComparison.timeSavedWeeks} weeks saved ({timelineComparison.shorterPercent}% shorter timeline)
                  </p>
                </div>

                <article className="timeline-row timeline-row-pinja">
                  <div className="timeline-row-head">
                    <p className="timeline-row-title">{timelineComparison.pinja.label}</p>
                    <p className="timeline-row-total">
                      {timelineComparison.pinja.totalMonths} months ({timelineComparison.pinja.totalWeeks} weeks)
                    </p>
                  </div>
                  <div className="timeline-scale-wrap" aria-label="Pinja timeline scaled to common baseline">
                    <div className="timeline-scale-track">
                      <div
                        className="timeline-fill"
                        style={{
                          width: `${
                            (timelineComparison.pinja.totalWeeks /
                              timelineComparison.scaleMaxWeeks) *
                            100
                          }%`
                        }}
                      />
                      {timelineComparison.pinja.segments.slice(1).map((phase) => (
                        <div
                          className="timeline-phase-tick"
                          key={`pinja-tick-${phase.name}`}
                          style={{ left: `${phase.startPercent}%` }}
                          title={phase.name}
                        />
                      ))}
                    </div>
                  </div>
                </article>

                <article className="timeline-row timeline-row-traditional">
                  <div className="timeline-row-head">
                    <p className="timeline-row-title">{timelineComparison.traditional.label}</p>
                    <p className="timeline-row-total">
                      {timelineComparison.traditional.totalMonths} months ({timelineComparison.traditional.totalWeeks} weeks)
                    </p>
                  </div>
                  <div className="timeline-scale-wrap" aria-label="Traditional timeline scaled to common baseline">
                    <div className="timeline-scale-track">
                      <div
                        className="timeline-fill"
                        style={{
                          width: `${
                            (timelineComparison.traditional.totalWeeks /
                              timelineComparison.scaleMaxWeeks) *
                            100
                          }%`
                        }}
                      />
                      {timelineComparison.traditional.segments.slice(1).map((phase) => (
                        <div
                          className="timeline-phase-tick"
                          key={`traditional-tick-${phase.name}`}
                          style={{ left: `${phase.startPercent}%` }}
                          title={phase.name}
                        />
                      ))}
                    </div>
                  </div>
                </article>

                <div className="timeline-phase-table-wrap">
                  <table className="timeline-phase-table">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Pinja</th>
                        <th>Traditional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineComparison.phaseRows.map((row) => (
                        <tr key={row.phase}>
                          <td>{row.phase}</td>
                          <td>{row.pinjaWeeks ? `${row.pinjaWeeks}w` : '-'}</td>
                          <td>{row.traditionalWeeks ? `${row.traditionalWeeks}w` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="timeline-scale-note">
                  Both bars are scaled to the same baseline ({timelineComparison.scaleMaxWeeks} weeks).
                </p>

                {formData.usesDataVault && (
                  <div className="timeline-info-box" role="note" aria-label="Data Vault 2.0 timeline note">
                    <p className="timeline-info-title">Why DV2.0 affects Traditional timeline more</p>
                    <p>
                      Data Vault 2.0 typically increases traditional migration duration because teams need
                      case-by-case assessment and manual handling of vault objects. Pinja timeline is not
                      extended because the Pinja Migration Agent supports DV2.0 migration out of the box.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="result-card glass">
              <h3>3. Cost and Savings Breakdown</h3>
              <div className="kpi-grid">
                <article className="kpi-card-pinja">
                  <p className="kpi-label">Pinja cost estimate</p>
                  <p className="kpi-value">{costComparison.pinjaLabel}</p>
                </article>
                <article className="kpi-card-traditional">
                  <p className="kpi-label">Traditional migration estimate</p>
                  <p className="kpi-value">{costComparison.traditionalLabel}</p>
                </article>
              </div>

              <p className="cost-comparison-note">
                Traditional estimate is timeline-adjusted ({costComparison.timelineMultiplier.toFixed(2)}x longer delivery) and
                indicates approximately {costComparison.percentSavings}% lower project cost with Pinja.
              </p>

              <p className="kpi-value kpi-savings">{results.savingsLabel}</p>

              {results.partnershipCallout && (
                <div className="partnership-card">
                  <p className="partnership-title">Partnership Support Included</p>
                  <p>{results.partnershipCallout}</p>
                </div>
              )}
            </div>

            <div className="result-card glass">
              <h3>4. Pros and Cons</h3>
              <div className="pros-cons-grid">
                <article className="pros-card">
                  <p className="list-title">Migration-path Pros</p>
                  <ul>
                    {results.prosCons.migrationPros.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="cons-card">
                  <p className="list-title">Migration-path Cons</p>
                  <ul>
                    {results.prosCons.migrationCons.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="advantages-card">
                  <p className="list-title">Pinja Advantages</p>
                  <ul>
                    {results.prosCons.pinjaAdvantages.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            <div className="result-card glass">
              <h3>5. What You Get</h3>
              <p className="wug-intro">
                Beyond the timeline and cost, you're investing in a proven data engineering capability that your team will own and operate for years to come.
              </p>
              <div className="wug-grid">
                {migrationConfig.whatYouGet.map((item) => (
                  <article key={item.id} className="wug-card">
                    <div className="wug-header">
                      <div className="wug-icon-wrap">
                        <WhatYouGetIcon iconType={item.icon} />
                      </div>
                      <h4>{item.title}</h4>
                    </div>
                    <p className="wug-subtitle">{item.subtitle}</p>
                    <ul className="wug-points">
                      {item.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className="cta-wrap">
              <a
                href="https://pinja.com/contact-us"
                target="_blank"
                rel="noreferrer"
                className="primary-btn"
                onClick={() => trackEvent('consultation_cta_clicked')}
              >
                Book a Free Consultation
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
