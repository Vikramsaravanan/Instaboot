const Groq = require('groq-sdk');

let _client = null;

function getGroqClient() {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is not set. Add it to your backend/.env file. Get a free key at https://console.groq.com');
    }
    _client = new Groq({ apiKey });
  }
  return _client;
}

/**
 * Send a chat completion request to Groq.
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>} The assistant's reply text
 */
async function groqChat(messages, options = {}) {
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama3-8b-8192',
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 1024,
  });
  return completion.choices[0]?.message?.content || '';
}

module.exports = { groqChat };
