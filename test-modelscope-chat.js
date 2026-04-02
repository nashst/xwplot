import OpenAI from 'openai';

const API_KEY = 'ms-50c2b638-f660-40c5-a96e-30d010a556b9';

const openai = new OpenAI({
  baseURL: 'https://api-inference.modelscope.cn/v1',
  apiKey: API_KEY,
});

async function test() {
  try {
    console.log('Testing connection...');
    const response = await openai.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
