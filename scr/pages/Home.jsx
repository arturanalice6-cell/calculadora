import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Dumbbell, RefreshCw, TrendingUp, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import StoryCircle from "../components/StoryCircle";
import PostCard from "../components/PostCard";
import AdStory from "../components/AdStory"; // Componente 'AdStory' corrigido

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        setCurrentUser(null);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, [navigate]);

  const {
    data: posts = [],
    isLoading: postsLoading,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      return [];
    }
  });

  const {
    data: stories = [],
    refetch: refetchStories,
    isLoading: storiesLoading
  } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      return [];
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStories(), refetchPosts()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF006E] bg-clip-text text-transparent">
              FitSwap
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to={createPageUrl("Explore")}>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-6 h-6 text-gray-700" />
              </button>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link to={createPageUrl("Notifications")}>
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 py-4 mb-2">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          <StoryCircle
            isCurrentUser={true}
            user={{ name: "Você", avatar: null }}
          />

          {storiesLoading ? (
            <div className="flex items-center justify-center w-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF6B35] border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex items-center px-4">
              <p className="text-sm text-gray-500">
                Nenhum story disponível
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 pb-24">
        {postsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando feed...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <PostsList posts={posts} currentUser={currentUser} />
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center">
        <TrendingUp className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Seja o primeiro!
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        A comunidade FitSwap está crescendo. Seja o primeiro a compartilhar seu treino
        e inspire outros a começarem sua jornada fitness!
      </p>
      <div className="space-y-3 max-w-xs mx-auto">
        <Link to={createPageUrl("CreatePost")}>
          <button className="w-full px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white rounded-full font-semibold hover:shadow-lg transition-all">
            📸 Publicar Meu Treino
          </button>
        </Link>
        <Link to={createPageUrl("Communities")}>
          <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all">
            👥 Encontrar Pessoas
          </button>
        </Link>
        <Link to={createPageUrl("Challenges")}>
          <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all">
            🏆 Ver Desafios
          </button>
        </Link>
      </div>
    </div>
  );
}

function PostsList({ posts, currentUser }) {
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={currentUser} />
      ))}

      {posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">🎉 Você viu tudo!</p>
          <Link to={createPageUrl("CreatePost")}>
            <button className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white rounded-full font-semibold hover:shadow-lg transition-all">
              Compartilhar Meu Treino
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
