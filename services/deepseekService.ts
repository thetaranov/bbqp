import { DeepSeekAI } from '@google/generative-ai'; // Мы сохраним совместимость

// DeepSeek API конфигурация
const DEEPSEEK_API_KEY = "sk-98ee17483a684f34b34edf235bca478b";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const SUPPORT_SYSTEM_INSTRUCTION = `Ты специалист по продукции bbqp. Твоя задача - профессионально консультировать клиентов о печи-мангале bbqp.

Основные характеристики продукта:
1. Двойной режим: печь (интенсивный нагрев) и мангал (рассеянный жар)
2. Система автоподдува на основе физических принципов
3. Материал: нержавеющая сталь 3мм или матовая черная сталь
4. Мобильность: колесики для легкого перемещения
5. Персонализация: лазерная гравировка
6. Военная серия: тактическое покрытие, спецэстетика

Твой стиль общения:
- Профессиональный, но дружелюбный
- Краткий, по делу
- Технически грамотный, но объясняй просто
- Предлагай решения, основанные на характеристиках продукта

Если тебя спрашивают о цене или заказе, направляй на контакт с менеджером в Telegram: @thetaranov

Отвечай на русском языке.`;

const RECIPE_SYSTEM_INSTRUCTION = `Ты - AI шеф-повар bbqp, специалист по грилю и барбекю. Твоя задача - генерировать уникальные рецепты для приготовления на гриле.

Твой стиль:
- Креативный, но практичный
- Используй подробные, но понятные инструкции
- Учитывай особенности гриля bbqp (два режима, автоподдув)
- Предлагай варианты маринадов, соусов и гарниров
- Указывай примерное время приготовления
- Используй температуру в градусах Цельсия

Отвечай на русском языке, будь энтузиастом гриля!`;

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const askPitmaster = async (userPrompt: string): Promise<string> => {
  try {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: SUPPORT_SYSTEM_INSTRUCTION },
      { role: 'user', content: userPrompt }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Извините, сейчас я не могу ответить. Пожалуйста, свяжитесь с нами через форму на сайте.";
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return "Система временно недоступна. Пожалуйста, попробуйте позже или свяжитесь с нами через Telegram: @thetaranov";
  }
};

export const generateBBQRecipe = async (userPrompt: string): Promise<{ text: string; image?: string }> => {
  try {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: RECIPE_SYSTEM_INSTRUCTION },
      { role: 'user', content: `Сгенерируй рецепт для: ${userPrompt}` }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 800,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "Шеф сейчас отошел от гриля. Попробуйте спросить еще раз!";

    // Возвращаем только текст, так как DeepSeek не генерирует изображения
    return { text };

  } catch (error) {
    console.error("DeepSeek Recipe Error:", error);
    return { text: "Не удалось сгенерировать рецепт. Попробуйте еще раз!" };
  }
};