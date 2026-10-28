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

const firebaseConfig = {
  projectId: "composite-entropy-26pck",
  appId: "1:799648339661:web:cf5ef3e467363f64d33b84",
  apiKey: "AIzaSyCyv5mWrOTxhdjVzEH_Go9cZ8kwAeWxzGU",
  authDomain: "composite-entropy-26pck.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-habibweb-c47ad6be-1c6a-4e92-9a01-4d4f3334d43e",
  storageBucket: "composite-entropy-26pck.firebasestorage.app",
  messagingSenderId: "799648339661",
  measurementId: "",
  oAuthClientId: "799648339661-h724lekklaluoadvqqlvkgc3tvt4hop9.apps.googleusercontent.com"
};

// Singleton Firebase App and Auth initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  const loginNavContainers = document.querySelectorAll('#loginNavBtn, .login-nav-btn');
  const profileContainers = document.querySelectorAll('#profileBtn, .user-profile-widget');
  const sidebarProfile = document.getElementById('sidebarProfileSection');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

  if (sidebarProfile) {
    if (user) {
      const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
      const isAdmin = isAuthorizedAdminEmail(user.email);
      const safeName = window.escapeHtml ? window.escapeHtml(user.name || 'User') : (user.name || 'User');
      const safeEmail = window.escapeHtml ? window.escapeHtml(user.email || 'Member') : (user.email || 'Member');
      sidebarProfile.innerHTML = `
        <div class="relative w-full">
          <div onclick="window.toggleSidebarUserPopup(event)" class="sidebar-user-card w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left cursor-pointer" title="${safeName} (${safeEmail})">
            <img src="${avatarUrl}" class="sidebar-user-avatar w-10 h-10 rounded-xl object-cover border-2 ${isAdmin ? 'border-amber-400' : 'border-cyan-400'} shrink-0 shadow-sm" alt="Avatar">
            <div class="sidebar-user-info flex-1 min-w-0">
              <div class="sidebar-user-name text-sm font-black truncate text-slate-900 dark:text-white">${safeName}</div>
              <div class="sidebar-user-email text-xs truncate text-slate-500 dark:text-slate-400">${safeEmail}</div>
            </div>
            <i class="sidebar-user-chevron fa-solid fa-chevron-right text-xs opacity-60 text-slate-400"></i>
          </div>
          <div id="sidebarUserPopup" class="hidden absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-3 z-50 divide-y divide-slate-100 dark:divide-white/10">
            <div class="pb-2">
              <div class="text-xs font-black text-slate-900 dark:text-white">${safeName}</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${safeEmail}</div>
              <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] font-mono font-bold ${isAdmin ? 'text-amber-500' : 'text-cyan-500'}">${isAdmin ? '★ ADMINISTRATOR' : '✓ MEMBER'}</span>
                ${user.emailVerified ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">VERIFIED</span>' : '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono">UNVERIFIED</span>'}
              </div>
            </div>
            <div class="py-2 space-y-1">
              <a href="dashboard.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <i class="fa-solid fa-gauge text-cyan-500"></i> My Dashboard
              </a>
              ${isAdmin ? `
              <a href="admin.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <i class="fa-solid fa-shield-halved text-amber-500"></i> Admin CMS & Control
              </a>
              ` : ''}
              <a href="contact.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <i class="fa-solid fa-wrench text-cyan-500"></i> My Repairs / Tickets
              </a>
              <a href="free-offer.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <i class="fa-solid fa-gift text-purple-500"></i> Free Offers & Perks
              </a>
            </div>
            <div class="pt-2">
              <button onclick="window.doRealLogout()" class="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                <i class="fa-solid fa-power-off"></i> Log Out
              </button>
            </div>
          </div>
        </div>
      `;
      if (sidebarLogoutBtn) sidebarLogoutBtn.classList.remove('hidden');
    } else {
      sidebarProfile.innerHTML = `
        <a href="login.html" class="sidebar-user-card flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left" title="Sign In / Register">
          <div class="sidebar-user-avatar w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
            <i class="fa-solid fa-user text-base"></i>
          </div>
          <div class="sidebar-user-info flex-1 min-w-0">
            <div class="sidebar-user-name text-sm font-black text-slate-900 dark:text-white">Account</div>
            <div class="sidebar-user-email text-xs text-indigo-600 dark:text-cyan-400 font-bold">Sign In / Register &rarr;</div>
          </div>
        </a>
      `;
      if (sidebarLogoutBtn) sidebarLogoutBtn.classList.add('hidden');
    }
  }

  // Sidebar admin CMS link inject for authorized administrators only
  const sidebarLinks = document.getElementById('sidebar-links');
  if (sidebarLinks) {
    const existingAdminLink = document.getElementById('sidebarAdminLink');
    if (user && isAuthorizedAdminEmail(user.email)) {
      if (!existingAdminLink) {
        const adminLink = document.createElement('a');
        adminLink.id = 'sidebarAdminLink';
        adminLink.href = 'admin.html';
        adminLink.className = 'sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-amber-500 hover:text-amber-400 bg-amber-500/10 border border-amber-500/20';
        adminLink.setAttribute('data-page', 'admin.html');
        adminLink.setAttribute('title', 'Admin CMS');
        adminLink.setAttribute('data-tooltip', 'Admin CMS');
        adminLink.innerHTML = `
          <i class="fa-solid fa-shield-halved w-5 text-center text-sm shrink-0 text-amber-500"></i>
          <span class="sidebar-label text-sm font-bold">Admin CMS</span>
        `;
        const dashItem = sidebarLinks.querySelector('[data-page="dashboard.html"]');
        if (dashItem && dashItem.nextSibling) {
          sidebarLinks.insertBefore(adminLink, dashItem.nextSibling);
        } else {
          sidebarLinks.appendChild(adminLink);
        }
      }
    } else {
      if (existingAdminLink) {
        existingAdminLink.remove();
      }
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
          <button id="userMenuToggleBtn" type="button" class="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 transition-all text-xs font-bold text-white shadow-md cursor-pointer">
            <img id="navUserAvatar" src="${avatarUrl}" class="w-8 h-8 rounded-lg object-cover border-2 ${isAdmin ? 'border-amber-400' : 'border-cyan-400'}">
            <div class="hidden sm:flex flex-col text-left pr-1 leading-tight">
              <span class="text-xs font-black text-white max-w-[110px] truncate">${user.name || 'Account'}</span>
              <span class="text-[9px] ${isAdmin ? 'text-amber-400 font-extrabold' : 'text-cyan-400 font-bold'} uppercase font-mono tracking-wider">${isAdmin ? 'ADMIN' : 'MEMBER'}</span>
            </div>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-300"></i>
          </button>
          <div id="userDropdownPanel" class="hidden absolute right-0 mt-2 w-60 rounded-2xl bg-slate-950/98 border border-white/20 shadow-2xl p-2 z-50 divide-y divide-white/10 backdrop-blur-xl">
            <div class="p-3">
              <p class="text-xs font-extrabold text-white">${user.name || 'User'}</p>
              <p class="text-[10px] text-slate-300 font-mono truncate">${user.email || ''}</p>
              <div class="mt-2 flex items-center justify-between bg-slate-900/90 px-2 py-1 rounded-lg border border-white/10">
                <span class="text-[9px] text-slate-400 font-mono font-bold">USER ID:</span>
                <span class="text-[10px] text-cyan-300 font-mono font-black tracking-wide">${user.userCode || ('HIFIX-USR-' + (1000 + (user.id || 1)))}</span>
              </div>
              <span class="mt-1.5 inline-block text-[9px] px-2 py-0.5 rounded-md font-mono font-bold ${isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}">
                ${isAdmin ? '★ Verified Administrator' : '✓ Verified Member'}
              </span>
            </div>
            <div class="py-1.5 space-y-0.5">
              <a href="dashboard.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-gauge text-cyan-400"></i> My Dashboard
              </a>
              ${isAdmin ? `
                <a href="admin.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-white/10 rounded-xl transition-colors">
                  <i class="fa-solid fa-shield-halved text-amber-400"></i> Admin CMS
                </a>
              ` : ''}
              <a href="free-offer.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-gift text-purple-400"></i> Free Offers & Perks 🎁
              </a>
              <a href="contact.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-wrench text-cyan-400"></i> Book Repair / Ticket
              </a>
              <a href="courses.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-graduation-cap text-indigo-400"></i> Training Courses
              </a>
            </div>
            <div class="pt-1.5">
              <button onclick="window.doRealLogout()" class="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer">
                <i class="fa-solid fa-power-off text-red-400"></i> Sign Out
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

      // Universal Floating Admin Ribbon for logged-in admin
      if (isAdmin && !window.location.pathname.endsWith('admin.html')) {
        let adminBar = document.getElementById('adminUniversalQuickBar');
        if (!adminBar) {
          adminBar = document.createElement('div');
          adminBar.id = 'adminUniversalQuickBar';
          adminBar.className = 'fixed bottom-4 right-4 z-50 flex items-center gap-2 p-2 rounded-2xl bg-slate-950/95 border border-amber-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl';
          adminBar.innerHTML = `
            <div class="flex items-center gap-2 pl-2 pr-1">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span class="text-xs font-black text-amber-300 hidden md:inline">Admin Mode</span>
            </div>
            <a href="admin.html" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black border border-amber-500/40 transition-colors flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-gauge"></i> <span>Dashboard</span>
            </a>
            <a href="free-offer.html" class="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-black border border-purple-500/40 transition-colors flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-gift"></i> <span>Free Offers</span>
            </a>
            <button onclick="window.doRealLogout()" title="Logout" class="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs border border-red-500/40 transition-colors cursor-pointer">
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

// REAL GOOGLE AUTH POPUP WITH FIREBASE & BACKEND SYNC
export async function signInWithGoogleReal(intendedRole = 'customer') {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // Trigger real Google OAuth popup
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;
    const idToken = await googleUser.getIdToken();

    // Send verified Google user to server backend
    const res = await fetch('/api/user/sync-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        uid: googleUser.uid,
        email: googleUser.email,
        name: googleUser.displayName || googleUser.email.split('@')[0],
        avatar: googleUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.displayName || 'User')}`,
        emailVerified: true,
        authProvider: 'google',
        role: intendedRole
      })
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      setCurrentUser(data.user);
      return { success: true, user: data.user, isAdmin: data.isAdmin, firebaseUser: googleUser };
    } else {
      if (data.isBanned) {
        await signOut(auth);
      }
      throw new Error(data.error || "Authentication failed on server.");
    }
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
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const firebaseUser = credential.user;
    const idToken = await firebaseUser.getIdToken();

    // Synchronize authoritative session with backend
    const res = await fetch('/api/user/sync-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
        emailVerified: firebaseUser.emailVerified,
        authProvider: 'email'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      await signOut(auth);
      throw new Error(data.error || "Login verification failed on server.");
    }

    setCurrentUser(data.user);
    return { success: true, user: data.user, isAdmin: data.isAdmin, firebaseUser };
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

    // 4. Create clean minimal profile on backend (0 orders, 0 bookings, 0 diamonds)
    const res = await fetch('/api/user/sync-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone: phone ? phone.trim() : '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        emailVerified: false,
        authProvider: 'email'
      })
    });

    const data = await res.json();
    setCurrentUser(data.user || {
      name: cleanName,
      email: cleanEmail,
      emailVerified: false,
      role: 'customer'
    });

    return { 
      success: true, 
      user: data.user, 
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
    await fetch('/api/user/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: true
      })
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
    await fetch('/api/user/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: true
      })
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
      return error.message || "Authentication error occurred. Please try again.";
  }
}

// REAL LOGOUT - Clears Firebase, Server Cookies, Local Storage, & Updates UI
export async function signOutReal() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase signOut notice:", e);
  }
  try {
    await fetch('/api/logout', { method: 'POST' });
    await fetch('/api/logout');
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
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch('/api/user/sync-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'User')}`,
          emailVerified: firebaseUser.emailVerified,
          authProvider: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else if (data.isBanned) {
        await signOut(auth);
        setCurrentUser(null);
      }
    } catch (e) {
      console.warn("Firebase Auth sync notice:", e);
    }
  } else {
    // When Firebase reports no active user, clear client state
    const current = getCurrentUser();
    if (current) {
      setCurrentUser(null);
    }
  }

  // Resolve auth readiness barrier
  authIsReady = true;
  authReadyResolve(firebaseUser);
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

document.addEventListener('DOMContentLoaded', () => {
  updateAllNavbars();
});
