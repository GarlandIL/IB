import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Info } from 'lucide-react';
import Button from '../common/Button';

const EnhancedMeetingScheduler = ({ onClose, onSchedule }) => {
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [agenda, setAgenda] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      title,
      dateTime,
      duration: parseInt(duration),
      agenda,
      meetingLink: `https://meet.innovatebridge.app/${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            Schedule Meeting
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-display font-semibold text-sm mb-2">Meeting Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
              placeholder="e.g., Investment Discussion"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-sm mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-sm mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          <div>
            <label className="block font-display font-semibold text-sm mb-2">Agenda (Optional)</label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg resize-none"
              placeholder="What would you like to discuss?"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              A video meeting link will be generated automatically.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!title || !dateTime}>
              Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedMeetingScheduler;