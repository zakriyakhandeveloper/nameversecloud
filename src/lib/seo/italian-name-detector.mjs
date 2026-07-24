import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(publicDir, 'data');

function readJson(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeName(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return String(raw)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const KNOWN_ITALIAN_NAMES = new Set([
  'leonardo', 'francesco', 'lorenzo', 'matteo', 'giovanni', 'alessandro',
  'luca', 'marco', 'antonio', 'giuseppe', 'andrea', 'davide', 'riccardo',
  'federico', 'simone', 'emanuele', 'pietro', 'giulio', 'alberto', 'stefano',
  'mattia', 'daniele', 'angelo', 'sergio', 'mauro', 'roberto', 'domenico',
  'claudio', 'cristiano', 'massimo', 'fabio', 'gabriele', 'luigi', 'paolo',
  'adriano', 'enrico', 'marcello', 'valerio', 'nicolò', 'tommaso', 'erasmo',
  'giosuè', 'cosimo', 'giacomo', 'bartolomeo', 'attilio', 'ettore', 'orfeo',
  'flavio', 'renato', 'amedeo', 'camillo', 'eugenio', 'ignazio', 'manzio',
  'raffaele', 'salvatore', 'vincenzo', 'silvio', 'ugo', 'arturo', 'nino',
  'carlo', 'aldo', 'gino', 'peppino', 'beppe', 'nello', 'tito', 'achille',
  'anacleto', 'anastasio', 'aroldo', 'aronne', 'battista', 'benedetto',
  'beniamino', 'bernardo', 'bonaventura', 'calogero', 'cesare', 'cirillo',
  'damiano', 'demetrio', 'deodato', 'dino', 'donato', 'elio', 'enzo',
  'ermanno', 'ernesto', 'eufemio', 'eustachio', 'ezio', 'felice',
  'ferdinando', 'ferruccio', 'fioravante', 'flaminio', 'fortunato', 'fulvio',
  'furio', 'gasparo', 'gaetano', 'gastone', 'gennaro', 'gerardo', 'gerolamo',
  'gervaso', 'gildo', 'giorgio', 'giordano', 'giosuè', 'giovanni', 'girolamo',
  'giuliano', 'giuseppe', 'graziano', 'gregorio', 'guido', 'ilario',
  'innocenzo', 'ivan', 'ladislao', 'lando', 'lelio', 'lino', 'ludovico',
  'manlio', 'manfredi', 'marino', 'mario', 'marzio', 'matteo', 'maurizio',
  'michele', 'mirko', 'modesto', 'moreno', 'napoleone', 'natalino', 'navarro',
  'nerone', 'nereo', 'nicola', 'nunzio', 'olindo', 'omer', 'orlando',
  'oscar', 'osvaldo', 'ottavio', 'paco', 'palmiro', 'pancrazio', 'pantaleone',
  'paride', 'pascasio', 'pasquale', 'patrizio', 'pellegrino', 'pericle',
  'pierangelo', 'piergiorgio', 'pierluigi', 'pierpaolo', 'pio', 'primiano',
  'prospero', 'quartino', 'quirino', 'raffaello', 'ramiro', 'remigio',
  'remo', 'rino', 'rodolfo', 'rolando', 'romano', 'romolo', 'rosario',
  'ruben', 'sabino', 'salvatore', 'samuele', 'sante', 'santo', 'saverio',
  'sebastiano', 'secondo', 'sesto', 'sisto', 'stanislao', 'tarquinio',
  'tazio', 'terenzio', 'tiburzio', 'tiziano', 'tolomeo', 'treboniano',
  'tristano', 'tullio', 'umberto', 'urbano', 'valentino', 'venanzio',
  'venerio', 'venturino', 'verginio', 'vespasiano', 'vittore', 'vittorio',
  'zaccaria', 'zenobio', 'zoroastro',
  'giulia', 'francesca', 'laura', 'sofia', 'giovanna', 'alessia', 'anna',
  'maria', 'elena', 'sara', 'chiara', 'federica', 'valentina', 'martina',
  'serena', 'beatrice', 'lucia', 'teresa', 'caterina', 'monica', 'paola',
  'simona', 'roberta', 'daniela', 'stefania', 'cristina', 'elisa',
  'samantha', 'ilaria', 'maura', 'patrizia', 'cinzia', 'loredana',
  'immacolata', 'assunta', 'concetta', 'pasqua', 'pellegrina', 'annunziata',
  'emma', 'ginevra', 'costanza', 'adelaide', 'carlotta', 'viola', 'rita',
  'orsola', 'prassede', 'agnese', 'benedetta', 'filomena', 'pierfrancesca',
  'pierangela', 'pierpaola', 'maddalena', 'lucrezia', 'camilla', 'flavia',
  'livia', 'claudia', 'giada', 'irene', 'delia', 'noemi', 'giuditta',
  'rachele', 'candida', 'purificazione', 'marianna', 'eugenia', 'lidia',
  'odetta', 'pina', 'totò', 'viviana', 'zena', 'zita', 'ninetta', 'filippa',
  'grazia', 'letizia', 'natalia', 'nicoletta', 'oriana', 'priscilla',
  'raffaella', 'rosaria', 'sabrina', 'sandra', 'serafina', 'silvana',
  'simona', 'sonia', 'susanna', 'tiziana', 'veronica', 'denise', 'arianna',
  'barbara', 'bruna', 'fabiana', 'gaia', 'iris', 'katia', 'margherita',
  'nadia', 'olga', 'tina', 'ursula', 'vanda', 'wanda', 'zoe', 'ada', 'alba',
  'alda', 'allegra', 'amalia', 'amanda', 'anita', 'antonella', 'aquilina',
  'armida', 'artemia', 'asia', 'augusta', 'aurora', 'azelia', 'berta',
  'bianca', 'brigida', 'cassandra', 'celeste', 'clelia', 'consolata',
  'cosetta', 'creusa', 'damiana', 'daria', 'delinda', 'dina', 'dionisia',
  'dolores', 'domitilla', 'donatella', 'edvige', 'eleonora', 'elodia',
  'elvira', 'emilia', 'ena', 'enrica', 'ermelinda', 'ermenegilda', 'ernesta',
  'ersilia', 'etelvina', 'eufemia', 'eulalia', 'eunice', 'eusebia',
  'eutimia', 'eva', 'evangelina', 'fabrizia', 'fausta', 'felicia',
  'ferdinanda', 'fiammetta', 'filena', 'fiora', 'fioralba', 'fiore',
  'fiorella', 'fiorenza', 'flaminia', 'floriana', 'fosca', 'franca',
  'fulvia', 'gabriella', 'galatea', 'gemma', 'genoveffa', 'germana',
  'gianna', 'gilda', 'ginevra', 'giovanna', 'giuditta', 'giulia', 'giuliana',
  'giulietta', 'giuseppa', 'giustina', 'gloria', 'graziella', 'ida',
  'ignazia', 'ilaria', 'imelda', 'inès', 'incoronata', 'ines', 'iolanda',
  'irene', 'irina', 'irma', 'isabella', 'iside', 'jacopa', 'jasmina',
  'jolanda', 'josephine', 'judith', 'lalla', 'lara', 'laura', 'lavinia',
  'lea', 'leda', 'leila', 'lena', 'leonia', 'leonilda', 'letizia', 'lia',
  'liana', 'libera', 'liliana', 'lilla', 'lina', 'linda', 'lisabeth',
  'lisetta', 'livia', 'lora', 'lorella', 'lorena', 'luana', 'luce', 'lucia',
  'luciana', 'lucrezia', 'ludovica', 'luigia', 'maddalena', 'mafalda',
  'mara', 'marcella', 'margherita', 'maria', 'mariangela', 'marianna',
  'mariele', 'marilena', 'marina', 'marinetta', 'marisa', 'marita',
  'marizia', 'marta', 'martina', 'marzia', 'massimiliana', 'matilde',
  'mattea', 'maurizia', 'melania', 'melissa', 'mercedes', 'michela',
  'mignon', 'milena', 'mina', 'minerva', 'minna', 'miranda', 'mirella',
  'miriam', 'modesta', 'monica', 'morena', 'morgana', 'nannarella',
  'natalia', 'nathalie', 'nella', 'nenella', 'nerina', 'nilde', 'ninetta',
  'nives', 'noemi', 'nunzia', 'nunziata', 'odia', 'ofelia', 'olimpia',
  'oliva', 'olivetta', 'oneida', 'orsola', 'otilia', 'palmira', 'pamela',
  'pancrazia', 'paoletta', 'paolina', 'pelagia', 'penelope', 'perla',
  'petronilla', 'pia', 'piera', 'pierina', 'pina', 'placida', 'polissena',
  'porzia', 'prassede', 'preziosa', 'primavera', 'priscilla', 'prospera',
  'quintilia', 'raffaela', 'raimonda', 'rebeca', 'regina', 'renata',
  'ricarda', 'rinella', 'roberta', 'romana', 'romilda', 'romola', 'rosa',
  'rosalba', 'rosalinda', 'rosalia', 'rosamaria', 'rosanna', 'rosaria',
  'roselina', 'rosetta', 'rosita', 'rossana', 'rossella', 'rovena',
  'rubina', 'sabina', 'sabrina', 'safira', 'salome', 'samuela', 'sandra',
  'santina', 'sara', 'sarafina', 'saveria', 'sefora', 'selvaggia',
  'serafina', 'serena', 'severina', 'sibilla', 'silvana', 'silvia',
  'simona', 'simonetta', 'siria', 'smeralda', 'sofi', 'sofia', 'solange',
  'sonia', 'soraya', 'stella', 'stefania', 'sveva', 'tamara', 'tania',
  'tatiana', 'tecla', 'teodolinda', 'teodora', 'teresina', 'thea', 'tina',
  'tiziana', 'tosca', 'tullia', 'uda', 'uliana', 'ulla', 'umbra', 'ursula',
  'vanda', 'vanessa', 'vasiliki', 'vega', 'velia', 'venezia', 'verena',
  'veronica', 'vicky', 'vienna', 'viktoria', 'vilma', 'vincenza', 'viola',
  'violante', 'virginia', 'virna', 'vittoria', 'viviana', 'vladimira',
  'yasmin', 'ylenia', 'yolanda', 'yvonne', 'zaira', 'zenia',
]);

const lookup = new Map();

function addLookup(slug, meta) {
  const key = normalizeName(slug);
  if (!key) return;
  if (!lookup.has(key)) {
    lookup.set(key, []);
  }
  lookup.get(key).push(meta);
}

const christianBoyNames = readJson(path.join(dataDir, 'christian-boy-names.json'), []);
const christianGirlNames = readJson(path.join(dataDir, 'christian-girl-names.json'), []);
const christianExtracted = readJson(path.join(publicDir, 'christian_extracted.json'), []);

for (const item of christianBoyNames) {
  addLookup(item.name, {
    source: 'christian-boy-names.json',
    origin: item.origin || '',
    gender: item.gender || '',
    meaning: item.meaning || '',
  });
}

for (const item of christianGirlNames) {
  addLookup(item.name, {
    source: 'christian-girl-names.json',
    origin: item.origin || '',
    gender: item.gender || '',
    meaning: item.meaning || '',
  });
}

for (const item of christianExtracted) {
  if (!item.name) continue;
  addLookup(item.name, {
    source: 'christian_extracted.json',
    origin: item.origin || '',
    language: Array.isArray(item.language) ? item.language : [],
    gender: item.gender || '',
    meaning: item.short_meaning || item.meaning || '',
  });
}

export function isItalianName(name) {
  const slug = normalizeName(name);
  if (!slug) {
    return {
      isItalian: false,
      confidence: 0,
      reasons: ['Invalid name'],
    };
  }

  const metadata = lookup.get(slug) || [];
  const allOrigins = metadata.map(m => String(m.origin || '').toLowerCase());
  const allLanguages = metadata.flatMap(m => Array.isArray(m.language) ? m.language : [])
    .map(l => String(l || '').toLowerCase());

  const reasons = [];
  let confidence = 0;

  if (allOrigins.includes('italian')) {
    confidence += 40;
    reasons.push('Explicit origin Italian in metadata');
  }

  if (allLanguages.some(l => l === 'italian')) {
    confidence += 20;
    reasons.push('Italian listed in language metadata');
  }

  if (KNOWN_ITALIAN_NAMES.has(slug)) {
    confidence += 40;
    reasons.push('Authentic Italian name in curated list');
  }

  const uniqueReasons = [...new Set(reasons)];

  const isItalian = confidence >= 40;

  return {
    isItalian,
    confidence: Math.min(confidence, 100),
    reasons: uniqueReasons.length ? uniqueReasons : ['No Italian indicators found'],
  };
}

export default isItalianName;
