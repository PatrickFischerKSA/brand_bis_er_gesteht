import test from "node:test";
import assert from "node:assert/strict";
import { buildParcoursMarkdown } from "../public/kehlmann-reader/export.js";

test("parcours export renders Brand headings and answers", () => {
  const markdown = buildParcoursMarkdown({
    modeLabel: "Offene Version",
    classroomName: "Brand 10A",
    studentName: "Mira S.",
    complete: false,
    completedEntries: 1,
    totalEntries: 18,
    lessons: [
      {
        title: "Geständnis und Wahrheit",
        summary: "Das Geständnis wird als Zielpunkt, Kipppunkt und nicht als Ende aller Fragen gelesen.",
        reviewFocus: "Titel, Spannung, Aussage und Beweis differenziert zusammendenken.",
        pageRange: "S. 160-180",
        entries: [
          {
            title: "Geständnis und Wahrheit",
            moduleTitle: "Bis er gesteht",
            pageHint: "PDF: S. 160",
            passageLabel: "Wahrheitsanspruch",
            context: "Ein Geständnis kann aufklären, aber es ersetzt nicht automatisch die kritische Prüfung von Motiven, Aussagen und Beweisen.",
            prompts: [
              "Warum ist ein Geständnis erzählerisch stark, aber analytisch nicht das Ende aller Fragen?"
            ],
            answers: {
              observation: "Das Geständnis klärt eine Version, beendet aber nicht die Prüfung aller Details.",
              evidence: "Wahrheit, Aussage, Motiv, Beweis",
              interpretation: "Gerade dadurch bleibt kriminalistische Wahrheit an Sprache und Indizien gebunden.",
              theory: "Mit dem Dossier zu Verhör und Geständnis gelesen wird der Kipppunkt vorbereitet.",
              revision: "Noch genauer an Frage, Widerspruch und Beweis koppeln."
            },
            signalWords: ["Wahrheit", "Aussage", "Motiv", "Beweis"],
            writingFrame: "Ein Geständnis ist analytisch nicht das Ende, weil ...",
            theorySections: [
              {
                title: "Dossier: Verhör, Widerspruch und Geständnis",
                sourceTitle: "Lokales Dossier: Verhör und Geständnis",
                guidingQuestions: [
                  {
                    prompt: "Welche Frage verschiebt die Gesprächslage?",
                    answer: "Sie greift ein Detail auf, das die bisherige Version nicht mehr stabil erklären kann."
                  }
                ],
                transferQuestions: [
                  {
                    prompt: "Wie macht der Text ein Geständnis möglich?",
                    answer: "Die Passage verbindet Druck, Widerspruch und die Prüfung einer Aussage."
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          {
            title: "Nach dem Geständnis",
            sourceTitle: "Lokales Dossier: True-Crime-Ethik",
            summary: "Auch Aufklärung verlangt verantwortliches Erzählen.",
            task: "Prüfe, welche ethischen Fragen nach dem Geständnis offen bleiben.",
            taskResponse: "Tragfähig ist eine Lesart, die Aufklärung, Angehörige und öffentliche Erinnerung zusammendenkt.",
            questions: [
              {
                prompt: "Was bleibt für Angehörige offen?",
                answer: "Ein Geständnis beantwortet nicht automatisch Trauer, Erinnerung und öffentliche Verantwortung."
              }
            ]
          }
        ]
      }
    ]
  });

  assert.match(markdown, /# Bis er gesteht - Parcoursdokumentation/);
  assert.match(markdown, /Geständnis und Wahrheit/);
  assert.match(markdown, /Warum ist ein Geständnis erzählerisch stark/);
  assert.match(markdown, /Nach dem Geständnis/);
});
