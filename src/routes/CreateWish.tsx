import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos para los datos del deseo
interface WishData {
  title: string;
  description: string;
  motivation: string;
  coverImage: string | null;
}

interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  image: string | null;
}

// Ejemplos de motivaciones para el placeholder animado
const MOTIVATION_EXAMPLES = [
  "Cumplir mi sueño de viajar por el mundo",
  "Comprar mi primera casa",
  "Empezar mi propio negocio",
  "Pagar mis estudios universitarios",
  "Mejorar mi salud y bienestar",
  "Aprender un nuevo idioma",
  "Invertir en mi futuro",
  "Ayudar a mi familia",
  "Realizar un proyecto personal",
  "Lograr independencia financiera"
];

const CreateWish: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wishData, setWishData] = useState<WishData>({
    title: '',
    description: '',
    motivation: '',
    coverImage: null
  });
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [newGift, setNewGift] = useState<Omit<Gift, 'id'>>({
    name: '',
    description: '',
    price: 0,
    link: '',
    image: null
  });
  const [isTyping, setIsTyping] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  const typingInterval = useRef<number | null>(null);

  // Efecto para la animación de máquina de escribir
  useEffect(() => {
    if (currentStep === 2 && !isTyping) {
      startTypingAnimation();
    }

    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
    };
  }, [currentStep, isTyping]);

  const startTypingAnimation = () => {
    setIsTyping(true);
    let charIndex = 0;
    const example = MOTIVATION_EXAMPLES[currentExample];
    
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
    }

    typingInterval.current = window.setInterval(() => {
      if (charIndex <= example.length) {
        setWishData(prev => ({
          ...prev,
          motivation: example.substring(0, charIndex)
        }));
        charIndex++;
      } else {
        // Esperar un momento y cambiar al siguiente ejemplo
        setTimeout(() => {
          setCurrentExample(prev => (prev + 1) % MOTIVATION_EXAMPLES.length);
          charIndex = 0;
        }, 2000);
      }
    }, 100);
  };

  const handleInputChange = (field: keyof WishData, value: string) => {
    setWishData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGiftChange = (field: keyof Omit<Gift, 'id'>, value: string | number) => {
    setNewGift(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGift = () => {
    if (newGift.name.trim()) {
      const gift: Gift = {
        ...newGift,
        id: Date.now().toString()
      };
      setGifts(prev => [...prev, gift]);
      setNewGift({
        name: '',
        description: '',
        price: 0,
        link: '',
        image: null
      });
    }
  };

  const removeGift = (id: string) => {
    setGifts(prev => prev.filter(gift => gift.id !== id));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalizar creación y redirigir a la edición
      setIsEditing(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Aquí se conectaría con Directus
    console.log('Creando deseo:', wishData);
    console.log('Regalos:', gifts);
    
    // Redirigir al dashboard o a la página del deseo
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del deseo
              </label>
              <input
                type="text"
                value={wishData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Mi viaje a Japón"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={wishData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu deseo..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Por qué quieres esto?
              </label>
              <div className="relative">
                <textarea
                  value={wishData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  placeholder="Escribe tu motivación..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                {isTyping && (
                  <div className="absolute right-3 top-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ejemplos: {MOTIVATION_EXAMPLES[currentExample]}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de portada
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Subir imagen
                  </button>
                  {' o arrastrar y soltar'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editando tu deseo</h1>
            <p className="text-gray-600 mt-2">Agrega regalos para que otros puedan ayudarte</p>
          </div>

          {/* Vista previa del deseo */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">{wishData.title}</h2>
            <p className="text-gray-600 mb-4">{wishData.description}</p>
            <p className="text-sm text-gray-500 italic">"{wishData.motivation}"</p>
          </div>

          {/* Formulario para agregar regalos */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Agregar nuevo regalo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newGift.name}
                  onChange={(e) => handleGiftChange('name', e.target.value)}
                  placeholder="Nombre del regalo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  value={newGift.price}
                  onChange={(e) => handleGiftChange('price', Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={newGift.description}
                  onChange={(e) => handleGiftChange('description', e.target.value)}
                  placeholder="Descripción del regalo"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enlace (opcional)</label>
                <input
                  type="url"
                  value={newGift.link}
                  onChange={(e) => handleGiftChange('link', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={addGift}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar regalo
            </button>
          </div>

          {/* Lista de regalos */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Regalos agregados</h3>
            {gifts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No has agregado regalos aún</p>
            ) : (
              <div className="space-y-4">
                {gifts.map((gift) => (
                  <div key={gift.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">{gift.name}</h4>
                      <p className="text-sm text-gray-600">{gift.description}</p>
                      <p className="text-sm font-medium text-blue-600">${gift.price}</p>
                    </div>
                    <button
                      onClick={() => removeGift(gift.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver a editar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Finalizar y publicar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Crea tu deseo</h1>
          <p className="text-gray-600">Sigue estos pasos para crear tu deseo y que otros puedan ayudarte</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : currentStep > step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep === step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Nombre y descripción'}
                  {step === 2 && 'Motivación'}
                  {step === 3 && 'Imagen'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === 3 ? 'Continuar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWish;
