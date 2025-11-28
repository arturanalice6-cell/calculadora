import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, TrendingUp, Lock, Unlock, X, Camera, MoreVertical, Settings, Trash2, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORIES = [
  "Fitness Geral",
  "Corrida",
  "Musculação",
  "Yoga",
  "CrossFit",
  "Funcional",
  "Emagrecimento",
  "Outro"
];

export default function Communities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fitness Geral");
  const [isPublic, setIsPublic] = useState(true);
  const [rules, setRules] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myMemberships', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_email', currentUser.email)
        .eq('status', 'approved');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (communityData) => {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: communityData.name,
          description: communityData.description,
          category: communityData.category,
          is_public: communityData.is_public,
          rules: communityData.rules,
          cover_photo: communityData.cover_photo,
          owner_email: communityData.owner_email,
          moderators: [communityData.owner_email],
          members_count: 1,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (newCommunity) => {
      await supabase
        .from('community_members')
        .insert({
          community_id: newCommunity.id,
          user_email: currentUser.email,
          status: 'approved',
          role: 'owner',
          joined_at: new Date().toISOString()
        });
      
      queryClient.invalidateQueries(['communities']);
      queryClient.invalidateQueries(['myMemberships']);
      setShowCreateModal(false);
      resetForm();
    }
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: async (communityId) => {
      await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId);

      await supabase
        .from('community_posts')
        .delete()
        .eq('community_id', communityId);

      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communities']);
      queryClient.invalidateQueries(['myMemberships']);
      setCommunityToDelete(null);
    }
  });

  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId) => {
      const community = communities.find(c => c.id === communityId);
      
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_email: currentUser.email,
          status: community.is_public ? 'approved' : 'pending',
          role: 'member',
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      if (community.is_public) {
        const { error: updateError } = await supabase
          .from('communities')
          .update({
            members_count: (community.members_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', communityId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myMemberships']);
      queryClient.invalidateQueries(['communities']);
    }
  });

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `community-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-assets')
        .getPublicUrl(filePath);

      setCoverPhoto(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem");
    }
    setIsUploading(false);
  };

  const handleCreateCommunity = () => {
    if (!name.trim() || !description.trim()) {
      alert("Preencha nome e descrição!");
      return;
    }

    createCommunityMutation.mutate({
      name,
      description,
      category,
      is_public: isPublic,
      rules,
      cover_photo: coverPhoto,
      owner_email: currentUser.email
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("Fitness Geral");
    setIsPublic(true);
    setRules("");
    setCoverPhoto("");
  };

  const isOwner = (community) => {
    return community.owner_email === currentUser?.email;
  };

  const isMember = (communityId) => {
    return myMemberships.some(m => m.community_id === communityId);
  };

  const filteredCommunities = communities.filter(community =>
    !searchTerm ||
    community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myCommunities = filteredCommunities.filter(c => isMember(c.id));
  const otherCommunities = filteredCommunities.filter(c => !isMember(c.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comunidades</h1>
              <p className="text-sm text-gray-500">Conecte-se com pessoas como você</p>
            </div>
            <Link to={createPageUrl("Notifications")}>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar comunidades..."
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="p-4 pb-24 space-y-6">
        {myCommunities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Minhas Comunidades ({myCommunities.length})
            </h2>
            <div className="space-y-3">
              {myCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link to={`${createPageUrl("CommunityView")}?communityId=${community.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#FF006E]">
                          {community.cover_photo ? (
                            <img src={community.cover_photo} alt={community.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`${createPageUrl("CommunityView")}?communityId=${community.id}`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{community.name}</h3>
                            {isOwner(community) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`${createPageUrl("ManageCommunityMembers")}?communityId=${community.id}`);
                                  }}>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Gerenciar Membros
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`${createPageUrl("EditCommunity")}?communityId=${community.id}`);
                                  }}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCommunityToDelete(community);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{community.description}</p>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {community.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{community.members_count || 0} membros</span>
                          </div>
                          {!community.is_public && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Privada
                            </Badge>
                          )}
                          {isOwner(community) && (
                            <Badge className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white text-xs">
                              👑 Dono
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Descobrir Comunidades ({otherCommunities.length})
          </h2>
          {otherCommunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma comunidade disponível</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {otherCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link to={`${createPageUrl("CommunityView")}?communityId=${community.id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#FF006E]">
                          {community.cover_photo ? (
                            <img src={community.cover_photo} alt={community.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex-1">
                        <Link to={`${createPageUrl("CommunityView")}?communityId=${community.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{community.description}</p>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {community.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{community.members_count || 0} membros</span>
                          </div>
                          {!community.is_public && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Privada
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => joinCommunityMutation.mutate(community.id)}
                            disabled={joinCommunityMutation.isPending}
                            className="ml-auto bg-gradient-to-r from-[#FF6B35] to-[#FF006E]"
                          >
                            {community.is_public ? 'Entrar' : 'Solicitar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Comunidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Foto de Capa
              </label>
              <div className="relative">
                {coverPhoto ? (
                  <div className="relative h-32 rounded-xl overflow-hidden">
                    <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setCoverPhoto("")}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Adicionar foto de capa</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corredores de SP"
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Descrição</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito da comunidade..."
                className="min-h-[100px]"
                maxLength={500}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Privacidade</label>
              <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4" />
                      <span>Pública - Qualquer um pode entrar</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Privada - Requer aprovação</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Regras (opcional)</label>
              <Textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Defina as regras da comunidade..."
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={createCommunityMutation.isPending || isUploading}
                className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF006E]"
              >
                {createCommunityMutation.isPending ? "Criando..." : "Criar Comunidade"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!communityToDelete} onOpenChange={() => setCommunityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Comunidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{communityToDelete?.name}"? 
              Esta ação não pode ser desfeita e todos os posts e membros serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommunityMutation.mutate(communityToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCommunityMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
