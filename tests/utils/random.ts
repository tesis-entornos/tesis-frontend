import { randomBytes } from "node:crypto"

// 64 random bits: collisions stay negligible when users accumulate in a
// shared environment (Math.random().toString(36).substring(7) gave ~5 chars)
export const randomEmail = () =>
  `test_${randomBytes(8).toString("hex")}@example.com`

export const randomTeamName = () =>
  `Team ${Math.random().toString(36).substring(7)}`

// Always 16 characters (the backend requires at least 8)
export const randomPassword = () => randomBytes(8).toString("hex")

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

export const randomItemTitle = () =>
  `Item ${Math.random().toString(36).substring(7)}`

export const randomItemDescription = () =>
  `Description ${Math.random().toString(36).substring(7)}`
