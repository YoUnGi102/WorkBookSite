// Podčiarkovník označuje chýbajúce písmeno alebo slovo. Znak | označuje chýbajúcu medzeru.
const words = {
  deleteLetters: ["malina", "kvetináč", "jahoda", "ceruzka", "knižnica", "lietadlo", "slnečnica", "chobotnica"],
  fill: [
    { example: "ja_oda", answer: "jahoda" },
    { example: "ceru_ka", answer: "ceruzka" },
    { example: "kni_ka", answer: "knižka" },
    { example: "jabl_o", answer: "jablko" },
    { example: "kolobe_ka", answer: "kolobežka" },
    { example: "slnie_ko", answer: "slniečko" },
  ],
  accents: [
    { example: "tr[a]va", answer: "tráva" },
    { example: "ma[c]ka", answer: "mačka" },
    { example: "[s]kola", answer: "škola" },
    { example: "l[u]ka", answer: "lúka" },
    { example: "n[o]ž", answer: "nôž" },
    { example: "k[o]ň", answer: "kôň" },
    { example: "[l]ad", answer: "ľad" },
    { example: "pr[a]zdniny", answer: "prázdniny" },
    { example: "ko[s]ík", answer: "košík" },
  ],
  changeCase: ["dáždnik", "Jablko", "čerešňa", "Líška", "žirafa", "Škola"],
};

const sentences = {
  fill: [
    { example: "Odtrhla som z jablone červené _. (jablko / kameň)", answer: "Odtrhla som z jablone červené jablko." },
    { example: "V zime padá z oblohy _. (sneh / piesok)", answer: "V zime padá z oblohy sneh." },
    { example: "Ryba pláva vo _. (vode / vzduchu)", answer: "Ryba pláva vo vode." },
    { example: "Ráno|vstávam skoro.", answer: "Ráno vstávam skoro." },
    { example: "Na|stole leží kniha.", answer: "Na stole leží kniha." },
    { example: "Vonku svieti|slnko.", answer: "Vonku svieti slnko." },
  ],
  punctuation: [
    { example: "Kde bývaš", answer: "?" },
    { example: "Koľko máš rokov", answer: "?" },
    { example: "Pozor, horí", answer: "!" },
    { example: "Jaj, to bolí", answer: "!" },
    { example: "Na dvore rastie strom", answer: "." },
    { example: "Včera sme boli v kine", answer: "." },
  ],
  changeCase: [
    { example: "[r]áno vstávam skoro.", answer: "Ráno vstávam skoro.", target: "veľkým" },
    { example: "[v] záhrade rastú kvety.", answer: "V záhrade rastú kvety.", target: "veľkým" },
    { example: "Na oblohe svieti [S]lnko.", answer: "Na oblohe svieti slnko.", target: "malým" },
    { example: "V lese býva [L]íška.", answer: "V lese býva líška.", target: "malým" },
  ],
};

// Alternatívny text vymenúva predmety v poradí zľava doprava.
const countingImages = [
  {
    file: "obrazky/jablka.svg",
    items: "jabĺk",
    alt: "Jablko, hruška, jablko, jablko, hruška, jablko.",
    answer: "4",
  },
  {
    file: "obrazky/hviezdy.svg",
    items: "hviezd",
    alt: "Hviezda, mesiac, hviezda, hviezda, hviezda, mesiac, hviezda.",
    answer: "5",
  },
  {
    file: "obrazky/listy.svg",
    items: "listov",
    alt: "Žaluď, list, list, žaluď, list, list, list, list.",
    answer: "6",
  },
];

const specialCharacters = ["@", "&", "*", "#", "+", "%", "/", "="];

// Názvy klávesov v zozname keys zodpovedajú udalosti keydown.
const keyboardQuiz = [
  {
    prompt: "Ktorým tlačidlom urobíme medzeru medzi slovami?",
    keys: [" "],
    answer: "Medzerník",
  },
  {
    prompt: "Ktorým tlačidlom vymažeme nesprávne napísané písmeno?",
    keys: ["Backspace", "Delete"],
    answer: "Backspace alebo Delete",
  },
  {
    prompt: "Ktorým tlačidlom začneme nový riadok?",
    keys: ["Enter"],
    answer: "Enter",
  },
  {
    prompt: "Ktorým tlačidlom píšeme veľké písmená?",
    keys: ["Shift", "CapsLock"],
    answer: "Shift alebo Caps Lock",
  },
  {
    prompt: "Ktoré tlačidlá nám umožňujú pohybovať sa hore, dole, doľava a doprava?",
    keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
    answer: "Šípky hore, dole, doľava a doprava (stačí stlačiť jednu)",
  },
];
