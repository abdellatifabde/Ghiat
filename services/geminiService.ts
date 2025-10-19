import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define interfaces for our structured data
interface MealOption {
  name: string;
  imageUrl?: string;
}

interface MealPlan {
  breakfast: MealOption[];
  lunch: MealOption[];
  dinner: MealOption[];
  snacks: MealOption[];
}

export interface DietPlan {
  analysis: {
    level: string;
    explanation: string;
  };
  mainGoals: string[];
  mealPlan: MealPlan;
  recommendedFoods: string[];
  avoidFoods: string[];
  lifestyleTips: string[];
}

// Function to generate an image for a food item
async function generateFoodImage(foodName: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `صورة فوتوغرافية واقعية عالية الجودة لطبق "${foodName}"، معروض بشكل شهي على خلفية نظيفة ومشرقة.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error(`Error generating image for ${foodName}:`, error);
    // Return a placeholder or empty string on failure
    return "https://via.placeholder.com/500x281.png?text=Image+not+available";
  }
}


export async function getDietRecommendation(hba1c: number): Promise<DietPlan> {
  const prompt = `
    مستخدم أدخل مستوى السكر التراكمي (HbA1c) الخاص به وهو: ${hba1c}%.
    مهمتك هي إنشاء خطة إرشادية غذائية مفصلة وشاملة بناءً على هذه القيمة.
    يجب أن تكون الإجابة بتنسيق JSON حصراً.
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING, description: "تصنيف المستوى (طبيعي، ما قبل السكري، مصاب بالسكري)" },
          explanation: { type: Type.STRING, description: "شرح بسيط للمستوى والمخاطر المحتملة" },
        },
      },
      mainGoals: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 أهداف رئيسية للحمية"
      },
      mealPlan: {
        type: Type.OBJECT,
        properties: {
          breakfast: {
            type: Type.ARRAY,
            description: "2-3 خيارات للإفطار",
            items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
          },
          lunch: {
            type: Type.ARRAY,
            description: "2-3 خيارات للغداء",
            items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
          },
          dinner: {
            type: Type.ARRAY,
            description: "2-3 خيارات للعشاء",
            items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
          },
          snacks: {
            type: Type.ARRAY,
            description: "3-4 خيارات للوجبات الخفيفة",
            items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
          },
        },
      },
      recommendedFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
      avoidFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
      lifestyleTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const dietPlan: DietPlan = JSON.parse(response.text);

    // Now, generate images for all meal options in parallel
    const imagePromises: Promise<void>[] = [];
    const mealCategories = Object.keys(dietPlan.mealPlan) as (keyof MealPlan)[];

    mealCategories.forEach(category => {
      dietPlan.mealPlan[category].forEach(option => {
        imagePromises.push(
          generateFoodImage(option.name).then(imageUrl => {
            option.imageUrl = imageUrl;
          })
        );
      });
    });

    await Promise.all(imagePromises);

    return dietPlan;

  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to fetch recommendation from Gemini API.");
  }
}
