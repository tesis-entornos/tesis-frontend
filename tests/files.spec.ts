import { readFile } from "node:fs/promises"
import { expect, type Page, test } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser } from "./utils/user"

const randomFileName = () =>
  `file-${Math.random().toString(36).substring(7)}.txt`

async function uploadFile(page: Page, name: string, content: string) {
  await page.getByRole("button", { name: "Upload File" }).click()
  await page.getByLabel("File", { exact: true }).setInputFiles({
    name,
    mimeType: "text/plain",
    buffer: Buffer.from(content),
  })
  await page.getByRole("button", { name: "Upload", exact: true }).click()
  await expect(page.getByText("File uploaded successfully")).toBeVisible()
  await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible()
}

async function openActions(page: Page, name: string) {
  await page
    .getByRole("row")
    .filter({ hasText: name })
    .getByRole("button", { name: "File actions" })
    .click()
}

test("Files page is accessible and shows correct title", async ({ page }) => {
  await page.goto("/files")
  await expect(page.getByRole("heading", { name: "Files" })).toBeVisible()
  await expect(page.getByText("Upload and manage your files")).toBeVisible()
  await expect(page.getByRole("button", { name: "Upload File" })).toBeVisible()
})

test.describe("Files management", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  let email: string
  const password = randomPassword()

  test.beforeAll(async () => {
    email = randomEmail()
    await createUser({ email, password })
  })

  test.beforeEach(async ({ page }) => {
    await logInUser(page, email, password)
    await page.goto("/files")
  })

  test("Upload a file successfully", async ({ page }) => {
    const name = randomFileName()
    await uploadFile(page, name, "hello")

    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row.getByText("5 B")).toBeVisible()
    await expect(row.getByText("text/plain")).toBeVisible()
  })

  test("Upload button is disabled until a file is chosen", async ({ page }) => {
    await page.getByRole("button", { name: "Upload File" }).click()
    await expect(
      page.getByRole("button", { name: "Upload", exact: true }),
    ).toBeDisabled()
  })

  test("Download a file with its original name and content", async ({
    page,
  }) => {
    const name = randomFileName()
    const content = `content ${Math.random().toString(36).substring(2)}`
    await uploadFile(page, name, content)

    await openActions(page, name)
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "Download" }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe(name)
    expect(await readFile(await download.path(), "utf-8")).toBe(content)
  })

  test("Delete a file successfully", async ({ page }) => {
    const name = randomFileName()
    await uploadFile(page, name, "to be deleted")

    await openActions(page, name)
    await page.getByRole("menuitem", { name: "Delete File" }).click()
    await page.getByRole("button", { name: "Delete" }).click()

    await expect(page.getByText("File deleted successfully")).toBeVisible()
    await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0)
  })
})

test.describe("Files of a new user", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("A new user sees an empty list", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    await createUser({ email, password })

    await logInUser(page, email, password)
    await page.goto("/files")

    await expect(page.getByText("You don't have any files yet")).toBeVisible()
  })
})
