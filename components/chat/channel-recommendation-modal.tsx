import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ChannelRecommendationModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  channelName?: string
  workspaceName?: string
  onChannelSelect: () => void
}

export function ChannelRecommendationModal({
  isOpen,
  onClose,
  isLoading,
  channelName,
  workspaceName,
  onChannelSelect,
}: ChannelRecommendationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Channel Recommendation</DialogTitle>
          <DialogDescription>
            Based on your query, here's the most relevant channel:
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">Finding the best channel...</span>
            </div>
          ) : channelName ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="font-medium">{channelName}</div>
                {workspaceName && (
                  <div className="text-sm text-gray-500">in {workspaceName}</div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={onChannelSelect}>
                  Go to Channel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">
              No matching channel found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 