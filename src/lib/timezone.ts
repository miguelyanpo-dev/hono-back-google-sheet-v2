/**
 * Utilidades para manejo de zonas horarias
 */

import { config } from '../config/config';

/**
 * Parsea una fecha string y la convierte a ISO considerando la zona horaria configurada
 * 
 * Si la fecha incluye zona horaria (Z, +00:00, etc), se respeta
 * Si no incluye zona horaria, se asume que es hora local en la timezone configurada
 * 
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha en formato ISO UTC
 */
export function parseToTimezone(dateString: string): string {
  // Si la fecha ya tiene zona horaria (Z, +, -), usarla directamente
  if (dateString.includes('Z') || dateString.includes('+') || dateString.match(/-\d{2}:\d{2}$/)) {
    return new Date(dateString).toISOString();
  }
  
  // Si no tiene zona horaria, asumimos que es hora local en la timezone configurada
  // Agregamos la zona horaria al final para que JavaScript la interprete correctamente
  
  // Para Europe/Madrid:
  // - Invierno (CET): UTC+1
  // - Verano (CEST): UTC+2
  
  // Crear fecha y verificar si está en horario de verano
  const date = new Date(dateString);
  const year = date.getFullYear();
  
  // Calcular los domingos de cambio horario para ese año
  const marchChange = getLastSundayOfMonth(year, 2); // Marzo (mes 2)
  const octoberChange = getLastSundayOfMonth(year, 9); // Octubre (mes 9)
  
  // Determinar si estamos en horario de verano (CEST) o invierno (CET)
  const isDST = date >= marchChange && date < octoberChange;
  
  // Aplicar el offset correcto
  const offset = isDST ? '+02:00' : '+01:00';
  
  // Agregar el offset a la fecha
  const dateWithOffset = `${dateString}${offset}`;
  
  return new Date(dateWithOffset).toISOString();
}

/**
 * Obtiene el último domingo de un mes
 */
function getLastSundayOfMonth(year: number, month: number): Date {
  // Obtener el último día del mes
  const lastDay = new Date(year, month + 1, 0);
  
  // Retroceder hasta encontrar el domingo
  const day = lastDay.getDay();
  const diff = day === 0 ? 0 : day;
  
  const lastSunday = new Date(year, month, lastDay.getDate() - diff, 2, 0, 0); // 2 AM hora del cambio
  
  return lastSunday;
}

/**
 * Formatea una fecha para mostrar en la zona horaria configurada
 */
export function formatInTimezone(date: Date): string {
  return date.toLocaleString('es-ES', {
    timeZone: config.calendar.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
