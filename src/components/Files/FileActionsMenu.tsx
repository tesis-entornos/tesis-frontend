import { Download, EllipsisVertical } from "lucide-react"
import { useState } from "react"

import { type FilePublic, FilesService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import DeleteFile from "./DeleteFile"

interface FileActionsMenuProps {
  file: FilePublic
}

// The download needs the auth header, so it is fetched as a blob and saved
// through a temporary object URL instead of a plain link.
async function downloadFile(file: FilePublic) {
  const response = await FilesService.downloadFile({ path: { id: file.id } })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement("a")
  link.href = url
  link.download = file.filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const FileActionsMenu = ({ file }: FileActionsMenuProps) => {
  const [open, setOpen] = useState(false)
  const { showErrorToast } = useCustomToast()

  const onDownload = async () => {
    setOpen(false)
    try {
      await downloadFile(file)
    } catch (err) {
      handleError.call(showErrorToast, err as Error)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="File actions">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownload}>
          <Download />
          Download
        </DropdownMenuItem>
        <DeleteFile id={file.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
