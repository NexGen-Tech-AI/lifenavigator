// PDF generation will be enabled after installing dependencies
// npm install jspdf jspdf-autotable @types/jspdf

interface FinancialSnapshot {
  date: Date;
  monthsFromStart: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
  emergencyFund: number;
  debtToIncomeRatio: number;
  investmentBalance: number;
  retirementBalance: number;
  healthScore: number;
  stressLevel: number;
  goalProgress: Record<string, number>;
  income: number;
  expenses: number;
}

import { RiskAnalysis } from './riskAnalysisService';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export class ReportGeneratorService {
  static async generatePDFReport(
    analysis: RiskAnalysis,
    snapshots: FinancialSnapshot[],
    events: any[],
    userName: string = 'User'
  ): Promise<Blob> {
    // Temporary stub until jsPDF is installed
    console.log('PDF generation will be available after installing dependencies');
    console.log('Run: npm install jspdf jspdf-autotable @types/jspdf');
    
    // Return a dummy blob for now
    return new Blob(['PDF generation not yet implemented'], { type: 'text/plain' });
    
    /* const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(31, 41, 55); // gray-800
    pdf.text('Financial Risk Analysis Report', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(`Generated for ${userName} on ${formatDate(new Date())}`, 20, yPosition);
    yPosition += 20;

    // Executive Summary
    this.addSection(pdf, 'Executive Summary', yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setTextColor(55, 65, 81); // gray-700
    
    const summaryText = `Your current financial risk score is ${analysis.overallRiskScore}/100, ` +
      `indicating a ${analysis.riskLevel} risk level. This comprehensive analysis evaluates ` +
      `your emergency fund coverage, cash flow stability, debt management, investment allocation, ` +
      `and goal achievement potential over the next 5 years.`;
    
    const summaryLines = pdf.splitTextToSize(summaryText, 170);
    pdf.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 10;

    // Risk Score Summary
    this.addSection(pdf, 'Risk Assessment Summary', yPosition);
    yPosition += 15;

    const riskData = analysis.risks.map(risk => [
      risk.category,
      `${risk.score}/100`,
      risk.level,
      risk.impact
    ]);

    autoTable(pdf, {
      head: [['Category', 'Score', 'Risk Level', 'Impact']],
      body: riskData,
      startY: yPosition,
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: [255, 255, 255],
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 75 }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Critical Warnings
    if (analysis.warnings.length > 0) {
      // Check if we need a new page
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      this.addSection(pdf, 'Critical Warnings', yPosition, [239, 68, 68]); // red-500
      yPosition += 15;

      pdf.setFontSize(10);
      analysis.warnings.forEach(warning => {
        pdf.setTextColor(185, 28, 28); // red-700
        pdf.text('⚠ ', 20, yPosition);
        pdf.setTextColor(55, 65, 81);
        const warningLines = pdf.splitTextToSize(warning, 160);
        pdf.text(warningLines, 28, yPosition);
        yPosition += warningLines.length * 5 + 3;
      });
      yPosition += 10;
    }

    // Recommendations
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }

    this.addSection(pdf, 'Recommended Actions', yPosition);
    yPosition += 15;

    analysis.recommendations.forEach((rec, index) => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      // Priority badge
      const priorityColors = {
        'IMMEDIATE': [239, 68, 68], // red-500
        'HIGH': [251, 146, 60], // orange-400
        'MEDIUM': [250, 204, 21], // yellow-400
        'LOW': [34, 197, 94] // green-500
      };

      pdf.setFillColor(...(priorityColors[rec.priority] || [156, 163, 175]));
      pdf.rect(20, yPosition - 4, 30, 6, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(rec.priority, 35, yPosition, { align: 'center' });
      
      // Title
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text(rec.title, 55, yPosition);
      yPosition += 7;

      // Description
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      const descLines = pdf.splitTextToSize(rec.description, 150);
      pdf.text(descLines, 20, yPosition);
      yPosition += descLines.length * 4 + 3;

      // Impact and Timeline
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Impact: ${rec.impact}`, 20, yPosition);
      yPosition += 4;
      pdf.text(`Timeline: ${rec.timeline}`, 20, yPosition);
      
      if (rec.estimatedSavings) {
        pdf.setTextColor(34, 197, 94); // green-500
        pdf.text(`Potential Savings: ${formatCurrency(rec.estimatedSavings)}`, 120, yPosition);
      }
      yPosition += 8;

      // Implementation steps
      if (index === 0) { // Show detailed steps for highest priority
        pdf.setFontSize(9);
        pdf.setTextColor(59, 130, 246); // blue-500
        pdf.text('Implementation Steps:', 20, yPosition);
        yPosition += 5;
        
        rec.implementation.forEach((step, idx) => {
          if (yPosition > 260) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setTextColor(75, 85, 99);
          const stepLines = pdf.splitTextToSize(`${idx + 1}. ${step}`, 150);
          pdf.text(stepLines, 25, yPosition);
          yPosition += stepLines.length * 4 + 2;
        });
      }
      yPosition += 10;
    });

    // Financial Projections
    pdf.addPage();
    yPosition = 20;
    
    this.addSection(pdf, 'Financial Projections', yPosition);
    yPosition += 15;

    // Create projection summary table
    const projectionData = [
      ['Current', 'Year 1', 'Year 3', 'Year 5']
    ];
    
    const current = snapshots[0];
    const year1 = snapshots[Math.min(11, snapshots.length - 1)];
    const year3 = snapshots[Math.min(35, snapshots.length - 1)];
    const year5 = snapshots[snapshots.length - 1];

    const metrics = [
      ['Net Worth', current.netWorth, year1.netWorth, year3.netWorth, year5.netWorth],
      ['Monthly Income', current.income, year1.income, year3.income, year5.income],
      ['Monthly Expenses', current.expenses, year1.expenses, year3.expenses, year5.expenses],
      ['Emergency Fund', current.emergencyFund, year1.emergencyFund, year3.emergencyFund, year5.emergencyFund],
      ['Total Assets', current.totalAssets, year1.totalAssets, year3.totalAssets, year5.totalAssets],
      ['Total Liabilities', current.totalLiabilities, year1.totalLiabilities, year3.totalLiabilities, year5.totalLiabilities]
    ];

    const formattedData = metrics.map(([label, ...values]) => [
      label as string,
      ...values.map(v => formatCurrency(v as number))
    ]);

    autoTable(pdf, {
      head: [projectionData[0]],
      body: formattedData,
      startY: yPosition,
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Opportunities
    if (analysis.opportunities.length > 0) {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      this.addSection(pdf, 'Opportunities', yPosition, [34, 197, 94]); // green-500
      yPosition += 15;

      pdf.setFontSize(10);
      analysis.opportunities.forEach(opportunity => {
        pdf.setTextColor(34, 197, 94);
        pdf.text('✓ ', 20, yPosition);
        pdf.setTextColor(55, 65, 81);
        const oppLines = pdf.splitTextToSize(opportunity, 160);
        pdf.text(oppLines, 28, yPosition);
        yPosition += oppLines.length * 5 + 3;
      });
    }

    // Disclaimer
    pdf.addPage();
    yPosition = 20;
    
    this.addSection(pdf, 'Important Disclaimer', yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    const disclaimer = `This report is generated based on the financial information and scenarios ` +
      `provided. It is intended for informational purposes only and should not be considered ` +
      `as personalized financial advice. Market conditions, tax laws, and personal circumstances ` +
      `can change. We recommend consulting with qualified financial, tax, and legal professionals ` +
      `before making significant financial decisions.`;
    
    const disclaimerLines = pdf.splitTextToSize(disclaimer, 170);
    pdf.text(disclaimerLines, 20, yPosition);

    // Return as blob
    return pdf.output('blob'); */
  }

  /* private static addSection(
    pdf: jsPDF, 
    title: string, 
    yPosition: number, 
    color: number[] = [59, 130, 246]
  ) {
    pdf.setFontSize(16);
    pdf.setTextColor(...color);
    pdf.text(title, 20, yPosition);
    
    // Add underline
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition + 2, 190, yPosition + 2);
  } */
}