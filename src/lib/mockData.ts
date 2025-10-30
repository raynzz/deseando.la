import type { Wish, Event, Gift } from '../features/wishes/types'

// Datos de prueba para deseos
export const mockWishes: Wish[] = [
  {
    id: 1,
    title: 'Viaje a la Patagonia',
    description: 'Soñando con explorar los paisajes impresionantes de la Patagonia argentina, incluyendo glaciares, montañas y lagos cristalinos.',
    status: 'active',
    visibility: 'public',
    goal_amount: 150000,
    collected_amount: 45000,
    cover_image: null,
    owner: '1'
  },
  {
    id: 2,
    title: 'Curso de Fotografía Profesional',
    description: 'Me gustaría tomar un curso avanzado de fotografía para mejorar mis habilidades y poder capturar mejores momentos.',
    status: 'active',
    visibility: 'public',
    goal_amount: 25000,
    collected_amount: 12000,
    cover_image: null,
    owner: '2'
  },
  {
    id: 3,
    title: 'Kit de Músico para mi Hijo',
    description: 'Mi hijo de 10 años está mostrando mucho interés en la música. Me gustaría comprarle su primer instrumento.',
    status: 'active',
    visibility: 'public',
    goal_amount: 35000,
    collected_amount: 8000,
    cover_image: null,
    owner: '3'
  },
  {
    id: 4,
    title: 'Renovación del Jardín',
    description: 'Nuestro jardín necesita una renovación completa. Queremos crear un espacio verde y acogedor para la familia.',
    status: 'active',
    visibility: 'public',
    goal_amount: 80000,
    collected_amount: 25000,
    cover_image: null,
    owner: '4'
  },
  {
    id: 5,
    title: 'Equipo de Cocina Profesional',
    description: 'Soy chef aficionado y me gustaría invertir en equipo de cocina profesional para mejorar mis preparaciones.',
    status: 'active',
    visibility: 'public',
    goal_amount: 120000,
    collected_amount: 35000,
    cover_image: null,
    owner: '5'
  },
  {
    id: 6,
    title: 'Librería para la Comunidad',
    description: 'Quiero crear una pequeña librería comunitaria donde los niños puedan acceder a libros educativos y de entretenimiento.',
    status: 'active',
    visibility: 'public',
    goal_amount: 60000,
    collected_amount: 15000,
    cover_image: null,
    owner: '6'
  }
]

// Datos de prueba para eventos
export const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Charla sobre Viajes Sostenibles',
    description: 'Aprende cómo viajar de manera responsable y minimizar tu impacto ambiental en tus aventuras.',
    date: '2024-02-15T19:00:00Z',
    location: 'Centro Cultural, Buenos Aires',
    wish: 1
  },
  {
    id: 2,
    title: 'Taller de Fotografía Digital',
    description: 'Práctico taller para aprender los fundamentos de la fotografía digital y editar tus fotos.',
    date: '2024-02-20T14:00:00Z',
    location: 'Espacio Creativo, Córdoba',
    wish: 2
  },
  {
    id: 3,
    title: 'Concierto de Música Clásica',
    description: 'Disfruta de una velada con la Orquesta Sinfónica de la ciudad.',
    date: '2024-02-25T20:00:00Z',
    location: 'Teatro Municipal, Rosario',
    wish: 3
  }
]

// Datos de prueba para regalos
export const mockGifts: Gift[] = [
  {
    id: 1,
    title: 'Contribución al Viaje',
    description: 'Ayuda a financiar el viaje soñado a la Patagonia.',
    price: 5000,
    status: 'available',
    image: null,
    wish: 1
  },
  {
    id: 2,
    title: 'Lente Teleobjetivo',
    description: 'Lente profesional para fotografía de naturaleza.',
    price: 15000,
    status: 'reserved',
    image: null,
    wish: 2
  },
  {
    id: 3,
    title: 'Guitarra Acústica',
    description: 'Guitarra de buena calidad para principiantes.',
    price: 12000,
    status: 'available',
    image: null,
    wish: 3
  },
  {
    id: 4,
    title: 'Herramientas de Jardinería',
    description: 'Juego básico de herramientas para el jardín.',
    price: 8000,
    status: 'completed',
    image: null,
    wish: 4
  },
  {
    id: 5,
    title: 'Sartén Antiadherente',
    description: 'Sartén profesional de alta calidad.',
    price: 3500,
    status: 'available',
    image: null,
    wish: 5
  },
  {
    id: 6,
    title: 'Set de Libros Infantiles',
    description: 'Colección de libros educativos para niños.',
    price: 4500,
    status: 'completed',
    image: null,
    wish: 6
  }
]