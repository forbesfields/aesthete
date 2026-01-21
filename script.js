// Initialize Lucide icons
lucide.createIcons();

// Critical DOM references - must be declared before use
const editor = document.getElementById('editor');
const statsCounter = document.getElementById('stats-counter');

// Liquid Glass Effect
const panel = document.querySelector('.bottom-panel');
const handleMouseMove = (e) => {
    const rect = panel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    panel.style.setProperty('--mouse-x', `${x}%`);
    panel.style.setProperty('--mouse-y', `${y}%`);
    panel.style.setProperty('--highlight-opacity', '1');
};

const handleMouseLeave = () => {
    panel.style.setProperty('--highlight-opacity', '0');
};

// Only enable mouse-tracking effects on devices with a mouse
if (window.matchMedia("(pointer: fine)").matches) {
    panel.addEventListener('mousemove', handleMouseMove);
    panel.addEventListener('mouseleave', handleMouseLeave);
}

// Settings Menu Toggle
function toggleSettingsMenu() {
    document.getElementById('settings-menu').classList.toggle('show');
}

function toggleDownloadMenu() {
    document.getElementById('download-menu').classList.toggle('show');
}

// Close menus when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.download-container')) {
        const menus = document.querySelectorAll('.download-menu');
        menus.forEach(menu => menu.classList.remove('show'));
    }
});

// Typography Management
function updateTypography(type, value) {
    if (type === 'fontSize') {
        document.documentElement.style.setProperty('--editor-pt', `${value}px`);
        localStorage.setItem('aesthete_font_size', value);
    } else if (type === 'lineHeight') {
        document.documentElement.style.setProperty('--editor-lh', value);
        localStorage.setItem('aesthete_line_height', value);
    }
}

// Fullscreen
function toggleFullscreen() {
    const btn = document.getElementById('fullscreen-btn');

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            btn.innerHTML = '<i data-lucide="minimize"></i>';
            lucide.createIcons();
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                btn.innerHTML = '<i data-lucide="maximize"></i>';
                lucide.createIcons();
            });
        }
    }
}

// Focus Mode
let focusMode = false;
function toggleFocusMode() {
    focusMode = !focusMode;
    document.body.classList.toggle('focus-mode', focusMode);
    document.getElementById('focus-btn').classList.toggle('format-active', focusMode);

    if (focusMode) {
        wrapTextInDivs();
        updateFocus();
    }
}

function wrapTextInDivs() {
    // If editor has direct text nodes or is empty, ensure it's structured for focus mode
    let hasDirectText = false;
    for (let node of editor.childNodes) {
        if (node.nodeType === 3 && node.textContent.trim() !== "") {
            hasDirectText = true;
            break;
        }
    }

    if (hasDirectText || editor.children.length === 0) {
        const content = editor.innerHTML;
        if (content.trim()) {
            editor.innerHTML = `<div>${content}</div>`;
        }
    }
}

function updateFocus() {
    if (!focusMode) return;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let node = selection.anchorNode;
        if (!node || node === editor) return;

        let current = node;
        while (current && current.parentNode !== editor) {
            current = current.parentNode;
        }

        if (current && current.parentNode === editor) {
            Array.from(editor.children).forEach(child => {
                child.classList.toggle('active-paragraph', child === current);
            });
        }
    }
}

document.addEventListener('selectionchange', updateFocus);

// Typewriter Mode
let typewriterMode = false;
function toggleTypewriterMode() {
    typewriterMode = !typewriterMode;
    document.body.classList.toggle('typewriter-active', typewriterMode);
    document.getElementById('typewriter-btn').classList.toggle('format-active', typewriterMode);
    if (typewriterMode) centerCaret();
}

function centerCaret() {
    if (!typewriterMode) return;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const winCenter = window.innerHeight / 2;
        const offset = rect.top - winCenter;
        if (Math.abs(offset) > 1) {
            window.scrollBy({ top: offset, behavior: 'smooth' });
        }
    }
}

function ensureCaretVisible() {
    if (typewriterMode) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Margin from bottom to ensure caret is not hidden behind the bottom panel
        // Bottom panel is approx 80-100px with padding/margin.
        // We add extra buffer to keep it visually clean.
        const bottomMargin = 120;
        const viewportHeight = window.innerHeight;

        if (rect.bottom > viewportHeight - bottomMargin) {
            const offset = rect.bottom - (viewportHeight - bottomMargin);
            window.scrollBy({ top: offset, behavior: 'smooth' });
        }
    }
}

editor.addEventListener('input', () => {
    updateStats();
    if (typewriterMode) {
        centerCaret();
    } else {
        ensureCaretVisible();
    }
});

