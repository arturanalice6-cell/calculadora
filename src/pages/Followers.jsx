import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Link } from "react-router-dom";

export default function Followers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');
  const defaultTab = searchParams.get('tab') || 'followers';
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setCurrentUser(profile);
        }
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const { data: follows, error } = await supabase
        .from('follows')
        .select('*')
        .eq('following_email', userEmail);
      
      if (error) throw error;
      
      return follows.map(follow => {
        const user = allUsers.find(u => u.email === follow.follower_email);
        return {
          ...follow,
          user: user
        };
      });
    },
    enabled: !!userEmail && allUsers.length > 0
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const { data: follows, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_email', userEmail);
      
      if (error) throw error;
      
      return follows.map(follow => {
        const user = allUsers.find(u => u.email === follow.following_email);
        return {
          ...follow,
          user: user
        };
      });
    },
    enabled: !!userEmail && allUsers.length > 0
  });

  const { data: myFollows = [] } = useQuery({
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

  const followMutation = useMutation({
    mutationFn: async (userToFollow) => {
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_email: currentUser.email,
          following_email: userToFollow.email,
          created_at: new Date().toISOString()
        });

      if (followError) throw followError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_email: userToFollow.email,
          type: "follow",
          from_user_name: currentUser.full_name,
          from_user_email: currentUser.email,
          text: "começou a te seguir",
          created_at: new Date().toISOString()
        });

      if (notificationError) throw notificationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myFollows']);
      queryClient.in
