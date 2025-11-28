import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Calendar, DollarSign, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MySubscriptions() {
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

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_email', currentUser.email);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Assinaturas</h1>
          <p className="text-sm text-gray-500">Gerencie seus planos ativos</p>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {activeSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-gray-500 mb-4">Explore nossos planos e encontre o treino perfeito para você</p>
              <Link to={createPageUrl("MarketplacePlans")}>
                <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF006E] hover:from-[#FF5A25] hover:to-[#E50063]">
                  Explorar Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          activeSubscriptions.map((sub) => {
            const plan = plans.find(p => p.id === sub.plan_id);
            if (!plan) return null;

            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    {plan.cover_image && (
                      <img 
                        src={plan.cover_image} 
                        alt={plan.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{plan.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Ativo
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {plan.level}
                        </Badge>
                        <span className="text-sm font-semibold text-[#FF6B35]">
                          R$ {sub.amount_paid || plan.price_monthly}/mês
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Iniciou em {sub.started_at ? format(new Date(sub.started_at), "dd 'de' MMMM", { locale: ptBR }) : 'data não disponível'}
                      </span>
                    </div>
                    {sub.next_billing_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          Próxima cobrança: {format(new Date(sub.next_billing_date), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Instrutor: {plan.instructor_email?.split('@')[0] || 'FitSwap'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to={`${createPageUrl("StudentChat")}?instructorEmail=${plan.instructor_email}`} className="flex-1">
                      <Button variant="outline" className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-colors">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat com Instrutor
                      </Button>
                    </Link>
                    <Link to={`${createPageUrl("PlanDetails")}?planId=${plan.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
