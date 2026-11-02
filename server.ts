import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  INITIAL_ARTICLES,
  INITIAL_COMMENTS,
  INITIAL_SUBSCRIBERS,
  INITIAL_SETTINGS
} from './src/data/initialData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support large payloads (for base64 compressed images up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- PERSISTENT SERVER-SIDE STORAGE (server-data/) ---
const DATA_DIR = path.resolve(__dirname, 'server-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  writeJsonFile(filePath, fallback);
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize files if not existing
readJsonFile(ARTICLES_FILE, INITIAL_ARTICLES);
readJsonFile(COMMENTS_FILE, INITIAL_COMMENTS);
readJsonFile(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
readJsonFile(SETTINGS_FILE, INITIAL_SETTINGS);

// Initialize Google Gen AI client on the server side
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// --- REST API ENDPOINTS FOR MULTI-DEVICE CLOUD PERSISTENCE ---

// 1. Articles Sync: Merges client articles with server articles
app.post('/api/articles/sync', (req, res) => {
  const clientArticles = Array.isArray(req.body.articles) ? req.body.articles : [];
  let serverArticles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);

  let hasChanges = false;
  clientArticles.forEach((clientArt) => {
    if (!clientArt || !clientArt.id) return;
    const existingIndex = serverArticles.findIndex(
      (s) => s.id === clientArt.id || (clientArt.slug && s.slug === clientArt.slug)
    );
    if (existingIndex === -1) {
      // New article created by author on their local machine/browser!
      serverArticles.unshift(clientArt);
      hasChanges = true;
    } else {
      // Keep whichever has higher viewsCount or likesCount
      const existing = serverArticles[existingIndex];
      const merged = {
        ...existing,
        ...clientArt,
        viewsCount: Math.max(existing.viewsCount || 0, clientArt.viewsCount || 0),
        likesCount: Math.max(existing.likesCount || 0, clientArt.likesCount || 0)
      };
      serverArticles[existingIndex] = merged;
      hasChanges = true;
    }
  });

  if (hasChanges || !fs.existsSync(ARTICLES_FILE)) {
    writeJsonFile(ARTICLES_FILE, serverArticles);
    notifySearchEngines();
  }

  return res.json({ success: true, articles: serverArticles });
});

// 2. Get all articles
app.get('/api/articles', (_req, res) => {
  const articles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  return res.json({ success: true, articles });
});

// 3. Create or update article
app.post('/api/articles', (req, res) => {
  const article = req.body;
  if (!article || !article.title || !article.content) {
    return res.status(400).json({ success: false, error: 'Datos de artículo inválidos.' });
  }

  let serverArticles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const index = serverArticles.findIndex((a) => a.id === article.id);
  if (index >= 0) {
    serverArticles[index] = { ...serverArticles[index], ...article };
  } else {
    serverArticles.unshift(article);
  }
  writeJsonFile(ARTICLES_FILE, serverArticles);
  notifySearchEngines(article.slug);
  return res.json({ success: true, article });
});

// 4. Delete article
app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  let serverArticles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  serverArticles = serverArticles.filter((a) => a.id !== id);
  writeJsonFile(ARTICLES_FILE, serverArticles);

  // Also remove associated comments
  let comments = readJsonFile<any[]>(COMMENTS_FILE, INITIAL_COMMENTS);
  comments = comments.filter((c) => c.articleId !== id);
  writeJsonFile(COMMENTS_FILE, comments);

  return res.json({ success: true });
});

// 5. Like article
app.post('/api/articles/:id/like', (req, res) => {
  const { id } = req.params;
  let serverArticles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const item = serverArticles.find((a) => a.id === id);
  let likesCount = 0;
  if (item) {
    item.likesCount = (item.likesCount || 0) + 1;
    likesCount = item.likesCount;
    writeJsonFile(ARTICLES_FILE, serverArticles);
  }
  return res.json({ success: true, likesCount });
});

// 6. View article
app.post('/api/articles/:id/view', (req, res) => {
  const { id } = req.params;
  let serverArticles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const item = serverArticles.find((a) => a.id === id);
  let viewsCount = 0;
  if (item) {
    item.viewsCount = (item.viewsCount || 0) + 1;
    viewsCount = item.viewsCount;
    writeJsonFile(ARTICLES_FILE, serverArticles);
  }
  return res.json({ success: true, viewsCount });
});

// 7. Comments endpoints
app.get('/api/comments', (_req, res) => {
  const comments = readJsonFile<any[]>(COMMENTS_FILE, INITIAL_COMMENTS);
  return res.json({ success: true, comments });
});

app.post('/api/comments', (req, res) => {
  const comment = req.body;
  let comments = readJsonFile<any[]>(COMMENTS_FILE, INITIAL_COMMENTS);
  comments.unshift(comment);
  writeJsonFile(COMMENTS_FILE, comments);
  return res.json({ success: true, comment });
});

app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  let comments = readJsonFile<any[]>(COMMENTS_FILE, INITIAL_COMMENTS);
  comments = comments.filter((c) => c.id !== id);
  writeJsonFile(COMMENTS_FILE, comments);
  return res.json({ success: true });
});

