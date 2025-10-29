

import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, Shot, VideoAnalytics } from "../types";

const getApiKey = (): string => {
    const apiKey = localStorage.getItem('kineo-api-key');
    if (!apiKey) {
        throw new Error("API Key not found in local storage. Please configure it on the generator page.");
    }
    return apiKey;
}

// This function must be called within an async function
export const generateVideoFromImage = async (
  visuals: string,
  imageBase64: string,
  aspectRatio: AspectRatio
): Promise<string> => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: visuals,
      image: {
        imageBytes: imageBase64,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Using 720p for faster generation
        aspectRatio: aspectRatio,
      }
    });
    
    // Poll for the result
    while (!operation.done) {
      // Wait for 10 seconds before checking the status again
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Video generation failed or returned no URI.");
    }

    const downloadLink = operation.response.generatedVideos[0].video.uri;

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};


export const generateScriptFromIdea = async (
  idea: string,
  imageBase64: string,
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageBase64,
    },
  };

  const textPart = {
    text: `You are a world-class creative director for a cinematic advertising agency. Your task is to generate a short, compelling video script based on a central idea and a product image.

    **Central Idea:** "${idea}"

    **Instructions:**
    1.  Analyze the provided product image.
    2.  Develop a 3-4 shot script that brings the central idea to life.
    3.  Each shot should have a clear description of the visuals, cinematography, and sound design.
    4.  The output MUST be ONLY the script.
    5.  Format the output exactly as follows, with each shot starting with "Shot X:":

    Shot 1: [Description]
    Shot 2: [Description]
    Shot 3: [Description]
    ...
    `,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [textPart, imagePart] },
  });

  return response.text;
};

export const generateStoryboardImage = async (
  prompt: string,
  imageBase64: string,
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: `Generate a single, high-quality, cinematic still image that captures the mood, style, and composition described in the following video script. This is a pre-visualization storyboard image. Script: ${prompt}`,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Storyboard image generation failed.");
};


export const generateVoiceoverAudio = async (
  voiceoverScript: string,
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: voiceoverScript }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A professional, clear voice
          },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }

  throw new Error("Voiceover audio generation failed.");
};

export const getPerformanceAnalysis = async (
  shots: Shot[],
  analytics: VideoAnalytics,
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const script = shots.map(s => s.visuals).join('\n');
  
  const prompt = `
    You are a world-class marketing and advertising analyst. Your task is to analyze the performance of a video ad based on its script and key performance indicators (KPIs).

    **Video Script:**
    ---
    ${script}
    ---

    **Performance Metrics:**
    - Total Views: ${analytics.views.toLocaleString()}
    - Click-Through Rate (CTR): ${analytics.ctr}%
    - Cost Per Acquisition (CPA): $${analytics.cpa.toFixed(2)}
    - Audience Retention: The audience retention starts at 100% and the values at subsequent 10% intervals of the video are: ${analytics.retentionData.join('%, ')}%.

    **Analysis Task:**
    Based on the provided script and metrics, provide a concise, expert analysis. Structure your response in three sections:
    1.  **Strengths:** What is working well? Mention specific metrics or script elements.
    2.  **Weaknesses:** Where is the ad underperforming? Identify potential reasons based on the script and retention data.
    3.  **Actionable Recommendations:** Provide 2-3 specific, actionable suggestions for a future version of this ad to improve its performance.

    The output MUST be ONLY the analysis, formatted clearly with markdown.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text;
};

export const generateTextOverlayVariations = async (
  originalText: string
): Promise<string[]> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a world-class advertising copywriter. Your task is to generate 3 alternative versions of an ad's text overlay for A/B testing.

    **Original Text Overlay:** "${originalText}"

    **Instructions:**
    1.  Create three distinct variations. Each should have a different angle or emotional appeal (e.g., one focused on benefits, one on urgency, one on luxury).
    2.  Keep the variations concise and impactful, suitable for a video ad.
    3.  The output MUST be ONLY a JSON array of strings.
    4.  Do not include the original text in the output.
    
    **Example Output:**
    ["New Collection Arriving", "Unlock Your Style", "Limited Edition Drop"]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  try {
    // Clean the response text to ensure it's valid JSON
    const cleanText = response.text.replace(/```json|```/g, '').trim();
    const variations = JSON.parse(cleanText);
    if (Array.isArray(variations) && variations.every(item => typeof item === 'string')) {
      return variations;
    }
    throw new Error("Parsed JSON is not an array of strings.");
  } catch (error) {
    console.error("Failed to parse variations from AI response:", error);
    // Fallback: if parsing fails, try to extract from raw text
    const fallbackVariations = response.text.match(/"(.*?)"/g)?.map(v => v.replace(/"/g, ''));
    if (fallbackVariations && fallbackVariations.length > 0) {
        return fallbackVariations;
    }
    throw new Error("Failed to generate or parse text overlay variations.");
  }
};
