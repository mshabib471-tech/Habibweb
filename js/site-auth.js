// Habib iFix .Tech - Authoritative Firebase Authentication & Session Manager
// Single source of truth with browserLocalPersistence, real Email/Password, Email Verification & Session Sync
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  setPersistence,
  browserLocalPersistence,
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  checkActionCode
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let firebaseConfig;
try {
  const configRes = await fetch('/api/firebase-config', {
    signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
  });
  if (configRes.ok) {
    firebaseConfig = await configRes.json();
  }
} catch (e) {
  console.warn("Using fallback Firebase config", e);
}

if (!firebaseConfig || !firebaseConfig.apiKey) {
  firebaseConfig = {
    apiKey: "AIzaSyCyv5mWrOTxhdjVzEH_Go9cZ8kwAeWxzGU",
    authDomain: "composite-entropy-26pck.firebaseapp.com",
    projectId: "composite-entropy-26pck",
    storageBucket: "composite-entropy-26pck.firebasestorage.app",
    messagingSenderId: "799648339661",
    appId: "1:799648339661:web:cf5ef3e467363f64d33b84"
  };
}

// Singleton Firebase App and Auth initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

let dbInstance;
try {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(app);
}
export const db = dbInstance;

// Enforce browser local persistence for resilient session preservation across refreshes
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("Auth persistence configuration notice:", err);
});

// Strict Whitelist of Authorized Administrators:
// ONLY tec.habiburrahman@gmail.com and mshabib471@gmail.com can access Admin Panel
export const AUTHORIZED_ADMIN_EMAILS = [
  'tec.habiburrahman@gmail.com',
  'mshabib471@gmail.com'
];

export function isAuthorizedAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

const STORAGE_USER_KEY = 'habib_current_user';
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
let inMemorySessionToken = null;

export function getSessionToken() {
  return inMemorySessionToken;
}

// Centralized Auth Ready Promise: prevents premature redirects during session restoration
let authIsReady = false;
let authReadyResolve;
const authReadyPromise = new Promise(resolve => {
  authReadyResolve = resolve;
});

export function waitForAuthReady() {
  if (authIsReady) {
    return Promise.resolve(auth.currentUser);
  }
  return authReadyPromise;
}

// Get current local session
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(STORAGE_USER_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem('habib_logged_in', 'true');
    if (user.email) {
      localStorage.setItem('habib_user_email', user.email);
    }
    const isAdmin = isAuthorizedAdminEmail(user.email);
    if (isAdmin) {
      localStorage.setItem('habib_is_admin', 'true');
    } else {
      localStorage.removeItem('habib_is_admin');
    }
  } else {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem('habib_logged_in');
    localStorage.removeItem('habib_is_admin');
    localStorage.removeItem('habib_user_email');
  }
  updateAllNavbars();
}

