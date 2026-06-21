import { createApiRouter } from "./api/router.js";
import { createV1Api, type V1ApiDependencies } from "./api/v1/index.js";
import { db } from "./db/database.js";
import { ConversationRepository } from "./domain/conversations/respository.js";
import { ConversationService } from "./domain/conversations/service.js";

export interface AppDependencies {
  v1: V1ApiDependencies;
}

export function createApp({ v1 }: AppDependencies) {
  const app = createApiRouter();

  app.route("/api/v1", createV1Api(v1));

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Chat Assistant API",
      version: "1.0.0",
    },
  });

  return app;
}

const conversationRepository = new ConversationRepository(db);
const conversationService = new ConversationService(conversationRepository);

export const app = createApp({
  v1: {
    conversations: {
      conversationService,
    },
  },
});
