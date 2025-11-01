import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AIRCRAFT_TAIL_NUMBERS, AIRCRAFT_MAX_FUEL } from '../constants';
import { Aircraft } from '../types';

let ai: GoogleGenAI;
let chat: Chat | null = null;

const getAi = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const getChat = async (): Promise<Chat> => {
    if (chat) {
        return chat;
    }
    
    const aiInstance = getAi();
    
    const initialAircraftData: Aircraft[] = AIRCRAFT_TAIL_NUMBERS.map(tailNumber => ({
        tailNumber,
        fuelGallons: AIRCRAFT_MAX_FUEL[tailNumber] || 50, // Start all aircraft with full tanks
        lastUpdated: new Date().toISOString(),
        history: [],
    }));
    
    const initialJson = JSON.stringify(initialAircraftData, null, 2);

    const newChat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a JSON database for an aircraft fuel tracking application. 
            Your only job is to store and return the state of the fuel levels for a list of aircraft. 
            When I send you an update for a specific aircraft, you must update the JSON object and return the *entire*, new JSON object and nothing else. 
            Do not add any conversational text, explanations, or markdown formatting like \`\`\`json. Just return the raw, minified JSON string.
            The JSON object is an array of aircraft objects. Each object has a 'tailNumber', a 'fuelGallons', a 'lastUpdated', and a 'history' property.
            The 'history' property is an array of objects, each containing 'fuelGallons' and a 'timestamp'.
            When I ask you to update an aircraft, you will update its 'fuelGallons' and 'lastUpdated' properties. You will also prepend a new entry to its 'history' array.
            Crucially, after adding the new entry, you must filter the history array to remove any entries with a timestamp older than 7 days from the timestamp of the new update.
            `,
        },
    });

    // Initialize the chat with the starting data
    await newChat.sendMessage({ message: `The initial state is: ${initialJson}. Now, await my commands.` });
    
    chat = newChat;
    return chat;
};


const parseJsonResponse = (response: GenerateContentResponse): Aircraft[] | null => {
    // FIX: The 'text' variable was scoped to the try block and unavailable in the catch block.
    // It is now declared outside to be accessible for logging in case of an error.
    let text = '';
    try {
        text = response.text.trim();
        
        // Find the start and end of the JSON array to handle cases where the model adds extra text.
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');

        if (startIndex === -1 || endIndex === -1) {
            console.warn("Could not find JSON array in response", text);
            return null;
        }

        const jsonString = text.substring(startIndex, endIndex + 1);
        const data = JSON.parse(jsonString);

        if (Array.isArray(data) && data.every(item => 'tailNumber' in item && 'fuelGallons' in item && 'lastUpdated' in item && 'history' in item && Array.isArray(item.history))) {
            return data as Aircraft[];
        }
        return null;
    } catch (error) {
        console.error("Failed to parse JSON from Gemini response:", text, error);
        return null;
    }
}

export const getFuelData = async (): Promise<Aircraft[]> => {
    const chatSession = await getChat();
    const response = await chatSession.sendMessage({ message: "Get latest fuel data." });
    const parsedData = parseJsonResponse(response);
    
    if (parsedData) {
        return parsedData;
    }

    // Fallback if parsing fails, maybe return initial state or re-initialize
    return AIRCRAFT_TAIL_NUMBERS.map(tailNumber => ({
        tailNumber,
        fuelGallons: AIRCRAFT_MAX_FUEL[tailNumber] || 50,
        lastUpdated: new Date().toISOString(),
        history: [],
    }));
};

export const updateAircraftFuel = async (tailNumber: string, newFuelGallons: number): Promise<Aircraft[]> => {
    const chatSession = await getChat();
    const timestamp = new Date().toISOString();
    const prompt = `Update aircraft ${tailNumber}. Set fuelGallons to ${newFuelGallons}. Set lastUpdated to "${timestamp}". Prepend the entry { "fuelGallons": ${newFuelGallons}, "timestamp": "${timestamp}" } to its history array. After that, filter its history array, removing any entries with a timestamp older than 7 days from "${timestamp}".`;
    const response = await chatSession.sendMessage({ message: prompt });
    const parsedData = parseJsonResponse(response);

    if (parsedData) {
        return parsedData;
    }
    
    throw new Error("Failed to update fuel data. Gemini did not return valid JSON.");
};