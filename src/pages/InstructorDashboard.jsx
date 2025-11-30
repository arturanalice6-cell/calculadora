import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DollarSign, Users, TrendingUp, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Link } from "react-router-dom";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user?.user_metadata?.account_type !== 'instructor') {
          navigate(createPageUrl("BecomeInstructor"));
        }
      } catch (error) {
        console.log("User not logged in");
      }
    };
    getUser();
  }, [navigate]);

  const { data: plans = [] } = useQuery({
    queryKey: ['instructorPlans', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('instructor_email', currentUser.email);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['instructorSubscriptions', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('instructor_email', currentUser.email)
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount_paid || 0), 0);
  const instructorRevenue = totalRevenue * 0.85;

  const handleChatClick = (studentEmail) => {
    navigate(`${createPageUrl("InstructorChat")}?studentEmail=${encodeURIComponent(studentEmail)}`);
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
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Painel do Instrutor</h1>
          <p className="text-sm text-gray-500">Gerencie seus planos e alunos</p>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl("CreatePlan")} className="block">
            <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063] transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Criar Plano
            </Button>
          </Link>
          <Link to={createPageUrl("InstructorAnalytics")} className="block">
            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
              📊 Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-500">Receita</p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                R$ {instructorRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500">Alunos</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{subscriptions.length}</p>
              <p className="text-xs text-gray-500">ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-gray-500">Planos</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{plans.length}</p>
              <p className="text-xs text-gray-500">criados</p>
            </CardContent>
          </Card>
        </div>

        {/* My Plans Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus Planos</h2>
          {plans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 mb-4">Você ainda não criou nenhum plano</p>
                <Link to={createPageUrl("CreatePlan")}>
                  <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063]">
                    Criar Primeiro Plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
                      </div>
                      {plan.cover_image && (
                        <img 
                          src={plan.cover_image} 
                          alt={plan.title}
                          className="w-16 h-16 rounded-lg object-cover ml-4 flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          R$ {plan.price_monthly}/mês
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {plan.subscribers_count || 0} alunos
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`${createPageUrl("EditPlan")}?planId=${plan.id}`)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                          onClick={() => navigate(`${createPageUrl("PlanDetails")}?planId=${plan.id}`)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Students Section */}
        {subscriptions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Alunos Ativos</h2>
              <span className="text-sm text-gray-500">{subscriptions.length} total</span>
            </div>
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((sub) => (
                <Card key={sub.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold overflow-hidden">
                          {sub.user_email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sub.user_email?.split('@')[0] || 'Aluno'}
                          </p>
                          <p className="text-sm text-gray-500">
                            R$ {sub.amount_paid || 0}/mês
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleChatClick(sub.user_email)}
                        className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {subscriptions.length > 5 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(createPageUrl("InstructorStudents"))}
                  >
                    Ver todos os {subscriptions.length} alunos
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
