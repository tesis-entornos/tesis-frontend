import type { ColumnDef } from "@tanstack/react-table"

import type { FilePublic } from "@/client"
import type { DataTableFeatures } from "@/components/Common/DataTable"
import { FileActionsMenu } from "./FileActionsMenu"

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const columns: ColumnDef<DataTableFeatures, FilePublic>[] = [
  {
    accessorKey: "filename",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium break-all">{row.original.filename}</span>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatSize(row.original.size)}
      </span>
    ),
  },
  {
    accessorKey: "content_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.content_type}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Uploaded",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleString()
          : "-"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <FileActionsMenu file={row.original} />
      </div>
    ),
  },
]
