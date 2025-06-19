/**
 * Unified Compliance Testing Framework
 * Base framework for all compliance standards (SOC 2, HIPAA, GDPR, PCI DSS, etc.)
 */

export interface ComplianceTestResult {
  regulation: string;
  description: string;
  passed: boolean;
  evidence: string[];
  findings: string[];
  recommendations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp?: Date;
}

export interface ComplianceReport {
  framework: string;
  testDate: Date;
  overallCompliance: boolean;
  complianceScore: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  results: ComplianceTestResult[];
  executiveSummary: string;
  detailedFindings: string[];
  recommendations: string[];
}

export class ComplianceTestFramework {
  private results: ComplianceTestResult[] = [];
  private framework: string;

  constructor(framework: string) {
    this.framework = framework;
  }

  addResult(result: ComplianceTestResult): void {
    this.results.push({
      ...result,
      timestamp: new Date(),
    });
  }

  generateReport(): ComplianceReport {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const complianceScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const criticalFindings = this.results.filter(
      r => !r.passed && r.severity === 'critical'
    ).length;
    const highFindings = this.results.filter(
      r => !r.passed && r.severity === 'high'
    ).length;
    const mediumFindings = this.results.filter(
      r => !r.passed && r.severity === 'medium'
    ).length;
    const lowFindings = this.results.filter(
      r => !r.passed && r.severity === 'low'
    ).length;

    const overallCompliance = criticalFindings === 0 && highFindings === 0 && complianceScore >= 90;

    const detailedFindings = this.results
      .filter(r => r.findings.length > 0)
      .flatMap(r => r.findings.map(f => `[${r.regulation}] ${f}`));

    const recommendations = this.results
      .filter(r => r.recommendations.length > 0)
      .flatMap(r => r.recommendations.map(rec => `[${r.regulation}] ${rec}`));

    const executiveSummary = this.generateExecutiveSummary(
      complianceScore,
      criticalFindings,
      highFindings,
      overallCompliance
    );

    return {
      framework: this.framework,
      testDate: new Date(),
      overallCompliance,
      complianceScore: Math.round(complianceScore * 100) / 100,
      totalTests,
      passedTests,
      failedTests,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      results: this.results,
      executiveSummary,
      detailedFindings,
      recommendations,
    };
  }

  private generateExecutiveSummary(
    score: number,
    critical: number,
    high: number,
    compliant: boolean
  ): string {
    const status = compliant ? 'COMPLIANT' : 'NON-COMPLIANT';
    
    return `${this.framework} Compliance Assessment Summary:
    
Status: ${status}
Compliance Score: ${score.toFixed(2)}%
Critical Findings: ${critical}
High-Priority Findings: ${high}

${compliant 
  ? `The organization meets ${this.framework} compliance requirements with a score of ${score.toFixed(2)}%. Continue regular monitoring and improvement of controls.`
  : `The organization does not meet ${this.framework} compliance requirements. Immediate action required to address ${critical} critical and ${high} high-priority findings.`}`;
  }

  exportToJSON(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  exportToCSV(): string {
    const report = this.generateReport();
    const headers = [
      'Regulation',
      'Description',
      'Status',
      'Severity',
      'Findings',
      'Recommendations',
      'Evidence',
    ];

    const rows = this.results.map(result => [
      result.regulation,
      result.description,
      result.passed ? 'PASS' : 'FAIL',
      result.severity,
      result.findings.join('; '),
      result.recommendations.join('; '),
      result.evidence.join('; '),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  generateComparisonReport(other: ComplianceTestFramework): any {
    const thisReport = this.generateReport();
    const otherReport = other.generateReport();

    return {
      frameworks: [this.framework, other.framework],
      comparison: {
        [this.framework]: {
          score: thisReport.complianceScore,
          status: thisReport.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT',
          critical: thisReport.criticalFindings,
          high: thisReport.highFindings,
        },
        [other.framework]: {
          score: otherReport.complianceScore,
          status: otherReport.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT',
          critical: otherReport.criticalFindings,
          high: otherReport.highFindings,
        },
      },
      commonFindings: this.findCommonFindings(otherReport),
      uniqueFindings: {
        [this.framework]: thisReport.detailedFindings.filter(
          f => !otherReport.detailedFindings.some(of => this.similarFinding(f, of))
        ),
        [other.framework]: otherReport.detailedFindings.filter(
          f => !thisReport.detailedFindings.some(tf => this.similarFinding(f, tf))
        ),
      },
    };
  }

  private findCommonFindings(otherReport: ComplianceReport): string[] {
    return this.generateReport().detailedFindings.filter(finding =>
      otherReport.detailedFindings.some(otherFinding =>
        this.similarFinding(finding, otherFinding)
      )
    );
  }

  private similarFinding(finding1: string, finding2: string): boolean {
    // Simple similarity check - can be enhanced with more sophisticated algorithms
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalize(finding1).includes(normalize(finding2)) ||
           normalize(finding2).includes(normalize(finding1));
  }
}

// Test result severity helpers
export const getSeverityScore = (severity: ComplianceTestResult['severity']): number => {
  const scores = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  };
  return scores[severity];
};

export const calculateRiskScore = (results: ComplianceTestResult[]): number => {
  const failedResults = results.filter(r => !r.passed);
  const totalRisk = failedResults.reduce(
    (sum, result) => sum + getSeverityScore(result.severity),
    0
  );
  const maxPossibleRisk = results.length * 10; // All critical
  return maxPossibleRisk > 0 ? (1 - totalRisk / maxPossibleRisk) * 100 : 100;
};

// Compliance dashboard data generator
export const generateDashboardData = (reports: ComplianceReport[]) => {
  return {
    overallCompliance: reports.every(r => r.overallCompliance),
    averageScore: reports.reduce((sum, r) => sum + r.complianceScore, 0) / reports.length,
    frameworks: reports.map(r => ({
      name: r.framework,
      score: r.complianceScore,
      status: r.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT',
      lastTested: r.testDate,
    })),
    totalFindings: {
      critical: reports.reduce((sum, r) => sum + r.criticalFindings, 0),
      high: reports.reduce((sum, r) => sum + r.highFindings, 0),
      medium: reports.reduce((sum, r) => sum + r.mediumFindings, 0),
      low: reports.reduce((sum, r) => sum + r.lowFindings, 0),
    },
    topRecommendations: reports
      .flatMap(r => r.recommendations)
      .slice(0, 10),
  };
};