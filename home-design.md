# Prompt for DSpace 10 Angular Theme Implementation

**Role:** Senior DSpace 10 Angular & Frontend Architect  
**Objective:** Implement a fully customized, responsive homepage for the Kenya National Bureau of Statistics (KNBS) Institutional Repository (named "National Statistical Repository") running on DSpace 10 Angular, based on the provided design specification and the attached visual mockup image.

---

### 1. Repository Environment & Theme Constraints
1. **Target Theme Folder:** All theme-specific modifications must reside strictly within `src/themes/knbs/`.
2. **DSpace Version:** DSpace 10 (Angular 18+, TypeScript 5+, RxJS 7+, NgRx, Bootstrap 5+, Highcharts).
3. **Themed Overrides Pattern:** Use the standard DSpace themed component wrapper pattern (`@Component({ ... })` extending core components or providing custom standalone/modular components).
4. **Color Tokens & Styling:**
   - Primary Brand Color: `--knbs-brown: #b06443;`
   - Primary Surface / Tint: `--knbs-light-brown: #f7efec;`
   - Neutral Gray / Dividers: `--knbs-gray: #e9ecef;`
   - High-Contrast Text: `#1e293b`
   - Accent / Gold: `#eaa023`
   - Open Access / Success: `#0b804b`
   - Monospace: `'JetBrains Mono', 'Roboto Mono', monospace`
5. **External Modifications:** If any configuration is needed outside `src/themes/knbs/` (e.g., `package.json` for highcharts dependencies or `config.prod.yml` / `environment.ts` for theme registration), list them explicitly under an **"External Modifications"** section with exact diffs.

---
Statistical Domain Explorer with Interactive Sunburst (src/themes/knbs/app/home-page/home-sunburst-explorer/)
Layout: Contained card (~570px height) split into two columns:

Left Column (40%): Vertical listing of Top-Level DSpace Communities with live item counts in badges (e.g., 4,850, 3,420). Clicking expands nested sub-communities and collections.

Right Column (60%): Interactive 3-tier highcharts Sunburst Chart modeled after the AKU Institutional Repository discipline explorer (https://ecommons.aku.edu/sunburst.html).

Interaction Logic:

Center core displays KNBS | Total Items.

Inner Ring = Top Communities; Middle Ring = Sub-communities; Outer Ring = Collections.

Hovering over a list item on the left highlights the corresponding arc segment in the sunburst.

Hovering over an arc in the sunburst updates the breadcrumb bar and shows a docked hover card with item count and direct link.

Clicking a wedge zooms into that sub-tree with smooth highcharts transitions.

Mobile view (< 768px): Gracefully collapses into a responsive accordion list with item counts.

Developer Bar & Themed Footer (src/themes/knbs/app/footer/)
Developer section highlighting DSpace REST API endpoints, OAI-PMH harvesters (COAR Notify/OpenAIRE compliant)

4-column structured footer with institutional contacts, physical address (Real Towers, Hospital Rd, Upper Hill, Nairobi), legal open-data licensing (CC-BY 4.0), and copyright notice.

Flagship Publications & Direct Bitstream Downloads (src/themes/knbs/app/home-page/home-flagship-publications/)
Display 4 key national releases (e.g., Economic Survey, 2019 KPHC Census, Statistical Abstract, Leading Economic Indicators).

Each card must display:

Release date, title, and brief description.

Permanent Handle URI link 

One-click direct bitstream download buttons for PDF, XLSX, CSV, or GeoJSON.


If any of these features require a backend modification, document the specific steps to make the modifications on the backend.