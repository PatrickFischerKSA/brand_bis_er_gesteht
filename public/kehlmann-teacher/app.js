const app = document.body;
const config = window.KEHLMANN_TEACHER_CONFIG || {};

const state = {
  loading: true,
  error: "",
  overview: null,
  selectedClassId: null,
  notice: ""
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Anfrage fehlgeschlagen.");
  }

  return response.json();
}

function currentClassroom() {
  return state.overview?.classes.find((entry) => entry.id === state.selectedClassId) || state.overview?.classes[0] || null;
}

function renderLessonOptions(classroom, key) {
  return state.overview.lessons.map((lesson) => `
    <option value="${lesson.id}" ${lesson.id === classroom[key] ? "selected" : ""}>
      ${escapeHtml(lesson.title)}
    </option>
  `).join("");
}

function renderClassCards() {
  return state.overview.classes.map((classroom) => `
    <button class="class-card ${classroom.id === state.selectedClassId ? "is-active" : ""}" data-action="select-class" data-class-id="${classroom.id}">
      <div class="eyebrow">${escapeHtml(classroom.name)}</div>
      <h2>${escapeHtml(`${classroom.studentCount} Lernende`)}</h2>
      <p>${escapeHtml(`${classroom.studentCount} Lernende · Ø ${classroom.averageProgress}% Fortschritt`)}</p>
      <p>${escapeHtml(`Peer Review: ${classroom.peerReviewSummary.completedReviews}/${classroom.peerReviewSummary.totalAssignments}`)}</p>
    </button>
  `).join("");
}

