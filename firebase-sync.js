// Optional cloud save. Loaded only when firebase-config.js has an apiKey.
// Local saves (localStorage) always remain the primary save.
const V = '10.14.1';
const base = `https://www.gstatic.com/firebasejs/${V}/`;
let api = null;
async function boot() {
  if (api) return api;
  const cfg = window.ERS_FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey) throw new Error('Cloud save is not configured yet.');
  const [app, auth, fs] = await Promise.all([
    import(base + 'firebase-app.js'),
    import(base + 'firebase-auth.js'),
    import(base + 'firebase-firestore.js')
  ]);
  const a = app.initializeApp(cfg);
  api = { auth: auth.getAuth(a), db: fs.getFirestore(a), A: auth, F: fs };
  return api;
}
async function user() {
  const x = await boot();
  if (x.auth.currentUser) return x;
  await x.A.signInWithPopup(x.auth, new x.A.GoogleAuthProvider());
  return x;
}
window.ERS_CLOUD = {
  ready: () => !!(window.ERS_FIREBASE_CONFIG && window.ERS_FIREBASE_CONFIG.apiKey),
  async upload(text) {
    const x = await user();
    await x.F.setDoc(x.F.doc(x.db, 'users', x.auth.currentUser.uid, 'saves', 'main'),
      { data: text, updatedAt: x.F.serverTimestamp() });
    return 'Saved to your account.';
  },
  async download() {
    const x = await user();
    const s = await x.F.getDoc(x.F.doc(x.db, 'users', x.auth.currentUser.uid, 'saves', 'main'));
    if (!s.exists()) return null;
    return s.data().data;
  },
  async signOut() {
    const x = await boot();
    await x.A.signOut(x.auth);
    return 'Signed out.';
  }
};
