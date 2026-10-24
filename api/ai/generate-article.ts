import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, category, focus, notes } = req.body || {};

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'El tema del artículo es requerido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Eres la asistente de redacción para la web "Pizarra & Criterio", el blog personal de la entrenadora de baloncesto Leyanis Horta.
Leyanis es Licenciada en Cultura Física y Deporte con más de 20 temporadas dirigiendo banquillos desde Cuba hasta Barcelona, España.
Tu tarea es redactar un artículo técnico, reflexivo y de máxima calidad táctica sobre baloncesto.

Voz y tono de Leyanis Horta:
- Directa, apasionada, experimentada y analítica.
- Enfatiza la toma de decisiones, la intensidad defensiva, el espaciamiento geométrico (spacing), el pase extra y la formación humana de los jugadores.
- Rechaza el juego robotizado o el abuso de pizarras rígidas sin lectura de juego.
- Incluye anécdotas o reflexiones de banquillo ("En mis 20 años en los banquillos...", "He visto perder partidos por...", "En el baloncesto catalán y en mis años en Cuba...").
- Estructura el contenido con títulos Markdown (## y ###), citas en bloque (>), desgloses con viñetas y un ejercicio práctico o norma para la sesión de entrenamiento.

Devuelve un JSON estrictamente válido que cumpla con la estructura requerida.`;

      const prompt = `Escribe un artículo para el blog con las siguientes características:
- Tema principal: "${topic}"
- Categoría preferida: "${category || 'Táctica Defensiva'}"
- Enfoque: "${focus || 'Táctica de banquillo y toma de decisiones'}"
${notes ? `- Instrucciones adicionales de la entrenadora: "${notes}"` : ''}

El artículo debe tener:
1. "title": Un título potente, profesional y atrayente para entrenadores.
2. "excerpt": Un resumen de 2 líneas (máximo 160 caracteres) para la tarjeta de portada.
3. "category": Categoría temática (ej. "Táctica Defensiva", "Ataque por Conceptos", "Dirección de Banquillo", "Desarrollo de Fundamentos", "Metodología & Cantera").
4. "tags": Array de 3 a 5 etiquetas cortas (ej. ["PickAndRoll", "Defensa", "TomaDeDecisiones"]).
5. "readTimeMinutes": Número estimado de minutos de lectura (entre 4 y 8).
6. "content": El artículo completo en formato Markdown bien estructurado (mínimo 450 palabras, con introducción, 2-3 secciones con subtítulos ## y ###, citas >, ejercicios prácticos o reglas para la sesión y una conclusión de banquillo).
7. "imageTheme": Una de las siguientes palabras clave para asignar la imagen idónea: "tactics_board", "drill_training", "timeout_huddle", "pick_and_roll", "defense_transition", o "fundamentals".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              readTimeMinutes: { type: Type.INTEGER },
              content: { type: Type.STRING },
              imageTheme: { type: Type.STRING }
            },
            required: ['title', 'excerpt', 'category', 'tags', 'readTimeMinutes', 'content', 'imageTheme']
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const articleData = JSON.parse(responseText);
        return res.status(200).json({ success: true, article: articleData, source: 'gemini-3.8-flash' });
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, using intelligent coach generator fallback:', apiError?.message || apiError);
    }
  }

  // Fallback generation
  const fallbackArticle = {
    title: `${topic.trim()}: Criterio táctico y lectura desde el banquillo`,
    excerpt: `Análisis detallado sobre ${topic.trim().toLowerCase()}. Cómo trasladar este concepto a la pista, evitar errores comunes y enriquecer la toma de decisiones.`,
    category: category || 'Táctica de Baloncesto',
    tags: ['Baloncesto', 'Pizarra', 'LecturaDeJuego', 'Entrenamiento'],
    readTimeMinutes: 5,
    imageTheme: topic.toLowerCase().includes('defens') || topic.toLowerCase().includes('balance') 
      ? 'defense_transition' 
      : topic.toLowerCase().includes('entren') || topic.toLowerCase().includes('ejercicio')
      ? 'drill_training'
      : topic.toLowerCase().includes('vestuario') || topic.toLowerCase().includes('ego')
      ? 'timeout_huddle'
      : 'tactics_board',
    content: `## El enfoque de banquillo ante ${topic.trim()}

A lo largo de mis 20 temporadas como entrenadora, tanto en mis etapas de formación en Cuba como en el baloncesto catalán en Barcelona, he constatado que los equipos no se distinguen únicamente por el talento físico de sus jugadores, sino por la claridad de sus conceptos cuando la presión aprieta.

> "El verdadero criterio táctico no consiste en memorizar 20 jugadas rígidas, sino en saber leer qué ventaja concede la defensa en cada posesión."

### 1. El error más común en la ejecución

Cuando analizamos **${topic.trim()}**, el fallo recurrente suele ser la precipitación y la falta de comunicación en la pista:

* **Pérdida de la distancia de seguridad (Spacing):** Si dos jugadores colapsan el mismo espacio, facilitan las ayudas defensivas del rival sin esfuerzo.
* **Falta de agresividad en el primer paso:** Cualquier maniobra ofensiva o defensiva debe ejecutarse con la convicción de ganar la posición antes del contacto.
* **El silencio en cancha:** Si el banquillo o los cinco de la pista no se comunican en voz alta, el rival siempre llevará la delantera en la toma de decisiones.

### 2. Ejercicio de aplicación para tus entrenamientos (3c3 Continuo)

Para interiorizar este concepto en las sesiones de lunes a viernes:

1. **Estructura:** Dividir la plantilla en tríos. El equipo defensor trabaja la rotación sin permitir canasta fácil en la pintura.
2. **Regla de oro:** Obligatorio dar un mínimo de 3 pases antes de cualquier lanzamiento exterior, salvo penetración directa clara.
3. **Puntaje especial:** Toda acción que premie el pase extra o la parada y lectura suma doble valor en el marcador del entrenamiento.

### Reflexión final para el entrenador

No te obsesiones con llenar la libreta de esquemas imposibles. Pregúntate si tus jugadores comprenden el *porqué* de cada movimiento. En la sencillez y la solidez de los fundamentos es donde se ganan los partidos en los minutos calientes del último cuarto.`
  };

  return res.status(200).json({ success: true, article: fallbackArticle, source: 'coach-tactics-engine' });
}