// Additional triggers to ensure focus stays visible
editor.addEventListener('keyup', () => {
    if (typewriterMode) {
        centerCaret();
    } else {
        ensureCaretVisible();
    }
});
editor.addEventListener('mouseup', () => {
    if (typewriterMode) {
        centerCaret();
    } else {
        ensureCaretVisible();
    }
});
editor.addEventListener('click', () => {
    if (typewriterMode) {
        centerCaret();
    } else {
        ensureCaretVisible();
    }
});

// Pomodoro Timer
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
function togglePomodoro() {
    const btn = document.getElementById('pomodoro-btn');
    const display = document.getElementById('pomodoro-display');

    if (pomodoroTimer) {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btn.classList.remove('pomodoro-running');
        display.style.display = 'none';
        pomodoroSeconds = 25 * 60;
    } else {
        btn.classList.add('pomodoro-running');
        display.style.display = 'inline';
        display.innerText = "25:00";
        pomodoroSeconds = 25 * 60;

        pomodoroTimer = setInterval(() => {
            pomodoroSeconds--;
            const mins = Math.floor(pomodoroSeconds / 60);
            const secs = pomodoroSeconds % 60;
            display.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
            if (pomodoroSeconds <= 0) {
                clearInterval(pomodoroTimer);
                pomodoroTimer = null;
                alert("Time's up! Take a break.");
                btn.classList.remove('pomodoro-running');
                display.style.display = 'none';
            }
        }, 1000);
    }
}

// Writing Goals
let wordGoal = localStorage.getItem('aesthete_goal') ? parseInt(localStorage.getItem('aesthete_goal')) : null;
let goalReached = false;

function toggleGoalInput() {
    const wrapper = document.getElementById('goal-input-wrapper');
    const input = document.getElementById('goal-input');
    const btn = document.getElementById('set-goal-btn');

    wrapper.classList.toggle('hidden');
    btn.classList.remove('error');
    input.classList.remove('error');

    if (!wrapper.classList.contains('hidden')) {
        input.value = wordGoal || '';
        input.focus();
    }
}

function handleGoalKeydown(event) {
    if (event.key === 'Enter') {
        confirmGoal();
    } else if (event.key === 'Escape') {
        toggleGoalInput();
    }
}

function confirmGoal() {
    const input = document.getElementById('goal-input');
    const btn = document.getElementById('set-goal-btn');
    const value = input.value.trim();

    // Error checking - must be a positive number
    if (!value || isNaN(value) || parseInt(value) <= 0) {
        input.classList.add('error');
        btn.classList.add('error');
        input.focus();
        return;
    }

    // Valid number
    input.classList.remove('error');
    btn.classList.remove('error');
    wordGoal = parseInt(value);
    goalReached = false;
    localStorage.setItem('aesthete_goal', wordGoal);

    // Hide input and update button text
    document.getElementById('goal-input-wrapper').classList.add('hidden');
    btn.textContent = `Goal: ${wordGoal}`;

    updateStats();
}

function clearGoal() {
    wordGoal = null;
    goalReached = false;
    localStorage.removeItem('aesthete_goal');
    document.getElementById('set-goal-btn').textContent = 'Set Goal';
}

function showGoalComplete() {
    const msg = document.getElementById('goal-complete-msg');
    msg.classList.add('show');

    // Hide after 5 seconds
    setTimeout(() => {
        msg.classList.remove('show');
    }, 5000);
}

// Import Management
const fileImport = document.getElementById('file-import');
fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        // Simple MD to HTML conversion for import
        const html = content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/_(.*?)_/g, '<i>$1</i>');
        editor.innerHTML = html;
        updateStats();
    };
    reader.readAsText(file);
}

// Drag and Drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
        handleFile(file);
    }
});

// Theme Management
let currentTheme = localStorage.getItem('aesthete_theme') || 'light';
document.body.className = `${currentTheme}-mode`;

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');

    if (currentTheme === 'light') {
        body.className = 'sepia-mode';
        currentTheme = 'sepia';
        btn.innerHTML = '<i data-lucide="coffee"></i>';
    } else if (currentTheme === 'sepia') {
        body.className = 'dark-mode';
        currentTheme = 'dark';
        btn.innerHTML = '<i data-lucide="moon"></i>';
    } else {
        body.className = 'light-mode';
        currentTheme = 'light';
        btn.innerHTML = '<i data-lucide="sun"></i>';
    }

    localStorage.setItem('aesthete_theme', currentTheme);
    lucide.createIcons();
}

