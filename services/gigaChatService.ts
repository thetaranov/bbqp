import { askPitmaster as askLocal, generateBBQRecipe as generateLocal } from './localAIService';
import { v4 as uuidv4 } from 'uuid';

// GIGACHAT CREDENTIALS
// ВНИМАНИЕ: В реальном проекте эти ключи должны быть на бэкенде!
const CLIENT_ID = '019aeaab-72b1-71e9-9b54-e72e5ad03acc';
const CLIENT_SECRET = '07eea4f6-673d-4e1a-97a6-c05c555919b8';
const AUTH_DATA = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`); // Base64 кодирование

// Используем corsproxy.io для обхода CORS ограничений браузера
const CORS_PROXY = 'https://corsproxy.io/?';
const AUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  try {
    // Генерируем UUID v4
    const rquid = uuidv4();

    console.log('GigaChat: Запрос токена через прокси...');

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(AUTH_URL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': rquid,
        'Authorization': `Basic ${AUTH_DATA}`
      },
      body: 'scope=GIGACHAT_API_PERS'
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Auth Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = data.expires_at;
    console.log('GigaChat: Токен успешно получен');
    return accessToken;
  } catch (error) {
    console.error('GigaChat Auth Failed:', error);
    return null;
  }
}

const SYSTEM_PROMPT = `Ты специалист по продукции bbqp - инновационной печи-мангале.
Основные факты:
1. Двойной режим: переключение между печью и мангалом одним движением.
2. Автоподдув: физическая тяга без вентиляторов.
3. Материал: сталь или нержавейка.
4. Производится в Тольятти, ООО "АТТА".
Отвечай кратко, профессионально, на русском языке.`;

const RECIPE_PROMPT = `Ты шеф-повар гриля. Придумай рецепт для указанного блюда.
Учитывай особенности мангала bbqp (режимы печи и мангала).
Формат: Ингредиенты, Приготовление.
Будь креативным и используй эмодзи.`;

export const askPitmaster = async (userMessage: string): Promise<string> => {
  try {
    const token = await getAccessToken();

    if (!token) {
      console.warn('Токен не получен, используем заглушку.');
      return askLocal(userMessage);
    }

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(CHAT_URL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Некоторые прокси требуют явного указания целевого хоста в заголовках, 
        // но corsproxy обычно справляется сам.
      },
      body: JSON.stringify({
        model: 'GigaChat', // Используем модель по умолчанию
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
         const errText = await response.text();
         throw new Error(`Chat Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('GigaChat Request Failed:', error);
    return askLocal(userMessage); // Fallback
  }
};

export const generateBBQRecipe = async (dishName: string): Promise<{ text: string }> => {
  try {
    const token = await getAccessToken();

    if (!token) {
      return generateLocal(dishName);
    }

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(CHAT_URL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [
          { role: 'system', content: RECIPE_PROMPT },
          { role: 'user', content: `Придумай рецепт для: ${dishName}` }
        ],
        temperature: 1.0,
        stream: false
      })
    });

    if (!response.ok) {
         const errText = await response.text();
         throw new Error(`Recipe Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return { text: data.choices[0].message.content };

  } catch (error) {
    console.error('GigaChat Recipe Failed:', error);
    return generateLocal(dishName);
  }
};