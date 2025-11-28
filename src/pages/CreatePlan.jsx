import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { useMutation } from "@tanstack/react-query";

const LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const CATEGORIES = ["Musculação", "Emagrecimento", "Hipertrofia", "Funcional", "Cardio", "Yoga"];

export default function CreatePlan() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState("");
  const [includesNutrition, setIncludesNutrition] = useState(false);
  const [includesChat, setIncludesChat] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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
          
          if (profile?.account_type !== 'instrutor') {
            navigate(createPageUrl("BecomeInstructor"));
          }
        }
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, [navigate]);

  const handleCoverUpload = async (file) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `plan-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('workout-plans')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workout-plans')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
    } catch (error) {
      console.error("Error uploading cover:", error);
      alert("Erro ao fazer upload da capa");
    }
    setIsUploading(false);
  };

  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          instructor_email: planData.instructor_email,
          title: planData.title,
          description: planData.description,
          cover_image: planData.cover_image,
          price_monthly: planData.price_monthly,
          level: planData.level,
          category: planData.category,
          duration_weeks: planData.duration_weeks,
          workouts_per_week: planData.workouts_per_week,
          includes_nutrition: planData.includes_nutrition,
          includes_chat: planData.includes_chat,
          active: true,
          subscribers_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      navigate(createPageUrl("InstructorDashboard"));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !description || !priceMonthly || !level || !category) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    createPlanMutation.mutate({
      instructor_email: currentUser.email,
      title,
      description,
      cover_image: coverImage,
      price_monthly: parseFloat(priceMonthly),
      level,
      category,
      duration_weeks: parseInt(durationWeeks) || 0,
      workouts_per_week: parseInt(workoutsPerWeek) || 0,
      includes_nutrition: includesNutrition,
      includes_chat: includesChat
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
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(createPageUrl("InstructorDashboard"))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Criar Plano de Treino</h1>
        </div>
      </header>

      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Imagem de Capa
            </label>
            <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden">
              {coverImage ? (
                <img src={coverImage} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                ) : (
                  <p className="text-white font-medium">
                    {coverImage ? 'Alterar Capa' : 'Adicionar Capa'}
                  </p>
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
                if (file) handleCoverUpload(file);
              }}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Título do Plano *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Hipertrofia Completa 12 Semanas"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Descrição *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu plano, metodologia, resultados esperados..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Preço Mensal (R$) *
            </label>
            <Input
              type="number"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(e.target.value)}
              placeholder="99.90"
              step="0.01"
              min="50"
              max="200"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Você receberá 85% do valor (comissão de 15%)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Nível *
              </label>
              <Select value={level} onValueChange={setLevel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Categoria *
              </label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Duração (semanas)
              </label>
              <Input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                placeholder="12"
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Treinos/semana
              </label>
              <Input
                type="number"
                value={workoutsPerWeek}
                onChange={(e) => setWorkoutsPerWeek(e.target.value)}
                placeholder="5"
                min="1"
                max="7"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">
              O que está incluído?
            </label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={includesChat}
                onCheckedChange={setIncludesChat}
              />
              <span className="text-sm text-gray-700">Chat exclusivo com instrutor</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={includesNutrition}
                onCheckedChange={setIncludesNutrition}
              />
              <span className="text-sm text-gray-700">Plano nutricional</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createPlanMutation.isPending}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:shadow-lg"
          >
            {createPlanMutation.isPending ? "Criando..." : "Criar Plano"}
          </Button>
        </form>
      </div>
    </div>
  );
}
