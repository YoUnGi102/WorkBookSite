const setupForm = document.querySelector("#setup-form");
const seedInput = document.querySelector("#seed");
const countInput = document.querySelector("#count");
const setupError = document.querySelector("#setup-error");
const worksheet = document.querySelector(".worksheet");
const questionList = document.querySelector("#question-list");
const questionTemplate = document.querySelector("#question-template");
const progress = document.querySelector("#progress-text");
const answersForm = document.querySelector("#answers-form");
const results = document.querySelector("#results");
const resultsHint = results.textContent;
let questionRows = [];
let checked = false;

// Rovnaká dvojica čísel vždy spustí rovnakú postupnosť náhodných hodnôt.
function createRandom(seed, count) {
  let state = 2166136261;
  for (const character of seed + "/" + count) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }

  return function () {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffled(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const otherIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
  }
  return copy;
}

function deleteLetters(word, random) {
  // Ch, dz a dž sa v slovenčine počítajú ako jedno písmeno.
  const letters = word.match(/dž|dz|ch|./giu);
  const amount = 1 + Math.floor(random() * Math.min(3, letters.length - 1));
  const fromStart = random() < 0.5;
  const side = fromStart ? "zo začiatku" : "z konca";
  const quantity = amount === 1 ? "1 písmeno" : amount + " písmená";
  const expectedKey = fromStart ? "Delete" : "Backspace";

  return {
    type: "Vymazávanie",
    prompt: "Vymaž " + quantity + " " + side + " slova klávesom " + expectedKey + ".",
    example: word,
    initialValue: word,
    expectedKey,
    answer: (fromStart ? letters.slice(amount) : letters.slice(0, -amount)).join(""),
  };
}

function fillBlank(item) {
  let prompt = "Doplň chýbajúce písmeno a prepíš celé slovo.";
  if (item.example.includes("|")) {
    prompt = "Na miesto znaku | vlož medzeru a prepíš celú vetu.";
  } else if (item.example.includes(" ")) {
    prompt = "Vyber správne slovo zo zátvorky a prepíš doplnenú vetu.";
  }
  return { ...item, type: "Doplňovanie", prompt };
}

function changeWordCase(word) {
  const first = word[0];
  const isUppercase = first === first.toUpperCase();
  const target = isUppercase ? "malým" : "veľkým";
  const changed = isUppercase ? first.toLowerCase() : first.toUpperCase();
  return {
    type: "Veľké a malé písmená",
    prompt: "Prepíš slovo a iba jeho prvé písmeno napíš " + target + ".",
    example: word,
    answer: changed + word.slice(1),
  };
}

function generateQuestions(seed, count) {
  const random = createRandom(seed, count);
  const groups = [
    words.deleteLetters.map(word => deleteLetters(word, random)),
    [...words.fill, ...sentences.fill].map(fillBlank),
    words.accents.map(item => ({
      ...item,
      type: "Diakritika",
      prompt: "Pridaj k písmenu v zátvorke správne znamienko a prepíš celé slovo.",
    })),
    sentences.punctuation.map(item => ({
      ...item,
      type: "Interpunkcia",
      prompt: "Napíš iba znamienko na konci vety. Vyber z možností . ? !",
    })),
    countingImages.map(item => ({
      ...item,
      type: "Počítanie",
      prompt: "Koľko " + item.items + " je na obrázku? Odpovedz číslom.",
    })),
    [
      ...words.changeCase.map(changeWordCase),
      ...sentences.changeCase.map(item => ({
        ...item,
        type: "Veľké a malé písmená",
        prompt: "Prepíš celú vetu. Písmeno v zátvorke napíš " + item.target + ".",
      })),
    ],
    keyboardQuiz.map(item => ({
      ...item,
      type: "Malý kvíz o klávesnici",
    })),
  ];

  // Z každej skupiny vyberieme jednu otázku, kým sa nenaplní zadaný počet.
  const questions = [];
  const groupOrder = groups.map((group, index) => index);
  const pools = groups.map(group => shuffled(group, random));
  const hasBonus = count > groups.length;
  const regularCount = hasBonus ? count - 1 : count;

  while (questions.length < regularCount) {
    for (const index of shuffled(groupOrder, random)) {
      if (questions.length === regularCount) break;
      if (pools[index].length === 0) pools[index] = shuffled(groups[index], random);
      questions.push(pools[index].pop());
    }
  }

  if (hasBonus) {
    const character = specialCharacters[Math.floor(random() * specialCharacters.length)];
    questions.push({
      type: "Bonus · Špeciálny znak",
      prompt: "Napíš tento špeciálny znak.",
      example: character,
      answer: character,
    });
  }
  return questions;
}

