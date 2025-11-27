import React from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

export const PostCard = ({ user, image, caption, onLike, liked }) => {
  return (
    <div className="border rounded-lg bg-white shadow-sm mb-4">
      
      {/* Header */}
      <div className="flex items-center p-3">
        <Avatar src={user.avatar} size={35} />
        <span className="ml-2 font-semibold text-sm">{user.name}</span>
      </div>

      {/* Post Image */}
      <div className="w-full">
        <img src={image} alt="post" className="w-full object-cover" />
      </div>

      {/* Actions */}
      <div className="flex items-center px-3 py-2">
        <Button
          variant="ghost"
          className="p-0"
          onClick={onLike}
        >
          {liked ? "❤️" : "🤍"}
        </Button>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <span className="font-semibold mr-1">{user.name}</span>
        <span className="text-sm">{caption}</span>
      </div>
    </div>
  );
};
