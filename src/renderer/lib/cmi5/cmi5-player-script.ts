/**
 * cmi5 player runtime script — embedded into exported courses for
 * cmi5 AU lifecycle management.
 *
 * Handles: launch parameters, session initialization, statement
 * sending via LRS, and session termination.
 */

export function getCmi5PlayerScript(): string {
  return `
// cmi5 AU Runtime
(function() {
  'use strict';

  var CMI5_CATEGORY = 'https://w3id.org/xapi/cmi5/context/categories/cmi5';

  // Parse launch parameters from URL
  function parseLaunchParams() {
    var params = {};
    var search = window.location.search.replace('?', '');
    search.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });
    return params;
  }

  var launchParams = parseLaunchParams();
  var fetchUrl = launchParams.fetch || '';
  var endpoint = launchParams.endpoint || '';
  var registration = launchParams.registration || '';
  var activityId = launchParams.activityId || '';
  var actor = launchParams.actor ? JSON.parse(launchParams.actor) : null;

  var authToken = null;
  var sessionId = null;

  // Fetch auth token from LMS fetch URL
  function fetchAuthToken(callback) {
    if (!fetchUrl) { callback(null); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', fetchUrl, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          authToken = data['auth-token'] || null;
          callback(authToken);
        } catch(e) { callback(null); }
      } else { callback(null); }
    };
    xhr.onerror = function() { callback(null); };
    xhr.send();
  }

  // Send an xAPI statement to the LRS
  function sendStatement(stmt, callback) {
    if (!endpoint || !authToken) { if (callback) callback(false); return; }
    var url = endpoint.replace(/\\/$/, '') + '/statements';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', 'Basic ' + authToken);
    xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (callback) callback(xhr.status >= 200 && xhr.status < 300);
    };
    xhr.onerror = function() { if (callback) callback(false); };
    xhr.send(JSON.stringify(stmt));
  }

  // Build a cmi5-compliant statement
  function buildStatement(verb, result) {
    sessionId = sessionId || generateUUID();
    var stmt = {
      id: generateUUID(),
      actor: actor,
      verb: { id: verb.id, display: { 'en-US': verb.display } },
      object: {
        id: activityId,
        objectType: 'Activity'
      },
      context: {
        registration: registration,
        contextActivities: {
          category: [{ id: CMI5_CATEGORY }]
        },
        extensions: {
          'https://w3id.org/xapi/cmi5/context/extensions/sessionid': sessionId
        }
      },
      timestamp: new Date().toISOString()
    };
    if (result) stmt.result = result;
    return stmt;
  }

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // cmi5 Session Lifecycle
  window.cmi5 = {
    launchParams: launchParams,

    initialize: function(callback) {
      fetchAuthToken(function(token) {
        if (!token) { if (callback) callback(false); return; }
        var stmt = buildStatement(
          { id: 'http://adlnet.gov/expapi/verbs/initialized', display: 'initialized' }
        );
        sendStatement(stmt, callback);
      });
    },

    complete: function(callback) {
      var stmt = buildStatement(
        { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
        { completion: true }
      );
      sendStatement(stmt, callback);
    },

    pass: function(score, callback) {
      var result = { success: true, completion: true };
      if (score != null) {
        result.score = { scaled: score / 100, raw: score, max: 100 };
      }
      var stmt = buildStatement(
        { id: 'http://adlnet.gov/expapi/verbs/passed', display: 'passed' },
        result
      );
      sendStatement(stmt, callback);
    },

    fail: function(score, callback) {
      var result = { success: false, completion: true };
      if (score != null) {
        result.score = { scaled: score / 100, raw: score, max: 100 };
      }
      var stmt = buildStatement(
        { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
        result
      );
      sendStatement(stmt, callback);
    },

    terminate: function(callback) {
      var stmt = buildStatement(
        { id: 'http://adlnet.gov/expapi/verbs/terminated', display: 'terminated' }
      );
      sendStatement(stmt, callback);
    },

    progress: function(percent, callback) {
      var stmt = buildStatement(
        { id: 'http://adlnet.gov/expapi/verbs/experienced', display: 'experienced' },
        { extensions: { 'https://w3id.org/xapi/cmi5/result/extensions/progress': percent } }
      );
      sendStatement(stmt, callback);
    },

    sendCustomStatement: function(verb, result, extensions, callback) {
      var stmt = buildStatement(verb, result);
      if (extensions) {
        stmt.context.extensions = Object.assign(stmt.context.extensions || {}, extensions);
      }
      sendStatement(stmt, callback);
    }
  };

  // Auto-initialize on load
  if (fetchUrl && endpoint) {
    window.cmi5.initialize(function(ok) {
      if (!ok) console.warn('[cmi5] Initialization failed');
    });

    // Terminate on unload
    window.addEventListener('beforeunload', function() {
      window.cmi5.terminate();
    });
  }
})();
`;
}