// 8. Subscribers endpoints
app.get('/api/subscribers', (_req, res) => {
  const subscribers = readJsonFile<any[]>(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
  return res.json({ success: true, subscribers });
});

app.post('/api/subscribers', (req, res) => {
  const subscriber = req.body;
  let subscribers = readJsonFile<any[]>(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
  if (!subscribers.some((s) => s.email.toLowerCase() === subscriber.email?.toLowerCase())) {
    subscribers.unshift(subscriber);
    writeJsonFile(SUBSCRIBERS_FILE, subscribers);
  }
  return res.json({ success: true, subscriber });
});

app.delete('/api/subscribers/:id', (req, res) => {
  const { id } = req.params;
  let subscribers = readJsonFile<any[]>(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
  subscribers = subscribers.filter((s) => s.id !== id);
  writeJsonFile(SUBSCRIBERS_FILE, subscribers);
  return res.json({ success: true });
});

// 9. Settings endpoints
app.get('/api/settings', (_req, res) => {
  const settings = readJsonFile<any>(SETTINGS_FILE, INITIAL_SETTINGS);
  return res.json({ success: true, settings });
});

app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  writeJsonFile(SETTINGS_FILE, newSettings);
  return res.json({ success: true, settings: newSettings });
});

// 10. POST endpoint: /api/subscribers/sync - Forwards new subscriber to Google Sheet
app.post('/api/subscribers/sync', async (req, res) => {
  const { email, frequency, subscribedAt, source, webhookUrl } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Por favor ingresa un correo electrónico válido.' });
  }

  // Also save to server subscribers file
  let subscribers = readJsonFile<any[]>(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
  const cleaned = email.trim().toLowerCase();
  if (!subscribers.some((s) => s.email.toLowerCase() === cleaned)) {
    subscribers.unshift({
      id: 'sub-' + Date.now(),
      email: cleaned,
      frequency: frequency || 'semanal',
      subscribedAt: subscribedAt || new Date().toISOString().split('T')[0]
    });
    writeJsonFile(SUBSCRIBERS_FILE, subscribers);
  }

  const defaultWebhook = 'https://script.google.com/macros/s/AKfycbyAp_IwzOCSC2ANFgRDIegbQlsqa_t-VUGP6URVGzbZZ5wK6BjPwJpwRl8IRZrfTMF9/exec';
  const targetUrl = webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http') 
    ? webhookUrl 
    : defaultWebhook;

  try {
    const params = new URLSearchParams();
    params.append('email', cleaned);
    params.append('frequency', frequency || 'semanal');
    params.append('subscribedAt', subscribedAt || new Date().toISOString().split('T')[0]);
    params.append('source', source || 'Sidebar - Blog Pizarra & Criterio');

    const googleResponse = await fetch(targetUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      redirect: 'follow'
    });

    const responseText = await googleResponse.text();
    console.log(`[Google Sheets Webhook] Status: ${googleResponse.status}, Body: ${responseText.slice(0, 100)}`);

    return res.json({
      success: true,
      googleStatus: googleResponse.status,
      message: 'Suscripción sincronizada con tu Google Sheet correctamente.',
      details: responseText
    });
  } catch (error: any) {
    console.error('Error forwarding subscriber to Google Sheets:', error);
    return res.status(502).json({
      success: false,
      error: error?.message || 'Error al conectar con la hoja de cálculo de Google Sheets'
    });
  }
});

// 11. POST endpoint: /api/ai/generate-article
app.post('/api/ai/generate-article', async (req, res) => {
  const { topic, category, focus, notes } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'El tema del artículo es requerido.' });
  }

  // If Gemini API is available on the server, call the official SDK
  if (ai) {
    try {
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
        return res.json({ success: true, article: articleData, source: 'gemini-3.8-flash' });
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, using intelligent coach generator fallback:', apiError?.message || apiError);
    }
  }

  // Fallback generation: creates a tailored, high-grade basketball article for Leyanis Horta
  const fallbackArticle = generateFallbackBasketballArticle(topic, category, focus);
  return res.json({ success: true, article: fallbackArticle, source: 'coach-tactics-engine' });
});

