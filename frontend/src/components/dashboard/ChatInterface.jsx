import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => (
  <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    {!isUser && (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-primary" />
      </div>
    )}
    <div
      className={`px-4 py-2 rounded-2xl max-w-[80%] ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
      }`}
    >
      <p className="text-sm">{message}</p>
    </div>
    {isUser && (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-primary-foreground" />
      </div>
    )}
  </div>
);

export const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    // Add bot response (echo)
    const botMessage = {
      text: inputValue,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputValue('');
  };

  return (
    <Card className="lg:col-span-2 order-2 lg:order-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-foreground">
            뉴스에 관한 질문을 해주세요!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI 가 수집된 뉴스를 기반으로 답해드립니다
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 rounded-lg bg-muted/50 border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};