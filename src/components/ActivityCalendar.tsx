"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, Dumbbell, Heart, Sparkles, ShoppingBag } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

type ActivityType = 'workout' | 'corset' | 'chastity' | 'measurement' | 'shopping' | 'affirmation';

interface CalendarActivity {
    date: number;
    type: ActivityType;
    title: string;
    icon: typeof CalendarIcon;
    color: string;
}

/**
 * Activity Calendar - Visual calendar showing all tracked activities
 */
export function ActivityCalendar() {
    const {
        workoutSessions,
        corsetSessions,
        chastitySessions,
        measurements,
        shoppingLists,
        dailyAffirmations,
    } = useStore();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Compile all activities
    const activities = useMemo(() => {
        const acts: CalendarActivity[] = [];

        // Workouts
        workoutSessions?.forEach(session => {
            acts.push({
                date: session.date,
                type: 'workout',
                title: `Workout Session`,
                icon: Dumbbell,
                color: 'text-blue-600 bg-blue-500/10',
            });
        });

        // Corset sessions
        corsetSessions?.filter(s => s.endDate).forEach(session => {
            acts.push({
                date: session.startDate,
                type: 'corset',
                title: 'Corset Training',
                icon: Heart,
                color: 'text-purple-600 bg-purple-500/10',
            });
        });

        // Chastity starts/ends
        chastitySessions?.forEach(session => {
            acts.push({
                date: session.startDate,
                type: 'chastity',
                title: 'Chastity Started',
                icon: Flame,
                color: 'text-pink-600 bg-pink-500/10',
            });
            if (session.endDate) {
                acts.push({
                    date: session.endDate,
                    type: 'chastity',
                    title: 'Chastity Ended',
                    icon: Flame,
                    color: 'text-pink-600 bg-pink-500/10',
                });
            }
        });

        // Measurements
        measurements?.forEach(m => {
            acts.push({
                date: m.date,
                type: 'measurement',
                title: 'Measurements Logged',
                icon: CalendarIcon,
                color: 'text-emerald-600 bg-emerald-500/10',
            });
        });

        // Shopping
        shoppingLists?.forEach(list => {
            acts.push({
                date: list.dateCreated,
                type: 'shopping',
                title: `Shopping: ${list.name}`,
                icon: ShoppingBag,
                color: 'text-orange-600 bg-orange-500/10',
            });
        });

        // Affirmations
        dailyAffirmations?.forEach(aff => {
            acts.push({
                date: aff.dateAdded,
                type: 'affirmation',
                title: 'Daily Affirmation',
                icon: Sparkles,
                color: 'text-yellow-600 bg-yellow-500/10',
            });
        });

        return acts.sort((a, b) => b.date - a.date);
    }, [workoutSessions, corsetSessions, chastitySessions, measurements, shoppingLists, dailyAffirmations]);

    // Get activities for specific date
    const getActivitiesForDate = (date: Date) => {
        return activities.filter(act => isSameDay(new Date(act.date), date));
    };

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const selectedDayActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Activity Calendar
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold min-w-[140px] text-center">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-background border border-border rounded-xl p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map(day => {
                        const dayActivities = getActivitiesForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    relative aspect-square p-1 rounded-lg border transition-all
                                    ${isCurrentMonth ? 'border-border hover:border-primary/50' : 'border-transparent'}
                                    ${isToday ? 'bg-primary/10 border-primary' : ''}
                                    ${isSelected ? 'ring-2 ring-primary' : ''}
                                    ${!isCurrentMonth ? 'opacity-30' : ''}
                                `}
                            >
                                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                                    {format(day, 'd')}
                                </div>
                                {dayActivities.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 justify-center">
                                        {dayActivities.slice(0, 3).map((act, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-1.5 h-1.5 rounded-full ${act.color.split(' ')[1]}`}
                                            />
                                        ))}
                                        {dayActivities.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground">+{dayActivities.length - 3}</div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Details */}
            {selectedDate && selectedDayActivities.length > 0 && (
                <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-2">
                        {selectedDayActivities.map((act, idx) => {
                            const Icon = act.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${act.color}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <div className="flex-1">
                                        <div className="font-medium">{act.title}</div>
                                        <div className="text-xs opacity-70">{format(act.date, "h:mm a")}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="bg-background/50 border border-border rounded-lg p-4">
                <div className="text-sm font-semibold mb-3">Activity Types</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Workouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-muted-foreground">Corset</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500" />
                        <span className="text-muted-foreground">Chastity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">Measurements</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">Shopping</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">Affirmations</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
