import React from "react";

export default function PostCard({ post }) {
  const title = post?.title || (post?.content ? post.content.slice(0,30) : "Untitled");
  const body = post?.content || post?.body || "";
  const author = post?.author || post?.user_email || "Anonymous";
  const createdAt = post?.created_at ? new Date(post.created_at) : new Date();

  return (
    <article className="bg-white rounded-lg shadow p-4 mb-4" role="article" aria-label={title}>
      <header className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">By <span className="font-medium">{author}</span></div>
        <div className="text-xs text-gray-400">{createdAt.toLocaleString()}</div>
      </header>
      <h3 className="font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700 mb-3">{body}</p>
      <div className="flex items-center gap-3">
        <button aria-label="Like post" className="px-3 py-1 border rounded" onClick={()=>{ /* optimistic UI + analytics */ }}>
          👍 Like
        </button>
        <button aria-label="Share post" className="px-3 py-1 border rounded" onClick={() => { navigator.share ? navigator.share({ title, text: body }) : alert('Share not supported'); }}>
          🔗 Share
        </button>
      </div>
    </article>
  );
}
