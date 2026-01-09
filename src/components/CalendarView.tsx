"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function CalendarView() {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"workout" | "chastity" | "corset" | "milestone" | "event" | "challenge">("event");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newNotes, setNewNotes] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toDateString();
    return calendarEvents.filter((e) => new Date(e.date).toDateString() === dateStr);
  };

  const eventColors = {
    workout: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    chastity: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    corset: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    milestone: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    event: "bg-green-500/20 text-green-400 border-green-500/30",
    challenge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  } as const;

  const handleAddEvent = async () => {
    const dateValue = selectedDay ? selectedDay : new Date(newDate);
    if (!newTitle.trim()) return;

    await addCalendarEvent({
      title: newTitle.trim(),
      type: newType,
      date: dateValue.getTime(),
      notes: newNotes.trim() || undefined,
    });

    setNewTitle("");
    setNewNotes("");
    setShowAddEvent(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <button
          onClick={() => {
            setShowAddEvent((prev) => !prev);
            if (!selectedDay) {
              const today = new Date();
              setSelectedDay(today);
              setNewDate(format(today, "yyyy-MM-dd"));
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showAddEvent ? "Close" : "Add Event"}
        </button>
      </div>

      {showAddEvent && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                placeholder="Event title"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              >
                <option value="event">General Event</option>
                <option value="workout">Workout</option>
                <option value="challenge">Challenge</option>
                <option value="milestone">Milestone</option>
                <option value="chastity">Chastity</option>
                <option value="corset">Corset</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              placeholder="Optional details"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddEvent(false);
                setNewNotes("");
                setNewTitle("");
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-semibold transition-colors"
            >
              Save Event
            </button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold min-w-48 text-center">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const events = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div
                key={day.toDateString()}
                onClick={() => {
                  setSelectedDay(day);
                  setNewDate(format(day, "yyyy-MM-dd"));
                }}
                className={`min-h-24 p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/20 border-primary"
                    : isCurrentMonth
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/5 border-white/10 opacity-50"
                }`}
              >
                <p className="text-sm font-semibold mb-1">{day.getDate()}</p>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded border ${
                        eventColors[event.type as keyof typeof eventColors] || eventColors.event
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{events.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h3>
          <div className="space-y-2">
            {getEventsForDay(selectedDay).map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  eventColors[event.type as keyof typeof eventColors] || eventColors.event
                }`}
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.notes && <p className="text-xs mt-1 opacity-80">{event.notes}</p>}
                </div>
                <button
                  onClick={() => removeCalendarEvent(event.id)}
                  className="text-xs px-2 py-1 hover:bg-white/20 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            {getEventsForDay(selectedDay).length === 0 && (
              <p className="text-sm text-muted-foreground">No events scheduled</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
