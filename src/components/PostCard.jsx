import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"

export default function PostCard({ post, currentUser }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF006E] flex items-center justify-center text-white font-bold">
            U
          </div>
          <div>
            <h4 className="font-semibold">Usuário</h4>
            <p className="text-sm text-gray-500">há alguns momentos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>Post de exemplo - {post?.id || '1'}</p>
      </CardContent>
    </Card>
  )
}
