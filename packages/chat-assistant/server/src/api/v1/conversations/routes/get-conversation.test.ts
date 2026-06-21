import type { Selectable } from "kysely";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { Conversations } from "../../../../db/kysely-generated.js";
import { createConversationRouter } from "./index.js";
import type { GetConversationService } from "../../../../domain/conversations/types.js";

describe("getConversationHandler", () => {
  it("returns the requested conversation", async () => {
    const conversation = createConversation();
    const service = createService(conversation);
    const app = createTestApp(service);

    const response = await app.request(`/${conversation.id}`);

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({
      data: {
        id: conversation.id,
        currentMessageId: conversation.current_message_id,
        rootMessageId: conversation.root_message_id,
        createdAt: "2026-06-21T12:00:00.000Z",
        updatedAt: "2026-06-21T12:30:00.000Z",
      },
    });
    expect(service.getConversation.mock.calls).toEqual([[conversation.id]]);
  });

  it("returns not found when the conversation does not exist", async () => {
    const service = createService(undefined);
    const app = createTestApp(service);

    const response = await app.request("/7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91");

    expect(response.status).toBe(404);
    expect(await readJson(response)).toEqual({
      error: {
        code: "not_found",
        message: "The requested resource was not found.",
      },
    });
  });

  it("returns validation errors for invalid conversation ids", async () => {
    const service = createService(createConversation());
    const app = createTestApp(service);

    const response = await app.request("/not-a-uuid");

    expect(response.status).toBe(400);
    expect(await readJson(response)).toMatchObject({
      error: {
        code: "validation_failed",
        message: "Request validation failed.",
      },
    });
    expect(service.getConversation.mock.calls).toHaveLength(0);
  });

  it("returns an internal server error when lookup fails", async () => {
    const service = {
      getConversation: vi
        .fn<GetConversationService["getConversation"]>()
        .mockRejectedValue(new Error("database unavailable")),
    };
    const app = createTestApp(service);

    const response = await app.request("/7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91");

    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({
      error: {
        code: "internal_server_error",
        message: "An unexpected server error occurred.",
      },
    });
  });
});

function createTestApp(service: GetConversationService) {
  return createConversationRouter({
    conversationService: service,
  });
}

function createService(
  conversation: Selectable<Conversations> | undefined,
): TestGetConversationService {
  return {
    getConversation: vi
      .fn<GetConversationService["getConversation"]>()
      .mockResolvedValue(conversation),
  };
}

interface TestGetConversationService extends GetConversationService {
  getConversation: Mock<GetConversationService["getConversation"]>;
}

function createConversation(): Selectable<Conversations> {
  return {
    id: "7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91",
    current_message_id: "51c555c5-d596-4c58-9c40-91751f1e6c13",
    root_message_id: "a53ef4b8-b0c6-4c9d-aedc-a8f81378c6f0",
    created_at: new Date("2026-06-21T12:00:00.000Z"),
    updated_at: new Date("2026-06-21T12:30:00.000Z"),
  };
}

function readJson(response: Response): Promise<unknown> {
  return response.json() as Promise<unknown>;
}
