import { z } from "zod";
import { addSupportRequest, deleteSupportRequest, listSupportRequests, toggleSupportRequestStar, } from "./support-store.js";
const supportBodySchema = z.object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    email: z.string().trim().email("Please enter a valid email address.").max(320),
    subject: z.string().trim().max(200).optional().default(""),
    message: z.string().trim().min(1, "Message is required.").max(5000),
});
function validationError(parsed) {
    return parsed.error.issues[0]?.message ?? "Invalid form data.";
}
export async function handleSupportPost(body) {
    const parsed = supportBodySchema.safeParse(body);
    if (!parsed.success) {
        return { status: 400, json: { error: validationError(parsed) } };
    }
    const data = parsed.data;
    await addSupportRequest({
        name: data.name,
        email: data.email.toLowerCase(),
        subject: data.subject,
        message: data.message,
    });
    return {
        status: 200,
        json: { ok: true, message: "Your message has been sent. We will get back to you soon." },
    };
}
export async function handleSupportList() {
    return { status: 200, json: { requests: await listSupportRequests() } };
}
export async function handleSupportStarToggle(id) {
    if (!Number.isInteger(id) || id < 1) {
        return { status: 400, json: { error: "Invalid id." } };
    }
    const updated = await toggleSupportRequestStar(id);
    if (!updated) {
        return { status: 404, json: { error: "Not found." } };
    }
    return { status: 200, json: { ok: true, request: updated } };
}
export async function handleSupportDelete(id) {
    if (!Number.isInteger(id) || id < 1) {
        return { status: 400, json: { error: "Invalid id." } };
    }
    if (!(await deleteSupportRequest(id))) {
        return { status: 404, json: { error: "Not found." } };
    }
    return { status: 200, json: { ok: true } };
}
