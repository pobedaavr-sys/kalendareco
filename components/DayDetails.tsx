import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { EcoEvent, DailyTip } from '../types';
import { generateDailyEcoTip } from '../services/geminiService';
import { Sparkles, Calendar as CalendarIcon, CheckSquare, RefreshCw, FileText, AlertTriangle, PartyPopper } from 'lucide-react';

interface DayDetailsProps {
  selectedDate: Date;
  events: EcoEvent[];
}

export const DayDetails: React.FC<DayDetailsProps> = ({ selectedDate, events }) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daysEvents = events.filter(e => e.date === dateKey);
  
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTip = useCallback(async () => {
    setLoading(true);
    setTip(null);
    const result = await generateDailyEcoTip(dateKey);
    setTip(result);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'reporting':
        return {
          container: 'bg-rose-50 border-rose-200',
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
          label: 'Срок сдачи отчетности',
          icon: <AlertTriangle className="w-4 h-4" />,
          titleColor: 'text-rose-900'
        };
      case 'holiday':
        return {
          container: 'bg-emerald-50 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          label: 'Праздник / Событие',
          icon: <PartyPopper className="w-4 h-4" />,
          titleColor: 'text-emerald-900'
        };
      default:
        return {
          container: 'bg-white border-slate-200',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Заметка',
          icon: <FileText className="w-4 h-4" />,
          titleColor: 'text-slate-800'
        };
    }
  };

  return (
    <div className="h-full bg-white border-l border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">
            {format(selectedDate, 'yyyy', { locale: ru })}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 serif capitalize">
          {format(selectedDate, 'd MMMM, eeee', { locale: ru })}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Events Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            События и Дедлайны
          </h3>
          
          {daysEvents.length > 0 ? (
            <div className="space-y-3">
              {daysEvents.map((event, idx) => {
                const styles = getCategoryStyles(event.category);
                return (
                  <div key={idx} className={`p-4 rounded-lg border shadow-sm transition-all ${styles.container}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wide ${styles.badge}`}>
                        {styles.icon}
                        {styles.label}
                      </span>
                    </div>
                    <h4 className={`font-bold text-base leading-tight mb-2 ${styles.titleColor}`}>{event.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 text-sm text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              На этот день нет отчетности и праздников
            </div>
          )}
        </div>

        {/* Expert Tip Section */}
        <div className="bg-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Совет Эксперта
            </h3>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-full"></div>
              <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            </div>
          ) : tip ? (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                "{tip.tip}"
              </p>
              
              <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Действие
                </h4>
                <p className="text-white font-medium text-sm">
                  {tip.actionItem}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs text-center">
              Загрузка рекомендаций...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};