import { FunctionDeclaration, Type } from '@google/genai';

const navigateToTool: FunctionDeclaration = {
  name: 'navigateTo',
  description: 'Navigate to a specific page in the application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      page: {
        type: Type.STRING,
        description: 'The page to navigate to.',
        enum: ['home', 'generator', 'studio'],
      },
    },
    required: ['page'],
  },
};

const createProjectTool: FunctionDeclaration = {
  name: 'createProject',
  description: 'Create a new client project.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      clientName: {
        type: Type.STRING,
        description: "The name of the client.",
      },
      projectName: {
        type: Type.STRING,
        description: "The name of the project.",
      },
      price: {
        type: Type.NUMBER,
        description: "The price or budget for the project.",
      },
    },
    required: ['clientName', 'projectName', 'price'],
  },
};

const startVideoForProjectTool: FunctionDeclaration = {
  name: 'startVideoForProject',
  description: "Starts the video creation process for an existing project. Navigates to the generator page with the project pre-selected.",
  parameters: {
    type: Type.OBJECT,
    properties: {
        projectName: {
            type: Type.STRING,
            description: "The name of the existing project to create a video for."
        }
    },
    required: ['projectName']
  }
};


export const assistantTools: FunctionDeclaration[] = [
    navigateToTool,
    createProjectTool,
    startVideoForProjectTool,
];
