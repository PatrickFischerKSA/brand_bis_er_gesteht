const pdfPath = "/reader/assets/brand-bis-er-gesteht.pdf";
const coverImg = "/reader/assets/brand-cover.svg";
const authorImg = "/reader/assets/christine-brand-card.svg";

const fillerWords = new Set([
  "der", "die", "das", "und", "oder", "dass", "weil", "wird", "werden", "einer", "eine", "einem", "einen", "eines",
  "wie", "warum", "welche", "welcher", "welches", "wodurch", "woran", "wo", "hier", "dieser", "diese", "dieses",
  "passage", "szene", "text", "stelle", "genau", "besonders", "mehr", "schon", "gerade", "doch", "noch"
]);

const theoryProfiles = {
  "fall-rekonstruktion": {
    label: "Fallrekonstruktion",
    aliases: ["fall", "rekonstruktion", "chronologie", "ablauf", "notruf", "tatort", "spuren", "timeline", "zeit"]
  },
  "true-crime-ethik": {
    label: "True-Crime-Ethik",
    aliases: ["true crime", "ethik", "opfer", "angehörige", "medien", "sensationslust", "verantwortung", "respekt"]
  },
  "erzaehltechnik": {
    label: "Erzähltechnik",
    aliases: ["erzählung", "erzaehlung", "perspektive", "spannung", "schnitt", "dialog", "protokoll", "montage"]
  },
  "verhoer-gestaendnis": {
    label: "Verhör und Geständnis",
    aliases: ["verhör", "verhoer", "geständnis", "gestaendnis", "druck", "frage", "aussage", "widerspruch", "strategie"]
  },
  "sprache-beweis": {
    label: "Sprache und Beweis",
    aliases: ["sprache", "beweis", "signalwort", "formulierung", "wiederholung", "modalität", "detail", "indiz"]
  },
  "autorinnenkontext": {
    label: "Autorinnen- und Werk-Kontext",
    aliases: ["christine brand", "autorin", "journalistin", "bücher", "buecher", "werk", "recherche", "true-crime-serie"]
  },
  "crime-podcast": {
    label: "Crime-Podcast",
    aliases: ["podcast", "unter verdacht", "zwillingsmord", "horgen", "folge", "audio", "journalismus", "stimme"]
  },
  "rechtsprechung": {
    label: "Rechtsprechung und Gesetz",
    aliases: ["rechtsprechung", "stgb", "stpo", "bundesgericht", "gericht", "urteil", "prozess", "anklage", "verteidigung"]
  },
  "indizienprozess": {
    label: "Indizienprozess",
    aliases: ["indizien", "indizienprozess", "beweiswürdigung", "beweiswuerdigung", "in dubio", "zweifel", "schuld", "freispruch"]
  },
  "urteilswerkstatt": {
    label: "Urteilswerkstatt",
    aliases: ["urteil", "urteilsvarianten", "mord", "vorsätzliche tötung", "vorsaetzliche toetung", "strafzumessung", "lebenslänglich", "freispruch"]
  },
  "gerichtsurteil": {
    label: "Bezirksgerichtsurteil",
    aliases: ["bezirksgericht", "horgen", "urteil", "beschluss", "dispositiv", "anklage", "verteidigung", "staatsanwaltschaft", "privatkläger"]
  },
  "verteidigung-gutachten": {
    label: "Verteidigung und Gutachten",
    aliases: ["verteidigung", "explorationsgespräch", "explorationsgespraech", "psychiatrisch", "sachverständig", "sachverstaendig", "schuldfähigkeit", "schuldfaehigkeit", "massnahme", "emrk", "teilnahmerecht"]
  }
};

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeMeaningful(value = "") {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token && token.length > 2 && !fillerWords.has(token));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function aliasVariants(value = "") {
  const plain = normalizeText(value);
  if (!plain) {
    return [];
  }
  const variants = new Set([plain]);
  if (plain.includes("ä")) variants.add(plain.replaceAll("ä", "ae"));
  if (plain.includes("ö")) variants.add(plain.replaceAll("ö", "oe"));
  if (plain.includes("ü")) variants.add(plain.replaceAll("ü", "ue"));
  for (const item of [...variants]) {
    if (item.length > 5) {
      for (const suffix of ["en", "er", "e", "n", "s"]) {
        if (item.endsWith(suffix) && item.length - suffix.length >= 4) {
          variants.add(item.slice(0, -suffix.length));
        }
      }
    }
  }
  return [...variants];
}

function firstSentence(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const [sentence] = text.split(/(?<=[.!?])\s+/u);
  return sentence || text;
}

