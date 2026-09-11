import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaLdtzOIZVYB-Bdc42CXm2T8iclWLc4o0",
  authDomain: "habib-yt.firebaseapp.com",
  projectId: "habib-yt",
  storageBucket: "habib-yt.firebasestorage.app",
  messagingSenderId: "656628491244",
  appId: "1:656628491244:web:e01ccd42bd8a2b1b4c96c9",
  measurementId: "G-GNY1T88D34"
};

const app = getApps().find(a => a.name === "habib-public") || initializeApp(firebaseConfig, "habib-public");
const auth = getAuth(app);
const storage = getStorage(app);
const DEFAULT_AVATAR = "https://www.svgrepo.com/show/5125/avatar.svg";

function byId(id){ return document.getElementById(id); }

// instant check with localStorage fallback to prevent UI flickering on load
function updateUIState(user) {
  const loginButtons = document.querySelectorAll('#loginBtn, #loginNavBtn, a[href*="login.html"]');
  const profileButtons = document.querySelectorAll('#profileBtn, #userProfileMenu');
  const avatars = document.querySelectorAll('#headerAvatar, #userAvatarImg');

  if (user) {
    // Hide login buttons
    loginButtons.forEach(el => {
      if (el) {
        el.style.display = 'none';
        el.classList.add('hidden');
      }
    });

    // Show profile/avatar buttons
    profileButtons.forEach(el => {
      if (el) {
        el.style.display = 'flex';
        el.classList.remove('hidden');
      }
    });

    const avatarUrl = user.photoURL || DEFAULT_AVATAR;
    avatars.forEach(el => {
      if (el) el.src = avatarUrl;
    });

    localStorage.setItem('habib_logged_in', 'true');
    if (user.photoURL) localStorage.setItem('habib_user_avatar', user.photoURL);
  } else {
    // Show login buttons
    loginButtons.forEach(el => {
      if (el) {
        el.style.display = 'flex';
        el.classList.remove('hidden');
      }
    });

    // Hide profile/avatar buttons
    profileButtons.forEach(el => {
      if (el) {
        el.style.display = 'none';
        el.classList.add('hidden');
      }
    });

    localStorage.removeItem('habib_logged_in');
  }

  window.currentHabibUser = user || null;
}

// Run quick UI check immediately using localStorage before Firebase fully boots up
if (localStorage.getItem('habib_logged_in') === 'true') {
  const savedAvatar = localStorage.getItem('habib_user_avatar') || DEFAULT_AVATAR;
  updateUIState({ photoURL: savedAvatar });
}

async function uploadAvatar(file, user, avatarEl){
  if(!file || !user) return;
  if(!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if(file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB.");
  if(avatarEl) avatarEl.src = "https://www.svgrepo.com/show/285573/loading-spinner.svg";
  const storageRef = ref(storage, `avatars/${user.uid}`);
  await uploadBytes(storageRef, file, { contentType: file.type, cacheControl: "public,max-age=3600" });
  const url = await getDownloadURL(storageRef);
  await updateProfile(user, { photoURL: url });
  if(avatarEl) avatarEl.src = url;
  localStorage.setItem('habib_user_avatar', url);
  return url;
}

onAuthStateChanged(auth, user => {
  updateUIState(user);
});

window.doLogout = async function(){
  try {
    localStorage.removeItem('habib_logged_in');
    localStorage.removeItem('habib_user_avatar');
    await signOut(auth);
    window.location.reload();
  } catch(err) {
    console.error("Logout failed:", err);
    alert("Logout failed. Please try again.");
  }
};
window.logoutCurrentUser = window.doLogout;

const picInput = byId("profilePicInput");
if(picInput){
  picInput.addEventListener("change", async e => {
    const file = e.target.files?.[0];
    try {
      await uploadAvatar(file, auth.currentUser, byId("headerAvatar"));
    } catch(err) {
      console.error("Avatar upload failed:", err);
      alert(err.message || "Profile picture upload failed.");
      const avatar = byId("headerAvatar");
      if(avatar) avatar.src = auth.currentUser?.photoURL || DEFAULT_AVATAR;
    } finally {
      picInput.value = "";
    }
  });
}
