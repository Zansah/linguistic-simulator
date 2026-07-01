'use strict';

/* ============================================================
   GROQ AI CONFIG
   ------------------------------------------------------------
   Put your Groq API key below. Since this is a static GitHub
   Pages site, the key will be visible in the JS source to
   anyone who looks — fine for a throwaway/demo key, but don't
   reuse a key you care about, and rotate it when you're done.
   Get a key at https://console.groq.com/keys
   ============================================================ */
const GROQ_CONFIG = {
  apiKey:       'YOUR_GROQ_API_KEY_HERE',
  apiKeyBackup: 'YOUR_BACKUP_GROQ_API_KEY_HERE',
  model:    'openai/gpt-oss-120b',
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
};

const MODE_CONFIG = {
  academic: {
    label:    'Academic',
    color:    '#6366f1',
    register: 'high formal register',
    promptHint:
      'High academic register. Use epistemic hedging ("it could be argued that", "this suggests"), ' +
      'elevated and often Latinate lexical choices over their plain Anglo-Saxon equivalents, ' +
      'complex hypotactic syntax with subordinate clauses rather than short independent ones, ' +
      'passive constructions where they foreground the subject matter over the speaker, ' +
      'third-person distancing, and formal discourse markers ("furthermore", "however", "thus", "moreover"). ' +
      'Avoid contractions entirely.',
  },
  casual: {
    label:    'Casual',
    color:    '#10b981',
    register: 'low informal register',
    promptHint:
      'Low informal register, the kind used in relaxed speech between friends. ' +
      'Use contracted forms ("I\'m", "gonna", "kinda"), simple paratactic syntax (short clauses ' +
      'loosely joined rather than subordinated), everyday colloquial lexis, spoken discourse markers ' +
      '("like", "honestly", "I mean", "so"), and occasional sentence fragments. Relaxed punctuation is fine.',
  },
  texting: {
    label:    'Texting',
    color:    '#f59e0b',
    register: 'digital shorthand register',
    promptHint:
      'Texting and SMS register. Use heavy ellipsis, dropping subjects and auxiliaries where the meaning ' +
      'is still recoverable ("not done yet" instead of "I am not done yet"). Favor lowercase orthography, ' +
      'common digital abbreviations and clippings ("u", "ur", "rn", "ngl", "fr", "idk", "tbh"), minimal ' +
      'terminal punctuation (periods are usually dropped at the end of a thought), and clipped sentence ' +
      'fragments over full clauses. This is lexical compression, not just casual tone.',
  },
  email: {
    label:    'Formal Email',
    color:    '#8b5cf6',
    register: 'professional written register',
    promptHint:
      'Professional written register for a workplace email. Use polite hedging and mitigation ' +
      '("I wanted to follow up", "if possible", "when you have a moment"), modal verbs for politeness ' +
      '("could", "would", "might"), conventional formal openers and closers, structured discourse markers ' +
      '("firstly", "additionally", "in conclusion"), and avoid contractions. Less syntactically dense than ' +
      'academic prose, but still measured and courteous.',
  },
};

const ACCENT_GROUPS = [
  { group: 'American English',      langs: ['en-US'] },
  { group: 'British English',       langs: ['en-GB'] },
  { group: 'Australian English',    langs: ['en-AU'] },
  { group: 'Canadian English',      langs: ['en-CA'] },
  { group: 'Irish English',         langs: ['en-IE'] },
  { group: 'New Zealand English',   langs: ['en-NZ'] },
  { group: 'South African English', langs: ['en-ZA'] },
  { group: 'Indian English',        langs: ['en-IN'] },
  { group: 'Nigerian English',      langs: ['en-NG'] },
  { group: 'Ghanaian English',      langs: ['en-GH'] },
  { group: 'Kenyan English',        langs: ['en-KE'] },
  { group: 'Filipino English',      langs: ['en-PH'] },
  { group: 'Singaporean English',   langs: ['en-SG'] },
  { group: 'Jamaican English',      langs: ['en-JM'] },
  { group: 'French',                langs: ['fr-FR', 'fr-CA'] },
];

