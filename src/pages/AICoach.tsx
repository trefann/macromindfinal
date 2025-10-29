import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { gsap } from "gsap";
import { useStreamChat } from "@/hooks/useStreamChat";

const AICoach = () => {
  const { messages, isStreaming, sendMessage } = useStreamChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      gsap.fromTo(
        chatContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const messageToSend = input;
    setInput("");
    await sendMessage(messageToSend);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">AI Coach</h1>
          <p className="text-muted-foreground">
            Get personalized advice and answers to your fitness questions
          </p>
        </div>

        <div
          ref={chatContainerRef}
          className="glass-card rounded-2xl p-6 h-[600px] flex flex-col"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-gradient-neon"
                      : "bg-secondary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-neon"
                      : "glass"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isStreaming && handleSend()}
              placeholder="Ask me anything about fitness, nutrition, or your training..."
              className="flex-1 glass border-white/10 focus:border-primary"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-neon hover:shadow-glow transition-all"
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>✨ Powered by Lovable AI - Real-time responses from advanced AI models</p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
