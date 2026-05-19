# ResearchCalcHub

ResearchCalcHub is a client-side educational calculator platform for research, statistics, social science, STEM, governance, finance, education, health, and everyday calculations. It is designed to feel like a polished academic product: searchable, category-driven, exportable, and easy to expand.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- jsPDF for PDF reports
- Client-side only, no backend required

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Then open the local Vite URL, usually:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

## Contact Forms On Vercel

Report Error, Suggest Calculator, and Contact submit to the Vercel serverless route:

```text
/api/contact
```

The frontend must not call Resend directly. Add these Vercel environment variables:

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=recalhub@gmail.com
```

For local testing of Vercel serverless functions, install/use the Vercel CLI and run:

```bash
vercel dev
```

Then test `/report-error`, `/suggest-calculator`, and `/contact` through the Vercel dev URL.

## Accuracy Checks

Run representative formula checks:

```bash
npm run test:accuracy
```

These checks cover sample size, Cohen's Kappa, Cronbach's Alpha, standard deviation, confidence intervals, AHP weighting, Delphi IQR, maturity scoring, risk scoring, finance, physics, and chemistry examples. They are a regression guard, not a substitute for full statistical validation.

## Folder Structure

```text
src/
  components/
    calculators/        Shared calculator layout and result actions
    layout/             Navbar and footer
    ui/                 Reusable cards, formula boxes, tables, search, results
  data/
    calculators.ts      Central calculator and category metadata
  pages/
    calculators/        Calculator page components
    Home.tsx
    Calculators.tsx
    Category.tsx
    ResearchToolkit.tsx
  types/
    index.ts            Shared TypeScript types
  utils/
    calculations.ts     Research methodology formulas
    statistics.ts       Statistics formulas
    decisionTools.ts    Social science and decision formulas
    maturityScoring.ts  Maturity and capability formulas
    stemCalculators.ts  Math, physics, and chemistry config/calculations
    practicalCalculators.ts Finance, education, health, everyday config/calculations
    cybersecurity.ts    Cybersecurity and AI governance config/calculations
    export.ts           CSV and copy text helpers
    pdf.ts              PDF report generation
    seo.ts              Page title and meta description helper
```

## Calculator Metadata

All calculators are exposed through `src/data/calculators.ts`. Each calculator includes:

- `id`
- `name`
- `slug`
- `category`
- `categoryId`
- `description`
- `longDescription`
- `whenToUse`
- `difficulty`
- `tags`
- `researchMethods`
- `useCases`
- `status`
- `formula`
- `relatedCalculators`
- `userTypes`
- `path`
- `faqs`

The listing page, search, filters, category pages, related calculator cards, and SEO text all use this metadata.

## Add A New Calculator

1. Add formula logic in the right `src/utils/` file.
2. Add metadata in `src/data/calculators.ts`, or add a config entry if using one of the generated calculator families.
3. Add the calculator id to the relevant category `calculatorIds`.
4. Add a route in `src/App.tsx` if it uses a custom page.
5. Include useful `tags`, `useCases`, `relatedCalculators`, and `faqs`.
6. Run:

```bash
npm run build
npm run test:accuracy
```

## Add A New Category

1. Add a category object to `categories` in `src/data/calculators.ts`.
2. Give it an `id`, `name`, description, icon name, colours, status, and calculator ids.
3. Assign calculators to the category using the same `categoryId`.
4. Add an active section in `src/pages/Calculators.tsx` if it should appear on the main calculator listing.

## Export Features

Most calculator pages inherit these from `CalculatorLayout`:

- Copy result
- Download PDF report
- Export CSV report
- Print view
- Recent calculations in browser local storage
- Formula, interpretation, academic text, and disclaimer in exported reports

Table inputs also include a CSV export button.

## Notes

ResearchCalcHub is educational software. Outputs should be checked before being used in academic, financial, health, cybersecurity, public sector, or professional decision-making contexts.
