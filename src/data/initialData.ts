import { Article, Comment, Subscriber, BlogSettings } from '../types/blog';

export const INITIAL_SETTINGS: BlogSettings = {
  blogTitle: "Pizarra & Criterio",
  blogSubtitle: "Cuaderno de análisis, metodología y vivencias desde el banquillo de baloncesto",
  authorName: "Coach Leyanis Horta",
  authorRole: "Licenciada en Deporte · Entrenadora de Baloncesto",
  authorBio: "Licenciada en Cultura Física y Deporte con 20 temporadas sentada en los banquillos desde Cuba hasta Barcelona, España. Defensora incondicional de la intensidad defensiva, el pase extra solidario y el juego por conceptos frente a las pizarras rígidas.",
  authorAvatar: "/src/assets/images/article_defense_transition_1792681001204.jpg",
  yearsOfExperience: 20,
  adminPin: "1234"
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    slug: "balance-defensivo-mayor-fallo-concentracion",
    title: "El arte del balance defensivo: Por qué recibir canastas tras tiro anotado es el mayor fallo de concentración",
    excerpt: "Celebrar una canasta propia o lamentarse de un fallo mientras el rival saca de fondo en dos segundos es el pecado capital de cualquier equipo. Desglosamos las normas innegociables para neutralizar la transición rápida.",
    content: `## La premisa que muchos olvidan

Durante mis 20 temporadas como entrenadora en los banquillos, desde mis inicios formativos en Cuba hasta las ligas en Barcelona y el baloncesto catalán, he visto perder más partidos en los primeros cuatro segundos tras anotar una canasta que en las posesiones finales de infarto. Existe una falsa sensación de alivio cuando el balón entra en el aro rival: el anotador sonríe, el banquillo aplaude y, en ese milisegundo de desconexión mental, el base contrario ya ha recibido el saque y un alero corre libre por la banda opuesta.

> "El ataque no termina cuando sueltas el balón hacia el aro; termina cuando los cinco jugadores han cruzado la línea de medio campo en posición defensiva."

### 1. Las tres responsabilidades innegociables tras el lanzamiento

Para que el balance defensivo funcione con la precisión de un reloj de cuerda, los roles deben estar interiorizados antes incluso de que el balón golpee el aro:

* **El balanceador primario (Safety):** Por norma, el jugador situado más arriba de la línea de tres puntos jamás acude al rebote de ataque. Su primer movimiento no es mirar el rebote, sino esprintar de espaldas a la canasta contraria para proteger la pintura de canastas fáciles.
* **El hostigador del primer pase:** El jugador más próximo al reboteador o al sacador tiene la obligación de incomodar la salida inmediata sin cometer faltas tontas, retrasando el contraataque directo al menos dos segundos valiosos.
* **La recuperación por carriles centrales:** Los otros tres jugadores deben regresar por el embudo central de la pista, jamás por las esquinas o bandas, cubriendo la espalda del compañero y cortando líneas de pase largas.

### 2. Hablar en la pista: la herramienta defensiva más infrautilizada

Muchos entrenadores jóvenes invierten horas en diseñar jugadas complejas en su pizarra y descuidan lo elemental: **el silencio defensivo es una invitación a la canasta fácil**. 

Un veterano no necesita saltar más que el rival si canta a viva voz: *"¡Tengo balón!", "¡Corto por el medio!", "¡Tiro fuera!"*. La comunicación genera confianza y alerta al compañero rezagado. Si en tu entrenamiento los chicos no gritan las asignaciones en el balance, tu defensa de fin de semana no resistirá ante un equipo con ritmo.

### Conclusión para el banquillo
No permitas que tus jugadores celebren antes de defender. La próxima vez que veas un vídeo de tu partido, cuenta cuántos puntos fáciles regaló tu equipo tras haber metido vosotros una canasta previa. Te sorprenderá comprobar que ahí suele estar la diferencia entre ganar o perder.`,
    category: "Táctica Defensiva",
    tags: ["BalanceDefensivo", "Transición", "Concentración", "Fundamentos"],
    author: "Coach Leyanis Horta",
    authorRole: "Licenciada en Deporte & Entrenadora",
    publishedAt: "2026-10-18",
    readTimeMinutes: 5,
    coverImage: "/src/assets/images/hero_basketball_tactics_1792680998647.jpg",
    status: "published",
    viewsCount: 342,
    likesCount: 29,
    featured: true
  },
  {
    id: "art-2",
    slug: "espaciamiento-pick-and-roll-moderno-espacios",
    title: "Espaciamiento y lectura en el Pick & Roll moderno: Claves para no saturar la pintura",
    excerpt: "El bloqueo directo se ha convertido en el recurso predominante a todos los niveles, pero a menudo se ejecuta sin comprender la geometría de la cancha. ¿Cómo generar ventajas reales sin asfixiar a los compañeros?",
    content: `## Cuando la moda supera a la comprensión del juego

Hoy en día, incluso en categorías infantiles y cadetes, se ven infinidad de bloqueos directos por posesión. Sin embargo, en ocho de cada diez ocasiones, el resultado es un atasco tremendo: tres defensores colapsando la zona porque los tiradores están a apenas dos metros del balón.

El bloqueo directo no es una jugada mágica; **es simplemente una herramienta para forzar una decisión en dos defensores**. Si el resto de los tres atacantes no mantienen la distancia reglamentaria y la amenaza constante, la defensa gana siempre.

### 1. El ángulo del bloqueo define el destino de la posesión

Uno de los errores más comunes en la enseñanza del Pick & Roll es permitir que el bloqueador coloque la pantalla perpendicular a la línea lateral. Un bloqueo plano o invertido abre caminos completamente distintos:

* **Bloqueo lateral (Side Pick):** Debe buscar encarrilar al manejador hacia el codo de la zona, obligando al defensor del bloqueador a elegir entre salir al 'drop', saltar al 'show' o cambiar.
* **Espacio en esquina contraria:** La esquina del lado débil debe estar siempre ocupada por una amenaza real de tiro. Si ese jugador corta antes de tiempo hacia el aro, trae a su defensor justo donde el base intenta penetrar o doblar.

### 2. Paciencia en la lectura del bote

Los bases experimentados saben que tras superar el bloqueo no hay que correr desesperadamente hacia el tablero. Hay que poner al defensor en la cadera (*'snake dribble'* o frenada) y leer si el pívot rival sube o si la ayuda viene del alero de lado débil.

### La regla de los cuatro metros
Para mí, como regla de oro en mis equipos: **nunca dos jugadores a menos de cuatro metros de distancia en el lado del balón**, salvo en el momento exacto del contacto del bloqueo. La geometría castiga a quien no respeta los espacios.`,
    category: "Ataque por Conceptos",
    tags: ["PickAndRoll", "Spacing", "LecturaDeJuego", "TomaDeDecisiones"],
    author: "Coach Leyanis Horta",
    authorRole: "Licenciada en Deporte & Entrenadora",
    publishedAt: "2026-10-12",
    readTimeMinutes: 6,
    coverImage: "/src/assets/images/article_pick_and_roll_1792680999088.jpg",
    status: "published",
    viewsCount: 518,
    likesCount: 44,
    featured: false
  },
  {
    id: "art-3",
    slug: "gestion-vestuario-soledad-banquillo-liderazgo",
    title: "La soledad del banquillo y la gestión de egos: Lo que los manuales técnicos callan",
    excerpt: "Puedes conocer al detalle todas las variantes de la defensa en zona o de la salida de presión, pero si no eres capaz de mirar a los ojos a un jugador descontento por sus minutos, tu pizarra no servirá de nada.",
    content: `## El verdadero examen no está en la pizarra

Cuando obtienes la licenciatura en deporte y las máximas titulaciones de entrenadora, te enseñan biomecánica, periodización del entrenamiento, fisiología del esfuerzo y sistemas tácticos complejos. Pero nadie te entrega un manual sobre cómo gestionar al jugador estrella que pone mala cara al ser sustituido, ni sobre cómo sostener el ánimo del chico número doce que entrena con el alma cada martes y apenas disputa dos minutos el sábado.

En mis 20 años en los banquillos, viviendo la pasión del baloncesto caribeño en Cuba y la exigencia competitiva en Barcelona, he aprendido que el liderazgo real se forja en el trato humano.

### 1. La honestidad como único principio innegociable

En mis años de experiencia he aprendido que los jugadores perdonan que te equivoques en un cambio táctico o en un tiempo muerto; lo que jamás perdonan es la falta de coherencia y el engaño piadoso.

* No prometas minutos a nadie antes de empezar la temporada.
* Explica a cada jugador cuál es su rol específico hoy, y qué debe hacer para ampliarlo mañana.
* Trata a todos con el mismo respeto humano, aunque no les des los mismos minutos en pista. La igualdad no significa regalar tiempo de juego, sino ofrecer las mismas oportunidades de aprender.

### 2. Saber escuchar antes del grito

Muchos entrenadores antiguos caían en el error del autoritarismo de choque. Yo misma, en mis primeros años de juventud, creía que elevar la voz en los descansos demostraba pasión. Con los años comprendí que **el grito continuo aturde al jugador y anula su capacidad de pensar por sí mismo**. En momentos de máxima tensión, el tono sereno y las tres instrucciones claras son mil veces más eficaces que un discurso furibundo.`,
    category: "Gestión de Vestuario",
    tags: ["Liderazgo", "Vestuario", "Psicología", "Comunicación"],
    author: "Coach Leyanis Horta",
    authorRole: "Licenciada en Deporte & Entrenadora",
    publishedAt: "2026-10-05",
    readTimeMinutes: 7,
    coverImage: "/src/assets/images/article_defense_transition_1792681001204.jpg",
    status: "published",
    viewsCount: 620,
    likesCount: 61,
    featured: false
  },
  {
    id: "art-4",
    slug: "valor-formativo-pase-extra-menos-botes",
    title: "El valor formativo del pase extra: Menos botes indiscriminados y más juego colectivo",
    excerpt: "¿Por qué tantos jóvenes botan el balón de manera automática en cuanto lo reciben? Reflexión sobre la importancia de enseñar la triple amenaza y el hábito solidario de buscar el tiro abierto.",
    content: `## El vicio del bote en la recepción

Observen cualquier partido de categorías alevín, infantil o incluso junior: el jugador recibe un pase perfecto y, de manera casi refleja y sin levantar la cabeza, da un bote en el sitio. En ese único segundo perdido, la ventaja táctica generada por su compañero se evapora por completo.

El balón viaja por el aire diez veces más rápido de lo que cualquier jugador puede correr o botar. Cuando insistimos en el pase extra, no solo estamos buscando una mejor estadística de tiro; estamos construyendo un equipo con alma solidaria.

### Principios para desterrar el bote innecesario en los entrenamientos:

1. **Jugar situaciones de 3c3 y 4c4 con límite de 2 botes por jugador:** Al principio habrá protestas y pérdidas de balón, pero pronto empezarán a moverse sin balón, a cortar puertas atrás y a buscar la espalda de la defensa.
2. **Recompensar el pase del que nace la asistencia (el 'hockey pass'):** La estadística no suele registrar al jugador que dio el pase inicial que descolocó a la defensa, pero en el vídeo de vestuario debe ser elogiado con el mismo énfasis.
3. **La regla del tiro bueno frente al tiro excelente:** Un tiro libre de marca desde 5 metros es un buen tiro; si das un pase adicional a la esquina para un compañero completamente solo, es un tiro excelente.`,
    category: "Desarrollo de Fundamentos",
    tags: ["Pases", "Cantera", "Fundamentos", "Colectivo"],
    author: "Coach Leyanis Horta",
    authorRole: "Licenciada en Deporte & Entrenadora",
    publishedAt: "2026-09-24",
    readTimeMinutes: 4,
    coverImage: "/src/assets/images/article_fundamentals_coaching_1792680999886.jpg",
    status: "published",
    viewsCount: 412,
    likesCount: 38,
    featured: false
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c-1",
    articleId: "art-1",
    articleTitle: "El arte del balance defensivo",
    authorName: "Carlos Alarcón",
    authorRole: "Entrenador Cadete Autonómico",
    email: "alarcon.basket@example.com",
    text: "Totalmente de acuerdo, entrenadora Leyanis. En Cataluña sufríamos mucho por la manía de los chicos de quedarse mirando si el tiro entraba en lugar de correr al balance. Implementamos tu norma de que el base no pisa la zona ofensiva y redujimos 12 puntos en contra por partido.",
    createdAt: "2026-10-19T10:30:00Z",
    status: "approved"
  },
  {
    id: "c-2",
    articleId: "art-1",
    articleTitle: "El arte del balance defensivo",
    authorName: "Javier Montero",
    authorRole: "Árbitro y formador",
    email: "montero.arbitros@example.com",
    text: "Desde la perspectiva arbitral se ve clarísimo. Las faltas antideportivas de frustración suelen ocurrir justo en esas transiciones rápidas mal balanceadas. Gran artículo, claro y pedagógico.",
    createdAt: "2026-10-20T16:15:00Z",
    status: "approved"
  },
  {
    id: "c-3",
    articleId: "art-3",
    articleTitle: "La soledad del banquillo y la gestión de egos",
    authorName: "Sonia Peñalver",
    authorRole: "Directora Técnica de Cantera",
    email: "sonia.penalver@example.com",
    text: "Hacía falta leer un texto así, Leyanis. Muchos entrenadores se obsesionan con el playbook y olvidan que estamos tratando con personas. Se nota tu experiencia en tantos banquillos.",
    createdAt: "2026-10-06T11:45:00Z",
    status: "approved"
  }
];

export const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: "sub-1",
    email: "entrenadores.bcn@example.com",
    frequency: "semanal",
    subscribedAt: "2026-10-01"
  },
  {
    id: "sub-2",
    email: "basket.cuba.formacion@example.com",
    frequency: "semanal",
    subscribedAt: "2026-10-14"
  }
];