function prepareDeletionInput(input, question, hint, resetButton) {
  const deletion = {
    initialValue: question.initialValue,
    expectedKey: question.expectedKey,
    previousValue: question.initialValue,
    keyPressed: false,
    usedCorrectKey: false,
  };
  const instruction = "Použi kláves " + deletion.expectedKey + ". Slovo môžeš obnoviť a skúsiť znova.";
  const expectedInputType = deletion.expectedKey === "Delete" ? "deleteContentForward" : "deleteContentBackward";
  input.value = deletion.initialValue;
  hint.textContent = instruction;
  hint.hidden = false;
  resetButton.hidden = false;

  input.addEventListener("focus", () => {
    if (input.value !== deletion.initialValue) return;
    const position = deletion.expectedKey === "Delete" ? 0 : input.value.length;
    input.setSelectionRange(position, position);
  });

  input.addEventListener("keydown", event => {
    deletion.keyPressed = event.key === deletion.expectedKey
      && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing;
    if ((event.key === "Delete" || event.key === "Backspace") && !deletion.keyPressed) {
      event.preventDefault();
      hint.textContent = "Pri tejto úlohe použi kláves " + deletion.expectedKey + ".";
    }
  });

  // Vloženie textu, vystrihnutie ani mazanie bez požadovaného klávesu sa nepočíta.
  input.addEventListener("beforeinput", event => {
    if (deletion.keyPressed && event.inputType === expectedInputType) return;
    event.preventDefault();
    deletion.keyPressed = false;
    hint.textContent = instruction;
  });

  input.addEventListener("input", () => {
    if (deletion.keyPressed && input.value.length < deletion.previousValue.length) {
      deletion.previousValue = input.value;
      deletion.usedCorrectKey = true;
      hint.textContent = instruction;
    } else {
      // Záloha pre prehliadače, ktoré nedokážu zrušiť udalosť beforeinput.
      input.value = deletion.previousValue;
      hint.textContent = instruction;
    }
    deletion.keyPressed = false;
  });

  input.addEventListener("keyup", () => { deletion.keyPressed = false; });
  input.addEventListener("blur", () => { deletion.keyPressed = false; });
  resetButton.addEventListener("click", () => {
    input.value = deletion.initialValue;
    deletion.previousValue = deletion.initialValue;
    deletion.keyPressed = false;
    deletion.usedCorrectKey = false;
    hint.textContent = instruction;
    updateAnswers();
    input.focus();
  });
  return deletion;
}

