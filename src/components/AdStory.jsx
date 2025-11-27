import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export const AdStory = ({ ad }) => {
  if (!ad) return null;

  return (
    <div className="flex-shrink-0 w-24">
      <Link 
        to={`${createPageUrl("ViewStories")}?adId=${ad.id}`}
        className="block"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-[#FF6B35] p-0.5 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center">
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.title || "Anúncio"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-xs font-bold text-center px-1">
                  {ad.business_name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs">💰</span>
          </div>
        </div>
        <p className="text-xs text-gray-700 text-center mt-1 truncate px-2">
          {ad.business_name || 'Anúncio'}
        </p>
      </Link>
    </div>
  );
};

export default AdStory;
