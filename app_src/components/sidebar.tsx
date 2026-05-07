'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Tags,
  ClipboardList,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Settings,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/tipos-curso', label: 'Tipos de Oficina', icon: Tags },
  { href: '/cursos', label: 'Oficinas', icon: BookOpen },
  { href: '/matriculas', label: 'Matrículas', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex-shrink-0"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight">Gestão</span>
          </Link>
        </div>
        
        {session?.user?.name && (
          <div className="flex items-center gap-2 pr-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Olá,</span>
            <span className="text-xs font-bold text-primary truncate max-w-[100px]">{session.user.name.split(' ')[0]}</span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight">Gestão</h2>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems?.map((item: any) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.href || pathname?.startsWith?.(item?.href + '/');
            return (
              <Link
                key={item?.href}
                href={item?.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                {item?.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          {session?.user && (
            <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-none mb-1">{session.user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Link
              href="/configuracoes"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                pathname?.startsWith?.('/configuracoes')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Settings className="w-5 h-5" />
              Configurações
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full justify-start transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