// Universal Navbar & Sidebar Sync
export function updateAllNavbars() {
  const user = getCurrentUser();
  if (window.HabibLayout && typeof window.HabibLayout.updateAuthChrome === 'function') {
    window.HabibLayout.updateAuthChrome(user);
  }
  const loginNavContainers = document.querySelectorAll('#loginNavBtn, .login-nav-btn');
  const profileContainers = document.querySelectorAll('#profileBtn, .user-profile-widget');
  const sidebarProfile = document.getElementById('sidebarProfileSection');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

  if (!window.HabibLayout && sidebarProfile) {
    if (user) {
      const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
      const isAdmin = isAuthorizedAdminEmail(user.email);
      const safeName = window.escapeHtml ? window.escapeHtml(user.name || 'User') : (user.name || 'User');
      const safeEmail = window.escapeHtml ? window.escapeHtml(user.email || 'Member') : (user.email || 'Member');
      sidebarProfile.innerHTML = `
        <div class="relative w-full">
          <div onclick="window.toggleSidebarUserPopup(event)" class="sidebar-user-card sidebar-user-card-surface w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left cursor-pointer" title="${safeName} (${safeEmail})">
            <img src="${avatarUrl}" class="sidebar-user-avatar w-10 h-10 rounded-xl object-cover border-2 ${isAdmin ? 'border-amber-400' : 'border-sky-400'} shrink-0 shadow-sm" alt="Avatar">
            <div class="sidebar-user-info flex-1 min-w-0">
              <div class="sidebar-user-name text-sm font-black truncate text-slate-900">${safeName}</div>
              <div class="sidebar-user-email text-xs truncate text-sky-600 font-semibold">${safeEmail}</div>
            </div>
            <i class="sidebar-user-chevron fa-solid fa-chevron-right text-xs text-slate-400"></i>
          </div>
        </div>
      `;
      if (sidebarLogoutBtn) sidebarLogoutBtn.classList.remove('hidden');
    } else {
      sidebarProfile.innerHTML = `
        <a href="login.html" class="sidebar-user-card sidebar-user-card-surface flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left" title="Sign In / Register">
          <div class="blue-glass-login-icon">
            <i class="fa-solid fa-right-to-bracket text-sky-700 text-sm"></i>
          </div>
          <div class="sidebar-user-info flex-1 min-w-0">
            <div class="sidebar-user-name text-sm font-black text-slate-900">Account</div>
            <div class="sidebar-user-email text-xs text-sky-600 font-extrabold">Sign In / Register &rarr;</div>
          </div>
        </a>
      `;
      if (sidebarLogoutBtn) sidebarLogoutBtn.classList.add('hidden');
    }
  }

  if (user) {
    loginNavContainers.forEach(el => {
      el.style.display = 'none';
      el.classList.add('hidden');
    });

    profileContainers.forEach(el => {
      el.style.display = 'flex';
      el.classList.remove('hidden');

      const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
      const isAdmin = isAuthorizedAdminEmail(user.email);

      let dropdown = el.querySelector('#userDropdownMenu');
      if (!dropdown) {
        const wrapper = document.createElement('div');
        wrapper.id = 'userDropdownMenu';
        wrapper.className = 'relative inline-block text-left';
        wrapper.innerHTML = `
          <button id="userMenuToggleBtn" type="button" class="flex items-center gap-2 p-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 transition-all text-xs font-bold text-slate-900 shadow-sm cursor-pointer">
            <img id="navUserAvatar" src="${avatarUrl}" class="w-8 h-8 rounded-lg object-cover border-2 ${isAdmin ? 'border-amber-400' : 'border-sky-400'}">
            <div class="hidden sm:flex flex-col text-left pr-1 leading-tight">
              <span class="text-xs font-black text-slate-900 max-w-[110px] truncate">${user.name || 'Account'}</span>
              <span class="text-[9px] ${isAdmin ? 'text-amber-600 font-extrabold' : 'text-sky-600 font-bold'} uppercase font-mono tracking-wider">${isAdmin ? 'ADMIN' : 'MEMBER'}</span>
            </div>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-500"></i>
          </button>
          <div id="userDropdownPanel" class="hidden absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl p-2 z-50 divide-y divide-slate-100 backdrop-blur-xl">
            <div class="p-3">
              <p class="text-xs font-extrabold text-slate-900">${user.name || 'User'}</p>
              <p class="text-[10px] text-slate-500 font-mono truncate">${user.email || ''}</p>
              <div class="mt-2 flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span class="text-[9px] text-slate-500 font-mono font-bold">USER ID:</span>
                <span class="text-[10px] text-sky-700 font-mono font-black tracking-wide">${user.userCode || ('HIFIX-USR-' + (1000 + (user.id || 1)))}</span>
              </div>
              <span class="mt-1.5 inline-block text-[9px] px-2 py-0.5 rounded-md font-mono font-bold ${isAdmin ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}">
                ${isAdmin ? '★ Verified Administrator' : '✓ Verified Member'}
              </span>
            </div>
            <div class="py-1.5 space-y-0.5">
              <a href="dashboard.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl transition-colors">
                <i class="fa-solid fa-gauge text-sky-600"></i> My Dashboard
              </a>
              ${isAdmin ? `
                <a href="admin.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
                  <i class="fa-solid fa-shield-halved text-amber-600"></i> Admin CMS
                </a>
              ` : ''}
              <a href="free-offer.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors">
                <i class="fa-solid fa-gift text-purple-600"></i> Free Offers & Perks
              </a>
              <a href="contact.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <i class="fa-solid fa-wrench text-sky-600"></i> Book Repair / Ticket
              </a>
              <a href="courses.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Training Courses
              </a>
            </div>
            <div class="pt-1.5">
              <button onclick="window.doRealLogout()" class="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer">
                <i class="fa-solid fa-power-off text-rose-600"></i> Sign Out
              </button>
            </div>
          </div>
        `;
        el.innerHTML = '';
        el.appendChild(wrapper);

        const toggleBtn = wrapper.querySelector('#userMenuToggleBtn');
        const panel = wrapper.querySelector('#userDropdownPanel');
        if (toggleBtn && panel) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('hidden');
          });

          document.addEventListener('click', () => {
            panel.classList.add('hidden');
          });
        }
      }

      // Universal Floating Admin Ribbon for logged-in admin (Light Glassmorphism)
      if (isAdmin && !window.location.pathname.endsWith('admin.html')) {
        let adminBar = document.getElementById('adminUniversalQuickBar');
        if (!adminBar) {
          adminBar = document.createElement('div');
          adminBar.id = 'adminUniversalQuickBar';
          adminBar.className = 'fixed bottom-4 right-4 z-50 flex items-center gap-2 p-2 rounded-2xl bg-white/95 border border-amber-300 shadow-[0_12px_32px_rgba(15,23,42,0.14)] backdrop-blur-xl';
          adminBar.innerHTML = `
            <div class="flex items-center gap-2 pl-2 pr-1">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span class="text-xs font-black text-amber-800 hidden md:inline">Admin Mode</span>
            </div>
            <a href="admin.html" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black border border-amber-300 transition-colors flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-gauge text-amber-600"></i> <span>Dashboard</span>
            </a>
            <a href="free-offer.html" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-black border border-purple-200 transition-colors flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-gift text-purple-600"></i> <span>Free Offers</span>
            </a>
            <button onclick="window.doRealLogout()" title="Logout" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs border border-rose-200 transition-colors cursor-pointer">
              <i class="fa-solid fa-power-off"></i>
            </button>
          `;
          document.body.appendChild(adminBar);
        }
      }
    });
  } else {
    loginNavContainers.forEach(el => {
      el.style.display = 'flex';
      el.classList.remove('hidden');
    });

    profileContainers.forEach(el => {
      el.style.display = 'none';
      el.classList.add('hidden');
      el.innerHTML = '';
    });

    const existingQuickBar = document.getElementById('adminUniversalQuickBar');
    if (existingQuickBar) existingQuickBar.remove();
  }
}

