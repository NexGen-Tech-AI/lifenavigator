'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { 
  User,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  Target,
  Stethoscope,
  Pill,
  Building,
  Award,
  Loader2,
  Save,
  ArrowLeft
} from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, profile } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  // Profile data state
  const [profileData, setProfileData] = useState({
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
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load user profile data
      const response = await fetch('/api/v1/profile')
      if (response.ok) {
        const data = await response.json()
        
        // Map the data to our form structure
        setProfileData({
          personalInfo: {
            firstName: data.profile?.first_name || '',
            lastName: data.profile?.last_name || '',
            dateOfBirth: data.profile?.date_of_birth || '',
            phone: data.profile?.primary_phone || '',
            address: data.profile?.primary_address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US'
            }
          },
          financialProfile: data.onboardingData?.financialProfile || {
            monthlyIncome: '',
            monthlyExpenses: '',
            savingsGoal: '',
            incomeSource: '',
            employmentStatus: ''
          },
          healthProfile: data.onboardingData?.healthProfile || {
            primaryDoctor: '',
            insuranceProvider: '',
            medications: [],
            allergies: [],
            chronicConditions: []
          },
          careerProfile: data.onboardingData?.careerProfile || {
            currentJobTitle: '',
            employer: '',
            industry: '',
            skills: [],
            careerGoals: ''
          },
          educationProfile: data.onboardingData?.educationProfile || {
            highestDegree: '',
            fieldOfStudy: '',
            currentlyStudying: '',
            certifications: [],
            learningGoals: ''
          }
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!profileData.personalInfo.firstName) {
      newErrors.firstName = 'First name is required'
    }
    if (!profileData.personalInfo.lastName) {
      newErrors.lastName = 'Last name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsSaving(true)
    setSuccessMessage('')
    
    try {
      const response = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      setSuccessMessage('Profile updated successfully!')
      
      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information and preferences
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={profileData.personalInfo.firstName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, firstName: e.target.value }
                })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.firstName ? 'border-red-500' : 'dark:border-gray-600'
                }`}
              />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={profileData.personalInfo.lastName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, lastName: e.target.value }
                })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.lastName ? 'border-red-500' : 'dark:border-gray-600'
                }`}
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
                value={profileData.personalInfo.dateOfBirth}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, dateOfBirth: e.target.value }
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
                value={profileData.personalInfo.phone}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, phone: e.target.value }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Financial Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Income
              </label>
              <input
                type="number"
                value={profileData.financialProfile.monthlyIncome}
                onChange={(e) => setProfileData({
                  ...profileData,
                  financialProfile: { ...profileData.financialProfile, monthlyIncome: e.target.value }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Expenses
              </label>
              <input
                type="number"
                value={profileData.financialProfile.monthlyExpenses}
                onChange={(e) => setProfileData({
                  ...profileData,
                  financialProfile: { ...profileData.financialProfile, monthlyExpenses: e.target.value }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="3500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Target className="w-4 h-4 inline mr-1" />
                Savings Goal
              </label>
              <textarea
                value={profileData.financialProfile.savingsGoal}
                onChange={(e) => setProfileData({
                  ...profileData,
                  financialProfile: { ...profileData.financialProfile, savingsGoal: e.target.value }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder="What are you saving for?"
              />
            </div>
          </div>
        </div>

        {/* Health Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2" />
            Health Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Doctor
              </label>
              <input
                type="text"
                value={profileData.healthProfile.primaryDoctor}
                onChange={(e) => setProfileData({
                  ...profileData,
                  healthProfile: { ...profileData.healthProfile, primaryDoctor: e.target.value }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Dr. Smith"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Pill className="w-4 h-4 inline mr-1" />
                Medications
              </label>
              <textarea
                value={profileData.healthProfile.medications.join(', ')}
                onChange={(e) => setProfileData({
                  ...profileData,
                  healthProfile: { 
                    ...profileData.healthProfile, 
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
                value={profileData.healthProfile.allergies.join(', ')}
                onChange={(e) => setProfileData({
                  ...profileData,
                  healthProfile: { 
                    ...profileData.healthProfile, 
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Peanuts, Penicillin"
              />
            </div>
          </div>
        </div>

        {/* Career Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Career Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Job Title
                </label>
                <input
                  type="text"
                  value={profileData.careerProfile.currentJobTitle}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    careerProfile: { ...profileData.careerProfile, currentJobTitle: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employer
                </label>
                <input
                  type="text"
                  value={profileData.careerProfile.employer}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    careerProfile: { ...profileData.careerProfile, employer: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Company name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skills
              </label>
              <input
                type="text"
                value={profileData.careerProfile.skills.join(', ')}
                onChange={(e) => setProfileData({
                  ...profileData,
                  careerProfile: { 
                    ...profileData.careerProfile, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., JavaScript, Project Management"
              />
            </div>
          </div>
        </div>

        {/* Education Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Education Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Highest Degree
                </label>
                <select
                  value={profileData.educationProfile.highestDegree}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    educationProfile: { ...profileData.educationProfile, highestDegree: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select degree</option>
                  <option value="high_school">High School</option>
                  <option value="associates">Associate's</option>
                  <option value="bachelors">Bachelor's</option>
                  <option value="masters">Master's</option>
                  <option value="doctorate">Doctorate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={profileData.educationProfile.fieldOfStudy}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    educationProfile: { ...profileData.educationProfile, fieldOfStudy: e.target.value }
                  })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Computer Science"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Certifications
              </label>
              <input
                type="text"
                value={profileData.educationProfile.certifications.join(', ')}
                onChange={(e) => setProfileData({
                  ...profileData,
                  educationProfile: { 
                    ...profileData.educationProfile, 
                    certifications: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  }
                })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., PMP, AWS Certified"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}