function prepareKeyboardQuiz(input, question, hint) {
  const quiz = { expectedKey: question.quizKey, pressedKey: null };
  const keyNames = {
    " ": "Medzerník",
    Backspace: "Backspace",
    Delete: "Delete",
    Enter: "Enter",
    Shift: "Shift",
    CapsLock: "Caps Lock",
    ArrowUp: "Šípka hore",
    ArrowDown: "Šípka dole",
    ArrowLeft: "Šípka doľava",
    ArrowRight: "Šípka doprava",
    Escape: "Escape",
    Unidentified: "Nerozpoznaný kláves",
  };
  input.readOnly = true;
  input.placeholder = "Klikni sem a stlač kláves";
  hint.textContent = "Odpovedz stlačením klávesu v tomto poli. Na ďalšie pole sa presuň klávesom Tab.";
  hint.hidden = false;

  input.addEventListener("keydown", event => {
    // Tab a klávesové skratky ostávajú dostupné na pohyb a ovládanie prehliadača.
    if (event.key === "Tab" || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    event.preventDefault();
    quiz.pressedKey = event.key;
    input.value = keyNames[event.key] || event.key;
    updateAnswers();
  });
  return quiz;
}

function renderQuestions(questions) {
  questionList.replaceChildren();
  questionRows = questions.map((question, index) => {
    const number = index + 1;
    const row = questionTemplate.content.firstElementChild.cloneNode(true);
    const prompt = row.querySelector(".question-prompt");
    const example = row.querySelector(".question-example");
    const picture = row.querySelector(".count-picture");
    const input = row.querySelector(".answer");
    const hint = row.querySelector(".key-hint");
    const resetButton = row.querySelector(".reset-word");
    const label = row.querySelector(".answer-label");
    const feedback = row.querySelector(".feedback");
    const descriptions = ["otazka-" + number];

    row.querySelector(".question-number").textContent = number;
    row.querySelector(".question-type").textContent = question.type;
    prompt.id = descriptions[0];
    prompt.textContent = question.prompt;
    if (question.example) {
      example.id = "zadanie-" + number;
      example.textContent = question.example;
      example.hidden = false;
      descriptions.push(example.id);
    }
    if (question.file) {
      picture.id = "obrazok-" + number;
      picture.src = question.file;
      picture.alt = question.alt;
      picture.hidden = false;
      descriptions.push(picture.id);
      input.inputMode = "numeric";
    }

    input.id = "odpoved-" + number;
    label.htmlFor = input.id;
    label.textContent = "Odpoveď na otázku " + number;
    feedback.id = "vysledok-" + number;
    descriptions.push(feedback.id);
    let deletion = null;
    let quiz = null;
    if (question.expectedKey || question.quizKey) {
      hint.id = "klaves-" + number;
      descriptions.push(hint.id);
    }
    if (question.expectedKey) {
      deletion = prepareDeletionInput(input, question, hint, resetButton);
    }
    if (question.quizKey) quiz = prepareKeyboardQuiz(input, question, hint);
    input.setAttribute("aria-describedby", descriptions.join(" "));
    questionList.append(row);
    return { row, input, feedback, answer: question.answer, deletion, quiz };
  });
  checked = false;
  results.textContent = resultsHint;
  updateProgress();
  worksheet.hidden = false;
}

function updateProgress() {
  const filled = questionRows.filter(({ input, deletion }) => {
    if (deletion) return input.value !== deletion.initialValue;
    return input.value.trim() !== "";
  }).length;
  progress.textContent = "Vyplnené " + filled + " z " + questionRows.length;
}

setupForm.addEventListener("submit", event => {
  event.preventDefault();
  const seed = seedInput.value.trim();
  const count = countInput.valueAsNumber;
  setupError.textContent = "";
  seedInput.removeAttribute("aria-invalid");
  countInput.removeAttribute("aria-invalid");

  if (!/^[0-9]+$/.test(seed)) {
    setupError.textContent = "Ako číslo zadania zadaj celé nezáporné číslo.";
    seedInput.setAttribute("aria-invalid", "true");
    seedInput.focus();
    return;
  }
  if (!Number.isInteger(count) || count < 1 || count > 30) {
    setupError.textContent = "Počet otázok musí byť celé číslo od 1 do 30.";
    countInput.setAttribute("aria-invalid", "true");
    countInput.focus();
    return;
  }

  const normalizedSeed = seed.replace(/^0+(?=[0-9])/, "");
  renderQuestions(generateQuestions(normalizedSeed, count));
  document.querySelector("#setup-status").textContent = "Pracovný list je pripravený.";
  document.querySelector("#worksheet-title").focus();
});

function updateAnswers() {
  updateProgress();
  if (!checked) return;

  // Výsledky zodpovedajú odpovediam v okamihu poslednej kontroly.
  for (const { row, input, feedback } of questionRows) {
    delete row.dataset.result;
    input.removeAttribute("aria-invalid");
    feedback.hidden = true;
    feedback.textContent = "";
  }
  checked = false;
  results.textContent = "Odpovede sa zmenili. Skontroluj ich znova.";
}

answersForm.addEventListener("input", updateAnswers);

answersForm.addEventListener("submit", event => {
  event.preventDefault();
  let correctCount = 0;
  for (const { row, input, feedback, answer, deletion, quiz } of questionRows) {
    const response = input.value.trim().normalize("NFC");
    const correctKeyUsed = !deletion || (deletion.usedCorrectKey && input.value === deletion.previousValue);
    const correct = quiz
      ? quiz.pressedKey === quiz.expectedKey
      : response === answer.normalize("NFC") && correctKeyUsed;
    row.dataset.result = correct ? "correct" : "incorrect";
    input.setAttribute("aria-invalid", String(!correct));
    if (correct) {
      correctCount++;
      feedback.textContent = "✓ Správne";
    } else {
      const untouched = deletion && input.value === deletion.initialValue;
      const status = response && !untouched ? "Nesprávne." : "Bez odpovede.";
      feedback.textContent = status + " Správna odpoveď je „" + answer + "“.";
      if (deletion) feedback.textContent += " Na mazanie použi kláves " + deletion.expectedKey + ".";
    }
    feedback.hidden = false;
  }
  checked = true;
  results.textContent = "Správne odpovede " + correctCount + " z " + questionRows.length + ".";
});

// Po otvorení stránky sa zobrazí ukážkový pracovný list.
renderQuestions(generateQuestions(seedInput.value, countInput.valueAsNumber));

const keyboardHelp = document.querySelector(".keyboard-help");

function closeKeyboardHelp() {
  keyboardHelp.open = false;
  keyboardHelp.querySelector("summary").focus();
}

document.querySelector("#close-keyboard-help").addEventListener("click", closeKeyboardHelp);
keyboardHelp.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeKeyboardHelp();
  }
});
