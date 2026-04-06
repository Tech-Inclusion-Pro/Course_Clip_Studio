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

function timelineHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`timeline.${id}`, label, description, 'timeline', 'timeline', mac, win, opts)
}

function textHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`text.${id}`, label, description, 'text', 'text-focused', mac, win, opts)
}

function mediaHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`media.${id}`, label, description, 'media', 'media-library', mac, win, opts)
}

function syllabusHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`syllabus.${id}`, label, description, 'syllabus', 'syllabus-builder', mac, win, opts)
}

function exportHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`export.${id}`, label, description, 'export', 'export-panel', mac, win, opts)
}

function a11yHotkey(
  id: string,
  label: string,
  description: string,
  mac: string,
  win: string,
  opts?: { isRemappable?: boolean; requiresConfirm?: boolean; wcagRequired?: boolean }
): HotkeyDefinition {
  return makeHotkey(`a11y.${id}`, label, description, 'accessibility', 'global', mac, win, { wcagRequired: true, ...opts })
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
  slideHotkey('runWCAGCheck', 'Run WCAG Check on Slide', 'Run an accessibility check on the current slide', 'Cmd+Shift+W', 'Ctrl+Shift+W'),

  // ─── §3.3 Timeline Editor Hotkeys ───
  timelineHotkey('playPause', 'Play / Pause', 'Play or pause timeline playback', 'Space', 'Space'),
  timelineHotkey('scrubLeft', 'Scrub Left 1 Frame', 'Move the playhead left by one frame', 'Left Arrow', 'Left Arrow'),
  timelineHotkey('scrubRight', 'Scrub Right 1 Frame', 'Move the playhead right by one frame', 'Right Arrow', 'Right Arrow'),
  timelineHotkey('scrubLeft5', 'Scrub Left 5 Seconds', 'Move the playhead left by 5 seconds', 'Shift+Left', 'Shift+Left'),
  timelineHotkey('scrubRight5', 'Scrub Right 5 Seconds', 'Move the playhead right by 5 seconds', 'Shift+Right', 'Shift+Right'),
  timelineHotkey('goToStart', 'Go to Start', 'Move the playhead to the beginning', 'Home', 'Home'),
  timelineHotkey('goToEnd', 'Go to End', 'Move the playhead to the end', 'End', 'End'),
  timelineHotkey('addCutPoint', 'Add Cut Point at Playhead', 'Insert a cut point at the current playhead position', 'C', 'C'),
  timelineHotkey('deleteCutPoint', 'Delete Selected Cut Point', 'Remove the selected cut point', 'Backspace', 'Delete'),
  timelineHotkey('splitClip', 'Split Clip at Playhead', 'Split the clip at the current playhead position', 'Cmd+Shift+X', 'Ctrl+Shift+X'),
  timelineHotkey('mergeClips', 'Merge Selected Clips', 'Merge the selected clips into one', 'Cmd+Shift+J', 'Ctrl+Shift+J'),
  timelineHotkey('deleteClip', 'Delete Selected Clip', 'Delete the selected clip from the timeline', 'Cmd+Backspace', 'Ctrl+Delete', { requiresConfirm: true }),
  timelineHotkey('rippleDelete', 'Ripple Delete Selected Clip', 'Delete the selected clip and close the gap', 'Option+Backspace', 'Alt+Delete'),
  timelineHotkey('muteClip', 'Mute / Unmute Selected Clip', 'Toggle mute on the selected clip', 'Cmd+Shift+M', 'Ctrl+Shift+M'),
  timelineHotkey('zoomIn', 'Zoom Timeline In', 'Zoom in on the timeline', 'Cmd+=', 'Ctrl+='),
  timelineHotkey('zoomOut', 'Zoom Timeline Out', 'Zoom out on the timeline', 'Cmd+-', 'Ctrl+-'),
  timelineHotkey('fitToWindow', 'Fit Timeline to Window', 'Fit the entire timeline to the visible area', 'Cmd+Shift+F', 'Ctrl+Shift+F'),
  timelineHotkey('addCaption', 'Add Caption at Playhead', 'Add a caption at the current playhead position', 'Cmd+T', 'Ctrl+T'),
  timelineHotkey('addMarker', 'Add Named Marker', 'Add a named marker at the current playhead position', 'Cmd+M', 'Ctrl+M'),
  timelineHotkey('selectAll', 'Select All Clips', 'Select all clips on the timeline', 'Cmd+A', 'Ctrl+A'),
  timelineHotkey('deselectAll', 'Deselect All', 'Deselect all selected clips', 'Escape', 'Escape'),
  timelineHotkey('nudgeLeft', 'Nudge Selected Clip Left', 'Move the selected clip left by one frame', 'Option+Left', 'Alt+Left'),
  timelineHotkey('nudgeRight', 'Nudge Selected Clip Right', 'Move the selected clip right by one frame', 'Option+Right', 'Alt+Right'),

  // ─── §3.5 Text Formatting Hotkeys ───
  textHotkey('bold', 'Bold', 'Apply bold formatting', 'Cmd+B', 'Ctrl+B'),
  textHotkey('italic', 'Italic', 'Apply italic formatting', 'Cmd+I', 'Ctrl+I'),
  textHotkey('underline', 'Underline', 'Apply underline formatting', 'Cmd+U', 'Ctrl+U'),
  textHotkey('strikethrough', 'Strikethrough', 'Apply strikethrough formatting', 'Cmd+Shift+X', 'Ctrl+Shift+X'),
  textHotkey('code', 'Inline Code', 'Apply inline code formatting', 'Cmd+Shift+C', 'Ctrl+Shift+C'),
  textHotkey('link', 'Insert / Edit Link', 'Insert or edit a hyperlink', 'Cmd+K', 'Ctrl+K'),
  textHotkey('clearFormat', 'Clear Formatting', 'Remove all formatting from selected text', 'Cmd+\\', 'Ctrl+\\'),
  textHotkey('heading1', 'Heading 1', 'Format as Heading 1', 'Cmd+Option+1', 'Ctrl+Alt+1'),
  textHotkey('heading2', 'Heading 2', 'Format as Heading 2', 'Cmd+Option+2', 'Ctrl+Alt+2'),
  textHotkey('heading3', 'Heading 3', 'Format as Heading 3', 'Cmd+Option+3', 'Ctrl+Alt+3'),
  textHotkey('paragraph', 'Normal Paragraph', 'Format as normal paragraph text', 'Cmd+Option+0', 'Ctrl+Alt+0'),
  textHotkey('bulletList', 'Toggle Bullet List', 'Toggle bullet list formatting', 'Cmd+Shift+8', 'Ctrl+Shift+8'),
  textHotkey('numberedList', 'Toggle Numbered List', 'Toggle numbered list formatting', 'Cmd+Shift+7', 'Ctrl+Shift+7'),
  textHotkey('increaseIndent', 'Increase Indent', 'Increase indentation level in list context', 'Tab', 'Tab'),
  textHotkey('decreaseIndent', 'Decrease Indent', 'Decrease indentation level in list context', 'Shift+Tab', 'Shift+Tab'),
  textHotkey('alignLeft', 'Align Text Left', 'Align text to the left', 'Cmd+Shift+L', 'Ctrl+Shift+L'),
  textHotkey('alignCenter', 'Align Text Center', 'Align text to the center', 'Cmd+Shift+E', 'Ctrl+Shift+E'),
  textHotkey('alignRight', 'Align Text Right', 'Align text to the right', 'Cmd+Shift+R', 'Ctrl+Shift+R'),
  textHotkey('alignJustify', 'Justify Text', 'Justify text alignment', 'Cmd+Shift+J', 'Ctrl+Shift+J'),
  textHotkey('selectAll', 'Select All Text', 'Select all text in the current block', 'Cmd+A', 'Ctrl+A'),
  textHotkey('selectWord', 'Select Current Word', 'Select the word at the cursor', 'Cmd+D', 'Ctrl+D'),
  textHotkey('selectLine', 'Select to End of Line', 'Select from cursor to end of line', 'Shift+End', 'Shift+End'),
  textHotkey('deletePrevWord', 'Delete Previous Word', 'Delete the word before the cursor', 'Option+Backspace', 'Ctrl+Backspace'),
  textHotkey('deleteNextWord', 'Delete Next Word', 'Delete the word after the cursor', 'Option+Delete', 'Ctrl+Delete'),
  textHotkey('insertMath', 'Insert Math / LaTeX Expression', 'Insert a math or LaTeX expression', 'Cmd+Shift+M', 'Ctrl+Shift+M'),
  textHotkey('spellCheck', 'Run Spell Check', 'Run spell check on the current text', 'F7', 'F7'),
  textHotkey('readabilityCheck', 'Check Reading Level', 'Check the reading level of the text', 'Cmd+Shift+F', 'Ctrl+Shift+F'),
  textHotkey('exitTextBlock', 'Exit Text Block', 'Exit the text block and return to the slide', 'Escape', 'Escape'),

  // ─── §3.6 Media Library Hotkeys ───
  mediaHotkey('search', 'Focus Search Bar', 'Focus the media library search bar', 'Cmd+F', 'Ctrl+F'),
  mediaHotkey('upload', 'Upload New Asset', 'Open the file picker to upload a new asset', 'Cmd+U', 'Ctrl+U'),
  mediaHotkey('newFolder', 'Create New Folder', 'Create a new folder in the media library', 'Cmd+Shift+N', 'Ctrl+Shift+N'),
  mediaHotkey('delete', 'Delete Selected Asset', 'Delete the selected asset from the library', 'Cmd+Backspace', 'Delete', { requiresConfirm: true }),
  mediaHotkey('rename', 'Rename Selected Asset', 'Rename the selected asset', 'F2', 'F2'),
  mediaHotkey('preview', 'Preview Selected Asset', 'Preview the selected asset', 'Space', 'Space'),
  mediaHotkey('insertAsset', 'Insert Selected Asset into Course', 'Insert the selected asset at the current cursor position', 'Return', 'Enter'),
  mediaHotkey('selectAll', 'Select All Assets in View', 'Select all assets in the current view', 'Cmd+A', 'Ctrl+A'),
  mediaHotkey('deselectAll', 'Deselect All', 'Deselect all selected assets', 'Escape', 'Escape'),
  mediaHotkey('filterImages', 'Filter: Show Images Only', 'Show only image assets', 'Cmd+1', 'Ctrl+1'),
  mediaHotkey('filterVideo', 'Filter: Show Video Only', 'Show only video assets', 'Cmd+2', 'Ctrl+2'),
  mediaHotkey('filterAudio', 'Filter: Show Audio Only', 'Show only audio assets', 'Cmd+3', 'Ctrl+3'),
  mediaHotkey('filterIcons', 'Filter: Show Icons Only', 'Show only icon assets', 'Cmd+4', 'Ctrl+4'),
  mediaHotkey('filterAll', 'Show All Assets', 'Show all assets without filtering', 'Cmd+0', 'Ctrl+0'),
  mediaHotkey('toggleView', 'Toggle Grid / List View', 'Switch between grid and list view', 'Cmd+Shift+V', 'Ctrl+Shift+V'),
  mediaHotkey('editAltText', 'Edit Alt Text for Selected Asset', 'Edit the alt text for the selected asset', 'Cmd+Option+A', 'Ctrl+Alt+A'),
  mediaHotkey('generateAltText', 'Generate Alt Text with AI', 'Generate alt text using AI', 'Cmd+Option+G', 'Ctrl+Alt+G'),
  mediaHotkey('copyAssetLink', 'Copy Asset Reference Link', 'Copy a reference link to the selected asset', 'Cmd+C', 'Ctrl+C'),

  // ─── §3.7 Syllabus Builder Hotkeys ───
  syllabusHotkey('nextStep', 'Advance to Next Wizard Step', 'Move to the next step in the syllabus wizard', 'Cmd+Return', 'Ctrl+Enter'),
  syllabusHotkey('prevStep', 'Go Back to Previous Step', 'Return to the previous wizard step', 'Cmd+Shift+Return', 'Ctrl+Shift+Enter'),
  syllabusHotkey('addObjective', 'Add New Learning Objective', 'Add a new learning objective', 'Cmd+Shift+O', 'Ctrl+Shift+O'),
  syllabusHotkey('deleteObjective', 'Delete Selected Objective', 'Delete the selected learning objective', 'Cmd+Backspace', 'Ctrl+Delete'),
  syllabusHotkey('moveObjUp', 'Move Objective Up', 'Move the selected objective up in the list', 'Option+Up', 'Alt+Up'),
  syllabusHotkey('moveObjDown', 'Move Objective Down', 'Move the selected objective down in the list', 'Option+Down', 'Alt+Down'),
  syllabusHotkey('generateObjectives', 'Generate Objectives with AI', 'Generate learning objectives using AI', 'Cmd+Option+O', 'Ctrl+Alt+O'),
  syllabusHotkey('generateAssignment', 'Generate Assignment with AI', 'Generate an assignment using AI', 'Cmd+Option+A', 'Ctrl+Alt+A'),
  syllabusHotkey('generateRubric', 'Generate Rubric with AI', 'Generate a rubric using AI', 'Cmd+Option+R', 'Ctrl+Alt+R'),
  syllabusHotkey('previewSyllabus', 'Preview Syllabus', 'Preview the syllabus document', 'Cmd+Shift+P', 'Ctrl+Shift+P'),
  syllabusHotkey('exportSyllabus', 'Export Syllabus', 'Export the syllabus document', 'Cmd+Shift+E', 'Ctrl+Shift+E'),
  syllabusHotkey('saveSection', 'Save Current Section', 'Save the current syllabus section', 'Cmd+S', 'Ctrl+S'),
  syllabusHotkey('toggleUDLPanel', 'Show / Hide UDL Guidance Panel', 'Toggle the UDL guidance panel visibility', 'Cmd+Shift+U', 'Ctrl+Shift+U'),
  syllabusHotkey('runWCAGCheck', 'Run WCAG Check on Syllabus', 'Run an accessibility check on the syllabus', 'Cmd+Shift+W', 'Ctrl+Shift+W'),

  // ─── §3.8 Export Hotkeys ───
  exportHotkey('exportSCORM', 'Export as SCORM', 'Export the course as a SCORM package', 'Cmd+Shift+1', 'Ctrl+Shift+1'),
  exportHotkey('exportxAPI', 'Export as xAPI / Tin Can', 'Export the course as an xAPI package', 'Cmd+Shift+2', 'Ctrl+Shift+2'),
  exportHotkey('exportHTML', 'Export as HTML', 'Export the course as HTML', 'Cmd+Shift+3', 'Ctrl+Shift+3'),
  exportHotkey('exportPDF', 'Export as PDF', 'Export the course as a PDF document', 'Cmd+Shift+4', 'Ctrl+Shift+4'),
  exportHotkey('exportVideo', 'Export as Video', 'Export the course as a video file', 'Cmd+Shift+5', 'Ctrl+Shift+5'),
  exportHotkey('exportWord', 'Export as Word Document', 'Export the course as a Word document', 'Cmd+Shift+6', 'Ctrl+Shift+6'),
  exportHotkey('runPreflightCheck', 'Run Preflight Accessibility Check', 'Run a preflight accessibility check before export', 'Cmd+Shift+W', 'Ctrl+Shift+W'),
  exportHotkey('openExportFolder', 'Open Export Destination Folder', 'Open the folder where exports are saved', 'Cmd+Shift+O', 'Ctrl+Shift+O'),

  // ─── §3.9 Accessibility-Specific Hotkeys ───
  a11yHotkey('runWCAGCheck', 'Run WCAG Check on Current View', 'Run a context-sensitive WCAG check on the active panel', 'Cmd+Shift+W', 'Ctrl+Shift+W'),
  a11yHotkey('nextIssue', 'Jump to Next WCAG Issue', 'Navigate to the next open WCAG issue', 'Cmd+Shift+.', 'Ctrl+Shift+.'),
  a11yHotkey('prevIssue', 'Jump to Previous WCAG Issue', 'Navigate to the previous WCAG issue', 'Cmd+Shift+,', 'Ctrl+Shift+,'),
  a11yHotkey('dismissIssue', 'Dismiss / Acknowledge Issue', 'Dismiss or acknowledge the current WCAG issue', 'Cmd+Shift+D', 'Ctrl+Shift+D'),
  a11yHotkey('fixIssue', 'Apply Auto-Fix to Issue', 'Apply an automatic fix to the current issue', 'Cmd+Shift+F', 'Ctrl+Shift+F'),
  a11yHotkey('showMeIssue', 'Open Show Me Walkthrough for Issue', 'Open a guided walkthrough for the current issue', 'Cmd+Shift+H', 'Ctrl+Shift+H'),
  a11yHotkey('toggleReadingOrder', 'Show / Hide Reading Order Overlay', 'Toggle the reading order overlay on the slide', 'Cmd+Option+R', 'Ctrl+Alt+R'),
  a11yHotkey('checkContrast', 'Check Contrast on Selection', 'Check the contrast ratio on the selected element', 'Cmd+Option+K', 'Ctrl+Alt+K'),
  a11yHotkey('editAltText', 'Edit Alt Text for Focused Element', 'Edit the alt text for the currently focused element', 'Cmd+Option+A', 'Ctrl+Alt+A'),
  a11yHotkey('announceElementInfo', 'Announce Element Accessibility Info', 'Announce ARIA role, name, and state information', 'Cmd+Option+I', 'Ctrl+Alt+I'),
  a11yHotkey('toggleFocusIndicator', 'Toggle Enhanced Focus Ring Visibility', 'Toggle thicker visible focus ring for authoring', 'Cmd+Option+F', 'Ctrl+Alt+F')
]

export const DEFAULT_KEYMAP: HotkeyMap = Object.fromEntries(
  hotkeys.map((h) => [h.id, h])
)
