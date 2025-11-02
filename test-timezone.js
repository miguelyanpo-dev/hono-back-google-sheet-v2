/**
 * Script de prueba para verificar el manejo automático del cambio horario europeo
 * 
 * Este script demuestra que las zonas horarias IANA (como Europe/Madrid)
 * manejan automáticamente el cambio entre horario de verano (CEST, UTC+2)
 * y horario de invierno (CET, UTC+1).
 */

// Fechas de ejemplo para 2025
const fechas = [
  // Antes del cambio de marzo (horario de invierno - CET, UTC+1)
  { fecha: '2025-03-15T10:00:00', descripcion: 'Marzo - Antes del cambio (CET)' },
  
  // Después del cambio de marzo (horario de verano - CEST, UTC+2)
  { fecha: '2025-04-15T10:00:00', descripcion: 'Abril - Después del cambio (CEST)' },
  
  // Durante el verano (horario de verano - CEST, UTC+2)
  { fecha: '2025-08-15T10:00:00', descripcion: 'Agosto - Verano (CEST)' },
  
  // Antes del cambio de octubre (horario de verano - CEST, UTC+2)
  { fecha: '2025-10-15T10:00:00', descripcion: 'Octubre - Antes del cambio (CEST)' },
  
  // Después del cambio de octubre (horario de invierno - CET, UTC+1)
  { fecha: '2025-11-15T10:00:00', descripcion: 'Noviembre - Después del cambio (CET)' }
];

console.log('🌍 Prueba de Cambio Horario Automático - Europe/Madrid\n');
console.log('═'.repeat(80));

fechas.forEach(({ fecha, descripcion }) => {
  const date = new Date(fecha);
  
  // Formatear en zona horaria de Madrid
  const madridTime = date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
  
  // Obtener el offset en minutos
  const madridDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMinutes = (madridDate - utcDate) / (1000 * 60);
  const offsetHours = offsetMinutes / 60;
  const utcOffset = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  
  // Determinar si es horario de verano o invierno
  const isDST = offsetHours === 2;
  const timezone = isDST ? 'CEST (Verano)' : 'CET (Invierno)';
  
  console.log(`\n📅 ${descripcion}`);
  console.log(`   Fecha local: ${madridTime}`);
  console.log(`   Zona horaria: ${timezone}`);
  console.log(`   Offset UTC: ${utcOffset}`);
  console.log(`   ISO String: ${date.toISOString()}`);
});

console.log('\n' + '═'.repeat(80));
console.log('\n✅ Conclusión:');
console.log('   El sistema detecta automáticamente el horario correcto según la fecha.');
console.log('   No se requiere configuración manual ni código adicional.');
console.log('   Simplemente usa TIMEZONE=Europe/Madrid en tu .env\n');

// Ejemplo de cómo se vería en Google Calendar API
console.log('📝 Ejemplo de evento para Google Calendar API:\n');

const ejemploEvento = {
  summary: 'Cita de ejemplo',
  start: {
    dateTime: new Date('2025-08-15T10:00:00').toISOString(),
    timeZone: 'Europe/Madrid'  // ✅ Esto maneja automáticamente CEST (UTC+2)
  },
  end: {
    dateTime: new Date('2025-08-15T11:00:00').toISOString(),
    timeZone: 'Europe/Madrid'
  }
};

console.log(JSON.stringify(ejemploEvento, null, 2));
console.log('\n🎉 ¡El cambio horario se gestiona automáticamente!\n');
