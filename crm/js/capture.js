/* ============================================================
   Kodiak CRM — field capture module (photos + voice notes)
   Stores everything client-side in IndexedDB ("kodiakFieldCapture").
   No dependencies. Exposes window.CAPTURE:
     addPhoto(target, kind)            -> Promise<photoRecord|null>
     listPhotos(target)                -> Promise<photoRecord[]>
     deletePhoto(id)                   -> Promise<void>
     saveNote(target, text)            -> Promise<noteRecord>
     listNotes(target)                 -> Promise<noteRecord[]>
     deleteNote(id)                    -> Promise<void>
     startDictation(onText, onState, target?) -> {mode, stop()}
     supported = { speech, recorder, secure }
   `target` is a string key like "wo:104", "est:3" or "site:general".
   ============================================================ */
window.CAPTURE = (function () {
  "use strict";

  var DB_NAME = "kodiakFieldCapture";
  var DB_VERSION = 1;
  var dbPromise = null;

  // ---- IndexedDB plumbing --------------------------------------------
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("photos")) {
          var p = db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
          p.createIndex("target", "target", { unique: false });
        }
        if (!db.objectStoreNames.contains("notes")) {
          var n = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
          n.createIndex("target", "target", { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("IndexedDB open failed")); };
    });
    return dbPromise;
  }

  function storeAdd(storeName, record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readwrite");
        var req = tx.objectStore(storeName).add(record);
        req.onsuccess = function () { record.id = req.result; };
        tx.oncomplete = function () { resolve(record); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error("transaction aborted")); };
      });
    });
  }

  function storeList(storeName, target) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readonly");
        var idx = tx.objectStore(storeName).index("target");
        var req = idx.getAll(String(target));
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function storeDelete(storeName, id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).delete(Number(id));
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error("transaction aborted")); };
      });
    });
  }

  // ---- Photo capture ---------------------------------------------------
  var MAX_EDGE = 1280;
  var JPEG_QUALITY = 0.72;

  function downscale(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement("canvas");
          canvas.width = cw; canvas.height = ch;
          canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      img.src = url;
    });
  }

  // Programmatically opens the phone camera / file picker, downscales the
  // shot and stores it. Resolves with the stored record, or null on cancel.
  function addPhoto(target, kind) {
    return new Promise(function (resolve, reject) {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.setAttribute("capture", "environment");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      var settled = false;
      function cleanup() { if (input.parentNode) input.parentNode.removeChild(input); }
      input.addEventListener("change", function () {
        if (settled) return;
        settled = true;
        var file = input.files && input.files[0];
        cleanup();
        if (!file) { resolve(null); return; }
        downscale(file).then(function (dataUrl) {
          return storeAdd("photos", {
            target: String(target),
            kind: kind === "before" || kind === "after" ? kind : "site",
            dataUrl: dataUrl,
            createdAt: new Date().toISOString()
          });
        }).then(resolve, reject);
      });
      // Modern browsers fire "cancel" when the picker is dismissed.
      input.addEventListener("cancel", function () {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(null);
      });
      input.click();
    });
  }

  function listPhotos(target) { return storeList("photos", target); }
  function deletePhoto(id) { return storeDelete("photos", id); }

  // ---- Notes -----------------------------------------------------------
  function saveNote(target, text) {
    return storeAdd("notes", {
      target: String(target),
      text: String(text == null ? "" : text),
      audioBlob: null,
      createdAt: new Date().toISOString()
    });
  }
  function saveAudioNote(target, blob) {
    return storeAdd("notes", {
      target: String(target),
      text: null,
      audioBlob: blob,
      createdAt: new Date().toISOString()
    });
  }
  function listNotes(target) { return storeList("notes", target); }
  function deleteNote(id) { return storeDelete("notes", id); }

  // ---- Dictation -------------------------------------------------------
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var hasRecorder = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  // Speech path: streams text through onText(text, isFinal); the caller
  // saves the final text itself (e.g. via saveNote). Fallback path: records
  // mic audio and — when `target` is given — stores it as an audio note,
  // then calls onState("audio-saved").
  // onState values: "listening" | "recording" | "stopped" | "audio-saved"
  //                 | "denied" | "error" | "unsupported"
  function startDictation(onText, onState, target) {
    onText = typeof onText === "function" ? onText : function () {};
    onState = typeof onState === "function" ? onState : function () {};

    if (SR) {
      var rec = new SR();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      var ended = false;
      rec.onstart = function () { onState("listening"); };
      rec.onresult = function (e) {
        var interim = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var res = e.results[i];
          var t = res[0] ? res[0].transcript : "";
          if (res.isFinal) {
            t = t.trim();
            if (t) onText(t, true);
          } else {
            interim += t;
          }
        }
        if (interim) onText(interim, false);
      };
      rec.onerror = function (e) {
        var code = e && e.error;
        if (code === "not-allowed" || code === "service-not-allowed") onState("denied");
        else if (code !== "no-speech" && code !== "aborted") onState("error");
      };
      rec.onend = function () {
        if (!ended) { ended = true; onState("stopped"); }
      };
      try { rec.start(); } catch (err) { onState("error"); }
      return {
        mode: "speech",
        stop: function () { try { rec.stop(); } catch (e) {} }
      };
    }

    if (!hasRecorder) {
      onState("unsupported");
      return { mode: "none", stop: function () {} };
    }

    // ---- MediaRecorder fallback: save the audio itself ----
    var recorder = null;
    var stream = null;
    var chunks = [];
    var wantStop = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s;
      var mime = "";
      if (window.MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported("audio/webm")) mime = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mime = "audio/mp4";
      }
      recorder = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" });
        if (!blob.size || target == null) { onState("stopped"); return; }
        saveAudioNote(String(target), blob).then(
          function () { onState("audio-saved"); },
          function () { onState("error"); }
        );
      };
      try {
        recorder.start();
        onState("recording");
      } catch (err) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        onState("error");
        return;
      }
      if (wantStop) { try { recorder.stop(); } catch (e) {} }
    }).catch(function (err) {
      var name = err && err.name;
      onState(name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError"
        ? "denied" : "error");
    });

    return {
      mode: "audio",
      stop: function () {
        wantStop = true;
        if (recorder && recorder.state !== "inactive") {
          try { recorder.stop(); } catch (e) {}
        } else if (stream) {
          stream.getTracks().forEach(function (t) { t.stop(); });
        }
      }
    };
  }

  return {
    addPhoto: addPhoto,
    listPhotos: listPhotos,
    deletePhoto: deletePhoto,
    saveNote: saveNote,
    listNotes: listNotes,
    deleteNote: deleteNote,
    startDictation: startDictation,
    supported: {
      speech: !!SR,
      recorder: hasRecorder,
      secure: !!window.isSecureContext
    }
  };
})();
