"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Link2, Check, Loader2 } from "lucide-react"
import { trackShare } from "@/lib/api/insights"
import { useToast } from "@/hooks/use-toast"

interface ShareInsightModalProps {
  isOpen: boolean
  onClose: () => void
  insightId: string
  insightTitle: string
  studentId: string
}

export function ShareInsightModal({ isOpen, onClose, insightId, insightTitle, studentId }: ShareInsightModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [motivation, setMotivation] = useState<string>("helped_understand")
  const [customMotivation, setCustomMotivation] = useState<string>("")
  const [isSharing, setIsSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const { toast } = useToast()

  const platforms = [
    { id: "email", label: "Email", icon: Mail },
    { id: "slack", label: "Slack", icon: MessageSquare },
    { id: "copy", label: "Copy Link", icon: Link2 },
  ]

  const motivations = [
    { value: "helped_understand", label: "Really helped me understand" },
    { value: "great_example", label: "Great real-world example" },
    { value: "motivating", label: "Motivating / inspiring" },
    { value: "help_classmate", label: "Would help my classmate" },
    { value: "other", label: "Other (please specify)" },
  ]

  const handleShare = async () => {
    if (!selectedPlatform) {
      toast({
        title: "Select a platform",
        description: "Please choose how you'd like to share this insight.",
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)

    try {
      // Track the share
      await trackShare({
        insightId,
        studentId,
        platform: selectedPlatform,
        motivation: motivation === "other" ? customMotivation : motivation,
      })

      // Generate share URL
      const shareUrl = `${window.location.origin}/insights/${insightId}`
      const shareText = `Check out this real-world connection: ${insightTitle}`

      // Handle different platforms
      if (selectedPlatform === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`
      } else if (selectedPlatform === "slack") {
        // In production, this would integrate with Slack API
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        toast({
          title: "Copied for Slack",
          description: "Link copied! Paste it into Slack to share.",
        })
      } else if (selectedPlatform === "copy") {
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied!",
          description: "You can now paste the link anywhere you like.",
        })
      }

      setShareSuccess(true)
      setTimeout(() => {
        onClose()
        setShareSuccess(false)
        setSelectedPlatform("")
        setMotivation("helped_understand")
        setCustomMotivation("")
      }, 1500)
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Couldn't share the insight. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Insight</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Platform Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">How would you like to share?</Label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      selectedPlatform === platform.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${selectedPlatform === platform.id ? "text-blue-600" : "text-gray-600"}`}
                    />
                    <span className="text-xs font-medium">{platform.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Motivation */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Why are you sharing? (Optional)</Label>
            <RadioGroup value={motivation} onValueChange={setMotivation}>
              <div className="space-y-2">
                {motivations.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {motivation === "other" && (
              <Textarea
                value={customMotivation}
                onChange={(e) => setCustomMotivation(e.target.value)}
                placeholder="Tell us why you're sharing..."
                className="mt-3"
                rows={3}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isSharing}>
            Cancel
          </Button>
          <Button onClick={handleShare} className="flex-1" disabled={isSharing || !selectedPlatform}>
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : shareSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Shared!
              </>
            ) : (
              "Share"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
