import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTeacherOverview,
  createClassroom,
  createOrResumeStudent,
  regenerateClassroomCode,
  saveReaderProgress
} from "../src/services/kehlmann-reader-store.mjs";

function emptyStore() {
  return {
    classes: [],
    students: [],
    work: [],
    reviews: []
  };
}

test("createClassroom generates a class code and all current lesson ids", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 10B" });

  assert.equal(store.classes.length, 1);
  assert.equal(classroom.name, "Klasse 10B");
  assert.match(classroom.code, /^HEID-[A-Z0-9]{6}$/);
  assert.equal(classroom.lessonIds.length, 6);
  assert.ok(classroom.lessonIds.includes("lektion-01"));
  assert.ok(classroom.lessonIds.includes("lektion-05"));
  assert.ok(classroom.lessonIds.includes("lektion-06"));
});

test("regenerateClassroomCode replaces the existing class code", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 10C" });
  const previousCode = classroom.code;

  regenerateClassroomCode(store, classroom.id);

  assert.notEqual(classroom.code, previousCode);
  assert.match(classroom.code, /^HEID-[A-Z0-9]{6}$/);
});

test("student registration reuses same learner and stores progress in selected lesson", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 10D" });

  const first = createOrResumeStudent(store, {
    displayName: "Nora S.",
    mode: "open",
    lessonId: "lektion-02"
  });

  const second = createOrResumeStudent(store, {
    displayName: "Nora S.",
    mode: "seb",
    lessonId: "lektion-06"
  });

  assert.equal(store.students.length, 1);
  assert.equal(first.student.id, second.student.id);
  assert.equal(second.work.selectedLessonId, "lektion-06");

  saveReaderProgress(store, first.student.id, {
    mode: "open",
    lessonId: "lektion-06",
    moduleId: "modul-06",
    entryId: "frage-16",
    theoryId: "true-crime-ethik",
    notes: {
      "frage-16": {
        observation: "Die Gesamtthese verbindet Textwirkung, Fallrekonstruktion und Verantwortung.",
        evidence: "These, Beleg, Deutung, Verantwortung",
        interpretation: "Dadurch wird die True-Crime-Erzählung nicht nur spannend, sondern als reflektierte Darstellungsform lesbar.",
        theory: "Mit der Ethik-Linse gelesen bleiben Opferperspektive und öffentliche Erinnerung zentral.",
        revision: "Noch genauer an einer Textstelle belegen."
      }
    }
  });

  const overview = buildTeacherOverview(store);
  const overviewClass = overview.classes.find((entry) => entry.id === classroom.id);
  const student = overviewClass.students.find((entry) => entry.displayName === "Nora S.");

  assert.equal(student.progress.completedEntries, 1);
  assert.equal(student.progress.lessonProgress.some((lesson) => lesson.id === "lektion-06"), true);
});

test("student registration without class code uses newest open class when several are active", () => {
  const store = emptyStore();
  const olderClassroom = createClassroom(store, { name: "Klasse 10E" });
  const newerClassroom = createClassroom(store, { name: "Klasse 10F" });
  olderClassroom.updatedAt = "2026-01-01T00:00:00.000Z";
  newerClassroom.updatedAt = "2026-01-02T00:00:00.000Z";

  const access = createOrResumeStudent(store, {
    displayName: "Nora S.",
    mode: "open"
  });

  assert.equal(access.classroom.id, newerClassroom.id);
});

test("student registration accepts full names with umlauts and whitespace", () => {
  const store = emptyStore();
  createClassroom(store, { name: "Klasse 10G" });

  const first = createOrResumeStudent(store, {
    displayName: "  Zoë   Müller-Schäfer  ",
    mode: "open"
  });
  const second = createOrResumeStudent(store, {
    displayName: "Zoë Müller-Schäfer",
    mode: "open"
  });

  assert.equal(first.student.id, second.student.id);
  assert.equal(first.student.displayName, "Zoë Müller-Schäfer");
});

test("teacher overview exposes saved passage and material answers", () => {
  const store = emptyStore();
  createClassroom(store, { name: "Klasse 10H" });

  const access = createOrResumeStudent(store, {
    displayName: "  Anna   Müller  ",
    mode: "open",
    lessonId: "lektion-01"
  });

  saveReaderProgress(store, access.student.id, {
    mode: "open",
    lessonId: "lektion-01",
    moduleId: "modul-01",
    entryId: "frage-01",
    theoryId: "fall-rekonstruktion",
    notes: {
      "frage-01": {
        observation: "Der Notruf erzeugt Nähe, aber seine Informationen bleiben prüfbedürftig.",
        evidence: "Polizeinotruf, beide Kinder, tot, Fenster",
        interpretation: "Die Szene zeigt, dass Schock und erste Version nicht automatisch Wahrheit bedeuten.",
        theory: "Das Fallrekonstruktions-Dossier hilft, gesicherte Angaben, Behauptungen und offene Fragen zu trennen.",
        revision: "Die Zeitangaben noch genauer ordnen.",
        focusAnswers: [
          "Der Notruf wirkt unmittelbar, bleibt aber durch Wiederholung und Raumdetails verdächtig offen."
        ],
        theoryResponses: {
          "fall-rekonstruktion": {
            guidingAnswers: ["Gesichert sind einzelne Zeit- und Raumangaben; behauptet wird die Einbruchsversion."],
            transferAnswers: ["Die Lesart trennt Notrufschock von kriminalistischer Prüfung."]
          }
        }
      },
      "lesson-resource::lektion-01::fall-rekonstruktion": {
        taskResponse: "Die Mikro-Timeline trennt Uhrzeiten, behauptete Abläufe und offene Lücken.",
        questionAnswers: [
          "Ausdrücklich genannt sind Datum, Uhrzeit des Notrufs und die Schlafenszeit.",
          "Nur behauptet werden Einbruch, geraubtes Geld und der genaue Ablauf.",
          "Die Lücke zwischen Schlafenszeit und Notruf erzeugt die stärkste Spannung."
        ]
      }
    }
  });

  const overview = buildTeacherOverview(store);
  const student = overview.classes[0].students.find((entry) => entry.displayName === "Anna Müller");
  const lesson = student.workDetail.find((entry) => entry.id === "lektion-01");
  const passage = lesson.entries.find((entry) => entry.id === "frage-01");
  const material = lesson.materials.find((entry) => entry.resourceId === "fall-rekonstruktion");

  assert.equal(student.displayName, "Anna Müller");
  assert.equal(passage.answers.interpretation, "Die Szene zeigt, dass Schock und erste Version nicht automatisch Wahrheit bedeuten.");
  assert.equal(passage.focusAnswers[0].answer, "Der Notruf wirkt unmittelbar, bleibt aber durch Wiederholung und Raumdetails verdächtig offen.");
  assert.equal(passage.theoryResponses[0].guidingAnswers[0], "Gesichert sind einzelne Zeit- und Raumangaben; behauptet wird die Einbruchsversion.");
  assert.equal(material.taskResponse, "Die Mikro-Timeline trennt Uhrzeiten, behauptete Abläufe und offene Lücken.");
  assert.equal(material.questions.length, 3);
  assert.match(material.questions[0].expected, /Datum|Uhrzeit|Schlafenszeit/);
  assert.equal(overview.materials.some((entry) => entry.id === "fall-rekonstruktion"), true);
});
