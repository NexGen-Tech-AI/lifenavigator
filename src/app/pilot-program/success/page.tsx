'use client'

import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PilotSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Thank you for applying to the LifeNavigator Pilot Program
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What happens next?
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Check your email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll review your application within 24-48 hours
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Receive your access code</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If approved, you'll get an access code and setup instructions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Start using premium features</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your bank accounts and explore AI insights
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have questions? Contact us at{' '}
            <a href="mailto:pilot@lifenavigator.ai" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              pilot@lifenavigator.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}