// Draft Explorer Logic
let drafts = JSON.parse(localStorage.getItem('aesthete_drafts')) || [];
let activeDraftId = localStorage.getItem('aesthete_active_draft_id');

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('sidebar-overlay').classList.toggle('show');
}

function loadDrafts() {
    const draftList = document.getElementById('draft-list');
    draftList.innerHTML = '';

    drafts.sort((a, b) => b.updated - a.updated).forEach(draft => {
        const item = document.createElement('div');
        item.className = `draft-item ${draft.id === activeDraftId ? 'active' : ''}`;
        item.onclick = () => switchDraft(draft.id);

        // Use document.innerText for a clean preview, but fallback to HTML if needed
        const previewText = draft.content.replace(/<[^>]*>/g, '').substring(0, 40) || 'Empty draft...';

        item.innerHTML = `
            <div class="draft-info">
                <div class="draft-name" id="draft-name-${draft.id}" ondblclick="event.stopPropagation(); enableRenaming('${draft.id}')" title="Double-click to rename">${draft.name}</div>
                <div class="draft-meta">${new Date(draft.updated).toLocaleDateString()} • ${previewText}</div>
            </div>
            <button class="delete-draft-btn" onclick="event.stopPropagation(); deleteDraft('${draft.id}')">
                <i data-lucide="trash-2" style="width: 16px;"></i>
            </button>
        `;
        draftList.appendChild(item);
    });
    lucide.createIcons();
}

function createNewDraft() {
    const id = Date.now().toString();
    const newDraft = {
        id: id,
        name: `Untitled Draft ${drafts.length + 1}`,
        content: '',
        updated: Date.now()
    };

    drafts.push(newDraft);
    switchDraft(id);
    toggleSidebar();
}

function switchDraft(id) {
    // Save current draft before switching
    if (activeDraftId) {
        const current = drafts.find(d => d.id === activeDraftId);
        if (current) {
            current.content = editor.innerHTML;
            current.updated = Date.now();
        }
    }

    activeDraftId = id;
    localStorage.setItem('aesthete_active_draft_id', id);

    const draft = drafts.find(d => d.id === id);
    if (draft) {
        editor.innerHTML = draft.content;
        updateStats();
    }

    localStorage.setItem('aesthete_drafts', JSON.stringify(drafts));
    loadDrafts();
}

function deleteDraft(id) {
    if (drafts.length <= 1) {
        alert("You must have at least one draft.");
        return;
    }

    if (confirm("Are you sure you want to delete this draft?")) {
        drafts = drafts.filter(d => d.id !== id);
        if (activeDraftId === id) {
            activeDraftId = drafts[0].id;
            editor.innerHTML = drafts[0].content;
        }
        localStorage.setItem('aesthete_drafts', JSON.stringify(drafts));
        loadDrafts();
        updateStats();
    }
}

// Renaming
function enableRenaming(id) {
    const nameEl = document.getElementById(`draft-name-${id}`);
    const currentName = nameEl.innerText;

    nameEl.innerHTML = `
        <input type="text" class="draft-rename-input" value="${currentName}" 
               onblur="saveDraftName('${id}', this.value)" 
               onkeydown="if(event.key === 'Enter') saveDraftName('${id}', this.value)"
               onclick="event.stopPropagation()">
    `;

    // Auto-focus the input
    const input = nameEl.querySelector('input');
    input.focus();
    input.select();
}

function saveDraftName(id, newName) {
    if (!newName || newName.trim() === "") return; // Don't save empty names

    const draft = drafts.find(d => d.id === id);
    if (draft) {
        draft.name = newName.trim();
        localStorage.setItem('aesthete_drafts', JSON.stringify(drafts));
        loadDrafts();
    }
}

// Importing
function triggerImport() {
    document.getElementById('import-file-input').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;

        // Use filename (without extension) as draft name
        const name = file.name.replace(/\.[^/.]+$/, "");

        const id = Date.now().toString();
        const newDraft = {
            id: id,
            name: name,
            content: content, // We assume simple text/md for now
            updated: Date.now()
        };

        drafts.push(newDraft);
        switchDraft(id);
        toggleSidebar(); // Close sidebar to start editing immediately, or keep open? Let's hide it.

        // Reset input so same file can be selected again if needed
        event.target.value = '';
    };

    reader.readAsText(file);
}

// Formatting
function toggleFormat(command) {
    document.execCommand(command, false, null);
    document.getElementById('editor').focus();
    updateFormatButtons();
}

