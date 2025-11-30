import React from "react"

export default function StoryCircle({ isCurrentUser, user }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold ${
        isCurrentUser ? 'border-2 border-white ring-2 ring-[#FF6B35]' : ''
      }`}>
        {user?.name?.charAt(0) || 'U'}
      </div>
      <span className="text-xs mt-1 max-w-16 truncate">{user?.name || 'Usuário'}</span>
    </div>
  )
}