// Resilient Backend Session Synchronizer (Guaranteed Safe JSON Parsing & Network Tolerance)
async function safeSyncSession(idToken, bodyPayload) {
  try {
    const res = await fetch('/api/user/sync-session', {
      method: 'POST',
      credentials: 'same-origin',
      signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': idToken ? `Bearer ${idToken}` : ''
      },
      body: JSON.stringify(bodyPayload)
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.warn('[Sync Session Notice]: Non-JSON response from server, length:', text.length);
    }
    if (data && data.token) {
      inMemorySessionToken = data.token;
    }
    return { ok: res.ok, data };
  } catch (netErr) {
    console.warn('[Sync Session Network Notice]:', netErr);
    return { ok: false, data: null };
  }
}

// REAL GOOGLE AUTH POPUP WITH FIREBASE & BACKEND SYNC
export async function signInWithGoogleReal(intendedRole = 'customer') {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // 1. Trigger real Google OAuth popup
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;
    const cleanEmail = (googleUser.email || '').toLowerCase().trim();
    const isAdmin = isAuthorizedAdminEmail(cleanEmail);
    const idToken = await googleUser.getIdToken();

    // 2. Synchronize verified Google user with server backend safely
    const syncResult = await safeSyncSession(idToken, {
      uid: googleUser.uid,
      email: cleanEmail,
      name: googleUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'User'),
      avatar: googleUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.displayName || 'User')}`,
      emailVerified: true,
      authProvider: 'google',
      role: isAdmin ? 'admin' : intendedRole
    });

    if (syncResult.data && syncResult.data.isBanned) {
      await signOut(auth);
      throw new Error(syncResult.data.error || "Your account has been suspended by the administrator.");
    }

    // 3. If server sync succeeded with authoritative user, use it
    if (syncResult.ok && syncResult.data && syncResult.data.success && syncResult.data.user) {
      setCurrentUser(syncResult.data.user);
      return { 
        success: true, 
        user: syncResult.data.user, 
        isAdmin: syncResult.data.isAdmin || isAdmin, 
        firebaseUser: googleUser 
      };
    }

    // 4. Resilient Fallback: Use verified Google User from Firebase Client Auth
    const fallbackUser = {
      id: Date.now(),
      uid: googleUser.uid,
      userCode: isAdmin ? `HIFIX-ADM-${Math.floor(1000 + Math.random() * 9000)}` : `HIFIX-USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: googleUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'User'),
      email: cleanEmail,
      avatar: googleUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.displayName || 'User')}`,
      emailVerified: true,
      authProvider: 'google',
      role: isAdmin ? 'admin' : (intendedRole || 'customer'),
      lastLogin: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setCurrentUser(fallbackUser);
    return { 
      success: true, 
      user: fallbackUser, 
      isAdmin: isAdmin, 
      firebaseUser: googleUser 
    };
  } catch (error) {
    console.warn("Google Auth Notice:", error.code, error.message);
    throw new Error(formatAuthError(error));
  }
}

// REAL FIREBASE EMAIL LOGIN (signInWithEmailAndPassword)
// Strict: Email must exist in Firebase, password must match, never auto-creates!
export async function signInWithEmailReal(email, password) {
  if (!email || !email.trim()) {
    throw new Error("Please enter your email address.");
  }
  if (!password) {
    throw new Error("Please enter your password.");
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = credential.user;
    const idToken = await firebaseUser.getIdToken();
    const isAdmin = isAuthorizedAdminEmail(cleanEmail);

    // Synchronize session with backend safely
    const syncResult = await safeSyncSession(idToken, {
      uid: firebaseUser.uid,
      email: cleanEmail,
      name: firebaseUser.displayName || cleanEmail.split('@')[0],
      avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
      emailVerified: firebaseUser.emailVerified,
      authProvider: 'email'
    });

    if (syncResult.data && syncResult.data.isBanned) {
      await signOut(auth);
      throw new Error(syncResult.data.error || "Your account has been suspended by the administrator.");
    }

    if (syncResult.ok && syncResult.data && syncResult.data.success && syncResult.data.user) {
      setCurrentUser(syncResult.data.user);
      return { success: true, user: syncResult.data.user, isAdmin: syncResult.data.isAdmin || isAdmin, firebaseUser };
    }

    // Fallback: Use verified client session
    const fallbackUser = {
      id: Date.now(),
      uid: firebaseUser.uid,
      userCode: isAdmin ? `HIFIX-ADM-${Math.floor(1000 + Math.random() * 9000)}` : `HIFIX-USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: firebaseUser.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
      emailVerified: firebaseUser.emailVerified,
      authProvider: 'email',
      role: isAdmin ? 'admin' : 'customer'
    };
    setCurrentUser(fallbackUser);
    return { success: true, user: fallbackUser, isAdmin: isAdmin, firebaseUser };
  } catch (err) {
    console.error("Firebase Email Login Error:", err);
    throw new Error(formatAuthError(err));
  }
}

