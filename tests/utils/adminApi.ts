// Creates test users through the admin API (POST /users/) with the superuser
// credentials, so the E2E tests work against a backend in production mode
// (the /private routes only exist with FASTAPI_ENV=development).
import { LoginService, UsersService } from "../../src/client"
import { client } from "../../src/client/client.gen"
import { firstSuperuser, firstSuperuserPassword } from "../config"

client.setConfig({
  baseURL: `${process.env.VITE_API_URL}`,
})

let superuserToken: Promise<string> | undefined

function getSuperuserToken(): Promise<string> {
  superuserToken ??= LoginService.loginAccessToken({
    body: { username: firstSuperuser, password: firstSuperuserPassword },
  }).then((response) => response.data.access_token)
  return superuserToken
}

export const createUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const token = await getSuperuserToken()
  const response = await UsersService.createUser({
    body: { email, password, full_name: "Test User" },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