function capitalize(value = "") {
  const text = String(value || "").trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function naturalJoin(items = []) {
  const parts = items.filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} und ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} und ${parts.at(-1)}`;
}

function operatorProfile(prompt = "") {
  const text = normalizeText(prompt);
  if (/^(warum|wie|erkläre|erklaere|erläutere|erlaeutere)/.test(text)) {
    return { label: "Erklären", sentenceCount: "3-4", action: "Erkläre die Beobachtung, sichere sie am Text und leite ihre Wirkung oder Funktion ab" };
  }
  if (/^(zeige|weise|ordne|vergleiche|verbinde)/.test(text)) {
    return { label: "Zeigen", sentenceCount: "3-4", action: "Zeige die Aussage an einem genauen Detail und führe sie zu einer Deutung weiter" };
  }
  if (/^(prüfe|pruefe|entscheide|beurteile)/.test(text)) {
    return { label: "Prüfen", sentenceCount: "3-4", action: "Entscheide dich begründet und sichere deine Entscheidung am Text" };
  }
  if (/^(wo|wodurch|woran|welche|welcher|welches|nenne|benenne)/.test(text)) {
    return { label: "Benennen", sentenceCount: "2-3", action: "Benenne zuerst das Textsignal und erkläre dann knapp seine Funktion" };
  }
  return { label: "Ausarbeiten", sentenceCount: "3-4", action: "Arbeite die Frage in präzisen, textnahen Sätzen aus" };
}

function focusTerms(prompt = "", context = "", extras = []) {
  return unique([
    ...tokenizeMeaningful(prompt),
    ...tokenizeMeaningful(context),
    ...extras.flatMap((item) => tokenizeMeaningful(item))
  ]).slice(0, 6);
}

function conceptFromAliases(label, aliases = []) {
  const normalizedAliases = unique(
    aliases.flatMap((alias) => aliasVariants(alias).flatMap((variant) => unique([variant, ...variant.split(" ").filter((part) => part.length > 2)])))
  );
  return { label, aliases: normalizedAliases };
}

function theoryConcepts(ids = []) {
  return ids
    .map((id) => theoryProfiles[id])
    .filter(Boolean)
    .map((profile) => conceptFromAliases(profile.label, profile.aliases));
}

function modelAnswerForTask({ prompt, context, signalWords = [], keyIdeas = [], relatedTheoryIds = [], taskTitle = "" }) {
  const sentence = firstSentence(context || taskTitle);
  const promptFocus = focusTerms(prompt, "", [...signalWords, ...keyIdeas, taskTitle]).slice(0, 3);
  const promptSentence = promptFocus.length ? `Im Zentrum der Frage stehen hier ${naturalJoin(promptFocus)}.` : "";
  const evidence = signalWords.length ? `Das sieht man an Signalen wie ${signalWords.slice(0, 2).map((word) => `"${word}"`).join(" und ")}.` : "";
  const theoryHint = relatedTheoryIds.map((id) => theoryProfiles[id]?.label).filter(Boolean).slice(0, 2);
  const finalSentence = theoryHint.length
    ? `So wird besonders ${theoryHint.join(" und ").toLowerCase()} sichtbar.`
    : "Dadurch wird die Funktion der Passage deutlich und nicht nur ihr Inhalt nacherzählt.";
  return unique([promptSentence, capitalize(sentence), evidence, finalSentence]).join(" ");
}

function instructionForTask(prompt, { signalWords = [], relatedTheoryIds = [], kind = "question" } = {}) {
  const operator = operatorProfile(prompt);
  const evidencePart = signalWords.length
    ? `Arbeite mit mindestens einem genauen Signalwort, zum Beispiel ${signalWords.slice(0, 2).map((word) => `"${word}"`).join(" oder ")}.`
    : "Arbeite mit mindestens einem genauen Textdetail oder Wortlaut.";
  const theoryPart = relatedTheoryIds.length
    ? `Verbinde deine Beobachtung am Schluss mit ${relatedTheoryIds.map((id) => theoryProfiles[id]?.label).filter(Boolean).slice(0, 2).join(" oder ")}.`
    : "Schliesse mit einer klaren Deutung oder Funktionsaussage.";
  const opening = kind === "transfer"
    ? "Beziehe Passage und Deutungslinse ausdrücklich aufeinander"
    : kind === "resource"
      ? "Nutze das Material als Leselinse und bleibe eng am Romanausschnitt"
      : operator.action;
  return `Antworte in ${operator.sentenceCount} Sätzen. ${opening}. ${evidencePart} ${theoryPart}`;
}

function checklistForTask(prompt, { signalWords = [], relatedTheoryIds = [] } = {}) {
  const operator = operatorProfile(prompt);
  return unique([
    `${operator.label}: ${capitalize(prompt.replace(/\?$/, ""))}.`,
    signalWords.length ? `Nenne mindestens ein Textsignal: ${signalWords.slice(0, 3).join(", ")}.` : "Nenne mindestens ein Textsignal oder eine genaue Beobachtung.",
    relatedTheoryIds.length ? `Verbinde deine Aussage mit ${relatedTheoryIds.map((id) => theoryProfiles[id]?.label).filter(Boolean).slice(0, 2).join(" oder ")}.` : "Formuliere am Schluss Wirkung, Funktion oder Ambivalenz."
  ]);
}

export function buildTask(prompt, options = {}) {
  const { context = "", signalWords = [], relatedTheoryIds = [], keyIdeas = [], kind = "question", taskTitle = "" } = options;
  const question = String(prompt || "").trim();
  const conceptTerms = focusTerms(question, context, [...signalWords, ...keyIdeas]);
  const concepts = unique([
    signalWords.length ? conceptFromAliases("Textsignal", signalWords) : null,
    ...theoryConcepts(relatedTheoryIds),
    conceptTerms.length ? conceptFromAliases("Fragekern", conceptTerms) : null
  ]);
  return {
    prompt: question,
    operatorLabel: operatorProfile(question).label,
    instruction: instructionForTask(question, { signalWords, relatedTheoryIds, kind }),
    checklist: checklistForTask(question, { signalWords, relatedTheoryIds }),
    modelAnswer: modelAnswerForTask({ prompt: question, context, signalWords, keyIdeas, relatedTheoryIds, taskTitle }),
    concepts,
    synonymHints: unique(concepts.flatMap((concept) => concept.aliases)).slice(0, 10)
  };
}

export const theoryResources = [
  {
    id: "fall-rekonstruktion",
    title: "Dossier: Fallrekonstruktion und Chronologie",
    shortTitle: "Fall",
    sourceTitle: "Lokales Dossier: Fallrekonstruktion",
    mediaType: "html",
    openUrl: "/reader/assets/brand-fallrekonstruktion.html",
    embedUrl: "/reader/assets/brand-fallrekonstruktion.html",
    summary: "Die Lektüre trennt erzählte Reihenfolge, vermuteten Tatablauf und kriminalistische Rekonstruktion. So wird sichtbar, wie Spannung aus Lücken, Wiederholungen und späteren Korrekturen entsteht.",
    keyIdeas: ["Chronologie", "Tatort", "Notruf", "Indiz"],
    questions: ["Welche Informationen sind sicher, welche werden nur behauptet?", "Wie verändert eine spätere Information den Blick auf den Anfang?"],
    transferPrompts: ["Lege für eine Passage eine Mikro-Timeline an und markiere eine Unsicherheit.", "Unterscheide zwischen Beobachtung, Vermutung und Schlussfolgerung."],
    writingFrame: "Mit der Leselinse Fallrekonstruktion wird sichtbar, dass ..."
  },
  {
    id: "true-crime-ethik",
    title: "Dossier: True Crime, Opferperspektive und Verantwortung",
    shortTitle: "Ethik",
    sourceTitle: "Lokales Dossier: True-Crime-Ethik",
    mediaType: "html",
    openUrl: "/reader/assets/brand-true-crime-ethik.html",
    embedUrl: "/reader/assets/brand-true-crime-ethik.html",
    summary: "Der Text arbeitet mit einem realen Fall. Die Einheit fragt deshalb immer mit, wie Spannung, Informationsinteresse und Respekt gegenüber Opfern und Angehörigen austariert werden.",
    keyIdeas: ["Opfer", "Angehörige", "Medien", "Respekt"],
    questions: ["Wo erzeugt der Text Spannung, ohne Leid auszuschlachten?", "Welche Grenze sollte eine True-Crime-Erzählung nicht überschreiten?"],
    transferPrompts: ["Formuliere eine Regel für verantwortliches Lesen dieser Passage.", "Prüfe, ob eine Szene eher aufklärt, emotionalisiert oder dramatisiert."],
    writingFrame: "Ethisch sorgfältig gelesen zeigt die Passage, dass ..."
  },
  {
    id: "erzaehltechnik",
    title: "Dossier: Protokoll, Montage und Spannung",
    shortTitle: "Erzählen",
    sourceTitle: "Lokales Dossier: Erzähltechnik",
    mediaType: "html",
    openUrl: "/reader/assets/brand-erzaehltechnik.html",
    embedUrl: "/reader/assets/brand-erzaehltechnik.html",
    summary: "Notruf, Bericht, Dialog, Ermittlungsdarstellung und Rückblick erzeugen eine dokumentarische Wirkung. Entscheidend ist, wie viel die Lesenden wann wissen.",
    keyIdeas: ["Montage", "Perspektive", "Dialog", "Spannung"],
    questions: ["Welche Textform dominiert die Passage?", "Wie steuert die Reihenfolge unser Misstrauen oder Mitgefühl?"],
    transferPrompts: ["Analysiere einen Schnitt zwischen zwei Informationsformen.", "Zeige, wie ein Dialog mehr verrät, als die Figur sagen will."],
    writingFrame: "Erzähltechnisch fällt auf, dass ..."
  },
  {
    id: "verhoer-gestaendnis",
    title: "Dossier: Verhör, Widerspruch und Geständnis",
    shortTitle: "Verhör",
    sourceTitle: "Lokales Dossier: Verhör und Geständnis",
    mediaType: "html",
    openUrl: "/reader/assets/brand-verhoer-gestaendnis.html",
    embedUrl: "/reader/assets/brand-verhoer-gestaendnis.html",
    summary: "Ein Geständnis entsteht nicht einfach plötzlich. Es wird vorbereitet durch Fragen, Widersprüche, Druck, Wiederholung und den Zerfall einer Version.",
    keyIdeas: ["Frage", "Widerspruch", "Druck", "Geständnis"],
    questions: ["Welche Frage verschiebt die Gesprächslage?", "Wie zeigt der Text, dass eine Version brüchig wird?"],
    transferPrompts: ["Markiere in einem Verhörabschnitt Angriff, Ausweichen und Korrektur.", "Erkläre, warum ein kleines Detail stärker wirken kann als eine direkte Beschuldigung."],
    writingFrame: "Im Verhör wird sichtbar, dass ..."
  },
  {
    id: "sprache-beweis",
    title: "Dossier: Sprache, Wiederholung und Beweiswert",
    shortTitle: "Sprache",
    sourceTitle: "Lokales Dossier: Sprache und Beweis",
    mediaType: "html",
    openUrl: "/reader/assets/brand-sprache-beweis.html",
    embedUrl: "/reader/assets/brand-sprache-beweis.html",
    summary: "Wiederholungen, Korrekturen, Modalverben und auffällige Details können als sprachliche Spuren gelesen werden. Dabei bleibt wichtig: Sprache ist Hinweis, nicht automatisch Beweis.",
    keyIdeas: ["Wiederholung", "Formulierung", "Detail", "Indiz"],
    questions: ["Welche Formulierung wirkt auffällig?", "Wann wird aus einem sprachlichen Signal ein tragfähiger Hinweis?"],
    transferPrompts: ["Untersuche eine Wiederholung auf ihre Funktion.", "Unterscheide zwischen sprachlicher Auffälligkeit und kriminalistischem Beweis."],
    writingFrame: "An der Sprache wird sichtbar, dass ..."
  },
  {
    id: "material-craft",
    title: "Materialstation: Craft-Ressourcen",
    shortTitle: "Craft",
    sourceTitle: "Externe Craft-Sammlung",
    mediaType: "html",
    openUrl: "/reader/assets/brand-craft-material.html",
    embedUrl: "/reader/assets/brand-craft-material.html",
    summary: "Die Craft-Ressourcen werden als Materialpool genutzt: Recherchehinweise, Kontext, Beobachtungsaufträge und mögliche Vergleichsimpulse werden in prüfbare Leseaufgaben übersetzt.",
    keyIdeas: ["Materialpool", "Kontext", "Recherche", "Vergleich"],
    questions: ["Welche Ressource schärft eine konkrete Textbeobachtung?", "Wo muss Kontextwissen vorsichtig bleiben?"],
    transferPrompts: ["Wähle einen Craft-Impuls und formuliere daraus eine textnahe These.", "Trenne Zusatzwissen, Vermutung und belegte Textbeobachtung."],
    writingFrame: "Mit dem Materialpool lässt sich zeigen, dass ...",
    externalLinks: [
      {
        label: "Craft: Ressourcen zu Bis er gesteht",
        url: "https://s.craft.me/XgxAPOHHfRKKgu"
      }
    ]
  },
  {
    id: "hoerbuch",
    title: "Hörstation: Stimme, Tempo und Wirkung",
    shortTitle: "Hörbuch",
    sourceTitle: "Dropbox-Hörbuchordner",
    mediaType: "html",
    openUrl: "/reader/assets/brand-hoerbuch.html",
    embedUrl: "/reader/assets/brand-hoerbuch.html",
    summary: "Die Hörfassung wird als analytisches Werkzeug genutzt: Betonung, Tempo und Pausen machen sichtbar, wie Notruf, Verhör oder Geständnis emotional gesteuert werden.",
    keyIdeas: ["Stimme", "Tempo", "Pause", "Wirkung"],
    questions: ["Welche Betonung verändert deine Deutung?", "Wo erzeugt die Stimme Nähe, Distanz oder Druck?"],
    transferPrompts: ["Höre eine Passage und notiere drei stimmliche Signale.", "Vergleiche Leseeindruck und Höreindruck an derselben Stelle."],
    writingFrame: "Die Hörfassung macht hörbar, dass ...",
    externalLinks: [
      {
        label: "Dropbox: Hörbuchordner",
        url: "https://www.dropbox.com/scl/fo/467llo67rclpn002zrbpw/AAHU6ZP-t97_2N8GIRiz3xU?rlkey=lcw7jj6yctljum7g2bbodb6x0&st=o5up4o4p&dl=0"
      }
    ]
  },
  {
    id: "autorinnenkontext",
    title: "Autorinnenstation: Christine Brand",
    shortTitle: "Autorin",
    sourceTitle: "Christine Brand: Website",
    mediaType: "html",
    openUrl: "/reader/assets/brand-autorin.html",
    embedUrl: "/reader/assets/brand-autorin.html",
    summary: "Christine Brands Website liefert Autorinnen-, Werk- und Reihen-Kontext. Für die Lektüre wird daraus eine Frage nach journalistischer Recherche, Krimischreiben und True-Crime-Erzählweise.",
    keyIdeas: ["Autorin", "Journalismus", "Werk", "Recherche"],
    questions: ["Welche Rolle spielt Brands journalistischer Hintergrund für die Wirkung des Textes?", "Wie hilft Werk-Kontext, ohne die Textanalyse zu ersetzen?"],
    transferPrompts: ["Verbinde eine Textbeobachtung mit Brands Profil als Autorin und Journalistin.", "Prüfe, wo Autorinnenwissen eine Deutung schärft und wo es vorsichtig bleiben muss."],
    writingFrame: "Mit dem Autorinnenkontext wird sichtbar, dass ...",
    externalLinks: [
      {
        label: "Christine Brand: Website",
        url: "https://christinebrand.ch/"
      }
    ]
  },
  {
    id: "crime-podcast",
    title: "Podcaststation: Unter Verdacht - Der Zwillingsmord von Horgen (2/3)",
    shortTitle: "Podcast",
    sourceTitle: "Unter Verdacht - Der Schweizer Crime-Podcast",
    mediaType: "html",
    openUrl: "/reader/assets/brand-crime-podcast.html",
    embedUrl: "/reader/assets/brand-crime-podcast.html",
    summary: "Die Podcastfolge wird als Vergleichsmedium genutzt: Audiojournalismus ordnet, dramatisiert und erklärt anders als Buchtext, PDF oder Hörbuch.",
    keyIdeas: ["Podcast", "Audiojournalismus", "Horgen", "Vergleich"],
    questions: ["Welche Informationen oder Wirkungen liefert der Podcast anders als der Text?", "Wie verändert die journalistische Audioform den Blick auf den Fall?"],
    transferPrompts: ["Vergleiche eine Textpassage mit einer Podcastsequenz.", "Prüfe, wie Stimme, Schnitt und journalistische Einordnung Verantwortung übernehmen oder Spannung erzeugen."],
    writingFrame: "Im Vergleich mit dem Podcast wird sichtbar, dass ...",
    externalLinks: [
      {
        label: "Simplecast: Der Zwillingsmord von Horgen (2/3)",
        url: "https://unter-verdacht-der-schweizer-crime-podcast.simplecast.com/episodes/der-zwillingsmord-von-horgen-2-3-lUxIge_g"
      }
    ]
  },
  {
    id: "rechtsprechung",
    title: "Rechtsstation: Gesetz, Rechtsprechung und Gerichtsakten",
    shortTitle: "Recht",
    sourceTitle: "Fedlex, Bundesgericht, Zürcher Gerichte",
    mediaType: "html",
    openUrl: "/reader/assets/brand-rechtsprechung.html",
    embedUrl: "/reader/assets/brand-rechtsprechung.html",
    summary: "Die Rechtsstation führt in die juristischen Grundlagen ein: Straftatbestände, Strafprozess, Entscheidrecherche und die Frage, wie aus Akten ein Urteil wird.",
    keyIdeas: ["StGB", "StPO", "Bundesgericht", "Gerichtsentscheid"],
    questions: ["Welche Normen und Rechtsbegriffe braucht ein Urteil?", "Welche Beweisfragen bleiben für Anklage, Verteidigung und Gericht strittig?"],
    transferPrompts: ["Ordne eine Textspur einer juristischen Frage zu.", "Prüfe, welche Aktenstücke für einen Schuldspruch tragen und welche Zweifel offenlassen."],
    writingFrame: "Juristisch gelesen zeigt die Spur, dass ...",
    externalLinks: [
      {
        label: "Fedlex: Schweizerisches Strafgesetzbuch (StGB)",
        url: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/de"
      },
      {
        label: "Fedlex: Schweizerische Strafprozessordnung (StPO)",
        url: "https://www.fedlex.admin.ch/eli/cc/2010/267/de"
      },
      {
        label: "Bundesgericht: Rechtsprechungssuche",
        url: "https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?lang=de"
      },
      {
        label: "Gerichte Zürich: Entscheide suchen",
        url: "https://www.gerichte-zh.ch/entscheide/entscheide-suchen.html"
      }
    ]
  },
  {
    id: "gerichtsurteil",
    title: "Gerichtsakte: Urteil Bezirksgericht Horgen",
    shortTitle: "Urteil",
    sourceTitle: "Bezirksgericht Horgen, Urteil und Beschluss vom 29. Januar 2013",
    mediaType: "html",
    openUrl: "/reader/assets/brand-gerichtsurteil.html",
    embedUrl: "/reader/assets/brand-gerichtsurteil.html",
    summary: "Das reale Urteil des Bezirksgerichts Horgen wird zur zentralen Prozessakte. Es dokumentiert Anträge, Prozessgeschichte, Beweismittel, rechtliche Würdigung, Strafzumessung, Massnahme, Zivilforderungen und Dispositiv.",
    keyIdeas: ["Bezirksgericht Horgen", "Anklage", "Verteidigung", "Dispositiv"],
    questions: ["Welche Streitfrage trennt Anklage und Verteidigung?", "Wie begründet das Gericht die rechtliche Qualifikation und das Strafmass?"],
    transferPrompts: ["Vergleiche deine Urteilsvariante mit dem realen Dispositiv.", "Prüfe, wo literarische Spurensicherung und gerichtliche Beweiswürdigung unterschiedlich arbeiten."],
    writingFrame: "Im realen Urteil wird sichtbar, dass ...",
    externalLinks: [
      {
        label: "PDF: Urteil Bezirksgericht Horgen",
        url: "/reader/assets/urteil-bezirksgericht-horgener-zwillingsmord.pdf"
      }
    ]
  },
  {
    id: "verteidigung-gutachten",
    title: "Rechtsstation: Verteidigung, Exploration und psychiatrisches Gutachten",
    shortTitle: "Gutachten",
    sourceTitle: "Thierry Urwyler: Teilnahmerecht der Verteidigung am Explorationsgespräch",
    mediaType: "html",
    openUrl: "/reader/assets/brand-verteidigung-gutachten.html",
    embedUrl: "/reader/assets/brand-verteidigung-gutachten.html",
    summary: "Die Dissertation wird als Vertiefung zur Verteidigungsposition genutzt: Teilnahmerecht, EMRK, psychiatrische Exploration, Schuldfähigkeit und Massnahmenindikation.",
    keyIdeas: ["Verteidigung", "Exploration", "Schuldfähigkeit", "EMRK"],
    questions: ["Welche Rolle spielen psychiatrische Gutachten für Schuldfähigkeit und Massnahmen?", "Warum ist das Teilnahmerecht der Verteidigung verfahrensrechtlich bedeutsam?"],
    transferPrompts: ["Verbinde die Massnahmenfrage im Urteil mit dem Recht auf Verteidigung.", "Prüfe, wie Gutachten zwischen Medizin, Recht und Prozessstrategie stehen."],
    writingFrame: "Mit Blick auf Verteidigung und Gutachten wird sichtbar, dass ...",
    externalLinks: [
      {
        label: "PDF: Urwyler, Teilnahmerecht der Verteidigung",
        url: "/reader/assets/urwyler-teilnahmerecht-verteidigung-explorationsgespraech-emrk.pdf"
      }
    ]
  },
  {
    id: "indizienprozess",
    title: "Aktenstation: Indizienprozess und Beweiswürdigung",
    shortTitle: "Indizien",
    sourceTitle: "Didaktisierte Gerichtsakte",
    mediaType: "html",
    openUrl: "/reader/assets/brand-indizienprozess.html",
    embedUrl: "/reader/assets/brand-indizienprozess.html",
    summary: "Die Aktenstation sammelt Spuren als belastende, entlastende und mehrdeutige Indizien. Ziel ist kein schnelles Rätselraten, sondern ein begründetes Beweisbild.",
    keyIdeas: ["Indiz", "Beweiswürdigung", "Zweifel", "Aktenstück"],
    questions: ["Welche Indizien tragen gemeinsam, welche bleiben mehrdeutig?", "Wo beginnt vernünftiger Zweifel?"],
    transferPrompts: ["Führe eine Indizienkette mit mindestens drei Aktenstücken.", "Formuliere die stärkste Gegenhypothese zur eigenen Deutung."],
    writingFrame: "Als Indizienprozess gelesen ergibt sich ..."
  },
  {
    id: "urteilswerkstatt",
    title: "Urteilswerkstatt: Schuldspruch, Qualifikation, Zweifel",
    shortTitle: "Urteil",
    sourceTitle: "Prozesssimulation",
    mediaType: "html",
    openUrl: "/reader/assets/brand-urteilswerkstatt.html",
    embedUrl: "/reader/assets/brand-urteilswerkstatt.html",
    summary: "Die Urteilswerkstatt lässt verschiedene begründbare Urteile entstehen: Anklage, Verteidigung und Gericht müssen dieselben Akten unterschiedlich gewichten.",
    keyIdeas: ["Urteil", "Anklage", "Verteidigung", "Strafzumessung"],
    questions: ["Welche Urteilsvariante folgt aus deiner Beweiswürdigung?", "Wie begründest du abweichende Minderheitsvoten?"],
    transferPrompts: ["Schreibe ein Kurzurteil mit Sachverhalt, Beweiswürdigung, rechtlicher Würdigung und Urteilssatz.", "Entwickle eine alternative Urteilsvariante, die aus denselben Akten anders schliesst."],
    writingFrame: "Das Gericht könnte zu diesem Urteil kommen, weil ..."
  }
];

const rawReaderModules = [
  {
    id: "modul-01",
    title: "Spurensicherung I: Der Notruf",
    summary: "Die Detektiv*innen sichern den ersten Zugriff: Notruf, Zeitmarken, Raumdetails und sprachliche Auffälligkeiten.",
    relatedTheoryIds: ["fall-rekonstruktion", "erzaehltechnik", "sprache-beweis", "indizienprozess"],
    entries: [
      {
        id: "frage-01",
        title: "Notruf als Einstieg",
        passageLabel: "Der Notruf",
        pageNumber: 4,
        context: "Der Text beginnt mit einem Notruf am 25. Dezember um 3:31 Uhr. Die Gesprächsform erzeugt Unmittelbarkeit und zugleich Unsicherheit.",
        signalWords: ["Polizeinotruf", "beide Kinder", "tot", "Fenster", "Rollladen"],
        relatedTheoryIds: ["fall-rekonstruktion", "erzaehltechnik"],
        prompts: [
          "Wie erzeugt der Notruf zugleich Nähe zum Geschehen und Distanz zur Wahrheit?",
          "Welche Informationen wirken im ersten Moment sicher, welche bleiben auffällig unsicher?"
        ]
      },
      {
        id: "frage-02",
        title: "Wiederholung und Schock",
        passageLabel: "Der Notruf",
        pageNumber: 4,
        context: "Die wiederholten Aussagen über den Tod der Kinder wirken emotional, können aber auch sprachlich untersucht werden.",
        signalWords: ["beide tot", "schon kalt", "blau", "Notfall"],
        relatedTheoryIds: ["sprache-beweis", "true-crime-ethik"],
        prompts: [
          "Welche Wirkung hat die Wiederholung im Notruf auf die Lesenden?",
          "Prüfe, ob die Sprache eher Schock, Kontrolle oder eine vorbereitete Version erkennen lässt."
        ]
      },
      {
        id: "frage-03",
        title: "Raum im ersten Zugriff",
        passageLabel: "Haus, Fenster, Treppenhaus",
        pageNumber: 5,
        context: "Schon im Notruf werden Haustür, Treppenhaus, Fenster und Rollläden wichtig. Räume erscheinen als Schutzräume und mögliche Tatorte.",
        signalWords: ["Haustür", "Treppenhaus", "Rollladen", "Fenster"],
        relatedTheoryIds: ["fall-rekonstruktion"],
        prompts: [
          "Welche Räume werden im Einstieg genannt und welche Funktion erhalten sie?",
          "Prüfe, wie ein Raumdetail den behaupteten Tatablauf stützt oder irritiert."
        ]
      }
    ]
  },
  {
    id: "modul-02",
    title: "Spurensicherung II: Tatort und Versionen",
    summary: "Fenster, Rollläden, Geld und Einbruchserzählung werden als mögliche Spuren, Täuschungen und Aktennotizen geprüft.",
    relatedTheoryIds: ["fall-rekonstruktion", "sprache-beweis", "indizienprozess"],
    entries: [
      {
        id: "frage-04",
        title: "Die Einbruchserzählung",
        passageLabel: "Erste Version",
        pageNumber: 5,
        context: "Die frühe Erklärung lautet: Einbruch, geraubtes Geld, aufgebrochenes Fenster. Die Detektiv*innen prüfen, ob daraus eine tragfähige Tatortversion wird.",
        signalWords: ["eingebrochen", "Geld", "geraubt", "Fenster"],
        relatedTheoryIds: ["fall-rekonstruktion", "sprache-beweis"],
        prompts: [
          "Wie wird die Einbruchsversion sprachlich aufgebaut?",
          "Welche Details müsste ein Ermittlungs-Team prüfen, bevor es diese Version in die Akte übernimmt?"
        ]
      },
      {
        id: "frage-05",
        title: "Spur oder Erzählspur",
        passageLabel: "Tatortdetails",
        pageNumber: 5,
        context: "Ein Detail kann Spur am Tatort und zugleich Teil einer Erzählstrategie sein.",
        signalWords: ["angefasst", "schräg gestellt", "seltsam", "Moment"],
        relatedTheoryIds: ["sprache-beweis", "erzaehltechnik"],
        prompts: [
          "Warum sind kleine Korrekturen und Einschübe im Tatortbericht bedeutsam?",
          "Unterscheide an einem Beispiel zwischen Sachspur und Erzählspur."
        ]
      },
      {
        id: "frage-06",
        title: "Ethik des Tatortlesens",
        passageLabel: "Opfer, Eltern, Einsatzkräfte",
        pageNumber: 4,
        context: "Die Szene ist schockierend. Genaues Lesen muss deshalb analytisch sein, ohne das Leid zum Effekt zu machen.",
        signalWords: ["Kinder", "Sanität", "Polizei", "Notfall"],
        relatedTheoryIds: ["true-crime-ethik"],
        prompts: [
          "Welche Verantwortung haben Lesende bei einer True-Crime-Passage über getötete Kinder?",
          "Beurteile, ob die nüchterne Gesprächsform die Szene respektvoller oder belastender macht."
        ]
      }
    ]
  },
  {
    id: "modul-03",
    title: "Ermittlungsakte: Tathergang und Hypothesen",
    summary: "Die Teams ordnen Informationen, bauen eine Zeitleiste, prüfen Hypothesen und führen Zusatzmaterial als Aktenbeilage.",
    relatedTheoryIds: ["fall-rekonstruktion", "material-craft", "autorinnenkontext", "indizienprozess"],
    entries: [
      {
        id: "frage-07",
        title: "Timeline bauen",
        passageLabel: "Chronologie",
        pageNumber: 4,
        context: "Zeitangaben wie 25. Dezember, 3:31 Uhr und Schlafenszeit strukturieren die Rekonstruktion.",
        signalWords: ["25. Dezember", "3:31 Uhr", "Viertel vor elf", "schon lange"],
        relatedTheoryIds: ["fall-rekonstruktion"],
        prompts: [
          "Erstelle aus der Passage eine Mikro-Timeline: Welche Zeitpunkte sind genannt, welche fehlen?",
          "Wie erzeugt die Lücke zwischen Schlafenszeit und Notruf Spannung?"
        ]
      },
      {
        id: "frage-08",
        title: "Kontext sinnvoll nutzen",
        passageLabel: "Craft-Material",
        pageNumber: 4,
        context: "Zusatzmaterial soll nicht vom Text wegführen, sondern Beobachtungen am Text präzisieren.",
        signalWords: ["Kontext", "Material", "These", "Beleg"],
        relatedTheoryIds: ["material-craft", "true-crime-ethik", "autorinnenkontext"],
        prompts: [
          "Wähle einen Craft-Impuls und formuliere daraus eine überprüfbare Leitfrage an den Text.",
          "Wo besteht die Gefahr, dass Kontextwissen die genaue Textlektüre ersetzt?"
        ]
      }
    ]
  },
  {
    id: "modul-04",
    title: "Vernehmung: Aussagen, Widersprüche, Motive",
    summary: "Die Teams untersuchen Fragen, Ausweichen, Widersprüche und mögliche Motive als sprachliche Bewegung.",
    relatedTheoryIds: ["verhoer-gestaendnis", "sprache-beweis", "erzaehltechnik", "indizienprozess", "verteidigung-gutachten"],
    entries: [
      {
        id: "frage-10",
        title: "Fragen als Werkzeug",
        passageLabel: "Verhörlogik",
        pageNumber: 80,
        context: "Vernehmungen arbeiten nicht nur mit Beschuldigungen, sondern mit Wiederholung, Präzisierung und dem Festhalten von Widersprüchen.",
        signalWords: ["Frage", "Antwort", "Widerspruch", "Version"],
        relatedTheoryIds: ["verhoer-gestaendnis", "verteidigung-gutachten"],
        prompts: [
          "Wie kann eine Frage Druck erzeugen, ohne offen aggressiv zu sein?",
          "Welche Rolle spielen Wiederholung und Präzisierung für ein mögliches Geständnis?"
        ]
      },
      {
        id: "frage-11",
        title: "Brüchige Versionen",
        passageLabel: "Aussage und Korrektur",
        pageNumber: 110,
        context: "Eine Version wird brüchig, wenn Details nachträglich korrigiert, abgeschwächt oder anders gewichtet werden.",
        signalWords: ["aber", "Moment", "dummerweise", "seltsam"],
        relatedTheoryIds: ["sprache-beweis", "verhoer-gestaendnis"],
        prompts: [
          "Woran erkennt man sprachlich, dass eine Darstellung brüchig wird?",
          "Erkläre, warum ein Nebendetail in einer Ermittlung plötzlich zentral werden kann."
        ]
      },
      {
        id: "frage-12",
        title: "Hören und Verhör",
        passageLabel: "Hörstation",
        pageNumber: 80,
        context: "In der Hörfassung können Pausen, Tempo und Betonung die Machtverhältnisse eines Gesprächs verstärken.",
        signalWords: ["Pause", "Tempo", "Betonung", "Druck"],
        relatedTheoryIds: ["hoerbuch", "verhoer-gestaendnis"],
        prompts: [
          "Höre einen Gesprächsausschnitt: Welche stimmlichen Signale verändern die Deutung?",
          "Vergleiche die Wirkung einer Frage im Text und in der Hörfassung."
        ]
      }
    ]
  },
  {
    id: "modul-05",
    title: "Prozessvorbereitung: Anklage und Verteidigung",
    summary: "Aus Geständnis, Indizien und Motiven entstehen konkurrierende Prozessnarrative.",
    relatedTheoryIds: ["verhoer-gestaendnis", "true-crime-ethik", "erzaehltechnik", "crime-podcast", "rechtsprechung", "gerichtsurteil", "verteidigung-gutachten", "indizienprozess"],
    entries: [
      {
        id: "frage-13",
        title: "Kipppunkt Geständnis",
        passageLabel: "Geständnismoment",
        pageNumber: 160,
        context: "Der Titel richtet die Lektüre auf den Moment, in dem eine Version nicht mehr trägt und die spätere Prozessakte neu sortiert wird.",
        signalWords: ["gesteht", "Wahrheit", "Druck", "Widerspruch"],
        relatedTheoryIds: ["verhoer-gestaendnis", "erzaehltechnik"],
        prompts: [
          "Wie bereitet der Text den Geständnismoment erzählerisch und prozessstrategisch vor?",
          "Welche Erwartungen erzeugt der Titel für die spätere Anklage- und Verteidigungslogik?"
        ]
      },
      {
        id: "frage-14",
        title: "Geständnis und Wahrheit",
        passageLabel: "Wahrheitsanspruch",
        pageNumber: 160,
        context: "Ein Geständnis kann aufklären, aber es ersetzt nicht automatisch die kritische Prüfung von Motiven, Aussagen und Beweisen.",
        signalWords: ["Wahrheit", "Aussage", "Motiv", "Beweis"],
        relatedTheoryIds: ["sprache-beweis", "verhoer-gestaendnis", "rechtsprechung", "gerichtsurteil", "verteidigung-gutachten"],
        prompts: [
          "Warum ist ein Geständnis erzählerisch stark, aber analytisch nicht das Ende aller Fragen?",
          "Zeige, wie Sprache und Beweise zusammenwirken müssen."
        ]
      },
      {
        id: "frage-15",
        title: "Wirkung auf Angehörige",
        passageLabel: "Nach dem Geständnis",
        pageNumber: 180,
        context: "Die Aufklärung einer Tat steht nie nur für kriminalistische Lösung; sie betrifft Angehörige, Öffentlichkeit und Erinnerung.",
        signalWords: ["Angehörige", "Öffentlichkeit", "Erinnerung", "Opfer"],
        relatedTheoryIds: ["true-crime-ethik", "crime-podcast", "rechtsprechung"],
        prompts: [
          "Welche ethischen Fragen bleiben auch nach einem Geständnis offen?",
          "Beurteile, wie eine Lerneinheit über den Fall mit Opferperspektiven umgehen sollte."
        ]
      }
    ]
  },
  {
    id: "modul-06",
    title: "Gerichtssaal: Plädoyer, Urteil, Minderheitsvotum",
    summary: "Die Schlusslektion führt in den Prozess: Die Teams formulieren Plädoyers und begründen unterschiedliche Urteilsvarianten auf derselben Aktenbasis.",
    relatedTheoryIds: ["true-crime-ethik", "material-craft", "hoerbuch", "autorinnenkontext", "crime-podcast", "rechtsprechung", "gerichtsurteil", "verteidigung-gutachten", "urteilswerkstatt", "indizienprozess"],
    entries: [
      {
        id: "frage-16",
        title: "Gesamtthese",
        passageLabel: "Schlussdeutung",
        pageNumber: 210,
        context: "Am Ende wird aus Einzelbeobachtungen eine begründete Prozess-These zur Machart, Beweiswürdigung und Verantwortung der True-Crime-Erzählung.",
        signalWords: ["These", "Beleg", "Deutung", "Verantwortung"],
        relatedTheoryIds: ["true-crime-ethik", "erzaehltechnik", "autorinnenkontext", "crime-podcast", "urteilswerkstatt"],
        prompts: [
          "Formuliere eine Prozess-These: Welche Beweiswürdigung trägt dein Urteil?",
          "Welche Textstelle oder welches Aktenstück stützt dein Urteil am stärksten?"
        ]
      },
      {
        id: "frage-17",
        title: "Aktenprodukt",
        passageLabel: "Plädoyer und Urteil",
        pageNumber: 210,
        context: "Die Teams erstellen aus Craft-Impuls, Hörstation, Podcast, Rechtsprechungsstation und Textanalyse ein eigenes Aktenprodukt.",
        signalWords: ["Craft", "Hörbuch", "Podcast", "Textanalyse"],
        relatedTheoryIds: ["material-craft", "hoerbuch", "autorinnenkontext", "crime-podcast", "rechtsprechung", "urteilswerkstatt"],
        prompts: [
          "Entwirf ein Aktenprodukt, das Textbeleg, Autorinnenkontext, Rechtsprechung und einen Materialimpuls sinnvoll verbindet.",
          "Welche Entscheidung triffst du, damit dein Plädoyer nicht sensationsorientiert wirkt?"
        ]
      },
      {
        id: "frage-18",
        title: "Urteilsreflexion",
        passageLabel: "Urteil und Zweifel",
        pageNumber: 220,
        context: "Die Reflexion fragt nach Erkenntnisgewinn, Grenzen, vernünftigem Zweifel und Verantwortung des Genres.",
        signalWords: ["Genre", "Grenze", "Erkenntnis", "Respekt"],
        relatedTheoryIds: ["true-crime-ethik", "crime-podcast", "rechtsprechung", "urteilswerkstatt"],
        prompts: [
          "Was kann eine literarische Spurensicherung im Unterricht leisten, wenn sie sorgfältig arbeitet?",
          "Welche Grenze würdest du für Urteil, Prozesssimulation und Darstellung realer Gewalt ziehen?"
        ]
      }
    ]
  }
];

export const readerModules = rawReaderModules.map((module) => ({
  ...module,
  entries: module.entries.map((entry) => ({
    ...entry,
    focusTasks: entry.prompts.map((prompt) => buildTask(prompt, {
      context: entry.context,
      signalWords: entry.signalWords,
      relatedTheoryIds: entry.relatedTheoryIds,
      kind: "focus",
      taskTitle: entry.title
    }))
  }))
}));

export const pathGuide = {
  title: "Choose your path: Spurenpuzzle",
  subtitle: "Du legst ein Puzzleteil an, prüfst seine Kanten und suchst danach das nächste passende Stück.",
  instruction: "Entscheide dich zu Beginn jeder Lektion für eine konkrete Spur. Sichere zuerst die Textinformationen: Wer sagt was? Wann? Wo? Mit welchem Detail? Erst danach formulierst du eine Motivfrage, einen Widerspruch oder eine Gegenhypothese.",
  warning: "Keine Spur beweist allein den Fall. Jede Aktennotiz muss zwischen Fakt, Behauptung, Hinweis, Motivspur und offener Lücke unterscheiden."
};

export const lessonSets = [
  {
    id: "lektion-01",
    title: "Fallakte öffnen: Der Notruf",
    summary: "Die Detektiv*innen sichern die ersten Daten: 25. Dezember, 3:31 Uhr, Ahornweg 8, zwei tote Kinder, Einbruchsversion, Fenster, Geld, Körperhinweise.",
    moduleIds: ["modul-01"],
    entryIds: ["frage-01", "frage-02", "frage-03"],
    reviewFocus: "Textnah zwischen gesicherter Information, behaupteter Version, Indiz und sprachlicher Wirkung unterscheiden.",
    sebPrompt: "Sichere den Notruf präzise: Wer ruft an, was wird behauptet, was ist beobachtet, welche Tatzeit fehlt?",
    pathBriefing: "Am Anfang liegen nur Notrufdaten vor: 25. Dezember, 3:31 Uhr, Bernhard Scherrer, Ahornweg 8, zwei tote Kinder, behaupteter Einbruch, Fenster, Geld. Wähle zuerst, welches Puzzleteil du sicherst: Zeit, Körperhinweise oder Tatortversion.",
    pathChoices: [
      {
        id: "notruf-protokoll",
        title: "Spur A: Notrufzeit 3:31",
        role: "Aktenstück: Notrufprotokoll. Zu sichern sind Datum, Uhrzeit, Anrufer, Adresse, erste Behauptung und fehlende Tatzeit.",
        chooseIf: "Verfolge diese Spur, wenn du zuerst wissen willst, welche Fakten überhaupt feststehen.",
        method: "Lege eine Tabelle mit vier Spalten an: gesichert, behauptet, ungeprüft, fehlt. Trage 25. Dezember, 3:31 Uhr, Ahornweg 8, Einbruch, Geld und Todeszustand einzeln ein.",
        nextStep: "Sichere zuerst die Passage «Der Notruf» mit dem Werkzeug Fallrekonstruktion.",
        entryId: "frage-01",
        theoryId: "fall-rekonstruktion",
        hints: [
          "Hinweis 1: 3:31 Uhr ist die Zeit des Anrufs, nicht die Tatzeit.",
          "Hinweis 2: «Bei uns wurde eingebrochen» ist zunächst eine Aussage des Vaters, kein überprüfter Befund.",
          "Hinweis 3: Die Bettzeit taucht erst später auf. Sie gehört als Lücke in dieselbe Akte."
        ],
        warning: "Noch keine Motivdeutung. Erst die Daten sortieren.",
        writingMove: "Aktennotiz: «Gesichert ist ..., behauptet wird ..., noch fehlt ...»."
      },
      {
        id: "notruf-sprache",
        title: "Spur B: Körperhinweise",
        role: "Aktenstück: Angaben zum Zustand der Kinder. Zu sichern sind «kalt», «blau», Blut aus Sophies Mund und der spätere Befund des Polizisten.",
        chooseIf: "Verfolge diese Spur, wenn du die Frage klären willst, was über Todeszeit und Reihenfolge wirklich erkennbar ist.",
        method: "Sammle alle Körperhinweise getrennt nach Quelle: Vater im Notruf, Polizist vor Ort, Sanität/Spurensicherung. Notiere, was jede Quelle sehen kann und was nicht.",
        nextStep: "Sichere «Wiederholung und Schock» und vergleiche danach Seite 5-7 im PDF.",
        entryId: "frage-02",
        theoryId: "sprache-beweis",
        hints: [
          "Hinweis 1: «Schon kalt» und «blaue Lippen» sind Beobachtungen im Notruf, aber laienhaft formuliert.",
          "Hinweis 2: Der Polizist unterscheidet später zwischen dem Jungen und dem Mädchen. Das kann für die Reihenfolge wichtig werden.",
          "Hinweis 3: Blut, Flecken, Körperwärme und Beatmungsversuch gehören nicht in eine Meinung, sondern in eine Befundliste."
        ],
        warning: "Keine medizinische Diagnose erfinden. Nur Textbefunde und Quellen trennen.",
        writingMove: "Aktennotiz: «Quelle ..., beobachtet ..., daraus folgt sicher nur ...»."
      },
      {
        id: "notruf-tatortspur",
        title: "Spur C: Fenster, Geld, Treppenhaus",
        role: "Aktenstück: erste Tatortversion. Zu sichern sind aufgebrochenes Fenster, geraubtes Geld, Rollladen oben, berührter Rollladen, offene Haustür, Vera im Treppenhaus.",
        chooseIf: "Verfolge diese Spur, wenn du die Einbruchsversion Stück für Stück prüfen willst.",
        method: "Liste jedes Tatortdetail als Puzzleteil. Schreibe daneben: Wer nennt es? Wurde es schon überprüft? Passt es zur Einbruchsversion oder stört es?",
        nextStep: "Sichere «Haus, Fenster, Treppenhaus» mit dem Werkzeug Fallrekonstruktion.",
        entryId: "frage-03",
        theoryId: "fall-rekonstruktion",
        hints: [
          "Hinweis 1: Das Fenster wird sofort erwähnt, aber noch nicht überprüft.",
          "Hinweis 2: Der Rollladen ist oben, obwohl alle Rollläden unten gewesen sein sollen.",
          "Hinweis 3: «Dummerweise schon angefasst» ist wichtig, weil dadurch eine mögliche Spur verändert wurde."
        ],
        warning: "Noch nicht entscheiden, ob Einbruch oder Inszenierung. Erst die Einzelteile prüfen.",
        writingMove: "Aktennotiz: «Dieses Detail stützt ..., dieses Detail stört ..., offen bleibt ...»."
      }
    ],
    recommendedTheoryIds: ["fall-rekonstruktion", "erzaehltechnik", "sprache-beweis", "indizienprozess"],
    resourceAssignments: [
      {
        resourceId: "fall-rekonstruktion",
        title: "Mikro-Timeline des Notrufs",
        summary: "Die Aufgabe trennt Uhrzeiten, behauptete Abläufe und Lücken.",
        task: "Erstelle eine Mikro-Timeline des Einstiegs und markiere mindestens zwei Unsicherheiten.",
        questionTasks: ["Welche Zeitangaben sind ausdrücklich genannt?", "Welche Abläufe werden nur behauptet?", "Welche Lücke erzeugt die stärkste Spannung?"],
        taskGuide: "Eine starke Antwort trennt die Uhrzeit des Notrufs, die Schlafenszeit, den behaupteten Einbruch und die ungesicherte Tatzeit.",
        answerGuides: ["Genannt sind etwa Datum, Uhrzeit des Notrufs und Schlafenszeit.", "Behauptet werden Einbruch, geraubtes Geld und Todeszeitnähe.", "Die stärkste Lücke liegt zwischen Zubettgehen, Entdeckung und tatsächlichem Tatablauf."]
      }
    ]
  },
  {
    id: "lektion-02",
    title: "Tatort sichern: Spuren und Versionen",
    summary: "Die Einbruchsversion wird mit Tatortbefunden geprüft: Fenster ohne Beschädigung, vier Meter Höhe, Tauwiese, fehlende Spuren, berührter Rollladen.",
    moduleIds: ["modul-02"],
    entryIds: ["frage-04", "frage-05", "frage-06"],
    reviewFocus: "Spur, Behauptung, Indizienwert und ethische Lesedistanz sauber trennen.",
    sebPrompt: "Prüfe die Tatortversion am Text und reflektiere die Darstellungsgrenzen.",
    pathBriefing: "Jetzt treffen erste überprüfbare Tatortbefunde auf die Version aus dem Notruf: Fenster ohne Beschädigung, etwa vier Meter Abstand zum Boden, Tau auf der Wiese, keine sichtbaren Spuren, Elternreaktionen, Wohnung als abgesperrter Tatort. Wähle, welches Puzzleteil du zuerst gegen die Einbruchserzählung legst.",
    pathChoices: [
      {
        id: "tatort-version",
        title: "Spur A: Einbruchsversion gegen Befund",
        role: "Aktenstück: Fensterbefund. Behauptet wird ein aufgebrochenes Fenster; vor Ort sieht der Polizist keine Beschädigung.",
        chooseIf: "Verfolge diese Spur, wenn du den ersten harten Widerspruch prüfen willst.",
        method: "Lege zwei Spalten an: Notrufversion und Polizeibefund. Trage Fenster, Geld, Einstiegshöhe, Wiese/Tau und fehlende Spuren ein.",
        nextStep: "Sichere «Erste Version» und danach den Fensterbefund auf Seite 8.",
        entryId: "frage-04",
        theoryId: "fall-rekonstruktion",
        hints: [
          "Hinweis 1: «Aufgebrochen» und «stand offen» sind nicht dasselbe.",
          "Hinweis 2: Vier Meter Höhe und Tau auf der Wiese sind faktische Prüfsteine für einen Einstieg von aussen.",
          "Hinweis 3: Fehlende sichtbare Spuren beweisen nicht alles, aber sie schwächen eine einfache Einbruchsgeschichte."
        ],
        warning: "Nicht «Lüge» schreiben, bevor du Version und Befund sauber nebeneinandergelegt hast.",
        writingMove: "Aktennotiz: «Die Version behauptet ..., der Befund zeigt ..., deshalb muss geprüft werden ...»."
      },
      {
        id: "tatort-erzaehlspur",
        title: "Spur B: Verhalten der Eltern",
        role: "Aktenstück: Erstbeobachtungen am Tatort. Vera sitzt im Treppenhaus, wirkt abwesend; Bernhard weint, führt den Polizisten, kommentiert Sophie.",
        chooseIf: "Verfolge diese Spur, wenn du Reaktionen sammeln willst, ohne sofort Motive zu behaupten.",
        method: "Trenne sichtbares Verhalten von Deutung. Notiere: Wer beobachtet? Was genau? In welcher Situation? Welche alternative Erklärung bleibt möglich?",
        nextStep: "Sichere «Tatortdetails» und die Polizeiperspektive auf Seite 6-7.",
        entryId: "frage-05",
        theoryId: "sprache-beweis",
        hints: [
          "Hinweis 1: «Weint nicht» oder «wirkt abwesend» ist keine Schuldspur, sondern zuerst eine Beobachtung.",
          "Hinweis 2: Bernhards Satz über Sophie fällt auf, weil er eine Täterannahme enthält.",
          "Hinweis 3: Frühere Verlusterfahrung der Eltern kann eine Motivspur sein, aber sie erklärt noch keine Tat."
        ],
        warning: "Keine Psychodiagnose. Nur Verhalten, Quelle und mögliche Lesarten festhalten.",
        writingMove: "Aktennotiz: «Beobachtet wird ..., auffällig daran ist ..., möglich wäre aber auch ...»."
      },
      {
        id: "tatort-ethik",
        title: "Spur C: Spuren schützen",
        role: "Aktenstück: Tatort wird abgesperrt. Nachbarin, Sanität, Polizei und Spurensicherung kommen; die Wohnung wird zum Laboratorium.",
        chooseIf: "Verfolge diese Spur, wenn du klären willst, welche Informationen verwertbar bleiben und welche schon verändert wurden.",
        method: "Erstelle eine Kontaminationsliste: Wer betritt die Wohnung? Was wird berührt? Was wird abgesperrt? Welche Spur könnte dadurch unsicher werden?",
        nextStep: "Sichere «Opfer, Eltern, Einsatzkräfte» und die Beschreibung der Spurensicherung auf Seite 8.",
        entryId: "frage-06",
        theoryId: "true-crime-ethik",
        hints: [
          "Hinweis 1: Der Rollladen wurde bereits angefasst. Das gehört in die Spurenakte.",
          "Hinweis 2: Nachbarin und Einsatzkräfte erhöhen die Zahl der Personen am Tatort.",
          "Hinweis 3: Absperren ist kein Detail am Rand, sondern Voraussetzung für belastbare Spuren."
        ],
        warning: "Nicht ausschmücken. Es geht um Spurenschutz, nicht um Schockwirkung.",
        writingMove: "Aktennotiz: «Verwertbar scheint ..., unsicher wird ..., weil ...»."
      }
    ],
    recommendedTheoryIds: ["fall-rekonstruktion", "true-crime-ethik", "sprache-beweis", "indizienprozess"],
    resourceAssignments: [
      {
        resourceId: "true-crime-ethik",
        title: "Sorgfältig lesen",
        summary: "Die Aufgabe entwickelt Regeln für respektvolle Analyse realer Gewalt.",
        task: "Formuliere drei Regeln, wie ihr die Tatortpassagen analytisch und respektvoll bearbeitet.",
        questionTasks: ["Was soll analysiert werden?", "Was soll nicht ausgeschmückt werden?", "Wie bleibt die Opferperspektive sichtbar?"]
      },
      {
        resourceId: "sprache-beweis",
        title: "Sprachsignal oder Beweis?",
        summary: "Auffällige Formulierungen werden als Hinweise, nicht als Beweise gelesen.",
        task: "Wähle eine auffällige Formulierung und erkläre ihren möglichen Hinweiswert und ihre Grenze.",
        questionTasks: ["Was ist auffällig?", "Welche Deutung liegt nahe?", "Warum reicht das allein nicht als Beweis?"]
      }
    ]
  },
  {
    id: "lektion-03",
    title: "Ermittlungsakte: Tathergang, Motiv, Kontext",
    summary: "Zeitkette, Motivspuren und Materialpool werden verbunden: Bettzeit, Notruf, Polizeieintreffen, Befragung, Weihnachtsgeschenke, früherer Kindstod.",
    moduleIds: ["modul-03"],
    entryIds: ["frage-07", "frage-08"],
    reviewFocus: "Zusatzmaterial soll eine Spur schärfen, nicht die Textbeobachtung ersetzen.",
    sebPrompt: "Nutze Materialpool und Autorinnenkontext nur dort, wo sie eine konkrete Textspur, Motivfrage oder Gegenhypothese schärfen.",
    pathBriefing: "Die Ermittlungsakte besteht aus Puzzleteilen, die noch nicht zusammenpassen müssen: Bettzeit um etwa 22:45, Notruf 3:31, Polizeieintreffen 3:47, Befragung 5:30, Weihnachtsgeschenke, früherer Kindstod, Geldbehauptung, Fensterbefund. Wähle, welche Kette du zuerst legst.",
    pathChoices: [
      {
        id: "ermittlung-timeline",
        title: "Spur A: Vier Uhrzeiten",
        role: "Aktenstück: Zeitkette. Zu prüfen sind ca. 22:45, 3:31, 3:47 und 5:30.",
        chooseIf: "Verfolge diese Spur, wenn du sehen willst, wo der Ablauf Lücken hat.",
        method: "Ordne jede Uhrzeit einer Quelle zu. Schreibe daneben, was zwischen den Uhrzeiten passiert sein soll und was tatsächlich belegt ist.",
        nextStep: "Sichere «Chronologie» mit dem Werkzeug Fallrekonstruktion.",
        entryId: "frage-07",
        theoryId: "fall-rekonstruktion",
        hints: [
          "Hinweis 1: Die Bettzeit stammt aus der Aussage im Notruf, nicht aus einer unabhängigen Messung.",
          "Hinweis 2: Zwischen 22:45 und 3:31 liegt die zentrale Lücke.",
          "Hinweis 3: 3:47 ist wichtig, weil ab hier Polizeibeobachtungen statt Familienaussagen dazukommen."
        ],
        warning: "Keine glatte Nacherzählung. Die Lücken sind der Kern der Spur.",
        writingMove: "Aktennotiz: «Die Zeitkette steht bis ..., ungesichert bleibt der Abschnitt ...»."
      },
      {
        id: "ermittlung-kontextfrage",
        title: "Spur B: Motivfragen",
        role: "Aktenstück: mögliche Motivspuren. Im Text stehen Geld, Weihnachtsstress, früherer Kindstod, Familie, Kontrollverlust und Selbstdarstellung nebeneinander.",
        chooseIf: "Verfolge diese Spur, wenn du Motiv nicht behaupten, sondern aus Hinweisen zusammensetzen willst.",
        method: "Erstelle eine Motivtabelle: Hinweis im Text, mögliche Bedeutung, Gegenlesart, noch fehlender Beleg.",
        nextStep: "Sichere «Craft-Material» und verbinde es mit einer konkreten Textstelle.",
        entryId: "frage-08",
        theoryId: "material-craft",
        resourceId: "material-craft",
        hints: [
          "Hinweis 1: «Geld geraubt» ist zunächst Teil der Einbruchsversion, nicht automatisch ein Motiv.",
          "Hinweis 2: Der frühere Tod eines Kindes ist eine biografische Belastung, aber kein Tatmotiv ohne weitere Verbindung.",
          "Hinweis 3: Weihnachtsgeschenke und Familienbild können als Kontrastspur dienen: Was passt nicht zum behaupteten Ablauf?"
        ],
        warning: "Motiv ist kein Bauchgefühl. Jede Motivspur braucht Textstelle und Gegenlesart.",
        writingMove: "Aktennotiz: «Als Motivhinweis kommt ... infrage; dagegen spricht/unklar bleibt ...»."
      },
      {
        id: "ermittlung-indizienhypothese",
        title: "Spur C: Indizienmatrix",
        role: "Aktenstück: erste Matrix. Belastend, entlastend und mehrdeutig werden nebeneinandergelegt.",
        chooseIf: "Verfolge diese Spur, wenn du mehrere Hinweise zusammenpuzzeln willst.",
        method: "Nutze drei Spalten: belastet, entlastet, bleibt doppeldeutig. Trage Fenster, Geld, Körperzustand, Verhalten, Zeitlücke und Spurenschutz ein.",
        nextStep: "Sichere «Chronologie» und öffne danach das Werkzeug Indizienprozess.",
        entryId: "frage-07",
        theoryId: "indizienprozess",
        hints: [
          "Hinweis 1: Das Fenster ohne Schäden kann belastend sein, aber nur im Zusammenhang mit der Einbruchsversion.",
          "Hinweis 2: Trauerreaktionen können mehrdeutig sein. Sie gehören nicht automatisch in die belastende Spalte.",
          "Hinweis 3: Eine gute Matrix enthält mindestens eine starke Gegenhypothese."
        ],
        warning: "Nicht Spuren sammeln, die nur zur eigenen Vermutung passen.",
        writingMove: "Aktennotiz: «Die stärkste Kette lautet ..., die stärkste Gegenfrage lautet ...»."
      }
    ],
    recommendedTheoryIds: ["material-craft", "fall-rekonstruktion", "autorinnenkontext", "indizienprozess"],
    resourceAssignments: [
      {
        resourceId: "material-craft",
        title: "Aus Material wird Frage",
        summary: "Die Craft-Sammlung wird in konkrete Leseaufträge übersetzt.",
        task: "Wähle einen Craft-Impuls und mache daraus eine Leitfrage mit Textbezug.",
        questionTasks: ["Welcher Impuls ist ergiebig?", "Welche Textstelle passt dazu?", "Welche Vermutung bleibt offen?"]
      },
      {
        resourceId: "autorinnenkontext",
        title: "Autorinnenkontext: Recherche und Werk",
        summary: "Christine Brands Website wird als Kontextquelle genutzt, um journalistische Recherche und Krimischreiben zu verbinden.",
        task: "Nutze Brands Website, um eine präzise These zum Verhältnis von Recherche, Autorinnenprofil und True-Crime-Erzählweise zu formulieren.",
        questionTasks: ["Welche Hinweise auf Autorin, Werk oder Reihenprofil sind für diese Lektüre relevant?", "Wie kann Autorinnenkontext eine Textbeobachtung schärfen?", "Wo darf Autorinnenwissen die Textanalyse nicht ersetzen?"],
        taskGuide: "Eine gute Antwort nutzt die Website als Kontext, bleibt aber am Text: Brands Profil als Bestsellerautorin und Journalistin kann Recherche- und Spannungsstrategien erklären, ersetzt aber keine Belege aus Bis er gesteht.",
        answerGuides: [
          "Relevant sind Hinweise auf Christine Brand als Autorin, journalistische Praxis, Krimireihen und True-Crime-Arbeit.",
          "Der Kontext schärft eine Textbeobachtung, wenn er erklärt, warum dokumentarische Formen, Recherchelogik oder Spannungstechniken im Text wichtig sind.",
          "Autorinnenwissen ersetzt die Textanalyse nicht, weil jede Deutung an Formulierung, Szene oder Struktur des Buchs belegt werden muss."
        ]
      }
    ]
  },
  {
    id: "lektion-04",
    title: "Vernehmung: Aussagen, Druck, Widersprüche",
    summary: "Die Teams zerlegen Aussagen in Frage, Antwort, Ausweichen, Korrektur, neues Detail und belastbare Gegenfrage.",
    moduleIds: ["modul-04"],
    entryIds: ["frage-10", "frage-11", "frage-12"],
    reviewFocus: "Gesprächsbewegungen als Spur beschreiben: Frage, Ausweichen, Korrektur, Druck, Motiv.",
    sebPrompt: "Sichere Vernehmungsschritte mit Frage, Antwort, neuer Information, Widerspruch und offener Gegenfrage.",
    pathBriefing: "In der Vernehmung werden Aussagen zerlegt: Frage, Antwort, Ausweichen, Korrektur, neues Detail. Wähle, ob du das Protokoll der Fragen, die brüchigen Aussagen oder die Hörspur als Beweispuzzle sicherst.",
    pathChoices: [
      {
        id: "vernehmung-fragen",
        title: "Spur A: Frage-Antwort-Protokoll",
        role: "Aktenstück: Vernehmungsprotokoll. Gesichert werden Frage, Antwort, Ausweichen, Nachfragen und neu auftauchende Details.",
        chooseIf: "Verfolge diese Spur, wenn du wissen willst, welche Aussage wann kippt.",
        method: "Erstelle eine Vier-Spalten-Liste: Frage, Antwort, neues Detail, offene Anschlussfrage.",
        nextStep: "Sichere «Verhörlogik» mit dem Werkzeug Verhör und Geständnis.",
        entryId: "frage-10",
        theoryId: "verhoer-gestaendnis",
        resourceId: "verhoer-gestaendnis",
        hints: [
          "Hinweis 1: Eine Frage kann Information suchen oder eine frühere Aussage testen.",
          "Hinweis 2: Wiederholte Fragen sind wichtig, wenn die Antwort sich verändert.",
          "Hinweis 3: Notiere jede neue Einzelheit sofort neben die Frage, durch die sie ausgelöst wurde."
        ],
        warning: "Nicht aus Druck automatisch Wahrheit machen. Entscheidend ist, welche Aussage überprüfbar wird.",
        writingMove: "Aktennotiz: «Auf die Frage ... folgt ..., neu ist ..., offen bleibt ...»."
      },
      {
        id: "vernehmung-version",
        title: "Spur B: Korrekturen und Widersprüche",
        role: "Aktenstück: Versionenvergleich. Gesucht werden Stellen, an denen eine Aussage nachträglich korrigiert, abgeschwächt oder durch ein Nebendetail belastet wird.",
        chooseIf: "Verfolge diese Spur, wenn du Widersprüche nicht behaupten, sondern nachweisen willst.",
        method: "Schreibe Aussage 1 und Aussage 2 untereinander. Markiere exakt, was gleich bleibt, was sich ändert und was neu dazukommt.",
        nextStep: "Sichere «Aussage und Korrektur» mit dem Werkzeug Sprache und Beweis.",
        entryId: "frage-11",
        theoryId: "sprache-beweis",
        hints: [
          "Hinweis 1: Ein Widerspruch braucht zwei belegte Stellen, nicht nur ein ungutes Gefühl.",
          "Hinweis 2: Achte auf Abschwächungen wie «eigentlich», «dummerweise», «Moment», «seltsam».",
          "Hinweis 3: Ein Nebendetail wird wichtig, wenn es eine frühere Version verändert."
        ],
        warning: "Nicht jedes Zögern ist ein Widerspruch. Nur belegte Abweichungen zählen.",
        writingMove: "Aktennotiz: «Aussage 1 lautet ..., später heisst es ..., der Unterschied betrifft ...»."
      },
      {
        id: "vernehmung-hoeren",
        title: "Spur C: Hörprotokoll",
        role: "Aktenstück: Hörfassung. Gesichert werden Pause, Tempo, Betonung und die Stelle im Text, zu der sie gehören.",
        chooseIf: "Verfolge diese Spur, wenn du prüfen willst, ob eine Aussage gehört anders wirkt als gelesen.",
        method: "Höre maximal eine Minute. Notiere Zeitmarke, Satz im Text, stimmliches Signal und mögliche Wirkung.",
        nextStep: "Sichere «Hörstation» mit dem Hörbuchordner.",
        entryId: "frage-12",
        theoryId: "hoerbuch",
        resourceId: "hoerbuch",
        hints: [
          "Hinweis 1: Erst hören, dann deuten: Pause, Tempo, Betonung, Lautstärke.",
          "Hinweis 2: Jede Hörbeobachtung braucht die passende Textstelle.",
          "Hinweis 3: Eine Stimme kann Verdacht verstärken, aber sie ist kein neues Faktum."
        ],
        warning: "Hörwirkung nicht mit Beweis verwechseln.",
        writingMove: "Aktennotiz: «Bei Zeitmarke ... klingt ..., im Text steht ..., dadurch wirkt ...»."
      }
    ],
    recommendedTheoryIds: ["verhoer-gestaendnis", "sprache-beweis", "hoerbuch", "indizienprozess", "verteidigung-gutachten"],
    resourceAssignments: [
      {
        resourceId: "verhoer-gestaendnis",
        title: "Verhörpartitur",
        summary: "Ein Gespräch wird als Abfolge von Frage, Antwort, Ausweichen und Korrektur notiert.",
        task: "Erstelle eine Verhörpartitur für einen Ausschnitt.",
        questionTasks: ["Welche Frage erhöht Druck?", "Wo wird ausgewichen?", "Welches Detail kippt die Lage?"]
      },
      {
        resourceId: "hoerbuch",
        title: "Hören als Analyse",
        summary: "Die Hörfassung dient zur Wahrnehmung von Tempo, Pause und Betonung.",
        task: "Vergleiche eine Gesprächsstelle im Buch und in der Hörfassung.",
        questionTasks: ["Welche Betonung fällt auf?", "Welche Pause verändert die Wirkung?", "Was wirkt gelesen anders als gehört?"]
      },
      {
        resourceId: "verteidigung-gutachten",
        title: "Verteidigungsrechte bei Exploration und Gutachten",
        summary: "Die Vertiefung bereitet die spätere Massnahmen- und Schuldfähigkeitsfrage vor.",
        task: "Erkläre, warum Gespräche mit psychiatrischen Sachverständigen prozessual anders zu behandeln sind als literarische Vernehmungsszenen.",
        questionTasks: ["Welche Interessen hat die Verteidigung?", "Welche Rolle spielt Schuldfähigkeit?", "Warum kann Teilnahme oder Nichtteilnahme das Verfahren beeinflussen?"]
      }
    ]
  },
  {
    id: "lektion-05",
    title: "Prozessvorbereitung: Geständnis, Anklage, Verteidigung",
    summary: "Geständnis, Indizien, Motivspuren und Rechtsfragen werden für Anklage und Verteidigung gewichtet.",
    moduleIds: ["modul-05"],
    entryIds: ["frage-13", "frage-14", "frage-15"],
    reviewFocus: "Titel, Spannung, Aussage, Indizien und rechtliche Würdigung differenziert zusammendenken.",
    sebPrompt: "Erkläre den Geständnismoment und seine Grenzen als Wahrheits- und Prozessereignis.",
    pathBriefing: "Vor dem Prozess werden die Puzzleteile gewichtet: Geständnis, Motivspuren, Indizien, rechtliche Qualifikation, Wirkung auf Angehörige. Wähle, ob du den Weg zum Geständnis, seinen Beweiswert oder die Motiv-/Opferfragen sicherst.",
    pathChoices: [
      {
        id: "prozess-kipppunkt",
        title: "Spur A: Weg zum Geständnis",
        role: "Aktenstück: Vorgeschichte des Geständnisses. Gesucht werden frühere Widersprüche, Druckfragen, Korrekturen und der Moment, an dem eine Version nicht mehr hält.",
        chooseIf: "Verfolge diese Spur, wenn du rekonstruieren willst, wodurch das Geständnis vorbereitet wird.",
        method: "Lege eine Kette an: Hinweis vor dem Geständnis, Druckmoment, veränderte Aussage, noch offener Punkt.",
        nextStep: "Sichere «Geständnismoment» mit dem Werkzeug Verhör und Geständnis.",
        entryId: "frage-13",
        theoryId: "verhoer-gestaendnis",
        resourceId: "verhoer-gestaendnis",
        hints: [
          "Hinweis 1: Ein Geständnis steht nicht allein. Suche mindestens zwei frühere Puzzleteile.",
          "Hinweis 2: Entscheidend ist, welche Version unmittelbar vorher nicht mehr trägt.",
          "Hinweis 3: Prüfe rückwärts: Welche Notruf- oder Tatortdetails wirken nach dem Geständnis anders?"
        ],
        warning: "Nicht das Geständnis als bequeme Abkürzung nehmen. Der Weg dorthin muss belegbar sein.",
        writingMove: "Aktennotiz: «Zum Geständnis führen ..., ..., offen bleibt ...»."
      },
      {
        id: "prozess-beweiswert",
        title: "Spur B: Beweiswert des Geständnisses",
        role: "Aktenstück: Geständnis plus Abgleich. Zu prüfen sind Aussageinhalt, passende Indizien, Widersprüche und rechtliche Qualifikation.",
        chooseIf: "Verfolge diese Spur, wenn du Anklage und Verteidigung faktenbasiert vorbereiten willst.",
        method: "Baue eine Prüfliste: Was gesteht die Person? Welches Indiz passt dazu? Welches Indiz fehlt? Welche Rechtsfrage bleibt?",
        nextStep: "Sichere «Wahrheitsanspruch» und öffne danach das reale Urteil.",
        entryId: "frage-14",
        theoryId: "gerichtsurteil",
        resourceId: "gerichtsurteil",
        hints: [
          "Hinweis 1: Ein Geständnis beantwortet nicht automatisch Mordqualifikation, Motiv und Strafmass.",
          "Hinweis 2: Jedes Geständnisdetail braucht Abgleich mit einem unabhängigen Hinweis.",
          "Hinweis 3: Art. 111 und Art. 112 StGB verlangen unterschiedliche Begründungen."
        ],
        warning: "Kein Urteil ohne Trennung von Tatfrage, Beweisfrage und Rechtsfrage.",
        writingMove: "Aktennotiz: «Das Geständnis klärt ..., gestützt wird es durch ..., rechtlich offen bleibt ...»."
      },
      {
        id: "prozess-verantwortung",
        title: "Spur C: Motiv und Folgen",
        role: "Aktenstück: Motiv- und Opferperspektive. Zu prüfen sind mögliche Motivhinweise, Angehörigenperspektive, Öffentlichkeit und Darstellung im Podcast.",
        chooseIf: "Verfolge diese Spur, wenn du wissen willst, was ein Geständnis erklärt und was es nicht erklären kann.",
        method: "Trenne drei Fragen: Warum? Für wen ist was aufgeklärt? Welche Darstellung ist verantwortbar?",
        nextStep: "Sichere «Nach dem Geständnis» und vergleiche Buch und Podcast.",
        entryId: "frage-15",
        theoryId: "true-crime-ethik",
        resourceId: "crime-podcast",
        hints: [
          "Hinweis 1: Ein Geständnis kann den Ablauf klären, ohne ein Motiv vollständig zu erklären.",
          "Hinweis 2: Angehörige und Öffentlichkeit haben nicht dieselben Fragen.",
          "Hinweis 3: Podcast und Buch können dieselben Fakten unterschiedlich gewichten."
        ],
        warning: "Motivfragen nicht dramatisieren. Nur Hinweise, Lücken und Folgen benennen.",
        writingMove: "Aktennotiz: «Das Geständnis beantwortet ..., nicht beantwortet ist ..., für Angehörige bedeutet das ...»."
      }
    ],
    recommendedTheoryIds: ["verhoer-gestaendnis", "sprache-beweis", "true-crime-ethik", "crime-podcast", "rechtsprechung", "gerichtsurteil", "verteidigung-gutachten", "indizienprozess"],
    resourceAssignments: [
      {
        resourceId: "verhoer-gestaendnis",
        title: "Warum gerade jetzt?",
        summary: "Das Geständnis wird als Ergebnis einer Vorgeschichte analysiert.",
        task: "Erkläre, welche vorbereitenden Elemente den Geständnismoment möglich machen.",
        questionTasks: ["Welche Version trägt nicht mehr?", "Welche Frage oder welches Detail wirkt entscheidend?", "Wie verändert sich danach der Blick auf den Anfang?"]
      },
      {
        resourceId: "true-crime-ethik",
        title: "Nach dem Geständnis",
        summary: "Auch Aufklärung verlangt verantwortliches Erzählen.",
        task: "Prüfe, welche ethischen Fragen nach dem Geständnis offen bleiben.",
        questionTasks: ["Was ist aufgeklärt?", "Was bleibt für Angehörige offen?", "Wie sollte die Öffentlichkeit mit dem Fall umgehen?"]
      },
      {
        resourceId: "crime-podcast",
        title: "Podcastvergleich: Der Zwillingsmord von Horgen (2/3)",
        summary: "Die Podcastfolge wird mit dem Buch verglichen: Welche Informationen, Stimmen und Schnitte steuern die Wahrnehmung des Falls?",
        task: "Vergleiche eine Textstelle zum Geständnis oder zur Ermittlungslogik mit einer Sequenz aus dem Podcast.",
        questionTasks: ["Welche Information liefert der Podcast anders als der Buchtext?", "Welche Wirkung erzeugen Stimme, Schnitt oder journalistische Einordnung?", "Wo braucht der Podcast dieselbe ethische Vorsicht wie der Text?"],
        taskGuide: "Die Antwort sollte nicht nur Inhalt vergleichen, sondern Medienform: Podcast, Hörbuch und Buch erzeugen jeweils andere Nähe, Autorität und Spannung.",
        answerGuides: [
          "Der Podcast kann stärker ordnen, kommentieren oder durch Stimmen eine dokumentarische Nähe herstellen.",
          "Stimme, Schnitt und Einordnung können Druck, Betroffenheit oder Übersicht erzeugen; das Buch arbeitet stärker über Textstruktur und Wortlaut.",
          "Ethische Vorsicht bleibt nötig, weil auch Audiojournalismus reale Gewalt, Opfer und Angehörige darstellt."
        ]
      },
      {
        resourceId: "rechtsprechung",
        title: "Rechtsgrundlagen für Anklage und Verteidigung",
        summary: "Die Rechtsstation liefert Normen und Entscheidrecherche, damit aus literarischen Spuren juristische Streitfragen werden.",
        task: "Ordne die Aktenlage zwei möglichen Prozessnarrativen zu: Anklage und Verteidigung.",
        questionTasks: ["Welche Spuren stützen eine Anklage?", "Welche Spuren stützen vernünftige Zweifel?", "Welche Rechtsbegriffe aus StGB, StPO oder Rechtsprechung musst du klären?"],
        taskGuide: "Eine gute Antwort unterscheidet Tatfrage, Beweisfrage und Rechtsfrage. Sie behauptet kein Urteil, bevor die Indizien gewürdigt sind.",
        answerGuides: [
          "Eine Anklage stützt sich auf Indizienketten, Aussagewidersprüche, Motivlagen und ein mögliches Geständnis.",
          "Die Verteidigung fragt nach alternativen Tathergängen, Lücken, Mehrdeutigkeiten und Beweislast.",
          "Zu klären sind etwa Tatbestand, Vorsatz, Mordqualifikation, Beweiswürdigung, Unschuldsvermutung und Strafzumessung."
        ]
      },
      {
        resourceId: "gerichtsurteil",
        title: "Reales Urteil: Anträge und Streitpunkt",
        summary: "Das Bezirksgerichtsurteil zeigt, dass Anklage und Verteidigung besonders über Qualifikation, Massnahme und Strafmass stritten.",
        task: "Arbeite aus den Seiten 5-6 und 38-54 die Streitlinien heraus: Was verlangten Staatsanwaltschaft, Privatklägerschaft und Verteidigung?",
        questionTasks: ["Welche Schuldsprüche beantragte die Staatsanwaltschaft?", "Welche Qualifikation beantragte die Verteidigung?", "Welche Rolle spielen Art. 111 und Art. 112 StGB?", "Wo verändert das reale Urteil deine eigene Urteilsvariante?"],
        taskGuide: "Eine gute Antwort benennt die Differenz zwischen mehrfacher Mordqualifikation und mehrfacher vorsätzlicher Tötung und zeigt, dass das Gericht diese Differenz begründen musste.",
        answerGuides: [
          "Die Staatsanwaltschaft beantragte Schuldsprüche wegen mehrfachen Mordes nach Art. 112 StGB sowie vorsätzlicher Tötung nach Art. 111 StGB und eine lebenslängliche Freiheitsstrafe.",
          "Die Verteidigung beantragte eine Verurteilung wegen mehrfacher vorsätzlicher Tötung nach Art. 111 StGB, also ohne Mordqualifikation.",
          "Art. 111 StGB bildet den Grundtatbestand; Art. 112 StGB setzt qualifizierende Mordmerkmale voraus.",
          "Das reale Urteil zwingt dazu, die eigene Deutung nicht nur erzählerisch, sondern rechtlich zu prüfen."
        ]
      },
      {
        resourceId: "verteidigung-gutachten",
        title: "Schuldfähigkeit, Massnahme, Verteidigung",
        summary: "Die Dissertation hilft, die Verteidigungsposition zur stationären Massnahme und die Rolle psychiatrischer Gutachten zu verstehen.",
        task: "Vergleiche die Anträge der Verteidigung im Urteil mit der Frage, welche Rechte der Verteidigung bei psychiatrischer Exploration zukommen sollen.",
        questionTasks: ["Welche Massnahme beantragte die Verteidigung?", "Welche Massnahme ordnete das Gericht an?", "Warum ist das Gutachten zur Schuldfähigkeit und Massnahmenindikation für beide Seiten strategisch wichtig?"]
      }
    ]
  },
  {
    id: "lektion-06",
    title: "Gerichtssaal: Plädoyer und Urteil",
    summary: "Aus denselben Akten entstehen begründete Urteilsvarianten: belastende Kette, Gegenkette, rechtliche Qualifikation und Zweifel.",
    moduleIds: ["modul-06"],
    entryIds: ["frage-16", "frage-17", "frage-18"],
    reviewFocus: "Aus Einzelspuren eine verantwortliche Beweiswürdigung und ein begründetes Urteil entwickeln.",
    sebPrompt: "Bündle Textanalyse, Materialkritik, Rechtsprechung und ethische Reflexion in einem Plädoyer oder Urteil.",
    pathBriefing: "Im Gerichtssaal wird aus Puzzleteilen eine Begründung. Du arbeitest mit derselben Aktenbasis, kannst aber drei Wege wählen: belastende Kette, Zweifel/Korrektur oder eigenes Urteil mit Varianten.",
    pathChoices: [
      {
        id: "gericht-anklage",
        title: "Spur A: Belastende Kette",
        role: "Aktenstück: Indizienkette. Belastend können Fensterbefund, falsche Version, Zeitlücke, Widersprüche, Motivhinweise und Geständnis werden.",
        chooseIf: "Verfolge diese Spur, wenn du eine Anklagekette ohne Lückenbehauptung bauen willst.",
        method: "Ordne jedes Indiz nach Gewicht: stark, mittel, nur ergänzend. Setze zu jedem Indiz die stärkste Gegenfrage.",
        nextStep: "Sichere «Gesamtthese» mit dem Werkzeug Indizienprozess.",
        entryId: "frage-16",
        theoryId: "indizienprozess",
        resourceId: "indizienprozess",
        hints: [
          "Hinweis 1: Ein starkes Indiz braucht Quelle, Textstelle und Funktion in der Kette.",
          "Hinweis 2: Fensterbefund und Geständnis sind unterschiedlich zu gewichten.",
          "Hinweis 3: Eine Anklagekette muss auch die stärkste Verteidigungsfrage überstehen."
        ],
        warning: "Keine Strafschärfe ohne Begründung von Vorsatz, Qualifikation und Beweiswürdigung.",
        writingMove: "Aktennotiz: «Belastend sind ..., am stärksten wiegt ..., angegriffen werden könnte ...»."
      },
      {
        id: "gericht-verteidigung",
        title: "Spur B: Zweifel und Gegenkette",
        role: "Aktenstück: Verteidigungsprüfung. Gesucht werden mehrdeutige Hinweise, Beweislücken, Gutachtenfragen und rechtliche Schwellen.",
        chooseIf: "Verfolge diese Spur, wenn du prüfen willst, wo die Aktenbasis nicht eindeutig trägt.",
        method: "Lege zu jedem belastenden Indiz eine Gegenfrage an: andere Erklärung, fehlender Beleg, Verfahrensfrage, Gutachtenfrage.",
        nextStep: "Sichere «Aktenprodukt» und nutze die Ressource Verteidigung/Gutachten.",
        entryId: "frage-17",
        theoryId: "verteidigung-gutachten",
        resourceId: "verteidigung-gutachten",
        hints: [
          "Hinweis 1: Ein Zweifel zählt nur, wenn er an einem Aktenstück hängt.",
          "Hinweis 2: Schuldfähigkeit, Massnahme und Gutachten sind nicht dasselbe wie Tatfrage.",
          "Hinweis 3: Die Verteidigung kann Qualifikation und Strafmass angreifen, auch wenn der Grundtatbestand nicht bestritten wird."
        ],
        warning: "Nicht jede Lücke entlastet. Zeige, warum sie rechtlich relevant ist.",
        writingMove: "Aktennotiz: «Nicht bestritten ist ..., zweifelhaft bleibt ..., rechtlich wirkt sich das aus bei ...»."
      },
      {
        id: "gericht-urteil",
        title: "Spur C: Urteilsvarianten",
        role: "Aktenstück: Urteilswerkstatt. Möglich sind unterschiedliche Varianten, wenn Qualifikation, Beweiswürdigung oder Zweifel anders gewichtet werden.",
        chooseIf: "Verfolge diese Spur, wenn du am Ende selbst entscheiden und die Entscheidung begründen willst.",
        method: "Vergleiche drei Varianten: strenge Qualifikation, mildere rechtliche Würdigung, nicht nachweisbare oder zweifelhafte Variante.",
        nextStep: "Sichere «Urteil und Zweifel» und öffne die Urteilswerkstatt.",
        entryId: "frage-18",
        theoryId: "urteilswerkstatt",
        resourceId: "urteilswerkstatt",
        hints: [
          "Hinweis 1: Ein Urteil braucht Reihenfolge: Fakten, Beweise, Recht, Ergebnis.",
          "Hinweis 2: Die stärkste Gegenposition muss fair dargestellt werden.",
          "Hinweis 3: Vergleiche dein Ergebnis mit dem realen Urteil, ohne es einfach zu kopieren."
        ],
        warning: "Kein Bauchurteil. Jede Variante braucht Aktenstücke.",
        writingMove: "Aktennotiz: «Variante A trägt wegen ..., Variante B scheitert an ..., mein Urteil lautet ...»."
      }
    ],
    recommendedTheoryIds: ["true-crime-ethik", "material-craft", "hoerbuch", "autorinnenkontext", "crime-podcast", "rechtsprechung", "gerichtsurteil", "verteidigung-gutachten", "indizienprozess", "urteilswerkstatt"],
    resourceAssignments: [
      {
        resourceId: "material-craft",
        title: "Akten-Baustein",
        summary: "Das Abschlussprodukt verbindet eine Textstelle mit Hörstation, Podcast, Autorinnenwebsite oder Craft-Impuls.",
        task: "Erstelle einen Portfolio-Baustein mit These, Textbeleg, Materialbezug und ethischer Reflexion.",
        questionTasks: ["Was ist deine These?", "Welcher Textbeleg trägt sie?", "Welche externe Ressource nutzt du und warum?", "Wie nutzt du Material, ohne es auszuschlachten?"]
      },
      {
        resourceId: "true-crime-ethik",
        title: "Ethisches Prozessprotokoll",
        summary: "Die Einheit endet mit einem begründeten Urteil zu True Crime, Prozesssimulation und Verantwortung.",
        task: "Beurteile, unter welchen Bedingungen eine literarische Spurensicherung im Unterricht sinnvoll ist.",
        questionTasks: ["Welcher Erkenntnisgewinn entsteht?", "Welche Risiken bleiben?", "Welche Regel würdest du für weitere Einheiten festhalten?"]
      },
      {
        resourceId: "rechtsprechung",
        title: "Rechtsprechungsdossier",
        summary: "Fedlex, Bundesgericht und Zürcher Entscheidsuche dienen als juristische Werkzeugkiste für die Urteilsbegründung.",
        task: "Erstelle eine juristische Werkzeugkarte: Welche Normen, Suchbegriffe und Entscheidfragen brauchst du für dein Urteil?",
        questionTasks: ["Welche StGB-Artikel oder Rechtsbegriffe sind zentral?", "Welche Rolle spielt die StPO für Akten, Beweis und Verfahren?", "Welche Suchbegriffe würdest du in der Rechtsprechungssuche verwenden?"]
      },
      {
        resourceId: "gerichtsurteil",
        title: "Reales Urteil: Dispositiv und Begründung",
        summary: "Das Urteil des Bezirksgerichts Horgen dient als reale Vergleichsakte für die Prozesssimulation.",
        task: "Vergleiche dein Plädoyer mit dem realen Dispositiv auf Seite 109 ff. und mit der rechtlichen Würdigung ab Seite 38.",
        questionTasks: ["Worin stimmt dein Urteil mit dem Bezirksgericht überein?", "Wo würdest du anders gewichten?", "Wie begründet das Gericht lebenslängliche Freiheitsstrafe und Massnahme?", "Welche Passage zeigt besonders klar den Unterschied zwischen literarischer Deutung und juristischer Begründung?"]
      },
      {
        resourceId: "verteidigung-gutachten",
        title: "EMRK-Perspektive: faires Verfahren und Gutachten",
        summary: "Die Vertiefung erweitert die Urteilswerkstatt um die Frage, ob und wie Verteidigungsrechte bei psychiatrischen Gutachten geschützt werden.",
        task: "Baue in dein Urteil oder Minderheitsvotum einen Absatz zur Rolle psychiatrischer Gutachten und Verteidigungsrechte ein.",
        questionTasks: ["Welche Bedeutung hat ein Gutachten für Schuldfähigkeit oder Massnahme?", "Welche Fairnessfrage stellt sich bei Explorationsgesprächen?", "Wie könnte diese Frage ein Minderheitsvotum oder eine Verteidigungsrede stärken?"]
      },
      {
        resourceId: "indizienprozess",
        title: "Indizienkette und Zweifel",
        summary: "Die Teams bauen aus denselben Akten unterschiedliche Beweisbilder.",
        task: "Erstelle eine Indizienmatrix mit belastenden, entlastenden und mehrdeutigen Spuren.",
        questionTasks: ["Welche drei Indizien tragen deine Urteilsvariante?", "Welche Gegenhypothese ist am stärksten?", "Wo müsste ein Gericht Zweifel ausdrücklich würdigen?"]
      },
      {
        resourceId: "urteilswerkstatt",
        title: "Drei mögliche Urteile",
        summary: "Auf derselben Aktenbasis können unterschiedliche Urteilsvarianten diskutiert werden.",
        task: "Formuliere drei kurze Urteilssätze: Schuldspruch mit strenger Qualifikation, Schuldspruch mit anderer rechtlicher Würdigung, Freispruch oder nicht nachweisbare Variante.",
        questionTasks: ["Welche Aktenstücke tragen Variante A?", "Welche Aktenstücke tragen Variante B?", "Welche Zweifel könnten eine mildere oder freisprechende Variante begründen?", "Welche Variante überzeugt dich am Ende am meisten?"]
      },
      {
        resourceId: "autorinnenkontext",
        title: "Autorin, Werk, Verantwortung",
        summary: "Die Autorinnenwebsite hilft, die Einheit im Spannungsfeld von journalistischer Erfahrung, Krimiliteratur und True-Crime-Erzählung zu bilanzieren.",
        task: "Formuliere eine Abschlussnotiz: Was verändert der Blick auf Christine Brands Werkprofil an deiner Lektüre?",
        questionTasks: ["Welche Werk- oder Autorinneninformation ist wirklich relevant?", "Wie bleibt deine Deutung textnah?", "Welche Grenze hat biografischer oder werkgeschichtlicher Kontext?"]
      },
      {
        resourceId: "crime-podcast",
        title: "Buch, Hörbuch, Podcast: Medienvergleich",
        summary: "Zum Schluss werden Buch, Hörbuch und Podcast als unterschiedliche Formen der Fallvermittlung verglichen.",
        task: "Beurteile, welches Medium den Fall am verantwortungsvollsten vermittelt und begründe dein Urteil mit konkreten Beobachtungen.",
        questionTasks: ["Was kann das Buch besser als der Podcast?", "Was kann der Podcast besser als der Buchtext?", "Welche Rolle spielen Stimme, Schnitt und Quellenhinweise?"]
      }
    ]
  }
];

export const starterPrompt = {
  title: "Spurenakte",
  text: "Wähle zuerst ein konkretes Puzzleteil. Lies dann die passende Passage im PDF und antworte mit Fakt, Quelle, Hinweiswert, Lücke und Gegenfrage.",
  items: [
    "Sichere zuerst Daten, Orte, Personen, Aussagen und sichtbare Befunde.",
    "Markiere jede Stelle als Fakt, Behauptung, Beobachtung, Motivhinweis oder Lücke.",
    "Prüfe danach gegen: Welche andere Erklärung passt noch zu denselben Aktenstücken?"
  ]
};

export const pdfSource = pdfPath;
export const coverImage = coverImg;
export const authorImage = authorImg;
