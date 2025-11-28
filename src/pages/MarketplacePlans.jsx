import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Star, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORIES = ["Todos", "Musculação", "Emagrecimento", "Hipertrofia", "Funcional", "Yoga"];
const LEVELS = ["Todos", "Iniciante", "Intermediário", "Avançado"];

export default function MarketplacePlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("Todos");

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['marketplacePlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('active', true)
        .order('subscribers_count', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || plan.category === selectedCategory;
    const matchesLevel = selectedLevel === "Todos" || plan.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="px-4 py-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planos de Treino</h1>
            <p className="text-sm text-gray-500">Encontre o instrutor perfeito para você</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar planos..."
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white border-transparent' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {LEVELS.map((level) => (
                <Badge
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  className={`cursor-pointer whitespace-nowrap transition-all ${
                    selectedLevel === level 
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF006E] text-white border-transparent' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent"></div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "Todos" || selectedLevel !== "Todos" 
                  ? "Tente ajustar os filtros de busca"
                  : "Ainda não há planos disponíveis no marketplace"
                }
              </p>
              {(searchTerm || selectedCategory !== "Todos" || selectedLevel !== "Todos") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todos");
                    setSelectedLevel("Todos");
                  }}
                  variant="outline"
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {plan.cover_image && (
                  <img 
                    src={plan.cover_image} 
                    alt={plan.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">{plan.level}</Badge>
                    <Badge variant="outline" className="text-xs">{plan.category}</Badge>
                    {plan.includes_nutrition && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        + Nutrição
                      </Badge>
                    )}
                    {plan.includes_support && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Suporte
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#FF6B35]">
                        R$ {plan.price_monthly}
                        <span className="text-sm text-gray-500 font-normal">/mês</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{plan.subscribers_count || 0} alunos ativos</span>
                        {plan.rating && (
                          <>
                            <span>•</span>
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>{plan.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link to={`${createPageUrl("PlanDetails")}?planId=${plan.id}`}>
                      <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063] transition-all">
                        Ver Plano
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
