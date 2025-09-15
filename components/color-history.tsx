"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { SocialShare } from "@/components/social-share"
import { History, Search, Trash2, Copy, Check, Calendar, Palette, Share2 } from "lucide-react"
import { format } from "date-fns"

interface SavedColor {
  id: string
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
  description: string
  timestamp: Date
  userId: string
}

interface ColorHistoryProps {
  onColorSelect?: (color: SavedColor) => void
}

export function ColorHistory({ onColorSelect }: ColorHistoryProps) {
  const [savedColors, setSavedColors] = useState<SavedColor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterColor, setFilterColor] = useState<string>("all")
  const [copied, setCopied] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadColorHistory()
    }
  }, [user])

  const loadColorHistory = () => {
    if (!user) return

    const allColors = JSON.parse(localStorage.getItem("colorsense-color-history") || "[]")
    const userColors = allColors
      .filter((color: SavedColor) => color.userId === user.id)
      .map((color: SavedColor) => ({
        ...color,
        timestamp: new Date(color.timestamp),
      }))
      .sort((a: SavedColor, b: SavedColor) => b.timestamp.getTime() - a.timestamp.getTime())

    setSavedColors(userColors)
  }

  const saveColor = (colorInfo: {
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    name: string
    description: string
  }) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save colors to your history",
        variant: "destructive",
      })
      return
    }

    const newColor: SavedColor = {
      id: Date.now().toString(),
      ...colorInfo,
      timestamp: new Date(),
      userId: user.id,
    }

    const allColors = JSON.parse(localStorage.getItem("colorsense-color-history") || "[]")

    // Check if color already exists for this user
    const existingColor = allColors.find((color: SavedColor) => color.hex === colorInfo.hex && color.userId === user.id)

    if (existingColor) {
      toast({
        title: "Color Already Saved",
        description: "This color is already in your history",
      })
      return
    }

    allColors.push(newColor)
    localStorage.setItem("colorsense-color-history", JSON.stringify(allColors))
    loadColorHistory()

    toast({
      title: "Color Saved!",
      description: `${colorInfo.name} has been added to your history`,
    })
  }

  const deleteColor = (colorId: string) => {
    const allColors = JSON.parse(localStorage.getItem("colorsense-color-history") || "[]")
    const updatedColors = allColors.filter((color: SavedColor) => color.id !== colorId)
    localStorage.setItem("colorsense-color-history", JSON.stringify(updatedColors))
    loadColorHistory()

    toast({
      title: "Color Deleted",
      description: "Color has been removed from your history",
    })
  }

  const copyToClipboard = async (text: string, colorId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(colorId)
      setTimeout(() => setCopied(null), 2000)
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

  const filteredColors = savedColors.filter((color) => {
    const matchesSearch =
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.hex.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterColor === "all" || color.name.toLowerCase() === filterColor.toLowerCase()

    return matchesSearch && matchesFilter
  })

  const uniqueColorNames = Array.from(new Set(savedColors.map((color) => color.name)))

  // Expose saveColor function to parent component
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).saveColorToHistory = saveColor
    }
  }, [user])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Color History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sign in to save and view your color history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Color History ({savedColors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[140px]"
          >
            <option value="all">All Colors</option>
            {uniqueColorNames.map((colorName) => (
              <option key={colorName} value={colorName}>
                {colorName}
              </option>
            ))}
          </select>
        </div>

        {/* Color Grid */}
        <ScrollArea className="h-[320px] sm:h-[360px] md:h-[420px]">
          {filteredColors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {savedColors.length === 0 ? (
                <>
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No colors saved yet</p>
                  <p className="text-sm">Detect colors to start building your history</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No colors match your search</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredColors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onColorSelect?.(color)}
                >
                  {/* Color Preview */}
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />

                  {/* Color Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{color.name}</h4>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {color.hex}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(color.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(color.hex, color.id)
                      }}
                    >
                      {copied === color.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <SocialShare color={color}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </SocialShare>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteColor(color.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Clear All Button */}
        {savedColors.length > 0 && (
          <div className="pt-4 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Color History</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to delete all saved colors? This action cannot be undone.</p>
                  <div className="flex gap-2 justify-end">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const allColors = JSON.parse(localStorage.getItem("colorsense-color-history") || "[]")
                        const otherUsersColors = allColors.filter((color: SavedColor) => color.userId !== user?.id)
                        localStorage.setItem("colorsense-color-history", JSON.stringify(otherUsersColors))
                        loadColorHistory()
                        toast({
                          title: "History Cleared",
                          description: "All your saved colors have been deleted",
                        })
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
