'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GraduationCap, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Email ou senha inválidos');
      } else {
        router.replace('/dashboard');
      }
    } catch {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black">
      {/* Background Image */}
      <Image 
        src="/login-bg-mountains.png" 
        alt="Mountain Background" 
        fill 
        priority
        className="object-cover opacity-80"
      />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 p-8 sm:p-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/90 text-sm font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o e-mail"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e?.target?.value ?? '')}
              autoComplete="email"
              className="bg-[#e2e8f0]/90 border-0 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-white/50 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/90 text-sm font-medium">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a sua senha"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e?.target?.value ?? '')}
                autoComplete="current-password"
                className="bg-[#e2e8f0]/90 border-0 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-white/50 h-11 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" className="bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white border border-white/10 px-8" disabled={loading}>
              {loading ? '...' : 'Entrar'}
            </Button>
            <a href="#" className="text-sm text-white hover:text-gray-200 font-medium">
              Esqueceu a senha ?
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}
