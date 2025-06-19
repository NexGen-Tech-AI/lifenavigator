'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { 
  User, 
  CreditCard, 
  FileText, 
  Sparkles, 
  Check, 
  ChevronRight,
  ChevronLeft,
  Rocket,
  Building2,
  Heart as HeartIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as AcademicCapIcon,
  Upload,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  Target,
  Stethoscope,
  Pill,
  Building,
  Award,
  Loader2
} from 'lucide-react'

type OnboardingStep = 'welcome' | 'personal' | 'financial' | 'health' | 'career' | 'education' | 'documents' | 'tier' | 'complete'

const TIER_BENEFITS = {
  FREE: ['Manual data entry', 'Basic document storage (10/month)', 'Access to basic features', 'Community support'],
  PILOT: ['Everything in Free', 'Bank connections', 'AI insights', 'Priority feedback channel', 'Unlimited documents'],
  PRO: ['Everything in Pilot', 'Healthcare integrations', 'Advanced analytics', 'API access', 'Priority support']
}

export default function EnhancedOnboarding() {
  const router = useRouter()
  const { user, profile } = useUser()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [selectedTier, setSelectedTier] = useState<string>('FREE')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])
  
  // Comprehensive onboarding data
  const [onboardingData, setOnboardingData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    financialProfile: {
      monthlyIncome: '',
      monthlyExpenses: '',
      savingsGoal: '',
      incomeSource: '',
      employmentStatus: ''
    },
    healthProfile: {
      primaryDoctor: '',
      insuranceProvider: '',
      medications: [] as string[],
      allergies: [] as string[],
      chronicConditions: [] as string[]
    },
    careerProfile: {
      currentJobTitle: '',
      employer: '',
      industry: '',
      skills: [] as string[],
      careerGoals: ''
    },
    educationProfile: {
      highestDegree: '',
      fieldOfStudy: '',
      currentlyStudying: '',
      certifications: [] as string[],
      learningGoals: ''
    }
  })

  useEffect(() => {
    if (profile?.onboarding_completed) {
      router.push('/dashboard')
    }
    
    // Load saved progress
    loadOnboardingProgress()
  }, [profile, router])
  
  const loadOnboardingProgress = async () => {
    try {
      const response = await fetch('/api/v1/onboarding/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setCurrentStep(data.progress.current_step || 'welcome')
          // Load saved data from progress
          if (data.progress.personal_info) {
            setOnboardingData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, ...data.progress.personal_info }
            }))
          }
          if (data.progress.financial_profile) {
            setOnboardingData(prev => ({
              ...prev,
              financialProfile: { ...prev.financialProfile, ...data.progress.financial_profile }
            }))
          }
          // Load other profiles similarly
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const validateStep = (step: OnboardingStep): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 'personal':
        if (!onboardingData.personalInfo.firstName) newErrors.firstName = 'First name is required'
        if (!onboardingData.personalInfo.lastName) newErrors.lastName = 'Last name is required'
        break
      case 'financial':
        if (onboardingData.financialProfile.monthlyIncome && isNaN(Number(onboardingData.financialProfile.monthlyIncome))) {
          newErrors.monthlyIncome = 'Must be a valid number'
        }
        if (onboardingData.financialProfile.monthlyExpenses && isNaN(Number(onboardingData.financialProfile.monthlyExpenses))) {
          newErrors.monthlyExpenses = 'Must be a valid number'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const saveProgress = async (step: string, data: any, completed: boolean = false) => {
    try {
      const response = await fetch('/api/v1/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: step,
          stepData: data,
          completed
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save progress')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }
  
  const handleStepSubmit = async (nextStep: OnboardingStep) => {
    if (!validateStep(currentStep)) return
    
    setIsLoading(true)
    try {
      // Save current step data
      const stepDataMap = {
        personal: { type: 'personal_info', data: onboardingData.personalInfo },
        financial: { type: 'financial_profile', data: onboardingData.financialProfile },
        health: { type: 'health_profile', data: onboardingData.healthProfile },
        career: { type: 'career_profile', data: onboardingData.careerProfile },
        education: { type: 'education_profile', data: onboardingData.educationProfile }
      }
      
      const stepInfo = stepDataMap[currentStep as keyof typeof stepDataMap]
      if (stepInfo) {
        await saveProgress(stepInfo.type, stepInfo.data, true)
      }
      
      setCurrentStep(nextStep)
    } catch (error) {
      console.error('Error submitting step:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTierSelection = async () => {
    await saveProgress('tier', { selectedTier }, true)
    
    if (selectedTier === 'PILOT') {
      router.push('/pilot-program/apply')
    } else {
      await completeOnboarding()
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }
      
      setCurrentStep('complete')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipStep = () => {
    const stepOrder: OnboardingStep[] = ['welcome', 'personal', 'financial', 'health', 'career', 'education', 'documents', 'tier', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }
  
  const handlePreviousStep = () => {
    const stepOrder: OnboardingStep[] = ['welcome', 'personal', 'financial', 'health', 'career', 'education', 'documents', 'tier', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedDocuments(prev => [...prev, ...files])
  }

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to LifeNavigator
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Let's personalize your experience in just a few steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <User className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Personal Profile
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tell us about yourself to personalize your experience
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Documents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Securely store and organize your important documents
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Get Started
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Begin tracking your life goals and progress
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentStep('personal')}
              className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )
      
      case 'personal':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Let's start with some basic information about you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.personalInfo.firstName}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    personalInfo: { ...onboardingData.personalInfo, firstName: e.target.value }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.firstName ? 'border-red-500' : 'dark:border-gray-600'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.personalInfo.lastName}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    personalInfo: { ...onboardingData.personalInfo, lastName: e.target.value }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.lastName ? 'border-red-500' : 'dark:border-gray-600'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={onboardingData.personalInfo.dateOfBirth}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    personalInfo: { ...onboardingData.personalInfo, dateOfBirth: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={onboardingData.personalInfo.phone}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    personalInfo: { ...onboardingData.personalInfo, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={onboardingData.personalInfo.address.street}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      personalInfo: {
                        ...onboardingData.personalInfo,
                        address: { ...onboardingData.personalInfo.address, street: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Street Address"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={onboardingData.personalInfo.address.city}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      personalInfo: {
                        ...onboardingData.personalInfo,
                        address: { ...onboardingData.personalInfo.address, city: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={onboardingData.personalInfo.address.state}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      personalInfo: {
                        ...onboardingData.personalInfo,
                        address: { ...onboardingData.personalInfo.address, state: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="State"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={onboardingData.personalInfo.address.zipCode}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      personalInfo: {
                        ...onboardingData.personalInfo,
                        address: { ...onboardingData.personalInfo.address, zipCode: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <select
                    value={onboardingData.personalInfo.address.country}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      personalInfo: {
                        ...onboardingData.personalInfo,
                        address: { ...onboardingData.personalInfo.address, country: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('financial')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )

      case 'financial':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Financial Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Help us understand your financial situation to provide better insights
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    value={onboardingData.financialProfile.monthlyIncome}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      financialProfile: { ...onboardingData.financialProfile, monthlyIncome: e.target.value }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.monthlyIncome ? 'border-red-500' : 'dark:border-gray-600'
                    }`}
                    placeholder="5000"
                  />
                  {errors.monthlyIncome && <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Expenses
                  </label>
                  <input
                    type="number"
                    value={onboardingData.financialProfile.monthlyExpenses}
                    onChange={(e) => setOnboardingData({
                      ...onboardingData,
                      financialProfile: { ...onboardingData.financialProfile, monthlyExpenses: e.target.value }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.monthlyExpenses ? 'border-red-500' : 'dark:border-gray-600'
                    }`}
                    placeholder="3500"
                  />
                  {errors.monthlyExpenses && <p className="text-sm text-red-500 mt-1">{errors.monthlyExpenses}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Status
                </label>
                <select
                  value={onboardingData.financialProfile.employmentStatus}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    financialProfile: { ...onboardingData.financialProfile, employmentStatus: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed Full-time</option>
                  <option value="part-time">Employed Part-time</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Income Source
                </label>
                <input
                  type="text"
                  value={onboardingData.financialProfile.incomeSource}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    financialProfile: { ...onboardingData.financialProfile, incomeSource: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Salary, Business, Investments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Target className="w-4 h-4 inline mr-1" />
                  Savings Goal
                </label>
                <textarea
                  value={onboardingData.financialProfile.savingsGoal}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    financialProfile: { ...onboardingData.financialProfile, savingsGoal: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="What are you saving for? (e.g., Emergency fund, House down payment, Retirement)"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('health')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )

      case 'health':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Health Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Basic health information to help track your wellness journey
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Stethoscope className="w-4 h-4 inline mr-1" />
                  Primary Doctor
                </label>
                <input
                  type="text"
                  value={onboardingData.healthProfile.primaryDoctor}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    healthProfile: { ...onboardingData.healthProfile, primaryDoctor: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={onboardingData.healthProfile.insuranceProvider}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    healthProfile: { ...onboardingData.healthProfile, insuranceProvider: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Pill className="w-4 h-4 inline mr-1" />
                  Current Medications
                </label>
                <textarea
                  value={onboardingData.healthProfile.medications.join(', ')}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    healthProfile: { 
                      ...onboardingData.healthProfile, 
                      medications: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                    }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="List medications separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  value={onboardingData.healthProfile.allergies.join(', ')}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    healthProfile: { 
                      ...onboardingData.healthProfile, 
                      allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                    }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Peanuts, Penicillin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chronic Conditions
                </label>
                <input
                  type="text"
                  value={onboardingData.healthProfile.chronicConditions.join(', ')}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    healthProfile: { 
                      ...onboardingData.healthProfile, 
                      chronicConditions: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Diabetes, Hypertension"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('career')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )

      case 'career':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Career Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Share your professional background and career aspirations
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                  Current Job Title
                </label>
                <input
                  type="text"
                  value={onboardingData.careerProfile.currentJobTitle}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    careerProfile: { ...onboardingData.careerProfile, currentJobTitle: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Employer
                </label>
                <input
                  type="text"
                  value={onboardingData.careerProfile.employer}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    careerProfile: { ...onboardingData.careerProfile, employer: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <select
                  value={onboardingData.careerProfile.industry}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    careerProfile: { ...onboardingData.careerProfile, industry: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Skills
                </label>
                <input
                  type="text"
                  value={onboardingData.careerProfile.skills.join(', ')}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    careerProfile: { 
                      ...onboardingData.careerProfile, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Career Goals
                </label>
                <textarea
                  value={onboardingData.careerProfile.careerGoals}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    careerProfile: { ...onboardingData.careerProfile, careerGoals: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="What are your career aspirations?"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('education')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )

      case 'education':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Education Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about your educational background and learning goals
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                  Highest Degree
                </label>
                <select
                  value={onboardingData.educationProfile.highestDegree}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    educationProfile: { ...onboardingData.educationProfile, highestDegree: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select degree</option>
                  <option value="high_school">High School</option>
                  <option value="associates">Associate's</option>
                  <option value="bachelors">Bachelor's</option>
                  <option value="masters">Master's</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="professional">Professional Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={onboardingData.educationProfile.fieldOfStudy}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    educationProfile: { ...onboardingData.educationProfile, fieldOfStudy: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Computer Science, Business Administration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currently Studying
                </label>
                <input
                  type="text"
                  value={onboardingData.educationProfile.currentlyStudying}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    educationProfile: { ...onboardingData.educationProfile, currentlyStudying: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., MBA, Python Programming, Data Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Award className="w-4 h-4 inline mr-1" />
                  Certifications
                </label>
                <input
                  type="text"
                  value={onboardingData.educationProfile.certifications.join(', ')}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    educationProfile: { 
                      ...onboardingData.educationProfile, 
                      certifications: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., PMP, AWS Certified, CPA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Learning Goals
                </label>
                <textarea
                  value={onboardingData.educationProfile.learningGoals}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    educationProfile: { ...onboardingData.educationProfile, learningGoals: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="What would you like to learn next?"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('documents')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )

      case 'documents':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Documents
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload important documents for secure storage (optional)
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Choose Files
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Uploaded Documents</h3>
                  {uploadedDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Free tier limit:</strong> 10 documents per month. Upgrade to Pro for unlimited storage.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={() => handleStepSubmit('tier')}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip
              </button>
            </div>
          </div>
        )
      
      case 'tier':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose Your Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div
                onClick={() => setSelectedTier('FREE')}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 cursor-pointer transition-all ${
                  selectedTier === 'FREE'
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Free
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">$0</p>
                <ul className="space-y-2 mb-6">
                  {TIER_BENEFITS.FREE.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pilot Tier */}
              <div
                onClick={() => setSelectedTier('PILOT')}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 cursor-pointer transition-all relative ${
                  selectedTier === 'PILOT'
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                    Limited Time
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  Pilot Program
                  <Rocket className="w-4 h-4 ml-2 text-indigo-600" />
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">$0</p>
                <ul className="space-y-2 mb-6">
                  {TIER_BENEFITS.PILOT.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pro Tier */}
              <div
                onClick={() => setSelectedTier('PRO')}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 cursor-pointer transition-all ${
                  selectedTier === 'PRO'
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pro
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  $19.99<span className="text-sm font-normal">/mo</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {TIER_BENEFITS.PRO.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                Back
              </button>
              <button
                onClick={handleTierSelection}
                disabled={isLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedTier === 'PILOT' ? 'Apply for Pilot Program' : 'Complete Setup'}
                  </>
                )}
              </button>
            </div>
          </div>
        )
      
      case 'complete':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
              <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome aboard!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Your account is all set up. Redirecting to your dashboard...
            </p>
            <p className="text-sm text-gray-500">
              You can always update your information in Settings
            </p>
          </div>
        )
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {['welcome', 'personal', 'financial', 'health', 'career', 'education', 'documents', 'tier', 'complete'].map((step, idx) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${
                  idx <= ['welcome', 'personal', 'financial', 'health', 'career', 'education', 'documents', 'tier', 'complete'].indexOf(currentStep)
                    ? 'bg-indigo-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {['welcome', 'personal', 'financial', 'health', 'career', 'education', 'documents', 'tier', 'complete'].indexOf(currentStep) + 1} of 9
            </span>
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}