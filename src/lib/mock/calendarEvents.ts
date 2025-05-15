import { addDays, addHours, addMinutes, startOfDay, setHours, setMinutes, subHours } from 'date-fns';
import { CalendarEvent, CalendarSource } from '@/types/calendar';

// Calendar sources
export const mockCalendarSources: CalendarSource[] = [
  { id: '1', name: 'Personal', color: '#3b82f6', isEnabled: true },
  { id: '2', name: 'Work', color: '#10b981', isEnabled: true },
  { id: '3', name: 'Family', color: '#f59e0b', isEnabled: true },
  { id: '4', name: 'Health', color: '#ef4444', isEnabled: true },
  { id: '5', name: 'Finance', color: '#8b5cf6', isEnabled: true }
];

// Helper function to create events
const createEvent = (
  id: string,
  title: string,
  startDate: Date,
  durationMinutes: number,
  calendarId: string,
  allDay: boolean = false,
  description: string = '',
  location: string = ''
): CalendarEvent => {
  const calendarSource = mockCalendarSources.find(source => source.id === calendarId);
  
  return {
    id,
    title,
    start: startDate.toISOString(),
    end: addMinutes(startDate, durationMinutes).toISOString(),
    allDay,
    calendarId,
    color: calendarSource?.color || '#3b82f6',
    description,
    location
  };
};

// Generate today's events
export const getTodayEvents = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  
  // Create a mix of past, current, and upcoming events for today
  return [
    // Past events
    createEvent(
      'event-1',
      'Morning Workout',
      setHours(setMinutes(startOfToday, 0), 7),
      60,
      '4',
      false,
      'Daily exercise routine',
      'Home Gym'
    ),
    
    createEvent(
      'event-2',
      'Team Standup',
      setHours(setMinutes(startOfToday, 0), 9),
      30,
      '2',
      false,
      'Daily team sync meeting',
      'Zoom Meeting'
    ),
    
    // Current event (adjust this based on the current time when testing)
    createEvent(
      'event-3',
      'Project Review',
      subHours(today, 1), // Started 1 hour ago
      180, // 3 hours long
      '2',
      false,
      'Q2 project milestone review',
      'Conference Room A'
    ),
    
    // Upcoming events
    createEvent(
      'event-4',
      'Lunch with Client',
      setHours(setMinutes(startOfToday, 0), 13),
      90,
      '2',
      false,
      'Business development lunch',
      'Riverside Cafe'
    ),
    
    createEvent(
      'event-5',
      'Financial Advisor Meeting',
      setHours(setMinutes(startOfToday, 0), 15),
      60,
      '5',
      false,
      'Quarterly portfolio review',
      'Virtual Meeting'
    ),
    
    createEvent(
      'event-6',
      'Pick up kids from school',
      setHours(setMinutes(startOfToday, 0), 17),
      30,
      '3',
      false,
      '',
      'Lincoln Elementary School'
    ),
    
    createEvent(
      'event-7',
      'Family Dinner',
      setHours(setMinutes(startOfToday, 0), 19),
      90,
      '3',
      false,
      'Weekly family dinner',
      'Home'
    )
  ];
};

// Generate upcoming events for the week
export const getUpcomingEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [...getTodayEvents()];
  
  // Tomorrow's events
  events.push(
    createEvent(
      'event-8',
      'Doctor Appointment',
      setHours(setMinutes(addDays(startOfDay(today), 1), 0), 10),
      60,
      '4',
      false,
      'Annual check-up',
      'Medical Center'
    ),
    
    createEvent(
      'event-9',
      'Interview Candidate',
      setHours(setMinutes(addDays(startOfDay(today), 1), 0), 14),
      60,
      '2',
      false,
      'Senior Developer position',
      'Zoom Meeting'
    )
  );
  
  // Day after tomorrow
  events.push(
    createEvent(
      'event-10',
      'Budget Planning',
      setHours(setMinutes(addDays(startOfDay(today), 2), 0), 11),
      120,
      '5',
      false,
      'Q3 budget planning session',
      'Finance Department'
    ),
    
    createEvent(
      'event-11',
      'Team Building',
      setHours(setMinutes(addDays(startOfDay(today), 2), 0), 15),
      180,
      '2',
      false,
      'Quarterly team building event',
      'City Park'
    )
  );
  
  // All-day event
  events.push(
    createEvent(
      'event-12',
      'Company Holiday',
      addDays(startOfDay(today), 3),
      1440, // 24 hours
      '2',
      true,
      'Annual company holiday',
      ''
    )
  );
  
  return events;
};

// Default export all events
export const mockEvents = getUpcomingEvents();