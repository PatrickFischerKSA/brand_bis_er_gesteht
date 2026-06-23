import test from "node:test";
import assert from "node:assert/strict";
import { evaluateReaderSebFeedback } from "../src/services/kehlmann-reader-feedback.mjs";

test("SEB feedback rewards textnahe and motivated Brand analysis", () => {
  const feedback = evaluateReaderSebFeedback({
    lessonId: "lektion-05",
    moduleId: "modul-05",
    entryId: "frage-14",
    theoryId: "verhoer-gestaendnis",
    note: {
      observation:
        "Das Geständnis wirkt stark, weil die vorherige Aussage durch Fragen, Widerspruch und Details brüchig wird.",
      evidence: "Wahrheit, Aussage, Motiv, Beweis",
      interpretation:
        "Die Passage zeigt und verdeutlicht, dass ein Geständnis erzählerisch ein Kipppunkt ist, analytisch aber weiter durch Beweise geprüft werden muss.",
      theory:
        "Mit dem Dossier zu Verhör und Geständnis gelesen wird deutlich, dass Frage, Druck und Widerspruch zusammenarbeiten.",
      revision: "Noch genauer an einem einzelnen Detail der Aussage anbinden."
    }
  });

  assert.ok(feedback.overallScore >= 70);
  assert.match(feedback.summary, /tragfähig|erkennbare Richtung/i);
  assert.equal(feedback.profile.length, 4);
  assert.ok(feedback.strengths.some((item) => /Text|Theorie|Passage/i.test(item)));
});

test("SEB feedback flags vague summary without enough motif or text anchoring", () => {
  const feedback = evaluateReaderSebFeedback({
    lessonId: "lektion-03",
    moduleId: "modul-03",
    entryId: "frage-08",
    theoryId: "material-craft",
    note: {
      observation: "Die Stelle ist traurig und wichtig.",
      evidence: "",
      interpretation: "Dann ist alles schlimm und man merkt, dass es ein grosses Problem gibt.",
      theory: "Es geht um den Prozess.",
      revision: ""
    }
  });

  assert.ok(feedback.overallScore < 70);
  assert.ok(feedback.cautions.length >= 1);
  assert.ok(feedback.nextMoves.some((item) => /Textanker|Linse|Wortlaut|Modullinse/i.test(item)));
});
