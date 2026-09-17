import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { INITIAL_BLOCS, INITIAL_CHARGES_DE_FLUX, INITIAL_EVALUATIONS, INITIAL_NIVEAUX } from './src/data/initialData';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'concentrix.sqlite');

let db: SqlJsDatabase;

function saveDbToDisk() {
  if (!db) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const binaryArray = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(binaryArray));
  } catch (err) {
    console.error('[SQLite] Erreur lors de l’écriture sur disque:', err);
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('[SQLite] Base existante concentrix.sqlite chargée avec succès.');
    } catch (err) {
      console.warn('[SQLite] Impossible de lire le fichier existant, création d’une nouvelle base:', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('[SQLite] Nouvelle base de données concentrix.sqlite initialisée.');
  }

  // Schema creation
  db.run(`
    CREATE TABLE IF NOT EXISTS managers (
      id TEXT PRIMARY KEY,
      matricule TEXT NOT NULL,
      nomPrenom TEXT NOT NULL,
      niveau TEXT NOT NULL,
      nPlusUn TEXT,
      photoUrl TEXT,
      actif INTEGER DEFAULT 1,
      dateCreation TEXT
    );

    CREATE TABLE IF NOT EXISTS blocs (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      titreAffiche TEXT NOT NULL,
      poidsPourcentage REAL NOT NULL,
      description TEXT,
      couleurBadge TEXT,
      rubriquesJson TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      chargeDeFluxId TEXT NOT NULL,
      mois INTEGER NOT NULL,
      annee INTEGER NOT NULL,
      statut TEXT NOT NULL,
      scoreTotal REAL NOT NULL,
      scoreBehavior REAL NOT NULL,
      scoreManagement REAL NOT NULL,
      scoreDelivery REAL NOT NULL,
      noteSurVingt REAL NOT NULL,
      dateEntretien TEXT,
      nPlusUn TEXT,
      commentaireGlobal TEXT,
      validePar TEXT,
      dateValidation TEXT,
      derniereModification TEXT,
      notesJson TEXT NOT NULL,
      actionsSuiviJson TEXT,
      UNIQUE(chargeDeFluxId, mois, annee)
    );

    CREATE TABLE IF NOT EXISTS niveaux (
      nom TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS settings (
      cle TEXT PRIMARY KEY,
      valeurJson TEXT NOT NULL
    );
  `);

  // Check if seeding is needed
  const resManagers = db.exec('SELECT COUNT(*) as count FROM managers');
  const countManagers = resManagers[0]?.values[0]?.[0] as number || 0;

  if (countManagers === 0) {
    console.log('[SQLite] Amorçage initial des données d’équipe CONCENTRIX...');
    // Seed Managers
    INITIAL_CHARGES_DE_FLUX.forEach(m => {
      db.run(
        `INSERT OR REPLACE INTO managers (id, matricule, nomPrenom, niveau, nPlusUn, photoUrl, actif, dateCreation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.matricule, m.nomPrenom, m.niveau, m.nPlusUn, m.photoUrl || '', m.actif ? 1 : 0, m.dateCreation]
      );
    });

    // Seed Blocs
    INITIAL_BLOCS.forEach(b => {
      db.run(
        `INSERT OR REPLACE INTO blocs (id, nom, titreAffiche, poidsPourcentage, description, couleurBadge, rubriquesJson)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.nom, b.titreAffiche, b.poidsPourcentage, b.description, b.couleurBadge, JSON.stringify(b.rubriques)]
      );
    });

    // Seed Evaluations
    INITIAL_EVALUATIONS.forEach(e => {
      db.run(
        `INSERT OR REPLACE INTO evaluations (
          id, chargeDeFluxId, mois, annee, statut, scoreTotal, scoreBehavior, scoreManagement, scoreDelivery,
          noteSurVingt, dateEntretien, nPlusUn, commentaireGlobal, validePar, dateValidation, derniereModification,
          notesJson, actionsSuiviJson
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id, e.chargeDeFluxId, e.mois, e.annee, e.statut, e.scoreTotal, e.scoreBehavior, e.scoreManagement, e.scoreDelivery,
          (e.scoreTotal / 5), e.dateEntretien, e.nPlusUn, e.commentaireGlobal, e.validePar || '', e.dateValidation || '',
          e.derniereModification, JSON.stringify(e.notes), JSON.stringify(e.actionsSuivi || [])
        ]
      );
    });

    // Seed Niveaux
    INITIAL_NIVEAUX.forEach(niv => {
      db.run(`INSERT OR REPLACE INTO niveaux (nom) VALUES (?)`, [niv]);
    });

    // Seed default Theme
    db.run(`INSERT OR REPLACE INTO settings (cle, valeurJson) VALUES (?, ?)`, ['theme_id', JSON.stringify('concentrix-pastel')]);

    saveDbToDisk();
    console.log('[SQLite] Données initiales sauvegardées dans concentrix.sqlite avec succès.');
  }
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // ==================== SQLITE API ROUTES ====================

  // Health & Database Status
  app.get('/api/status', (req, res) => {
    try {
      const mgrRes = db.exec('SELECT COUNT(*) FROM managers');
      const evalRes = db.exec('SELECT COUNT(*) FROM evaluations');
      const mgrCount = mgrRes[0]?.values[0]?.[0] || 0;
      const evalCount = evalRes[0]?.values[0]?.[0] || 0;

      res.json({
        status: 'ok',
        engine: 'SQLite 3 (sql.js / WASM)',
        dbFile: 'data/concentrix.sqlite',
        fileSize: fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0,
        managersCount: mgrCount,
        evaluationsCount: evalCount,
        lastCheck: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  // Get All Core Data from SQLite
  app.get('/api/data', (req, res) => {
    try {
      // 1. Managers
      const mgrRes = db.exec('SELECT id, matricule, nomPrenom, niveau, nPlusUn, photoUrl, actif, dateCreation FROM managers');
      const managers = mgrRes[0]?.values.map(row => ({
        id: row[0],
        matricule: row[1],
        nomPrenom: row[2],
        niveau: row[3],
        nPlusUn: row[4],
        photoUrl: row[5] || undefined,
        actif: Boolean(row[6]),
        dateCreation: row[7]
      })) || [];

      // 2. Blocs
      const blocsRes = db.exec('SELECT id, nom, titreAffiche, poidsPourcentage, description, couleurBadge, rubriquesJson FROM blocs');
      const blocs = blocsRes[0]?.values.map(row => ({
        id: row[0],
        nom: row[1],
        titreAffiche: row[2],
        poidsPourcentage: Number(row[3]),
        description: row[4],
        couleurBadge: row[5],
        rubriques: JSON.parse(row[6] as string)
      })) || [];

      // 3. Evaluations
      const evalRes = db.exec(`
        SELECT id, chargeDeFluxId, mois, annee, statut, scoreTotal, scoreBehavior, scoreManagement, scoreDelivery,
               noteSurVingt, dateEntretien, nPlusUn, commentaireGlobal, validePar, dateValidation, derniereModification,
               notesJson, actionsSuiviJson
        FROM evaluations
        ORDER BY annee DESC, mois DESC
      `);
      const evaluations = evalRes[0]?.values.map(row => ({
        id: row[0],
        chargeDeFluxId: row[1],
        mois: Number(row[2]),
        annee: Number(row[3]),
        statut: row[4],
        scoreTotal: Number(row[5]),
        scoreBehavior: Number(row[6]),
        scoreManagement: Number(row[7]),
        scoreDelivery: Number(row[8]),
        dateEntretien: row[10],
        nPlusUn: row[11],
        commentaireGlobal: row[12],
        validePar: row[13] || undefined,
        dateValidation: row[14] || undefined,
        derniereModification: row[15],
        notes: JSON.parse(row[16] as string),
        actionsSuivi: row[17] ? JSON.parse(row[17] as string) : []
      })) || [];

      // 4. Niveaux
      const nivRes = db.exec('SELECT nom FROM niveaux');
      const niveaux = nivRes[0]?.values.map(row => row[0] as string) || [];

      // 5. Theme
      const themeRes = db.exec("SELECT valeurJson FROM settings WHERE cle = 'theme_id'");
      const themeId = themeRes[0]?.values[0]?.[0] ? JSON.parse(themeRes[0].values[0][0] as string) : 'glass';

      // 5b. Theme Background Config
      const themeBgRes = db.exec("SELECT valeurJson FROM settings WHERE cle = 'theme_bg'");
      const themeBg = themeBgRes[0]?.values[0]?.[0] ? JSON.parse(themeBgRes[0].values[0][0] as string) : null;

      // 6. App Name
      const nameRes = db.exec("SELECT valeurJson FROM settings WHERE cle = 'app_name'");
      const appName = nameRes[0]?.values[0]?.[0] ? JSON.parse(nameRes[0].values[0][0] as string) : 'CONCENTRIX';

      res.json({
        success: true,
        data: {
          managers,
          blocs,
          evaluations,
          niveaux,
          themeId,
          themeBg,
          appName
        }
      });
    } catch (err: any) {
      console.error('[SQLite] Erreur lecture api/data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Update a Single Evaluation in SQLite
  app.post('/api/evaluations', (req, res) => {
    try {
      const e = req.body;
      if (!e || !e.id || !e.chargeDeFluxId) {
        return res.status(400).json({ success: false, error: 'Données d’évaluation incomplètes' });
      }

      db.run(
        `INSERT OR REPLACE INTO evaluations (
          id, chargeDeFluxId, mois, annee, statut, scoreTotal, scoreBehavior, scoreManagement, scoreDelivery,
          noteSurVingt, dateEntretien, nPlusUn, commentaireGlobal, validePar, dateValidation, derniereModification,
          notesJson, actionsSuiviJson
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id,
          e.chargeDeFluxId,
          e.mois,
          e.annee,
          e.statut,
          e.scoreTotal,
          e.scoreBehavior,
          e.scoreManagement,
          e.scoreDelivery,
          e.noteSurVingt || (e.scoreTotal / 5),
          e.dateEntretien || '',
          e.nPlusUn || '',
          e.commentaireGlobal || '',
          e.validePar || '',
          e.dateValidation || '',
          e.derniereModification || new Date().toISOString(),
          JSON.stringify(e.notes || {}),
          JSON.stringify(e.actionsSuivi || [])
        ]
      );

      saveDbToDisk();
      res.json({ success: true, id: e.id });
    } catch (err: any) {
      console.error('[SQLite] Erreur sauvegarde évaluation:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Managers List
  app.post('/api/managers', (req, res) => {
    try {
      const managers = req.body;
      if (!Array.isArray(managers)) {
        return res.status(400).json({ success: false, error: 'Tableau attendu' });
      }

      db.run('BEGIN TRANSACTION;');
      db.run('DELETE FROM managers;');
      managers.forEach(m => {
        db.run(
          `INSERT INTO managers (id, matricule, nomPrenom, niveau, nPlusUn, photoUrl, actif, dateCreation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.id, m.matricule, m.nomPrenom, m.niveau, m.nPlusUn, m.photoUrl || '', m.actif ? 1 : 0, m.dateCreation || new Date().toISOString()]
        );
      });
      db.run('COMMIT;');

      saveDbToDisk();
      res.json({ success: true, count: managers.length });
    } catch (err: any) {
      try { db.run('ROLLBACK;'); } catch (_) {}
      console.error('[SQLite] Erreur sauvegarde managers:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Blocs & Rubrics List
  app.post('/api/blocs', (req, res) => {
    try {
      const blocs = req.body;
      if (!Array.isArray(blocs)) {
        return res.status(400).json({ success: false, error: 'Tableau attendu' });
      }

      db.run('BEGIN TRANSACTION;');
      db.run('DELETE FROM blocs;');
      blocs.forEach(b => {
        db.run(
          `INSERT INTO blocs (id, nom, titreAffiche, poidsPourcentage, description, couleurBadge, rubriquesJson)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.nom, b.titreAffiche, b.poidsPourcentage, b.description || '', b.couleurBadge || '', JSON.stringify(b.rubriques || [])]
        );
      });
      db.run('COMMIT;');

      saveDbToDisk();
      res.json({ success: true, count: blocs.length });
    } catch (err: any) {
      try { db.run('ROLLBACK;'); } catch (_) {}
      console.error('[SQLite] Erreur sauvegarde blocs:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Niveaux
  app.post('/api/niveaux', (req, res) => {
    try {
      const niveaux = req.body;
      if (!Array.isArray(niveaux)) {
        return res.status(400).json({ success: false, error: 'Tableau attendu' });
      }

      db.run('BEGIN TRANSACTION;');
      db.run('DELETE FROM niveaux;');
      niveaux.forEach(niv => {
        db.run(`INSERT INTO niveaux (nom) VALUES (?)`, [niv]);
      });
      db.run('COMMIT;');

      saveDbToDisk();
      res.json({ success: true });
    } catch (err: any) {
      try { db.run('ROLLBACK;'); } catch (_) {}
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Active Theme
  app.post('/api/theme', (req, res) => {
    try {
      const { themeId } = req.body;
      if (!themeId) return res.status(400).json({ success: false });

      db.run(`INSERT OR REPLACE INTO settings (cle, valeurJson) VALUES (?, ?)`, ['theme_id', JSON.stringify(themeId)]);
      saveDbToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Theme Background Settings (photo URL or base64, blur, opacity)
  app.post('/api/theme-bg', (req, res) => {
    try {
      const { imageUrl, blur, overlayOpacity } = req.body;
      const bgConfig = {
        imageUrl: typeof imageUrl === 'string' ? imageUrl : '',
        blur: typeof blur === 'number' ? Math.min(30, Math.max(0, blur)) : 0,
        overlayOpacity: typeof overlayOpacity === 'number' ? Math.min(100, Math.max(0, overlayOpacity)) : 0
      };

      db.run(`INSERT OR REPLACE INTO settings (cle, valeurJson) VALUES (?, ?)`, ['theme_bg', JSON.stringify(bgConfig)]);
      saveDbToDisk();
      res.json({ success: true, data: bgConfig });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Application Name
  app.post('/api/app-name', (req, res) => {
    try {
      const { appName } = req.body;
      if (!appName || typeof appName !== 'string') return res.status(400).json({ success: false });

      db.run(`INSERT OR REPLACE INTO settings (cle, valeurJson) VALUES (?, ?)`, ['app_name', JSON.stringify(appName.trim())]);
      saveDbToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset to Defaults
  app.post('/api/reset-defaults', (req, res) => {
    try {
      db.run('DELETE FROM managers;');
      db.run('DELETE FROM blocs;');
      db.run('DELETE FROM evaluations;');
      db.run('DELETE FROM niveaux;');

      INITIAL_CHARGES_DE_FLUX.forEach(m => {
        db.run(
          `INSERT INTO managers (id, matricule, nomPrenom, niveau, nPlusUn, photoUrl, actif, dateCreation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.id, m.matricule, m.nomPrenom, m.niveau, m.nPlusUn, m.photoUrl || '', m.actif ? 1 : 0, m.dateCreation]
        );
      });

      INITIAL_BLOCS.forEach(b => {
        db.run(
          `INSERT INTO blocs (id, nom, titreAffiche, poidsPourcentage, description, couleurBadge, rubriquesJson)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.nom, b.titreAffiche, b.poidsPourcentage, b.description, b.couleurBadge, JSON.stringify(b.rubriques)]
        );
      });

      INITIAL_EVALUATIONS.forEach(e => {
        db.run(
          `INSERT INTO evaluations (
            id, chargeDeFluxId, mois, annee, statut, scoreTotal, scoreBehavior, scoreManagement, scoreDelivery,
            noteSurVingt, dateEntretien, nPlusUn, commentaireGlobal, validePar, dateValidation, derniereModification,
            notesJson, actionsSuiviJson
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id, e.chargeDeFluxId, e.mois, e.annee, e.statut, e.scoreTotal, e.scoreBehavior, e.scoreManagement, e.scoreDelivery,
            (e.scoreTotal / 5), e.dateEntretien, e.nPlusUn, e.commentaireGlobal, e.validePar || '', e.dateValidation || '',
            e.derniereModification, JSON.stringify(e.notes), JSON.stringify(e.actionsSuivi || [])
          ]
        );
      });

      INITIAL_NIVEAUX.forEach(niv => {
        db.run(`INSERT INTO niveaux (nom) VALUES (?)`, [niv]);
      });

      db.run(`INSERT OR REPLACE INTO settings (cle, valeurJson) VALUES (?, ?)`, ['theme_id', JSON.stringify('concentrix-pastel')]);

      saveDbToDisk();
      res.json({ success: true, message: 'Base SQLite réinitialisée aux valeurs d’origine.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear all data
  app.post('/api/clear-all', (req, res) => {
    try {
      db.run('DELETE FROM managers;');
      db.run('DELETE FROM evaluations;');
      saveDbToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==================== VITE SPA MIDDLEWARE ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CONCENTRIX Server] En écoute sur le port ${PORT} avec moteur SQLite actif.`);
  });
}

startServer().catch(err => {
  console.error('[CONCENTRIX Server] Échec du démarrage:', err);
  process.exit(1);
});
