'use strict';

const MODE_CONFIG = {
  academic: {
    label:    'Academic',
    color:    '#6366f1',
    register: 'high formal',
  },
  casual: {
    label:    'Casual',
    color:    '#10b981',
    register: 'informal',
  },
  family: {
    label:    'Family',
    color:    '#f59e0b',
    register: 'mixed-language — English, French, Twi',
  },
  email: {
    label:    'Formal Email',
    color:    '#8b5cf6',
    register: 'professional written',
  },
};

const ACCENT_GROUPS = [
  {
    group: 'American English',
    langs: ['en-US'],
  },
  {
    group: 'British English',
    langs: ['en-GB'],
  },
  {
    group: 'Australian English',
    langs: ['en-AU'],
  },
  {
    group: 'French',
    langs: ['fr-FR', 'fr-CA'],
  },
];

const TRANSFORMATIONS = [
  {
    detect: /i don'?t understand|i'?m confused|i don'?t get/i,
    outputs: {
      academic: 'I find myself unable to fully apprehend the meaning of your statement.',
      casual:   "Wait, I'm kinda lost — what are you saying?",
      family:   "Mframa, me nka asem no. I don't get it at all.",
      email:    'I want to ensure I fully understand your point — could you kindly clarify?',
    },
  },
  {
    detect: /i need more time|not done|can'?t finish/i,
    outputs: {
      academic: 'I require additional time to complete this task to the expected standard.',
      casual:   "Hey, I'm gonna need a bit more time — not done yet.",
      family:   "Ma me time kakra. I'm not finished yet, s'il te plaît.",
      email:    'I am writing to request a brief extension, as I require additional time to finalize this.',
    },
  },
  {
    detect: /this is (really |very |so )?(hard|difficult|tough)|struggling/i,
    outputs: {
      academic: 'This task presents a considerable degree of cognitive difficulty.',
      casual:   "Okay this is genuinely hard, not gonna lie.",
      family:   "Eyi ye den paa. C'est vraiment difficile for me.",
      email:    'I wanted to flag that I am finding this more challenging than anticipated.',
    },
  },
  {
    detect: /can you (explain|say) (that )?(again)?|explain again/i,
    outputs: {
      academic: 'Could you elaborate further on that point, perhaps with greater specificity?',
      casual:   'Wait can you run that by me again?',
      family:   "Kan bio. Di o encore — I didn't catch that.",
      email:    'I would greatly appreciate it if you could clarify that point at your convenience.',
    },
  },
  {
    detect: /i'?m (so |really |very )?tired|exhausted/i,
    outputs: {
      academic: 'I am experiencing a notable degree of fatigue at present.',
      casual:   "I'm dead tired right now.",
      family:   "Me bo ahu. Je suis épuisé — I can't anymore.",
      email:    'I should mention I am operating under some fatigue, though this will not affect my output.',
    },
  },
  {
    detect: /i (really )?(love|like) (this|it)|that'?s (really )?(great|awesome|cool|nice)/i,
    outputs: {
      academic: 'I find this to be a genuinely impressive and noteworthy development.',
      casual:   "Okay wait, this is actually really good.",
      family:   "Eyi ye fe paa! J'aime ça — this is so good.",
      email:    'Thank you for sharing — I find this to be quite impressive.',
    },
  },
  {
    detect: /i don'?t (want to|wanna)|i (hate|dislike)/i,
    outputs: {
      academic: 'I must confess a marked reluctance to engage with this matter.',
      casual:   "Honestly? I really don't want to do this.",
      family:   "Me pe saa. Non, je veux pas — please don't make me.",
      email:    'I wanted to respectfully express some hesitation regarding this matter.',
    },
  },
  {
    detect: /i('?m not sure| don'?t know)|not sure|unsure/i,
    outputs: {
      academic: 'I am not in a position to assert this with any meaningful certainty.',
      casual:   "Honestly, I have no clue.",
      family:   "Me nim. Je sais pas — I really don't know.",
      email:    'I must acknowledge some uncertainty on my part regarding this matter.',
    },
  },
  {
    detect: /^(yes|yeah|yep|sure|of course|absolutely)[.!]?$/i,
    outputs: {
      academic: 'I can confirm this in the affirmative.',
      casual:   'Yeah, for sure!',
      family:   'Aane! Oui — yes of course.',
      email:    'I am pleased to confirm in the affirmative.',
    },
  },
  {
    detect: /^(no|nope|nah|never)[.!]?$/i,
    outputs: {
      academic: 'I must respectfully decline on this occasion.',
      casual:   'Nah, not happening.',
      family:   'Daabi. Non — absolutely not.',
      email:    'I regret to inform you that I must decline on this occasion.',
    },
  },
];

