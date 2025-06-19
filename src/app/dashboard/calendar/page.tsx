'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import CalendarMonthView from '@/components/calendar/CalendarMonthView';
import CalendarWeekView from '@/components/calendar/CalendarWeekView';
import CalendarDayView from '@/components/calendar/CalendarDayView';
import CalendarSidebar from '@/components/calendar/CalendarSidebar';
import EventModal from '@/components/calendar/EventModal';
import { CalendarEvent, CalendarSource } from '@/types/calendar';
import { addDays, format, parse, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { Settings, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// Default calendar sources for users without integrations
const defaultCalendarSources: CalendarSource[] = [
  { id: 'local-personal', name: 'Personal', color: '#3b82f6', isEnabled: true },
  { id: 'local-work', name: 'Work', color: '#10b981', isEnabled: true },
  { id: 'local-family', name: 'Family', color: '#f59e0b', isEnabled: true },
  { id: 'local-health', name: 'Health', color: '#ef4444', isEnabled: true },
  { id: 'local-finance', name: 'Finance', color: '#8b5cf6', isEnabled: true }
];

// Mock events generator
const generateMockEvents = (): CalendarEvent[] => {
  const today = new Date();
  const startOfMonthDate = startOfMonth(today);
  const endOfMonthDate = endOfMonth(today);
  const startDate = startOfWeek(startOfMonthDate);
  const endDate = endOfWeek(endOfMonthDate);
  
  const events: CalendarEvent[] = [];
  const eventTypes = [
    { title: 'Meet with Financial Advisor', calendar: 'Finance', duration: 60 },
    { title: 'Doctor Appointment', calendar: 'Health', duration: 45 },
    { title: 'Team Meeting', calendar: 'Work', duration: 60 },
    { title: 'Weekly Planning', calendar: 'Personal', duration: 30 },
    { title: 'Family Dinner', calendar: 'Family', duration: 120 },
    { title: 'Budget Review', calendar: 'Finance', duration: 45 },
    { title: 'Workout', calendar: 'Health', duration: 60 },
    { title: 'Project Deadline', calendar: 'Work', duration: 0 },
    { title: 'Grocery Shopping', calendar: 'Personal', duration: 60 },
    { title: 'Kids School Event', calendar: 'Family', duration: 90 }
  ];
  
  // Calendar source lookup for colors
  const calendarSourceMap = defaultCalendarSources.reduce((acc: Record<string, CalendarSource>, source: CalendarSource) => {
    acc[source.name] = source;
    return acc;
  }, {} as Record<string, CalendarSource>);
  
  // Generate 50 random events across the current month view
  for (let i = 0; i < 50; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const daysToAdd = Math.floor(Math.random() * 35); // Events across ~5 weeks
    const startHour = 8 + Math.floor(Math.random() * 10); // Events between 8am and 6pm
    const startMinute = Math.random() < 0.5 ? 0 : 30; // Start on hour or half hour
    
    const eventDate = addDays(startDate, daysToAdd);
    
    // Set event time
    eventDate.setHours(startHour);
    eventDate.setMinutes(startMinute);
    eventDate.setSeconds(0);
    eventDate.setMilliseconds(0);
    
    // Create end time based on duration
    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + eventType.duration);
    
    // Assign a calendar source
    const calendarSource = calendarSourceMap[eventType.calendar];
    
    events.push({
      id: `event-${i}`,
      title: eventType.title,
      start: eventDate.toISOString(),
      end: endDate.toISOString(),
      allDay: eventType.duration === 0,
      calendarId: calendarSource.id,
      color: calendarSource.color,
      description: `This is a mock ${eventType.calendar.toLowerCase()} event.`,
      location: eventType.calendar === 'Work' ? 'Office' : 
                eventType.calendar === 'Health' ? 'Health Center' : 
                eventType.calendar === 'Family' ? 'Home' : ''
    });
  }
  
  return events;
};

// ViewType type definition
type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>(defaultCalendarSources);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasIntegrations, setHasIntegrations] = useState(false);
  
  // Load calendar data on component mount
  useEffect(() => {
    loadCalendarData();
  }, []);
  
  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      // Check for calendar integrations
      const connectionsResponse = await fetch('/api/v1/calendar/connections');
      if (connectionsResponse.ok) {
        const { connections } = await connectionsResponse.json();
        
        if (connections && connections.length > 0) {
          setHasIntegrations(true);
          
          // Load calendars from integrations
          const calendarsResponse = await fetch('/api/v1/calendar/calendars');
          if (calendarsResponse.ok) {
            const { calendars } = await calendarsResponse.json();
            
            // Convert to CalendarSource format
            const integratedSources: CalendarSource[] = calendars.map((cal: any) => ({
              id: cal.id,
              name: cal.name,
              color: cal.color || '#3b82f6',
              isEnabled: cal.isVisible
            }));
            
            // Combine with default local calendars
            setCalendarSources([...integratedSources, ...defaultCalendarSources]);
          }
          
          // Load events from integrations
          const eventsResponse = await fetch('/api/v1/calendar/events');
          if (eventsResponse.ok) {
            const { events: integratedEvents } = await eventsResponse.json();
            
            // Convert to CalendarEvent format
            const formattedEvents: CalendarEvent[] = integratedEvents.map((event: any) => ({
              id: event.id,
              title: event.title,
              start: event.startDatetime,
              end: event.endDatetime,
              allDay: event.allDay,
              calendarId: event.calendarId,
              color: event.calendarColor || '#3b82f6',
              description: event.description,
              location: event.location
            }));
            
            setEvents(formattedEvents);
          }
        } else {
          // No integrations, use mock data
          setEvents(generateMockEvents());
        }
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      // Fallback to mock data
      setEvents(generateMockEvents());
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSyncCalendars = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/v1/calendar/sync-all', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Reload calendar data after sync
        await loadCalendarData();
      }
    } catch (error) {
      console.error('Failed to sync calendars:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Filter events based on enabled calendar sources
  const filteredEvents = events.filter(event => {
    const source = calendarSources.find(source => source.id === event.calendarId);
    return source && source.isEnabled;
  });
  
  // Helper function to format the date range for the header based on view type
  const getDateRangeText = () => {
    if (viewType === 'day') {
      return format(currentDate, 'MMMM d, yyyy');
    } else if (viewType === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };
  
  // Navigation handlers
  const handlePrevious = () => {
    if (viewType === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };
  
  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Sidebar handlers
  const handleToggleCalendar = (id: string) => {
    setCalendarSources(sources => 
      sources.map(source => 
        source.id === id ? { ...source, isEnabled: !source.isEnabled } : source
      )
    );
  };
  
  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
  };
  
  const handleCreateEvent = () => {
    // Create a new empty event starting at the current hour
    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    const endTime = new Date(now);
    endTime.setHours(now.getHours() + 1);
    
    const newEvent: CalendarEvent = {
      id: `event-new-${Date.now()}`,
      title: '',
      start: now.toISOString(),
      end: endTime.toISOString(),
      allDay: false,
      calendarId: calendarSources[0].id, // Default to first calendar
      color: calendarSources[0].color,
      description: '',
      location: ''
    };
    
    setSelectedEvent(newEvent);
    setShowEventModal(true);
  };
  
  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-64 p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="mb-4">
          <Button 
            variant="default" 
            className="w-full mb-4"
            onClick={handleCreateEvent}
          >
            Create Event
          </Button>
          
          <CalendarSidebar 
            calendarSources={calendarSources}
            onToggleCalendar={handleToggleCalendar}
          />
          
          {/* Integration Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {hasIntegrations ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSyncCalendars}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Calendars'}
                </Button>
                <Link href="/dashboard/settings/integrations">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Integrations
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Connect your calendars to sync all your events in one place
                </p>
                <Link href="/dashboard/settings/integrations">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                  >
                    Connect Calendars
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{getDateRangeText()}</h1>
            <div className="ml-4">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex rounded-md shadow-sm">
              <Button variant="outline" onClick={handlePrevious}>
                &larr;
              </Button>
              <Button variant="outline" onClick={handleNext}>
                &rarr;
              </Button>
            </div>
            
            <div className="flex rounded-md shadow-sm">
              <Button 
                variant={viewType === 'month' ? 'default' : 'outline'} 
                onClick={() => setViewType('month')}
              >
                Month
              </Button>
              <Button 
                variant={viewType === 'week' ? 'default' : 'outline'} 
                onClick={() => setViewType('week')}
              >
                Week
              </Button>
              <Button 
                variant={viewType === 'day' ? 'default' : 'outline'} 
                onClick={() => setViewType('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
        
        {/* Calendar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewType === 'month' && (
            <CalendarMonthView 
              events={filteredEvents} 
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
          
          {viewType === 'week' && (
            <CalendarWeekView 
              events={filteredEvents} 
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
          
          {viewType === 'day' && (
            <CalendarDayView 
              events={filteredEvents} 
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>
      
      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          calendarSources={calendarSources}
          onClose={handleCloseModal}
          onSave={(updatedEvent) => {
            // For new events
            if (!events.find(e => e.id === updatedEvent.id)) {
              setEvents([...events, updatedEvent]);
            } else {
              // For existing events
              setEvents(events.map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
              ));
            }
            handleCloseModal();
          }}
          onDelete={(eventId) => {
            setEvents(events.filter(event => event.id !== eventId));
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}