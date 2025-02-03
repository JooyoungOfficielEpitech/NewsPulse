import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Bot } from 'lucide-react';
import { useNewsApi } from '@/hooks/useNewsApi';

/**
 * 채팅 메시지 컴포넌트
 */
const ChatMessage = React.memo(({ message, isUser, timestamp, isError, isLoading }) => (
  <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    {!isUser && (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
          ${isError ? 'bg-destructive/10' : 'bg-primary/10'}`}
      >
        <Bot className={`w-5 h-5 ${isError ? 'text-destructive' : 'text-primary'}`} />
      </div>
    )}
    <div
      className={`px-4 py-2 rounded-2xl max-w-[80%] ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : isError
          ? 'bg-destructive/10 text-destructive'
          : 'bg-muted'
      }`}
    >
      <p className={`text-sm whitespace-pre-wrap ${isLoading ? 'animate-pulse' : ''}`}>
        {message}
      </p>
      <p className="text-xs mt-1 opacity-70">
        {new Date(timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
    {isUser && (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-primary-foreground" />
      </div>
    )}
  </div>
));

ChatMessage.displayName = 'ChatMessage';

/**
 * 채팅 인터페이스 컴포넌트
 */
export const ChatInterface = ({ 
  loading: parentLoading,
  selectedCategories,
  selectedInterval,
  onIntervalChange 
}) => {
  const { queryChatbot } = useNewsApi();

  // 초기 메시지 상태를 localStorage에서 가져옵니다.
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // "첫 로그인" 플래그 확인: 플래그가 없으면 대화 내역 초기화
  useEffect(() => {
    const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
    if (!hasLoggedInBefore) {
      // 첫 로그인일 경우 localStorage와 상태 모두 초기화
      localStorage.removeItem('chatMessages');
      setMessages([]);
      localStorage.setItem('hasLoggedInBefore', 'true');
    }
  }, []);

  // 메시지 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // 스크롤 관리
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 채팅 메시지 초기화 (사용자가 원할 때 호출)
  const handleReset = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    // 필요하다면 플래그도 초기화할 수 있습니다.
    localStorage.removeItem('hasLoggedInBefore');
  }, []);

  // 선택된 카테고리가 변경될 때마다 안내 메시지 추가
  useEffect(() => {
    if (selectedCategories.length > 0) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.type === 'category-update') {
          return [
            ...prev.slice(0, -1),
            {
              text: `선택된 카테고리: ${selectedCategories.join(', ')}`,
              isUser: false,
              timestamp: new Date(),
              type: 'category-update'
            }
          ];
        }
        return [
          ...prev,
          {
            text: `선택된 카테고리: ${selectedCategories.join(', ')}`,
            isUser: false,
            timestamp: new Date(),
            type: 'category-update'
          }
        ];
      });
    }
  }, [selectedCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || localLoading || parentLoading) return;

    const trimmedInput = inputValue.trim();
    
    // 사용자 메시지 추가
    const userMessage = {
      text: trimmedInput,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    inputRef.current?.focus();

    try {
      setLocalLoading(true);
      // 로딩 메시지 추가
      setMessages(prev => [
        ...prev,
        {
          text: '답변을 생성하고 있습니다...',
          isUser: false,
          timestamp: new Date(),
          isLoading: true
        }
      ]);

      // API 호출 (선택된 카테고리 전달)
      const response = await queryChatbot(trimmedInput, selectedCategories);
      
      // 로딩 메시지 제거 및 실제 응답 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          {
            text: response.response || '죄송합니다. 답변을 생성하는데 문제가 발생했습니다.',
            isUser: false,
            timestamp: new Date()
          }
        ];
      });
    } catch (error) {
      // 로딩 메시지 제거 및 에러 메시지 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          {
            text: error.message || '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isUser: false,
            timestamp: new Date(),
            isError: true
          }
        ];
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isLoading = localLoading || parentLoading;

  return (
    <Card className="lg:col-span-2 order-2 lg:order-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-foreground">
            뉴스에 관한 질문을 해주세요!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI가 수집된 뉴스를 기반으로 답해드립니다
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            대화 초기화
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                대화를 시작해보세요
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  isError={message.isError}
                  isLoading={message.isLoading}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 rounded-lg bg-muted/50 border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
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