// REAL FIREBASE EMAIL REGISTRATION (createUserWithEmailAndPassword)
// Sends real email verification and initializes clean user profile
export async function registerWithEmailReal(name, email, phone, password) {
  if (!name || !name.trim()) {
    throw new Error("Full name is required for registration.");
  }
  if (!email || !email.trim()) {
    throw new Error("Valid email address is required.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  try {
    // 1. Real account creation in Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = credential.user;

    // 2. Set profile display name
    await updateProfile(firebaseUser, { displayName: cleanName });

    // 3. Send real Firebase verification email
    try {
      await sendEmailVerification(firebaseUser);
    } catch (vErr) {
      console.warn("sendEmailVerification notice:", vErr);
    }

    const idToken = await firebaseUser.getIdToken();

    // 4. Create clean profile on backend
    const syncResult = await safeSyncSession(idToken, {
      uid: firebaseUser.uid,
      email: cleanEmail,
      name: cleanName,
      phone: phone ? phone.trim() : '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      emailVerified: false,
      authProvider: 'email'
    });

    const userObj = (syncResult.data && syncResult.data.user) ? syncResult.data.user : {
      name: cleanName,
      email: cleanEmail,
      emailVerified: false,
      role: 'customer'
    };

    setCurrentUser(userObj);

    return { 
      success: true, 
      user: userObj, 
      needsVerification: true, 
      firebaseUser 
    };
  } catch (err) {
    console.error("Firebase Registration Error:", err);
    throw new Error(formatAuthError(err));
  }
}

// Resend Email Verification with 60s abuse cooldown
export async function resendVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error("No user is signed in to receive a verification email. Please log in first.");
  }
  if (auth.currentUser.emailVerified) {
    return { alreadyVerified: true };
  }

  const lastSent = sessionStorage.getItem('last_verif_email_timestamp');
  const now = Date.now();
  if (lastSent && (now - parseInt(lastSent)) < 60000) {
    const remain = Math.ceil((60000 - (now - parseInt(lastSent))) / 1000);
    throw new Error(`অনুগ্রহ করে ${remain} সেকেন্ড অপেক্ষা করুন (Please wait ${remain}s before requesting another email).`);
  }

  await sendEmailVerification(auth.currentUser);
  sessionStorage.setItem('last_verif_email_timestamp', String(now));
  return { success: true };
}

