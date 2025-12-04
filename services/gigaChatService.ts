import { askPitmaster as askLocal, generateBBQRecipe as generateLocal } from './localAIService';
import { v4 as uuidv4 } from 'uuid'; // Если uuid нет, используем полифилл ниже

// CREDENTIALS
const AUTH_KEY = 'MDE5YWVhYWItNzJiMS03MWU5LTliNTQtZTcyZTVhZDAzYWNjOjA3ZWVhNGY2LTY3M2QtNGUxYS05N2E2LWMwNWM1NTU5MTliOA==';
const SCOPE = 'GIGACHAT_API_PERS';

// Proxy URLs (см. vite.config.ts)
const AUTH_URL = '/api/giga/auth';
const CHAT_URL = '/api/giga/chat';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Полифилл для UUID если пакет не установлен
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const rquid = generateUUID();
    const body = new URLSearchParams();
    body.append('scope', SCOPE);

    console.log('GigaChat: Запрос токена...');

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': rquid,
        'Authorization': `Basic ${AUTH_KEY}`
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`Auth Error: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = data.expires_at;
    console.log('GigaChat: Токен получен');
    return accessToken;
  } catch (error) {
    console.error('GigaChat Auth Failed:', error);
    return null;
  }
}

const SYSTEM_PROMPT = `Ты специалист по продукции bbqp - инновационной печи-мангале.
Основные факты:
1. Двойной режим: переключение между печью (фактически не для запекания (нет камеры как в обычной печи), а для быстрого розжига и кипячения, варки) и мангалом одним движением.
2. Автоподдув: физическая тяга без вентиляторов.
3. Материал: сталь или нержавейка, толщина 3мм, двойные боковые стенки.
4. Производится в Тольятти, ООО "АТТА".
5. возможность лазерной гравировки.
6. передвижение на 2 колесах, путем наклона.
7. дополнительную информацию смотри в мануале на сайте.
Отвечай кратко, профессионально, на русском языке.`;

const RECIPE_PROMPT = `Ты шеф-повар гриля. Придумай рецепт для указанного блюда.
Учитывай особенности мангала bbqp (режимы печи и мангала).
Формат: Ингредиенты, Приготовление.
Будь креативным и используй эмодзи.`;

export const askPitmaster = async (userMessage: string): Promise<string> => {
  try {
    const token = await getAccessToken();

    // Если токен не получен (например, нет прокси или ошибка сети), используем локальный фоллбек
    if (!token) {
      console.warn('GigaChat недоступен, переход на локальный режим.');
      return askLocal(userMessage);
    }

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) throw new Error(`Chat Error: ${response.status}`);

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

    const response = await fetch(CHAT_URL, {
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
        temperature: 1.0
      })
    });

    if (!response.ok) throw new Error(`Recipe Error: ${response.status}`);

    const data = await response.json();
    return { text: data.choices[0].message.content };

  } catch (error) {
    console.error('GigaChat Recipe Failed:', error);
    return generateLocal(dishName);
  }
};