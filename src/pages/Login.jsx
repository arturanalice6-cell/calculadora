import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email || 'user@example.com',
        password: password || 'password123'
      })

      if (error) {
        setError('Credenciais inválidas')
        return
      }

      navigate('/')
    } catch (error) {
      setError('Erro no login')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-6'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Entrar no FitSwap</h1>
          <p className='text-gray-600'>Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} className='space-y-4'>
          <input
            placeholder='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          <input
            placeholder='Senha'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          {error && <p className='text-red-500 text-sm'>{error}</p>}

          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
          >
            Entrar
          </button>
        </form>

        <div className='text-center mt-4'>
          <p className='text-gray-600 mb-2'>Não tem conta?</p>
          <Link to='/signup'>
            <button className='w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors'>
              Criar Conta
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
