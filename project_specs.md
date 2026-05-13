# Pinja Migration Configurator — Project Specs

## 1. Company Background

- **Company**: Pinja (https://pinja.com) — a Finnish consultant company specialising in migrating legacy data platforms to modern cloud platforms (Databricks, Microsoft Fabric).
- **Key products & differentiators**:
  - **Pinja Fabric Standard** — a packaged product with pre-built architecture, scripts, and best practices for spinning up a Fabric Lakehouse. Ready to sell.
  - **Pinja Migration Agent** — an AI-powered agent that performs the migration once architecture mapping is done. Delivers **70–95% reduction in migration project cost**. Unique in the market.
  - **Wherescape SQL Extractor** — a tool to automatically extract SQL files needed for migration from legacy Wherescape software. **Competitors don't have this**.
  - **Data Vault 2.0 (DV2.0) migration support** — Pinja can migrate from DV2.0 methodology to modern architectures. **Competitors don't have this capability**.
  - **Microsoft partnership** — Microsoft can sponsor part of infrastructure costs for Fabric migrations.
  - **Databricks partnership** — Databricks can sponsor part of infrastructure costs for Databricks migrations.
- **Platform proficiency**: Very strong in Fabric, solid in Databricks, limited Snowflake experience.

---

## 2. App Purpose

A **customer-facing self-service migration configurator**, embedded as a **standalone web app** (hosted at a subdomain e.g. `migration.pinja.com`, linked from pinja.com).

The app lets a prospect (CTO, Data Architect) configure their migration scenario and immediately see a tailored results page that acts as a sales tool — making the case for Pinja before channelling the prospect to book a consultation.

---

## 3. User Journey

```
[Landing / Form Page]
  → Customer fills in current environment + target environment specs
  → Conditional form logic adapts available options in real time

[Results Page]
  → 1. Architecture Diagram (Current → Target stack, icon-based)
  → 2. Project Timeline (dynamic phases + per-phase duration estimates)
  → 3. Cost & Savings Breakdown (estimated cost range + savings % vs. traditional migration)
  → 4. Pros & Cons (migration-path-specific + Pinja competitive advantages)
  → 5. [CTA] "Book a Free Consultation" button (v1: links to Pinja contact page / email)
```

---

## 4. Form Specification

### Layout
- Single-page compact form with **real-time conditional logic** (fields appear/hide based on prior selections).
- No multi-step wizard — all fields visible in one scrollable section.

### Fields

#### Current Environment
| Field | Type | Options |
|---|---|---|
| Storage / Source platform | Multi-select | MS SQL Server, Synapse, Azure SQL, AWS, Data Lake, Other |
| ETL tool | Select | Wherescape, TimeXtender, SSIS, Data Factory, Other |
| Data Vault 2.0 in use? | Toggle (Yes / No) | — |
| Environment size (fact table count) | Select | XS (0–10), S (10–30), M (30–60), L (60–100), XL (100–150), XXL (150+) |

#### Target Environment
| Field | Type | Options | Conditional Logic |
|---|---|---|---|
| Target platform | Select | Microsoft Fabric, Databricks, Snowflake, Other | — |
| Use Pinja Fabric Standard? | Toggle (Yes / No) | — | Only shown if target = Fabric |

#### Options
| Field | Type | Options | Conditional Logic |
|---|---|---|---|
| Microsoft partnership support | Toggle (Yes / No) | — | Only shown if target = Fabric |
| Databricks partnership support | Toggle (Yes / No) | — | Only shown if target = Databricks |

---

## 5. Results Page Specification

### 5.1 Architecture Diagram
- **Style**: Two-column icon-based stack diagram — "Current Stack" (left) → arrow → "Target Stack" (right).
- Technology logos/icons used for each component (storage, ETL tool, target platform).
- Fully dynamic based on form inputs.

### 5.2 Project Timeline
- **Style**: Horizontal or vertical phased timeline with phase name + estimated duration per phase.
- Phases are **dynamic** — they adapt to the selected configuration:
  - Always included: Assessment, Architecture Mapping, Migration, Testing, Go-Live
  - Added if ETL = Wherescape: **"Automated SQL Extraction"** (Pinja unique capability)
  - Added if DV2.0 = Yes: **"Data Vault 2.0 Mapping"** (Pinja unique capability)
  - Added if Pinja Fabric Standard = Yes: **"Pinja Standard Deployment"**
- Duration estimates per phase sourced from `migration-config.json`.

### 5.3 Cost & Savings Breakdown
- Displays:
  - **Estimated migration cost range** (e.g., "€80,000–€120,000")
  - **Savings vs. traditional migration** (e.g., "Save 70–85% with the Pinja Migration Agent")
- Cost range is **dynamic**:
  - Driven by environment size (primary factor) and ETL tool complexity
  - **Pinja-optimal choices reduce cost** (Fabric + Pinja Standard + Wherescape + DV2.0 = cheapest)
  - **Unfavorable choices increase cost** (Snowflake target, unknown ETL, no Pinja Standard = more expensive)
  - **Partnership support reduces cost** (Microsoft or Databricks sponsorship deducts from the range)
- Partnership callout card: if partnership support is selected, show a highlighted card explaining what the sponsorship covers and that Pinja facilitates it.

### 5.4 Pros & Cons Breakdown
- **Not generic** — specific to the selected migration path combination.
- Two categories per item:
  - **Migration-path-specific** (e.g., "Wherescape → Fabric: native SQL extraction tool available ✅")
  - **Pinja competitive advantages** for that specific path (e.g., "DV2.0 migration: only Pinja supports this ✅")
- Content sourced from `migration-config.json`, written as realistic placeholders for v1.

### 5.5 Call to Action
- **"Book a Free Consultation"** button — prominent, at the end of the results page.
- **v1**: Links to Pinja's existing contact page or `mailto:` address.
- **Future**: Replace with real calendar booking integration (Calendly or Microsoft Bookings).

---

## 6. Configuration & Content

### `migration-config.json`
All estimates, pros/cons content, phase durations, cost ranges, and cost modifiers live in a single well-documented JSON config file. Structure:
- Base cost ranges per environment size tier
- Cost multipliers per ETL tool (Wherescape = lowest cost modifier, "Other" = highest)
- Cost multipliers per target platform (Fabric = lowest, Snowflake = highest)
- Partnership sponsorship deductions (fixed amount or percentage)
- Pros/cons content per combination
- Timeline phases and durations per configuration flag

**v1**: Populated with realistic placeholder data by the developer.  
**Pre-launch**: Handed to Pinja's sales/technical team to fill in real numbers and copy.

---

## 7. Technical Specification

| Concern | Decision |
|---|---|
| Framework | React + Vite (static SPA) |
| Styling | Vanilla CSS with design tokens |
| Language | English only |
| Deployment | Azure Static Web Apps (or equivalent static host) |
| Integration | Standalone app at subdomain, linked from pinja.com |
| Backend | None — fully static |
| Storage | None — stateless |
| Analytics | GA4 events (form submission, results viewed, CTA clicked, popular combinations) |
| Calendar integration | v1: placeholder link. Future: Calendly or Microsoft Bookings |
| Mobile | Desktop-first. Gracefully functional on mobile, not heavily optimised. |

---

## 8. Design

- **Style**: Pinja-inspired but with creative freedom — use Pinja's primary brand colors and logo, but with a more modern and bold design language than the main corporate website.
- **Brand colors**: To be extracted from pinja.com and baked into CSS design tokens.
- **Aesthetic**: Premium B2B SaaS feel — dark mode preferred, glassmorphism accents, smooth micro-animations, vibrant data visualizations.
- **Typography**: Modern sans-serif (e.g., Inter or similar from Google Fonts).
- **Tone**: Confident, technical, results-oriented. Not salesy — the results speak for themselves.

---

## 9. Out of Scope (v1)

- User accounts or saved configurations
- CRM integration (HubSpot, Pipedrive, etc.)
- Real calendar booking integration
- Multilingual support (Finnish)
- Admin panel for non-technical content editing
- PDF export of results
- Multi-step wizard form UX

---

## 10. Success Metrics

- % of visitors who reach the results page (form completion rate)
- Most popular migration path combinations (GA4 events)
- % of results page visitors who click the CTA (conversion rate)
- Volume of inbound consultation requests attributed to the tool
