// Habib iFix .Tech - Real Firebase Google Auth & User Authentication Manager
// Integrates real Google Sign-In popup with Firebase project 'habib-yt' and backend sync
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaLdtzOIZVYB-Bdc42CXm2T8iclWLc4o0",
  authDomain: "habib-yt.firebaseapp.com",
  projectId: "habib-yt",
  storageBucket: "habib-yt.firebasestorage.app",
  messagingSenderId: "656628491244",
  appId: "1:656628491244:web:e01ccd42bd8a2b1b4c96c9",
  measurementId: "G-GNY1T88D34"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const STORAGE_USER_KEY = 'habib_current_user';
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=User';

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
    if (user.role === 'admin' || (user.email && user.email.toLowerCase().includes('tec.habiburrahman'))) {
      localStorage.setItem('habib_is_admin', 'true');
    }
  } else {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem('habib_logged_in');
    localStorage.removeItem('habib_is_admin');
  }
  updateAllNavbars();
}

// Universal Navbar Sync
export function updateAllNavbars() {
  const user = getCurrentUser();
  const loginNavContainers = document.querySelectorAll('#loginNavBtn, .login-nav-btn');
  const profileContainers = document.querySelectorAll('#profileBtn, .user-profile-widget');

  if (user) {
    loginNavContainers.forEach(el => {
      el.style.display = 'none';
      el.classList.add('hidden');
    });

    profileContainers.forEach(el => {
      el.style.display = 'flex';
      el.classList.remove('hidden');

      const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
      const isAdmin = user.role === 'admin' || (user.email && user.email.toLowerCase().includes('tec.habiburrahman'));

      let dropdown = el.querySelector('#userDropdownMenu');
      if (!dropdown) {
        const wrapper = document.createElement('div');
        wrapper.id = 'userDropdownMenu';
        wrapper.className = 'relative inline-block text-left';
        wrapper.innerHTML = `
          <button id="userMenuToggleBtn" type="button" class="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 transition-all text-xs font-bold text-white shadow-md">
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
              ${isAdmin ? `
                <a href="admin.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-white/10 rounded-xl transition-colors">
                  <i class="fa-solid fa-gauge text-amber-400"></i> Admin Dashboard
                </a>
              ` : ''}
              <a href="contact.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-wrench text-cyan-400"></i> Book Repair / Ticket
              </a>
              <a href="courses.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 rounded-xl transition-colors">
                <i class="fa-solid fa-graduation-cap text-indigo-400"></i> Training Courses
              </a>
            </div>
            <div class="pt-1.5">
              <button onclick="window.doRealLogout()" class="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                <i class="fa-solid fa-power-off text-red-400"></i> Sign Out
              </button>
            </div>
          </div>
        `;
        el.innerHTML = '';
        el.appendChild(wrapper);

        const toggleBtn = wrapper.querySelector('#userMenuToggleBtn');
        const panel = wrapper.querySelector('#userDropdownPanel');
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          panel.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
          panel.classList.add('hidden');
        });
      }
    });

    // Update Mobile Menu
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      let mobileBox = mobileMenu.querySelector('#mobileUserBox');
      if (!mobileBox) {
        mobileBox = document.createElement('div');
        mobileBox.id = 'mobileUserBox';
        mobileBox.className = 'p-3 rounded-2xl bg-slate-900 border border-white/15 mb-3 flex items-center justify-between';
        mobileMenu.insertBefore(mobileBox, mobileMenu.firstChild);
      }
      mobileBox.innerHTML = `
        <div class="flex items-center gap-2.5">
          <img src="${user.avatar || DEFAULT_AVATAR}" class="w-9 h-9 rounded-xl object-cover border border-cyan-400">
          <div>
            <p class="text-xs font-bold text-white">${user.name}</p>
            <p class="text-[10px] text-cyan-400 font-mono truncate max-w-[140px]">${user.email}</p>
            <span class="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-500/30">ID: ${user.userCode || ('HIFIX-USR-' + (1000 + (user.id || 1)))}</span>
          </div>
        </div>
        <button onclick="window.doRealLogout()" class="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
          Logout
        </button>
      `;
    }
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

    const mobileBox = document.getElementById('mobileUserBox');
    if (mobileBox) mobileBox.remove();
  }
}

// REAL GOOGLE AUTH POPUP WITH FIREBASE
export async function signInWithGoogleReal(intendedRole = 'customer') {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // Trigger real Google OAuth popup
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    // Send verified Google user to server backend
    const res = await fetch('/api/user/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleUser.email,
        name: googleUser.displayName || googleUser.email.split('@')[0],
        picture: googleUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.displayName || 'User')}`,
        role: intendedRole
      })
    });
    
    const data = await res.json();
    if (data.success) {
      setCurrentUser(data.user);
      return { success: true, user: data.user, isAdmin: data.isAdmin };
    } else {
      throw new Error(data.error || "Authentication failed on server.");
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Google Sign-in popup was blocked by your browser. Please allow popups or use Email & Password.");
    } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error("Google Sign-in was closed before completing.");
    } else {
      throw new Error(error.message || "Could not sign in with Google.");
    }
  }
}

// REAL EMAIL LOGIN
export async function signInWithEmailReal(email, password) {
  const res = await fetch('/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success) {
    setCurrentUser(data.user);
    return data;
  } else {
    throw new Error(data.error || "Invalid email or password.");
  }
}

// REAL REGISTER
export async function registerWithEmailReal(name, email, phone, password) {
  const res = await fetch('/api/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
  const data = await res.json();
  if (data.success) {
    setCurrentUser(data.user);
    return data;
  } else {
    throw new Error(data.error || "Registration failed.");
  }
}

// REAL LOGOUT
export async function signOutReal() {
  try {
    await signOut(auth);
  } catch (e) {}
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (e) {}
  setCurrentUser(null);
  window.location.reload();
}

// Listen to Firebase auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const existing = getCurrentUser();
    if (!existing || existing.email !== user.email) {
      try {
        const res = await fetch('/api/user/google-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            picture: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}`,
            role: user.email.toLowerCase().includes('tec.habiburrahman') ? 'admin' : 'customer'
          })
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (e) {}
    }
  }
});

// Expose globally on window
window.HabibAuth = {
  auth,
  getCurrentUser,
  setCurrentUser,
  signInWithGoogleReal,
  signInWithEmailReal,
  registerWithEmailReal,
  signOutReal,
  updateAllNavbars
};

window.doRealLogout = signOutReal;

document.addEventListener('DOMContentLoaded', () => {
  updateAllNavbars();
  
  // Verify with server session
  fetch('/api/user/me')
    .then(r => r.json())
    .then(d => {
      if (d.loggedIn && d.user) {
        setCurrentUser(d.user);
      }
    })
    .catch(() => {});
});