// Verify Action Code from link (e.g. verify-email.html?oobCode=...)
export async function verifyEmailActionCode(actionCode) {
  if (!actionCode) {
    throw new Error("Verification code is missing.");
  }
  await applyActionCode(auth, actionCode);
  if (auth.currentUser) {
    await auth.currentUser.reload();
    const idToken = await auth.currentUser.getIdToken(true).catch(() => '');
    await safeSyncSession(idToken, {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      emailVerified: true
    });
  }
  return { success: true };
}

// Authoritative check if current user is email verified
export async function reloadAndCheckEmailVerified() {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  const verified = !!auth.currentUser.emailVerified;
  if (verified) {
    const idToken = await auth.currentUser.getIdToken(true).catch(() => '');
    await safeSyncSession(idToken, {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      emailVerified: true
    });
    const curr = getCurrentUser();
    if (curr) {
      curr.emailVerified = true;
      setCurrentUser(curr);
    }
  }
  return verified;
}

// Helper to translate Firebase Auth errors into clear, friendly messages
function formatAuthError(error) {
  const code = error.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return "এই ইমেইলে কোনো একাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে একাউন্ট তৈরি করুন (No account found with this email. Please register first).";
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "ভুল ইমেইল বা পাসওয়ার্ড। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন (Incorrect email or password. Please verify your credentials).";
    case 'auth/email-already-in-use':
      return "এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট খোলা রয়েছে। লগইন করার চেষ্টা করুন (An account with this email already exists. Please login instead).";
    case 'auth/weak-password':
      return "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে (Password must be at least 6 characters long).";
    case 'auth/invalid-email':
      return "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন (Please enter a valid email address).";
    case 'auth/user-disabled':
      return "আপনার একাউন্টটি সাময়িকভাবে বন্ধ বা বরখাস্ত করা হয়েছে (This account has been suspended by the administrator).";
    case 'auth/too-many-requests':
      return "অনেকবার ভুল চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন (Too many failed attempts. Please try again later).";
    case 'auth/network-request-failed':
      return "ইন্টারনেট কানেকশন সমস্যা। সংযোগ চেক করে আবার চেষ্টা করুন (Network error. Please check your internet connection).";
    case 'auth/popup-closed-by-user':
      return "Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে (Sign-in popup was closed before completion).";
    case 'auth/popup-blocked':
      return "ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে পপআপ এলাও করুন (Popup was blocked by the browser).";
    default:
      if (error && error.message) {
        const msg = String(error.message);
        if (msg.includes('not valid JSON') || msg.includes('Unexpected token') || msg.includes('A server error')) {
          return "সার্ভারের সাথে সংযোগে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন (Temporary server connection issue. Please refresh and try again).";
        }
      }
      return error.message || "Authentication error occurred. Please try again.";
  }
}

