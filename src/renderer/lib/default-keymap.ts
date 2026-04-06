import type { HotkeyDefinition, HotkeyMap, HotkeyCategory, HotkeyContext } from '@/types/hotkeys'

function makeHotkey(
  id: string,
  label: string,
  description: string,
  category: HotkeyCategory,
  context: HotkeyContext,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return {
    id,
    label,
    description,
    category,
    context,
    default: { mac, windows: win, linux: win },
    current: { mac, windows: win, linux: win },
    isRemappable: opts?.isRemappable ?? true,
    requiresConfirm: opts?.requiresConfirm ?? false,
    wcagRequired: opts?.wcagRequired ?? false
  }
}

function globalHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`global.${id}`, label, description, 'global', 'global', mac, win, opts)
}

function recordingHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`recording.${id}`, label, description, 'recording', 'recording-panel', mac, win, opts)
}

function slideHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`slide.${id}`, label, description, 'slide-editor', 'slide-editor', mac, win, opts)
}

const hotkeys: HotkeyDefinition[] = [
  // ─── §3.1 Global Hotkeys ───
  globalHotkey('undo', 'Undo', 'Undo the last action', 'Cmd+Z', 'Ctrl+Z'),
  globalHotkey('redo', 'Redo', 'Redo the last undone action', 'Cmd+Shift+Z', 'Ctrl+Y'),
  globalHotkey('save', 'Save', 'Save the current course', 'Cmd+S', 'Ctrl+S'),
  globalHotkey('saveAs', 'Save As', 'Save the current course to a new file', 'Cmd+Shift+S', 'Ctrl+Shift+S'),
  globalHotkey('newCourse', 'New Course', 'Create a new course', 'Cmd+N', 'Ctrl+N'),
  globalHotkey('openCourse', 'Open Course', 'Open an existing course', 'Cmd+O', 'Ctrl+O'),
  globalHotkey('closeCourse', 'Close Course', 'Close the current course', 'Cmd+W', 'Ctrl+W'),
  globalHotkey('preferences', 'Open Settings', 'Open the application settings', 'Cmd+,', 'Ctrl+,'),
  globalHotkey('help', 'Open Help / TIPPY', 'Open the help panel or TIPPY assistant', 'F1', 'F1'),
  globalHotkey('hotkeyReference', 'Show Hotkey Reference', 'Open the in-app hotkey reference panel', 'Cmd+/', 'Ctrl+/', { isRemappable: false }),
  globalHotkey('search', 'Search Application', 'Open the command palette', 'Cmd+K', 'Ctrl+K'),
  globalHotkey('toggleSidebar', 'Toggle Sidebar', 'Show or hide the sidebar', 'Cmd+\\', 'Ctrl+\\'),
  globalHotkey('toggleFullscreen', 'Toggle Fullscreen', 'Enter or exit fullscreen mode', 'Ctrl+Cmd+F', 'F11'),
  globalHotkey('zoomIn', 'Zoom In', 'Increase the zoom level', 'Cmd+=', 'Ctrl+='),
  globalHotkey('zoomOut', 'Zoom Out', 'Decrease the zoom level', 'Cmd+-', 'Ctrl+-'),
  globalHotkey('zoomReset', 'Reset Zoom', 'Reset zoom to 100%', 'Cmd+0', 'Ctrl+0'),
  globalHotkey('switchPanel1', 'Go to Course Editor', 'Switch to the Course Editor panel', 'Cmd+1', 'Ctrl+1'),
  globalHotkey('switchPanel2', 'Go to Media Library', 'Switch to the Media Library panel', 'Cmd+2', 'Ctrl+2'),
  globalHotkey('switchPanel3', 'Go to Recording Panel', 'Switch to the Recording Panel', 'Cmd+3', 'Ctrl+3'),
  globalHotkey('switchPanel4', 'Go to Syllabus Builder', 'Switch to the Syllabus Builder', 'Cmd+4', 'Ctrl+4'),
  globalHotkey('switchPanel5', 'Go to Analytics', 'Switch to the Analytics panel', 'Cmd+5', 'Ctrl+5'),
  globalHotkey('switchPanel6', 'Go to Export', 'Switch to the Export panel', 'Cmd+6', 'Ctrl+6'),
  globalHotkey('focusMainContent', 'Skip to Main Content', 'Skip navigation and focus the main content area', 'Cmd+Shift+M', 'Ctrl+Shift+M', { wcagRequired: true }),
  globalHotkey('announceStatus', 'Announce Current Status', 'Trigger screen reader live region announcement', 'Cmd+Shift+A', 'Ctrl+Shift+A', { wcagRequired: true }),

  // ─── §3.2 Recording Panel Hotkeys ───
  recordingHotkey('startStop', 'Start / Stop Recording', 'Toggle recording on or off', 'Cmd+R', 'Ctrl+R'),
  recordingHotkey('pause', 'Pause / Resume Recording', 'Pause or resume the current recording', 'Cmd+P', 'Ctrl+P'),
  recordingHotkey('cancelDiscard', 'Cancel and Discard Recording', 'Cancel recording and discard all captured data', 'Cmd+Shift+Backspace', 'Ctrl+Shift+Delete', { requiresConfirm: true }),
  recordingHotkey('marker', 'Add Timestamp Marker', 'Add a marker at the current timestamp during recording', 'M', 'M'),
  recordingHotkey('screenshot', 'Capture Screenshot', 'Capture the current frame as a screenshot', 'Cmd+Shift+4', 'Ctrl+Shift+4'),
  recordingHotkey('micToggle', 'Toggle Microphone', 'Enable or disable the microphone', 'Cmd+Shift+M', 'Ctrl+Shift+M'),
  recordingHotkey('systemAudioToggle', 'Toggle System Audio Capture', 'Enable or disable system audio capture', 'Cmd+Shift+U', 'Ctrl+Shift+U'),
  recordingHotkey('webcamToggle', 'Toggle Webcam Overlay', 'Show or hide the webcam overlay', 'Cmd+Shift+W', 'Ctrl+Shift+W'),
  recordingHotkey('selectRegion', 'Select Recording Region', 'Open the region picker to select recording area', 'Cmd+Shift+R', 'Ctrl+Shift+R'),
  recordingHotkey('fullScreen', 'Set to Full Screen Recording', 'Set recording mode to full screen', 'Cmd+Shift+F', 'Ctrl+Shift+F'),
  recordingHotkey('countdownToggle', 'Toggle Countdown Before Record', 'Enable or disable the pre-recording countdown', 'Cmd+Shift+C', 'Ctrl+Shift+C'),
  recordingHotkey('levelCheck', 'Run Audio Level Check', 'Check microphone audio levels', 'Cmd+Shift+L', 'Ctrl+Shift+L'),
  recordingHotkey('previewToggle', 'Toggle Recording Preview', 'Play or pause the recording preview', 'Space', 'Space'),

  // ─── §3.4 Slide Editor Hotkeys ───
  slideHotkey('newSlide', 'Add New Slide', 'Insert a new slide after the current one', 'Cmd+Shift+N', 'Ctrl+Shift+N'),
  slideHotkey('duplicateSlide', 'Duplicate Current Slide', 'Create a copy of the current slide', 'Cmd+D', 'Ctrl+D'),
  slideHotkey('deleteSlide', 'Delete Current Slide', 'Remove the current slide from the course', 'Cmd+Backspace', 'Ctrl+Delete', { requiresConfirm: true }),
  slideHotkey('movePrev', 'Move Slide Up / Back', 'Reorder the current slide earlier in the sequence', 'Cmd+Shift+Up', 'Ctrl+Shift+Up'),
  slideHotkey('moveNext', 'Move Slide Down / Forward', 'Reorder the current slide later in the sequence', 'Cmd+Shift+Down', 'Ctrl+Shift+Down'),
  slideHotkey('navPrev', 'Navigate to Previous Slide', 'Go to the previous slide', 'Left Arrow', 'Left Arrow'),
  slideHotkey('navNext', 'Navigate to Next Slide', 'Go to the next slide', 'Right Arrow', 'Right Arrow'),
  slideHotkey('navFirst', 'Go to First Slide', 'Navigate to the first slide', 'Cmd+Home', 'Ctrl+Home'),
  slideHotkey('navLast', 'Go to Last Slide', 'Navigate to the last slide', 'Cmd+End', 'Ctrl+End'),
  slideHotkey('addTextBlock', 'Add Text Block', 'Insert a new text block on the slide', 'T', 'T'),
  slideHotkey('addImageBlock', 'Add Image Block', 'Insert a new image block on the slide', 'I', 'I'),
  slideHotkey('addVideoBlock', 'Add Video Block', 'Insert a new video block on the slide', 'V', 'V'),
  slideHotkey('addChartBlock', 'Add Chart Block', 'Insert a new chart block on the slide', 'G', 'G'),
  slideHotkey('addShapeBlock', 'Add Shape', 'Insert a new shape on the slide', 'S', 'S'),
  slideHotkey('addHotspot', 'Add Hotspot Callout', 'Insert a hotspot callout on the slide', 'H', 'H'),
  slideHotkey('previewSlide', 'Preview Current Slide', 'Preview the current slide in learner view', 'Cmd+Shift+P', 'Ctrl+Shift+P'),
  slideHotkey('presentMode', 'Enter Presentation Mode', 'Start presentation mode from the current slide', 'Cmd+Shift+Enter', 'Ctrl+Shift+Enter'),
  slideHotkey('exitPresent', 'Exit Presentation Mode', 'Exit presentation mode and return to the editor', 'Escape', 'Escape'),
  slideHotkey('selectAll', 'Select All Blocks on Slide', 'Select all blocks on the current slide', 'Cmd+A', 'Ctrl+A'),
  slideHotkey('deselectAll', 'Deselect All', 'Deselect all selected blocks', 'Escape', 'Escape'),
  slideHotkey('group', 'Group Selected Blocks', 'Group the selected blocks together', 'Cmd+G', 'Ctrl+G'),
  slideHotkey('ungroup', 'Ungroup', 'Ungroup the selected group', 'Cmd+Shift+G', 'Ctrl+Shift+G'),
  slideHotkey('bringForward', 'Bring Forward', 'Move the selected block one layer forward', 'Cmd+]', 'Ctrl+]'),
  slideHotkey('sendBackward', 'Send Backward', 'Move the selected block one layer backward', 'Cmd+[', 'Ctrl+['),
  slideHotkey('bringToFront', 'Bring to Front', 'Move the selected block to the top layer', 'Cmd+Shift+]', 'Ctrl+Shift+]'),
  slideHotkey('sendToBack', 'Send to Back', 'Move the selected block to the bottom layer', 'Cmd+Shift+[', 'Ctrl+Shift+['),
  slideHotkey('alignLeft', 'Align Selected Left', 'Align selected blocks to the left', 'Cmd+Shift+L', 'Ctrl+Shift+L'),
  slideHotkey('alignCenter', 'Align Selected Center', 'Align selected blocks to the horizontal center', 'Cmd+Shift+E', 'Ctrl+Shift+E'),
  slideHotkey('alignRight', 'Align Selected Right', 'Align selected blocks to the right', 'Cmd+Shift+R', 'Ctrl+Shift+R'),
  slideHotkey('alignTop', 'Align Selected Top', 'Align selected blocks to the top', 'Cmd+Shift+T', 'Ctrl+Shift+T'),
  slideHotkey('alignMiddle', 'Align Selected Middle', 'Align selected blocks to the vertical center', 'Cmd+Shift+V', 'Ctrl+Shift+V'),
  slideHotkey('alignBottom', 'Align Selected Bottom', 'Align selected blocks to the bottom', 'Cmd+Shift+B', 'Ctrl+Shift+B'),
  slideHotkey('lockBlock', 'Lock / Unlock Selected Block', 'Toggle lock state on the selected block', 'Cmd+L', 'Ctrl+L'),
  slideHotkey('copyStyle', 'Copy Block Style', 'Copy the style of the selected block', 'Cmd+Option+C', 'Ctrl+Alt+C'),
  slideHotkey('pasteStyle', 'Paste Block Style', 'Apply copied style to the selected block', 'Cmd+Option+V', 'Ctrl+Alt+V'),
  slideHotkey('runWCAGCheck', 'Run WCAG Check on Slide', 'Run an accessibility check on the current slide', 'Cmd+Shift+W', 'Ctrl+Shift+W')
]

export const DEFAULT_KEYMAP: HotkeyMap = Object.fromEntries(
  hotkeys.map((h) => [h.id, h])
)
