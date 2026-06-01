import { z } from "zod";
import {
  addStoreNotifySignup,
  deleteStoreNotifySignup,
  listStoreNotifySignups,
} from "./store-notify-store.js";

const emailSchema = z.string().trim().email().max(320);
const storePlatformSchema = z.enum(["apple", "google"]);

export async function handleStoreNotifyPost(
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const parsedEmail = emailSchema.safeParse(
    body && typeof body === "object" && "email" in body ? (body as { email: unknown }).email : undefined,
  );
  const parsedPlatform = storePlatformSchema.safeParse(
    body && typeof body === "object" && "platform" in body ? (body as { platform: unknown }).platform : undefined,
  );

  if (!parsedEmail.success) {
    return { status: 400, json: { error: "Please enter a valid email address." } };
  }
  if (!parsedPlatform.success) {
    return { status: 400, json: { error: "Invalid store." } };
  }

  const result = await addStoreNotifySignup(parsedEmail.data.toLowerCase(), parsedPlatform.data);
  if (!result.ok) {
    return { status: 409, json: { error: "This email is already on the notify list for this store." } };
  }
  return { status: 200, json: { ok: true, message: "We will notify you when the app is available." } };
}

export async function handleStoreNotifyList(): Promise<{ status: number; json: Record<string, unknown> }> {
  return { status: 200, json: { signups: await listStoreNotifySignups() } };
}

export async function handleStoreNotifyDelete(
  id: number,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, json: { error: "Invalid id." } };
  }
  if (!(await deleteStoreNotifySignup(id))) {
    return { status: 404, json: { error: "Not found." } };
  }
  return { status: 200, json: { ok: true } };
}

export function isAdminAuthorized(authHeader: string | undefined, adminPassword: string): boolean {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token === adminPassword && adminPassword.length > 0;
}
