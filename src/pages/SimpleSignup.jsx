import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SimpleSignup() {
  const handleSignup = () => {
    // Simular cadastro bem-sucedido
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">?? Criar Conta</CardTitle>
          <p className="text-gray-600">Junte-se à comunidade FitSwap</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Nome completo" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Senha" type="password" />
          <Button className="w-full" onClick={handleSignup}>
            Criar Minha Conta
          </Button>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Já tem conta?</p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Fazer Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
