import { cookies } from "next/headers";
import { getOAuthClient } from "./googleClient";

export async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;
  const refreshToken = cookieStore.get("google_refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  const client = getOAuthClient();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return client;
}