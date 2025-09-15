"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Settings, Eye, Volume2, Type, Contrast } from "lucide-react"

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  voiceEnabled: boolean
  voiceSpeed: number
  voiceVolume: number
  colorBlindMode: string
  fontSize: number
  announceColors: boolean
  keyboardNavigation: boolean
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  voiceEnabled: true,
  voiceSpeed: 1,
  voiceVolume: 1,
  colorBlindMode: "none",
  fontSize: 16,
  announceColors: true,
  keyboardNavigation: true,
}

export function AccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("colorsense-accessibility")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Apply settings to document
    applySettings(settings)
    // Save to localStorage
    localStorage.setItem("colorsense-accessibility", JSON.stringify(settings))
  }, [settings])

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement

    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add("large-text")
    } else {
      root.classList.remove("large-text")
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add("reduced-motion")
    } else {
      root.classList.remove("reduced-motion")
    }

    // Color blind mode
    root.classList.remove("protanopia", "deuteranopia", "tritanopia", "monochrome")
    if (newSettings.colorBlindMode !== "none") {
      root.classList.add(newSettings.colorBlindMode)
    }

    // Font size
    root.style.setProperty("--accessibility-font-size", `${newSettings.fontSize}px`)

    // Keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.classList.add("keyboard-navigation")
    } else {
      root.classList.remove("keyboard-navigation")
    }
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const testVoice = () => {
    if (!settings.voiceEnabled) {
      toast({
        title: "Voice Disabled",
        description: "Please enable voice features to test",
        variant: "destructive",
      })
      return
    }

    const utterance = new SpeechSynthesisUtterance(
      "This is a test of the ColorSense voice accessibility feature. The detected color is blue, a cool and trustworthy color.",
    )
    utterance.rate = settings.voiceSpeed
    utterance.volume = settings.voiceVolume
    speechSynthesis.speak(utterance)
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to defaults",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          Accessibility
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                Visual Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increases contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="large-text">Large Text</Label>
                  <p className="text-sm text-muted-foreground">Increases text size throughout the app</p>
                </div>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting("largeText", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Font Size: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting("fontSize", value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorblind-mode">Color Blind Support</Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value) => updateSetting("colorBlindMode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="voice-enabled">Voice Descriptions</Label>
                  <p className="text-sm text-muted-foreground">Enable audio descriptions of colors</p>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="announce-colors">Auto-Announce Colors</Label>
                  <p className="text-sm text-muted-foreground">Automatically speak color names when detected</p>
                </div>
                <Switch
                  id="announce-colors"
                  checked={settings.announceColors}
                  onCheckedChange={(checked) => updateSetting("announceColors", checked)}
                />
              </div>

              {settings.voiceEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Speech Speed: {settings.voiceSpeed.toFixed(1)}x</Label>
                    <Slider
                      value={[settings.voiceSpeed]}
                      onValueChange={([value]) => updateSetting("voiceSpeed", value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Volume: {Math.round(settings.voiceVolume * 100)}%</Label>
                    <Slider
                      value={[settings.voiceVolume]}
                      onValueChange={([value]) => updateSetting("voiceVolume", value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <Button onClick={testVoice} variant="outline" className="w-full bg-transparent">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Voice Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="h-4 w-4" />
                Navigation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Reduces animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">Improves focus indicators and keyboard shortcuts</p>
                </div>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={resetSettings}>
              Reset to Defaults
            </Button>
            <Button onClick={() => setOpen(false)}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export settings for use in other components
export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem("colorsense-accessibility")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error)
      }
    }
  }, [])

  return settings
}
