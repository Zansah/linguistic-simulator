/**
 * Linguistic Simulator
 * app.js — Version 2: Context mode selector
 */

'use strict';

// ─────────────────────────────────────────────
// MODE DATA MODEL
// Four registers drawn from the developer's
// actual linguistic autobiography.
// ─────────────────────────────────────────────

const MODE_CONFIG = {
  academic: {
    label:   'Academic',
    emoji:   '',
    color:   '#6366f1',
    // Linguistic profile for this register
    register:  'high formal',
    features:  'hedged assertions, passive voice, latinate vocabulary',
  },
  casual: {
    label:   'Casual',
    emoji:   '',
    color:   '#10b981',
    register:  'informal',
    features:  'contractions, filler words, relaxed syntax',
  },
  family: {
    label:   'Family',
    emoji:   '',
    color:   '#f59e0b',
    register:  'mixed-language / familiar',
    // Code-switching: English + French + Twi (Akan)
    features:  'English–French–Twi mixing, direct speech, in-group terms',
  },
  email: {
    label:   'Formal Email',
    emoji:   '',
    color:   '#8b5cf6',
    register:  'professional written',
    features:  'polite openers, softened requests, formal closings',
  },
};

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

const state = {
  currentMode:    null,   
  panelOpen:      false,
};

// ─────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────

const modeBtn      = document.getElementById('modeBtn');
const modeBtnLabel = document.getElementById('modeBtnLabel');
const modePanel    = document.getElementById('modePanel');
const statusText   = document.getElementById('statusText');
const modeOptions  = document.querySelectorAll('.mode-option');

// ─────────────────────────────────────────────
// PANEL OPEN / CLOSE
// ─────────────────────────────────────────────

function openPanel() {
  state.panelOpen = true;
  modePanel.classList.add('open');
  modePanel.setAttribute('aria-hidden', 'false');
  modeBtn.setAttribute('aria-expanded', 'true');
}

function closePanel() {
  state.panelOpen = false;
  modePanel.classList.remove('open');
  modePanel.setAttribute('aria-hidden', 'true');
  modeBtn.setAttribute('aria-expanded', 'false');
}

function togglePanel() {
  state.panelOpen ? closePanel() : openPanel();
}

// ─────────────────────────────────────────────
// MODE SELECTION
// ─────────────────────────────────────────────

function selectMode(modeKey) {
  state.currentMode = modeKey;
  const cfg = MODE_CONFIG[modeKey];

  // Update button label
  modeBtnLabel.textContent = cfg.emoji + ' ' + cfg.label;
  modeBtn.classList.add('mode-active');
  // Tint the button to match the selected mode colour
  modeBtn.style.color       = cfg.color;
  modeBtn.style.borderColor = cfg.color + '55';
  modeBtn.style.background  = cfg.color + '12';

  // Mark selected option in panel
  modeOptions.forEach(opt => {
    const isThis = opt.dataset.mode === modeKey;
    opt.classList.toggle('selected', isThis);
    opt.setAttribute('aria-selected', String(isThis));
  });

  // Update status text
  statusText.textContent =
    `Register: ${cfg.register}. Type a sentence and press → to transform it.`;

  closePanel();
}

// ─────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────

// Toggle panel when Mode button is clicked
modeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  togglePanel();
});

// Select a mode when an option is clicked
modeOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    selectMode(opt.dataset.mode);
  });
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (state.panelOpen && !modePanel.contains(e.target) && e.target !== modeBtn) {
    closePanel();
  }
});

// Close panel on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.panelOpen) closePanel();
});

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

console.log('[Linguistic Simulator] Version 2 loaded — mode selector ready.');