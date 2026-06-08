// Claude Timestamp - content.js
// Prepends a timestamp to each message before it's sent on claude.ai

function getTimestamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function stampEditor(editor) {
  const text = editor.innerText.trim();
  if (!text || /^\[.+\]/.test(text)) return;
  const stamped = `[${getTimestamp()}]\n${text}`;
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, stamped);
}

function getEditor() {
  return document.querySelector('[data-testid="chat-input"]');
}

// Listen at document level in capture phase to beat Tiptap's own handlers
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const editor = getEditor();
    if (editor && (document.activeElement === editor || editor.contains(document.activeElement))) {
      stampEditor(editor);
    }
  }
}, true);

// Still need MutationObserver for the send button, but debounced so it's cheap
function hookSendButton() {
  const editor = getEditor();
  if (!editor) return;
  const btn = document.querySelector(
    'button[aria-label="Send message"], button[aria-label="Send"]'
  );
  if (!btn || btn.dataset.tsHooked) return;
  btn.dataset.tsHooked = '1';
  btn.addEventListener('click', () => stampEditor(editor), true);
}

let debounceTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(hookSendButton, 500);
});

observer.observe(document.body, { childList: true, subtree: true });
