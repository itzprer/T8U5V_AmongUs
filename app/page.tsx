"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Palette, Volume2, Copy, Check, Save, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ColorChatbot } from "@/components/color-chatbot"
import { UserMenu } from "@/components/user-menu"
import { ColorHistory } from "@/components/color-history"
import { AccessibilitySettings, useAccessibilitySettings } from "@/components/accessibility-settings"
import { SocialShare } from "@/components/social-share"
import { ColorPaletteGenerator } from "@/components/color-palette-generator"

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
  description: string
}

export default function ColorSensePage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [detectedColor, setDetectedColor] = useState<ColorInfo | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const accessibilitySettings = useAccessibilitySettings()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sharedColor = urlParams.get("color")
    const sharedName = urlParams.get("name")
    const sharedR = urlParams.get("r")
    const sharedG = urlParams.get("g")
    const sharedB = urlParams.get("b")

    if (sharedColor && sharedName && sharedR && sharedG && sharedB) {
      const r = Number.parseInt(sharedR)
      const g = Number.parseInt(sharedG)
      const b = Number.parseInt(sharedB)

      const colorInfo: ColorInfo = {
        hex: sharedColor,
        rgb: { r, g, b },
        hsl: rgbToHsl(r, g, b),
        name: sharedName,
        description: getColorDescription(sharedName),
      }

      setDetectedColor(colorInfo)
      toast({
        title: "Shared Color Loaded!",
        description: `Viewing ${sharedName} color from shared link`,
      })
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter to detect color when camera is active
      if ((e.code === "Space" || e.code === "Enter") && isCapturing) {
        e.preventDefault()
        captureColor()
      }

      // Escape to stop camera
      if (e.code === "Escape" && isCapturing) {
        e.preventDefault()
        stopCamera()
      }

      // 'S' to start camera
      if (e.code === "KeyS" && !isCapturing && e.altKey) {
        e.preventDefault()
        startCamera()
      }

      // 'V' to speak color description
      if (e.code === "KeyV" && detectedColor && e.altKey) {
        e.preventDefault()
        speakColor()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCapturing, detectedColor])

  // Ensure the video element receives the stream after it mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current
      video.srcObject = stream
      // Some browsers require an explicit play() after setting srcObject
      const playPromise = video.play?.()
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {
          // Ignore autoplay prevention errors; user action buttons exist
        })
      }
    }
    // Clear srcObject when stream is removed
    if (videoRef.current && !stream) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      console.log("[v0] Starting camera...")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      console.log("[v0] Got media stream:", mediaStream)
      console.log("[v0] Stream active:", mediaStream.active)
      console.log("[v0] Video tracks:", mediaStream.getVideoTracks().length)

      setStream(mediaStream)
      setIsCapturing(true)

      if (videoRef.current) {
        const video = videoRef.current

        // Set up event listeners; actual srcObject assignment happens in the stream effect
        video.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, dimensions:", video.videoWidth, "x", video.videoHeight)
        }

        video.oncanplay = () => {
          console.log("[v0] Video can play")
          video.play().catch((error) => {
            console.error("[v0] Error playing video:", error)
          })
        }

        video.onerror = (error) => {
          console.error("[v0] Video error:", error)
        }
      }
    } catch (error) {
      console.error("[v0] Camera error:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }, [stream])

  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    )
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const getColorName = (r: number, g: number, b: number): string => {
    const colors = [
      // Reds
      { name: "Crimson", r: [180, 255], g: [0, 60], b: [0, 60] },
      { name: "Red", r: [200, 255], g: [0, 100], b: [0, 100] },
      { name: "Pink", r: [200, 255], g: [100, 200], b: [150, 255] },
      { name: "Rose", r: [180, 255], g: [80, 150], b: [120, 180] },

      // Oranges
      { name: "Orange", r: [200, 255], g: [100, 200], b: [0, 80] },
      { name: "Coral", r: [200, 255], g: [120, 180], b: [80, 140] },
      { name: "Peach", r: [220, 255], g: [180, 220], b: [120, 180] },

      // Yellows
      { name: "Yellow", r: [200, 255], g: [200, 255], b: [0, 100] },
      { name: "Gold", r: [200, 255], g: [180, 220], b: [0, 80] },
      { name: "Cream", r: [240, 255], g: [240, 255], b: [200, 240] },

      // Greens
      { name: "Lime", r: [150, 200], g: [200, 255], b: [0, 100] },
      { name: "Green", r: [0, 150], g: [150, 255], b: [0, 150] },
      { name: "Forest Green", r: [0, 100], g: [100, 180], b: [0, 100] },
      { name: "Mint", r: [150, 200], g: [220, 255], b: [180, 220] },
      { name: "Teal", r: [0, 120], g: [150, 220], b: [150, 220] },

      // Blues
      { name: "Cyan", r: [0, 150], g: [200, 255], b: [200, 255] },
      { name: "Sky Blue", r: [100, 180], g: [180, 220], b: [220, 255] },
      { name: "Blue", r: [0, 150], g: [0, 150], b: [150, 255] },
      { name: "Navy", r: [0, 80], g: [0, 80], b: [100, 180] },
      { name: "Royal Blue", r: [50, 120], g: [80, 150], b: [180, 255] },

      // Purples
      { name: "Lavender", r: [180, 220], g: [150, 200], b: [220, 255] },
      { name: "Purple", r: [120, 200], g: [0, 150], b: [150, 255] },
      { name: "Violet", r: [150, 220], g: [80, 150], b: [200, 255] },
      { name: "Magenta", r: [200, 255], g: [0, 150], b: [200, 255] },

      // Browns
      { name: "Brown", r: [100, 180], g: [50, 120], b: [20, 80] },
      { name: "Tan", r: [180, 220], g: [150, 200], b: [100, 150] },
      { name: "Beige", r: [220, 255], g: [200, 240], b: [180, 220] },

      // Grays and neutrals
      { name: "White", r: [240, 255], g: [240, 255], b: [240, 255] },
      { name: "Light Gray", r: [180, 220], g: [180, 220], b: [180, 220] },
      { name: "Gray", r: [100, 180], g: [100, 180], b: [100, 180] },
      { name: "Dark Gray", r: [50, 100], g: [50, 100], b: [50, 100] },
      { name: "Black", r: [0, 50], g: [0, 50], b: [0, 50] },
    ]

    // Find the best matching color
    for (const color of colors) {
      if (
        r >= color.r[0] &&
        r <= color.r[1] &&
        g >= color.g[0] &&
        g <= color.g[1] &&
        b >= color.b[0] &&
        b <= color.b[1]
      ) {
        return color.name
      }
    }

    // Fallback to basic color detection if no match found
    const hsl = rgbToHsl(r, g, b)
    const hue = hsl.h
    const saturation = hsl.s
    const lightness = hsl.l

    if (lightness > 90) return "White"
    if (lightness < 10) return "Black"
    if (saturation < 10) return lightness > 70 ? "Light Gray" : lightness > 30 ? "Gray" : "Dark Gray"

    // Determine color by hue
    if (hue >= 0 && hue < 15) return "Red"
    if (hue >= 15 && hue < 45) return "Orange"
    if (hue >= 45 && hue < 75) return "Yellow"
    if (hue >= 75 && hue < 150) return "Green"
    if (hue >= 150 && hue < 210) return "Cyan"
    if (hue >= 210 && hue < 270) return "Blue"
    if (hue >= 270 && hue < 330) return "Purple"
    if (hue >= 330 && hue <= 360) return "Red"

    return "Colorful"
  }

  const getColorDescription = (colorName: string): string => {
    const descriptions: Record<string, string> = {
      Red: "A warm, energetic color often associated with passion, love, and power.",
      Green: "A natural, calming color representing growth, harmony, and freshness.",
      Blue: "A cool, trustworthy color symbolizing stability, depth, and tranquility.",
      Yellow: "A bright, cheerful color associated with happiness, optimism, and creativity.",
      Orange: "A vibrant, enthusiastic color representing energy, warmth, and adventure.",
      Purple: "A royal, mysterious color symbolizing luxury, creativity, and spirituality.",
      White: "A pure, clean color representing simplicity, peace, and new beginnings.",
      Black: "A sophisticated, powerful color symbolizing elegance, mystery, and strength.",
      Gray: "A neutral, balanced color representing practicality, stability, and composure.",
      Magenta: "A bold, creative color combining the energy of red with the calm of blue.",
      Cyan: "A refreshing, modern color representing clarity, communication, and innovation.",
      Crimson: "A deep red color often associated with strong emotions and passion.",
      Pink: "A soft, pastel red color symbolizing love and femininity.",
      Rose: "A light, delicate red color representing grace and elegance.",
      Coral: "A bright, warm orange color symbolizing energy and enthusiasm.",
      Peach: "A soft, warm orange color representing comfort and coziness.",
      Gold: "A rich, warm yellow color symbolizing wealth and luxury.",
      Cream: "A light, neutral yellow color representing purity and simplicity.",
      Lime: "A bright, greenish yellow color symbolizing freshness and vitality.",
      ForestGreen: "A deep, earthy green color representing nature and harmony.",
      Mint: "A light, refreshing green color symbolizing purity and growth.",
      Teal: "A cool, greenish blue color symbolizing calmness and balance.",
      SkyBlue: "A light, airy blue color symbolizing freedom and openness.",
      Navy: "A deep, rich blue color symbolizing depth and mystery.",
      RoyalBlue: "A luxurious, deep blue color symbolizing royalty and sophistication.",
      Lavender: "A soft, pastel purple color symbolizing elegance and grace.",
      Violet: "A rich, deep purple color symbolizing luxury and mystery.",
      Brown: "A warm, earthy color symbolizing stability and practicality.",
      Tan: "A light, warm brown color representing comfort and warmth.",
      Beige: "A light, neutral color symbolizing purity and simplicity.",
    }
    return descriptions[colorName] || "A unique color with its own special character."
  }

  const captureColor = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Get pixel data from center of image
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const imageData = ctx.getImageData(centerX - 5, centerY - 5, 10, 10)

    // Average the color from a small area
    let r = 0,
      g = 0,
      b = 0
    const pixels = imageData.data.length / 4

    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i]
      g += imageData.data[i + 1]
      b += imageData.data[i + 2]
    }

    r = Math.round(r / pixels)
    g = Math.round(g / pixels)
    b = Math.round(b / pixels)

    const hex = rgbToHex(r, g, b)
    const hsl = rgbToHsl(r, g, b)
    const name = getColorName(r, g, b)
    const description = getColorDescription(name)

    const colorInfo = {
      hex,
      rgb: { r, g, b },
      hsl,
      name,
      description,
    }

    setDetectedColor(colorInfo)

    toast({
      title: "Color Detected!",
      description: `Found ${name} (${hex})`,
    })

    if (accessibilitySettings.announceColors && accessibilitySettings.voiceEnabled) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(`Color detected: ${name}. ${description}`)
        utterance.rate = accessibilitySettings.voiceSpeed
        utterance.volume = accessibilitySettings.voiceVolume
        speechSynthesis.speak(utterance)
      }, 500)
    }
  }, [toast, accessibilitySettings])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Color code copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const speakColor = () => {
    if (!detectedColor || !accessibilitySettings.voiceEnabled) return

    const utterance = new SpeechSynthesisUtterance(
      `The detected color is ${detectedColor.name}. ${detectedColor.description} The hex code is ${detectedColor.hex}.`,
    )
    utterance.rate = accessibilitySettings.voiceSpeed
    utterance.volume = accessibilitySettings.voiceVolume
    speechSynthesis.speak(utterance)
  }

  const saveColorToHistory = () => {
    if (!detectedColor) return

    if (typeof window !== "undefined" && (window as any).saveColorToHistory) {
      ; (window as any).saveColorToHistory(detectedColor)
    }
  }

  const handleColorSelect = (color: any) => {
    setDetectedColor(color)
    toast({
      title: "Color Selected",
      description: `Loaded ${color.name} from history`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#camera-section" className="skip-link">
        Skip to camera
      </a>

      <svg className="accessibility-filters" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ColorSense
              </h1>
            </div>
            <p className="text-lg text-muted-foreground text-pretty">
              Point your camera at any color to identify it instantly with AI-powered descriptions
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              <span className="sr-only">Keyboard shortcuts: </span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+S</kbd> Start Camera •
              <kbd className="px-2 py-1 bg-muted rounded text-xs mx-1">Space</kbd> Detect Color •
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+V</kbd> Voice Description
            </div>
          </div>
          {/* UserMenu and Accessibility Settings */}
          <div className="absolute top-4 right-4 flex gap-2">
            <AccessibilitySettings />
            <UserMenu />
          </div>
        </div>

        {/* Vertical layout: camera → detected color → assistant → palette → history */}
        {/* Main Content - Stacked Vertical Layout */}
        <div className="flex flex-col items-center gap-8 px-4" id="main-content">
          {/* Camera Section */}
          <div className="w-full max-w-3xl">
            <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  Color Detection Camera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {isCapturing ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Crosshair overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-black rounded-full opacity-50"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 mx-auto opacity-50" />
                        <p>Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  {!isCapturing ? (
                    <Button
                      onClick={startCamera}
                      size="lg"
                      className="gap-2 rounded-full px-6 py-2 shadow-md hover:scale-105 transition-transform"
                    >
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={captureColor}
                        size="lg"
                        className="gap-2 rounded-full px-6 py-2 shadow-md hover:scale-105 transition-transform"
                      >
                        <Palette className="h-4 w-4" />
                        Detect Color
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-6 py-2 hover:scale-105 transition-transform"
                      >
                        Stop Camera
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detected Color Card */}
            {detectedColor && (
              <Card className="mt-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle>Detected Color</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {/* Color Preview */}
                    <div
                      className="w-32 h-32 rounded-xl border shadow-md"
                      style={{ backgroundColor: detectedColor.hex }}
                    ></div>

                    {/* Color Info */}
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-semibold">{detectedColor.name}</h3>
                      <p className="text-muted-foreground">{detectedColor.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">HEX</p>
                          <Badge className="font-mono px-3 py-1">{detectedColor.hex}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">RGB</p>
                          <Badge className="font-mono px-3 py-1">
                            {detectedColor.rgb.r}, {detectedColor.rgb.g}, {detectedColor.rgb.b}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">HSL</p>
                          <Badge className="font-mono px-3 py-1">
                            {detectedColor.hsl.h}°, {detectedColor.hsl.s}%, {detectedColor.hsl.l}%
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" onClick={speakColor} className="rounded-full">
                          <Volume2 className="h-4 w-4" /> Hear
                        </Button>
                        <Button onClick={saveColorToHistory} className="rounded-full">
                          <Save className="h-4 w-4" /> Save
                        </Button>
                        <SocialShare color={detectedColor}>
                          <Button variant="outline" className="rounded-full">
                            <Share2 className="h-4 w-4" /> Share
                          </Button>
                        </SocialShare>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Color Chatbot */}
          <div className="w-full max-w-3xl">
            <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Color Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <ColorChatbot detectedColor={detectedColor} />
              </CardContent>
            </Card>
          </div>

          {/* Palette Generator */}
          <div className="w-full max-w-3xl">
            <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Color Palette Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <ColorPaletteGenerator baseColor={detectedColor} />
              </CardContent>
            </Card>
          </div>

          {/* Color History */}
          <div className="w-full max-w-3xl">
            <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Color History</CardTitle>
              </CardHeader>
              <CardContent>
                <ColorHistory onColorSelect={handleColorSelect} />
              </CardContent>
            </Card>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>
    </div>
  )
}
