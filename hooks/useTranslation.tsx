import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Language } from '../types';

const enTranslations = {
  "navbar": {
    "home": "Home",
    "generator": "Director's Cut",
    "studio": "The Studio",
    "credits": "Credits"
  },
  "common": {
    "back": "Back"
  },
  "home": {
    "title": {
      "part1": "You are the Agency.",
      "part2": "This is your Studio."
    },
    "subtitle": "Stop struggling with complex video software and production costs. With Kineo AI, you deliver stunning, cinematic ads to your clients effortlessly. You direct. You win.",
    "createButton": "Create Now",
    "howItWorks": {
      "title": "Your Workflow to Success",
      "card1": {
        "title": "1. Director's Cut",
        "description": "Use our AI video generator. Upload a client's photo, write a compelling script, and generate a hyper-realistic cinematic ad in minutes."
      },
      "card2": {
        "title": "2. Showcase & Impress",
        "description": "All your creations are saved in a private gallery. Present your clients with professional, shareable links to the videos you've produced."
      },
      "card3": {
        "title": "3. Track Your Wins",
        "description": "Use your private dashboard to log every project, track your revenue, and watch your agency grow. This is your business, your numbers."
      }
    }
  },
  "generator": {
    "header": {
      "title": "Pre-Production Suite",
      "subtitle": "Compose your cinematic ad with professional tools. Pre-visualize with storyboards, direct the visuals, and script the voiceover."
    },
    "stepper": {
      "step1": "Concept",
      "step2": "Script & Storyboard",
      "step3": "Generate",
      "step4": "Post-Production"
    },
    "apiKeyScreen": {
      "title": "API Key Configuration",
      "subtitle": "Your key is stored securely in your browser and is never sent to our servers.",
      "inputPlaceholder": "Enter your API Key here",
      "saveButton": "Save and Continue",
      "getYourKey": {
        "prefix": "You can get your free API key from ",
        "link": "Google AI Studio"
      },
      "billingInfo": {
        "prefix": "For more information, see the",
        "link": "billing documentation"
      }
    },
     "projectLink": {
      "title": "Link to Project",
      "subtitle": "Assign this video to a client project from your dashboard to keep everything organized.",
      "noProjectSelected": "Don't assign to a project"
    },
    "aiCoDirector": {
      "title": "AI Co-Director",
      "subtitle": "Describe your central idea, and let the AI propose a professional script.",
      "ideaPlaceholder": "e.g., A luxury coffee ad evoking warmth and exclusivity.",
      "generateButton": "Generate Script with AI",
      "generatingButton": "Generating Script..."
    },
    "shotComposer": {
      "title": "Shot Composer",
      "addShotButton": "+ Add Shot",
      "visualsLabel": "Visuals",
      "voLabel": "Voiceover (V.O.)",
      "visualsPlaceholder": "Description for shot {shotNumber} visuals...",
      "voPlaceholder": "Voiceover script for this shot...",
      "storyboardLabel": "Storyboard",
      "generateStoryboardButton": "Generate",
      "generatingStoryboardButton": "Generating..."
    },
    "results": {
      "videoTitle": "Final Cut",
      "voTitle": "Voiceover Studio",
      "voSubtitle": "Generate a professional, studio-quality voiceover track for your video.",
      "generateVoButton": "Generate Voiceover",
      "downloadVoButton": "Download Voiceover (.wav)",
      "importVoButton": "Import from Vault"
    },
    "postProduction": {
        "title": "The Assembly Room - Post-Production",
        "timeline": {
          "title": "Timeline Editor",
          "shot": "Shot",
          "reshootButton": "Reshoot"
        },
        "soundtrack": {
            "title": "Soundtrack & Mixing",
            "noMusic": "No Music",
            "epic": "Epic",
            "inspiring": "Inspiring",
            "ambient": "Ambient",
            "musicVolume": "Music Volume",
            "voVolume": "Voiceover Volume"
        },
        "overlays": {
            "title": "Titles & Graphics",
            "textLabel": "Text Overlay",
            "textPlaceholder": "e.g., Available Now",
            "positionLabel": "Position",
            "positions": {
                "topLeft": "Top Left",
                "topCenter": "Top Center",
                "topRight": "Top Right",
                "bottomLeft": "Bottom Left",
                "bottomCenter": "Bottom Center",
                "bottomRight": "Bottom Right"
            },
            "showLogo": "Add Studio Logo"
        },
        "saveButton": "Save to The Studio",
        "saveChangesButton": "Save Changes"
    },
    "generateButton": "Generate Cinematic Video",
    "generateButtonCta": "Generate Video ({credits} Credits)",
    "generatingShot": "Generating shot {current} of {total}...",
    "readyToDirectTitle": "Ready to Direct?",
    "readyToDirectSubtitle": "You're about to generate a cinematic video with {count} shots. This action will consume {count} Render Credits.",
    "newSceneDefaultText": "New scene visuals...",
    "loadingMessages": [
      "Warming up the digital director...",
      "Compositing the scenes...",
      "Adjusting the lighting...",
      "Applying cinematic color grading...",
      "Rendering the final cut...",
      "This can take a few minutes, great art needs patience!",
      "Adding a touch of magic...",
      "Finalizing the 8K masterpiece..."
    ],
    "errors": {
      "uploadPhoto": "Please upload a photo to start.",
      "fillAllShots": "Please ensure all visual descriptions are filled out.",
      "unknownError": "An unknown error occurred.",
      "generationFailed": "Video generation failed",
      "apiKeyMissing": "Please enter a valid API key.",
      "apiKeyInvalid": "Your API Key is invalid or has insufficient permissions. Please enter a new one.",
      "ideaMissing": "Please provide a central idea.",
      "scriptGenerationFailed": "AI script generation failed.",
      "storyboardGenerationFailed": "Storyboard generation failed.",
      "voGenerationFailed": "Voiceover generation failed.",
      "voScriptMissing": "Please write a voiceover script before generating audio.",
      "outOfCredits": "You are out of Render Credits. Please purchase more.",
      "outOfCreditsMultiple": "You need {required} credits to generate all shots, but you only have {available}.",
      "outOfCreditsButton": "Out of Credits"
    },
    "initialPrompt": "Shot 1: The Frustration (Seconds 0-4) - A small business owner sighs, scrolling through their social media feed on a phone. They see a competitor's slick, cinematic video ad getting tons of engagement.\\n\\nShot 2: The Comparison (Seconds 4-7) - They switch to their own ad. It's a static, boring image with text. The likes are minimal. The environment is their dimly lit office at night, emphasizing their struggle.\\n\\nShot 3: The Spark of Kineo AI (Seconds 7-12) - Their screen magically transitions. The static image comes to life, transforming into a beautiful, dynamic video scene, showcasing the power of AI generation. A look of hope and excitement dawns on their face."
  },
   "studio": {
    "header": {
      "title": "The Studio",
      "subtitle": "Your central workspace to manage all client projects and creative assets."
    },
    "stats": {
      "totalRevenue": "Total Revenue",
      "completedProjects": "Completed Projects",
      "totalVideos": "Total Videos Generated"
    },
    "addProject": {
      "title": "Create New Project",
      "clientName": "Client Name",
      "projectName": "Project Name",
      "price": "Price ($)",
      "addButton": "Create Project"
    },
    "projectList": {
      "title": "All Projects",
      "deleteConfirmation": "Are you sure you want to delete this project? This will also unlink it from any videos."
    },
    "projectCard": {
      "videos": "videos"
    },
    "projectDetail": {
      "backToStudio": "Back to The Studio",
      "createVideo": "Create New Video"
    },
    "projectStatus": {
      "completed": "Completed",
      "inProgress": "In Progress"
    },
    "noAssets": {
      "title": "This Project is Empty",
      "subtitle": "Get started by creating a video. All assets will be automatically saved here."
    },
    "viewDetailsButton": "View Details",
    "unassignedProject": "Unassigned Project",
    "deleteVideoConfirmation": "Are you sure you want to permanently delete this video and all its associated assets (storyboard, audio)? This action cannot be undone.",
    "viewModes": {
      "gallery": "Gallery",
      "performance": "Performance"
    }
  },
  "videoModal": {
    "title": "Video Details",
    "fullPrompt": "Full Prompt (Visuals Only)",
    "videoNotSupported": "Your browser does not support the video tag.",
     "shareLink": {
      "copyButton": "Share with Client",
      "copied": "Copied to clipboard!"
    },
    "markCompleteButton": "Mark Project as Complete",
    "deleteButton": "Delete Asset",
    "editButton": "Edit in Assembly Room",
    "tabs": {
        "details": "Details",
        "assets": "Assets",
        "notes": "Notes",
        "performance": "Performance"
    },
    "assets": {
        "storyboard": "Storyboard",
        "voiceover": "Voiceover Audio",
        "notGenerated": "Not generated for this project."
    },
    "postProduction": {
        "title": "Post-Production Details",
        "music": "Soundtrack",
        "textOverlay": "Text Overlay"
    },
    "notes": {
        "title": "Director's Notes",
        "addNote": "Add a Note",
        "timestampPlaceholder": "Time in seconds (e.g., 4.5)",
        "commentPlaceholder": "Type your note here...",
        "saveNoteButton": "Save Note",
        "noNotes": "No notes for this video yet."
    }
  },
  "presentationPage": {
    "title": "Project Presentation",
    "promptHeader": "Script (Visuals)",
    "notesHeader": "Director's Notes"
  },
  "billingPage": {
    "header": {
      "title": "Billing & Plans",
      "subtitle": "Purchase Render Credits to continue creating cinematic videos for your clients."
    },
    "pack": {
      "title": "{credits} Credits",
      "price": "${price}",
      "purchaseButton": "Purchase Pack",
      "popular": "Most Popular"
    }
  },
  "assetPicker": {
      "title": "Select an Asset from The Vault",
      "selectButton": "Select"
  },
  "analytics": {
    "kpi": {
      "views": "Views",
      "ctr": "CTR",
      "cpa": "CPA"
    },
    "retention": {
      "title": "Audience Retention",
      "peak": "Peak Retention"
    },
    "project": {
      "totalViews": "Total Project Views",
      "avgCtr": "Avg. Click-Through Rate",
      "avgCpa": "Avg. Cost Per Acquisition"
    },
    "aiAnalysis": {
      "title": "AI Performance Insights",
      "button": "Get AI Analysis",
      "loading": "Analyzing...",
      "error": "Failed to get analysis. Please try again."
    },
    "variations": {
      "title": "A/B Test Variations",
      "button": "Generate Variations",
      "loading": "Generating Variations...",
      "error": "Failed to generate variations. Please try again."
    }
  },
  "assistant": {
    "tooltip": {
      "activate": "Activate AI Assistant",
      "deactivate": "Deactivate AI Assistant"
    },
    "status": {
      "listening": "Listening...",
      "thinking": "Thinking...",
      "speaking": "Speaking...",
      "error": "Error"
    },
    "response": {
      "projectCreated": "OK, I've created the project {projectName} for you.",
      "navigating": "Navigating to {page}.",
      "startingVideo": "Alright, let's start a new video for {projectName}.",
      "error": "Sorry, I couldn't do that."
    }
  }
};

