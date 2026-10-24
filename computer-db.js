(function (global) {
  'use strict';
  let enginePromise;
  function engine() {
    if (enginePromise) return enginePromise;
    enginePromise = new Promise(function (resolve, reject) {
      function initialize() {
        if (typeof global.initSqlJs !== 'function') return reject(new Error('SQLite modülü yüklenemedi.'));
        global.initSqlJs({locateFile: function (file) { return new URL('assets/vendor/sqljs/' + file, document.baseURI).href; }}).then(resolve, reject);
      }
      if (typeof global.initSqlJs === 'function') return initialize();
      const script = document.createElement('script');
      script.src = new URL('assets/vendor/sqljs/sql-wasm.js', document.baseURI).href;
      script.onload = function () { script.onload = script.onerror = null; initialize(); };
      script.onerror = function () { script.onload = script.onerror = null; script.remove(); reject(new Error('SQLite dosyaları indirilemedi. Bağlantını kontrol edip tekrar deneyebilirsin.')); };
      document.head.appendChild(script);
    }).catch(function (error) { enginePromise = null; throw error; });
    return enginePromise;
  }
  function create(data) {
    let database, promise, destroyed = false;
    function ready() {
      if (destroyed) return Promise.reject(new Error('Veritabanı kapatıldı.'));
      if (promise) return promise;
      promise = engine().then(function (SQL) {
        if (destroyed) throw new Error('Veritabanı kapatıldı.');
        database = new SQL.Database();
        database.run('CREATE TABLE projects (id INTEGER PRIMARY KEY, slug TEXT UNIQUE, title TEXT, category TEXT, status TEXT); CREATE TABLE skills (id INTEGER PRIMARY KEY, name TEXT UNIQUE); CREATE TABLE project_skills (project_id INTEGER, skill_id INTEGER); CREATE TABLE notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL);');
        const skills = new Map();
        const insertProject = database.prepare('INSERT INTO projects VALUES (?, ?, ?, ?, ?)');
        const insertSkill = database.prepare('INSERT INTO skills VALUES (?, ?)');
        const relation = database.prepare('INSERT INTO project_skills VALUES (?, ?)');
        try {
          (data.projects || []).forEach(function (project, index) {
            insertProject.run([index + 1, project.id, project.title, project.category, project.status]);
            (project.stack || []).forEach(function (name) {
              if (!skills.has(name)) { skills.set(name, skills.size + 1); insertSkill.run([skills.get(name), name]); }
              relation.run([index + 1, skills.get(name)]);
            });
          });
        } finally { insertProject.free(); insertSkill.free(); relation.free(); }
        return database;
      }).catch(function (error) { promise = null; throw error; });
      return promise;
    }
    return Object.freeze({
      ready: ready,
      query: async function (sql) {
        const text = String(sql).trim().replace(/;\s*$/, '');
        if (!/^select\b/i.test(text) || text.includes(';')) throw new Error('Bu editörde tek bir SELECT sorgusu çalıştırabilirsin.');
        const db = await ready();
        return db.exec(text);
      },
      transaction: async function (body, commit) {
        const db = await ready();
        db.run('BEGIN');
        try {
          db.run('INSERT INTO notes (body) VALUES (?)', [String(body).slice(0, 200)]);
          const pending = db.exec('SELECT id, body FROM notes ORDER BY id');
          db.run(commit ? 'COMMIT' : 'ROLLBACK');
          return {pending: pending, saved: db.exec('SELECT id, body FROM notes ORDER BY id'), committed: commit};
        } catch (error) { try { db.run('ROLLBACK'); } catch (_) {} throw error; }
      },
      destroy: function () { destroyed = true; if (database) { database.close(); database = null; } }
    });
  }
  global.ComputerDB = Object.freeze({create: create});
})(window);
