import config from '../config/migration-config.json'

const ROUNDING_STEP = 5000

const clampPositive = (value) => Math.max(value, ROUNDING_STEP)

const roundToStep = (value) => Math.round(value / ROUNDING_STEP) * ROUNDING_STEP

export const formatCurrencyRange = (min, max) => {
  const f = (n) => `EUR ${n.toLocaleString('en-US')}`
  return `${f(min)} - ${f(max)}`
}

const getProsConsKey = (etlTool, targetPlatform) => `${etlTool}|${targetPlatform}`

export function buildTimeline(formData) {
  const phaseNames = [
    'Assessment',
    'Architecture Mapping',
    'Migration',
    'Testing',
    'Go-Live'
  ]

  if (formData.etlTool === 'Wherescape') {
    phaseNames.splice(2, 0, 'Automated SQL Extraction')
  }

  if (
    formData.targetPlatform === 'Microsoft Fabric' &&
    formData.usePinjaFabricStandard
  ) {
    phaseNames.splice(2, 0, 'Pinja Standard Deployment')
  }

  const sizeMultiplier = config.sizeWeekModifiers[formData.environmentSize] ?? 1

  return phaseNames.map((name) => {
    const baseWeeks = config.timeline[name]?.baseWeeks ?? 2
    const weeks = Math.max(1, Math.round(baseWeeks * sizeMultiplier))
    return { name, weeks }
  })
}

function buildSavingsLabel(formData) {
  const bestCase =
    formData.targetPlatform === 'Microsoft Fabric' &&
    formData.usePinjaFabricStandard &&
    formData.etlTool === 'Wherescape' &&
    formData.usesDataVault

  if (bestCase) return config.savingsBands.best
  if (formData.targetPlatform === 'Microsoft Fabric') return config.savingsBands.high
  if (formData.targetPlatform === 'Databricks') return config.savingsBands.medium
  return config.savingsBands.base
}

function applyPartnershipDiscount(range, formData) {
  const result = { ...range }
  let callout = null

  if (
    formData.targetPlatform === 'Microsoft Fabric' &&
    formData.microsoftPartnershipSupport
  ) {
    const support = config.partnershipDeductions['Microsoft partnership support']
    const discount = support.type === 'percent' ? support.value : 0
    result.min *= 1 - discount
    result.max *= 1 - discount
    callout = support.label
  }

  if (
    formData.targetPlatform === 'Databricks' &&
    formData.databricksPartnershipSupport
  ) {
    const support = config.partnershipDeductions['Databricks partnership support']
    const discount = support.type === 'percent' ? support.value : 0
    result.min *= 1 - discount
    result.max *= 1 - discount
    callout = support.label
  }

  return {
    range: {
      min: clampPositive(roundToStep(result.min)),
      max: clampPositive(roundToStep(result.max))
    },
    callout
  }
}

export function buildProsCons(formData) {
  const key = getProsConsKey(formData.etlTool, formData.targetPlatform)
  const base = config.prosCons.default
  const specific = config.prosCons[key] ?? {}

  const migrationPros = [...(base.migrationPros ?? []), ...(specific.migrationPros ?? [])]
  const migrationCons = [...(base.migrationCons ?? []), ...(specific.migrationCons ?? [])]
  const pinjaAdvantages = [
    ...(base.pinjaAdvantages ?? []),
    ...(specific.pinjaAdvantages ?? [])
  ]

  if (formData.usesDataVault) {
    pinjaAdvantages.push('DV2.0 migration path support is available in Pinja-led programs.')
  }

  return { migrationPros, migrationCons, pinjaAdvantages }
}

export function calculateResults(formData) {
  const base = config.baseCostBySize[formData.environmentSize] ?? { min: 90000, max: 130000 }

  const etlMultiplier = config.etlMultipliers[formData.etlTool] ?? 1.12
  const targetMultiplier = config.targetMultipliers[formData.targetPlatform] ?? 1.1

  let featureMultiplier = 1

  if (formData.targetPlatform === 'Microsoft Fabric' && formData.usePinjaFabricStandard) {
    featureMultiplier *= config.featureMultipliers.usePinjaFabricStandard
  }

  if (formData.usesDataVault) {
    featureMultiplier *= config.featureMultipliers.usesDataVault
  }

  if (formData.etlTool === 'Wherescape' && formData.targetPlatform === 'Microsoft Fabric') {
    featureMultiplier *= config.featureMultipliers.wherescapeWithFabric
  }

  const preliminaryRange = {
    min: base.min * etlMultiplier * targetMultiplier * featureMultiplier,
    max: base.max * etlMultiplier * targetMultiplier * featureMultiplier
  }

  const discounted = applyPartnershipDiscount(preliminaryRange, formData)

  return {
    estimatedRange: discounted.range,
    estimatedRangeLabel: formatCurrencyRange(discounted.range.min, discounted.range.max),
    savingsLabel: buildSavingsLabel(formData),
    partnershipCallout: discounted.callout,
    timeline: buildTimeline(formData),
    prosCons: buildProsCons(formData)
  }
}
