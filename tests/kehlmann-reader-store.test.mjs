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

test("createClassroom generates a HEID code and all current lesson ids", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 10B" });

  assert.equal(store.classes.length, 1);
  assert.equal(classroom.name, "Klasse 10B");
  assert.match(classroom.code, /^HEID-[A-Z0-9]{6}$/);
  assert.equal(classroom.lessonIds.length, 10);
  assert.ok(classroom.lessonIds.includes("lektion-01"));
  assert.ok(classroom.lessonIds.includes("lektion-05"));
  assert.ok(classroom.lessonIds.includes("lektion-10"));
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
    entryId: "frage-30",
    theoryId: "stadt-land",
    notes: {
      "frage-30": {
        observation: "Die Spukgeschichte zeigt, dass Heidis Heimweh nicht als Ungehorsam, sondern als körperliche Krise sichtbar wird.",
        evidence: "spukhaften Vorgänge, Doktor, Heimweh",
        interpretation: "Dadurch wird Frankfurt als Raum lesbar, der Heidi krank macht, obwohl alle Regeln äußerlich ordentlich erscheinen.",
        theory: "Mit dem Dossier zu Stadt und Heimweh gelesen verbindet die Szene Hausordnung, Medizin und kindliche Sehnsucht.",
        revision: "Noch genauer am Fenster- und Hausmotiv schärfen."
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
