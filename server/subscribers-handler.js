import { z } from "zod";
import { addSubscriber, deleteSubscriber, listSubscribers } from "./subscribers-store.js";
const emailSchema = z.string().trim().email().max(320);
export async function handleSubscribePost(body) {
    const parsed = emailSchema.safeParse(body && typeof body === "object" && "email" in body ? body.email : undefined);
    if (!parsed.success) {
        return { status: 400, json: { error: "Please enter a valid email address." } };
    }
    const result = await addSubscriber(parsed.data.toLowerCase());
    if (!result.ok) {
        return { status: 409, json: { error: "This email is already subscribed." } };
    }
    return { status: 200, json: { ok: true, message: "You are subscribed." } };
}
export async function handleSubscribersList() {
    const subscribers = await listSubscribers();
    return {
        status: 200,
        json: {
            subscribers: subscribers.map((row) => ({
                id: row.id,
                email: row.email,
                createdAt: row.createdAt,
            })),
        },
    };
}
export async function handleSubscriberDelete(id) {
    if (!Number.isInteger(id) || id < 1) {
        return { status: 400, json: { error: "Invalid id." } };
    }
    if (!(await deleteSubscriber(id))) {
        return { status: 404, json: { error: "Not found." } };
    }
    return { status: 200, json: { ok: true } };
}
