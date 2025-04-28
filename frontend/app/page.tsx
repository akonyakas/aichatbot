"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Sparkles,
  User,
  Bot,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  SidebarClose,
  Github,
  Linkedin,
  Copy,
  Check,
  Trash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMediaQuery } from "@/hooks/use-mobile"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface ContextMenuPosition {
  x: number
  y: number
  messageTimestamp: number | null
  role: "user" | "assistant" | null
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [instructions, setInstructions] = useState("You are a helpful assistant. Answer the user's questions. Shortly.")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({ x: 0, y: 0, messageTimestamp: null , role: null})
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const prismInitialized = useRef(false)

  // Load messages and preferences from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages")
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error("Failed to parse saved messages:", e)
      }
    }

    const savedInstructions = localStorage.getItem("chatInstructions")
    if (savedInstructions) {
      setInstructions(savedInstructions)
    }

    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "chatMessages",
      JSON.stringify(
        messages.map((msg) => {
          // Don't save the isStreaming flag to localStorage
          const { isStreaming, ...rest } = msg
          return rest
        }),
      ),
    )
  }, [messages])

  // Save instructions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatInstructions", instructions)
  }, [instructions])

  // Apply theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [input])

  // Reset copied code state after 2 seconds
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedCode])

  // Initialize Prism.js once
  useEffect(() => {
    if (!prismInitialized.current) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"
      script.async = true

      script.onload = () => {
        // Load autoloader which will automatically load required languages
        const autoloader = document.createElement("script")
        autoloader.src =
          "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"
        autoloader.async = true
        document.body.appendChild(autoloader)

        prismInitialized.current = true
      }

      document.body.appendChild(script)
    }
  }, [])

  // Apply syntax highlighting after content updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.Prism) {
        window.Prism.highlightAll()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.messageTimestamp !== null) {
        setContextMenu({ x: 0, y: 0, messageTimestamp: null, role: null })
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  // When loading ends *and* we asked to auto‐focus, do it once
  useEffect(() => {
    if (!isLoading && shouldAutoFocus) {
      textareaRef.current?.focus()
      setShouldAutoFocus(false)
    }
  }, [isLoading, shouldAutoFocus])

  // If user clicks anywhere *during* loading except the textarea, cancel the auto‐focus
  useEffect(() => {
    if (!isLoading) return
    const cancel = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setShouldAutoFocus(false)
      }
    }
    document.addEventListener("click", cancel)
    return () => document.removeEventListener("click", cancel)
  }, [isLoading])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const clearMessages = () => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      setMessages([])
    }
  }

  const copyToClipboard = async (text: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      })
    }
  }

  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast({
        title: "Message copied",
        description: "The message has been copied to your clipboard.",
      })
      setContextMenu({ x: 0, y: 0, messageTimestamp: null, role: null})
    } catch (err) {
      console.error("Failed to copy message: ", err)
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      })
    }
  }

  const deleteMessage = (timestamp: number) => {
    setMessages((prev) => prev.filter((msg) => msg.timestamp !== timestamp))
    setContextMenu({ x: 0, y: 0, messageTimestamp: null, role: null })
  }

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageTimestamp: message.timestamp,
      role: message.role,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setShouldAutoFocus(true)
    setIsLoading(true)

    // Scroll to bottom immediately after adding user message
    setTimeout(scrollToBottom, 50)

    try {
      // Format the input as expected by your API
      const chatHistory = messages.concat(userMessage).map(({ role, content }) => ({ role, content }))

      // Add an empty assistant message that we'll populate with the stream
      const assistantMessageId = Date.now()
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: assistantMessageId,
        isStreaming: true, // Mark this message as currently streaming
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Scroll to bottom after adding assistant message
      setTimeout(scrollToBottom, 50)
      // Make the fetch request
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions,
          messages: chatHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Process the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("Failed to get response reader")

      let done = false
      let fullContent = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter(Boolean)

          for (const line of lines) {
            try {
              const parsedLine = JSON.parse(line)

              if (parsedLine.delta) {
                fullContent += parsedLine.delta

                // Update message content with each chunk
                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.role === "assistant" && msg.timestamp === assistantMessageId) {
                      return {
                        ...msg,
                        content: fullContent,
                      }
                    }
                    return msg
                  })
                })

                // Scroll to bottom with each update
                scrollToBottom()
              }
            } catch (e) {
              // Silent error for parsing issues
            }
          }
        }
      }

      // Final update to ensure we have the complete message
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.role === "assistant" && msg.timestamp === assistantMessageId) {
            return {
              ...msg,
              content: fullContent,
              isStreaming: false,
            }
          }
          return msg
        })
      })

      // Final scroll to bottom
      setTimeout(() => {
        scrollToBottom()
        // Highlight code blocks after message is complete
        if (window.Prism) {
          window.Prism.highlightAll()
        }
      }, 100)
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatMessageTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm")
  }

  const exportConversation = () => {
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "You" : "AI"} (${formatMessageTime(msg.timestamp)}):\n${msg.content}\n\n`)
      .join("")

    const blob = new Blob([conversationText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-${format(new Date(), "yyyy-MM-dd-HH-mm")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Conversation exported",
      description: "Your conversation has been exported as a text file.",
    })
  }

  return (
    <div className={cn("flex h-screen", theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900")}>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-4 left-4 z-50 p-2 rounded-md backdrop-blur-sm",
          theme === "dark" ? "bg-zinc-800/50" : "bg-zinc-200/50",
        )}
      >
        {isSidebarOpen ? <SidebarClose size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "w-80 flex flex-col transition-all duration-300 ease-in-out",
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
          isSidebarOpen ? "border-r" : "w-0 opacity-0",
          isMobile && isSidebarOpen && "fixed inset-y-0 left-0 z-40",
          !isSidebarOpen && "hidden",
        )}
      >
        <div className={cn("p-4 border-b", theme === "dark" ? "border-zinc-800" : "border-zinc-200")}>
          <div className="flex items-center gap-4 mb-6 w-full flex ml-6 items-center mt-1">
            <h1 className="text-xl font-bold ml-6">AI ChatBot</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="instructions"
                className={cn("block text-sm font-medium mb-1", theme === "dark" ? "text-zinc-400" : "text-zinc-600")}
              >
                System Instructions
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className={cn(
                  "w-full resize-none",
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                    : "bg-white border-zinc-300 text-zinc-900",
                )}
                placeholder="Instructions for the AI..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            <h2
              className={cn(
                "text-sm font-medium flex items-center",
                theme === "dark" ? "text-zinc-400" : "text-zinc-600",
              )}
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Chat Options
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className={cn(
                "w-full justify-start text-left",
                theme === "dark"
                  ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  : "bg-white hover:bg-zinc-100 border-zinc-300",
              )}
            >
              Clear conversation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportConversation}
              className={cn(
                "w-full justify-start text-left",
                theme === "dark"
                  ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  : "bg-white hover:bg-zinc-100 border-zinc-300",
              )}
            >
              Export conversation
            </Button>
          </div>
        </div>

        {/* Attribution in sidebar */}
        <div className={cn("p-4 border-t h-[93px]", theme === "dark" ? "border-zinc-800" : "border-zinc-200")}>
          <div className="text-center space-y-2">
            <div className={cn("text-sm font-medium", theme === "dark" ? "text-zinc-300" : "text-zinc-700")}>
              Made by Aiganym Kassymbayeva
            </div>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1 text-xs hover:text-indigo-500 transition-colors",
                  theme === "dark" ? "text-zinc-400" : "text-zinc-500",
                )}
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1 text-xs hover:text-indigo-500 transition-colors",
                  theme === "dark" ? "text-zinc-400" : "text-zinc-500",
                )}
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
            <div className={cn("text-xs", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
              Powered by GPT-4.1-mini
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b",
            theme === "dark" ? "border-zinc-800" : "border-zinc-200",
          )}
        >
          <div className="flex-1 flex items-center">
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={cn("p-2 rounded-md mr-2", theme === "dark" ? "hover:bg-zinc-800" : "hover:bg-zinc-200")}
              >
                {isSidebarOpen ? <SidebarClose size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
          <h1
            className={cn(
              "text-xl font-bold flex items-center gap-2",
              theme === "dark" ? "text-white" : "text-zinc-900",
            )}
          >
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md p-1 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </span>
            AI ChatBot
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleTheme}
              className={cn("p-2 rounded-full", theme === "dark" ? "hover:bg-zinc-800" : "hover:bg-zinc-200")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div
          ref={chatWindowRef}
          className={cn("flex-1 overflow-y-auto p-4 space-y-6", theme === "dark" ? "bg-zinc-950" : "bg-zinc-50")}
        >
          {messages.length === 0 && (
            <div
              className={cn(
                "h-full flex flex-col items-center justify-center",
                theme === "dark" ? "text-zinc-500" : "text-zinc-400",
              )}
            >
              <Sparkles className="h-12 w-12 mb-4 text-indigo-500 opacity-50" />
              <h2 className={cn("text-xl font-medium mb-2", theme === "dark" ? "text-zinc-300" : "text-zinc-700")}>
                Welcome to AI ChatBot
              </h2>
              <p className="text-sm max-w-md text-center">
                Start a conversation with the AI assistant. Your messages will appear here.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 animate-in group",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
              onContextMenu={(e) => handleContextMenu(e, message)}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl relative",
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : theme === "dark"
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                      : "bg-white text-zinc-900 border border-zinc-200",
                )}
              >
                {message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div
                    className={cn(
                      "markdown-body prose max-w-none",
                      theme === "dark" ? "prose-invert" : ""
                    )}
                  >
                    {message.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:underline"
                            />
                          ),
                          code: ({ node, inline, className, children, ...props }) => {
                            if (inline) {
                              return (
                                <code
                                  className={cn(
                                    "px-1 py-0.5 rounded text-sm max-w-fit",
                                    theme === "dark" ? "bg-zinc-700" : "bg-zinc-100",
                                    className,
                                  )}
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            }

                            // Extract language from className (format: "language-javascript")
                            const match = /language-(\w+)/.exec(className || "")
                            const language = match ? match[1] : ""
                            const codeString = String(children).replace(/\n$/, "")

                            return (
                              <div
                                className={cn(
                                  "rounded-md my-2 overflow-hidden max-w-fit relative group/code",
                                  theme === "dark" ? "bg-zinc-900" : "bg-gray-100",
                                )}
                              >
                                {/* Language badge */}
                                {language && (
                                  <div
                                    className={cn(
                                      "absolute top-0 right-0 px-2 py-1 text-xs rounded-bl",
                                      theme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-gray-200 text-gray-600",
                                    )}
                                  >
                                    {language}
                                  </div>
                                )}

                                {/* Copy button */}
                                <button
                                  onClick={(e) => copyToClipboard(codeString, e)}
                                  className={cn(
                                    "absolute top-2 right-2 p-1 rounded opacity-0 group-hover/code:opacity-100 transition-opacity",
                                    theme === "dark"
                                      ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                                      : "bg-gray-200 hover:bg-gray-300 text-gray-700",
                                  )}
                                  aria-label="Copy code"
                                >
                                  {copiedCode === codeString ? (
                                    <Check size={16} className="text-green-500" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>

                                <pre className={cn("p-0 m-0 overflow-x-auto min-w-[300px] max-w-[900px] w-[800px] overflow-y-auto code-block")}>
                                  <code className={cn(`language-${language || "text"}`, "block p-4")}>
                                    {codeString}
                                  </code>
                                </pre>
                              </div>
                            )
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex space-x-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    )}

                    {/* Show typing indicator at the end of content if still streaming */}
                    {message.content && message.isStreaming && (
                      <div className="inline-flex space-x-1 ml-1 align-middle">
                        <span className="typing-dot-inline"></span>
                        <span className="typing-dot-inline"></span>
                        <span className="typing-dot-inline"></span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "text-xs mt-0.5 text-right",
                    message.role === "user" ? "text-indigo-200" : theme === "dark" ? "text-zinc-500" : "text-zinc-400",
                  )}
                >
                  {formatMessageTime(message.timestamp)}
                </div>
              </div>

              {message.role === "user" && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                  )}
                >
                  <User
                    size={18}
                    className={theme === "dark" ? "text-zinc-100" : "text-zinc-700"}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Context Menu */}
        {contextMenu.messageTimestamp !== null && (
          <div
            className={cn(
              "fixed z-50 rounded-md shadow-md py-1",
              theme === "dark" ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-zinc-200",
            )}
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={cn(
              "w-full text-left px-4 py-2 text-sm flex items-center",
              theme === "dark" ? "hover:bg-zinc-700" : "hover:bg-zinc-100",
              )}
              onClick={() => {
              const message = messages.find((msg) => msg.timestamp === contextMenu.messageTimestamp && msg.role === contextMenu.role)
              if (message) copyMessage(message)
              }}
            >
              <Copy size={14} className="mr-2" />
              Copy message
            </button>
            <button
              className={cn(
                "w-full text-left px-4 py-2 text-sm flex items-center text-red-500",
                theme === "dark" ? "hover:bg-zinc-700" : "hover:bg-zinc-100",
              )}
              onClick={() => {
                if (contextMenu.messageTimestamp) deleteMessage(contextMenu.messageTimestamp)
              }}
            >
              <Trash size={14} className="mr-2" />
              Delete message
            </button>
          </div>
        )}

        {/* Input area */}
        <div className={cn("border-t p-4", theme === "dark" ? "border-zinc-800" : "border-zinc-200")}>
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={cn(
                "w-full pr-12 py-3 resize-none rounded-xl",
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                  : "bg-white border-zinc-300 text-zinc-900",
              )}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 h-9 w-9 p-0 rounded-lg bg-indigo-600 hover:bg-indigo-700"
              aria-label="Send message"
            >
              <Send size={18} className="transform rotate-45 -translate-x-px -translate-y-px" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
