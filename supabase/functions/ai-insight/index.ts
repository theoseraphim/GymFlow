// Supabase Edge Function: ai-insight
// Recebe a lista de exercícios concluídos e devolve uma dica do "Gymenes".
// A chave da Amazon Bedrock fica como SECRET no servidor (nunca exposta no browser).
//
// Secrets esperados (configurados via `supabase secrets set`):
//   AWS_BEARER_TOKEN_BEDROCK  -> chave de API do Amazon Bedrock (ABSK...)
//   BEDROCK_REGION            -> ex.: us-east-1 (opcional, default us-east-1)
//   BEDROCK_MODEL_ID          -> ex.: us.amazon.nova-lite-v1:0 (opcional)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT =
  "Você é o Gymenes, coach de IA. Dê uma dica curta de 1 frase, analisando os " +
  "treinos. Identifique se a pessoa esqueceu de treinar algum grupo muscular ou " +
  "se a carga está leve. Seja motivador e objetivo.";

interface Exercise {
  title?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const apiKey = Deno.env.get("AWS_BEARER_TOKEN_BEDROCK");
  if (!apiKey) {
    console.error("Secret AWS_BEARER_TOKEN_BEDROCK não configurado.");
    return jsonResponse({ error: "API_NOT_CONFIGURED" }, 500);
  }

  const region = Deno.env.get("BEDROCK_REGION") ?? "us-east-1";
  const modelId = Deno.env.get("BEDROCK_MODEL_ID") ?? "us.amazon.nova-lite-v1:0";

  let exercises: Exercise[] = [];
  try {
    const body = await req.json();
    exercises = Array.isArray(body?.exercises) ? body.exercises : [];
  } catch {
    return jsonResponse({ error: "INVALID_BODY" }, 400);
  }

  if (exercises.length === 0) {
    return jsonResponse({
      insight: "Adicione treinos ao 'Feito' para o Gymenes analisar! 💪",
    });
  }

  const titles = exercises
    .map((ex) => ex.title)
    .filter((t): t is string => Boolean(t))
    .join(", ");

  const endpoint =
    `https://bedrock-runtime.${region}.amazonaws.com/model/${
      encodeURIComponent(modelId)
    }/converse`;

  try {
    const bedrockResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system: [{ text: SYSTEM_PROMPT }],
        messages: [
          { role: "user", content: [{ text: `Analise meu treino: ${titles}.` }] },
        ],
        inferenceConfig: { maxTokens: 200, temperature: 0.7 },
      }),
    });

    if (bedrockResp.status === 429) {
      return jsonResponse({ error: "API_LIMIT" }, 429);
    }

    if (!bedrockResp.ok) {
      const detail = await bedrockResp.text();
      console.error("Erro Bedrock:", bedrockResp.status, detail);
      return jsonResponse({ error: "API_ERROR" }, 502);
    }

    const data = await bedrockResp.json();
    const insight = data?.output?.message?.content?.[0]?.text ??
      "Gymenes está meditando...";

    return jsonResponse({ insight });
  } catch (error) {
    console.error("Falha ao chamar Bedrock:", error);
    return jsonResponse({ error: "API_ERROR" }, 502);
  }
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
