'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase-pages'
import { BrazilianUserProfile } from '../lib/supabase-pages'

interface AuthFormProps {
  onAuthSuccess?: (user: BrazilianUserProfile) => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState({
    marketing: false,
    aiProcessing: true, // Default to true for AI functionality
    dataRetention: true
  })



  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    return numbers
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Sign up using API route
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            display_name: displayName,
            phone,
            cpf,
            timezone: 'America/Sao_Paulo',
            language: 'pt-BR',
            currency: 'BRL',
            consent_version: '2024.1',
            marketing_consent: consent.marketing,
            ai_processing_consent: consent.aiProcessing,
            notification_preferences: {},
            ai_preferences: {}
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Erro no cadastro')
        }

        if (data.data?.user) {
          onAuthSuccess?.(data.data.user as any)
        }
      } else {
        // Sign in using API route
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Erro no login')
        }

        if (data.data?.user) {
          onAuthSuccess?.(data.data.user as any)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isSignUp ? 'Junte-se ao RachaAI' : 'Bem-vindo de volta!'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={handleCPFChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {isSignUp && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-2">Consentimentos (LGPD)</h4>
              
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={consent.aiProcessing}
                  onChange={(e) => setConsent(prev => ({ ...prev, aiProcessing: e.target.checked }))}
                  className="mt-1"
                  required
                />
                <span className="text-sm">
                  Concordo com o processamento de IA para assistência em divisão de contas
                </span>
              </label>

              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-1"
                />
                <span className="text-sm">
                  Aceito receber comunicações de marketing sobre novos recursos
                </span>
              </label>

              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={consent.dataRetention}
                  onChange={(e) => setConsent(prev => ({ ...prev, dataRetention: e.target.checked }))}
                  className="mt-1"
                />
                <span className="text-sm">
                  Concordo com a retenção de dados por 2 anos para funcionalidade do app
                </span>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar conta'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a> e{' '}
          <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
        </p>
      </div>
    </div>
  )
} 