// REAL LOGOUT - Clears Firebase, Server Cookies, Local Storage, & Updates UI
export async function signOutReal() {
  inMemorySessionToken = null;
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase signOut notice:", e);
  }
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    await fetch('/api/logout', { credentials: 'same-origin' });
  } catch (e) {
    console.warn("Server logout notice:", e);
  }

  // Clear all local session tokens
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem('habib_logged_in');
  localStorage.removeItem('habib_is_admin');
  localStorage.removeItem('habib_user_email');
  sessionStorage.clear();

  const existingQuickBar = document.getElementById('adminUniversalQuickBar');
  if (existingQuickBar) existingQuickBar.remove();

  updateAllNavbars();

  const currentPath = window.location.pathname;
  if (currentPath.endsWith('admin.html') || currentPath.endsWith('dashboard.html')) {
    window.location.replace('login.html');
  } else {
    window.location.reload();
  }
}

// AUTHORITATIVE SINGLE SOURCE OF TRUTH: onAuthStateChanged
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();
      const isGoogle = firebaseUser.providerData?.some(p => p.providerId === 'google.com');
      const isAdmin = isAuthorizedAdminEmail(cleanEmail);
      const effectiveVerified = !!firebaseUser.emailVerified || !!isGoogle;
      const idToken = await firebaseUser.getIdToken();

      const syncResult = await Promise.race([
        safeSyncSession(idToken, {
          uid: firebaseUser.uid,
          email: cleanEmail,
          name: firebaseUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'User'),
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
          emailVerified: effectiveVerified,
          authProvider: isGoogle ? 'google' : 'email'
        }),
        new Promise((resolve) => setTimeout(() => resolve({ ok: false, data: null, timedOut: true }), 3500))
      ]);

      if (syncResult.ok && syncResult.data && syncResult.data.success && syncResult.data.user) {
        setCurrentUser(syncResult.data.user);
      } else if (syncResult.data && syncResult.data.isBanned) {
        await signOut(auth);
        setCurrentUser(null);
      } else {
        setCurrentUser({
          uid: firebaseUser.uid,
          userCode: isAdmin ? 'HIFIX-ADM-1001' : 'HIFIX-USR-1001',
          name: firebaseUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'User'),
          email: cleanEmail,
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
          emailVerified: effectiveVerified,
          authProvider: isGoogle ? 'google' : 'email',
          role: isAdmin ? 'admin' : 'customer'
        });
      }
    } catch (e) {
      console.warn("Firebase Auth sync notice:", e);
    }
  } else {
    inMemorySessionToken = null;
    // Only clear stale user if not in middle of popup login
    const current = getCurrentUser();
    if (current) {
      setCurrentUser(null);
    }
  }

  // Resolve auth readiness barrier
  if (!authIsReady) {
    authIsReady = true;
    authReadyResolve(firebaseUser);
  }
  updateAllNavbars();
});

// Expose globally on window for seamless inline script compatibility
window.HabibAuth = {
  auth,
  db,
  AUTHORIZED_ADMIN_EMAILS,
  isAuthorizedAdminEmail,
  waitForAuthReady,
  getCurrentUser,
  setCurrentUser,
  getSessionToken,
  safeSyncSession,
  signInWithGoogleReal,
  signInWithEmailReal,
  registerWithEmailReal,
  resendVerificationEmail,
  verifyEmailActionCode,
  reloadAndCheckEmailVerified,
  signOutReal,
  updateAllNavbars
};

window.doRealLogout = signOutReal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateAllNavbars();
  });
} else {
  updateAllNavbars();
}
