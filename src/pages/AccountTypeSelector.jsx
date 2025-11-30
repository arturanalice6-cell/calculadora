import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AccountTypeSelector() {
  const [selectedType, setSelectedType] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Escolha seu tipo de conta</CardTitle>
          <p className="text-gray-600">Como você quer usar o FitSwap?</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedType === 'student' ? 'ring-2 ring-[#FF6B35] border-[#FF6B35]' : ''
            }`}
            onClick={() => setSelectedType('student')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">??</span>
                </div>
                <div>
                  <h4 className="font-semibold">Aluno/Praticante</h4>
                  <p className="text-sm text-gray-600">Acompanhe treinos e progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              selectedType === 'instructor' ? 'ring-2 ring-[#FF6B35] border-[#FF6B35]' : ''
            }`}
            onClick={() => setSelectedType('instructor')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">???</span>
                </div>
                <div>
                  <h4 className="font-semibold">Instrutor/Coach</h4>
                  <p className="text-sm text-gray-600">Crie planos e gerencie alunos</p>
                  <Badge variant="secondary" className="mt-1">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            disabled={!selectedType}
            onClick={() => alert(`Conta ${selectedType} selecionada!`)}
          >
            Continuar como {selectedType === 'student' ? 'Aluno' : 'Instrutor'}
          </Button>

          <div className="text-center">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
