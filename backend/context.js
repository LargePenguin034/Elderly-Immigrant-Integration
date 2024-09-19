const OpenAi = require('openai');

const API_KEY = "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"

const client = new OpenAi({
    apiKey: API_KEY
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