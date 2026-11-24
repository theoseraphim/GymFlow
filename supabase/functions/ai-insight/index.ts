// Supabase Edge Function: ai-insight
// Recebe a lista de exercícios concluídos e devolve uma dica do "Gymenes".
// A chave do OpenRouter fica como SECRET no servidor (nunca exposta no browser).
//
// Secrets esperados (configurados via `supabase secrets set` ou no painel):
//   OPENROUTER_API_KEY  -> chave de API do OpenRouter (sk-or-...)
//   OPENROUTER_MODEL    -> ex.: google/gemma-4-31b-it:free (opcional, default openrouter/free = escolhe um modelo gratuito)

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

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

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

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    console.error("Secret OPENROUTER_API_KEY não configurado.");
    return jsonResponse({ error: "API_NOT_CONFIGURED" }, 500);
  }

  const model = Deno.env.get("OPENROUTER_MODEL") ?? "openrouter/free";

  let exercises: Exercise[];
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

  try {
    const aiResp = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Identificação opcional do app no painel do OpenRouter
        "X-Title": "GymFlow",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analise meu treino: ${titles}.` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (aiResp.status === 429) {
      return jsonResponse({ error: "API_LIMIT" }, 429);
    }

    if (!aiResp.ok) {
      const detail = await aiResp.text();
      console.error("Erro OpenRouter:", aiResp.status, detail);
      return jsonResponse({ error: "API_ERROR" }, 502);
    }

    const data = await aiResp.json();
    const insight = data?.choices?.[0]?.message?.content?.trim() ||
      "Gymenes está meditando...";

    return jsonResponse({ insight });
  } catch (error) {
    console.error("Falha ao chamar OpenRouter:", error);
    return jsonResponse({ error: "API_ERROR" }, 502);
  }
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
