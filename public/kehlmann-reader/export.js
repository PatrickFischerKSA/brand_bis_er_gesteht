function hasText(value) {
  return String(value || "").trim().length > 0;
}

function displayValue(value) {
  return hasText(value) ? String(value).trim() : "[offen]";
}

function pushQuestionBlock(lines, heading, items) {
  if (!items?.length) {
    return;
  }

  lines.push(heading);
  for (const [index, item] of items.entries()) {
    lines.push(`${index + 1}. ${item.prompt}`);
    lines.push(`   Antwort: ${displayValue(item.answer)}`);
  }
  lines.push("");
}

export function buildParcoursMarkdown({
  modeLabel,
  classroomName,
  studentName,
  complete,
  completedEntries,
  totalEntries,
  lessons
}) {
  const lines = [
    "# Bis er gesteht - Parcoursdokumentation",
    "",
    `Modus: ${modeLabel}`,
    `Klasse: ${classroomName || "-"}`,
    `Bearbeitung: ${studentName || "-"}`,
    `Stand: ${complete ? "Parcours abgeschlossen" : "Zwischenstand"}`,
    `Bearbeitete Passagen: ${completedEntries || 0}/${totalEntries || 0}`,
    ""
  ];

  for (const lesson of lessons) {
    lines.push(`## ${lesson.title}`);
    lines.push(lesson.summary || "");
    lines.push(`Review-Fokus: ${lesson.reviewFocus || "-"}`);
    lines.push(`Seitenkorridor: ${lesson.pageRange || "-"}`);
    lines.push("");

    for (const entry of lesson.entries || []) {
      lines.push(`### ${entry.title}`);
      lines.push(`Modul: ${entry.moduleTitle || "-"}`);
      lines.push(`Seite: ${entry.pageHint || "-"}`);
      lines.push(`Passage: ${entry.passageLabel || "-"}`);
      lines.push(`Kontext: ${entry.context || "-"}`);
      lines.push("");
      pushQuestionBlock(
        lines,
        "Fokusfragen und schriftliche Antworten:",
        entry.focusAnswers || (entry.prompts || []).map((prompt, index) => ({
          prompt,
          answer: entry.answers?.focusAnswers?.[index] || ""
        }))
      );
      lines.push("Notizbuchfelder:");
      lines.push(`Beobachtung: ${displayValue(entry.answers?.observation)}`);
      lines.push(`Textanker / Wortlaut: ${displayValue(entry.answers?.evidence)}`);
      lines.push(`Deutung: ${displayValue(entry.answers?.interpretation)}`);
      lines.push(`Theoriebezug: ${displayValue(entry.answers?.theory)}`);
      lines.push(`Revision / nächster Schritt: ${displayValue(entry.answers?.revision)}`);
      lines.push(`Signalwörter der Passage: ${(entry.signalWords || []).join(", ")}`);
      lines.push(`Satzstarter: ${entry.writingFrame || "-"}`);
      lines.push("");

      for (const theory of entry.theorySections || []) {
        lines.push(`Leitfragen zu ${theory.title} (${theory.sourceTitle || "-"})`);
        pushQuestionBlock(lines, "Leitfragen und Antworten:", theory.guidingQuestions || []);
        pushQuestionBlock(lines, "Transfer zur Passage:", theory.transferQuestions || []);
      }

      if (entry.documentation) {
        lines.push(`Dokumentationsstand: ${entry.documentation.completed}/${entry.documentation.total}`);
        lines.push(
          `Offene Lücken: ${entry.documentation.missing?.length ? entry.documentation.missing.join(" · ") : "keine"}`
        );
        lines.push("");
      }
    }

    if (lesson.resources?.length) {
      lines.push("### Materialaufträge");
      lines.push("");

      for (const resource of lesson.resources) {
        lines.push(`#### ${resource.title}`);
        lines.push(`Material: ${resource.sourceTitle || "-"}`);
        lines.push(`Einordnung: ${resource.summary || "-"}`);
        lines.push(`Arbeitsauftrag: ${resource.task || "-"}`);
        lines.push(`Schriftliche Antwort: ${displayValue(resource.taskResponse)}`);
        lines.push("");
        pushQuestionBlock(lines, "Materialfragen und Antworten:", resource.questions || []);
        if (resource.documentation) {
          lines.push(`Dokumentationsstand: ${resource.documentation.completed}/${resource.documentation.total}`);
          lines.push(
            `Offene Lücken: ${resource.documentation.missing?.length ? resource.documentation.missing.join(" · ") : "keine"}`
          );
          lines.push("");
        }
      }
    }
  }

  return lines.join("\n");
}
