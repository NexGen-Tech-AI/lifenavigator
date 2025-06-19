'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, CheckCircle, Users, Shield, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PilotApplicationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    expectedUsers: '1'
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Submit pilot application
      const { error } = await supabase
        .from('pilot_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          company: formData.company || null,
          use_case: formData.useCase,
          expected_users: parseInt(formData.expectedUsers),
          status: 'PENDING'
        })
      
      if (error) throw error
      
      // Redirect to success page
      router.push('/pilot-program/success')
    } catch (error) {
      console.error('Application error:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const benefits = [
    {
      icon: Rocket,
      title: 'Early Access',
      description: 'Be among the first to use our premium features'
    },
    {
      icon: Shield,
      title: 'Free Premium Features',
      description: 'Access Plaid integration and AI insights at no cost'
    },
    {
      icon: Users,
      title: 'Direct Feedback Channel',
      description: 'Shape the product with your feedback'
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: 'Get dedicated support from our team'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join the LifeNavigator Pilot Program
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get exclusive early access to premium features and help shape the future of personal finance management
          </p>
        </div>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <benefit.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Application Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Apply for the Pilot Program
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How do you plan to use LifeNavigator? *
              </label>
              <textarea
                required
                rows={4}
                value={formData.useCase}
                onChange={(e) => setFormData({...formData, useCase: e.target.value})}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us about your financial management needs and what features you're most excited about..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Number of Users
              </label>
              <select
                value={formData.expectedUsers}
                onChange={(e) => setFormData({...formData, expectedUsers: e.target.value})}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">Just me</option>
                <option value="2-5">2-5 users</option>
                <option value="6-10">6-10 users</option>
                <option value="11+">More than 10</option>
              </select>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>What happens next?</strong> We'll review your application within 24-48 hours. 
                If approved, you'll receive an email with your access code and instructions to get started.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
        
        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                How long is the pilot program?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                The pilot program runs for 6 months, with the possibility of extension based on participation and feedback.
              </p>
            </details>
            
            <details className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                What features are included?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Pilot users get access to Plaid bank connections (up to 3 accounts), AI-powered insights (10/month), 
                extended document storage (100 files), and all features from the free tier.
              </p>
            </details>
            
            <details className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                Will I be charged after the pilot?
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                No charges during the pilot period. After the pilot ends, you'll have the option to continue 
                with a special discount for pilot participants or downgrade to the free tier.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}