function genericTransform(sentence, mode) {
  const s = sentence.trim();
  if (!s) return '';

  const transforms = {
    academic: (t) => {
      const hedges = ['It is my contention that ', 'Upon reflection, ', 'From my perspective, '];
      const hedge = hedges[Math.floor(Math.random() * hedges.length)];
      const out = t
        .replace(/\bcan't\b/gi, 'cannot')
        .replace(/\bdon't\b/gi, 'do not')
        .replace(/\bwon't\b/gi, 'will not')
        .replace(/\bgot\b/gi, 'obtained')
        .replace(/\bkinda\b/gi, 'somewhat')
        .replace(/\bpretty\b/gi, 'rather')
        .replace(/\bstuff\b/gi, 'matters')
        .replace(/\bthings\b/gi, 'considerations');
      const clean = out.replace(/[.!?]+$/, '');
      return hedge + clean.charAt(0).toLowerCase() + clean.slice(1) + '.';
    },
    casual: (t) => {
      const openers = ['Okay so ', 'So like ', 'Honestly ', 'I mean '];
      const opener = openers[Math.floor(Math.random() * openers.length)];
      return opener + t
        .replace(/\bcannot\b/gi, "can't")
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bI am\b/gi, "I'm")
        .replace(/\bwill not\b/gi, "won't")
        .replace(/\bvery\b/gi, 'really')
        .replace(/[.]+$/, '') + '.';
    },
    family: (t) => {
      const inserts = [
        ['Yen ko.', 'Let\'s go.'],
        ['Meda wo ase.', 'Thank you.'],
        ['Akwaaba.', 'Welcome.'],
      ];
      const base = t
        .replace(/\bI am\b/gi, "I'm")
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bcannot\b/gi, "can't");
      const pick = inserts[Math.floor(Math.random() * inserts.length)];
      return pick[0] + ' ' + base;
    },
    email: (t) => {
      const openers = [
        'I hope this message finds you well. ',
        'Thank you for your continued patience. ',
        'I am reaching out to share the following. ',
      ];
      const opener = openers[Math.floor(Math.random() * openers.length)];
      const out = t
        .replace(/\bcan't\b/gi, 'cannot')
        .replace(/\bdon't\b/gi, 'do not')
        .replace(/\bI'm\b/gi, 'I am')
        .replace(/\bwon't\b/gi, 'will not');
      return opener + out;
    },
  };

  const fn = transforms[mode] || ((t) => t);
  return fn(s);
}

function transform(sentence, mode) {
  if (!sentence || !sentence.trim()) return '';
  for (const p of TRANSFORMATIONS) {
    if (p.detect.test(sentence)) {
      return p.outputs[mode] || genericTransform(sentence, mode);
    }
  }
  return genericTransform(sentence, mode);
}

const state = {
  currentMode:    null,
  panelOpen:      null,
  selectedVoice:  null,
  availableVoices:[],
  currentOutput:  '',
  speaking:       false,
};

const modeBtn       = document.getElementById('modeBtn');
const modeBtnLabel  = document.getElementById('modeBtnLabel');
const voiceBtn      = document.getElementById('voiceBtn');
const voiceBtnLabel = document.getElementById('voiceBtnLabel');
const modePanel     = document.getElementById('modePanel');
const voicePanel    = document.getElementById('voicePanel');
const voiceList     = document.getElementById('voiceList');
const statusText    = document.getElementById('statusText');
const userInput     = document.getElementById('userInput');
const transformBtn  = document.getElementById('transformBtn');
const micBtn        = document.getElementById('micBtn');
const voiceContainer= document.getElementById('voiceContainer');
const modeOptions   = document.querySelectorAll('.mode-option');

function closeAll() {
  [modePanel, voicePanel].forEach(p => {
    p.classList.remove('open');
    p.setAttribute('aria-hidden', 'true');
  });
  modeBtn.setAttribute('aria-expanded', 'false');
  voiceBtn.setAttribute('aria-expanded', 'false');
  state.panelOpen = null;
}

function togglePanel(which) {
  const isOpen = state.panelOpen === which;
  closeAll();
  if (!isOpen) {
    which.classList.add('open');
    which.setAttribute('aria-hidden', 'false');
    state.panelOpen = which;
    if (which === modePanel) modeBtn.setAttribute('aria-expanded', 'true');
    if (which === voicePanel) voiceBtn.setAttribute('aria-expanded', 'true');
  }
}

function selectMode(modeKey) {
  state.currentMode = modeKey;
  const cfg = MODE_CONFIG[modeKey];

  modeBtnLabel.textContent = cfg.label;
  modeBtn.classList.add('mode-active');
  modeBtn.style.color       = cfg.color;
  modeBtn.style.borderColor = cfg.color + '55';
  modeBtn.style.background  = cfg.color + '12';

  modeOptions.forEach(opt => {
    const match = opt.dataset.mode === modeKey;
    opt.classList.toggle('selected', match);
    opt.setAttribute('aria-selected', String(match));
  });

  if (!state.currentOutput) {
    statusText.textContent =
      'Register: ' + cfg.register + '. Type a sentence and press the arrow to transform it.';
  }

  closeAll();
}

function loadVoices() {
  const raw = window.speechSynthesis.getVoices();
  if (!raw.length) return;

  const filtered = [];
  const seen = new Set();

  const preferredLangs = ['en-US', 'en-GB', 'en-AU', 'fr-FR', 'fr-CA'];

  preferredLangs.forEach(lang => {
    const matches = raw.filter(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
    matches.forEach(v => {
      if (!seen.has(v.name)) {
        seen.add(v.name);
        filtered.push(v);
      }
    });
  });

  if (!filtered.length) {
    raw.slice(0, 12).forEach(v => {
      if (!seen.has(v.name)) {
        seen.add(v.name);
        filtered.push(v);
      }
    });
  }

  state.availableVoices = filtered;
  renderVoiceList(filtered);
}

function friendlyLang(lang) {
  const map = {
    'en-US': 'American English',
    'en-GB': 'British English',
    'en-AU': 'Australian English',
    'en-CA': 'Canadian English',
    'en-IE': 'Irish English',
    'en-IN': 'Indian English',
    'fr-FR': 'French (France)',
    'fr-CA': 'French (Canada)',
    'es-ES': 'Spanish (Spain)',
    'es-US': 'Spanish (US)',
    'de-DE': 'German',
    'zh-CN': 'Mandarin',
    'ja-JP': 'Japanese',
  };
  return map[lang] || lang;
}

function renderVoiceList(voices) {
  if (!voices.length) {
    voiceList.innerHTML = '<p class="voice-loading">No voices found in this browser.</p>';
    return;
  }

  voiceList.innerHTML = voices.map((v, i) => {
    const accent = friendlyLang(v.lang);
    const shortName = v.name.replace(/Microsoft |Google |\(Natural\)|\(Premium\)/gi, '').trim();
    return (
      '<button class="voice-option" data-index="' + i + '" aria-label="Select voice ' + shortName + '">' +
        '<span class="voice-option-name">' + shortName + '</span>' +
        '<span class="voice-option-meta">' + accent + (v.localService ? '' : ' · online') + '</span>' +
      '</button>'
    );
  }).join('');

  voiceList.querySelectorAll('.voice-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      state.selectedVoice = state.availableVoices[idx];
      voiceList.querySelectorAll('.voice-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const shortName = state.selectedVoice.name
        .replace(/Microsoft |Google |\(Natural\)|\(Premium\)/gi, '').trim();
      voiceBtnLabel.textContent = shortName;
      voiceBtn.classList.add('voice-active');
      closeAll();
      if (state.currentOutput) speakOutput(state.currentOutput);
    });
  });
}

function speakOutput(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  if (state.selectedVoice) utt.voice = state.selectedVoice;
  utt.lang   = state.selectedVoice ? state.selectedVoice.lang : 'en-US';
  utt.rate   = 0.95;
  utt.pitch  = 1;
  utt.volume = 1;

  utt.onstart = () => {
    state.speaking = true;
    voiceContainer.classList.add('speaking');
  };
  utt.onend = () => {
    state.speaking = false;
    voiceContainer.classList.remove('speaking');
  };
  utt.onerror = () => {
    state.speaking = false;
    voiceContainer.classList.remove('speaking');
  };

  window.speechSynthesis.speak(utt);
}

function doTransform() {
  const sentence = userInput.value.trim();
  if (!sentence) {
    userInput.style.borderBottom = '2px solid #ef4444';
    setTimeout(() => { userInput.style.borderBottom = ''; }, 700);
    return;
  }
  if (!state.currentMode) {
    modeBtn.style.borderColor = '#ef4444';
    setTimeout(() => { modeBtn.style.borderColor = ''; }, 700);
    togglePanel(modePanel);
    return;
  }

  const output = transform(sentence, state.currentMode);
  state.currentOutput = output;

  statusText.classList.add('has-output');
  statusText.textContent = output;

  speakOutput(output);
}

modeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  togglePanel(modePanel);
});

voiceBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!state.availableVoices.length) loadVoices();
  togglePanel(voicePanel);
});

modeOptions.forEach(opt => {
  opt.addEventListener('click', () => selectMode(opt.dataset.mode));
});

transformBtn.addEventListener('click', doTransform);

userInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    doTransform();
  }
});

micBtn.addEventListener('click', () => {
  if (state.currentOutput) speakOutput(state.currentOutput);
});

document.addEventListener('click', (e) => {
  const outside =
    !modePanel.contains(e.target) &&
    !voicePanel.contains(e.target) &&
    e.target !== modeBtn &&
    e.target !== voiceBtn;
  if (state.panelOpen && outside) closeAll();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.panelOpen) closeAll();
});

if ('speechSynthesis' in window) {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  setTimeout(loadVoices, 200);
}

console.log('[Linguistic Simulator] Version 3 loaded — transformation engine ready.');