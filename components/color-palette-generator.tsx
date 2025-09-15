"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Palette, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorPaletteGeneratorProps {
  baseColor?: {
    hex: string
    rgb: { r: number; g: number; b: number }
    name: string
  } | null
}

interface PaletteColor {
  hex: string
  name: string
  type: string
}

export function ColorPaletteGenerator({ baseColor }: ColorPaletteGeneratorProps) {
  const [currentPalette, setCurrentPalette] = useState<PaletteColor[]>([])
  const [paletteType, setPaletteType] = useState<string>("complementary")
  const { toast } = useToast()

  const generatePalette = (type: string) => {
    if (!baseColor) return

    const { r, g, b } = baseColor.rgb
    let palette: PaletteColor[] = []

    switch (type) {
      case "complementary":
        palette = [
          { hex: baseColor.hex, name: baseColor.name, type: "Base" },
          {
            hex: `#${(255 - r).toString(16).padStart(2, "0")}${(255 - g).toString(16).padStart(2, "0")}${(255 - b).toString(16).padStart(2, "0")}`,
            name: "Complement",
            type: "Complementary",
          },
        ]
        break

      case "triadic":
        // Rotate hue by 120 degrees
        const hsl = rgbToHsl(r, g, b)
        const triadic1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)
        const triadic2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)

        palette = [
          { hex: baseColor.hex, name: baseColor.name, type: "Base" },
          { hex: rgbToHex(triadic1.r, triadic1.g, triadic1.b), name: "Triadic 1", type: "Triadic" },
          { hex: rgbToHex(triadic2.r, triadic2.g, triadic2.b), name: "Triadic 2", type: "Triadic" },
        ]
        break

      case "analogous":
        const hsl2 = rgbToHsl(r, g, b)
        const analog1 = hslToRgb((hsl2.h + 30) % 360, hsl2.s, hsl2.l)
        const analog2 = hslToRgb((hsl2.h - 30 + 360) % 360, hsl2.s, hsl2.l)

        palette = [
          { hex: rgbToHex(analog2.r, analog2.g, analog2.b), name: "Analogous 1", type: "Analogous" },
          { hex: baseColor.hex, name: baseColor.name, type: "Base" },
          { hex: rgbToHex(analog1.r, analog1.g, analog1.b), name: "Analogous 2", type: "Analogous" },
        ]
        break

      case "monochromatic":
        const hsl3 = rgbToHsl(r, g, b)
        const mono1 = hslToRgb(hsl3.h, hsl3.s, Math.max(10, hsl3.l - 30))
        const mono2 = hslToRgb(hsl3.h, hsl3.s, Math.min(90, hsl3.l + 30))
        const mono3 = hslToRgb(hsl3.h, Math.max(10, hsl3.s - 20), hsl3.l)

        palette = [
          { hex: rgbToHex(mono1.r, mono1.g, mono1.b), name: "Dark", type: "Monochromatic" },
          { hex: baseColor.hex, name: baseColor.name, type: "Base" },
          { hex: rgbToHex(mono2.r, mono2.g, mono2.b), name: "Light", type: "Monochromatic" },
          { hex: rgbToHex(mono3.r, mono3.g, mono3.b), name: "Muted", type: "Monochromatic" },
        ]
        break

      case "tetradic":
        const hsl4 = rgbToHsl(r, g, b)
        const tetra1 = hslToRgb((hsl4.h + 90) % 360, hsl4.s, hsl4.l)
        const tetra2 = hslToRgb((hsl4.h + 180) % 360, hsl4.s, hsl4.l)
        const tetra3 = hslToRgb((hsl4.h + 270) % 360, hsl4.s, hsl4.l)

        palette = [
          { hex: baseColor.hex, name: baseColor.name, type: "Base" },
          { hex: rgbToHex(tetra1.r, tetra1.g, tetra1.b), name: "Square 1", type: "Tetradic" },
          { hex: rgbToHex(tetra2.r, tetra2.g, tetra2.b), name: "Square 2", type: "Tetradic" },
          { hex: rgbToHex(tetra3.r, tetra3.g, tetra3.b), name: "Square 3", type: "Tetradic" },
        ]
        break
    }

    setCurrentPalette(palette)
    setPaletteType(type)
  }

  // Helper functions
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
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

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h * 12) % 12
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    }
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
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

  const copyPalette = () => {
    const paletteText = currentPalette.map((color) => `${color.name}: ${color.hex}`).join("\n")
    navigator.clipboard.writeText(paletteText)
    toast({
      title: "Palette Copied!",
      description: "Color palette copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Palette Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!baseColor ? (
          <p className="text-muted-foreground text-center py-8">Detect a color first to generate palettes</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["complementary", "triadic", "analogous", "monochromatic", "tetradic"].map((type) => (
                <Button
                  key={type}
                  variant={paletteType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => generatePalette(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>

            {currentPalette.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{paletteType} Palette</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => generatePalette(paletteType)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={copyPalette}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {currentPalette.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="w-full h-20 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-center">
                        <p className="font-medium text-sm">{color.name}</p>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {color.hex}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{color.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
