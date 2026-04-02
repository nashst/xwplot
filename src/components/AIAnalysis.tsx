import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Plot from 'react-plotly.js';
import { generateJSAnalysis, MODELS } from '../services/modelscope';
import { useStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  plots?: any[];
  status?: 'generating' | 'done' | 'error';
};

export function AIAnalysis() {
  const { data } = useStore();
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 数据分析助手。我已经读取了当前加载的数据集。请告诉我你想分析什么？例如："分析各变量之间的相关性" 或 "绘制散点图并拟合趋势线"。',
      status: 'done'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !data || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'generating'
    };

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const columns = data.profiles.map(p => p.name);
      const sampleData = data.data.slice(0, 3);
      
      const jsCode = await generateJSAnalysis(userMessage.content, columns, sampleData, selectedModel);
      
      // Execute the generated JS code
      const analysisFunction = new Function('data', jsCode);
      const result = analysisFunction(data.data);

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { 
          ...m, 
          content: result.report || '分析完成。', 
          plots: result.plots || [],
          status: 'done' 
        } : m
      ));

    } catch (error: any) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { 
          ...m, 
          content: `发生错误: ${error.message}\n\n可能是模型生成的代码有误，请尝试换一种问法或更换更强的模型。`,
          status: 'error' 
        } : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        请先在“数据探索”中加载数据。
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-[#040057] p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">AI 智能分析</h2>
            <p className="text-xs text-slate-500">基于纯前端 JS 与 Plotly 的极速分析</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">模型:</span>
          <div className="relative">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#040057]/20 focus:border-[#040057]/50 cursor-pointer"
            >
              {MODELS.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === 'user' ? "bg-[#040057]/10 text-[#040057]" : "bg-slate-200 text-slate-600"
              )}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={cn(
                "max-w-[85%] rounded-2xl px-5 py-4 shadow-sm",
                message.role === 'user' 
                  ? "bg-[#040057] text-white rounded-tr-none" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
              )}>
                {message.status === 'generating' ? (
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">正在思考并生成图表配置...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:text-[#040057] prose-a:text-blue-600">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    
                    {message.plots && message.plots.length > 0 && (
                      <div className="mt-6 space-y-6">
                        {message.plots.map((plot, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <Plot
                              data={plot.data}
                              layout={{
                                ...plot.layout,
                                autosize: true,
                                margin: { t: 40, r: 20, b: 40, l: 40 },
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '400px' }}
                              config={{ responsive: true, displayModeBar: false }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#040057]/20 focus-within:border-[#040057]/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的分析需求，例如：绘制各变量的相关性热力图"
                disabled={isProcessing}
                className="w-full bg-transparent border-none focus:ring-0 p-2 outline-none disabled:opacity-50 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="bg-[#040057] text-white p-3.5 rounded-2xl hover:bg-[#040057]/90 disabled:opacity-50 disabled:hover:bg-[#040057] transition-colors flex-shrink-0 shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
