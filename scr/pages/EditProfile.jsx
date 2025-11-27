import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";

export default function EditProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

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
          setFullName(profile.full_name || "");
          setBio(profile.bio || "");
          setProfilePhoto(profile.profile_photo || "");
          setCoverPhoto(profile.cover_photo || "");
        }
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          profile_photo: data.profile_photo,
          cover_photo: data.cover_photo,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      navigate(createPageUrl("Profile"));
    }
  });

  const handlePhotoUpload = async (file, type) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (type === 'profile') {
        setProfilePhoto(publicUrl);
      } else {
        setCoverPhoto(publicUrl);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Erro ao fazer upload da foto");
    }
    setIsUploading(false);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      full_name: fullName,
      bio: bio,
      profile_photo: profilePhoto,
      cover_photo: coverPhoto
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(createPageUrl("Profile"))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Editar Perfil</h1>
          <button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || isUploading}
            className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Foto de Capa
          </label>
          <div className="relative h-48 bg-gradient-to-br from-[#FF6B35] to-[#FF006E] rounded-2xl overflow-hidden">
            {coverPhoto && (
              <img src={coverPhoto} alt="Capa" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Alterar Capa</p>
                </div>
              )}
            </button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file, 'cover');
            }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white text-3xl font-bold">
                    {currentUser.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => profileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Escolha uma foto que represente você
              </p>
              <button
                onClick={() => profileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm text-[#FF6B35] font-semibold hover:text-[#FF006E] transition-colors"
              >
                Alterar foto
              </button>
            </div>
          </div>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file, 'profile');
            }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Nome
          </label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Bio
          </label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você e seus objetivos fitness..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            {bio.length}/150 caracteres
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Email
          </label>
          <Input
            value={currentUser.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-2">
            O email não pode ser alterado
          </p>
        </div>
      </div>
    </div>
  );
}
