import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, UserPlus, Bell, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Notifications() {
  const queryClient = useQueryClient();
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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', currentUser.email)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email,
    staleTime: 30 * 1000
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['myFollows', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_email', currentUser.email);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => !n.read);
      if (unreadNotifs.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadNotifs.map(n => n.id));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error("Error marking all as read:", error);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const followBackMutation = useMutation({
    mutationFn: async (notification) => {
      if (!currentUser?.email) throw new Error("User not authenticated");

      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_email: currentUser.email,
          following_email: notification.from_user_email
        });
      if (followError) throw followError;

      // Create notification for the user being followed back
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_email: notification.from_user_email,
          type: "follow",
          from_user_name: currentUser.user_metadata?.full_name || "Usuário",
          from_user_email: currentUser.email,
          text: "começou a te seguir de volta"
        });
      if (notificationError) throw notificationError;

      // Mark original notification as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFollows'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error("Error following back:", error);
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="#ef4444" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const isFollowing = (email) => {
    return follows.some(f => f.following_email === email);
  };

  const getUserFromNotification = (notification) => {
    return users.find(u => u.email === notification.from_user_email);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
              {unreadCount > 0 && (
                <div className="px-3 py-1 bg-red-500 rounded-full">
                  <span className="text-white text-sm font-semibold">{unreadCount}</span>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm text-[#FF6B35] font-semibold hover:text-[#FF006E] transition-colors disabled:opacity-50"
              >
                {markAllAsReadMutation.isPending ? 'Marcando...' : 'Marcar todas como lidas'}
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">
              Você tem {unreadCount} {unreadCount === 1 ? 'notificação nova' : 'notificações novas'}
            </p>
          )}
        </div>
      </header>

      <div className="px-4 py-2 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notificações...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-500">
              Quando alguém interagir com você, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const notifUser = getUserFromNotification(notification);
              const isFollowNotif = notification.type === 'follow';
              const alreadyFollowing = isFollowing(notification.from_user_email);

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all relative group ${
                    notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 border-l-4 border-[#FF6B35] hover:bg-blue-100'
                  } shadow-sm hover:shadow-md transition-shadow`}
                >
                  <button
                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    disabled={deleteNotificationMutation.isPending}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleteNotificationMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </button>

                  <Link
                    to={`${createPageUrl('UserProfile')}?email=${notification.from_user_email}`}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold relative">
                      {notifUser?.profile_photo ? (
                        <img 
                          src={notifUser.profile_photo} 
                          alt={notifUser.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        notification.from_user_name?.[0]?.toUpperCase() || 'U'
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-gray-900">
                      <Link
                        to={`${createPageUrl('UserProfile')}?email=${notification.from_user_email}`}
                        onClick={() => handleNotificationClick(notification)}
                        className="font-semibold hover:underline"
                      >
                        {notification.from_user_name || 'Usuário'}
                      </Link>
                      {' '}
                      <span className="text-gray-600">{notification.text}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      {notification.created_date && formatDistanceToNow(new Date(notification.created_date), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                      {!notification.read && (
                        <>
                          <span>•</span>
                          <span className="text-[#FF6B35] font-medium">Nova</span>
                        </>
                      )}
                    </p>
                  </div>

                  {isFollowNotif && !alreadyFollowing && (
                    <Button
                      size="sm"
                      onClick={() => followBackMutation.mutate(notification)}
                      disabled={followBackMutation.isPending}
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063] text-white hover:shadow-lg flex-shrink-0 transition-all disabled:opacity-50"
                    >
                      {followBackMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Seguir
                        </>
                      )}
                    </Button>
                  )}

                  {isFollowNotif && alreadyFollowing && (
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium flex-shrink-0">
                      <Check className="w-4 h-4" />
                      Seguindo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
