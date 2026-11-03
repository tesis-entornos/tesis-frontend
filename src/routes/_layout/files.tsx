import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FileText } from "lucide-react"
import { Suspense } from "react"

import { FilesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Files/columns"
import UploadFile from "@/components/Files/UploadFile"
import PendingFiles from "@/components/Pending/PendingFiles"

function getFilesQueryOptions() {
  return {
    queryFn: async () =>
      (await FilesService.readFiles({ query: { skip: 0, limit: 100 } })).data,
    queryKey: ["files"],
  }
}

export const Route = createFileRoute("/_layout/files")({
  component: Files,
  head: () => ({
    meta: [
      {
        title: "Files - FastAPI Template",
      },
    ],
  }),
})

function FilesTableContent() {
  const { data: files } = useSuspenseQuery(getFilesQueryOptions())

  if (files.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any files yet</h3>
        <p className="text-muted-foreground">Upload a file to get started</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={files.data} />
}

function FilesTable() {
  return (
    <Suspense fallback={<PendingFiles />}>
      <FilesTableContent />
    </Suspense>
  )
}

function Files() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">Upload and manage your files</p>
        </div>
        <UploadFile />
      </div>
      <FilesTable />
    </div>
  )
}