function renderStudents(classroom) {
  if (!classroom.students.length) {
    return '<div class="empty">Noch keine Lernenden in dieser Klasse angemeldet.</div>';
  }

  return classroom.students.map((student) => `
    <article class="student-card">
      <div class="student-head">
        <div>
          <h3>${escapeHtml(student.displayName)}</h3>
          <p>${escapeHtml(`Zuletzt aktiv: ${student.lastSeenAt ? new Date(student.lastSeenAt).toLocaleString("de-CH") : "-"}`)}</p>
        </div>
        <span class="badge">${escapeHtml(`${student.progress.percent}%`)}</span>
      </div>
      <div class="student-metrics">
        <span>${escapeHtml(`${student.progress.completedEntries}/${student.progress.totalEntries} Passagen`)}</span>
        <span>${escapeHtml(`${student.progress.theoryEntries} Theoriebezüge`)}</span>
        <span>${escapeHtml(`${student.progress.evidenceEntries} Textanker`)}</span>
        <span>${escapeHtml(`Letzter Modus: ${student.lastMode}`)}</span>
      </div>
      <div class="student-metrics">
        <span>${escapeHtml(`zugewiesen: ${student.peerReview.completedAssignedCount}/${student.peerReview.assignedCount}`)}</span>
        <span>${escapeHtml(`erhalten: ${student.peerReview.receivedCompletedCount}/${student.peerReview.receivedCount}`)}</span>
      </div>
      <div class="lesson-progress-list">
        ${student.progress.lessonProgress.map((lesson) => `
          <div class="lesson-progress-row">
            <span>${escapeHtml(lesson.title)}</span>
            <strong>${escapeHtml(`${lesson.completedEntries}/${lesson.totalEntries}`)}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function renderLessonLinks() {
  return state.overview.lessons.map((lesson) => `
    <article class="lesson-link-card">
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.summary)}</p>
      <div class="lesson-actions">
        <a class="button secondary" href="/open/lesson/${lesson.id}" target="_blank" rel="noreferrer">Offen</a>
        <a class="button secondary" href="/seb/lesson/${lesson.id}" target="_blank" rel="noreferrer">SEB</a>
      </div>
    </article>
  `).join("");
}

function renderTeacherGuide(classroom) {
  const classroomName = classroom?.name || "noch keine Lerngruppe";
  return `
    <article class="panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Betriebsprotokoll</div>
          <h2>Kuerzel und SEB sauber starten</h2>
        </div>
      </div>
      <div class="protocol-banner">
        <div class="protocol-chip">
          <span>Offene Version</span>
          <strong>${escapeHtml(config.openUrl || "/open")}</strong>
        </div>
        <div class="protocol-chip">
          <span>SEB-Version</span>
          <strong>${escapeHtml(config.sebUrl || "/seb")}</strong>
        </div>
        <div class="protocol-chip">
          <span>Offene Anmeldung</span>
          <strong>Nur Kuerzel</strong>
        </div>
        <div class="protocol-chip">
          <span>Aktive Lerngruppe</span>
          <strong>${escapeHtml(classroomName)}</strong>
        </div>
      </div>
      <div class="instruction-grid">
        <div class="instruction-card">
          <strong>1. Lerngruppe anlegen</strong>
          <p>Trage unter <em>Neue Lerngruppe anlegen</em> einen eindeutigen Namen ein, zum Beispiel <em>Klasse 10B Deutsch</em>, und klicke auf <em>Lerngruppe erstellen</em>.</p>
        </div>
        <div class="instruction-card">
          <strong>2. Freigabe eindeutig halten</strong>
          <p>Aktuell ausgewählt ist: <strong>${escapeHtml(classroomName)}</strong>. Fuer die vereinfachte Anmeldung sollte pro Modus immer nur eine Lerngruppe gleichzeitig freigeschaltet sein.</p>
        </div>
        <div class="instruction-card">
          <strong>3. Offene Anmeldung klären</strong>
          <p>Fuer die offene Version braucht es kein zusaetzliches Unterrichtspasswort mehr. Lernende melden sich nur mit einem klaren Namen oder Kuerzel an.</p>
        </div>
        <div class="instruction-card">
          <strong>4. Freigaben setzen</strong>
          <p>Lege fest, ob die offene Version und/oder die SEB-Version aktiv sind. Wähle zusätzlich die aktuelle SEB-Lektion und die Review-Lektion aus. Erst nach <em>Einstellungen speichern</em> gilt die Auswahl für diese Klasse.</p>
        </div>
        <div class="instruction-card">
          <strong>5. Offene Version starten</strong>
          <p>Schueler*innen oeffnen <em>${escapeHtml(config.openUrl || "/open")}</em>, tragen Namen oder Kuerzel ein und klicken auf <em>Freischalten</em>.</p>
        </div>
        <div class="instruction-card">
          <strong>6. SEB-Protokoll vor dem Unterricht</strong>
          <p>1. Aktive SEB-Lektion waehlen. 2. <em>Einstellungen speichern</em>. 3. Safe Exam Browser auf einem Testgeraet starten. 4. <em>${escapeHtml(config.sebUrl || "/seb")}</em> oeffnen. 5. Mit Testnamen anmelden. 6. Pruefen, ob genau die erwartete Lektion erscheint.</p>
        </div>
        <div class="instruction-card">
          <strong>7. Schüler-Registrierung im SEB</strong>
          <p>Im Safe Exam Browser oeffnen Schueler*innen <em>${escapeHtml(config.sebUrl || "/seb")}</em>, tragen nur Namen oder Kuerzel ein und klicken auf <em>Starten</em>.</p>
        </div>
        <div class="instruction-card">
          <strong>8. Minutiöse Endkontrolle</strong>
          <p>Vor Unterrichtsbeginn immer einmal selbst durchspielen: richtige Lerngruppe freigegeben, offene Version getestet, SEB getestet, richtige Lektion sichtbar. Erst dann an die Lerngruppe ausgeben.</p>
        </div>
        <div class="instruction-card">
          <strong>9. Wenn etwas schiefgeht</strong>
          <p>Falls die Anmeldung scheitert, pruefe zuerst die Schreibweise des Kuerzels und ob nicht mehrere Lerngruppen gleichzeitig fuer denselben Modus freigeschaltet sind. Oeffnet sich <em>/seb</em> nicht, kontrolliere den Safe Exam Browser und ${config.hasSebConfigKeyHash ? "die hinterlegte SEB-Konfiguration." : "die SEB-Umgebung."}</p>
        </div>
      </div>
    </article>
  `;
}

function renderCriteriaHelp() {
  return state.overview.reviewCriteria.map((criterion) => `
    <div class="criterion-help">
      <strong>${escapeHtml(criterion.label)}</strong>
      <p>${escapeHtml(criterion.prompt)}</p>
    </div>
  `).join("");
}

function render() {
  if (state.loading) {
    app.innerHTML = '<main class="teacher-shell"><section class="panel"><h1>Lädt ...</h1><p>Dashboard wird vorbereitet.</p></section></main>';
    return;
  }

  if (state.error) {
    app.innerHTML = `<main class="teacher-shell"><section class="panel"><h1>Dashboard nicht verfügbar</h1><p>${escapeHtml(state.error)}</p></section></main>`;
    return;
  }

  const classroom = currentClassroom();

  app.innerHTML = `
    <main class="teacher-shell">
      <section class="hero panel">
        <div>
          <div class="eyebrow">Lehrer*innen-Dashboard</div>
          <h1>Lerngruppen, Fortschritt und Peer Review</h1>
          <p>Hier steuerst du Lerngruppen, das aktive SEB-Arbeitsset, Peer-Review-Zuweisungen und den Lernstand der einzelnen Schueler*innen fuer die Heidi-Einheit.</p>
        </div>
        <div class="hero-actions">
          <a class="button secondary" href="${escapeHtml(config.teacherEntryUrl || "/teacher-entry")}">Lehrer*inneneingang</a>
          <a class="button secondary" href="/auth/teacher/logout">Abmelden</a>
          <a class="button secondary" href="/">Startseite</a>
        </div>
      </section>

      <section class="class-grid">
        ${renderClassCards()}
      </section>

      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-head">
            <div>
              <div class="eyebrow">Klassensteuerung</div>
              <h2>${escapeHtml(classroom?.name || "Klasse")}</h2>
            </div>
          </div>
          ${classroom ? `
            <form id="class-settings-form" class="form-grid">
              <input type="hidden" name="classId" value="${classroom.id}">
              <label>
                Klassenname
                <input type="text" name="name" value="${escapeHtml(classroom.name)}">
              </label>
              <label>
                Aktive SEB-Lektion
                <select name="activeSebLessonId">
                  ${renderLessonOptions(classroom, "activeSebLessonId")}
                </select>
              </label>
              <label class="toggle">
                <input type="checkbox" name="allowOpen" ${classroom.allowOpen ? "checked" : ""}>
                Offene Version freigeben
              </label>
              <label class="toggle">
                <input type="checkbox" name="allowSeb" ${classroom.allowSeb ? "checked" : ""}>
                SEB-Version freigeben
              </label>
              <div class="review-settings-box">
                <div class="eyebrow">Peer Review</div>
                <label class="toggle">
                  <input type="checkbox" name="peerReviewEnabled" ${classroom.peerReviewEnabled ? "checked" : ""}>
                  Peer Review in der offenen Version aktivieren
                </label>
                <label>
                  Review-Lektion
                  <select name="peerReviewLessonId">
                    ${renderLessonOptions(classroom, "peerReviewLessonId")}
                  </select>
                </label>
                <label>
                  Anzahl Reviews pro Person
                  <input type="number" min="0" max="5" name="requiredPeerReviews" value="${escapeHtml(classroom.requiredPeerReviews)}">
                </label>
                <label>
                  Review-Hinweise
                  <textarea name="peerReviewInstructions" rows="5">${escapeHtml(classroom.peerReviewInstructions || "")}</textarea>
                </label>
                <div class="metrics-row">
                  <span class="badge">${escapeHtml(`zugewiesen: ${classroom.peerReviewSummary.totalAssignments}`)}</span>
                  <span class="badge">${escapeHtml(`abgeschlossen: ${classroom.peerReviewSummary.completedReviews}`)}</span>
                  <span class="badge">${escapeHtml(`offen: ${classroom.peerReviewSummary.pendingReviews}`)}</span>
                </div>
              </div>
              <div class="row">
                <button type="submit">Einstellungen speichern</button>
              </div>
            </form>
          ` : ""}
          ${state.notice ? `<div class="notice-box success top-gap">${escapeHtml(state.notice)}</div>` : ""}
          ${state.error ? `<div class="notice-box error top-gap">${escapeHtml(state.error)}</div>` : ""}
          <form id="create-class-form" class="form-grid top-gap">
            <label>
              Neue Lerngruppe anlegen
              <input type="text" name="name" placeholder="z. B. Klasse 10B">
            </label>
            <button type="submit">Lerngruppe erstellen</button>
          </form>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div>
              <div class="eyebrow">Review-Rubrik und Lektionslinks</div>
              <h2>Arbeitsrahmen</h2>
            </div>
          </div>
          <div class="criteria-help-grid">
            ${renderCriteriaHelp()}
          </div>
          <div class="lesson-link-grid top-gap">
            ${renderLessonLinks()}
          </div>
        </article>
      </section>

      ${renderTeacherGuide(classroom)}

      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="eyebrow">Lernstand und Review-Fortschritt</div>
            <h2>${escapeHtml(classroom?.name || "Klasse")}</h2>
          </div>
        </div>
        <div class="student-grid">
          ${classroom ? renderStudents(classroom) : '<div class="empty">Keine Klasse ausgewählt.</div>'}
        </div>
      </section>
    </main>
  `;
}

async function loadOverview() {
  state.loading = true;
  render();

  try {
    state.overview = await request("/reader-api/teacher/bootstrap");
    state.selectedClassId = state.selectedClassId || state.overview.classes[0]?.id || null;
    state.loading = false;
    state.error = "";
    render();
  } catch (error) {
    state.loading = false;
    state.error = error.message;
    render();
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const action = target.dataset.action;

  if (action === "select-class") {
    state.selectedClassId = target.dataset.classId;
    state.notice = "";
    render();
  }

});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "create-class-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const previousSelectedClassId = state.selectedClassId;

    try {
      state.overview = await request("/reader-api/teacher/classes", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name")
        })
      });
      const createdClassroom = state.overview.classes.at(-1) || null;
      const selectedClassStillExists = state.overview.classes.some((entry) => entry.id === previousSelectedClassId);
      state.selectedClassId = selectedClassStillExists
        ? previousSelectedClassId
        : (previousSelectedClassId || state.overview.classes[0]?.id || null);
      state.notice = createdClassroom
        ? `Lerngruppe ${createdClassroom.name} erstellt. Die aktuelle Ansicht bleibt auf der bisher gewaehlten Lektion und Lerngruppe.`
        : "Lerngruppe erstellt.";
      state.error = "";
      event.target.reset();
      render();
    } catch (error) {
      state.error = error.message;
      state.notice = "";
      render();
    }
  }

  if (event.target.id === "class-settings-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const classId = formData.get("classId");

    try {
      state.overview = await request(`/reader-api/teacher/classes/${classId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.get("name"),
          activeSebLessonId: formData.get("activeSebLessonId"),
          allowOpen: formData.get("allowOpen") === "on",
          allowSeb: formData.get("allowSeb") === "on",
          peerReviewEnabled: formData.get("peerReviewEnabled") === "on",
          peerReviewLessonId: formData.get("peerReviewLessonId"),
          requiredPeerReviews: Number(formData.get("requiredPeerReviews") || 0),
          peerReviewInstructions: formData.get("peerReviewInstructions")
        })
      });
      state.notice = "Lerngruppen-Einstellungen wurden gespeichert.";
      state.error = "";
      render();
    } catch (error) {
      state.error = error.message;
      state.notice = "";
      render();
    }
  }
});

loadOverview();
