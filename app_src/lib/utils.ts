import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return '';
  const iso = typeof value === 'string' ? value : value.toISOString();
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function sexoBorderClass(sexo?: string | null): string {
  if (sexo === 'Masculino') return 'border-2 border-blue-200';
  if (sexo === 'Feminino') return 'border-2 border-pink-200';
  return '';
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}