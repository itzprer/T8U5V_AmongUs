"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Share2, Twitter, Facebook, Instagram, Copy, Download } from "lucide-react"

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
  description: string
}

interface SocialShareProps {
  color: ColorInfo
  children: React.ReactNode
}

export function SocialShare({ color, children }: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const { toast } = useToast()

  const generateColorCard = (color: ColorInfo, message?: string): string => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    canvas.width = 800
    canvas.height = 600

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Color swatch
    ctx.fillStyle = color.hex
    ctx.fillRect(50, 50, 300, 300)

    // Border around swatch
    ctx.strokeStyle = "#e5e5e5"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, 300, 300)

    // Color name
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 48px Arial"
    ctx.fillText(color.name, 400, 120)

    // Hex code
    ctx.font = "32px monospace"
    ctx.fillText(color.hex, 400, 170)

    // RGB values
    ctx.font = "24px Arial"
    ctx.fillText(`RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`, 400, 210)

    // HSL values
    ctx.fillText(`HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`, 400, 240)

    // Description
    ctx.font = "20px Arial"
    const words = color.description.split(" ")
    let line = ""
    let y = 290

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > 350 && n > 0) {
        ctx.fillText(line, 400, y)
        line = words[n] + " "
        y += 30
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 400, y)

    // Custom message
    if (message) {
      ctx.font = "italic 18px Arial"
      ctx.fillStyle = "#6b7280"
      y += 50
      const messageWords = message.split(" ")
      line = ""

      for (let n = 0; n < messageWords.length; n++) {
        const testLine = line + messageWords[n] + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > 350 && n > 0) {
          ctx.fillText(line, 400, y)
          line = messageWords[n] + " "
          y += 25
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 400, y)
    }

    // ColorSense branding
    ctx.fillStyle = "#3b82f6"
    ctx.font = "24px Arial"
    ctx.fillText("ColorSense", 50, 550)
    ctx.fillStyle = "#6b7280"
    ctx.font = "16px Arial"
    ctx.fillText("AI-Powered Color Detection", 50, 575)

    return canvas.toDataURL("image/png")
  }

  const downloadColorCard = () => {
    const dataUrl = generateColorCard(color, customMessage)
    const link = document.createElement("a")
    link.download = `colorsense-${color.name.toLowerCase()}-${color.hex.replace("#", "")}.png`
    link.href = dataUrl
    link.click()

    toast({
      title: "Downloaded!",
      description: "Color card saved to your device",
    })
  }

  const shareToTwitter = () => {
    const message = customMessage || `Just discovered this beautiful ${color.name} color using ColorSense! ${color.hex}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.origin)}&hashtags=ColorSense,ColorDetection,Design`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(customMessage || `Check out this ${color.name} color I found with ColorSense! ${color.hex}`)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the message and guide the user
    const message =
      customMessage ||
      `Just discovered this beautiful ${color.name} color using ColorSense! ${color.hex} #ColorSense #ColorDetection #Design`
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: "Message Copied!",
        description: "Paste this in your Instagram post. Don't forget to download the color card!",
      })
    })
  }

  const copyShareLink = () => {
    const message = customMessage || `Check out this ${color.name} color I discovered with ColorSense! ${color.hex}`
    const shareText = `${message}\n\nTry ColorSense: ${window.location.origin}`

    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Copied!",
        description: "Share text copied to clipboard",
      })
    })
  }

  const generateShareableUrl = () => {
    const params = new URLSearchParams({
      color: color.hex,
      name: color.name,
      r: color.rgb.r.toString(),
      g: color.rgb.g.toString(),
      b: color.rgb.b.toString(),
    })
    return `${window.location.origin}?${params.toString()}`
  }

  const defaultMessages = [
    `Just discovered this stunning ${color.name} color! ${color.hex}`,
    `Found the perfect ${color.name} shade using ColorSense! ${color.hex}`,
    `This ${color.name} color caught my eye today! ${color.hex}`,
    `ColorSense helped me identify this beautiful ${color.name}! ${color.hex}`,
    `Loving this ${color.name} color palette inspiration! ${color.hex}`,
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[720px] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Color Discovery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{color.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{color.hex}</p>
                  <p className="text-sm text-muted-foreground">{color.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-3">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add your own message about this color..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Or try one of these suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {defaultMessages.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMessage(message)}
                    className="text-xs h-auto py-1 px-2"
                  >
                    {message.length > 40 ? message.substring(0, 40) + "..." : message}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Download Color Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Color Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download a beautiful color card to share on social media
              </p>
              <Button onClick={downloadColorCard} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Color Card
              </Button>
            </CardContent>
          </Card>

          {/* Social Media Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share on Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <Button onClick={shareToTwitter} variant="outline" className="gap-2 bg-transparent">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button onClick={shareToFacebook} variant="outline" className="gap-2 bg-transparent">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button onClick={shareToInstagram} variant="outline" className="gap-2 bg-transparent">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
                <Button onClick={copyShareLink} variant="outline" className="gap-2 bg-transparent">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shareable URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Direct Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={generateShareableUrl()} readOnly className="font-mono text-sm flex-1" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareableUrl())
                    toast({
                      title: "Copied!",
                      description: "Shareable URL copied to clipboard",
                    })
                  }}
                  variant="outline"
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link to let others see your color discovery
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