// Helper function for intelligent fallback generation
function generateFallbackBasketballArticle(topic: string, cat?: string, _focus?: string) {
  const cleanCat = cat || 'Táctica de Baloncesto';
  const slugTopic = topic.trim();

  return {
    title: `${slugTopic}: Criterio táctico y lectura desde el banquillo`,
    excerpt: `Análisis detallado sobre ${slugTopic.toLowerCase()}. Cómo trasladar este concepto a la pista, evitar errores comunes y enriquecer la toma de decisiones.`,
    category: cleanCat,
    tags: ['Baloncesto', 'Pizarra', 'LecturaDeJuego', 'Entrenamiento'],
    readTimeMinutes: 5,
    imageTheme: topic.toLowerCase().includes('defens') || topic.toLowerCase().includes('balance') 
      ? 'defense_transition' 
      : topic.toLowerCase().includes('entren') || topic.toLowerCase().includes('ejercicio')
      ? 'drill_training'
      : topic.toLowerCase().includes('vestuario') || topic.toLowerCase().includes('ego')
      ? 'timeout_huddle'
      : 'tactics_board',
    content: `## El enfoque de banquillo ante ${slugTopic}

A lo largo de mis 20 temporadas como entrenadora, tanto en mis etapas de formación en Cuba como en el baloncesto catalán en Barcelona, he constatado que los equipos no se distinguen únicamente por el talento físico de sus jugadores, sino por la claridad de sus conceptos cuando la presión aprieta.

> "El verdadero criterio táctico no consiste en memorizar 20 jugadas rígidas, sino en saber leer qué ventaja concede la defensa en cada posesión."

### 1. El error más común en la ejecución

Cuando analizamos **${slugTopic}**, el fallo recurrente suele ser la precipitación y la falta de comunicación en la pista:

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
}

// --- BLOGGER-STYLE DYNAMIC SITEMAP, RSS & SEO AGENT DISCOVERY ---

// 1. Dynamic Sitemap (instantly lists all published articles as soon as they are saved)
app.get('/sitemap.xml', (_req, res) => {
  const articles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const siteUrl = 'https://www.baloncestonaranja.es';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: `${siteUrl}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/pizarra`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/sobre-mi`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/categorias`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/archivo`, lastmod: today, changefreq: 'weekly', priority: '0.7' }
  ];

  const articlePages = articles.map((art) => ({
    loc: `${siteUrl}/articulo/${art.slug || art.id}`,
    lastmod: art.publishedAt || today,
    changefreq: 'monthly',
    priority: '0.9'
  }));

  const allPages = [...staticPages, ...articlePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.send(xml);
});

// 2. Dynamic Blogger-Style RSS Feed (/rss.xml and /feeds/posts/default)
app.get(['/rss.xml', '/feed.xml', '/feeds/posts/default'], (req, res) => {
  const articles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const siteUrl = 'https://www.baloncestonaranja.es';

  const rssItems = articles
    .map((art) => {
      const artUrl = `${siteUrl}/articulo/${art.slug || art.id}`;
      const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();
      const cleanExcerpt = (art.excerpt || '').replace(/[<>&'"]/g, (c: string) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
      const cleanTitle = (art.title || '').replace(/[<>&'"]/g, (c: string) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });

      return `    <item>
      <title>${cleanTitle}</title>
      <link>${artUrl}</link>
      <guid isPermaLink="true">${artUrl}</guid>
      <description>${cleanExcerpt}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${art.category || 'Táctica de Baloncesto'}</category>
      <author>${art.author || 'Coach Leyanis Horta'}</author>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pizarra &amp; Criterio — Blog de Baloncesto</title>
    <link>${siteUrl}/</link>
    <description>Cuaderno de análisis táctico y reflexiones de banquillo por Coach Leyanis Horta</description>
    <language>es-es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.send(rss);
});

// 3. Atom Feed (/atom.xml)
app.get(['/atom.xml'], (_req, res) => {
  const articles = readJsonFile<any[]>(ARTICLES_FILE, INITIAL_ARTICLES);
  const siteUrl = 'https://www.baloncestonaranja.es';
  const updated = new Date().toISOString();

  const entries = articles
    .map((art) => {
      const artUrl = `${siteUrl}/articulo/${art.slug || art.id}`;
      return `  <entry>
    <title>${art.title}</title>
    <link href="${artUrl}" />
    <id>${artUrl}</id>
    <updated>${art.publishedAt ? `${art.publishedAt}T00:00:00Z` : updated}</updated>
    <summary>${art.excerpt || ''}</summary>
    <author>
      <name>${art.author || 'Coach Leyanis Horta'}</name>
    </author>
  </entry>`;
    })
    .join('\n');

  const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Pizarra &amp; Criterio — Blog de Baloncesto</title>
  <link href="${siteUrl}/" />
  <updated>${updated}</updated>
  <id>${siteUrl}/</id>
  <author>
    <name>Coach Leyanis Horta</name>
  </author>
${entries}
</feed>`;

  res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.send(atom);
});

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.resolve(__dirname, 'public', 'robots.txt'));
});

app.get('/llms.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.sendFile(path.resolve(__dirname, 'public', 'llms.txt'));
});

app.get(['/ai-catalog.json', '/.well-known/ai-catalog.json'], (_req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.sendFile(path.resolve(__dirname, 'public', 'ai-catalog.json'));
});

// Function to notify Google & search engines when a post is published (WebSub / Google Ping)
async function notifySearchEngines(articleSlug?: string) {
  try {
    const sitemapUrl = encodeURIComponent('https://www.baloncestonaranja.es/sitemap.xml');
    fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(() => {});
    console.log('[Blogger WebSub Ping] Notified Google Search Console of new content.');
  } catch (err) {
    console.warn('[Blogger Ping Error] Non-fatal ping error:', err);
  }
}

// Vite middleware setup
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
