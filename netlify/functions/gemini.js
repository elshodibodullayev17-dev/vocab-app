exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const word = event.queryStringParameters && event.queryStringParameters.word;

  if (!word) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "word parametri kerak" }) };
  }

  const prompt = `"${word}" ingliz so'zini tahlil qiling. FAQAT JSON qaytaring, boshqa hech narsa yozmang:
{"word":"${word}","uz":"aniq o'zbekcha tarjima","pos":"verb","cefr":"B1","definition_uz":"qisqa ta'rif o'zbek tilida","examples":["Inglizcha gap 1. (O'zbekcha tarjima.)","Inglizcha gap 2. (O'zbekcha tarjima.)","Inglizcha qiyinroq gap 3. (O'zbekcha tarjima.)"],"fill_sentence":"so'z o'rniga _____ qo'yilgan gap","tip":"esda qolish uchun qiziqarli maslahat o'zbek tilida"}
pos: verb|noun|adjective|adverb|preposition|other
cefr: A1|A2|B1|B2|C1|C2`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, headers, body: JSON.stringify({ error: data.error?.message || "Gemini xatolik" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
