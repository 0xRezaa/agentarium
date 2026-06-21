import type { Selectable } from "kysely";
import { describe, expect, it, vi } from "vitest";
import type { Conversations } from "../../db/kysely-generated.js";
import { ConversationService } from "./service.js";
import type { ConversationReader } from "./types.js";

describe("ConversationService", () => {
  function setup() {
    const conversation = createConversation();
    const findById = vi
      .fn<ConversationReader["findById"]>()
      .mockResolvedValue(conversation);
    const service = new ConversationService({ findById });
    return {
      service,
      conversation,
      findById,
    };
  }
  it("returns the conversation loaded by the repository", async () => {
    const { service, conversation, findById } = setup();

    await expect(service.getConversation(conversation.id)).resolves.toBe(
      conversation,
    );
    expect(findById).toHaveBeenCalledWith(conversation.id);
  });
});

function createConversation(): Selectable<Conversations> {
  return {
    id: "7b3b6b6e-8b5f-4f1e-a5f5-6e0b2d0d8f91",
    current_message_id: "51c555c5-d596-4c58-9c40-91751f1e6c13",
    root_message_id: "a53ef4b8-b0c6-4c9d-aedc-a8f81378c6f0",
    created_at: new Date("2026-06-21T12:00:00.000Z"),
    updated_at: new Date("2026-06-21T12:30:00.000Z"),
  };
}
