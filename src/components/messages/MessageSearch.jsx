import React, { useState } from 'react';
import { Search, X, MessageSquare, Calendar } from 'lucide-react';

const MessageSearch = ({ conversation, onClose, onJumpToMessage }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (!query.trim() || !conversation?.messages) return;
    const q = query.toLowerCase();
    const found = conversation.messages.filter(m => 
      m.content?.toLowerCase().includes(q)
    );
    setResults(found);
  };

  return (
    <div className="px-6 py-4 bg-white border-b border-neutral-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>
        <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-700">
          <X size={18} />
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {results.map((msg, i) => (
            <button
              key={i}
              onClick={() => onJumpToMessage(msg.id)}
              className="w-full text-left p-2 hover:bg-neutral-100 rounded-lg"
            >
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <MessageSquare size={12} />
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm truncate">{msg.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;