import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Dumbbell, RefreshCw, TrendingUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import StoryCircle from "../components/StoryCircle";
import PostCard from "../components/PostCard";

export default function Home() {
  const { user, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const { data: posts = [], isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("postagens")
        .select("*")
        .order("criado_em", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: stories = [], isLoading: loadingStories, refetch: refetchStories } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("historias")
        .select("*")
        .order("criado_em", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStories(), refetchPosts()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF006E] rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF006E] bg-clip-text text-transparent">
              FitSwap
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/explore")} className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            <button onClick={refresh} disabled={isRefreshing} className="p-2 hover:bg-gray-100 rounded-full">
              <RefreshCw
                className={w-5 h-5 text-gray-700 ${isRefreshing ? "animate-spin" : ""}}
              />
            </button>

            <button onClick={() => navigate("/notifications")} className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 py-4 mb-2">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          <StoryCircle isCurrentUser user={user} />

          {loadingStories ? (
            <div className="flex items-center justify-center w-16">
              <div className="animate-spin h-8 w-8 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
            </div>
          ) : stories.length === 0 ? (
            <p className="text-sm text-gray-500 px-4">Nenhuma história disponível</p>
          ) : (
            stories.map((s) => <StoryCircle key={s.id} story={s} />)
          )}
        </div>
      </div>

      <div className="px-4 py-2">
        {loadingPosts ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 text-center">Carregando feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} currentUser={user} />)
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function EmptyState({ navigate }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">Seja o primeiro!</h3>

      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        A comunidade FitSwap está crescendo. Publique o primeiro treino!
      </p>

      <div className="space-y-3 max-w-xs mx-auto">
        <button
          onClick={() => navigate("/create-post")}
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white font-semibold"
        >
          📸 Publicar Meu Treino
        </button>

        <button
          onClick={() => navigate("/communities")}
          className="w-full py-3 rounded-full border border-gray-300 text-gray-700 font-semibold"
        >
          👥 Encontrar Pessoas
        </button>

        <button
          onClick={() => navigate("/challenges")}
          className="w-full py-3 rounded-full border border-gray-300 text-gray-700 font-semibold"
        >
          🏆 Ver Desafios
        </button>
      </div>
    </div>
  );
}