const esTranslations = {
  "navbar": {
    "home": "Inicio",
    "generator": "Corte del Director",
    "studio": "El Estudio",
    "credits": "Créditos"
  },
  "common": {
    "back": "Volver"
  },
  "home": {
    "title": {
      "part1": "Tú eres la Agencia.",
      "part2": "Este es tu Estudio."
    },
    "subtitle": "Deja de luchar con software de video complejo y costos de producción. Con Kineo AI, entregas anuncios cinematográficos impresionantes a tus clientes sin esfuerzo. Tú diriges. Tú ganas.",
    "createButton": "Crear Ahora",
    "howItWorks": {
      "title": "Tu Flujo de Trabajo hacia el Éxito",
      "card1": {
        "title": "1. Corte del Director",
        "description": "Usa nuestro generador de video con IA. Sube una foto de un cliente, escribe un guion convincente y genera un anuncio cinematográfico hiperrealista en minutos."
      },
      "card2": {
        "title": "2. Exhibe e Impresiona",
        "description": "Todas tus creaciones se guardan en una galería privada. Presenta a tus clientes enlaces profesionales y compartibles de los videos que has producido."
      },
      "card3": {
        "title": "3. Mide Tus Victorias",
        "description": "Usa tu panel privado para registrar cada proyecto, seguir tus ingresos y ver crecer tu agencia. Este es tu negocio, tus números."
      }
    }
  },
  "generator": {
    "header": {
      "title": "Suite de Pre-Producción",
      "subtitle": "Compón tu anuncio con herramientas profesionales. Pre-visualiza con storyboards, dirige los visuales y escribe la voz en off."
    },
    "stepper": {
      "step1": "Concepto",
      "step2": "Guion y Storyboard",
      "step3": "Generación",
      "step4": "Post-Producción"
    },
    "apiKeyScreen": {
      "title": "Configuración de Clave de API",
      "subtitle": "Tu clave se guarda de forma segura en tu navegador y nunca se envía a nuestros servidores.",
      "inputPlaceholder": "Introduce tu Clave de API aquí",
      "saveButton": "Guardar y Continuar",
      "getYourKey": {
        "prefix": "Puedes obtener tu clave de API gratuita desde ",
        "link": "Google AI Studio"
      },
      "billingInfo": {
        "prefix": "Para más información, consulta la",
        "link": "documentación de facturación"
      }
    },
    "projectLink": {
      "title": "Vincular a Proyecto",
      "subtitle": "Asigna este video a un proyecto de cliente de tu panel para mantener todo organizado.",
      "noProjectSelected": "No asignar a un proyecto"
    },
    "aiCoDirector": {
      "title": "Co-Director de IA",
      "subtitle": "Describe tu idea central y deja que la IA te proponga un guion profesional.",
      "ideaPlaceholder": "ej., Un anuncio de café de lujo que evoca calidez y exclusividad.",
      "generateButton": "Generar Guion con IA",
      "generatingButton": "Generando Guion..."
    },
    "shotComposer": {
      "title": "Compositor de Tomas",
      "addShotButton": "+ Añadir Toma",
      "visualsLabel": "Visuales",
      "voLabel": "Voz en Off (V.O.)",
      "visualsPlaceholder": "Descripción para los visuales de la toma {shotNumber}...",
      "voPlaceholder": "Guion de voz en off para esta toma...",
      "storyboardLabel": "Storyboard",
      "generateStoryboardButton": "Generar",
      "generatingStoryboardButton": "Generando..."
    },
     "results": {
      "videoTitle": "Corte Final",
      "voTitle": "Estudio de Voz en Off",
      "voSubtitle": "Genera una pista de voz en off profesional con calidad de estudio para tu video.",
      "generateVoButton": "Generar Voz en Off",
      "downloadVoButton": "Descargar Voz en Off (.wav)",
      "importVoButton": "Importar desde La Bóveda"
    },
    "postProduction": {
        "title": "La Sala de Montaje - Post-Producción",
        "timeline": {
          "title": "Editor de Línea de Tiempo",
          "shot": "Toma",
          "reshootButton": "Re-filmar"
        },
        "soundtrack": {
            "title": "Banda Sonora y Mezcla",
            "noMusic": "Sin Música",
            "epic": "Épica",
            "inspiring": "Inspiradora",
            "ambient": "Ambiental",
            "musicVolume": "Volumen de la Música",
            "voVolume": "Volumen de Voz en Off"
        },
        "overlays": {
            "title": "Títulos y Gráficos",
            "textLabel": "Texto Superpuesto",
            "textPlaceholder": "ej., Disponible Ahora",
            "positionLabel": "Posición",
            "positions": {
                "topLeft": "Superior Izquierda",
                "topCenter": "Superior Centro",
                "topRight": "Superior Derecha",
                "bottomLeft": "Inferior Izquierda",
                "bottomCenter": "Inferior Centro",
                "bottomRight": "Inferior Derecha"
            },
            "showLogo": "Añadir Logo del Estudio"
        },
        "saveButton": "Guardar en El Estudio",
        "saveChangesButton": "Guardar Cambios"
    },
    "generateButton": "Generar Video Cinemático",
    "generateButtonCta": "Generar Video ({credits} Créditos)",
    "generatingShot": "Generando toma {current} de {total}...",
    "readyToDirectTitle": "¿Listo para Dirigir?",
    "readyToDirectSubtitle": "Estás a punto de generar un video cinemático con {count} tomas. Esta acción consumirá {count} Créditos de Renderizado.",
    "newSceneDefaultText": "Nuevos visuales de escena...",
    "loadingMessages": [
      "Calentando al director digital...",
      "Componiendo las escenas...",
      "Ajustando la iluminación...",
      "Aplicando gradación de color cinemática...",
      "Renderizando el corte final...",
      "Esto puede tardar unos minutos, ¡el gran arte requiere paciencia!",
      "Añadiendo un toque de magia...",
      "Finalizando la obra maestra 8K..."
    ],
    "errors": {
      "uploadPhoto": "Por favor, sube una foto para empezar.",
      "fillAllShots": "Por favor, asegúrate de que todas las descripciones visuales estén completas.",
      "unknownError": "Ocurrió un error desconocido.",
      "generationFailed": "La generación del video falló",
      "apiKeyMissing": "Por favor, introduce una clave de API válida.",
      "apiKeyInvalid": "Tu Clave de API no es válida o no tiene permisos suficientes. Por favor, introduce una nueva.",
      "ideaMissing": "Por favor, proporciona una idea central.",
      "scriptGenerationFailed": "La generación de guion con IA falló.",
      "storyboardGenerationFailed": "La generación de storyboard falló.",
      "voGenerationFailed": "La generación de la voz en off falló.",
      "voScriptMissing": "Por favor, escribe un guion de voz en off antes de generar el audio.",
      "outOfCredits": "Te has quedado sin Créditos de Renderizado. Por favor, compra más.",
      "outOfCreditsMultiple": "Necesitas {required} créditos para generar todas las tomas, pero solo tienes {available}.",
      "outOfCreditsButton": "Sin Créditos"
    },
    "initialPrompt": "Toma 1: La Frustración (Segundos 0-4) - El dueño de una pequeña empresa suspira, navegando por sus redes sociales en un teléfono. Ve el anuncio de video cinematográfico de un competidor obteniendo muchísima interacción.\\n\\nToma 2: La Comparación (Segundos 4-7) - Cambia a su propio anuncio. Es una imagen estática y aburrida con texto. Los 'me gusta' son mínimos. El entorno es su oficina con poca luz por la noche, enfatizando su lucha.\\n\\nToma 3: La Chispa de Kineo AI (Segundos 7-12) - Su pantalla hace una transición mágica. La imagen estática cobra vida, transformándose en una hermosa y dinámica escena de video, mostrando el poder de la generación por IA. Una expresión de esperanza y emoción aparece en su rostro."
  },
  "studio": {
    "header": {
      "title": "El Estudio",
      "subtitle": "Tu espacio de trabajo central para gestionar todos los proyectos de clientes y activos creativos."
    },
    "stats": {
      "totalRevenue": "Ingresos Totales",
      "completedProjects": "Proyectos Completados",
      "totalVideos": "Videos Generados Totales"
    },
    "addProject": {
      "title": "Crear Nuevo Proyecto",
      "clientName": "Nombre del Cliente",
      "projectName": "Nombre del Proyecto",
      "price": "Precio ($)",
      "addButton": "Crear Proyecto"
    },
    "projectList": {
      "title": "Todos los Proyectos",
      "deleteConfirmation": "¿Estás seguro de que quieres eliminar este proyecto? Esto también lo desvinculará de cualquier video."
    },
    "projectCard": {
      "videos": "videos"
    },
    "projectDetail": {
      "backToStudio": "Volver a El Estudio",
      "createVideo": "Crear Nuevo Video"
    },
    "projectStatus": {
      "completed": "Completado",
      "inProgress": "En Progreso"
    },
    "noAssets": {
      "title": "Este Proyecto está Vacío",
      "subtitle": "Comienza creando un video. Todos los activos se guardarán aquí automáticamente."
    },
    "viewDetailsButton": "Ver Detalles",
    "unassignedProject": "Proyecto sin Asignar",
    "deleteVideoConfirmation": "¿Estás seguro de que quieres eliminar permanentemente este video y todos sus activos asociados (storyboard, audio)? Esta acción no se puede deshacer.",
    "viewModes": {
      "gallery": "Galería",
      "performance": "Rendimiento"
    }
  },
  "videoModal": {
    "title": "Detalles del Video",
    "fullPrompt": "Guion Completo (Solo Visuales)",
    "videoNotSupported": "Tu navegador no soporta la etiqueta de video.",
    "shareLink": {
      "copyButton": "Compartir con Cliente",
      "copied": "¡Copiado al portapapeles!"
    },
    "markCompleteButton": "Marcar Proyecto como Completado",
    "deleteButton": "Eliminar Activo",
    "editButton": "Editar en Sala de Montaje",
    "tabs": {
        "details": "Detalles",
        "assets": "Activos",
        "notes": "Notas",
        "performance": "Rendimiento"
    },
    "assets": {
        "storyboard": "Storyboard",
        "voiceover": "Audio de Voz en Off",
        "notGenerated": "No generado para este proyecto."
    },
    "postProduction": {
        "title": "Detalles de Post-Producción",
        "music": "Banda Sonora",
        "textOverlay": "Texto Superpuesto"
    },
    "notes": {
        "title": "Notas del Director",
        "addNote": "Añadir una Nota",
        "timestampPlaceholder": "Tiempo en segundos (ej., 4.5)",
        "commentPlaceholder": "Escribe tu nota aquí...",
        "saveNoteButton": "Guardar Nota",
        "noNotes": "Aún no hay notas para este video."
    }
  },
  "presentationPage": {
    "title": "Presentación del Proyecto",
    "promptHeader": "Guion (Visuales)",
    "notesHeader": "Notas del Director"
  },
  "billingPage": {
    "header": {
      "title": "Facturación y Planes",
      "subtitle": "Compra Créditos de Renderizado para seguir creando videos cinematográficos para tus clientes."
    },
    "pack": {
      "title": "{credits} Créditos",
      "price": "${price}",
      "purchaseButton": "Comprar Paquete",
      "popular": "Más Popular"
    }
  },
  "assetPicker": {
    "title": "Seleccionar un Activo de La Bóveda",
    "selectButton": "Seleccionar"
  },
  "analytics": {
    "kpi": {
      "views": "Vistas",
      "ctr": "CTR",
      "cpa": "CPA"
    },
    "retention": {
      "title": "Retención de Audiencia",
      "peak": "Retención Máxima"
    },
    "project": {
      "totalViews": "Vistas Totales del Proyecto",
      "avgCtr": "Tasa de Clics Promedio",
      "avgCpa": "Costo por Adquisición Prom."
    },
    "aiAnalysis": {
      "title": "Análisis de Rendimiento por IA",
      "button": "Obtener Análisis de IA",
      "loading": "Analizando...",
      "error": "Fallo al obtener el análisis. Por favor, inténtalo de nuevo."
    },
    "variations": {
      "title": "Variaciones para Pruebas A/B",
      "button": "Generar Variaciones",
      "loading": "Generando Variaciones...",
      "error": "Fallo al generar variaciones. Por favor, inténtalo de nuevo."
    }
  },
  "assistant": {
    "tooltip": {
      "activate": "Activar Asistente de IA",
      "deactivate": "Desactivar Asistente de IA"
    },
    "status": {
      "listening": "Escuchando...",
      "thinking": "Pensando...",
      "speaking": "Hablando...",
      "error": "Error"
    },
    "response": {
      "projectCreated": "OK, he creado el proyecto {projectName} para ti.",
      "navigating": "Navegando a {page}.",
      "startingVideo": "Muy bien, empecemos un nuevo video para {projectName}.",
      "error": "Lo siento, no pude hacer eso."
    }
  }
};


const translationsData = {
  en: enTranslations,
  es: esTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: any }) => any;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<any>(translationsData[language]);

  // Update translations when the language changes
  useEffect(() => {
    setTranslations(translationsData[language]);
  }, [language]);

  const t = useCallback((key: string, options?: { [key: string]: any }) => {
    if (!translations) {
      return key; // Fallback in case something goes wrong
    }

    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // Check for returnObjects option before string replacement
    if (options?.returnObjects && typeof result === 'object' && result !== null) {
      return result;
    }
    
    if (typeof result === 'string' && options) {
      let tempResult = result;
      for (const optionKey in options) {
        if (optionKey !== 'returnObjects') {
          tempResult = tempResult.replace(`{${optionKey}}`, options[optionKey]);
        }
      }
      return tempResult;
    }

    return result;
  }, [translations]);

  const value = {
    language,
    setLanguage,
    t,
    isLoaded: true, // Translations are now bundled, so they are always loaded
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};