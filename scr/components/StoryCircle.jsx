import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export const StoryCircle = ({ user, hasUnseenStories = false, isCurrentUser = false }) => {
  return (
    <div className="flex flex-col items-center space-y-1">
      <Link 
        to={isCurrentUser ? createPageUrl("CreateStory") : `${createPageUrl("ViewStories")}?storyId=${user.storyId}`}
        className={`relative rounded-full p-0.5 ${
          hasUnseenStories 
            ? "bg-gradient-to-r from-[#FF6B35] to-[#FF006E]" 
            : "bg-gray-300"
        }`}
      >
        <div className="bg-white p-0.5 rounded-full">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
        
        {isCurrentUser && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        )}
      </Link>
      
      <span className="text-xs text-gray-700 max-w-16 truncate text-center">
        {isCurrentUser ? "Seu story" : user.name?.split(' ')[0] || 'Usuário'}
      </span>
    </div>
  );
};

export default StoryCircle;
