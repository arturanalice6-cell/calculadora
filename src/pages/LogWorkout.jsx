import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Camera, Plus, Trash2, Award, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Musculação", "Cardio", "Yoga", "Crossfit", "Corrida", "Funcional"];
const FEELINGS = ["Excelente", "Bom", "Regular", "Cansado"];

export default function LogWorkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState([]);
  const [proofPhoto, setProofPhoto] = useState("");
  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState("Bom");
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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

  const handlePhotoUpload = async (file) => {
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('workout-proofs')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('workout-proofs')
        .getPublicUrl(fileName);

      setProofPhoto(publicUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Erro ao fazer upload da foto. Tente novamente.");
    }
    setIsUploading(false);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 12, weight: 0 }]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const checkAndUnlockAchievements = async (userEmail) => {
    try {
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_email', userEmail);

      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_email', userEmail);

      // First workout achievement
      if (logs?.length === 1 && !achievements?.some(a => a.title === "Primeira Jornada")) {
        await supabase
          .from('achievements')
          .insert({
            user_email: userEmail,
            type: "medal",
            title: "Primeira Jornada",
            description: "Complete seu primeiro treino",
            icon: "🏅",
            rarity: "Bronze",
            points: 10,
            unlocked_at: new Date().toISOString()
          });
      }

      // 10 workouts achievement
      if (logs?.length === 10 && !achievements?.some(a => a.title === "Dedicação")) {
        await supabase
          .from('achievements')
          .insert({
            user_email: userEmail,
            type: "trophy",
            title: "Dedicação",
            description: "Complete 10 treinos",
            icon: "🏆",
            rarity: "Prata",
            points: 50,
            unlocked_at: new Date().toISOString()
          });
      }

      // 50 workouts achievement
      if (logs?.length === 50 && !achievements?.some(a => a.title === "Guerreiro Fitness")) {
        await supabase
          .from('achievements')
          .insert({
            user_email: userEmail,
            type: "trophy",
            title: "Guerreiro Fitness",
            description: "Complete 50 treinos",
            icon: "👑",
            rarity: "Ouro",
            points: 200,
            unlocked_at: new Date().toISOString()
          });
      }

      // 7-day streak achievement
      const last7Days = logs?.slice(-7);
      if (last7Days?.length === 7) {
        const hasStreak = last7Days.every((log, index) => {
          if (index === 0) return true;
          const prevDate = new Date(last7Days[index - 1].created_date);
          const currDate = new Date(log.created_date);
          const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
          return diffDays === 1;
        });

        if (hasStreak && !achievements?.some(a => a.title === "Sequência de Fogo")) {
          await supabase
            .from('achievements')
            .insert({
              user_email: userEmail,
              type: "streak",
              title: "Sequência de Fogo",
              description: "7 dias consecutivos de treino",
              icon: "🔥",
              rarity: "Ouro",
              points: 100,
              unlocked_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const logWorkoutMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('workout_logs')
        .insert([data]);
      if (error) throw error;

      await checkAndUnlockAchievements(data.user_email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      navigate(createPageUrl("WorkoutHistory"));
    },
    onError: (error) => {
      console.error("Error logging workout:", error);
      alert("Erro ao registrar treino. Tente novamente.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !duration || !category) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    if (!currentUser?.email) {
      alert("Usuário não autenticado!");
      return;
    }

    logWorkoutMutation.mutate({
      user_email: currentUser.email,
      title,
      category,
      duration_minutes: parseInt(duration),
      exercises: exercises.filter(e => e.name.trim()),
      proof_photo: proofPhoto,
      notes,
      feeling
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
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Registrar Treino</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <div>
                <p className="font-bold">Continue assim!</p>
                <p className="text-sm opacity-90">Registre seu treino e ganhe medalhas</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Título do Treino *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino de Pernas Pesado"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Categoria *
              </label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Duração (min) *
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Como se sentiu?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FEELINGS.map((feel) => (
                <button
                  key={feel}
                  type="button"
                  onClick={() => setFeeling(feel)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    feeling === feel
                      ? 'border-[#FF6B35] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{feel}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Foto Comprovante (opcional)
            </label>
            {proofPhoto ? (
              <div className="relative h-48 rounded-xl overflow-hidden">
                <img src={proofPhoto} alt="Comprovante" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProofPhoto("")}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#FF6B35] transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FF6B35] border-t-transparent"></div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Tirar Foto</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#FF6B35] transition-colors disabled:opacity-50"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Da Galeria</span>
                </button>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePhotoUpload(file);
                }
                e.target.value = '';
              }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePhotoUpload(file);
                }
                e.target.value = '';
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Exercícios (opcional)
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 text-sm text-[#FF6B35] font-semibold hover:text-[#E55A2B] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {exercises.map((exercise, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={exercise.name}
                      onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                      placeholder="Nome do exercício"
                      className="flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                      placeholder="Séries"
                      min="1"
                    />
                    <Input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="Reps"
                      min="1"
                    />
                    <Input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(idx, 'weight', parseInt(e.target.value) || 0)}
                      placeholder="Kg"
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Observações
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o treino? Anotações importantes..."
              className="min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={logWorkoutMutation.isPending || !title || !duration || !category}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logWorkoutMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              "Registrar Treino"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
