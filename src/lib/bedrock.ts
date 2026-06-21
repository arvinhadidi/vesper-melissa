const BEDROCK_REGION = process.env.AWS_REGION || 'us-east-1';
const BEDROCK_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK!;
const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

type Message = { role: 'user' | 'assistant'; content: string };

interface CreateParams {
  max_tokens: number;
  system?: string;
  messages: Message[];
}

interface TextBlock {
  type: 'text';
  text: string;
}

export interface BedrockResponse {
  content: TextBlock[];
  stop_reason: string;
}

export async function bedrockCreate(params: CreateParams): Promise<BedrockResponse> {
  const url = `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/invoke`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEDROCK_TOKEN}`,
    },
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      ...params,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bedrock error ${res.status}: ${text}`);
  }
  return res.json();
}

export function bedrockStream(params: CreateParams): ReadableStream<Uint8Array> {
  const url = `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/invoke-with-response-stream`;
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      (async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEDROCK_TOKEN}`,
          },
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            ...params,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          controller.error(new Error(`Bedrock error ${res.status}: ${text}`));
          return;
        }

        const reader = res.body!.getReader();
        let leftover = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const combined = new Uint8Array(leftover.length + value.length);
          combined.set(leftover);
          combined.set(value, leftover.length);
          leftover = combined;

          while (leftover.length >= 4) {
            const view = new DataView(leftover.buffer, leftover.byteOffset, leftover.byteLength);
            const totalLen = view.getUint32(0);
            if (leftover.length < totalLen) break;

            const headerLen = view.getUint32(4);
            const payloadStart = 12 + headerLen;
            const payloadEnd = totalLen - 4;
            const payload = leftover.slice(payloadStart, payloadEnd);

            leftover = leftover.slice(totalLen);

            try {
              const decoded = JSON.parse(new TextDecoder().decode(payload));
              if (decoded.bytes) {
                const event = JSON.parse(atob(decoded.bytes));
                if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                  controller.enqueue(encoder.encode(event.delta.text));
                }
              }
            } catch {}
          }
        }
        controller.close();
      })().catch((err) => controller.error(err));
    },
  });
}