const TRANSFORMATIONS = [
  {
    detect: /i don'?t understand|i'?m confused|i don'?t get/i,
    outputs: {
      academic: 'I find myself unable to fully apprehend the meaning of your statement.',
      casual:   "Wait, I'm kinda lost — what are you saying?",
      texting:  "wait i dont get it at all, can u explain",
      email:    'I want to ensure I fully understand your point — could you kindly clarify?',
    },
  },
  {
    detect: /i need more time|not done|can'?t finish/i,
    outputs: {
      academic: 'I require additional time to complete this task to the expected standard.',
      casual:   "Hey, I'm gonna need a bit more time — not done yet.",
      texting:  "ngl need a bit more time, not done yet",
      email:    'I am writing to request a brief extension, as I require additional time to finalize this.',
    },
  },
  {
    detect: /this is (really |very |so )?(hard|difficult|tough)|struggling/i,
    outputs: {
      academic: 'This task presents a considerable degree of cognitive difficulty.',
      casual:   "Okay this is genuinely hard, not gonna lie.",
      texting:  "ok this is rly hard ngl",
      email:    'I wanted to flag that I am finding this more challenging than anticipated.',
    },
  },
  {
    detect: /can you (explain|say) (that )?(again)?|explain again/i,
    outputs: {
      academic: 'Could you elaborate further on that point, perhaps with greater specificity?',
      casual:   'Wait can you run that by me again?',
      texting:  "wait can u say that again",
      email:    'I would greatly appreciate it if you could clarify that point at your convenience.',
    },
  },
  {
    detect: /i'?m (so |really |very )?tired|exhausted/i,
    outputs: {
      academic: 'I am experiencing a notable degree of fatigue at present.',
      casual:   "I'm dead tired right now.",
      texting:  "im so tired rn",
      email:    'I should mention I am operating under some fatigue, though this will not affect my output.',
    },
  },
  {
    detect: /i (really )?(love|like) (this|it)|that'?s (really )?(great|awesome|cool|nice)/i,
    outputs: {
      academic: 'I find this to be a genuinely impressive and noteworthy development.',
      casual:   "Okay wait, this is actually really good.",
      texting:  "omg i actually love this",
      email:    'Thank you for sharing — I find this to be quite impressive.',
    },
  },
  {
    detect: /i don'?t (want to|wanna)|i (hate|dislike)/i,
    outputs: {
      academic: 'I must confess a marked reluctance to engage with this matter.',
      casual:   "Honestly? I really don't want to do this.",
      texting:  "ngl i really dont wanna do this",
      email:    'I wanted to respectfully express some hesitation regarding this matter.',
    },
  },
  {
    detect: /i('?m not sure| don'?t know)|not sure|unsure/i,
    outputs: {
      academic: 'I am not in a position to assert this with any meaningful certainty.',
      casual:   "Honestly, I have no clue.",
      texting:  "tbh idk",
      email:    'I must acknowledge some uncertainty on my part regarding this matter.',
    },
  },
  {
    detect: /^(yes|yeah|yep|sure|of course|absolutely)[.!]?$/i,
    outputs: {
      academic: 'I can confirm this in the affirmative.',
      casual:   'Yeah, for sure!',
      texting:  "yeah for sure",
      email:    'I am pleased to confirm in the affirmative.',
    },
  },
  {
    detect: /^(no|nope|nah|never)[.!]?$/i,
    outputs: {
      academic: 'I must respectfully decline on this occasion.',
      casual:   'Nah, not happening.',
      texting:  "nah",
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
    texting: (t) => {
      const fillers = ['ngl ', 'tbh ', 'ok so ', 'wait '];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      const out = t
        .replace(/\byou\b/gi, 'u')
        .replace(/\byour\b/gi, 'ur')
        .replace(/\bI am\b/gi, 'im')
        .replace(/\bI'm\b/gi, 'im')
        .replace(/\bcannot\b/gi, "can't")
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\breally\b/gi, 'rly')
        .replace(/\bbecause\b/gi, 'bc')
        .replace(/[.]+$/, '');
      return (filler + out).toLowerCase();
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

function localTransform(sentence, mode) {
  if (!sentence || !sentence.trim()) return '';
  for (const p of TRANSFORMATIONS) {
    if (p.detect.test(sentence)) {
      return p.outputs[mode] || genericTransform(sentence, mode);
    }
  }
  return genericTransform(sentence, mode);
}

/* ============================================================
   GROQ AI TRANSFORM
   ============================================================ */
async function groqTransform(sentence, mode, useBackupKey) {
  const cfg = MODE_CONFIG[mode];
  const keyToUse = useBackupKey ? GROQ_CONFIG.apiKeyBackup : GROQ_CONFIG.apiKey;

  const systemPrompt =
    'You are simulating a sociolinguistic register shift: the way a real speaker naturally adjusts ' +
    'their language for a different communicative context while keeping the same underlying meaning. ' +
    'Target register: ' + cfg.label + '. ' + cfg.promptHint + ' ' +
    'Adjust across these linguistic dimensions, not just vocabulary: syntax (clause length and complexity, ' +
    'coordination vs subordination), morphology (contractions, inflections, clipped forms), lexis ' +
    '(word choice and level of formality), and discourse markers (the small connective words a speaker ' +
    'uses to structure what they are saying). ' +
    'Write the way an actual person talks or writes in that situation, not the way an AI assistant talks. ' +
    'Use plain, natural punctuation: periods, commas, and the occasional question mark or exclamation point. ' +
    'Do not use em dashes or en dashes anywhere in your response, use a comma, period, or "and" instead. ' +
    'Do not use semicolons. Do not start with phrases like "I would say" or "Here\'s the rewrite". ' +
    'Keep the original meaning intact and keep it roughly the same length as the input. ' +
    'Respond with ONLY the rewritten sentence and nothing else, no quotes around it, no preamble, no explanation.';

  // Hard timeout: if Groq stalls instead of erroring out, abort rather than hang forever.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(GROQ_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + keyToUse,
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: sentence },
        ],
        temperature: 0.85,
        max_tokens:  200,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Groq API timed out after 8s');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error('Groq API error ' + response.status + ': ' + errText);
  }

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';

  // Safety net: strip any em/en dashes the model slips in anyway, swap for a comma.
  return (text || '')
    .trim()
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.');
}

async function transform(sentence, mode) {
  if (!sentence || !sentence.trim()) return '';

  const keyIsSet = GROQ_CONFIG.apiKey && GROQ_CONFIG.apiKey !== 'YOUR_GROQ_API_KEY_HERE';
  const backupKeyIsSet = GROQ_CONFIG.apiKeyBackup && GROQ_CONFIG.apiKeyBackup !== 'YOUR_BACKUP_GROQ_API_KEY_HERE';

  if (!keyIsSet) {
    console.warn('[Linguistic Simulator] No Groq API key set — using local fallback. Add your key to GROQ_CONFIG.apiKey.');
    return localTransform(sentence, mode);
  }

  // Try the primary key first.
  try {
    const result = await groqTransform(sentence, mode, false);
    console.log('[Linguistic Simulator] Groq API responded successfully (primary key).');
    return result;
  } catch (primaryErr) {
    console.warn('[Linguistic Simulator] Primary Groq key failed:', primaryErr);
  }

  // Primary failed — try the backup key if one is configured.
  if (backupKeyIsSet) {
    try {
      const result = await groqTransform(sentence, mode, true);
      console.log('[Linguistic Simulator] Groq API responded successfully (backup key).');
      return result;
    } catch (backupErr) {
      console.error('[Linguistic Simulator] Backup Groq key also failed:', backupErr);
    }
  }

  // Both keys failed (or no backup configured) — fall back to local transform.
  statusText.textContent = 'Groq API error (check console) — showing local fallback instead.';
  await new Promise(r => setTimeout(r, 1200));
  return localTransform(sentence, mode);
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

  const seen = new Set();
  const flatVoices = [];
  const groups = [];

  ACCENT_GROUPS.forEach(({ group, langs }) => {
    const groupVoices = [];
    langs.forEach(lang => {
      const base = lang.split('-')[0];
      raw
        .filter(v => v.lang === lang || v.lang.replace('_', '-') === lang)
        .forEach(v => {
          if (!seen.has(v.name)) {
            seen.add(v.name);
            groupVoices.push(v);
          }
        });
    });
    if (groupVoices.length) {
      groupVoices.forEach(v => flatVoices.push(v));
      groups.push({ group, voices: groupVoices });
    }
  });

  // Fallback: browser has voices but none matched any dialect we listed.
  if (!flatVoices.length) {
    raw.slice(0, 12).forEach(v => {
      if (!seen.has(v.name)) {
        seen.add(v.name);
        flatVoices.push(v);
      }
    });
    if (flatVoices.length) {
      groups.push({ group: 'Available voices', voices: flatVoices });
    }
  }

  state.availableVoices = flatVoices;
  renderVoiceList(groups);
}

function renderVoiceList(groups) {
  if (!groups.length) {
    voiceList.innerHTML = '<p class="voice-loading">No voices found in this browser.</p>';
    return;
  }

  let globalIndex = 0;
  voiceList.innerHTML = groups.map(({ group, voices }) => {
    const buttons = voices.map(v => {
      const shortName = v.name.replace(/Microsoft |Google |\(Natural\)|\(Premium\)/gi, '').trim();
      const idx = globalIndex++;
      return (
        '<button class="voice-option" data-index="' + idx + '" aria-label="Select voice ' + shortName + ', ' + group + '">' +
          '<span class="voice-option-name">' + shortName + '</span>' +
          '<span class="voice-option-meta">' + group + (v.localService ? '' : ' · online') + '</span>' +
        '</button>'
      );
    }).join('');
    return '<p class="mode-panel-label">' + group + '</p>' + buttons;
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

async function doTransform() {
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

  transformBtn.disabled = true;
  statusText.classList.add('has-output');
  statusText.textContent = 'Transforming…';

  let output;
  try {
    output = await transform(sentence, state.currentMode);
  } catch (err) {
    // transform() already handles its own API/network errors internally,
    // so reaching this catch means something truly unexpected happened.
    // Guarantee the user still gets a result rather than a frozen button.
    console.error('[Linguistic Simulator] Unexpected error, using local fallback:', err);
    output = localTransform(sentence, state.currentMode);
  } finally {
    transformBtn.disabled = false;
  }

  state.currentOutput = output;
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

console.log('[Linguistic Simulator] Version 4 loaded — Groq-powered transformation engine ready.');