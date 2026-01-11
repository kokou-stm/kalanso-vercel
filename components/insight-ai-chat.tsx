"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface InsightAIChatProps {
  insightTitle: string
  suggestions: string[]
  language: string
  onClose: () => void
}

export function InsightAIChat({ insightTitle, suggestions, language, onClose }: InsightAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: getAIResponse(message),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const getAIResponse = (userMessage: string): string => {
    // Mock AI responses
    if (userMessage.toLowerCase().includes("step-by-step") || userMessage.toLowerCase().includes("how")) {
      return `Great question! Here's how ChatGPT uses backpropagation during training:

**Step 1: Forward Pass** (What you learned Week 1)
Input: "What is machine learning?"
→ Processes through 96 layers of neural network
→ Generates predicted response

**Step 2: Calculate Error** (What you learned)
Compare prediction to correct answer
Use loss function (cross-entropy)

**Step 3: Backpropagation** (What you're learning now! 🎯)
\`\`\`python
# Simplified example
gradient = calculate_gradient(error, weights)
weights = weights - learning_rate * gradient
\`\`\`

This happens for ~175 billion parameters in ChatGPT-3.5!

**Step 4: Repeat** (Coming in Optimization module)
Do this millions of times on massive datasets

Want to see how this connects to your current assignment?`
    }

    if (userMessage.toLowerCase().includes("job") || userMessage.toLowerCase().includes("career")) {
      return `Excellent question! Here are jobs that require backpropagation skills:

**Machine Learning Engineer**
• Salary: $150k-$300k
• Focus: Training and optimizing neural networks
• Companies: OpenAI, Google, Meta, Tesla

**AI Research Scientist**
• Salary: $180k-$350k
• Focus: Developing new architectures
• Companies: DeepMind, Anthropic, Microsoft Research

**Deep Learning Engineer**
• Salary: $140k-$280k
• Focus: Production ML systems
• Companies: Spotify, Netflix, Amazon

Currently there are 45,000+ job postings mentioning neural network training skills!

Would you like to see what specific projects these roles work on?`
    }

    if (userMessage.toLowerCase().includes("code") || userMessage.toLowerCase().includes("example")) {
      return `Here's a practical code example of backpropagation:

\`\`\`python
import numpy as np

class NeuralNetwork:
    def __init__(self):
        self.weights = np.random.randn(784, 10)
        self.bias = np.zeros((1, 10))
    
    def forward(self, X):
        return np.dot(X, self.weights) + self.bias
    
    def backprop(self, X, y, output, learning_rate=0.01):
        # Calculate gradients (this is what you're learning!)
        error = output - y
        d_weights = np.dot(X.T, error) / len(X)
        d_bias = np.mean(error, axis=0)
        
        # Update weights
        self.weights -= learning_rate * d_weights
        self.bias -= learning_rate * d_bias
        
        return d_weights

# This exact pattern is used in ChatGPT training!
\`\`\`

This is essentially what happens in ChatGPT, just scaled up to 175 billion parameters!

Want to try running this code yourself?`
    }

    return `That's an interesting question! Based on your current progress in backpropagation, I can help you understand how this connects to real-world applications like ChatGPT.

You're currently at 65% mastery in Apply-Procedural level, which means you're actively learning the practical implementation. This is exactly the skill level needed to understand and work on production AI systems.

Would you like me to explain:
• How this relates to your current learning objectives?
• What specific aspects you should focus on?
• How to practice this skill more effectively?`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-semibold text-gray-900">Ask About {insightTitle}</h3>
            <p className="text-xs text-gray-600">AI Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-3">
                    I can help you understand how the backpropagation you're learning powers ChatGPT! What would you
                    like to know?
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Quick suggestions:</p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && <span className="text-2xl">🤖</span>}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 shadow-sm",
                    message.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-white border",
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className={cn("text-xs mt-1", message.role === "user" ? "text-blue-100" : "text-gray-500")}>
                    {message.timestamp}
                  </div>
                </div>
                {message.role === "user" && <span className="text-2xl">👤</span>}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <span className="text-2xl">🤖</span>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(input)
              }
            }}
            placeholder="Type your question..."
            className="resize-none min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
