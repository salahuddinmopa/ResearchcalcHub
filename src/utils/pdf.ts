interface PDFResult {
  label: string;
  value: string;
  highlight?: boolean;
}

interface PDFReportOptions {
  inputs?: { label: string; value: string }[];
  formula?: string;
  disclaimer?: string;
}

export async function downloadResultAsPDF(
  calculatorName: string,
  results: PDFResult[],
  interpretation: string,
  academicText: string,
  steps: string[],
  options: PDFReportOptions = {}
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  function addText(text: string, size: number, style: 'normal' | 'bold', indent = 0) {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    lines.forEach((line: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin + indent, y);
      y += size * 0.5 + 2;
    });
  }

  function addSectionTitle(title: string) {
    y += 4;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y - 4, maxWidth, 10, 'F');
    addText(title, 11, 'bold');
    y += 2;
  }

  function addDivider() {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + maxWidth, y);
    y += 5;
  }

  // Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ResearchCalcHub', margin, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(calculatorName, margin, 22);
  y = 40;
  doc.setTextColor(30, 30, 30);

  addText(calculatorName, 14, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()} | ResearchCalcHub`, margin, y);
  doc.setTextColor(30, 30, 30);
  y += 8;

  addDivider();

  if (options.inputs?.length) {
    addSectionTitle('Inputs');
    options.inputs.forEach(input => {
      addText(`${input.label}: ${input.value}`, 10, 'normal', 5);
    });
    addDivider();
  }

  if (options.formula) {
    addSectionTitle('Formula');
    addText(options.formula, 10, 'normal', 5);
    addDivider();
  }

  // Results
  addSectionTitle('Results');
  results.forEach(r => {
    addText(`${r.label}: ${r.value}`, 10, r.highlight ? 'bold' : 'normal', 5);
  });

  addDivider();

  // Interpretation
  addSectionTitle('Interpretation');
  addText(interpretation, 10, 'normal', 5);

  addDivider();

  // Academic Reporting Text
  addSectionTitle('Academic Reporting Text');
  addText(academicText, 10, 'normal', 5);

  addDivider();

  // Step-by-step
  if (steps.length > 0) {
    addSectionTitle('Step-by-Step Calculation');
    steps.forEach((step, i) => {
      addText(`${i + 1}. ${step}`, 9, 'normal', 5);
    });
    addDivider();
  }

  addSectionTitle('Disclaimer');
  addText(options.disclaimer || 'ResearchCalcHub results are generated from user-provided inputs and are intended for educational and planning purposes. Verify important decisions with appropriate professional advice.', 9, 'normal', 5);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ResearchCalcHub | ${calculatorName} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = calculatorName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${filename}_result.pdf`);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
