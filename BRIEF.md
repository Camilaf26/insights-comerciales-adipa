# Brief: Sistema Automatizado de Extracción de Insights Comerciales

---

## 1. Problema que resuelve

Los equipos comerciales pierden información valiosa de sus reuniones con clientes porque no existe un proceso sistemático de captura. Las transcripciones se quedan en notas dispersas o en herramientas de videollamada sin ser procesadas.

Este sistema toma la transcripción cruda de una reunión comercial, la procesa con IA (Gemini) y la clasifica automáticamente en tres categorías de insights accionables: objeciones de ventas, requerimientos de producto y vocabulario del cliente. El usuario revisa, edita y aprueba el resultado antes de que quede registrado.

---

## 2. Usuario principal y roles

| Rol | Descripción |
|---|---|
| **Usuario** | Vendedor o ejecutivo comercial que pega o sube la transcripción, revisa los resultados generados por la IA y los aprueba. |
| **Sistema IA (Gemini)** | Procesa el texto crudo y devuelve los insights clasificados en formato de lista de bullets por categoría. |

---

## 3. Pantallas / piezas (en orden del journey)

1. **Pantalla 1 — Ingreso**: el usuario entrega la transcripción
2. **Pantalla 2 — Carga**: la IA procesa el texto
3. **Pantalla 3 — Revisión**: el usuario revisa y edita los resultados
4. **Pantalla 4 — Éxito**: confirmación de que los insights fueron procesados

---

## 4. Datos por pantalla

### Pantalla 1 — Ingreso

**Entra (formas de input, solo una a la vez):**
- Texto pegado directamente en un textarea
- Archivo subido desde el equipo (formatos aceptados: `.txt`, `.docx`, `.pdf`, `.md`)
- Link de Google Docs (URL de la transcripción)

**Sale:**
- String de texto normalizado (la transcripción limpia) que se envía al prompt de Gemini

---

### Pantalla 2 — Carga

**Entra:**
- El string de transcripción normalizado

**Sale (caso éxito):**
- Respuesta JSON de Gemini con tres arrays de bullets:
  ```json
  {
    "objeciones": ["bullet 1", "bullet 2", ...],
    "requerimientos": ["bullet 1", "bullet 2", ...],
    "vocabulario": ["bullet 1", "bullet 2", ...]
  }
  ```

**Sale (caso error):**
- Estado de error que activa el mensaje en pantalla

---

### Pantalla 3 — Revisión

**Entra:**
- El JSON de Gemini → se mapea a tres cuadros de texto editables (uno por categoría)
- Si una categoría llega vacía → se precarga el texto por defecto

**Sale:**
- El contenido editado y aprobado por el usuario (lo que queda en los cuadros al hacer clic en "Aprobar y enviar")

---

### Pantalla 4 — Éxito

**Entra:**
- La acción de aprobación del usuario

**Sale:**
- Mensaje de confirmación visual
- Botón "Procesar otra transcripción" que reinicia el flujo desde la Pantalla 1

---

## 5. Reglas de negocio

| Condición | Consecuencia |
|---|---|
| El campo de transcripción está vacío al hacer clic en "Extraer Insights" | Mostrar error: **"Falta transcripción"**. Bloquear el avance. |
| El link de Google Docs es inválido o no accesible | Mostrar error descriptivo: **"No pudimos acceder al documento. Verifica que el link sea correcto y que el documento sea público o compartido."** |
| El archivo subido no es uno de los formatos aceptados | Mostrar error: **"Formato no compatible. Usa .txt, .docx, .pdf o .md."** |
| La IA falla o supera el tiempo de espera (timeout) | Mostrar mensaje de error en Pantalla 2: **"Ocurrió un error al procesar la transcripción. Por favor, inténtalo nuevamente."** + botón "Reintentar". |
| La IA no encuentra resultados en una categoría | Precargar el cuadro con el texto: **"No hubieron objeciones ni observaciones en relación a este punto en la reunión."** |
| El usuario hace clic en "Aprobar y enviar" con todas las categorías vacías | Bloquear el envío. Mostrar aviso: **"Al menos una categoría debe tener contenido para aprobar."** |
| El usuario hace clic en "Reintentar" en Pantalla 3 | Reprocesar la llamada a Gemini con la misma transcripción, sin volver a Pantalla 1. Mostrar Pantalla 2 nuevamente. |

---

## 6. Prompt base para Gemini

> Este prompt es un punto de partida. Ajustar antes de implementar.

```
Eres un asistente especializado en análisis de reuniones comerciales. 
Recibirás la transcripción cruda de una reunión entre un vendedor y un cliente.

Tu tarea es extraer y clasificar la información en exactamente tres categorías. 
Devuelve el resultado SOLO en formato JSON, sin texto adicional, con esta estructura:

{
  "objeciones": [
    "Objeción o duda expresada por el cliente que frena o complica la venta"
  ],
  "requerimientos": [
    "Funcionalidad, característica o necesidad que el cliente pidió explícita o implícitamente"
  ],
  "vocabulario": [
    "Término, frase o expresión específica que el cliente usó para describir su problema, contexto o industria"
  ]
}

Reglas:
- Cada item debe ser una oración o frase corta y clara (máximo 2 líneas).
- Si no encuentras información relevante para una categoría, devuelve un array vacío [].
- No inventes información que no esté en la transcripción.
- No incluyas saludos, despedidas ni conversación de relleno.

Transcripción:
[TRANSCRIPCIÓN_AQUÍ]
```

---

## 7. Fuera de alcance (v1)

Los siguientes elementos **no se construyen en esta versión**:

- Integración con Monday (consolidación de insights)
- Integración con Slack (envío de alertas)
- Autenticación / login de usuarios
- Trazabilidad de quién procesó cada transcripción
- Gestión de categorías (agregar, editar o eliminar categorías) → previsto para v2
- Historial de transcripciones procesadas
- Límite de extensión de la transcripción

---

## Notas técnicas para la construcción

| Ítem | Decisión |
|---|---|
| Modelo de IA | Gemini (API de Google) |
| Barra de progreso en Pantalla 2 | Porcentaje simulado (animación de 0% a 100% en tiempo estimado, no real) |
| Formatos de archivo aceptados | `.txt`, `.docx`, `.pdf`, `.md` |
| Formato de respuesta de la IA | JSON con tres arrays de strings (bullets) |
| Extracción de texto de Google Docs | Vía URL pública o compartida → usar Google Docs export API o scraping del HTML público |

---

## Retrospectiva

**1. ¿Qué pregunta de Claude te hizo dar cuenta de algo que no tenías claro del flujo?**

Las preguntas sobre cómo quería recibir la información, cómo se debían manejar los errores y qué vería el usuario en cada pantalla. Además, la pregunta sobre el límite máximo de caracteres para las respuestas de la aplicación obligó a definir un detalle que no estaba contemplado en el mapa inicial.

**2. ¿Qué diferencia hubo entre tu mapa inicial y lo que terminaste construyendo?**

No hubo grandes diferencias, ya que la idea central y la problemática ya estaban bien definidas. Las principales modificaciones se dieron en la construcción de la plataforma, específicamente en la forma en que la aplicación entrega la información al usuario.

**3. Si tuvieras que hacer este flujo de verdad para ADIPA, ¿cuál sería el primer riesgo o pieza faltante?**

Este proyecto está pensado para hacerse realidad en ADIPA, con intención de expandir su funcionalidad a más tipos de reuniones y nuevas integraciones. Los principales riesgos y piezas faltantes actuales son precisamente las conexiones técnicas pendientes: el despliegue de la IA con una API key activa, y la integración directa con Monday y Slack.
