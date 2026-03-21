const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeImage(imageBase64: string): Promise<{
  diseaseName: string;
  nameEng: string;
  confidence: number;
  symptoms: string;
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
}> {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `आप एक कृषि रोग विशेषज्ञ हैं। इस फसल की तस्वीर देखकर रोग की पहचान करें।
JSON format में जवाब दें:
{
  "diseaseName": "रोग का नाम हिंदी में",
  "nameEng": "Disease name in English",
  "confidence": 85,
  "severity": "high/medium/low",
  "symptoms": "लक्षण का विवरण",
  "treatment": ["उपाय 1", "उपाय 2", "उपाय 3", "उपाय 4"]
}
केवल JSON दें, कोई अतिरिक्त text नहीं।`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('AI विश्लेषण में त्रुटि');
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function chatWithAI(
  message: string,
  context?: string
): Promise<string> {
  const systemPrompt = `आप KisanAI हैं — एक भारतीय कृषि विशेषज्ञ AI। 
आप किसानों को हिंदी में सरल, व्यावहारिक सलाह देते हैं।
विषय: फसल रोग, मौसम, खाद, कीट, मंडी भाव, सरकारी योजनाएँ।
${context ? `संदर्भ: ${context}` : ''}
जवाब 3-5 वाक्यों में दें। इमोजी का उचित उपयोग करें।`;

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!response.ok) throw new Error('Chat error');
  const data = await response.json();
  return data.content[0].text;
}

export async function getCropRecommendation(
  soil: string,
  season: string,
  region: string,
  irrigation: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `मिट्टी: ${soil}, मौसम: ${season}, क्षेत्र: ${region}, सिंचाई: ${irrigation}
इस जानकारी के आधार पर 2-3 वाक्यों में सबसे अच्छी फसल की सलाह हिंदी में दें। किस्म का नाम, अनुमानित उपज और आय भी बताएँ।`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error('Recommendation error');
  const data = await response.json();
  return data.content[0].text;
}

export async function getWeatherAdvisory(
  temp: number,
  humidity: number,
  rainChance: number,
  location: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `${location} में आज: तापमान ${temp}°C, नमी ${humidity}%, बारिश ${rainChance}%।
किसान के लिए 2 वाक्य में खेती सलाह हिंदी में दें।`,
        },
      ],
    }),
  });

  if (!response.ok) return 'मौसम सलाह उपलब्ध नहीं';
  const data = await response.json();
  return data.content[0].text;
}
