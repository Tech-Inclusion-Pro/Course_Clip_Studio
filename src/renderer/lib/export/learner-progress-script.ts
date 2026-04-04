/**
 * Returns the "My Progress" overlay JavaScript for published courses.
 * Reads learner data from localStorage and renders a progress summary.
 */

export function getLearnerProgressScript(): string {
  return `
// LuminaUDL Learner Progress Overlay
(function() {
  'use strict';

  var courseId = document.body.getAttribute('data-course-id') || 'lumina-course';
  var storageKey = 'lumina_progress_' + courseId;
  var statementsKey = 'lumina_statements_' + courseId;

  function getProgress() {
    try { var d = localStorage.getItem(storageKey); return d ? JSON.parse(d) : {}; } catch(e) { return {}; }
  }
  function getStatements() {
    try { var d = localStorage.getItem(statementsKey); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  }

  // Plain-language first-person summary from a statement
  var verbTemplates = {
    'launched': 'You opened {object}',
    'experienced': 'You viewed {object}',
    'interacted': 'You interacted with {object}',
    'attempted': 'You started {object}',
    'answered': 'You answered a question in {object}',
    'passed': 'You passed {object}{score}',
    'failed': 'You did not meet the threshold on {object}{score}',
    'completed': 'You completed {object}',
    'progressed': 'You advanced to {object}',
    'suspended': 'You paused your session with a bookmark saved',
    'resumed': 'You resumed from your last bookmark',
    'commented': 'You submitted a response in {object}',
    'accessed audio alternative': 'You accessed the audio version of {object}',
    'accessed text alternative': 'You opened the transcript for {object}',
    'accessed visual alternative': 'You viewed the visual alternative for {object}',
    'accessed caption track': 'You enabled captions on {object}',
    'switched language': 'You switched the language on {object}',
    'expanded definition': 'You expanded a definition in {object}',
    'used extended time': 'You activated extended time on {object}',
    'used text to speech': 'You used text-to-speech on {object}',
    'submitted drawing': 'You submitted a drawing response in {object}',
    'submitted audio response': 'You submitted an audio response in {object}',
    'chose pathway': 'You chose a learning pathway in {object}',
    'replayed content': 'You revisited {object}',
    'bookmarked': 'You bookmarked {object}',
    'rated difficulty': 'You rated the difficulty of {object}'
  };

  function toPlainLanguage(s) {
    var display = (s.verbDisplay || '').toLowerCase();
    var obj = s.objectName || 'this content';
    var scorePart = '';
    if (s.scoreScaled != null) scorePart = ' with a score of ' + Math.round(s.scoreScaled * 100) + '%';
    else if (s.scoreRaw != null && s.scoreMax != null) scorePart = ' (' + s.scoreRaw + ' of ' + s.scoreMax + ')';
    var template = verbTemplates[display];
    if (template) return template.replace('{object}', obj).replace('{score}', scorePart);
    return 'You ' + (display || 'interacted with') + ' ' + obj + scorePart;
  }

  window.toggleProgress = function() {
    var existing = document.getElementById('progress-overlay');
    if (existing) { existing.remove(); return; }

    var progress = getProgress();
    var statements = getStatements();
    var visited = progress.visited || [];
    var scores = progress.scores || {};
    var lessonProgress = progress.lessonProgress || {};

    // Compute overall stats
    var totalLessons = document.querySelectorAll('.nav-btn[data-lesson-id]').length || 1;
    var completedLessons = 0;
    Object.keys(lessonProgress).forEach(function(lid) {
      if (lessonProgress[lid] && lessonProgress[lid].completed) completedLessons++;
    });
    var completionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Time spent (from statements)
    var totalTime = 0;
    statements.forEach(function(s) { if (s.durationSeconds) totalTime += s.durationSeconds; });
    var timeStr = totalTime < 60 ? totalTime + 's' : Math.floor(totalTime / 60) + 'm ' + (totalTime % 60) + 's';

    // Last activity
    var lastTs = statements.length > 0 ? statements[statements.length - 1].timestamp : null;
    var lastActivity = lastTs ? new Date(lastTs).toLocaleString() : 'N/A';

    // Quiz scores
    var scoreHtml = '';
    Object.keys(scores).forEach(function(lid) {
      scoreHtml += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;"><span>' + lid + '</span><span style="font-weight:600;">' + scores[lid] + '%</span></div>';
    });

    // Per-assessment block scores from statements
    var assessmentScoreHtml = '';
    var passedStmts = statements.filter(function(s) { return s.verb && (s.verb.indexOf('/passed') > -1 || s.verb.indexOf('/failed') > -1) && s.blockId; });
    var blockScores = {};
    passedStmts.forEach(function(s) {
      if (!blockScores[s.blockId]) blockScores[s.blockId] = { name: s.objectName || s.blockId, scores: [], passed: false, type: s.blockType || '' };
      var pct = s.scoreScaled != null ? Math.round(s.scoreScaled * 100) : (s.scoreRaw || 0);
      blockScores[s.blockId].scores.push(pct);
      if (s.verb.indexOf('/passed') > -1) blockScores[s.blockId].passed = true;
    });
    Object.keys(blockScores).forEach(function(bid) {
      var bs = blockScores[bid];
      var latest = bs.scores[bs.scores.length - 1];
      var max = bs.scores.length > 0 ? Math.max.apply(null, bs.scores) : 0;
      var statusColor = bs.passed ? '#166534' : '#991b1b';
      var statusLabel = bs.passed ? 'Passed' : 'Not passed';
      assessmentScoreHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;">'
        + '<span style="font-size:13px;">' + bs.name + '</span>'
        + '<div style="text-align:right;"><span style="font-weight:600;font-size:14px;">' + latest + '%</span>'
        + '<span style="font-size:11px;color:' + statusColor + ';margin-left:6px;">' + statusLabel + '</span></div></div>';
    });

    // Knowledge Check phase comparison
    var phaseHtml = '';
    var kcStmts = statements.filter(function(s) { return s.verb && s.verb.indexOf('/answered') > -1 && s.phase && s.objectives && s.objectives.length > 0; });
    if (kcStmts.length > 0) {
      var objPhases = {};
      kcStmts.forEach(function(s) {
        s.objectives.forEach(function(obj) {
          if (!objPhases[obj]) objPhases[obj] = { pre: [], post: [] };
          if (s.phase === 'pre') objPhases[obj].pre.push(s.success ? 1 : 0);
          else if (s.phase === 'post') objPhases[obj].post.push(s.success ? 1 : 0);
        });
      });
      Object.keys(objPhases).forEach(function(obj) {
        var d = objPhases[obj];
        var preAvg = d.pre.length > 0 ? Math.round((d.pre.reduce(function(a,b){return a+b;},0) / d.pre.length) * 100) : null;
        var postAvg = d.post.length > 0 ? Math.round((d.post.reduce(function(a,b){return a+b;},0) / d.post.length) * 100) : null;
        phaseHtml += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;font-size:13px;">'
          + '<span>' + obj + '</span>'
          + '<span>Pre: ' + (preAvg != null ? preAvg + '%' : 'N/A') + ' &rarr; Post: ' + (postAvg != null ? postAvg + '%' : 'N/A') + '</span></div>';
      });
    }

    // Objective mastery status
    var masteryHtml = '';
    var answeredWithObj = statements.filter(function(s) { return s.verb && s.verb.indexOf('/answered') > -1 && s.objectives && s.objectives.length > 0; });
    if (answeredWithObj.length > 0) {
      var objResults = {};
      answeredWithObj.forEach(function(s) {
        s.objectives.forEach(function(obj) {
          if (!objResults[obj]) objResults[obj] = { correct: 0, total: 0 };
          objResults[obj].total++;
          if (s.success) objResults[obj].correct++;
        });
      });
      Object.keys(objResults).forEach(function(obj) {
        var r = objResults[obj];
        var pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
        var status = pct >= 80 ? 'Met' : (pct >= 50 ? 'Approaching' : 'Not Yet');
        var statusColor = pct >= 80 ? '#166534' : (pct >= 50 ? '#92400e' : '#991b1b');
        masteryHtml += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;font-size:13px;">'
          + '<span>' + obj + '</span>'
          + '<span style="color:' + statusColor + ';font-weight:600;">' + status + ' (' + pct + '%)</span></div>';
      });
    }

    // UDL Pathways summary
    var udlPathwayHtml = '';
    var udlBase = 'https://luminaudl.app/verbs/';
    var audioAltCount = 0, textAltCount = 0, captionCount = 0, replayCount = 0, bookmarkCount = 0, pathwayCount = 0;
    statements.forEach(function(s) {
      if (!s.verb || s.verb.indexOf(udlBase) !== 0) return;
      var verbName = s.verb.replace(udlBase, '');
      if (verbName === 'accessed-audio-alternative') audioAltCount++;
      else if (verbName === 'accessed-text-alternative') textAltCount++;
      else if (verbName === 'accessed-caption-track') captionCount++;
      else if (verbName === 'replayed-content') replayCount++;
      else if (verbName === 'bookmarked') bookmarkCount++;
      else if (verbName === 'chose-pathway') pathwayCount++;
    });
    var totalUdl = audioAltCount + textAltCount + captionCount + replayCount + bookmarkCount + pathwayCount;
    if (totalUdl > 0) {
      var pathwayItems = [];
      if (audioAltCount > 0) pathwayItems.push('Accessed audio alternatives <strong>' + audioAltCount + '</strong> time' + (audioAltCount !== 1 ? 's' : ''));
      if (textAltCount > 0) pathwayItems.push('Viewed transcripts <strong>' + textAltCount + '</strong> time' + (textAltCount !== 1 ? 's' : ''));
      if (captionCount > 0) pathwayItems.push('Used captions on <strong>' + captionCount + '</strong> video' + (captionCount !== 1 ? 's' : ''));
      if (replayCount > 0) pathwayItems.push('Replayed content <strong>' + replayCount + '</strong> time' + (replayCount !== 1 ? 's' : ''));
      if (bookmarkCount > 0) pathwayItems.push('Bookmarked <strong>' + bookmarkCount + '</strong> item' + (bookmarkCount !== 1 ? 's' : ''));
      if (pathwayCount > 0) pathwayItems.push('Chose learning pathways <strong>' + pathwayCount + '</strong> time' + (pathwayCount !== 1 ? 's' : ''));
      udlPathwayHtml = '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">Your Learning Pathways</h3>'
        + pathwayItems.map(function(item) { return '<div style="padding:4px 0;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">' + item + '</div>'; }).join('')
        + '</div>';
    }

    // Activity log (last 20) — plain language, first person
    var logHtml = '';
    var recentStmts = statements.slice(-20).reverse();
    recentStmts.forEach(function(s) {
      var time = new Date(s.timestamp).toLocaleTimeString();
      var summary = toPlainLanguage(s);
      logHtml += '<div style="padding:3px 0;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;"><span style="color:#94a3b8;margin-right:8px;">' + time + '</span>' + summary + '</div>';
    });

    // Find first incomplete lesson for next recommendation
    var nextBlock = '';
    var navBtns = document.querySelectorAll('.nav-btn[data-lesson-id]');
    for (var i = 0; i < navBtns.length; i++) {
      var lid = navBtns[i].getAttribute('data-lesson-id');
      if (lid && (!lessonProgress[lid] || !lessonProgress[lid].completed)) {
        var href = navBtns[i].getAttribute('data-href') || navBtns[i].getAttribute('href') || '';
        var label = navBtns[i].textContent || 'Next lesson';
        nextBlock = '<a href="' + href + '" style="display:inline-block;margin-top:8px;padding:8px 16px;background:#e11d8f;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;">Continue: ' + label + '</a>';
        break;
      }
    }

    // Build SVG progress ring
    var size = 100, sw = 8, r = (size - sw) / 2, circ = 2 * Math.PI * r;
    var offset = circ - (completionPct / 100) * circ;
    var ringSvg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Course completion: ' + completionPct + '%"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="#e2e8f0" stroke-width="' + sw + '"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="#e11d8f" stroke-width="' + sw + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')"/><text x="' + (size/2) + '" y="' + (size/2) + '" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="700" fill="#1e293b">' + completionPct + '%</text></svg>';

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'progress-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'My Progress');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:480px;width:92%;max-height:85vh;overflow-y:auto;padding:28px;box-shadow:0 8px 32px rgba(0,0,0,0.15);color:#1e293b;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="font-size:20px;font-weight:700;margin:0;">My Progress</h2><button onclick="toggleProgress()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;" aria-label="Close">&times;</button></div>'
      + '<div style="text-align:center;margin-bottom:20px;">' + ringSvg + '<div style="font-size:13px;color:#64748b;margin-top:4px;">' + completedLessons + ' of ' + totalLessons + ' lessons completed</div></div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">'
      + '<div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:700;">' + timeStr + '</div><div style="font-size:11px;color:#94a3b8;">Time Spent</div></div>'
      + '<div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:700;">' + visited.length + '</div><div style="font-size:11px;color:#94a3b8;">Lessons Visited</div></div></div>'
      + (assessmentScoreHtml ? '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">My Scores</h3>' + assessmentScoreHtml + '</div>' : (scoreHtml ? '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">Assessment Scores</h3>' + scoreHtml + '</div>' : ''))
      + (phaseHtml ? '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">Knowledge Check Progress</h3>' + phaseHtml + '</div>' : '')
      + (masteryHtml ? '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">Objective Mastery</h3>' + masteryHtml + '</div>' : '')
      + udlPathwayHtml
      + '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:4px;">Last Activity</h3><div style="font-size:13px;color:#64748b;">' + lastActivity + '</div></div>'
      + nextBlock
      + (logHtml ? '<div style="margin-top:20px;"><h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">Activity Log</h3>' + logHtml + '</div>' : '')
      + '<div style="display:flex;gap:8px;margin-top:20px;">'
      + '<button onclick="downloadProgress(\'txt\')" style="flex:1;padding:10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;cursor:pointer;color:#475569;">Download as Text</button>'
      + '<button onclick="downloadProgress(\'pdf\')" style="flex:1;padding:10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;cursor:pointer;color:#475569;">Download as PDF</button>'
      + '</div>'
      + '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) toggleProgress(); });
  };

  window.downloadProgress = function(format) {
    format = format || 'txt';
    var progress = getProgress();
    var statements = getStatements();
    var courseTitle = document.title || 'My Course';

    if (format === 'pdf') {
      downloadProgressPDF(progress, statements, courseTitle);
      return;
    }

    // Plain text with first-person language
    var lines = ['My Course Progress — ' + courseTitle, '='.repeat(40), ''];

    var lp = progress.lessonProgress || {};
    var completedCount = 0;
    Object.keys(lp).forEach(function(k) { if (lp[k].completed) completedCount++; });
    var totalLessons = document.querySelectorAll('.nav-btn[data-lesson-id]').length || 1;
    var pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    lines.push('Completion: ' + pct + '% (' + completedCount + ' of ' + totalLessons + ' lessons)');
    lines.push('Lessons visited: ' + (progress.visited || []).length);
    lines.push('');

    // Scores
    var passedStmts = statements.filter(function(s) { return s.verb && (s.verb.indexOf('/passed') > -1 || s.verb.indexOf('/failed') > -1); });
    if (passedStmts.length > 0) {
      lines.push('My Scores:');
      var blockScores = {};
      passedStmts.forEach(function(s) {
        var bid = s.blockId || s.objectId;
        if (!blockScores[bid]) blockScores[bid] = { name: s.objectName || bid, latest: 0, passed: false };
        blockScores[bid].latest = s.scoreScaled != null ? Math.round(s.scoreScaled * 100) : (s.scoreRaw || 0);
        if (s.verb.indexOf('/passed') > -1) blockScores[bid].passed = true;
      });
      Object.keys(blockScores).forEach(function(bid) {
        var bs = blockScores[bid];
        lines.push('  ' + bs.name + ': ' + bs.latest + '% — ' + (bs.passed ? 'Passed' : 'Not passed'));
      });
      lines.push('');
    }

    // UDL pathways
    var udlBase = 'https://luminaudl.app/verbs/';
    var udlCounts = {};
    statements.forEach(function(s) {
      if (!s.verb || s.verb.indexOf(udlBase) !== 0) return;
      var name = s.verb.replace(udlBase, '').replace(/-/g, ' ');
      udlCounts[name] = (udlCounts[name] || 0) + 1;
    });
    if (Object.keys(udlCounts).length > 0) {
      lines.push('Your Learning Pathways:');
      Object.keys(udlCounts).forEach(function(name) {
        lines.push('  ' + name + ': ' + udlCounts[name] + ' time' + (udlCounts[name] !== 1 ? 's' : ''));
      });
      lines.push('');
    }

    // Activity log — plain language
    lines.push('Activity Log:');
    var grouped = {};
    statements.forEach(function(s) {
      var dateKey = s.timestamp ? s.timestamp.slice(0, 10) : 'unknown';
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(s);
    });
    Object.keys(grouped).sort().reverse().forEach(function(dateKey) {
      lines.push('');
      lines.push('  --- ' + new Date(dateKey + 'T00:00:00').toLocaleDateString() + ' ---');
      grouped[dateKey].forEach(function(s) {
        var time = new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        lines.push('    ' + time + '  ' + toPlainLanguage(s));
      });
    });

    var blob = new Blob([lines.join('\\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'my-progress.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF download — opens a printable HTML page
  function downloadProgressPDF(progress, statements, courseTitle) {
    var lp = progress.lessonProgress || {};
    var completedCount = 0;
    Object.keys(lp).forEach(function(k) { if (lp[k].completed) completedCount++; });
    var totalLessons = document.querySelectorAll('.nav-btn[data-lesson-id]').length || 1;
    var pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My Progress</title>'
      + '<style>body{font-family:-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1e293b;} '
      + 'h1{font-size:20px;} h2{font-size:16px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-top:24px;} '
      + '.entry{padding:3px 0;font-size:12px;color:#475569;border-bottom:1px solid #f1f5f9;} '
      + '.time{color:#94a3b8;margin-right:8px;}</style></head><body>'
      + '<h1>My Course Progress</h1><p style="color:#94a3b8;font-size:13px;">' + courseTitle + '</p>'
      + '<p style="font-size:15px;font-weight:600;">Completion: ' + pct + '% (' + completedCount + ' of ' + totalLessons + ' lessons)</p>'
      + '<h2>Activity Log</h2>';

    statements.forEach(function(s) {
      var time = new Date(s.timestamp).toLocaleString();
      html += '<div class="entry"><span class="time">' + time + '</span>' + toPlainLanguage(s) + '</div>';
    });

    html += '<script>window.onload=function(){window.print();}</script></body></html>';
    var w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }
})();
`
}
