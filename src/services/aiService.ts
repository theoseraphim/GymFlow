const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; 

export async function getAIWorkoutInsight(exercises: any[]) {
  if (!exercises || exercises.length === 0) {
    return "Adicione treinos ao 'Feito' para o Gymenes analisar! 💪";
  }

  const titles = exercises.map(ex => ex.title).join(', ');
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "GymFlow_App"
      },
      body: JSON.stringify({
        // ESTE É O NOME TÉCNICO QUE O OPENROUTER ESPERA EM 2026:
        "model": "google/gemma-4-31b-it:free", 
        "messages": [
          {
            "role": "system", 
            "content": "Você é o Gymenes, coach de IA. Dê uma dica curta de 1 frase."
          },
          {
            "role": "user", 
            "content": `Analise meu treino: ${titles}.`
          }
        ]
      })
    });

    // Se der 404 aqui, é porque o ID do modelo acima mudou de novo
    if (response.status === 404) {
      throw new Error("MODEL_NOT_FOUND");
    }

    if (!response.ok) {
      throw new Error("API_ERROR");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Gymenes está meditando...";

  } catch (error: any) {
    console.error("Erro no serviço de IA:", error);
    throw error;
  }
}