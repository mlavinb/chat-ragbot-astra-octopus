import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "¿Qué hace Octopus?",
    "¿Cómo implementar un proyecto exitoso de IA?",
    "¿Qué tipo de IA conversacional aplica a mi negocio?",
    "Consígueme las 5 principales historias en Hacker News en formato de tabla markdown. Usa columnas como título, enlace, puntuación y comentarios.",
  ];

  return (
    <div className="flex flex-row flex-wrap justify-start items-center py-4 gap-2">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
