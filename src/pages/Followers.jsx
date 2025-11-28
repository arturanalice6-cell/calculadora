import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Followers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const tab = searchParams.get('tab') || 'followers';
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, []);

  const { data: profileUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          follower:profiles!follows_follower_id_fkey(*)
        `)
        .eq('following_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && tab === 'followers'
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          following:profiles!follows_following_id_fkey(*)
        `)
        .eq('follower_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && tab === 'following'
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  const followMutation = useMutation({
    mutationFn: async (targetUserId) => {
      const isCurrentlyFollowing = follows.some(f => f.following_id === targetUserId);
      
      if (isCurrentlyFollowing) {
        const followRecord = follows.find(f => f.following_id === targetUserId);
        if (followRecord) {
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('id', followRecord.id);
          
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: targetUserId
          });
        
        if (error) throw error;

        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: "follow",
            from_user_id: currentUser.id,
            text: "começou a te seguir"
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['follows']);
      queryClient.invalidateQueries(['followers']);
      queryClient.invalidateQueries(['following']);
    }
  });

  const isFollowing = (targetUserId) => {
    return follows.some(f => f.following_id === targetUserId);
  };

  const users = tab === 'followers' 
    ? followers.map(f => f.follower)
    : following.map(f => f.following);

  const title = tab === 'followers' 
    ? profileUser?.account_type === 'instructor' ? 'Alunos' : 'Seguidores'
    : 'Seguindo';

  const count = tab === 'followers' ? followers.length : following.length;

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{profileUser.full_name}</h1>
            <p className="text-sm text-gray-500">{count} {title.toLowerCase()}</p>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => navigate(`${createPageUrl('Followers')}?id=${userId}&tab=followers`)}
            className={`flex-1 py-3 text-center font-medium ${
              tab === 'followers'
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {profileUser.account_type === 'instructor' ? 'Alunos' : 'Seguidores'}
          </button>
          <button
            onClick={() => navigate(`${createPageUrl('Followers')}?id=${userId}&tab=following`)}
            className={`flex-1 py-3 text-center font-medium ${
              tab === 'following'
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Seguindo
          </button>
        </div>
      </header>

      <div className="p-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {tab === 'followers' ? (
                <UserPlus className="w-8 h-8 text-gray-400" />
              ) : (
                <UserCheck className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-500 mb-2">
              {tab === 'followers' 
                ? profileUser.account_type === 'instructor' 
                  ? 'Nenhum aluno ainda' 
                  : 'Nenhum seguidor ainda'
                : 'Não seguindo ninguém'
              }
            </p>
            <p className="text-sm text-gray-400">
              {tab === 'followers' 
                ? 'Quando alguém te seguir, aparecerá aqui.' 
                : 'Quando você seguir alguém, aparecerá aqui.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                <Link 
                  to={`${createPageUrl('UserProfile')}?id=${user.id}`}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">@{user.username || user.email?.split('@')[0]}</p>
                    {user.account_type === 'instructor' && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs mt-1">
                        Instrutor
                      </Badge>
                    )}
                  </div>
                </Link>
                
                {currentUser && user.id !== currentUser.id && (
                  <Button
                    onClick={() => followMutation.mutate(user.id)}
                    disabled={followMutation.isPending}
                    variant={isFollowing(user.id) ? "outline" : "default"}
                    size="sm"
                    className={isFollowing(user.id) ? "" : "bg-gradient-to-r from-[#FF6B35] to-[#FF006E]"}
                  >
                    {isFollowing(user.id) ? "Seguindo" : "Seguir"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
