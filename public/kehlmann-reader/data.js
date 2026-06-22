const pdfPath = "/reader/assets/heidi-volltext.html";
const coverImg = "/reader/assets/heidi-cover.svg";
const authorImg = "/reader/assets/johanna-spyri-card.svg";

const fillerWords = new Set([
  "der",
  "die",
  "das",
  "und",
  "oder",
  "dass",
  "weil",
  "wird",
  "werden",
  "einer",
  "eine",
  "einem",
  "einen",
  "eines",
  "wie",
  "warum",
  "welche",
  "welcher",
  "welches",
  "wodurch",
  "woran",
  "wo",
  "hier",
  "dieser",
  "diese",
  "dieses",
  "deiner",
  "deine",
  "deinem",
  "deinen",
  "passage",
  "szene",
  "text",
  "stelle",
  "genau",
  "besonders",
  "mehr",
  "schon",
  "gerade",
  "doch",
  "noch"
]);

const theoryProfiles = {
  "archiv-biografie": {
    "label": "Archiv und Biografie",
    "aliases": [
      "spyri",
      "autorin",
      "biografie",
      "brief",
      "archiv",
      "nachlass",
      "familie",
      "tobias",
      "dete",
      "almöhi",
      "almoehi"
    ]
  },
  "religion": {
    "label": "Religion und Gottvertrauen",
    "aliases": [
      "gott",
      "gebet",
      "grossmama",
      "großmama",
      "grossmutter",
      "pfarrer",
      "religiös",
      "religioes",
      "vertrauen",
      "zweifel"
    ]
  },
  "natur-paedagogik": {
    "label": "Natur und Pädagogik",
    "aliases": [
      "natur",
      "alp",
      "alm",
      "berge",
      "weide",
      "geissen",
      "ziegen",
      "schule",
      "lesen",
      "griffel",
      "lernen",
      "grossvater",
      "großvater"
    ]
  },
  "stadt-land": {
    "label": "Stadt und Heimweh",
    "aliases": [
      "frankfurt",
      "stadt",
      "fenster",
      "heimweh",
      "rottenmeier",
      "sesemann",
      "benimm",
      "hausordnung",
      "spuk",
      "doktor"
    ]
  },
  "figuren-beziehungen": {
    "label": "Figuren und Beziehungen",
    "aliases": [
      "heidi",
      "peter",
      "geissenpeter",
      "klara",
      "dete",
      "almöhi",
      "grossmutter",
      "sesemann",
      "sebastian",
      "tinette"
    ]
  },
  "koerper-gesundheit": {
    "label": "Körper und Gesundheit",
    "aliases": [
      "krank",
      "gesund",
      "körper",
      "koerper",
      "rollstuhl",
      "laufen",
      "schlaf",
      "essen",
      "brot",
      "medizin",
      "doktor"
    ]
  },
  "bilder-popularisierung": {
    "label": "Bilder und Popularisierung",
    "aliases": [
      "bild",
      "illustration",
      "heimat",
      "sjw",
      "popularisierung",
      "schweiz",
      "kanon",
      "medien",
      "film"
    ]
  },
  "film-alptraum": {
    "label": "Filmische Deutung",
    "aliases": [
      "film",
      "srf",
      "sternstunde",
      "alptraum",
      "anita hugi",
      "marthe keller",
      "stimme",
      "einstellung",
      "schnitt",
      "archiv"
    ]
  },
  "sprache-erzaehlen": {
    "label": "Sprache und Erzählen",
    "aliases": [
      "formulierung",
      "erzählen",
      "erzaehlen",
      "ton",
      "gespräch",
      "gespraech",
      "brief",
      "ausdrucksweise",
      "dialog"
    ]
  },
  "schuld-ordnung": {
    "label": "Schuld und Ordnung",
    "aliases": [
      "schuld",
      "geständnis",
      "gestaendnis",
      "untat",
      "bestrafung",
      "vergebung",
      "ordnung",
      "regel",
      "entschädigung",
      "entschaedigung"
    ]
  },
  "ki-trailer": {
    "label": "KI-Trailer und Verfremdung",
    "aliases": ["ki", "ai", "trailer", "cursed", "horror", "unheimlich", "verfremdung", "youtube", "karpi", "generiert", "bild", "schnitt", "musik"]
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
  if (plain.includes("ä")) {
    variants.add(plain.replaceAll("ä", "ae"));
  }
  if (plain.includes("ö")) {
    variants.add(plain.replaceAll("ö", "oe"));
  }
  if (plain.includes("ü")) {
    variants.add(plain.replaceAll("ü", "ue"));
  }
  if (plain.includes("ß")) {
    variants.add(plain.replaceAll("ß", "ss"));
  }

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
  if (!text) {
    return "";
  }
  const [sentence] = text.split(/(?<=[.!?])\s+/u);
  return sentence || text;
}

function capitalize(value = "") {
  const text = String(value || "").trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function naturalJoin(items = []) {
  const parts = items.filter(Boolean);
  if (!parts.length) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} und ${parts[1]}`;
  }
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
  if (/^(prüfe|pruefe|entscheide)/.test(text)) {
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
    aliases.flatMap((alias) => {
      return aliasVariants(alias).flatMap((variant) => unique([variant, ...variant.split(" ").filter((part) => part.length > 2)]));
    })
  );

  return {
    label,
    aliases: normalizedAliases
  };
}

function theoryConcepts(ids = []) {
  return ids
    .map((id) => theoryProfiles[id])
    .filter(Boolean)
    .map((profile) => conceptFromAliases(profile.label, profile.aliases));
}

function modelAnswerForTask({ prompt, context, signalWords = [], keyIdeas = [], writingFrame = "", relatedTheoryIds = [], taskTitle = "" }) {
  const sentence = firstSentence(context || writingFrame || taskTitle);
  const promptFocus = focusTerms(prompt, "", [...signalWords, ...keyIdeas, taskTitle]).slice(0, 3);
  const promptSentence = promptFocus.length
    ? `Im Zentrum der Frage stehen hier ${naturalJoin(promptFocus)}.`
    : "";
  const evidence = signalWords.length
    ? `Das sieht man an Signalen wie ${signalWords.slice(0, 2).map((word) => `"${word}"`).join(" und ")}.`
    : "";
  const theoryHint = relatedTheoryIds
    .map((id) => theoryProfiles[id]?.label)
    .filter(Boolean)
    .slice(0, 2);
  const focus = keyIdeas.length ? keyIdeas.slice(0, 2).join(" und ") : focusTerms(prompt, context, signalWords).slice(0, 2).join(" und ");
  const focusSentence = focus
    ? `Wichtig wird dabei besonders ${focus.toLowerCase()}.`
    : "";
  const finalSentence = theoryHint.length
    ? `So wird besonders ${theoryHint.join(" und ").toLowerCase()} sichtbar.`
    : focusSentence
      || "Dadurch wird die Funktion der Passage deutlich und nicht nur ihr Inhalt nacherzählt.";

  return unique([promptSentence, capitalize(sentence), evidence, finalSentence]).join(" ");
}

function instructionForTask(prompt, { signalWords = [], relatedTheoryIds = [], kind = "question" } = {}) {
  const operator = operatorProfile(prompt);
  const evidencePart = signalWords.length
    ? `Arbeite mit mindestens einem genauen Signalwort aus der Passage, zum Beispiel ${signalWords.slice(0, 2).map((word) => `"${word}"`).join(" oder ")}.`
    : "Arbeite mit mindestens einem genauen Textdetail oder Wortlaut aus der Passage.";
  const theoryPart = relatedTheoryIds.length
    ? `Verbinde deine Beobachtung am Schluss mit ${relatedTheoryIds.map((id) => theoryProfiles[id]?.label).filter(Boolean).slice(0, 2).join(" oder ")}.`
    : "Schließe mit einer klaren Deutung oder Funktionsaussage.";
  const opening = kind === "transfer"
    ? "Beziehe Passage und Deutungslinse ausdrücklich aufeinander."
    : kind === "resource"
      ? "Nutze die Ressource als Leselinse und bleibe eng am Romanausschnitt."
      : operator.action;

  return `Antworte in ${operator.sentenceCount} Sätzen. ${opening}. ${evidencePart} ${theoryPart}`;
}

function checklistForTask(prompt, { signalWords = [], relatedTheoryIds = [] } = {}) {
  const operator = operatorProfile(prompt);
  return unique([
    `${operator.label}: ${capitalize(prompt.replace(/\?$/, ""))}.`,
    signalWords.length
      ? `Nenne mindestens ein Textsignal aus der Passage: ${signalWords.slice(0, 3).join(", ")}.`
      : "Nenne mindestens ein Textsignal oder eine genaue Beobachtung aus der Passage.",
    relatedTheoryIds.length
      ? `Verbinde deine Aussage mit ${relatedTheoryIds.map((id) => theoryProfiles[id]?.label).filter(Boolean).slice(0, 2).join(" oder ")}.`
      : "Formuliere am Schluss die Wirkung, Funktion oder Ambivalenz der Stelle."
  ]);
}

export function buildTask(prompt, options = {}) {
  const {
    context = "",
    signalWords = [],
    relatedTheoryIds = [],
    keyIdeas = [],
    writingFrame = "",
    kind = "question",
    taskTitle = ""
  } = options;
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
    modelAnswer: modelAnswerForTask({
      prompt: question,
      context,
      signalWords,
      keyIdeas,
      writingFrame,
      relatedTheoryIds,
      taskTitle
    }),
    concepts,
    synonymHints: unique(concepts.flatMap((concept) => concept.aliases)).slice(0, 10)
  };
}

export const theoryResources = [
  {
    "id": "archiv-biografie",
    "title": "Dossier: Johanna Spyri, Archiv und vorsichtige Biografie",
    "shortTitle": "Archiv",
    "sourceTitle": "Dossier: Johanna Spyri, Archiv und vorsichtige Biografie",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-archiv-biografie.html",
    "embedUrl": "/reader/assets/heidi-archiv-biografie.html",
    "summary": "Spyri wird als Autorin historisch fassbar, aber nicht einfach durch Heidi erklärbar. Archivfragen helfen, biografische Kurzschlüsse zu vermeiden.",
    "keyIdeas": [
      "Autorin",
      "Archiv",
      "Nachlass",
      "Biografie"
    ],
    "questions": [
      "Wo wäre eine biografische Deutung hilfreich, wo wäre sie zu schnell?",
      "Welche Informationen über Familie, Herkunft oder Nachlass verändern deine Lektüre?"
    ],
    "transferPrompts": [
      "Nutze Archiv als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Archiv nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Archiv wird sichtbar, dass ..."
  },
  {
    "id": "religion",
    "title": "Dossier: Religion, Großmutter und Mehrfachadressierung",
    "shortTitle": "Religion",
    "sourceTitle": "Dossier: Religion, Großmutter und Mehrfachadressierung",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-religion-mehrfachadressierung.html",
    "embedUrl": "/reader/assets/heidi-religion-mehrfachadressierung.html",
    "summary": "Religiöse Passagen sprechen Kinder und erwachsene Mitlesende zugleich an und strukturieren Trost, Schuld, Dankbarkeit und Erziehung.",
    "keyIdeas": [
      "Gottvertrauen",
      "Zweifel",
      "Großmama",
      "Pfarrer"
    ],
    "questions": [
      "Wie wird Religion als Trost, Erziehung oder Konfliktlösung eingesetzt?",
      "Welche Zweifel werden ernst genommen und welche werden erzählerisch geschlossen?"
    ],
    "transferPrompts": [
      "Nutze Religion als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Religion nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Religion wird sichtbar, dass ..."
  },
  {
    "id": "natur-paedagogik",
    "title": "Dossier: Alp, Natur und Pädagogik",
    "shortTitle": "Natur",
    "sourceTitle": "Dossier: Alp, Natur und Pädagogik",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-natur-paedagogik.html",
    "embedUrl": "/reader/assets/heidi-natur-paedagogik.html",
    "summary": "Die Alp ist Erfahrungsraum, Körperraum und Gegenmodell zur kontrollierten Schule. Natur wirkt im Roman aktiv auf Figuren.",
    "keyIdeas": [
      "Alp",
      "Körper",
      "Schule",
      "Erfahrung"
    ],
    "questions": [
      "Welche Naturdetails verändern Heidis Verhalten?",
      "Welches pädagogische Modell steht hinter Großvater, Peter oder der Großmama?"
    ],
    "transferPrompts": [
      "Nutze Natur als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Natur nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Natur wird sichtbar, dass ..."
  },
  {
    "id": "stadt-land",
    "title": "Dossier: Frankfurt, Ordnung und Heimweh",
    "shortTitle": "Stadt",
    "sourceTitle": "Dossier: Frankfurt, Ordnung und Heimweh",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-stadt-land.html",
    "embedUrl": "/reader/assets/heidi-stadt-land.html",
    "summary": "Frankfurt zeigt Hausordnung, soziale Rollen, Unterricht und Medizin. Heimweh wird dadurch als seelische, körperliche und räumliche Krise lesbar.",
    "keyIdeas": [
      "Frankfurt",
      "Fenster",
      "Heimweh",
      "Hausordnung"
    ],
    "questions": [
      "Welche Regeln machen Heidi fremd?",
      "Wie unterscheiden sich medizinische, soziale und erzählerische Erklärung des Heimwehs?"
    ],
    "transferPrompts": [
      "Nutze Stadt als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Stadt nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Stadt wird sichtbar, dass ..."
  },
  {
    "id": "koerper-gesundheit",
    "title": "Dossier: Körper, Krankheit und Heilung",
    "shortTitle": "Körper",
    "sourceTitle": "Dossier: Körper, Krankheit und Heilung",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-stadt-land.html",
    "embedUrl": "/reader/assets/heidi-stadt-land.html",
    "summary": "Krankheit, Essen, Schlaf, Bewegung, Rollstuhl und Laufen verbinden Körperfragen mit sozialer Ordnung und Hoffnung.",
    "keyIdeas": [
      "Krankheit",
      "Rollstuhl",
      "Laufen",
      "Essen"
    ],
    "questions": [
      "Welche Körperzeichen sind erzählerisch entscheidend?",
      "Wo wird Heilung plausibel, symbolisch oder problematisch?"
    ],
    "transferPrompts": [
      "Nutze Körper als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Körper nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Körper wird sichtbar, dass ..."
  },
  {
    "id": "bilder-popularisierung",
    "title": "Dossier: Bilder, Heimat und Popularisierung",
    "shortTitle": "Bilder",
    "sourceTitle": "Dossier: Bilder, Heimat und Popularisierung",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-bilder-popularisierung.html",
    "embedUrl": "/reader/assets/heidi-bilder-popularisierung.html",
    "summary": "Illustrationen, Schulhefte und spätere Medien formen Heidi zu einer Heimat- und Schweizfigur, die über den Roman hinaus wirkt.",
    "keyIdeas": [
      "Illustration",
      "Heimat",
      "Schweiz",
      "Medien"
    ],
    "questions": [
      "Welche inneren Bilder erzeugt der Roman selbst?",
      "Wie verändert Popularisierung die Deutung von Heimat?"
    ],
    "transferPrompts": [
      "Nutze Bilder als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Bilder nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Bilder wird sichtbar, dass ..."
  },
  {
    "id": "film-alptraum",
    "title": "Filmwerkstatt: Heidis Alptraum",
    "shortTitle": "Film",
    "sourceTitle": "Filmwerkstatt: Heidis Alptraum",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-film-alptraum.html",
    "embedUrl": "/reader/assets/heidi-film-alptraum.html",
    "summary": "Anita Hugis Dokumentarfilm wird als interpretatorische Erweiterung genutzt: Er fragt nach Spyri, Mythos, Bildgeschichte und der Schattenseite des Heidi-Erfolgs.",
    "keyIdeas": [
      "Film",
      "SRF",
      "Alptraum",
      "Archiv"
    ],
    "questions": [
      "Welche Romanstelle liest du nach dem Film anders?",
      "Wie arbeitet der Film mit Stimme, Landschaft, Archiv oder Pop-Ikone?"
    ],
    "transferPrompts": [
      "Nutze Film als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Film nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Film wird sichtbar, dass ..."
  },
  {
    "id": "material-craft",
    "title": "Materialstation: Craft-Links und SRF-Hinweis",
    "shortTitle": "Material",
    "sourceTitle": "Materialstation: Craft-Links und SRF-Hinweis",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-material-craft.html",
    "embedUrl": "/reader/assets/heidi-material-craft.html",
    "summary": "Die Craft-Materialien werden in Thesen, Beobachtungsfragen und Vergleichsaufträge übersetzt, statt nur verlinkt zu werden.",
    "keyIdeas": [
      "Craft",
      "SRF",
      "Material",
      "These"
    ],
    "questions": [
      "Welcher konkrete Materialimpuls führt zu einer neuen Romanthese?",
      "Wie wird aus einem Link eine genaue Beobachtungsaufgabe?"
    ],
    "transferPrompts": [
      "Nutze Material als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Material nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Material wird sichtbar, dass ...",
    "externalLinks": [
      {
        "label": "Craft: Johanna Spyri: Heidi",
        "url": "https://s.craft.me/QfI3FNe41YGWUI"
      },
      {
        "label": "Craft: SRF-Hinweis vom 27.11.2022",
        "url": "https://s.craft.me/RMkak7X9xxvPQp"
      }
    ]
  },
  {
    "id": "studienkompass",
    "title": "Studienkompass: Heidi und mehr",
    "shortTitle": "Forschung",
    "sourceTitle": "Studienkompass: Heidi und mehr",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-studienkompass.html",
    "embedUrl": "/reader/assets/heidi-studienkompass.html",
    "summary": "Der Open-Access-Band liefert Forschungsachsen zu Archiv, Religion, Bildgeschichte, Alp, Popularisierung, Übersetzung und Medien.",
    "keyIdeas": [
      "Forschung",
      "Open Access",
      "De Gruyter",
      "Leselinse"
    ],
    "questions": [
      "Welche Forschungsachse hilft bei deiner aktuellen Frage?",
      "Wie verändert Forschung deine erste Leseintuition?"
    ],
    "transferPrompts": [
      "Nutze Forschung als Leselinse und sichere die Deutung an einer konkreten Romanstelle.",
      "Formuliere eine These, die ohne Forschung nicht sichtbar wäre."
    ],
    "writingFrame": "Mit der Leselinse Forschung wird sichtbar, dass ..."
  },
  {
    "id": "ki-trailer",
    "title": "KI-Trailer-Werkstatt: CURSED HEIDI",
    "shortTitle": "KI-Trailer",
    "sourceTitle": "YouTube: CURSED HEIDI | AI-generated movie trailer, Karpi",
    "mediaType": "html",
    "openUrl": "/reader/assets/heidi-ki-trailer-cursed.html",
    "embedUrl": "/reader/assets/heidi-ki-trailer-cursed.html",
    "summary": "Der KI-generierte Trailer verfremdet Heidi zur Horrorfigur. Dadurch werden Popularisierung, Bildklischees, Alpenästhetik und kulturelle Erwartung an Kindheit produktiv sichtbar.",
    "keyIdeas": [
      "KI-Ästhetik",
      "Horror",
      "Verfremdung",
      "Heidi-Ikone",
      "Medienkritik"
    ],
    "questions": [
      "Welche Romanmotive übernimmt der Trailer, und welche dreht er gegen die Vorlage?",
      "Wie erzeugen Bild, Musik und Schnitt eine unheimliche Heidi?",
      "Welche Spuren der KI-Generierung beeinflussen deine Deutung?"
    ],
    "transferPrompts": [
      "Vergleiche eine konkrete Romanstelle mit einer Einstellung oder Sequenz aus dem Trailer.",
      "Erkläre, was der Trailer über die Stabilität oder Zerbrechlichkeit der Heidi-Ikone zeigt.",
      "Prüfe, ob die Verfremdung eine Kritik an Heimatkitsch, eine Parodie oder vor allem ein Effektspiel ist."
    ],
    "writingFrame": "Der KI-Trailer macht an Heidi sichtbar, dass kulturelle Bilder von Kindheit und Heimat ...",
    "externalLinks": [
      {
        "label": "YouTube: CURSED HEIDI | AI-generated movie trailer",
        "url": "https://www.youtube.com/watch?v=0A2-Af5JEWU"
      }
    ]
  }
];

const rawReaderModules = [
  {
    "id": "modul-01",
    "title": "Ankunft auf der Alp",
    "summary": "Heidi wird vom sozialen Problemfall zur Figur der alpinen Neuordnung.",
    "entries": [
      {
        "id": "frage-01",
        "title": "Frage 1",
        "passageLabel": "Leitfrage 1",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 1,
        "context": "Schildern Sie den Aufstieg von Maienfeld zur Alp! Wer ist Dete? Wer ist Heidi? Warum ist diese so warm angezogen?",
        "signalWords": [
          "Heidi",
          "Dete"
        ],
        "relatedTheoryIds": [
          "archiv-biografie",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Schildern Sie den Aufstieg von Maienfeld zur Alp! Wer ist Dete? Wer ist Heidi? Warum ist diese so warm angezogen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-02",
        "title": "Frage 2",
        "passageLabel": "Leitfrage 2",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 2,
        "context": "Erläutern Sie das Gespräch zwischen Barbel und Dete? In welchem Verhältnis stehen die beiden zueinander?",
        "signalWords": [
          "Dete"
        ],
        "relatedTheoryIds": [
          "archiv-biografie",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Erläutern Sie das Gespräch zwischen Barbel und Dete? In welchem Verhältnis stehen die beiden zueinander?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-03",
        "title": "Frage 3",
        "passageLabel": "Leitfrage 3",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 3,
        "context": "Erklären Sie den familiären und sozialen Hintergrund von Dete, Almöhi und Heidi! Wer war Tobias?",
        "signalWords": [
          "Heidi",
          "Dete",
          "Almöhi"
        ],
        "relatedTheoryIds": [
          "archiv-biografie",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Erklären Sie den familiären und sozialen Hintergrund von Dete, Almöhi und Heidi! Wer war Tobias?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-04",
        "title": "Frage 4",
        "passageLabel": "Leitfrage 4",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 4,
        "context": "Fassen Sie die Geschichte von Almöhi zusammen! Warum lebt er alleine auf der Alp? Beschreiben Sie seinen Charakter!",
        "signalWords": [
          "Almöhi"
        ],
        "relatedTheoryIds": [
          "archiv-biografie",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Fassen Sie die Geschichte von Almöhi zusammen! Warum lebt er alleine auf der Alp? Beschreiben Sie seinen Charakter!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-05",
        "title": "Frage 5",
        "passageLabel": "Leitfrage 5",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 5,
        "context": "Warum will Dete Heidi loswerden? Schildern Sie die Ankunftsszene und den Abschied von Heidi und Dete! Wie reagiert Heidi auf die Natur?",
        "signalWords": [
          "Heidi",
          "Dete"
        ],
        "relatedTheoryIds": [
          "archiv-biografie",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Warum will Dete Heidi loswerden? Schildern Sie die Ankunftsszene und den Abschied von Heidi und Dete! Wie reagiert Heidi auf die Natur?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-02",
    "title": "Großvater, Peter und Natur",
    "summary": "Natur, Tiere und Schule zeigen konkurrierende Erziehungsmodelle.",
    "entries": [
      {
        "id": "frage-06",
        "title": "Frage 6",
        "passageLabel": "Leitfrage 6",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 6,
        "context": "Wer ist Geissenpeter! Charakterisieren Sie ihn! Welche Aufgaben erledigt er? Warum arbeitet er so viel?",
        "signalWords": [
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Wer ist Geissenpeter! Charakterisieren Sie ihn! Welche Aufgaben erledigt er? Warum arbeitet er so viel?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-07",
        "title": "Frage 7",
        "passageLabel": "Leitfrage 7",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 7,
        "context": "Was bewirkt Heidis Anwesenheit bei Almöhi? Wie richtet sich Heidi ein? Welche Charakterzüge zeigt Heidi? Wie reagiert Almöhi darauf?",
        "signalWords": [
          "Heidi",
          "Almöhi"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Was bewirkt Heidis Anwesenheit bei Almöhi? Wie richtet sich Heidi ein? Welche Charakterzüge zeigt Heidi? Wie reagiert Almöhi darauf?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-08",
        "title": "Frage 8",
        "passageLabel": "Leitfrage 8",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 8,
        "context": "Wie wird die Natur beschrieben? Wie geht Geissenpeter mit den Tieren um? Wo setzt ihm Heidi Grenzen? Wie gehen die beiden miteinander um? Beschreiben Sie den Konversationston!",
        "signalWords": [
          "Heidi",
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Wie wird die Natur beschrieben? Wie geht Geissenpeter mit den Tieren um? Wo setzt ihm Heidi Grenzen? Wie gehen die beiden miteinander um? Beschreiben Sie den Konversationston!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-09",
        "title": "Frage 9",
        "passageLabel": "Leitfrage 9",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 9,
        "context": "Was hat es zu bedeuten, dass Geissenpeter behauptet, die Berge hätten keine Namen?",
        "signalWords": [
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Was hat es zu bedeuten, dass Geissenpeter behauptet, die Berge hätten keine Namen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-10",
        "title": "Frage 10",
        "passageLabel": "Leitfrage 10",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 10,
        "context": "Wie spricht Almöhi den Geissenpeter an? Was hat es mit dem militärischen Unterton auf sich?",
        "signalWords": [
          "Almöhi",
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Wie spricht Almöhi den Geissenpeter an? Was hat es mit dem militärischen Unterton auf sich?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-03",
    "title": "Großmutter, Pfarrer und Weggang",
    "summary": "Religion, Fürsorge und sozialer Druck treiben den Ortswechsel an.",
    "entries": [
      {
        "id": "frage-11",
        "title": "Frage 11",
        "passageLabel": "Leitfrage 11",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 11,
        "context": "Interpretieren Sie die Formulierung «am Griffel nagen»! Inwiefern beschreibt dies Geissenpeters Verhältnis zur Schule?",
        "signalWords": [
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "religion",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Interpretieren Sie die Formulierung «am Griffel nagen»! Inwiefern beschreibt dies Geissenpeters Verhältnis zur Schule?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-12",
        "title": "Frage 12",
        "passageLabel": "Leitfrage 12",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 12,
        "context": "Wie erlebt Heidi den Winter? Wie verläuft der Besuch bei der Grossmutter? Was tut Almöhi? Inwiefern ist diese Entwicklung aussergewöhnlich?",
        "signalWords": [
          "Heidi",
          "Almöhi",
          "Grossmutter"
        ],
        "relatedTheoryIds": [
          "religion",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Wie erlebt Heidi den Winter? Wie verläuft der Besuch bei der Grossmutter? Was tut Almöhi? Inwiefern ist diese Entwicklung aussergewöhnlich?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-13",
        "title": "Frage 13",
        "passageLabel": "Leitfrage 13",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 13,
        "context": "Beschreiben Sie die Beziehung zwischen Heidi und der Grossmutter!",
        "signalWords": [
          "Heidi",
          "Grossmutter"
        ],
        "relatedTheoryIds": [
          "religion",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Beschreiben Sie die Beziehung zwischen Heidi und der Grossmutter!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-14",
        "title": "Frage 14",
        "passageLabel": "Leitfrage 14",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 14,
        "context": "Kommentieren Sie das Gespräch des Pfarrers mit Almöhi! Worum geht es? Wie reagiert der Almöhi darauf?",
        "signalWords": [
          "Almöhi",
          "Pfarrer"
        ],
        "relatedTheoryIds": [
          "religion",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Kommentieren Sie das Gespräch des Pfarrers mit Almöhi! Worum geht es? Wie reagiert der Almöhi darauf?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-15",
        "title": "Frage 15",
        "passageLabel": "Leitfrage 15",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 15,
        "context": "Warum kommt Dete zu Besuch? Wie reagiert Almöhi? Welche Folgen hat dies für Heidi? Wie reagiert sie darauf? Was lässt sich aus der Ausdrucksweise von Heidi schliessen?",
        "signalWords": [
          "Heidi",
          "Dete",
          "Almöhi"
        ],
        "relatedTheoryIds": [
          "religion",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Warum kommt Dete zu Besuch? Wie reagiert Almöhi? Welche Folgen hat dies für Heidi? Wie reagiert sie darauf? Was lässt sich aus der Ausdrucksweise von Heidi schliessen?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-04",
    "title": "Frankfurt als Gegenwelt",
    "summary": "Frankfurt macht Hausordnung, Stand und Fremdheit sichtbar.",
    "entries": [
      {
        "id": "frage-16",
        "title": "Frage 16",
        "passageLabel": "Leitfrage 16",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 16,
        "context": "Schildern Sie Heidis Ankunft in Frankfurt! Charakterisieren Sie Fräulein Rottenmeier! Warum reagiert sie schlecht auf Heidi?",
        "signalWords": [
          "Heidi",
          "Frankfurt",
          "Rottenmeier"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Schildern Sie Heidis Ankunft in Frankfurt! Charakterisieren Sie Fräulein Rottenmeier! Warum reagiert sie schlecht auf Heidi?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-17",
        "title": "Frage 17",
        "passageLabel": "Leitfrage 17",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 17,
        "context": "Wie geht Heidi mit so viel Ablehnung um? Welche Benimmregeln werden von ihr verlangt?",
        "signalWords": [
          "Heidi"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie geht Heidi mit so viel Ablehnung um? Welche Benimmregeln werden von ihr verlangt?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-18",
        "title": "Frage 18",
        "passageLabel": "Leitfrage 18",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 18,
        "context": "Beschreiben Sie Sebastian und Tinette! Welche Rolle spielen sie und welche Beziehung hat Heidi zu den beiden?",
        "signalWords": [
          "Heidi",
          "Sebastian",
          "Tinette"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Beschreiben Sie Sebastian und Tinette! Welche Rolle spielen sie und welche Beziehung hat Heidi zu den beiden?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-19",
        "title": "Frage 19",
        "passageLabel": "Leitfrage 19",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 19,
        "context": "Wie nimmt Heidi die Stadt wahr? Warum will sie die Fenster öffnen?",
        "signalWords": [
          "Heidi"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie nimmt Heidi die Stadt wahr? Warum will sie die Fenster öffnen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-20",
        "title": "Frage 20",
        "passageLabel": "Leitfrage 20",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 20,
        "context": "Wie geht der Schulunterricht mit dem Herrn Kandidaten vonstatten? Fassen Sie die pädagogischen Überlegungen von Fräulein Rottenmeier zusammen!",
        "signalWords": [
          "Rottenmeier"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie geht der Schulunterricht mit dem Herrn Kandidaten vonstatten? Fassen Sie die pädagogischen Überlegungen von Fräulein Rottenmeier zusammen!"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-05",
    "title": "Katzen, Unterricht und Missverstehen",
    "summary": "Komik und Konflikt zeigen, wie sehr Heidi missverstanden wird.",
    "entries": [
      {
        "id": "frage-21",
        "title": "Frage 21",
        "passageLabel": "Leitfrage 21",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 21,
        "context": "Warum ergreift Heidi die Flucht? Kommentieren Sie die Reaktion von Fräulein Rottenmeier!",
        "signalWords": [
          "Heidi",
          "Rottenmeier"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Warum ergreift Heidi die Flucht? Kommentieren Sie die Reaktion von Fräulein Rottenmeier!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-22",
        "title": "Frage 22",
        "passageLabel": "Leitfrage 22",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 22,
        "context": "Fassen Sie Heidis langen Streifzug durch Frankfurt zusammen! Beschreiben Sie den Jungen mit der Drehorgel! Wohin bringt er ihn? Wohin führt der Türmer Heidi?",
        "signalWords": [
          "Heidi",
          "Frankfurt"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Fassen Sie Heidis langen Streifzug durch Frankfurt zusammen! Beschreiben Sie den Jungen mit der Drehorgel! Wohin bringt er ihn? Wohin führt der Türmer Heidi?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-23",
        "title": "Frage 23",
        "passageLabel": "Leitfrage 23",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 23,
        "context": "Woher kriegt Heidi die Kätzchen? Welche Probleme bringt dies mit sich? Wie reagiert Fräulein Rottenmeier? Wie hilft Sebastian?",
        "signalWords": [
          "Heidi",
          "Rottenmeier",
          "Sebastian"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Woher kriegt Heidi die Kätzchen? Welche Probleme bringt dies mit sich? Wie reagiert Fräulein Rottenmeier? Wie hilft Sebastian?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-24",
        "title": "Frage 24",
        "passageLabel": "Leitfrage 24",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 24,
        "context": "Welchen Auftritt hat der Junge mit der Drehorgel im Hause Sesemann? Wie kommen noch mehr Katzen hinzu?",
        "signalWords": [
          "Sesemann"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Welchen Auftritt hat der Junge mit der Drehorgel im Hause Sesemann? Wie kommen noch mehr Katzen hinzu?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-25",
        "title": "Frage 25",
        "passageLabel": "Leitfrage 25",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 25,
        "context": "Wie versucht Fräulein Rottenmeier Heidi zu bestrafen? Mit welchem Erfolg? Erklären Sie, inwiefern Fräulein Rottenmeier Heidi nicht versteht und von ihr Dankbarkeit verlangt für etwas, das sie gar nicht will! Warum will Heidi nach Hause gehen?",
        "signalWords": [
          "Heidi",
          "Rottenmeier"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "sprache-erzaehlen"
        ],
        "prompts": [
          "Wie versucht Fräulein Rottenmeier Heidi zu bestrafen? Mit welchem Erfolg? Erklären Sie, inwiefern Fräulein Rottenmeier Heidi nicht versteht und von ihr Dankbarkeit verlangt für etwas, das sie gar nicht will! Warum will Heidi nach Hause gehen?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-06",
    "title": "Heimweh, Spuk und Heimkehr",
    "summary": "Heimweh wird körperlich, räumlich und medizinisch lesbar.",
    "entries": [
      {
        "id": "frage-26",
        "title": "Frage 26",
        "passageLabel": "Leitfrage 26",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 26,
        "context": "Was hat es mit dem gebunkerten alten Brot und dem Hut auf sich?",
        "signalWords": [
          "Heidi",
          "Erzählung"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Was hat es mit dem gebunkerten alten Brot und dem Hut auf sich?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-27",
        "title": "Frage 27",
        "passageLabel": "Leitfrage 27",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 27,
        "context": "Wie reagiert Herr Sesemann auf die Missstimmung in seinem Haus? Wer ergreift für wen Partei? Wie äussert sich Fräulein Rottenmeier? Welchen Bericht erstattet der Kandidat? Was berichtet Klara?",
        "signalWords": [
          "Rottenmeier",
          "Sesemann",
          "Klara"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie reagiert Herr Sesemann auf die Missstimmung in seinem Haus? Wer ergreift für wen Partei? Wie äussert sich Fräulein Rottenmeier? Welchen Bericht erstattet der Kandidat? Was berichtet Klara?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-28",
        "title": "Frage 28",
        "passageLabel": "Leitfrage 28",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 28,
        "context": "Schildern Sie die Ankunft der Grossmama! Wie versteht sich Heidi mit ihr? Wie schafft es diese, Heidis Vertrauen zu gewinnen? Kommentieren Sie die Gespräche über Religion! Erläutern Sie Heidis Zweifel an Gott! Wie lernt Heidi doch noch lesen?",
        "signalWords": [
          "Heidi"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Schildern Sie die Ankunft der Grossmama! Wie versteht sich Heidi mit ihr? Wie schafft es diese, Heidis Vertrauen zu gewinnen? Kommentieren Sie die Gespräche über Religion! Erläutern Sie Heidis Zweifel an Gott! Wie lernt Heidi doch noch lesen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-29",
        "title": "Frage 29",
        "passageLabel": "Leitfrage 29",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 29,
        "context": "Was hat es mit den spukhaften Vorgängen im Hause Sesemann auf sich? Was berichtet Sebastian? Wie handelt Fräulein Rottenmeier?",
        "signalWords": [
          "Rottenmeier",
          "Sesemann",
          "Sebastian"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Was hat es mit den spukhaften Vorgängen im Hause Sesemann auf sich? Was berichtet Sebastian? Wie handelt Fräulein Rottenmeier?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-30",
        "title": "Frage 30",
        "passageLabel": "Leitfrage 30",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 30,
        "context": "Wie deckt der Doktor die Spukgeschichte auf? Wie diagnostiziert er das Heimweh? Analysieren Sie die medizinische Argumentation!",
        "signalWords": [
          "Doktor"
        ],
        "relatedTheoryIds": [
          "stadt-land",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie deckt der Doktor die Spukgeschichte auf? Wie diagnostiziert er das Heimweh? Analysieren Sie die medizinische Argumentation!"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-07",
    "title": "Der Doktor und das gelernte Heidi",
    "summary": "Heidi wendet Gelerntes auf Trauer, Trost und Beziehung an.",
    "entries": [
      {
        "id": "frage-31",
        "title": "Frage 31",
        "passageLabel": "Leitfrage 31",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 31,
        "context": "Wie wird Heidis Heimreise organisiert? Wie reagieren Fräulein Rottenmeier, Dete und Klara? Welche Aufgabe übernimmt Sebastian? Schildern Sie den Abschied von Frankfurt! Wie nimmt Heidi am Schluss Abschied von Sebastian? Was steht im Brief von Sesemann an den Almöhi?",
        "signalWords": [
          "Heidi",
          "Dete",
          "Almöhi",
          "Frankfurt",
          "Rottenmeier"
        ],
        "relatedTheoryIds": [
          "religion",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie wird Heidis Heimreise organisiert? Wie reagieren Fräulein Rottenmeier, Dete und Klara? Welche Aufgabe übernimmt Sebastian? Schildern Sie den Abschied von Frankfurt! Wie nimmt Heidi am Schluss Abschied von Sebastian? Was steht im Brief von Sesemann an den Almöhi?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-32",
        "title": "Frage 32",
        "passageLabel": "Leitfrage 32",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 32,
        "context": "Wie lebt sich Heidi wieder ein? Wie verlaufen die Wiedersehen? Welche Bilanz des Frankfurt-Aufenthalt wird gezogen?",
        "signalWords": [
          "Heidi",
          "Frankfurt"
        ],
        "relatedTheoryIds": [
          "religion",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie lebt sich Heidi wieder ein? Wie verlaufen die Wiedersehen? Welche Bilanz des Frankfurt-Aufenthalt wird gezogen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-33",
        "title": "Frage 33",
        "passageLabel": "Leitfrage 33",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 33,
        "context": "Kommentieren Sie das Gespräch von Almöhi mit dem Pfarrer! Was folgt daraus?",
        "signalWords": [
          "Almöhi",
          "Pfarrer"
        ],
        "relatedTheoryIds": [
          "religion",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Kommentieren Sie das Gespräch von Almöhi mit dem Pfarrer! Was folgt daraus?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-34",
        "title": "Frage 34",
        "passageLabel": "Leitfrage 34",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 34,
        "context": "Welchen Schicksalsschlag hat der Doktor in der Zwischenzeit erlebt?",
        "signalWords": [
          "Doktor"
        ],
        "relatedTheoryIds": [
          "religion",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Welchen Schicksalsschlag hat der Doktor in der Zwischenzeit erlebt?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-35",
        "title": "Frage 35",
        "passageLabel": "Leitfrage 35",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 35,
        "context": "Wie geht es Klara? Warum kann sie die versprochene Schweizreise nicht antreten?",
        "signalWords": [
          "Klara"
        ],
        "relatedTheoryIds": [
          "religion",
          "koerper-gesundheit"
        ],
        "prompts": [
          "Wie geht es Klara? Warum kann sie die versprochene Schweizreise nicht antreten?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-08",
    "title": "Schule, Peter und Klaras Reise",
    "summary": "Lesenlernen und Besuchsplanung verbinden Pädagogik mit Eifersucht.",
    "entries": [
      {
        "id": "frage-36",
        "title": "Frage 36",
        "passageLabel": "Leitfrage 36",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 36,
        "context": "Wie reagieren Klara und Sebastian auf die Reise des Doktors? Wie versucht Fräulein Rottenmeier Klaras Kontaktaufnahme zu behindern?",
        "signalWords": [
          "Rottenmeier",
          "Klara",
          "Doktor",
          "Sebastian"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Wie reagieren Klara und Sebastian auf die Reise des Doktors? Wie versucht Fräulein Rottenmeier Klaras Kontaktaufnahme zu behindern?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-37",
        "title": "Frage 37",
        "passageLabel": "Leitfrage 37",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 37,
        "context": "Beschreiben Sie das Wiedersehen mit dem Doktor und die Beziehung zu Heidi! Interpretieren Sie die Geschenke von Klara und der Grossmama!",
        "signalWords": [
          "Heidi",
          "Klara",
          "Doktor"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Beschreiben Sie das Wiedersehen mit dem Doktor und die Beziehung zu Heidi! Interpretieren Sie die Geschenke von Klara und der Grossmama!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-38",
        "title": "Frage 38",
        "passageLabel": "Leitfrage 38",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 38,
        "context": "Wie schafft es Heidi, den Doktor seine Trauer etwas vergessen zu lassen? Interpretieren Sie das Gedicht und dessen religiöses Programm! Wie halten sie Geissenpeter bei Laune?",
        "signalWords": [
          "Heidi",
          "Geissenpeter",
          "Doktor",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Wie schafft es Heidi, den Doktor seine Trauer etwas vergessen zu lassen? Interpretieren Sie das Gedicht und dessen religiöses Programm! Wie halten sie Geissenpeter bei Laune?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-39",
        "title": "Frage 39",
        "passageLabel": "Leitfrage 39",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 39,
        "context": "Wie nehmen der Doktor und Heidi Abschied? Interpretieren Sie die Emotionen!",
        "signalWords": [
          "Heidi",
          "Doktor"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Wie nehmen der Doktor und Heidi Abschied? Interpretieren Sie die Emotionen!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-40",
        "title": "Frage 40",
        "passageLabel": "Leitfrage 40",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 40,
        "context": "Inwiefern löst der Almöhi im Winter sein Versprechen ein? Wo wohnt er mit Heidi? Wie verläuft ihre Schulkarriere? Welchen Eindruck übt das auf Geissenpeter aus?",
        "signalWords": [
          "Heidi",
          "Almöhi",
          "Geissenpeter",
          "Peter"
        ],
        "relatedTheoryIds": [
          "natur-paedagogik",
          "figuren-beziehungen"
        ],
        "prompts": [
          "Inwiefern löst der Almöhi im Winter sein Versprechen ein? Wo wohnt er mit Heidi? Wie verläuft ihre Schulkarriere? Welchen Eindruck übt das auf Geissenpeter aus?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-09",
    "title": "Klara auf der Alp",
    "summary": "Klaras Aufenthalt macht Pflege, Behinderung und Fortschritt verhandelbar.",
    "entries": [
      {
        "id": "frage-41",
        "title": "Frage 41",
        "passageLabel": "Leitfrage 41",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 41,
        "context": "Wie bringt Heidi Peter das Lesen bei? Welches pädagogische Konzept verbirgt sich dahinter? Wie wirksam ist diese Methode?",
        "signalWords": [
          "Heidi",
          "Peter"
        ],
        "relatedTheoryIds": [
          "koerper-gesundheit",
          "stadt-land"
        ],
        "prompts": [
          "Wie bringt Heidi Peter das Lesen bei? Welches pädagogische Konzept verbirgt sich dahinter? Wie wirksam ist diese Methode?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-42",
        "title": "Frage 42",
        "passageLabel": "Leitfrage 42",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 42,
        "context": "Interpretieren Sie Klaras Brief an Heidi! Wie soll die Reise geplant werden? Wie soll Klara auf die Alp vorbereitet werden?",
        "signalWords": [
          "Heidi",
          "Klara"
        ],
        "relatedTheoryIds": [
          "koerper-gesundheit",
          "stadt-land"
        ],
        "prompts": [
          "Interpretieren Sie Klaras Brief an Heidi! Wie soll die Reise geplant werden? Wie soll Klara auf die Alp vorbereitet werden?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-43",
        "title": "Frage 43",
        "passageLabel": "Leitfrage 43",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 43,
        "context": "Erklären Sie Geissenpeters unwirsche Reaktion auf die Ankunft der Gäste aus Frankfurt! Inwiefern fühlt er sich von den fremden Gästen bedroht?",
        "signalWords": [
          "Geissenpeter",
          "Frankfurt",
          "Peter"
        ],
        "relatedTheoryIds": [
          "koerper-gesundheit",
          "stadt-land"
        ],
        "prompts": [
          "Erklären Sie Geissenpeters unwirsche Reaktion auf die Ankunft der Gäste aus Frankfurt! Inwiefern fühlt er sich von den fremden Gästen bedroht?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-44",
        "title": "Frage 44",
        "passageLabel": "Leitfrage 44",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 44,
        "context": "Schildern Sie die Ankunft der Sesemanns! Erklären Sie, woher der Almöhi weiss, wie man kranke Menschen pflegt! Was hat dies mit seiner Vergangenheit zu tun? Welche Argumentation schiebt er vor?",
        "signalWords": [
          "Almöhi",
          "Sesemann"
        ],
        "relatedTheoryIds": [
          "koerper-gesundheit",
          "stadt-land"
        ],
        "prompts": [
          "Schildern Sie die Ankunft der Sesemanns! Erklären Sie, woher der Almöhi weiss, wie man kranke Menschen pflegt! Was hat dies mit seiner Vergangenheit zu tun? Welche Argumentation schiebt er vor?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-45",
        "title": "Frage 45",
        "passageLabel": "Leitfrage 45",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 45,
        "context": "Wie reflektiert Klara ihre körperliche Behinderung? Wie kommt es dazu, dass Klara auf der Alp zu übernachten? Wie verbringen die beiden Freundinnen die Zeit auf der Alp? Wie kommunizieren die beiden mit der Grossmutter, welche nach Bad Ragaz zurückgekehrt ist? Welche Fortschritte macht Klara?",
        "signalWords": [
          "Grossmutter",
          "Klara"
        ],
        "relatedTheoryIds": [
          "koerper-gesundheit",
          "stadt-land"
        ],
        "prompts": [
          "Wie reflektiert Klara ihre körperliche Behinderung? Wie kommt es dazu, dass Klara auf der Alp zu übernachten? Wie verbringen die beiden Freundinnen die Zeit auf der Alp? Wie kommunizieren die beiden mit der Grossmutter, welche nach Bad Ragaz zurückgekehrt ist? Welche Fortschritte macht Klara?"
        ],
        "focusTasks": []
      }
    ]
  },
  {
    "id": "modul-10",
    "title": "Schuld, Wiedergutmachung und Schluss",
    "summary": "Peters Schuld wird gestanden, umgedeutet und sozial beigelegt.",
    "entries": [
      {
        "id": "frage-46",
        "title": "Frage 46",
        "passageLabel": "Leitfrage 46",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 46,
        "context": "Erläutern Sie Peters merkwürdiges Verhalten! Erklären Sie, warum er Klaras Rollstuhl den Berg hinuntergestossen hat!",
        "signalWords": [
          "Klara",
          "Peter"
        ],
        "relatedTheoryIds": [
          "schuld-ordnung",
          "religion"
        ],
        "prompts": [
          "Erläutern Sie Peters merkwürdiges Verhalten! Erklären Sie, warum er Klaras Rollstuhl den Berg hinuntergestossen hat!"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-47",
        "title": "Frage 47",
        "passageLabel": "Leitfrage 47",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 47,
        "context": "Wie lernt Klara in dieser misslichen Situation laufen?",
        "signalWords": [
          "Klara"
        ],
        "relatedTheoryIds": [
          "schuld-ordnung",
          "religion"
        ],
        "prompts": [
          "Wie lernt Klara in dieser misslichen Situation laufen?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-48",
        "title": "Frage 48",
        "passageLabel": "Leitfrage 48",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 48,
        "context": "Wie nehmen die Leute im Dörfli die Zerstörungsaktion wahr? Wie reagiert Peter darauf? Kommentieren Sie die Begegnung von Peter mit Herrn Sesemann?",
        "signalWords": [
          "Sesemann",
          "Peter"
        ],
        "relatedTheoryIds": [
          "schuld-ordnung",
          "religion"
        ],
        "prompts": [
          "Wie nehmen die Leute im Dörfli die Zerstörungsaktion wahr? Wie reagiert Peter darauf? Kommentieren Sie die Begegnung von Peter mit Herrn Sesemann?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-49",
        "title": "Frage 49",
        "passageLabel": "Leitfrage 49",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 49,
        "context": "Wie kommt es zum Geständnis? Wie wird die Sache beigelegt? Wie wird Peters Untat positiv interpretiert?",
        "signalWords": [
          "Peter"
        ],
        "relatedTheoryIds": [
          "schuld-ordnung",
          "religion"
        ],
        "prompts": [
          "Wie kommt es zum Geständnis? Wie wird die Sache beigelegt? Wie wird Peters Untat positiv interpretiert?"
        ],
        "focusTasks": []
      },
      {
        "id": "frage-50",
        "title": "Frage 50",
        "passageLabel": "Leitfrage 50",
        "pageHint": "Volltext im linken Lesefenster",
        "pageNumber": 50,
        "context": "Warum kriegt Peter am Ende noch Geld von Sesemann? Welche Regelung trifft dieser? Warum lehnt Almöhi eine Entschädigung ab? Was will er stattdessen für Heidi? Was wünscht sich Heidi? Kommentieren Sie das Gespräch zwischen den beiden Grossmüttern!",
        "signalWords": [
          "Heidi",
          "Almöhi",
          "Sesemann",
          "Peter"
        ],
        "relatedTheoryIds": [
          "schuld-ordnung",
          "religion"
        ],
        "prompts": [
          "Warum kriegt Peter am Ende noch Geld von Sesemann? Welche Regelung trifft dieser? Warum lehnt Almöhi eine Entschädigung ab? Was will er stattdessen für Heidi? Was wünscht sich Heidi? Kommentieren Sie das Gespräch zwischen den beiden Grossmüttern!"
        ],
        "focusTasks": []
      }
    ]
  }
];

export const readerModules = rawReaderModules.map((module) => ({ ...module, entries: module.entries.map((entry) => ({ ...entry, focusTasks: entry.prompts.map((prompt) => buildTask(prompt, { context: entry.context, signalWords: entry.signalWords, relatedTheoryIds: entry.relatedTheoryIds, kind: "focus", taskTitle: entry.title })) })) }));

export const lessonSets = [
  {
    "id": "lektion-01",
    "title": "Ankunft auf der Alp",
    "summary": "Heidi wird vom sozialen Problemfall zur Figur der alpinen Neuordnung.",
    "moduleIds": [
      "modul-01"
    ],
    "entryIds": [
      "frage-01",
      "frage-02",
      "frage-03",
      "frage-04",
      "frage-05"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "archiv-biografie",
      "natur-paedagogik"
    ],
    "resourceAssignments": [
      {
        "resourceId": "archiv-biografie",
        "title": "Material: archiv biografie",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "natur-paedagogik",
        "title": "Material: natur paedagogik",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-02",
    "title": "Großvater, Peter und Natur",
    "summary": "Natur, Tiere und Schule zeigen konkurrierende Erziehungsmodelle.",
    "moduleIds": [
      "modul-02"
    ],
    "entryIds": [
      "frage-06",
      "frage-07",
      "frage-08",
      "frage-09",
      "frage-10"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "natur-paedagogik",
      "figuren-beziehungen"
    ],
    "resourceAssignments": [
      {
        "resourceId": "natur-paedagogik",
        "title": "Material: natur paedagogik",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "figuren-beziehungen",
        "title": "Material: figuren beziehungen",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-03",
    "title": "Großmutter, Pfarrer und Weggang",
    "summary": "Religion, Fürsorge und sozialer Druck treiben den Ortswechsel an.",
    "moduleIds": [
      "modul-03"
    ],
    "entryIds": [
      "frage-11",
      "frage-12",
      "frage-13",
      "frage-14",
      "frage-15"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "religion",
      "archiv-biografie"
    ],
    "resourceAssignments": [
      {
        "resourceId": "religion",
        "title": "Material: religion",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "archiv-biografie",
        "title": "Material: archiv biografie",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-04",
    "title": "Frankfurt als Gegenwelt",
    "summary": "Frankfurt macht Hausordnung, Stand und Fremdheit sichtbar.",
    "moduleIds": [
      "modul-04"
    ],
    "entryIds": [
      "frage-16",
      "frage-17",
      "frage-18",
      "frage-19",
      "frage-20"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "stadt-land",
      "koerper-gesundheit"
    ],
    "resourceAssignments": [
      {
        "resourceId": "stadt-land",
        "title": "Material: stadt land",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "koerper-gesundheit",
        "title": "Material: koerper gesundheit",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-05",
    "title": "Katzen, Unterricht und Missverstehen",
    "summary": "Komik und Konflikt zeigen, wie sehr Heidi missverstanden wird.",
    "moduleIds": [
      "modul-05"
    ],
    "entryIds": [
      "frage-21",
      "frage-22",
      "frage-23",
      "frage-24",
      "frage-25"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "stadt-land",
      "sprache-erzaehlen"
    ],
    "resourceAssignments": [
      {
        "resourceId": "stadt-land",
        "title": "Material: stadt land",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "sprache-erzaehlen",
        "title": "Material: sprache erzaehlen",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-06",
    "title": "Heimweh, Spuk und Heimkehr",
    "summary": "Heimweh wird körperlich, räumlich und medizinisch lesbar.",
    "moduleIds": [
      "modul-06"
    ],
    "entryIds": [
      "frage-26",
      "frage-27",
      "frage-28",
      "frage-29",
      "frage-30"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "stadt-land",
      "koerper-gesundheit"
    ],
    "resourceAssignments": [
      {
        "resourceId": "stadt-land",
        "title": "Material: stadt land",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "koerper-gesundheit",
        "title": "Material: koerper gesundheit",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-07",
    "title": "Der Doktor und das gelernte Heidi",
    "summary": "Heidi wendet Gelerntes auf Trauer, Trost und Beziehung an.",
    "moduleIds": [
      "modul-07"
    ],
    "entryIds": [
      "frage-31",
      "frage-32",
      "frage-33",
      "frage-34",
      "frage-35"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "religion",
      "koerper-gesundheit"
    ],
    "resourceAssignments": [
      {
        "resourceId": "religion",
        "title": "Material: religion",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "koerper-gesundheit",
        "title": "Material: koerper gesundheit",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-08",
    "title": "Schule, Peter und Klaras Reise",
    "summary": "Lesenlernen und Besuchsplanung verbinden Pädagogik mit Eifersucht.",
    "moduleIds": [
      "modul-08"
    ],
    "entryIds": [
      "frage-36",
      "frage-37",
      "frage-38",
      "frage-39",
      "frage-40"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "natur-paedagogik",
      "figuren-beziehungen"
    ],
    "resourceAssignments": [
      {
        "resourceId": "natur-paedagogik",
        "title": "Material: natur paedagogik",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "figuren-beziehungen",
        "title": "Material: figuren beziehungen",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-09",
    "title": "Klara auf der Alp",
    "summary": "Klaras Aufenthalt macht Pflege, Behinderung und Fortschritt verhandelbar.",
    "moduleIds": [
      "modul-09"
    ],
    "entryIds": [
      "frage-41",
      "frage-42",
      "frage-43",
      "frage-44",
      "frage-45"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "koerper-gesundheit",
      "film-alptraum",
      "ki-trailer"
    ],
    "resourceAssignments": [
      {
        "resourceId": "koerper-gesundheit",
        "title": "Material: koerper gesundheit",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "film-alptraum",
        "title": "Material: film alptraum",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      }
    ]
  },
  {
    "id": "lektion-10",
    "title": "Schuld, Wiedergutmachung und Schluss",
    "summary": "Peters Schuld wird gestanden, umgedeutet und sozial beigelegt; Medienvergleiche prüfen, wie stabil oder verformbar die Heidi-Ikone danach geworden ist.",
    "moduleIds": [
      "modul-10"
    ],
    "entryIds": [
      "frage-46",
      "frage-47",
      "frage-48",
      "frage-49",
      "frage-50"
    ],
    "reviewFocus": "Textnahe Antwort mit Beobachtung, Beleg und Deutung; keine reine Inhaltsnacherzählung.",
    "sebPrompt": "Bearbeite die Leitfragen dieser Lektion präzise am Volltext und nutze mindestens eine Leselinse.",
    "recommendedTheoryIds": [
      "schuld-ordnung",
      "bilder-popularisierung",
      "studienkompass",
      "ki-trailer"
    ],
    "resourceAssignments": [
      {
        "resourceId": "schuld-ordnung",
        "title": "Material: schuld ordnung",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "bilder-popularisierung",
        "title": "Material: bilder popularisierung",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "studienkompass",
        "title": "Material: studienkompass",
        "summary": "Nutze diese Ressource als gezielte Leselinse zur aktuellen Leitfrage.",
        "task": "Formuliere eine Beobachtung am Roman und führe sie mit der Ressource zu einer Deutung weiter.",
        "questionTasks": []
      },
      {
        "resourceId": "ki-trailer",
        "title": "Medienvergleich: KI-Horror-Trailer als produktive Störung",
        "summary": "Der Trailer wird gegen den Schluss der Einheit eingesetzt, um Heidi als globale, manipulierbare Bildikone zu untersuchen.",
        "task": "Wähle eine Romanstelle aus dem Schluss oder aus der Alp-Handlung und vergleiche sie mit dem KI-Trailer: Welche Bedeutungsverschiebung entsteht durch Horrorbild, Musik, Schnitt und KI-Ästhetik?",
        "questions": [
          "Welche Heidi-Erwartung nutzt der Trailer aus?",
          "Welche Bild- oder Tonentscheidung verändert die Romanwirkung am stärksten?",
          "Was lernst du dadurch über Popularisierung und Verfremdung?"
        ]
      }
    ]
  }
];

export const starterPrompt = {
  title: "Leseeinstieg",
  text: "Wähle eine Leitfrage, lies die passende Passage im Volltext und antworte mit Beobachtung, Beleg und Deutung.",
  items: [
    "Lies zuerst die Leitfrage und markiere die Figuren, Orte oder Motive, die darin vorkommen.",
    "Suche im Volltext eine genaue Formulierung, die deine Antwort stützt.",
    "Formuliere nicht nur Inhalt, sondern eine Deutung: Was zeigt oder bewirkt die Stelle?"
  ]
};
export const pdfSource = pdfPath;
export const coverImage = coverImg;
export const authorImage = authorImg;
