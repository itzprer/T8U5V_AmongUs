"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Palette, Eye, Lightbulb, Sparkles, Volume2, Bot, User } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  category?: "explainer" | "advisor" | "accessibility" | "creative" | "palette"
}

interface ColorChatbotProps {
  detectedColor?: {
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    name: string
    description: string
  } | null
}

export function ColorChatbot({ detectedColor }: ColorChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your ColorSense AI assistant. I can help explain colors, suggest design combinations, provide accessibility guidance, create poetic descriptions, and build color palettes. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const colorExplainer = (colorName: string, hex: string): string => {
    const explanations: Record<string, string> = {
      Red: `Red (${hex}) is a primary color with a wavelength of approximately 700nm. Historically, red has been associated with power, passion, and life force across cultures. In ancient Rome, red was the color of Mars, the god of war. Psychologically, red increases heart rate and creates urgency, which is why it's used in stop signs and emergency signals.`,
      Blue: `Blue (${hex}) has the shortest wavelength in the visible spectrum at around 475nm. Ancient Egyptians valued blue so highly they created the first synthetic pigment, Egyptian Blue. Blue represents trust, stability, and depth - which is why many tech companies and banks use it in their branding.`,
      Green: `Green (${hex}) sits in the middle of the visible spectrum at 530nm, making it the most restful color for human eyes. It's the color of chlorophyll and represents growth, nature, and renewal. In many cultures, green symbolizes prosperity and good fortune.`,
      Yellow: `Yellow (${hex}) has a wavelength of about 580nm and is the most visible color to the human eye. Ancient cultures associated yellow with the sun and divinity. It stimulates mental activity and generates muscle energy, making it perfect for grabbing attention.`,
      Orange: `Orange (${hex}) combines the energy of red and the happiness of yellow. It's a secondary color that represents enthusiasm, creativity, and warmth. In many Eastern cultures, orange is considered sacred and is associated with spiritual enlightenment.`,
      Purple: `Purple (${hex}) was historically the most expensive color to produce, made from murex shells. It became associated with royalty and luxury. Purple combines the stability of blue with the energy of red, representing creativity and mystery.`,
      White: `White (${hex}) reflects all wavelengths of visible light equally. It represents purity, cleanliness, and new beginnings across most cultures. In design, white creates space and can make other colors appear more vibrant.`,
      Black: `Black (${hex}) absorbs all wavelengths of light. It's associated with elegance, sophistication, and mystery. In design, black provides contrast and can make other colors pop while conveying premium quality.`,
      Gray: `Gray (${hex}) is a neutral color that represents balance and sophistication. It's created by mixing black and white and is often used in professional settings for its calming, stable qualities.`,
    }
    return (
      explanations[colorName] ||
      `${colorName} (${hex}) is a unique color with its own special characteristics and cultural significance.`
    )
  }

  const designAdvisor = (colorName: string, hex: string): string => {
    const advice: Record<string, string> = {
      Red: `For ${colorName} (${hex}): Pair with white or cream for a classic look, or with navy blue for sophistication. For branding, red works well for food, sports, and emergency services. Avoid using with green unless creating intentional contrast.`,
      Blue: `For ${colorName} (${hex}): Combine with white for trust and professionalism, or with orange for dynamic contrast. Perfect for tech, healthcare, and finance branding. Pair with gray for a modern, clean aesthetic.`,
      Green: `For ${colorName} (${hex}): Match with earth tones like brown and beige for natural harmony. Great for eco-friendly brands, health, and wellness. Combine with white for freshness or with gold for luxury.`,
      Yellow: `For ${colorName} (${hex}): Balance with navy blue or deep purple to prevent overwhelming. Excellent for children's brands, food, and energy companies. Use sparingly as an accent color for maximum impact.`,
      Orange: `For ${colorName} (${hex}): Pair with blue for vibrant contrast or with brown for warmth. Perfect for creative industries, sports, and food brands. Combine with white for a fresh, energetic look.`,
      Purple: `For ${colorName} (${hex}): Match with gold for luxury or with green for creativity. Great for beauty, wellness, and premium brands. Pair with white or light gray for elegance.`,
      White: `For ${colorName} (${hex}): Works with any color as a neutral base. Perfect for minimalist designs, medical, and luxury brands. Add colorful accents to prevent sterility.`,
      Black: `For ${colorName} (${hex}): Combine with white for classic contrast or with gold for luxury. Excellent for fashion, technology, and premium brands. Use colorful accents to add personality.`,
    }
    return (
      advice[colorName] ||
      `For ${colorName} (${hex}): This unique color can be paired with neutrals for balance or with complementary colors for contrast. Consider the emotional impact and brand message when choosing combinations.`
    )
  }

  const accessibilityBuddy = (colorName: string, hex: string): string => {
    const rgb = detectedColor?.rgb || { r: 128, g: 128, b: 128 }
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    const isLight = luminance > 0.5

    return `Accessibility info for ${colorName} (${hex}): This color has a luminance of ${(luminance * 100).toFixed(1)}%. ${isLight ? "Use dark text (black or dark gray) for proper contrast." : "Use light text (white or light gray) for proper contrast."} For colorblind users, this color may appear differently - always provide text labels alongside color coding. The color has RGB values of ${rgb.r}, ${rgb.g}, ${rgb.b}, making it ${isLight ? "bright" : "dark"} and ${luminance > 0.7 ? "highly visible" : luminance < 0.3 ? "low visibility" : "moderately visible"}.`
  }

  const creativePartner = (colorName: string, hex: string): string => {
    const creative = [
      `"${colorName} whispers secrets of ${hex}, painting dreams across the canvas of imagination."`,
      `Like ${hex} dancing in the light, ${colorName} tells stories of passion and wonder.`,
      `In the language of ${colorName}, ${hex} speaks volumes about beauty and emotion.`,
      `${colorName} (${hex}) - where art meets soul, and color becomes poetry.`,
      `Behold ${colorName}, wearing ${hex} like a crown of pure creative energy.`,
    ]
    return creative[Math.floor(Math.random() * creative.length)]
  }

  const paletteBuilder = (colorName: string, hex: string): string => {
    const rgb = detectedColor?.rgb || { r: 128, g: 128, b: 128 }

    // Generate complementary colors
    const complementary = `#${(255 - rgb.r).toString(16).padStart(2, "0")}${(255 - rgb.g).toString(16).padStart(2, "0")}${(255 - rgb.b).toString(16).padStart(2, "0")}`

    // Generate analogous colors (simplified)
    const analogous1 = `#${Math.min(255, rgb.r + 30)
      .toString(16)
      .padStart(2, "0")}${Math.max(0, rgb.g - 30)
      .toString(16)
      .padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`
    const analogous2 = `#${Math.max(0, rgb.r - 30)
      .toString(16)
      .padStart(2, "0")}${Math.min(255, rgb.g + 30)
      .toString(16)
      .padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`

    return `Color palette based on ${colorName} (${hex}):
    
🎨 **Monochromatic**: ${hex} (base), lighter and darker shades
🎨 **Complementary**: ${hex} + ${complementary}
🎨 **Analogous**: ${hex} + ${analogous1} + ${analogous2}
🎨 **Triadic**: ${hex} + two colors 120° apart on color wheel

This palette works great for: ${colorName === "Blue" ? "Professional websites, healthcare" : colorName === "Red" ? "Food brands, emergency services" : colorName === "Green" ? "Eco-friendly brands, wellness" : "Creative projects and branding"}.`
  }

  const generateResponse = (userMessage: string): { content: string; category: Message["category"] } => {
    const message = userMessage.toLowerCase()

    if (!detectedColor) {
      return {
        content:
          "Please detect a color first using the camera above, then I can provide detailed information about it!",
        category: undefined,
      }
    }

    if (
      message.includes("explain") ||
      message.includes("history") ||
      message.includes("meaning") ||
      message.includes("symbolism")
    ) {
      return {
        content: colorExplainer(detectedColor.name, detectedColor.hex),
        category: "explainer",
      }
    }

    if (
      message.includes("design") ||
      message.includes("match") ||
      message.includes("pair") ||
      message.includes("brand") ||
      message.includes("outfit")
    ) {
      return {
        content: designAdvisor(detectedColor.name, detectedColor.hex),
        category: "advisor",
      }
    }

    if (
      message.includes("accessibility") ||
      message.includes("contrast") ||
      message.includes("blind") ||
      message.includes("vision")
    ) {
      return {
        content: accessibilityBuddy(detectedColor.name, detectedColor.hex),
        category: "accessibility",
      }
    }

    if (
      message.includes("creative") ||
      message.includes("poetic") ||
      message.includes("quote") ||
      message.includes("poem") ||
      message.includes("social")
    ) {
      return {
        content: creativePartner(detectedColor.name, detectedColor.hex),
        category: "creative",
      }
    }

    if (
      message.includes("palette") ||
      message.includes("combination") ||
      message.includes("scheme") ||
      message.includes("colors")
    ) {
      return {
        content: paletteBuilder(detectedColor.name, detectedColor.hex),
        category: "palette",
      }
    }

    // Default response with suggestions
    return {
      content: `I can help you with the detected ${detectedColor.name} color in several ways:

🎨 **Color Explainer**: Ask me to "explain this color" for history and symbolism
🎨 **Design Advisor**: Ask "what colors match this?" for design suggestions  
🎨 **Accessibility Buddy**: Ask about "accessibility" for contrast guidance
🎨 **Creative Partner**: Ask for "creative quotes" for poetic descriptions
🎨 **Palette Builder**: Ask about "color palettes" for combination ideas

What would you like to know about ${detectedColor.name} (${detectedColor.hex})?`,
      category: undefined,
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(input)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.content,
        timestamp: new Date(),
        category: response.category,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const speakMessage = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const getCategoryIcon = (category: Message["category"]) => {
    switch (category) {
      case "explainer":
        return <Lightbulb className="h-4 w-4" />
      case "advisor":
        return <Palette className="h-4 w-4" />
      case "accessibility":
        return <Eye className="h-4 w-4" />
      case "creative":
        return <Sparkles className="h-4 w-4" />
      case "palette":
        return <Palette className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: Message["category"]) => {
    switch (category) {
      case "explainer":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "advisor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "accessibility":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "creative":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "palette":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Card className="flex flex-col h-full max-h-[70vh] md:max-h-[75vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          ColorSense AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.category && (
                      <Badge className={`mb-2 ${getCategoryColor(message.category)}`}>
                        {getCategoryIcon(message.category)}
                        <span className="ml-1 capitalize">{message.category}</span>
                      </Badge>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.type === "bot" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 px-2 text-xs"
                        onClick={() => speakMessage(message.content)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about the detected color..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isTyping}
          />
          <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setInput("Explain this color")} className="text-xs">
            <Lightbulb className="h-3 w-3 mr-1" />
            Explain
          </Button>
          <Button size="sm" variant="outline" onClick={() => setInput("What colors match this?")} className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            Design
          </Button>
          <Button size="sm" variant="outline" onClick={() => setInput("Accessibility info")} className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Access
          </Button>
          <Button size="sm" variant="outline" onClick={() => setInput("Create a poetic quote")} className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Creative
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
