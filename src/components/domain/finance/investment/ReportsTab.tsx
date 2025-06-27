'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, PieChart, TrendingUp, BarChart3, FileSpreadsheet } from 'lucide-react';

interface ReportsTabProps {
  portfolio: any;
}

export default function ReportsTab({ portfolio }: ReportsTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [selectedReportType, setSelectedReportType] = useState('performance');

  const reportTypes = [
    {
      id: 'performance',
      name: 'Performance Summary',
      description: 'Portfolio returns, benchmarks, and attribution analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      format: ['PDF', 'Excel']
    },
    {
      id: 'tax',
      name: 'Tax Documents',
      description: '1099s, realized gains/losses, and tax optimization report',
      icon: <FileText className="w-5 h-5" />,
      format: ['PDF']
    },
    {
      id: 'transactions',
      name: 'Transaction History',
      description: 'Complete record of all trades, dividends, and fees',
      icon: <BarChart3 className="w-5 h-5" />,
      format: ['PDF', 'CSV', 'Excel']
    },
    {
      id: 'holdings',
      name: 'Holdings Report',
      description: 'Detailed breakdown of all positions and allocations',
      icon: <PieChart className="w-5 h-5" />,
      format: ['PDF', 'Excel']
    },
    {
      id: 'planning',
      name: 'Financial Planning Report',
      description: 'Goals progress, projections, and recommendations',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      format: ['PDF']
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q3 2024 Performance Summary',
      type: 'performance',
      date: '2024-10-01',
      size: '2.4 MB',
      status: 'ready'
    },
    {
      id: 2,
      name: '2023 Tax Documents',
      type: 'tax',
      date: '2024-02-15',
      size: '5.1 MB',
      status: 'ready'
    },
    {
      id: 3,
      name: 'September 2024 Statement',
      type: 'monthly',
      date: '2024-10-05',
      size: '1.8 MB',
      status: 'ready'
    },
    {
      id: 4,
      name: 'YTD Transaction History',
      type: 'transactions',
      date: '2024-10-15',
      size: '3.2 MB',
      status: 'ready'
    }
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Monthly Performance Report',
      frequency: 'Monthly',
      nextRun: '2024-11-01',
      recipients: 'john.doe@email.com',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Quarterly Holdings Summary',
      frequency: 'Quarterly',
      nextRun: '2025-01-01',
      recipients: 'john.doe@email.com, advisor@wealth.com',
      format: 'Excel'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGenerateReport = (reportType: string, format: string) => {
    // In a real app, this would trigger report generation
    console.log(`Generating ${reportType} report in ${format} format`);
  };

  const handleDownloadReport = (reportId: number) => {
    // In a real app, this would download the report
    console.log(`Downloading report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Reports</h3>
        
        {/* Period Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Period</label>
          <div className="flex gap-2 flex-wrap">
            {['mtd', 'qtd', 'ytd', '1y', '3y', '5y', 'custom'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => (
            <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    {report.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{report.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {report.format.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleGenerateReport(report.id, format)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Report Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Size</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{report.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(report.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{report.size}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Reports</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Schedule New Report
          </button>
        </div>
        <div className="space-y-4">
          {scheduledReports.map((report) => (
            <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{report.name}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Frequency: <span className="font-medium">{report.frequency}</span></p>
                    <p>Next Run: <span className="font-medium">{formatDate(report.nextRun)}</span></p>
                    <p>Recipients: <span className="font-medium">{report.recipients}</span></p>
                    <p>Format: <span className="font-medium">{report.format}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Edit</button>
                  <button className="text-red-600 dark:text-red-400 hover:underline text-sm">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Report Builder</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create custom reports with specific metrics and visualizations tailored to your needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Name</label>
            <input
              type="text"
              placeholder="My Custom Report"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Include Sections</label>
          <div className="space-y-2">
            {['Performance Summary', 'Holdings Analysis', 'Transaction History', 'Risk Metrics', 'Tax Summary'].map((section) => (
              <label key={section} className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300 dark:border-gray-600" defaultChecked />
                <span className="text-sm text-gray-700 dark:text-gray-300">{section}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Generate Custom Report
        </button>
      </div>
    </div>
  );
}