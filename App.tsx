import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarHeader } from './components/CalendarHeader';
import { DayDetails } from './components/DayDetails';
import { fetchMonthlyEcoEvents } from './services/geminiService';
import { EcoEvent } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Initialize for year 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 1));
  const [events, setEvents] = useState<EcoEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const fetchedEvents = await fetchMonthlyEcoEvents(year, month);
      setEvents(fetchedEvents);
      setLoadingEvents(false);
    };
    
    loadEvents();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  return (
    // Removed min-h-screen to fit GetCourse blocks better. Added w-full.
    <div className="w-full bg-slate-100 font-sans text-slate-900 flex justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-200">
        
        {/* Left Side: Calendar Grid */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          <CalendarHeader 
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          
          <div className="p-4 sm:p-6 flex-1 flex flex-col bg-white">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map((day, idx) => (
                <div key={day} className={`text-center text-xs font-bold uppercase tracking-wider ${idx >= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {calendarDays.map((day, dayIdx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = events.filter(e => e.date === dateKey);
                const reportingEvents = dayEvents.filter(e => e.category === 'reporting');
                const hasReporting = reportingEvents.length > 0;
                const hasHoliday = dayEvents.some(e => e.category === 'holiday');
                
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day) && day.getFullYear() === 2026;

                // Dynamic styling classes
                let bgClass = 'bg-white';
                if (!isCurrentMonth) bgClass = 'bg-slate-50';
                if (isSelected) bgClass = 'bg-white ring-2 ring-emerald-500 z-10';
                
                let textClass = 'text-slate-700';
                if (!isCurrentMonth) textClass = 'text-slate-300';
                
                let borderClass = 'border-slate-100';
                if (hasReporting && !isSelected && isCurrentMonth) borderClass = 'border-rose-200 bg-rose-50/30';

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative flex flex-col items-start justify-start p-2 rounded-lg transition-all duration-200
                      border outline-none min-h-[80px]
                      ${bgClass} ${textClass} ${borderClass}
                      ${!isSelected ? 'hover:border-emerald-300 hover:shadow-sm' : 'shadow-md'}
                    `}
                  >
                    <div className="flex justify-between w-full items-center mb-1">
                      <span className={`
                        text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                        ${isSelected ? 'bg-emerald-600 text-white' : ''}
                        ${!isSelected && isTodayDate ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${!isSelected && !isTodayDate && hasReporting && isCurrentMonth ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-1 overflow-hidden">
                      {loadingEvents && isCurrentMonth && dayIdx === 10 ? (
                         <Loader2 className="w-4 h-4 animate-spin text-slate-300 mx-auto mt-1" />
                      ) : (
                        <div className="flex flex-col gap-1 w-full">
                           {reportingEvents.slice(0, 2).map((ev, i) => (
                             <div key={`rep-${i}`} className="text-[9px] leading-none truncate px-1 py-1 rounded w-full text-left bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                               {ev.title}
                             </div>
                           ))}
                           
                           {/* Show holiday if space permits */}
                           {!hasReporting && dayEvents.filter(e => e.category !== 'reporting').slice(0, 2).map((ev, i) => (
                             <div key={`hol-${i}`} className="text-[9px] leading-none truncate px-1 py-1 rounded w-full text-left bg-emerald-50 text-emerald-700 border border-emerald-100">
                               {ev.title}
                             </div>
                           ))}
                           
                           {(dayEvents.length > (hasReporting ? Math.min(reportingEvents.length, 2) : 2)) && (
                             <div className="flex justify-center">
                               <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Details Panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 h-[500px] lg:h-auto">
          <DayDetails selectedDate={selectedDate} events={events} />
        </div>

      </div>
    </div>
  );
};

export default App;