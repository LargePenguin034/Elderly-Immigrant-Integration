const OpenAi = require('openai');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const client = new OpenAi({
    apiKey: OPENAI_API_KEY
});

async function contextTranslate(text) {
    const chat_completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system",
                "content": "Pretend you are a translator that translate from english with Australian slang to chinese."
            },
            {
                "role": "user",
                "content": `Translate: ${text}, Only output the translation and keep the tone`
            }
        ],
    })

    const response = chat_completion.choices[0];
    console.log(response.message.content)
    return response.message.content;
}

module.exports = contextTranslate;