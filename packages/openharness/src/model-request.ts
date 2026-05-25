import {
  createSystemMessage,
  createTextPart,
  createUserMessage,
  type ModelRequest,
} from "@0xrezaa/core/model";

export interface AdapterInspectorRequestInput {
  systemPrompt: string;
  userPrompt: string;
}

export function buildModelRequest({
  systemPrompt,
  userPrompt,
}: AdapterInspectorRequestInput): ModelRequest {
  return {
    messages: [
      ...(systemPrompt.trim()
        ? [
            createSystemMessage({
              content: [createTextPart({ text: systemPrompt })],
            }),
          ]
        : []),
      createUserMessage({ content: [createTextPart({ text: userPrompt })] }),
    ],
  };
}
