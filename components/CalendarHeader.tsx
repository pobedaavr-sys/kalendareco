import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-6 bg-slate-800 text-white rounded-t-2xl shadow-md relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-slate-700/30 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="flex items-center gap-4 z-10">
        <div className="p-3 bg-slate-700/80 backdrop-blur-sm rounded-xl border border-slate-600 shadow-inner">
          <Briefcase className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold serif capitalize tracking-wide leading-none mb-1">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h2>
          <p className="text-slate-300 text-xs uppercase tracking-wider font-medium">
            Производственный календарь эколога
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 z-10">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-transparent hover:border-slate-600"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-transparent hover:border-slate-600"
          aria-label="Следующий месяц"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};