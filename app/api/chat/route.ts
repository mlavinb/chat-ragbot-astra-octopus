import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { AstraDB } from "@datastax/astra-db-ts";
import { functions, runFunction } from "./functions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDb = new AstraDB(
  process.env.ASTRA_DB_APPLICATION_TOKEN,
  process.env.ASTRA_DB_API_ENDPOINT,
  process.env.ASTRA_DB_NAMESPACE
);

export async function POST(req: Request) {
  try {
    const { messages, useRag, llm, similarityMetric } = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";
    if (useRag) {
      const { data } = await openai.embeddings.create({
        input: latestMessage,
        model: "text-embedding-ada-002",
      });

      const collection = await astraDb.collection(`chat_${similarityMetric}`);

      const cursor = collection.find(null, {
        sort: {
          $vector: data[0]?.embedding,
        },
        limit: 5,
      });

      const documents = await cursor.toArray();

      docContext = `
        START CONTEXT
        ${documents?.map((doc) => doc.content).join("\n")}
        END CONTEXT
      `;
    }
    const ragPrompt = [
      {
        role: "system",
        content: `Eres un agente experto en tecnología  y ayudas a los usuarios con información de la empresa octopus.cl Responde siempre en español
        ${docContext} 
        Si la respuesta no se proporciona en el contexto, el asistente de IA dirá: "Lo siento, no conozco la respuesta.
      `,
      },
    ];

    const response = await openai.chat.completions.create({
      model: llm ?? "gpt-3.5-turbo",
      stream: true,
      messages: [...ragPrompt, ...messages],
      functions,
      function_call: "auto",
    });
    const stream = OpenAIStream(response, {
      experimental_onFunctionCall: async (
        { name, arguments: args },
        createFunctionCallMessages
      ) => {
        const result = await runFunction(name, args);
        const newMessages = createFunctionCallMessages(result);
        return openai.chat.completions.create({
          model: "gpt-3.5-turbo-0613",
          stream: true,
          messages: [...messages, ...newMessages],
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (e) {
    throw e;
  }
}