function format(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

// Update formatting button states based on current selection
function updateFormatButtons() {
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');

    // Check if each format is active at the current cursor position
    boldBtn.classList.toggle('format-active', document.queryCommandState('bold'));
    italicBtn.classList.toggle('format-active', document.queryCommandState('italic'));
    underlineBtn.classList.toggle('format-active', document.queryCommandState('underline'));
}

// Listen for selection changes to update format button states
document.addEventListener('selectionchange', () => {
    // Only update if selection is within the editor
    const selection = window.getSelection();
    if (selection.anchorNode && editor.contains(selection.anchorNode)) {
        updateFormatButtons();
    }
});

// This section was moved up and merged with the general settings management



// Markdown Download
function downloadMD() {
    const editor = document.getElementById('editor');
    // Basic HTML to MD conversion
    let content = editor.innerHTML
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br>/g, '\n')
        .replace(/<b>|<strong>/g, '**')
        .replace(/<\/b>|<\/strong>/g, '**')
        .replace(/<i>|<em>/g, '_')
        .replace(/<\/i>|<\/em>/g, '_')
        .replace(/<u>/g, '<ins>')
        .replace(/<\/u>/g, '</ins>');

    // Create a temporary text element to decode HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = content;
    content = temp.innerText;

    saveFile(content, 'document.md', 'text/markdown');
    document.getElementById('download-menu').classList.remove('show');
}

// Text Download
function downloadTXT() {
    const content = document.getElementById('editor').innerText;
    saveFile(content, 'document.txt', 'text/plain');
    document.getElementById('download-menu').classList.remove('show');
}

// Copy as Markdown
function copyMarkdown() {
    // Same MD conversion as downloadMD()
    let content = editor.innerHTML
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br>/g, '\n')
        .replace(/<b>|<strong>/g, '**')
        .replace(/<\/b>|<\/strong>/g, '**')
        .replace(/<i>|<em>/g, '_')
        .replace(/<\/i>|<\/em>/g, '_')
        .replace(/<u>/g, '<ins>')
        .replace(/<\/u>/g, '</ins>');

    // Decode HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = content;
    content = temp.innerText;

    navigator.clipboard.writeText(content);
    document.getElementById('download-menu').classList.remove('show');
}

// Copy as Plain Text
function copyPlainText() {
    const content = document.getElementById('editor').innerText;
    navigator.clipboard.writeText(content);
    document.getElementById('download-menu').classList.remove('show');
}

// Helper to save files
function saveFile(content, filename, type) {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Required for Firefox and some browsers
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Placeholder Management
// (editor already declared at top of file)
const placeholderText = "Start writing something beautiful...";

if (editor.innerText.trim() === "") {
    editor.dataset.placeholder = placeholderText;
}

editor.addEventListener('focus', () => {
    if (editor.innerText.trim() === placeholderText) {
        // Handle custom placeholder if needed
    }
});

// Counter Management
// (statsCounter already declared at top of file)

function updateStats() {
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Update word count based on whether goal is active
    if (wordGoal && !goalReached) {
        document.getElementById('word-count').innerText = `${words}/${wordGoal} words`;

        // Check if goal is reached
        if (words >= wordGoal) {
            goalReached = true;
            showGoalComplete();
            clearGoal();
            // Update to show normal format
            document.getElementById('word-count').innerText = `${words} word${words !== 1 ? 's' : ''}`;
        }
    } else {
        document.getElementById('word-count').innerText = `${words} word${words !== 1 ? 's' : ''}`;
    }

    document.getElementById('char-count').innerText = `${chars} character${chars !== 1 ? 's' : ''}`;
    document.getElementById('read-time').innerText = `${readingTime} min read`;

    // Save to multi-draft system
    if (activeDraftId) {
        const draft = drafts.find(d => d.id === activeDraftId);
        if (draft) {
            draft.content = editor.innerHTML;
            draft.updated = Date.now();
            localStorage.setItem('aesthete_drafts', JSON.stringify(drafts));
        }
    }
}

editor.addEventListener('input', updateStats);

// Auto-focus editor on load
window.onload = () => {
    // Migration: Check for legacy single-draft and convert to multi-draft
    const legacyDraft = localStorage.getItem('aesthete_draft');
    if (legacyDraft && drafts.length === 0) {
        const id = Date.now().toString();
        drafts.push({
            id: id,
            name: "Initial Draft",
            content: legacyDraft,
            updated: Date.now()
        });
        activeDraftId = id;
        localStorage.setItem('aesthete_drafts', JSON.stringify(drafts));
        localStorage.setItem('aesthete_active_draft_id', id);
        localStorage.removeItem('aesthete_draft');
    }

    // Initialize multi-draft system if empty
    if (drafts.length === 0) {
        createNewDraft();
    } else {
        if (!activeDraftId) activeDraftId = drafts[0].id;
        const draft = drafts.find(d => d.id === activeDraftId);
        if (draft) {
            editor.innerHTML = draft.content;
        }
        loadDrafts();
    }

    // Restore theme icon
    const themeBtn = document.getElementById('theme-btn');
    if (currentTheme === 'sepia') themeBtn.innerHTML = '<i data-lucide="coffee"></i>';
    else if (currentTheme === 'dark') themeBtn.innerHTML = '<i data-lucide="moon"></i>';
    else themeBtn.innerHTML = '<i data-lucide="sun"></i>';
    lucide.createIcons();

    // Load saved typography
    const savedFontSize = localStorage.getItem('aesthete_font_size');
    const savedLineHeight = localStorage.getItem('aesthete_line_height');

    if (savedFontSize) {
        updateTypography('fontSize', savedFontSize);
        document.getElementById('font-size-slider').value = savedFontSize;
    }
    if (savedLineHeight) {
        updateTypography('lineHeight', savedLineHeight);
        document.getElementById('line-height-slider').value = savedLineHeight;
    }

    // Restore goal button state if a goal exists
    if (wordGoal) {
        document.getElementById('set-goal-btn').textContent = `Goal: ${wordGoal}`;
    }

    editor.focus();
    updateStats();
};

// Find & Replace Logic
function toggleFindBar() {
    const bar = document.getElementById('find-replace-bar');
    const input = document.getElementById('find-input');
    const isShowing = bar.classList.toggle('show');

    if (isShowing) {
        input.focus();
        input.select();
        updateFindCount();
    } else {
        editor.focus();
    }
}

function handleFindKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleFind(event.shiftKey);
    } else if (event.key === 'Escape') {
        toggleFindBar();
    }
}

function handleReplaceKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleReplace();
    } else if (event.key === 'Escape') {
        toggleFindBar();
    }
}

function handleFind(backwards = false) {
    const query = document.getElementById('find-input').value;
    if (!query) return;

    // window.find(string, caseSensitive, backwards, wrapAround, wholeWord, searchInFrames, showDialog)
    const found = window.find(query, false, backwards, true, false, false, false);

    if (!found) {
        // If not found and we were searching, maybe try from top?
        // window.find usually handles wrapAround: true well enough.
    }

    updateFindCount();
}

function updateFindCount() {
    const query = document.getElementById('find-input').value;
    const countEl = document.getElementById('find-count');

    if (!query) {
        countEl.innerText = '0/0';
        return;
    }

    // Since window.find doesn't give us the total/current index easily,
    // we do a quick count of all occurrences in the text.
    const text = editor.innerText;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    const total = matches ? matches.length : 0;

    // Attempting to track "current" index is tricky with window.find.
    // We'll show just the total for now to keep it clean, or 1/N if matches exist.
    countEl.innerText = total > 0 ? `Matches: ${total}` : '0/0';
}

function handleReplace() {
    const query = document.getElementById('find-input').value;
    const replacement = document.getElementById('replace-input').value;

    if (!query) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        // If current selection matches query (case-insensitive)
        if (selectedText.toLowerCase() === query.toLowerCase()) {
            // Replace with preserving common formatting if it was just text
            // For contenteditable, it's often better to use insertHTML or similar
            document.execCommand('insertText', false, replacement);
            handleFind(false); // Move to next
        } else {
            // If nothing is selected or it doesn't match, find the next one first
            handleFind(false);
            const newSelection = window.getSelection();
            if (newSelection.toString().toLowerCase() === query.toLowerCase()) {
                document.execCommand('insertText', false, replacement);
                handleFind(false);
            }
        }
    }
}

function handleReplaceAll() {
    const query = document.getElementById('find-input').value;
    const replacement = document.getElementById('replace-input').value;

    if (!query) return;

    const content = editor.innerHTML;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // We use a trick to replace only in text nodes if possible, but for simplicity
    // and given the app's structure, a global innerHTML replace is often okay
    // if we are careful with HTML tags. 
    // Better: use a temporary container to avoid breaking Lucide icons etc if any were in editor.

    // Let's do it safely by iterating with find
    let count = 0;
    // Move to start
    selectionToStart();

    while (window.find(query, false, false, false, false, false, false)) {
        document.execCommand('insertText', false, replacement);
        count++;
        if (count > 1000) break; // Safety break
    }

    alert(`Replaced ${count} occurrences.`);
    updateStats();
    toggleFindBar();
}

function selectionToStart() {
    const range = document.createRange();
    range.setStart(editor, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// Global Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd+F or Ctrl+F
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleFindBar();
    }
});

