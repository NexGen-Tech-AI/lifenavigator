'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  HomeIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  StarIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Appointment {
  id: string;
  patientName?: string;
  doctor: string;
  doctorPhoto?: string;
  specialty: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  virtualLink?: string;
  phoneNumber?: string;
  reason: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  remindersSent: boolean;
  insuranceVerified: boolean;
  copay?: number;
  rating?: number;
  followUpRequired?: boolean;
  prescriptions?: string[];
  documents?: { name: string; type: string; url: string }[];
  preparationInstructions?: string;
  waitTime?: number; // in minutes
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photo?: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  locations: string[];
  languages: string[];
  insuranceAccepted: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const specialties = [
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology'
];

const appointmentTypes = [
  { value: 'in-person', label: 'In-Person Visit', icon: UserIcon },
  { value: 'video', label: 'Video Consultation', icon: VideoCameraIcon },
  { value: 'phone', label: 'Phone Consultation', icon: PhoneIcon }
];

export default function AdvancedAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    type: 'in-person' as 'in-person' | 'video' | 'phone',
    reason: '',
    notes: '',
    preparationInstructions: ''
  });

  useEffect(() => {
    fetchAppointmentsData();
  }, []);

  const fetchAppointmentsData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock appointments
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctor: 'Dr. Emily Smith',
        doctorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        specialty: 'Primary Care',
        date: '2025-06-28',
        time: '10:30 AM',
        duration: 30,
        type: 'in-person',
        location: 'HealthFirst Medical Center, Suite 302',
        reason: 'Annual Physical Examination',
        notes: 'Please fast for 12 hours before appointment',
        status: 'confirmed',
        remindersSent: true,
        insuranceVerified: true,
        copay: 25,
        preparationInstructions: 'Fast for 12 hours. Bring list of current medications.'
      },
      {
        id: '2',
        doctor: 'Dr. Michael Chen',
        doctorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        specialty: 'Cardiology',
        date: '2025-07-05',
        time: '2:00 PM',
        duration: 45,
        type: 'video',
        virtualLink: 'https://meet.healthfirst.com/dr-chen-1234',
        reason: 'Follow-up: Blood Pressure Management',
        status: 'scheduled',
        remindersSent: false,
        insuranceVerified: true,
        copay: 40,
        followUpRequired: true
      },
      {
        id: '3',
        doctor: 'Dr. Sarah Johnson',
        doctorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        specialty: 'Dermatology',
        date: '2025-06-15',
        time: '11:00 AM',
        duration: 20,
        type: 'in-person',
        location: 'Downtown Medical Plaza, Room 205',
        reason: 'Skin Condition Follow-up',
        status: 'completed',
        remindersSent: true,
        insuranceVerified: true,
        copay: 35,
        rating: 5,
        prescriptions: ['Hydrocortisone Cream 2.5%', 'Moisturizing Lotion'],
        documents: [
          { name: 'Visit Summary', type: 'pdf', url: '#' },
          { name: 'Prescription', type: 'pdf', url: '#' }
        ]
      },
      {
        id: '4',
        doctor: 'Dr. Robert Martinez',
        specialty: 'Orthopedics',
        date: '2025-06-20',
        time: '3:30 PM',
        duration: 30,
        type: 'phone',
        phoneNumber: '(555) 123-4567',
        reason: 'Post-Surgery Check-in',
        status: 'cancelled',
        remindersSent: true,
        insuranceVerified: false,
        notes: 'Patient cancelled due to scheduling conflict'
      },
      {
        id: '5',
        doctor: 'Dr. Lisa Wang',
        doctorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        specialty: 'Endocrinology',
        date: '2025-07-10',
        time: '9:00 AM',
        duration: 60,
        type: 'in-person',
        location: 'Medical Arts Building, Floor 3',
        reason: 'Diabetes Management Consultation',
        status: 'scheduled',
        remindersSent: false,
        insuranceVerified: false,
        preparationInstructions: 'Bring glucose monitoring logs from past 3 months'
      }
    ];

    // Mock doctors
    const mockDoctors: Doctor[] = [
      {
        id: '1',
        name: 'Dr. Emily Smith',
        specialty: 'Primary Care',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        rating: 4.8,
        reviewCount: 245,
        nextAvailable: '2025-06-30',
        locations: ['HealthFirst Medical Center', 'Westside Clinic'],
        languages: ['English', 'Spanish'],
        insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth']
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        specialty: 'Cardiology',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        rating: 4.9,
        reviewCount: 189,
        nextAvailable: '2025-07-02',
        locations: ['Heart & Vascular Center'],
        languages: ['English', 'Mandarin'],
        insuranceAccepted: ['Blue Cross', 'Medicare', 'Cigna']
      },
      {
        id: '3',
        name: 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        rating: 4.7,
        reviewCount: 312,
        nextAvailable: '2025-06-28',
        locations: ['Downtown Medical Plaza', 'Skin Health Center'],
        languages: ['English'],
        insuranceAccepted: ['Aetna', 'Cigna', 'Humana']
      }
    ];

    setAppointments(mockAppointments);
    setDoctors(mockDoctors);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'no-show': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'in-person': <UserIcon className="h-5 w-5" />,
      'video': <VideoCameraIcon className="h-5 w-5" />,
      'phone': <PhoneIcon className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons];
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesType = filterType === 'all' || apt.type === filterType;
    const matchesSearch = searchTerm === '' || 
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const upcomingAppointments = filteredAppointments
    .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = filteredAppointments
    .filter(apt => new Date(apt.date) < new Date() || apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your healthcare appointments</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming</h3>
            <CalendarIcon className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {upcomingAppointments.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next 30 days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</h3>
            <ClockIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {upcomingAppointments.filter(apt => {
              const aptDate = new Date(apt.date);
              const weekFromNow = new Date();
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              return aptDate <= weekFromNow;
            }).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scheduled</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
            <CheckIcon className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {appointments.filter(apt => apt.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This year</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Wait Time</h3>
            <ClockIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minutes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      {/* Appointments List/Calendar View */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Appointments
              </h2>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {appointment.doctorPhoto ? (
                          <img
                            src={appointment.doctorPhoto}
                            alt={appointment.doctor}
                            className="w-16 h-16 rounded-full"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {appointment.doctor}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              {getTypeIcon(appointment.type)}
                              <span className="text-sm">{appointment.type}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {appointment.specialty}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {appointment.reason}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {appointment.time} ({appointment.duration} min)
                            </div>
                            {appointment.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                {appointment.location}
                              </div>
                            )}
                            {appointment.copay && (
                              <div className="flex items-center gap-1">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                Copay: ${appointment.copay}
                              </div>
                            )}
                          </div>
                          {appointment.preparationInstructions && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Preparation:</strong> {appointment.preparationInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          View Details
                        </button>
                        {appointment.type === 'video' && appointment.virtualLink && (
                          <a
                            href={appointment.virtualLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                          >
                            Join Video
                          </a>
                        )}
                        {appointment.status === 'scheduled' && (
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        {appointment.remindersSent ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <BellIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {appointment.remindersSent ? 'Reminders sent' : 'Set reminder'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.insuranceVerified ? (
                          <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {appointment.insuranceVerified ? 'Insurance verified' : 'Verify insurance'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Past Appointments
              </h2>
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {appointment.doctorPhoto ? (
                          <img
                            src={appointment.doctorPhoto}
                            alt={appointment.doctor}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {appointment.doctor}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            {appointment.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarIconSolid
                                    key={i}
                                    className={`h-4 w-4 ${i < appointment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.specialty} • {appointment.reason}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                          {appointment.documents && appointment.documents.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-blue-600 dark:text-blue-400">
                                {appointment.documents.length} documents available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          View Details
                        </button>
                        {!appointment.rating && appointment.status === 'completed' && (
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Rate Visit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Calendar View (simplified for this example)
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Calendar View
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Calendar view is coming soon. Use list view for now.
            </p>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Schedule New Appointment
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Specialty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Specialty
                  </label>
                  <select
                    value={newAppointment.specialty}
                    onChange={(e) => setNewAppointment({ ...newAppointment, specialty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Choose a specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection */}
                {newAppointment.specialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Doctor
                    </label>
                    <div className="space-y-3">
                      {doctors
                        .filter(doc => doc.specialty === newAppointment.specialty)
                        .map(doctor => (
                          <div
                            key={doctor.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              newAppointment.doctor === doctor.name
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setNewAppointment({ ...newAppointment, doctor: doctor.name })}
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={doctor.photo}
                                alt={doctor.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {doctor.name}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIconSolid
                                        key={i}
                                        className={`h-3 w-3 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                    <span>{doctor.rating} ({doctor.reviewCount})</span>
                                  </div>
                                  <span>Next: {new Date(doctor.nextAvailable).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {doctor.locations.join(' • ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Appointment Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {appointmentTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewAppointment({ ...newAppointment, type: type.value as any })}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          newAppointment.type === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <type.icon className="h-6 w-6" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <select
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="9:30 AM">9:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="2:30 PM">2:30 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="3:30 PM">3:30 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="4:30 PM">4:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                    placeholder="e.g., Annual checkup, Follow-up, New symptoms"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    rows={3}
                    placeholder="Any specific concerns or information for the doctor"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle appointment scheduling
                  setShowScheduleModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Appointment Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-start gap-4">
                  {selectedAppointment.doctorPhoto ? (
                    <img
                      src={selectedAppointment.doctorPhoto}
                      alt={selectedAppointment.doctor}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedAppointment.doctor}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedAppointment.specialty}</p>
                    {selectedAppointment.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-4 w-4 ${i < selectedAppointment.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedAppointment.time} ({selectedAppointment.duration} minutes)
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h4>
                    <div className="mt-1 flex items-center gap-2">
                      {getTypeIcon(selectedAppointment.type)}
                      <span className="text-gray-900 dark:text-white capitalize">
                        {selectedAppointment.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location/Connection Info */}
                {selectedAppointment.location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{selectedAppointment.location}</p>
                  </div>
                )}

                {selectedAppointment.virtualLink && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Video Link</h4>
                    <a
                      href={selectedAppointment.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Join Video Call
                    </a>
                  </div>
                )}

                {/* Reason & Notes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Visit</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedAppointment.reason}</p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.preparationInstructions && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Preparation Instructions
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {selectedAppointment.preparationInstructions}
                    </p>
                  </div>
                )}

                {/* Documents */}
                {selectedAppointment.documents && selectedAppointment.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Documents
                    </h4>
                    <div className="space-y-2">
                      {selectedAppointment.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{doc.name}</span>
                          </div>
                          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Prescriptions
                    </h4>
                    <ul className="space-y-1">
                      {selectedAppointment.prescriptions.map((prescription, index) => (
                        <li key={index} className="text-gray-900 dark:text-white">
                          • {prescription}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      Cancel Appointment
                    </button>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      Reschedule
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <PrinterIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}