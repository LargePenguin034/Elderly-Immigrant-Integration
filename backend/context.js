const OpenAi = require('openai');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const client = new OpenAi({
    apiKey: OPENAI_API_KEY
});

async function contextTranslate(text, language) {
    // Determine the translation direction based on the language
    let prompt;
    if (language === 'en') {
        prompt = "Pretend you are a translator that translates from Chinese to English.";
    } else if (language === 'zh-CN') { // Fixed this from zh to zh-CN
        prompt = "Pretend you are a translator that translates from English (with Australian slang) to Chinese.";
    }
    const chat_completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": `Only output the translation. Translate: ${text}.`
            }
        ],
    })

    const response = chat_completion.choices[0];
    console.log(response.message.content)
    return response.message.content;
}

module.exports = contextTranslate;