import OpenAI from 'openai';

const API_KEY = (import.meta as any).env.VITE_MODELSCOPE_API_KEY || 'ms-50c2b638-f660-40c5-a96e-30d010a556b9';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    try {
      // Handle sandboxed iframes where origin might be "null"
      if (window.location.origin && window.location.origin !== 'null') {
        return `${window.location.origin}/api/modelscope`;
      }
      // Fallback to constructing from href
      const url = new URL('/api/modelscope', window.location.href);
      return url.toString();
    } catch (e) {
      console.warn('Failed to construct base URL from window.location, falling back to direct API');
      return 'https://api-inference.modelscope.cn/v1';
    }
  }
  return 'http://localhost:3000/api/modelscope'; // Fallback absolute URL for non-browser environments
};

const openai = new OpenAI({
  baseURL: getBaseURL(),
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export const MODELS = [
  { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2 (推荐)' },
  { id: 'Qwen/Qwen3-Coder-30B-A3B-Instruct', name: 'Qwen3 Coder 30B' },
  { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', name: 'Qwen3 235B (旗舰版)' },
  { id: 'deepseek-ai/DeepSeek-R1-0528', name: 'DeepSeek R1 (推理模型)' },
  { id: 'Qwen/QwQ-32B', name: 'QwQ 32B' }
];

export async function generateJSAnalysis(prompt: string, columns: string[], sampleData: any[], model: string) {
  const systemPrompt = `You are an expert data analyst and frontend developer.
The user has a dataset loaded in the frontend.
Columns: ${columns.join(', ')}
Sample data (first 3 rows):
${JSON.stringify(sampleData, null, 2)}

Write a JavaScript function body that analyzes this data and generates Plotly.js charts and a Markdown report.
The function receives a variable \`data\` which is an array of objects.
You must return an object with two properties: \`plots\` (array of Plotly configs) and \`report\` (markdown string).

Example output format:
\`\`\`javascript
const plots = [
  {
    data: [{ x: data.map(d => d.age), y: data.map(d => d.salary), type: 'scatter', mode: 'markers' }],
    layout: { title: 'Age vs Salary' }
  }
];

const report = "### Analysis Report\\n\\nBased on the data, we can see...";

return { plots, report };
\`\`\`

Rules:
1. Output ONLY the JavaScript code inside a \`\`\`javascript block.
2. Do not use any external libraries other than standard JavaScript (Math, Array methods).
3. Make sure the code is robust and handles potential nulls or undefined values.
4. The report should directly answer the user's request.`;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  });

  const content = response.choices[0].message.content || '';
  const match = content.match(/```(?:javascript|js)\n([\s\S]*?)```/);
  return match ? match[1] : content.replace(/```javascript|```js|```/g, '');
}
