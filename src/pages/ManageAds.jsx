import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Eye, MousePointer, AlertCircle, CheckCircle, Clock, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SEGMENTS = ["Academia", "Suplementos", "Roupas", "Equipamentos", "Serviços", "Nutrição"];

export default function ManageAds() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [segment, setSegment] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user?.user_metadata?.account_type !== 'comercial') {
          navigate(createPageUrl("BusinessSetup"));
          return;
        }

        const { data: profiles } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_email', user.email);

        if (profiles && profiles.length > 0) {
          setBusinessProfile(profiles[0]);
          setPhone(profiles[0].phone || "");
          setAddress(profiles[0].address || "");
          setCity(profiles[0].city || "");
          setState(profiles[0].state || "");
        }
      } catch (error) {
        console.log("User not logged in");
        navigate(createPageUrl("Home"));
      }
    };
    getUser();
  }, [navigate]);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['myAds', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('business_email', currentUser.email)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const createAdMutation = useMutation({
    mutationFn: async (adData) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert([{
          ...adData,
          submitted_at: new Date().toISOString(),
          approval_status: 'pending',
          verified: false,
          active: false
        }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      setShowCreateForm(false);
      resetForm();
      alert("Anúncio enviado para aprovação! Nossa equipe irá revisar em até 48 horas.");
    },
    onError: (error) => {
      console.error("Error creating ad:", error);
      alert("Erro ao criar anúncio. Tente novamente.");
    }
  });

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem");
    }
    setIsUploading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    setSegment("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!businessProfile?.verified) {
      alert("Seu perfil comercial precisa ser verificado antes de criar anúncios!");
      return;
    }

    if (!title || !description || !imageUrl || !segment || !phone || !address || !city) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    createAdMutation.mutate({
      business_email: currentUser.email,
      business_name: businessProfile.business_name,
      title,
      description,
      image_url: imageUrl,
      link_url: linkUrl,
      segment,
      phone,
      address,
      city,
      state
    });
  };

  const getStatusBadge = (ad) => {
    if (ad.approval_status === 'approved' && ad.verified) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">✓ Aprovado</Badge>;
    } else if (ad.approval_status === 'rejected') {
      return <Badge className="bg-red-100 text-red-700 border-red-200">✗ Rejeitado</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⏳ Aguardando Aprovação</Badge>;
    }
  };

  if (!currentUser || !businessProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(createPageUrl("Settings"))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Meus Anúncios</h1>
            <p className="text-sm text-gray-500">Gerencie suas campanhas publicitárias</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063]"
            disabled={!businessProfile?.verified}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Anúncio
          </Button>
        </div>
      </header>

      <div className="p-4 pb-24">
        {!businessProfile?.verified && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Perfil não verificado
                  </p>
                  <p className="text-sm text-yellow-700">
                    Seu perfil comercial precisa ser verificado antes de criar anúncios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showCreateForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Anúncio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Anúncio *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Promoção de Whey Protein 30% OFF"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva seu produto ou serviço..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segmento *
                  </label>
                  <Select value={segment} onValueChange={setSegment} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((seg) => (
                        <SelectItem key={seg} value={seg}>
                          {seg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem do Anúncio *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="mx-auto h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImageUrl("")}
                        >
                          Alterar Imagem
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                              Enviando...
                            </div>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Selecionar Imagem
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link (Opcional)
                  </label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://seusite.com.br"
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="São Paulo"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAdMutation.isPending || !businessProfile?.verified}
                    className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063] disabled:opacity-50"
                  >
                    {createAdMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </div>
                    ) : (
                      "Enviar para Aprovação"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MousePointer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum anúncio criado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro anúncio para alcançar milhares de atletas!
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063]"
                    disabled={!businessProfile?.verified}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Anúncio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              ads.map((ad) => (
                <Card key={ad.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                            <p className="text-sm text-gray-600">{ad.segment}</p>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {getStatusBadge(ad)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {ad.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {ad.views || 0} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="w-3 h-3" />
                            {ad.clicks || 0} cliques
                          </span>
                          {ad.submitted_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(ad.submitted_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
