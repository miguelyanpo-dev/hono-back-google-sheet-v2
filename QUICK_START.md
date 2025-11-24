# 🚀 Quick Start - Aliado API Proxy

Guía rápida para poner en marcha el proyecto en menos de 5 minutos.

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` y agrega tu token de Aliado:
```env
ALIADO_BEARER_TOKEN=tu_token_aqui
```

### 3. Iniciar el servidor
```bash
npm run dev
```

### 4. Probar la API

Abre tu navegador en: http://localhost:3001/api/v1/doc

O prueba con CURL:
```bash
curl http://localhost:3001/api/v1/invoices?page=1&itemsPerPage=10
```

## ✅ Verificación

### Health Check
```bash
curl http://localhost:3001/
```

Deberías ver:
```json
{
  "ok": true,
  "service": "aliado-api-proxy",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-11-24T..."
}
```

### Obtener Facturas
```bash
curl http://localhost:3001/api/v1/invoices
```

Si todo está bien configurado, deberías recibir las facturas de Aliado.

## 🔧 Comandos Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Verificar tipos sin compilar
npm run type-check

# Iniciar en producción (después de build)
npm start
```

## 📚 Documentación

- **Swagger UI**: http://localhost:3001/api/v1/doc
- **OpenAPI JSON**: http://localhost:3001/api/v1/openapi.json
- **Guía de Módulos**: [GUIA_MODULOS.md](./GUIA_MODULOS.md)
- **Ejemplos CURL**: [CURL_EXAMPLES.md](./CURL_EXAMPLES.md)
- **README completo**: [README.md](./README.md)

## ⚠️ Solución de Problemas

### Error: "ALIADO_BEARER_TOKEN is not defined"
- Verifica que hayas creado el archivo `.env`
- Asegúrate de que la variable `ALIADO_BEARER_TOKEN` esté configurada

### Error: "401 Unauthorized"
- Tu token de Aliado puede haber expirado
- Verifica que el token sea correcto

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar las dependencias

### Puerto 3001 en uso
- Cambia el puerto en `.env`: `PORT=3002`
- O detén el proceso que está usando el puerto 3001

## 🎯 Próximos Pasos

1. ✅ Configura tu token de Aliado
2. ✅ Prueba el endpoint de facturas
3. 📖 Lee la [Guía de Módulos](./GUIA_MODULOS.md) para agregar nuevos endpoints
4. 🚀 Despliega en Vercel (opcional)

## 💡 Tips

- Usa la documentación Swagger para probar los endpoints interactivamente
- El servidor se recarga automáticamente en modo desarrollo
- Revisa los logs en la consola para debugging
- El token se configura una sola vez en el servidor, no necesitas enviarlo en cada petición

## 🆘 ¿Necesitas Ayuda?

- Revisa el [README.md](./README.md) para documentación completa
- Consulta [GUIA_MODULOS.md](./GUIA_MODULOS.md) para agregar funcionalidad
- Revisa [CHANGELOG.md](./CHANGELOG.md) para ver los cambios recientes

---

**¡Listo!** Ya puedes empezar a trabajar con la API de Aliado. 🎉
