import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Bookmark, Eye, Shield } from 'lucide-react';
import Button from './Button';
import { clsx } from 'clsx';

const ProjectCard = ({ 
  project, 
  onBookmark, 
  isBookmarked, 
  onRequestNDA, 
  ndaSigned = false 
}) => {
  const { elevatorPitch, sector, location, metrics, id } = project;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-250 border border-neutral-200 hover:border-primary h-full flex flex-col">
      {/* Image Section */}
      <div className="relative w-full h-60 overflow-hidden bg-neutral-100 group">
        <img 
          src={elevatorPitch.images?.[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'} 
          alt={elevatorPitch.tagline}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-md font-display font-bold text-xs uppercase tracking-wider text-primary">
          {sector}
        </div>

        {/* Bookmark Button */}
        {onBookmark && (
          <button 
            className={clsx(
              "absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-250 cursor-pointer",
              isBookmarked 
                ? 'bg-primary text-white' 
                : 'text-neutral-600 hover:bg-white hover:text-primary hover:scale-110'
            )}
            onClick={(e) => {
              e.preventDefault();
              onBookmark(id);
            }}
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* NDA Signed Badge (if applicable) */}
        {ndaSigned && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-success/95 backdrop-blur-md text-white rounded-md text-xs font-semibold flex items-center gap-1">
            <Shield size={14} />
            NDA Signed
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-display font-bold text-neutral-900 mb-2 line-clamp-2">
          {elevatorPitch.tagline}
        </h3>
        
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="flex items-center gap-1 font-display text-xs font-semibold text-neutral-600">
            <MapPin size={16} />
            {location}
          </span>
          <span className="flex items-center gap-1 font-display text-xs font-semibold text-success">
            <TrendingUp size={16} />
            ${formatNumber(elevatorPitch.funding)}
          </span>
        </div>

        <p className="text-sm text-neutral-700 mb-2 font-medium line-clamp-2">{elevatorPitch.problem}</p>
        <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{elevatorPitch.solution}</p>

        <div className="text-xs text-neutral-600 mb-4 p-3 bg-neutral-50 border-l-3 border-primary rounded-sm">
          <strong className="text-neutral-900 font-display">Traction:</strong> {elevatorPitch.traction}
        </div>

        {/* Metrics (if available) */}
        {metrics && (
          <div className="flex items-center gap-4 py-3 mb-4 border-t border-b border-neutral-200 flex-wrap mt-auto">
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <Eye size={16} />
              <span>{formatNumber(metrics.views)} views</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <Bookmark size={16} />
              <span>{metrics.bookmarks} saved</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-success font-semibold">
              <span>Quality Score: {metrics.qualityScore}%</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link to={`/projects/${id}`} className="w-full">
            <Button variant="primary" fullWidth>
              View Full Pitch
            </Button>
          </Link>

          {/* Request Full Details – only for investors, not bookmarked/NDA signed */}
          {onRequestNDA && !ndaSigned && !isBookmarked && (
            <Button 
              variant="secondary" 
              fullWidth 
              icon={<Shield size={16} />}
              onClick={(e) => {
                e.preventDefault();
                onRequestNDA(id);
              }}
            >
              Request Full Details
            </Button>
          )}

          {/* Already signed NDA – go to messages */}
          {ndaSigned && (
            <Link to={`/investor/messages?project=${id}`} className="w-full">
              <Button variant="outline" fullWidth icon={<Eye size={16} />}>
                Contact Creator
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;