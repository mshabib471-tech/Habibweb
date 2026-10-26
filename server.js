const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname));

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

// API Endpoint for Firebase Config
app.get('/api/firebase-config', (req, res) => {
  res.json(firebaseConfig);
});

// DB Helper with Serverless Fallback
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { posts: [], bookings: [], users: [], contacts: [], aiMessages: [], orders: [], offers: [], nextPostId: 1, nextBookingId: 1, nextUserId: 1, nextContactId: 1, nextAiMsgId: 1, nextOrderId: 1, nextOfferId: 1 };
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    data.posts = data.posts || [];
    data.bookings = data.bookings || [];
    data.users = data.users || [];
    data.contacts = data.contacts || [];
    data.aiMessages = data.aiMessages || [];
    data.orders = data.orders || [];
    data.offers = data.offers || [];
    data.nextPostId = data.nextPostId || 1;
    data.nextBookingId = data.nextBookingId || 1;
    data.nextUserId = data.nextUserId || 1;
    data.nextContactId = data.nextContactId || 1;
    data.nextAiMsgId = data.nextAiMsgId || 1;
    data.nextOrderId = data.nextOrderId || 1;
    data.nextOfferId = data.nextOfferId || 1;
    return data;
  } catch (e) {
    return { posts: [], bookings: [], users: [], contacts: [], aiMessages: [], orders: [], offers: [], nextPostId: 1, nextBookingId: 1, nextUserId: 1, nextContactId: 1, nextAiMsgId: 1, nextOrderId: 1, nextOfferId: 1 };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to database.json:", err);
  }
}

// Auth middleware - checks admin cookie, admin token header, or admin user session
const checkAdmin = (req, res, next) => {
  const adminCookie = req.cookies && req.cookies.admin_session === 'habib_admin_token_2026';
  const adminHeader = req.headers['x-admin-token'] === 'habib_admin_token_2026';
  if (adminCookie || adminHeader) {
    return next();
  }

  // Check user session ID
  const userSessionId = req.cookies && req.cookies.user_session;
  if (userSessionId) {
    const db = readDB();
    const user = (db.users || []).find(u => u.id === parseInt(userSessionId));
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase().includes('tec.habiburrahman')))) {
      return next();
    }
  }

  const userEmail = req.headers['x-user-email'];
  if (userEmail && userEmail.toLowerCase().includes('tec.habiburrahman')) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Admin access required' });
};

// Initialize Gemini SDK with process.env.GEMINI_API_KEY or provided fallback
const geminiApiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6LDdo6X2fu5yXbCKlV8anEezQeeh87dYZvrTevblG7dsQ";
let aiClient = null;
try {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} catch (err) {
  console.warn("Gemini client initialization notice:", err.message);
}

// Intelligent Conversational AI Diagnostic Engine for Habib iFix
function generateConversationalAIResponse(query, language = 'bn') {
  const rawQ = query || '';
  const q = rawQ.toLowerCase().trim();

  // Smart Device Brand & Model Extraction
  let detectedBrand = null;
  let detectedModel = null;
  if (q.includes('iphone') || q.includes('apple')) {
    detectedBrand = 'Apple iPhone';
    const m = q.match(/iphone\s*(\d+(\s*(pro\s*max|pro|plus|mini))?|x[sr]?|xs\s*max|\d+)/i);
    if (m) detectedModel = m[0].toUpperCase();
  } else if (q.includes('samsung') || q.includes('galaxy')) {
    detectedBrand = 'Samsung Galaxy';
    const m = q.match(/(s\d+|a\d+|m\d+|note\s*\d+|z\s*fold|z\s*flip)/i);
    if (m) detectedModel = 'Samsung ' + m[0].toUpperCase();
  } else if (q.includes('redmi') || q.includes('xiaomi') || q.includes('poco')) {
    detectedBrand = 'Xiaomi / Redmi / Poco';
    const m = q.match(/(note\s*\d+(\s*pro)?|poco\s*[a-z0-9]+|mi\s*\d+|redmi\s*\d+)/i);
    if (m) detectedModel = m[0].toUpperCase();
  } else if (q.includes('vivo')) {
    detectedBrand = 'Vivo';
  } else if (q.includes('oppo')) {
    detectedBrand = 'Oppo';
  } else if (q.includes('realme')) {
    detectedBrand = 'Realme';
  } else if (q.includes('oneplus')) {
    detectedBrand = 'OnePlus';
  } else if (q.includes('pixel')) {
    detectedBrand = 'Google Pixel';
  }
  const deviceLabel = detectedModel || detectedBrand || 'আপনার স্মার্টফোন';

  // 1. WATER DAMAGE (Highest Emergency Priority)
  if (q.includes('water') || q.includes('পানি') || q.includes('ভিজে') || q.includes('liquid') || q.includes('পানিতে') || q.includes('tea') || q.includes('বৃষ্টি')) {
    return {
      title: `💧 ${deviceLabel} পানিতে পড়া ইমার্জেন্সি রিকভারি`,
      category: "Motherboard Ultrasonic Lab Repair",
      severity: "Critical",
      estimatedCost: "৳৮০০ - ৳২,৫০০",
      repairTime: "১ - ৩ ঘণ্টা",
      summary: `${deviceLabel}-এ পানি ঢোকার পর শর্ট সার্কিট প্রতিরোধ ও চিপসেট রিকভারি।`,
      text: `### 💧 ${deviceLabel} পানিতে পড়লে তাৎক্ষণিক করণীয় ও ল্যাব সল্যুশন:

⚠️ **জরুরি সতর্কতা (এখনই যা করবেন না):**
১. **ভুলেও চার্জে লাগাবেন না** — চার্জে দিলে প্রাইমারি লাইনে হাই-ভোল্টেজ গিয়ে পাওয়ার আইসি (PMIC) ও সিপিইউ সাথে সাথে পুড়ে যায়।
২. **পাওয়ার বাটন বারবার চাপবেন না** এবং ফোন অন করার চেষ্টা করবেন না।
৩. চালের ড্রামে রেখে কোনো লাভ হয় না; বরং ভেতরের আর্দ্রতায় মাদারবোর্ডে অক্সিডাইজেশন ও মরিচা ধরে লাইন নষ্ট হয়।

🛠️ **Habib iFix স্পেশাল ল্যাব ট্রিটমেন্ট:**
• দ্রুত ফোন খুলে ডিজিটাল আল্ট্রাসনিক ক্লিনিং মেশিনে ৯৯.৯% আইসোপ্রোপাইল অ্যালকোহল ও সলিউশন দিয়ে ওয়াশ করা হয়।
• থার্মাল ক্যামেরা ও ডিসি পাওয়ার সাপ্লাই দিয়ে শর্ট সার্কিট ড্যামেজ নিখুঁতভাবে ট্রেস ও মেরামত করা হয়।
• 💰 **আনুমানিক খরচ:** ৳৮০০ - ৳২,৫০০ (মডেল ও ক্ষতির মাত্রা অনুযায়ী)।
• ⏱️ **সময়:** ১ থেকে ৩ ঘণ্টার মধ্যে ফুল টেস্ট সহ ডেলিভারি।

👉 দ্রুত ল্যাবে নিয়ে আসুন বা জরুরি সহায়তার জন্য সরাসরি কল দিন: **01868-461577**!`
    };
  }

  // 2. DISPLAY, SCREEN, TOUCH, GLASS CRACK
  if (q.includes('display') || q.includes('screen') || q.includes('টাচ') || q.includes('ডিসপ্লে') || q.includes('ভাঙা') || q.includes('touch') || q.includes('glass') || q.includes('গ্লাস') || q.includes('green line') || q.includes('লাইন') || q.includes('ভেঙে') || q.includes('পর্দা') || q.includes('fete')) {
    return {
      title: `📱 ${deviceLabel} ডিসপ্লে ও ওকা (OCA) গ্লাস সল্যুশন`,
      category: "Hardware / Screen Replacement",
      severity: "High",
      estimatedCost: "৳৮০০ - ৳৮,৫০০ (মডেল অনুযায়ী)",
      repairTime: "৩০ - ৪৫ মিনিট",
      summary: `${deviceLabel}-এর ফাটা গ্লাস বা ড্যামেজ ডিসপ্লের অরিজিনাল কোয়ালিটি রিপ্লেসমেন্ট।`,
      text: `### 📱 ${deviceLabel}-এর ডিসপ্লে ও টাচস্ক্রিন টেকনিক্যাল সল্যুশন:

১. **শুধুমাত্র বাইরের গ্লাস ফেটে গেলে (টাচ ও ডিসপ্লে একদম ঠিক থাকলে):**
• পুরো ডিসপ্লে পরিবর্তনের প্রয়োজন নেই!
• আমাদের অটোমেটিক ভ্যাকুয়াম OCA ল্যামিনেটিং মেশিনের সাহায্যে অরিজিনাল প্যানেল অক্ষত রেখে মাত্র নতুন গ্লাস প্রতিস্থাপন করা হয়।
• 💰 **খরচ:** মাত্র ৳৮০০ - ৳১,৮০০ (৬০% খরচ বেঁচে যাবে)।

২. **ভেতরে কালো দাগ, কালার নষ্ট, গ্রিন লাইন বা টাচ কাজ না করলে:**
• ১০০% অরিজিনাল প্যানেল (AMOLED / Super AMOLED / Retina / IPS) ইন্সটল করা হবে।
• আইফোনের জন্য TrueTone ডেটা রি-রাইট এবং স্যামসাং ও শাওমির জন্য ইন-ডিসপ্লে ফিঙ্গারপ্রিন্ট সেন্সর ক্যালিব্রেশন নিশ্চিত।
• 💰 **খরচ:** ৳১,৫০০ - ৳৮,৫০০ (ব্র্যান্ড ও মডেল অনুযায়ী)।
• ⏱️ **সময়:** মাত্র ৩০ থেকে ৪৫ মিনিটেই কমপ্লিট ডেলিভারি ও ৩০ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি!`
    };
  }

  // 3. BATTERY DRAIN, BATTERY HEALTH & BACKUP
  if (q.includes('battery') || q.includes('ব্যাটারি') || q.includes('backup') || q.includes('drain') || q.includes('health') || q.includes('চার্জ থাকে না') || q.includes('ফুলে') || q.includes('duronto')) {
    return {
      title: `🔋 ${deviceLabel} অরিজিনাল ব্যাটারি রিপ্লেসমেন্ট`,
      category: "Original Battery Replacement",
      severity: "Medium",
      estimatedCost: "৳৮০০ - ৳২,২০০",
      repairTime: "২০ - ৩০ মিনিট",
      summary: `${deviceLabel}-এর ব্যাটারি ব্যাকআপ ড্রপ বা ফুলে যাওয়ার জন্য জেনুইন ব্যাটারি সল্যুশন।`,
      text: `### 🔋 ${deviceLabel}-এর ব্যাটারি ড্রপ ও ব্যাকআপ সমাধান:

• **১০০% অরিজিনাল হাই-ক্যাপাসিটি ব্যাটারি:** নতুন ব্যাটারি লাগালে সারাদিন নিশ্চিন্ত ব্যাকআপ পাওয়া যাবে।
• **আইফোন ব্যাটারি হেলথ ১০০% ও নো আননোন পার্ট মেসেজ:** বিএমএস (BMS) বোর্ড সোয়াপ করে অরিজিনাল হেলথ পার্সেন্টেজ রি-প্রোগ্রামিং।
• **ওয়ারেন্টি:** প্রত্যেকটি অরিজিনাল ব্যাটারিতে পাচ্ছেন ৬ মাসের ডিরেক্ট রিপ্লেসমেন্ট গ্যারান্টি।
• 💰 **আনুমানিক খরচ:** ৳৮০০ - ৳২,২০০ (মডেল অনুযায়ী)।
• ⏱️ **সময়:** মাত্র ২০ থেকে ৩০ মিনিট!`
    };
  }

  // 4. CHARGING, CHARGER PORT, SLOW CHARGING
  if (q.includes('charging') || q.includes('charge') || q.includes('চার্জ') || q.includes('slow charge') || q.includes('পোর্ট') || q.includes('port') || q.includes('পিন') || q.includes('cable') || q.includes('টাইপ সি') || q.includes('type c') || q.includes('otg')) {
    return {
      title: `⚡ ${deviceLabel} ফাস্ট চার্জিং ও পোর্ট রিপেয়ার`,
      category: "Charging Port & Sub-board",
      severity: "Medium",
      estimatedCost: "৳৪০০ - ৳১,২০০",
      repairTime: "১৫ - ২৫ মিনিট",
      summary: `${deviceLabel}-এর স্লো চার্জিং, চার্জ না ধরা বা লুজ পোর্ট সমস্যার স্থায়ী সমাধান।`,
      text: `### ⚡ ${deviceLabel}-এর চার্জিং ও পোর্ট সমস্যার সমাধান:

🔍 **সমস্যার কারণ ও লক্ষণসমূহ:**
• পোর্ট লুজ হয়ে যাওয়া বা ক্যাবল নাড়াচাড়া করলে চার্জ ধরা।
• ফাস্ট চার্জিং সাপোর্ট না করা বা স্লো চার্জ হওয়া (Fake Charging)।
• চার্জিং পিনের ভেতরে কার্বন, ময়লা জমা বা আর্দ্রতা (Moisture Detected) এরর।

🛠️ **আমাদের সার্ভিস:**
• অরিজিনাল Type-C / Lightning চার্জিং পোর্ট অথবা কমপ্লিট অরিজিনাল সাব-বোর্ড রিপ্লেসমেন্ট।
• চার্জিং কন্ট্রোলার আইসি (OVP IC / Charging IC) মাইক্রো-সোল্ডারিং টেস্টিং।
• 💰 **আনুমানিক খরচ:** ৳৪০০ - ৳১,২০০।
• ⏱️ **সময়:** মাত্র ১৫ থেকে ২৫ মিনিটে চোখের সামনে কমপ্লিট রিপেয়ার!`
    };
  }

  // 5. DEAD BOOT, RESTART LOOP, HEATING, SHORT CIRCUIT
  if (q.includes('dead') || q.includes('অন হয় না') || q.includes('on hoy na') || q.includes('restart') || q.includes('রিস্টার্ট') || q.includes('power') || q.includes('শর্ট') || q.includes('short') || q.includes('ic') || q.includes('আইসি') || q.includes('pmic') || q.includes('cpu') || q.includes('heating') || q.includes('গরম')) {
    return {
      title: `🔬 ${deviceLabel} ডেড মাদারবোর্ড ও সিপিইউ মাইক্রো-সোল্ডারিং`,
      category: "Micro-Soldering & Chip-level Repair",
      severity: "Critical",
      estimatedCost: "৳১,২০০ - ৳৪,৫০০",
      repairTime: "২ - ৪ ঘণ্টা",
      summary: `${deviceLabel}-এর হঠাৎ বন্ধ হয়ে যাওয়া, রিস্টার্ট লুপ বা মাদারবোর্ড শর্ট সার্কিট ফিক্স।`,
      text: `### 🔬 ${deviceLabel}-এর ডেড বুট ও মাদারবোর্ড চিপসেট সমাধান:

ফোন অন না হলে বা লোগোতে এসে বারবার রিস্টার্ট নিলে:
১. **ডিসি পাওয়ার সাপ্লাই কারেন্ট ড্র টেস্ট:** রিডিং এনালাইসিস করে প্রাইমারি লাইন শর্ট নাকি সেকেন্ডারি লজিক লাইনের ড্রপ তা শনাক্ত করা হয়।
২. **থার্মাল ক্যামেরা ডায়াগনসিস:** বোর্ডের কোন ক্যাপাসিটর বা আইসি শর্ট হয়ে গরম হচ্ছে তা কয়েক সেকেন্ডেই বের করা হয়।
৩. **বিজিএ মাইক্রো-সোল্ডারিং ও রিবলিং:** পাওয়ার আইসি (PMIC), ইউএফএস (UFS) স্টোরেজ বা ডুয়াল-ডেকার সিপিইউ/র‍্যাম রিবল করে ডেড ফোন রিকভারি করা হয়।
• 💰 **আনুমানিক খরচ:** ৳১,২০০ - ৳৪,৫০০।
• ⏱️ **সময়:** ২ থেকে ৪ ঘণ্টার মধ্যে ফুল টেস্ট সহ ডেলিভারি।`
    };
  }

  // 6. FRP BYPASS, SCREEN LOCK, GOOGLE ACCOUNT
  if (q.includes('frp') || q.includes('bypass') || q.includes('বাইপাস') || q.includes('unlock') || q.includes('লক') || q.includes('lock') || q.includes('password') || q.includes('pattern') || q.includes('পাসওয়ার্ড') || q.includes('google account') || q.includes('গুগল অ্যাকাউন্ট') || q.includes('hard reset') || q.includes('রিসেট')) {
    return {
      title: `🔓 ${deviceLabel} Android ২০২৬ FRP ও প্যাটার্ন আনলক`,
      category: "Software & Security Bypass",
      severity: "Medium",
      estimatedCost: "৳৫০০ - ৳১,৫০০",
      repairTime: "১৫ - ৩০ মিনিট",
      summary: `${deviceLabel}-এর ফ্যাক্টরি রিসেটের পর Google Account লক ও পাসওয়ার্ড খোলার সেবা।`,
      text: `### 🔓 ${deviceLabel}-এর লেটেস্ট ২০২৬ FRP ও সিকিউরিটি আনলক সল্যুশন:

Samsung, Xiaomi, Vivo, Oppo, Realme, Infinix সহ যেকোনো ডিভাইসের লক খোলা সম্ভব:
• **অফিসিয়াল টেস্ট পয়েন্ট (TestPoint) ও EDL মোড ফ্ল্যাশিং**
• **Android 14, 15 ও ২০২৬ লেটেস্ট সিকিউরিটি প্যাচ বাইপাস**
• **রিমোট টিমভিউয়ার / AnyDesk সার্ভিস:** আপনার ল্যাপটপে ইন্টারনেট থাকলে ঘরে বসেই রিমোটলি ফোন আনলক করিয়ে নিতে পারবেন।
• 💰 **সার্ভিস চার্জ:** মাত্র ৳৫০০ - ৳১,৫০০।
• ⏱️ **সময়:** ১৫ থেকে ৩০ মিনিট।

👉 আমাদের ওয়েবসাইটের **[FRP 2026 পেজে (frp.html)](frp.html)** সকল প্রয়োজনীয় আনলক টুলস ও ফাইল বিনামূল্যে পাওয়া যাবে!`
    };
  }

  // 7. SPEAKER, MIC, SOUND, AUDIO, EARPIECE
  if (q.includes('sound') || q.includes('সাউন্ড') || q.includes('speaker') || q.includes('স্পিকার') || q.includes('mic') || q.includes('মাইক') || q.includes('কথা') || q.includes('শোনা') || q.includes('audio') || q.includes('ringer') || q.includes('বাজেনা')) {
    return {
      title: `🔊 ${deviceLabel} স্পিকার ও মাইক্রোফোন রিপেয়ার`,
      category: "Audio System & Mesh Cleaning",
      severity: "Normal",
      estimatedCost: "৳৩৫০ - ৳১,০০০",
      repairTime: "১৫ - ২৫ মিনিট",
      summary: `${deviceLabel}-এ কথা শুনতে না পাওয়া, গান না বাজা বা কথা অপজিটে না যাওয়ার সমাধান।`,
      text: `### 🔊 ${deviceLabel}-এর স্পিকার ও মাইক্রোফোন সমস্যার সমাধান:

• **কলের সময় কথা কম শোনা গেলে:** ইয়ারপিস মেশ ক্লিনিং অথবা অরিজিনাল ইয়ার-স্পিকার চেঞ্জ।
• **কথা অপজিটে না গেলে বা রেকর্ডিং না হলে:** প্রাইমারি নয়েজ-ক্যান্সেলেশন মাইক্রোফোন রিপ্লেসমেন্ট।
• **রিংটোন বা লাউডস্পিকার না বাজলে:** লাউডস্পিকার বা অডিও অ্যামপ্লিফায়ার আইসি চেক।
• 💰 **খরচ:** ৳৩৫০ - ৳১,০০০।
• ⏱️ **সময়:** ১৫ থেকে ২৫ মিনিট!`
    };
  }

  // 8. NETWORK, SIM CARD, WI-FI, BLUETOOTH
  if (q.includes('network') || q.includes('নেটওয়ার্ক') || q.includes('sim') || q.includes('সিম') || q.includes('no service') || q.includes('wifi') || q.includes('ওয়াইফাই') || q.includes('bluetooth') || q.includes('signal') || q.includes('ইন্টারনেট')) {
    return {
      title: `📶 ${deviceLabel} নেটওয়ার্ক ও সিম সিগন্যাল সল্যুশন`,
      category: "Network & RF Baseband IC",
      severity: "High",
      estimatedCost: "৳৭০০ - ৳২,২০০",
      repairTime: "১ - ২ ঘণ্টা",
      summary: `${deviceLabel}-এ সিম কার্ড না পাওয়া, নো সার্ভিস বা দুর্বল ওয়াইফাই সংকেত মেরামত।`,
      text: `### 📶 ${deviceLabel}-এর নেটওয়ার্ক ও নো-সার্ভিস সমস্যার সমাধান:

• সিম কার্ড ডিটেক্ট না হলে সিম স্লট পিন রিপ্লেসমেন্ট।
• "No Service" বা "Emergency Calls Only" থাকলে আরএফ ট্রান্সিভার (WTR IC) ও বেসব্যান্ড আইসি মেরামত।
• ওয়াইফাই ও ব্লুটুথ অন না হলে বা সিগন্যাল কম থাকলে Wi-Fi মডিউল রিবলিং।
• 💰 **আনুমানিক খরচ:** ৳৭০০ - ৳২,২০০।
• ⏱️ **সময়:** ১ থেকে ২ ঘণ্টা!`
    };
  }

  // 9. CAMERA, BLURRY, LENS CRACK
  if (q.includes('camera') || q.includes('ক্যামেরা') || q.includes('ছবি') || q.includes('blur') || q.includes('ঝাপসা') || q.includes('lens') || q.includes('লেন্স') || q.includes('focus')) {
    return {
      title: `📷 ${deviceLabel} ক্যামেরা ও লেন্স রিপ্লেসমেন্ট`,
      category: "Camera Module & Optical Sensor",
      severity: "Medium",
      estimatedCost: "৳৫০০ - ৳৩,০০০",
      repairTime: "২০ - ৪০ মিনিট",
      summary: `${deviceLabel}-এর ঝাপসা ছবি, ক্যামেরা ওপেন না হওয়া বা পেছনের লেন্স ফাটা সমাধান।`,
      text: `### 📷 ${deviceLabel}-এর ক্যামেরা সমস্যার সমাধান:

• পেছনের ক্যামেরা গ্লাস/লেন্স ফেটে গেলে জেনুইন স্যাফায়ার লেন্স প্রতিস্থাপন (৳৫০০ - ৳৯০০)।
• ছবি ঝাপসা বা ফোকাস না হলে অপটিক্যাল সেন্সর ক্লিনিং বা ক্যামেরা মডিউল রিপ্লেসমেন্ট।
• ওআইএস (OIS) ক্যামেরা কাঁপাকাঁপি বা ভাইব্রেশন বন্ধের ফিক্স।
• 💰 **আনুমানিক খরচ:** ৳৫০০ - ৳৩,০০০ (মডেল অনুযায়ী)।
• ⏱️ **সময়:** ২০ থেকে ৪০ মিনিট!`
    };
  }

  // 10. BACK GLASS, HOUSING, BODY FRAME
  if (q.includes('back glass') || q.includes('housing') || q.includes('body') || q.includes('হাউজিং') || q.includes('বডি') || q.includes('frame') || q.includes('বাঁকা') || q.includes('পেছনের')) {
    return {
      title: `✨ ${deviceLabel} বডি হাউজিং ও ব্যাক গ্লাস চেঞ্জ`,
      category: "Aesthetic & Structural Housing",
      severity: "Medium",
      estimatedCost: "৳৮০০ - ৳৩,২০০",
      repairTime: "৪৫ - ৬০ মিনিট",
      summary: `${deviceLabel}-এর পেছনের ফাটা গ্লাস বা বাঁকা ফ্রেম পরিবর্তন করে একদম নতুনের মতো রূপ।`,
      text: `### ✨ ${deviceLabel}-এর ব্যাক গ্লাস ও বডি হাউজিং পরিবর্তন:

• আইফোন ও ফ্ল্যাগশিপ ফোনের ব্যাক গ্লাস লেজার মেশিনের মাধ্যমে ব্যাক কভার খুলে পারফেক্ট ফিনিশিং দেওয়া হয়।
• ফ্রেম বাঁকা হয়ে ডিসপ্লে উঠে আসলে অরিজিনাল মিডল ফ্রেম ইনস্টল করা হয়।
• 💰 **আনুমানিক খরচ:** ৳৮০০ - ৳৩,২০০।
• ⏱️ **সময়:** ৪৫ থেকে ৬০ মিনিট!`
    };
  }

  // 11. PRICING INQUIRY (কত টাকা / খরচ কত / Price)
  if (q.includes('koto') || q.includes('কত') || q.includes('cost') || q.includes('price') || q.includes('দাম') || q.includes('khoroch') || q.includes('খরচ') || q.includes('taka') || q.includes('টাকা')) {
    return {
      title: `🏷️ ${deviceLabel} সার্ভিস চার্জ ও প্রাইজ লিস্ট`,
      category: "Pricing & Quotation",
      severity: "Normal",
      estimatedCost: "৳৩৫০ থেকে শুরু (কাজের ধরন অনুযায়ী)",
      repairTime: "১৫ মিনিট থেকে ২ ঘণ্টা",
      summary: `${deviceLabel}-এর বিভিন্ন হার্ডওয়্যার ও সফটওয়্যার সেবার অফিসিয়াল মূল্য তালিকা।`,
      text: `### 🏷️ ${deviceLabel} অফিসিয়াল সার্ভিস চার্জ লিস্ট:

• 📱 **ওকা (OCA) টাচ গ্লাস চেঞ্জ:** ৳৮০০ - ৳১,৮০০
• 🖥️ **ফুল ডিসপ্লে রিপ্লেসমেন্ট:** ৳১,৫০০ - ৳৮,৫০০
• 🔋 **অরিজিনাল ব্যাটারি (৬ মাসের ওয়ারেন্টি):** ৳৮০০ - ৳২,২০০
• ⚡ **চার্জিং পোর্ট ও সাব-বোর্ড ফিক্স:** ৳৪০০ - ৳১,২০০
• 🔬 **ডেড ফোন ও সিপিইউ/আইসি রিবলিং:** ৳১,২০০ - ৳৪,৫০০
• 🔓 **Android ২০২৬ FRP ও সিকিউরিটি আনলক:** ৳৫০০ - ৳১,৫০০
• 💧 **পানিতে পড়া আল্ট্রাসনিক ট্রিটমেন্ট:** ৳৮০০ - ৳২,৫০০

💡 সঠিক এস্টিমেট পেতে আপনার ফোনের নির্দিষ্ট সমস্যা জানিয়ে বুকিং দিন অথবা হোয়াটসঅ্যাপে মেসেজ পাঠান!`
    };
  }

  // 12. CV MAKER & RESUME BUILDER
  if (q.includes('cv') || q.includes('resume') || q.includes('সিভি') || q.includes('চাকরি') || q.includes('job apply') || q.includes('biodata') || q.includes('বায়োডাটা')) {
    return {
      title: "📄 প্রফেশনাল CV Maker & Resume Builder",
      category: "Online Digital Services",
      severity: "Normal",
      estimatedCost: "১০০% ফ্রি (অনলাইন)",
      repairTime: "৫ মিনিট",
      summary: "আমাদের আন্তর্জাতিক মানের লাইভ রেজুমে ও সিভি মেকার বিল্ডার।",
      text: `### 📄 Habib iFix প্রফেশনাল CV Maker ও রেজুমে বিল্ডার:

আপনি খুব সহজেই আমাদের অফিশিয়াল প্ল্যাটফর্ম **[Habib CV Maker (cvhabib.vercel.app)](https://cvhabib.vercel.app/)** এ গিয়ে প্রফেশনাল চাকরির সিভি তৈরি করতে পারবেন!

✨ **সুবিধাসমূহ:**
• লাইভ প্রিভিউ সহ রিয়েল-টাইম এডিটর ও এ৪ (A4) প্রিন্ট
• আন্তর্জাতিক জব স্ট্যান্ডার্ড এবং এটিএস (ATS) অপ্টিমাইজড
• ১-ক্লিকেই স্ট্যান্ডার্ড এ৪ সাইজের হাই-কোয়ালিটি পিডিএফ প্রিন্ট ও ডাউনলোড
• সরকারি, ব্যাংক ও বেসরকারি চাকরির জন্য আন্তর্জাতিক ফরম্যাট

👉 এখনই আপনার প্রফেশনাল সিভি তৈরি করতে [https://cvhabib.vercel.app/](https://cvhabib.vercel.app/) লিঙ্কে ক্লিক করুন!`
    };
  }

  // 13. ECOMMERCE SHOP, PARTS & REPAIR TOOLS
  if (q.includes('shop') || q.includes('শপ') || q.includes('দোকান') || q.includes('parts') || q.includes('পার্টস') || q.includes('tools') || q.includes('টুলস') || q.includes('কিনব') || q.includes('কিনতে') || q.includes('buy') || q.includes('order') || q.includes('অর্ডার') || q.includes('মেশিন')) {
    return {
      title: "🛍️ Habib iFix টেক ও স্পেয়ার পার্টস শপ",
      category: "Online Store & Tools",
      severity: "Normal",
      estimatedCost: "সাশ্রয়ী হোলসেল প্রাইস",
      repairTime: "সারাদেশে কুরিয়ারে ডেলিভারি",
      summary: "অরিজিনাল মোবাইল ডিসপ্লে, ব্যাটারি, আইসি ও মাইক্রো-সোল্ডারিং টুলস স্টোর।",
      text: `### 🛍️ Habib iFix অফিসিয়াল ইকমার্স টেক শপ:

আমাদের **[Shop স্টোর (shop.html)](shop.html)** থেকে আপনি ১০০% জেনুইন মোবাইল রিপেয়ার পার্টস ও ল্যাব টুলস অর্ডার করতে পারবেন!

📦 **আমাদের স্টোরে যা যা পাবেন:**
• 📱 **১০০% অরিজিনাল ডিসপ্লে:** iPhone, Samsung, Xiaomi AMOLED ও IPS প্যানেল
• 🔋 **হাই-ক্যাপাসিটি ব্যাটারি:** ৬ মাসের রিপ্লেসমেন্ট ওয়ারেন্টি সহ
• 🔬 **ল্যাব ও মাইক্রো-সোল্ডারিং টুলস:** ডিজিটাল মাইক্রোস্কোপ, হট এয়ার গান, থার্মাল ক্যামেরা, শোল্ডারিং পেস্ট
• ⚡ **আইসি ও স্পেয়ার্স:** পাওয়ার আইসি, ওকা গ্লাস, টেস্ট পয়েন্ট ক্যাবল

👉 পণ্য দেখতে ও ঘরে বসে অর্ডার করতে উপরে ন্যাভবারের **Shop** অথবা [এখানে ক্লিক করুন (shop.html)](shop.html)!`
    };
  }

  // 13. COURSES & TRAINING
  if (q.includes('course') || q.includes('training') || q.includes('কোর্স') || q.includes('শিখতে') || q.includes('ভর্তি') || q.includes('admission') || q.includes('fee') || q.includes('ফি') || q.includes('class') || q.includes('academy') || q.includes('একাডেমি')) {
    return {
      title: "🎓 Habib iFix প্রফেশনাল ট্রেনিং একাডেমি",
      category: "Technical Courses & Certification",
      severity: "Normal",
      estimatedCost: "কোর্স ভিত্তিক সাশ্রয়ী ফি",
      repairTime: "১ থেকে ৩ মাস ব্যাচ",
      summary: "হাতে-কলমে মোবাইল হার্ডওয়্যার, সফটওয়্যার, ওয়েব ও গ্রাফিক্স ডিজাইন প্রশিক্ষণ।",
      text: `### 🎓 Habib iFix টেকনিক্যাল ও ফ্রিল্যান্সিং কোর্সসমূহ:

আমাদের একাডেমি থেকে শত শত শিক্ষার্থী ট্রেনিং নিয়ে সফলভাবে কাজ করছেন। প্রধান কোর্সসমূহ:

১. 📱 **Master Mobile Hardware & Micro-Soldering:** মাদারবোর্ড শর্ট ট্রেসিং, থার্মাল ক্যামেরা, সিপিইউ/র‍্যাম রিবলিং
২. 🔓 **Android Software & FRP Bypass 2026:** EDL, Fastboot, Testpoint ও অনলাইন আনলক টুলস
3. 💻 **Website Make & Full Web Development:** ওয়ার্ডপ্রেস, ই-কমার্স ও আধুনিক ওয়েবসাইট তৈরি
4. 🎨 **Professional Logo & Graphic Design:** ফটোশপ, ইলাস্ট্রেটর ও ব্র্যান্ড আইডেন্টিটি
5. 🎬 **Video Editing & Social Media Ads:** প্রিমিয়ার প্রো, ক্যাপকাট ও ফেসবুক/গুগল অ্যাড ক্যাম্পেইন

👉 সকল কোর্সের বিস্তারিত সিলেবাস ও এনরোলমেন্ট দেখতে আমাদের **[Courses পেজে যান](courses.html)** অথবা হোয়াটসঅ্যাপে (01868461577) কথা বলুন!`
    };
  }

  // 14. SHOP LOCATION, ADDRESS & VISITING
  if (q.includes('dokan') || q.includes('address') || q.includes('location') || q.includes('thikana') || q.includes('kothay') || q.includes('লোকেশন') || q.includes('ঠিকানা') || q.includes('দোকান') || q.includes('shop') || q.includes('lab') || q.includes('কই') || q.includes('কোথায়')) {
    return {
      title: "📍 Habib iFix ল্যাব লোকেশন ও ঠিকানা",
      category: "Lab Location & Visit",
      severity: "Normal",
      estimatedCost: "সরাসরি ভিজিট / কুরিয়ার",
      repairTime: "প্রতিদিন ১০:০০ AM - ১০:০০ PM",
      summary: "Habib iFix Precision Mobile Engineering & Digital Lab, চট্টগ্রাম, বাংলাদেশ।",
      text: `### 📍 Habib iFix ল্যাব লোকেশন ও ঠিকানা:

🏢 **ঠিকানা:** Habib iFix .Tech Master Engineering Lab, চট্টগ্রাম, বাংলাদেশ।
⏱️ **ল্যাব খোলা থাকে:** প্রতিদিন সকাল ১০:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত।

💡 **সার্ভিস নেওয়ার নিয়ম:**
১. সরাসরি আমাদের ল্যাবে ডিভাইস নিয়ে আসতে পারেন — চোখের সামনে ৩০ মিনিটে ডিসপ্লে/ব্যাটারি ফিটিং করা হয়।
২. দূরবর্তী জেলা থেকে সুন্দরবন / রেডেক্স কুরিয়ারের মাধ্যমে ডিভাইস পাঠিয়ে নিরাপদ রিপেয়ার সেবা নিতে পারেন।
৩. সফটওয়্যার ও FRP বাইপাস সমস্যার ক্ষেত্রে টিমভিউয়ার/AnyDesk দিয়ে ঘরে বসেই রিমোট আনলক করা হয়।

📞 সরাসরি হাবিব ভাইয়ের সাথে হোয়াটসঅ্যাপে লোকেশন শেয়ার বা কথা বলতে: **01868-461577**`
    };
  }

  // 15. CONTACT, PHONE NUMBER & DIRECT CALL (Specific Contact Requests)
  if (q.includes('number') || q.includes('phone no') || q.includes('mobile no') || q.includes('whatsapp') || q.includes('হোয়াটসঅ্যাপ') || q.includes('নাম্বার') || q.includes('নম্বর') || q.includes('কথা বলতে') || q.includes('kotha bolte') || q.includes('hotline') || q.includes('হটলাইন') || q.includes('যোগাযোগ') || q.includes('contact') || (q.includes('call') && !q.includes('reball'))) {
    return {
      title: "📞 হাবিব ভাইয়ের অফিসিয়াল কন্ট্যাক্ট",
      category: "Direct Contact",
      severity: "Normal",
      estimatedCost: "ফ্রি কল/চ্যাট",
      repairTime: "24/7 একটিভ",
      summary: "সরাসরি মাস্টার টেকনিশিয়ান হাবিবুর রহমানের সাথে কথা বলুন।",
      text: `### 📞 হাবিব ভাইয়ের অফিসিয়াল হটলাইন ও হোয়াটসঅ্যাপ:

• 📱 **হটলাইন / হোয়াটসঅ্যাপ:** [01868-461577](https://wa.me/8801868461577) (সরাসরি ক্লিক করে চ্যাট করুন)
• 📧 **অফিসিয়াল ইমেইল:** tec.habiburrahman@gmail.com
• 🏢 **ল্যাব লোকেশন:** চট্টগ্রাম, বাংলাদেশ

আপনার ডিভাইসের মডেল ও সমস্যাটি লিখে হোয়াটসঅ্যাপে একটি মেসেজ পাঠান, হাবিব ভাই নিজেই সরাসরি রিপ্লাই করবেন!`
    };
  }

  // 16. GREETINGS & CASUAL HELLOS
  if (/^(hi|hello|hey|salam|assalamu|kemon|valo|bhai|vai|habib bhai|shunchen|help|hlw|bolen|হাই|হ্যালো|সালাম)/i.test(q) && q.length < 35) {
    return {
      title: "👋 আসসালামু আলাইকুম! Habib iFix AI-তে স্বাগতম",
      category: "Customer Support & AI Consultation",
      severity: "Normal",
      estimatedCost: "বিনামূল্যে পরামর্শ",
      repairTime: "তাৎক্ষণিক",
      summary: "আমি Habib iFix-এর স্মার্ট টেকনিক্যাল এআই অ্যাসিস্ট্যান্ট।",
      text: `### 👋 আসসালামু আলাইকুম! Habib iFix AI অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।

আমি হাবিব ভাইয়ের টেকনিক্যাল ল্যাবের ভার্চুয়াল কনসালটেন্ট। আপনার কী ধরনের সাপোর্ট প্রয়োজন?

• 📱 **মোবাইল হার্ডওয়্যার ও ডিসপ্লে:** স্ক্রিন রিপ্লেসমেন্ট, ওকা (OCA) গ্লাস চেঞ্জ, চার্জিং, ডেড বুট ও ওয়াটার ড্যামেজ
• 🔓 **সফটওয়্যার ও FRP আনলক:** স্যামসাং, শাওমি সহ সব ব্র্যান্ডের Google Account / FRP বাইপাস ২০২৬
• 🎓 **প্রফেশনাল ট্রেনিং কোর্স:** হার্ডওয়্যার ল্যাব, সফটওয়্যার, ওয়েবসাইট মেকিং ও গ্রাফিক্স ডিজাইন
• 📄 **সিভি মেকার:** প্রফেশনাল চাকরির সিভি তৈরি ও এ৪ (A4) সাইজের পিডিএফ ডাউনলোড

আপনার মোবাইলের মডেল ও কী সমস্যা হচ্ছে তা জানান, আমি সঠিক সমাধান ও খরচের হিসাব দিচ্ছি!`
    };
  }

  // 17. GENERAL SMART TECHNICAL ADVICE (Fallback)
  return {
    title: `🛠️ ${deviceLabel} টেকনিক্যাল এনালাইসিস`,
    category: "Hardware & Software Diagnostic",
    severity: "Normal",
    estimatedCost: "৳৩৫০ - ৳২,০০০ (সমস্যা ভিত্তিক)",
    repairTime: "২০ - ৬০ মিনিট",
    summary: `আপনার প্রশ্ন "${query}" Habib iFix ইঞ্জিনিয়ারিং ডায়াগনস্টিকে এনালাইসিস করা হয়েছে।`,
    text: `### 🛠️ ${deviceLabel}-এর টেকনিক্যাল এনালাইসিস রিপোর্ট:

আপনার প্রশ্ন: **"${query}"**

Habib iFix ডিজিটাল ল্যাবে আমরা সকল ব্র্যান্ডের স্মার্টফোনের যেকোনো জটিল হার্ডওয়্যার ও সফটওয়্যার সমস্যার নিখুঁত সমাধান করে থাকি।

📋 **আমাদের কাজের প্রক্রিয়া:**
১. কম্পিউটারাইজড হার্ডওয়্যার ও কারেন্ট ড্র টেস্ট।
২. লেটেস্ট থার্মাল ও মাইক্রো-সোল্ডারিং ইকুইপমেন্টে নিরাপদ রিপেয়ার।
৩. ১০০% অরিজিনাল পার্টস ও রিপ্লেসমেন্ট গ্যারান্টি।

💰 **আনুমানিক সার্ভিস চার্জ:** ৳৩৫০ - ৳২,০০০ (সমস্যার ধরন অনুযায়ী)।
⏱️ **প্রয়োজনীয় সময়:** ২০ মিনিট থেকে ১ ঘণ্টা।

💡 **হাবিব ভাইয়ের পরামর্শ:** সরাসরি আপনার মডেল ও সঠিক লক্ষণটি জানিয়ে বুকিং দিন অথবা হোয়াটসঅ্যাপে কথা বলুন: **01868-461577**!`
  };
}

// REAL AI Chat API Endpoint with Intelligent Fallback
app.post('/api/ai-chat', async (req, res) => {
  const { message, device, symptom, history, language = 'bn' } = req.body;

  if (!message && !device && !symptom) {
    return res.status(400).json({ error: "Message or device details required" });
  }

  const queryText = message || `Device: ${device || 'Unknown'}, Symptom: ${symptom || 'General issue'}`;

  // Try real Gemini API call
  let geminiOutput = null;
  if (aiClient) {
    try {
      const systemInstruction = `You are "Habib iFix AI", an elite senior mobile hardware and software diagnostic agent representing Habib iFix (led by Habib, a renowned mobile technician and trainer in Bangladesh).
You specialize in:
- Smartphone screen/AMOLED replacements (iPhone, Samsung, Xiaomi, Vivo, Oppo, Realme, OnePlus, Pixel)
- Advanced micro-soldering, Motherboard short circuit fixing, PMIC / Power IC / Audio IC / Charging IC reballing
- Android FRP Bypass, Flashing, eMMC/UFS reprogramming, Dead boot repair
- Water damage recovery, Battery replacements with 6-month warranty
- Online services: Job applications, CV/Resume design, Facebook & Google Ad campaigns.

Tone & Style:
- Warm, polite, empathetic, professional, highly technical yet easy to understand.
- Supports Bengali (Bangla/Banglish) and English. If user asks in Bengali or Banglish, answer in fluent, encouraging Bengali.
- Always provide realistic estimated costs in Bangladeshi Taka (৳).
- Always give actionable technical diagnosis steps and encourage booking a repair or contacting Habib via WhatsApp (+8801868461577).
- Format responses clearly using markdown bullets and emojis.`;

      const prompt = `User Query: "${queryText}". Please provide a helpful, intelligent, direct response in fluent Bengali addressing the user's specific inquiry.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        geminiOutput = response.text;
      }
    } catch (err) {
      // Continue to conversational AI fallback
    }
  }

  const diagnosisData = generateConversationalAIResponse(queryText, language);
  const replyContent = geminiOutput || (diagnosisData && diagnosisData.text) || '';

  // Save to database for Admin Panel tracking
  try {
    const db = readDB();
    db.aiMessages = db.aiMessages || [];
    db.nextAiMsgId = db.nextAiMsgId || 1;
    const aiLog = {
      id: db.nextAiMsgId++,
      message: queryText,
      reply: replyContent,
      category: (diagnosisData && diagnosisData.category) || 'General Diagnostic',
      title: (diagnosisData && diagnosisData.title) || 'Customer AI Query',
      estimatedCost: (diagnosisData && diagnosisData.estimatedCost) || 'N/A',
      repairTime: (diagnosisData && diagnosisData.repairTime) || 'N/A',
      date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    db.aiMessages.unshift(aiLog);
    if (db.aiMessages.length > 300) db.aiMessages.pop();
    writeDB(db);
  } catch (logErr) {
    console.error("AI message logging error:", logErr);
  }

  // If Gemini succeeded, return response
  if (geminiOutput) {
    return res.json({
      success: true,
      source: "habib-ai-pro",
      text: geminiOutput,
      reply: geminiOutput,
      diagnosis: diagnosisData
    });
  }

  // Conversational AI Engine
  return res.json({
    success: true,
    source: "habib-ifix-ai-engine",
    text: diagnosisData.text,
    reply: diagnosisData.text,
    diagnosis: diagnosisData
  });
});

// Other API Routes
// Other API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') { 
    const db = readDB();
    const adminUser = db.users.find(u => u.role === 'admin' || u.email === 'tec.habiburrahman@gmail.com');
    if (adminUser) {
      adminUser.loginCount = (adminUser.loginCount || 0) + 1;
      adminUser.lastLogin = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      writeDB(db);
    }
    res.cookie('admin_session', 'habib_admin_token_2026', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { email: 'tec.habiburrahman@gmail.com', name: 'Habibur Rahman', role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/google-login', (req, res) => {
  const { email, name, picture } = req.body;
  const userEmail = (email || 'tec.habiburrahman@gmail.com').toLowerCase();
  const userName = name || userEmail.split('@')[0];
  const db = readDB();
  
  let user = db.users.find(u => u.email.toLowerCase() === userEmail);
  const isAdminEmail = userEmail.includes('tec.habiburrahman') || userEmail.includes('habib');

  if (!user) {
    const newId = db.nextUserId++;
    user = {
      id: newId,
      userCode: `HIFIX-USR-${1000 + newId}`,
      name: userName,
      email: userEmail,
      phone: '',
      role: isAdminEmail ? 'admin' : 'customer',
      avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
      authProvider: 'google',
      createdAt: new Date().toLocaleDateString('en-GB'),
      lastLogin: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      loginCount: 1
    };
    db.users.push(user);
    writeDB(db);
  } else {
    user.userCode = user.userCode || `HIFIX-USR-${1000 + user.id}`;
    if (picture) user.avatar = picture;
    if (isAdminEmail) user.role = 'admin';
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    writeDB(db);
  }

  if (user.role === 'admin' || isAdminEmail) {
    res.cookie('admin_session', 'habib_admin_token_2026', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  }
  res.cookie('user_session', user.id, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({ 
    success: true, 
    user: { 
      id: user.id,
      userCode: user.userCode,
      email: user.email, 
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      loginCount: user.loginCount
    } 
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.clearCookie('user_session');
  res.json({ success: true });
});

app.get('/api/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.clearCookie('user_session');
  res.json({ success: true });
});

// Comprehensive User Authentication API (Customer & Student System)
app.post('/api/user/login', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // If account doesn't exist, automatically register new real user!
    const newId = db.nextUserId++;
    const derivedName = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const isAdminEmail = cleanEmail.includes('tec.habiburrahman') || cleanEmail.includes('habib');

    user = {
      id: newId,
      userCode: `HIFIX-USR-${1000 + newId}`,
      name: derivedName,
      email: cleanEmail,
      phone: (phone && phone.trim()) || '',
      password: password || '123456',
      role: isAdminEmail ? 'admin' : 'customer',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}`,
      authProvider: 'email',
      createdAt: new Date().toLocaleDateString('en-GB'),
      lastLogin: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      loginCount: 1
    };
    db.users.push(user);
    writeDB(db);
  } else {
    // Existing user: update login count and last active
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    if (name && name.trim()) user.name = name.trim();
    if (phone && phone.trim()) user.phone = phone.trim();

    user.userCode = user.userCode || `HIFIX-USR-${1000 + user.id}`;
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    writeDB(db);
  }

  // Set cookies
  if (user.role === 'admin' || cleanEmail.includes('tec.habiburrahman')) {
    res.cookie('admin_session', 'habib_admin_token_2026', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  }
  res.cookie('user_session', user.id, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    user: {
      id: user.id,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'customer',
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount
    }
  });
});

app.post('/api/user/register', (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please login instead.' });
  }

  const newId = db.nextUserId++;
  const newUser = {
    id: newId,
    userCode: `HIFIX-USR-${1000 + newId}`,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    password,
    role: role || 'customer',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    authProvider: 'email',
    createdAt: new Date().toLocaleDateString('en-GB'),
    lastLogin: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    loginCount: 1
  };

  db.users.push(newUser);
  writeDB(db);

  res.cookie('user_session', newUser.id, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({
    success: true,
    user: {
      id: newUser.id,
      userCode: newUser.userCode,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin,
      loginCount: newUser.loginCount
    }
  });
});

app.post('/api/user/google-auth', (req, res) => {
  const { email, name, picture, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  const isAdminEmail = email.toLowerCase().includes('tec.habiburrahman') || email.toLowerCase().includes('habib');

  if (!user) {
    const newId = db.nextUserId++;
    user = {
      id: newId,
      userCode: `HIFIX-USR-${1000 + newId}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: '',
      role: isAdminEmail ? 'admin' : (role || 'customer'),
      avatar: picture || `https://lh3.googleusercontent.com/a/default-user=s96-c`,
      authProvider: 'google',
      createdAt: new Date().toLocaleDateString('en-GB'),
      lastLogin: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      loginCount: 1
    };
    db.users.push(user);
    writeDB(db);
  } else {
    // update avatar, login count and userCode
    user.userCode = user.userCode || `HIFIX-USR-${1000 + user.id}`;
    if (picture) user.avatar = picture;
    if (isAdminEmail) user.role = 'admin';
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    writeDB(db);
  }

  // If admin, also grant admin session
  if (user.role === 'admin' || isAdminEmail) {
    res.cookie('admin_session', 'habib_admin_token_2026', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  }

  res.cookie('user_session', user.id, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({
    success: true,
    isAdmin: user.role === 'admin' || isAdminEmail,
    user: {
      id: user.id,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount
    }
  });
});

app.get('/api/user/me', (req, res) => {
  const userId = req.cookies.user_session;
  if (!userId) {
    // check if admin
    if (req.cookies.admin_session === 'habib_admin_token_2026') {
      return res.json({
        loggedIn: true,
        user: {
          id: 1,
          userCode: 'HIFIX-USR-1001',
          name: 'Habibur Rahman',
          email: 'tec.habiburrahman@gmail.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
          createdAt: '14/10/2026',
          lastLogin: 'Today',
          loginCount: 38
        }
      });
    }
    return res.json({ loggedIn: false });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: {
      id: user.id,
      userCode: user.userCode || `HIFIX-USR-${1000 + user.id}`,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'customer',
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || '',
      loginCount: user.loginCount || 1
    }
  });
});

// Admin Users & Login Stats Management API
app.get('/api/admin/users', checkAdmin, (req, res) => {
  const db = readDB();
  const users = (db.users || []).map(u => ({
    id: u.id,
    userCode: u.userCode || `HIFIX-USR-${1000 + u.id}`,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: u.role || 'customer',
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
    authProvider: u.authProvider || 'email',
    createdAt: u.createdAt || 'N/A',
    lastLogin: u.lastLogin || 'N/A',
    loginCount: u.loginCount || 1
  }));
  const totalLogins = users.reduce((sum, u) => sum + (u.loginCount || 1), 0);
  res.json({
    totalUsers: users.length,
    totalLogins,
    users
  });
});

app.patch('/api/admin/users/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const user = (db.users || []).find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (req.body.role) user.role = req.body.role;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.name) user.name = req.body.name;
  writeDB(db);
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const targetId = parseInt(req.params.id);
  if (targetId === 1) {
    return res.status(400).json({ error: 'Primary admin account cannot be deleted' });
  }
  db.users = (db.users || []).filter(u => u.id !== targetId);
  writeDB(db);
  res.json({ success: true });
});

// Site Visitor Counter & Live Stats API (100% Real Tracking)
app.get('/api/site-stats', (req, res) => {
  const db = readDB();
  const today = new Date().toLocaleDateString('en-GB');
  db.siteStats = db.siteStats || { totalVisits: 1, todayVisits: 1, lastDate: today, visitorLogs: [] };

  const totalUsers = (db.users || []).length;
  const totalLogins = (db.users || []).reduce((sum, u) => sum + (u.loginCount || 1), 0);
  const totalBookings = (db.bookings || []).length;
  const totalOrders = (db.orders || []).length;
  const totalContacts = (db.contacts || []).length;
  const pendingContacts = (db.contacts || []).filter(c => c.status !== 'replied').length;

  const logs = db.siteStats.visitorLogs || [];
  // Real active visitors: count unique IP addresses that visited today
  const uniqueTodayIps = new Set(logs.filter(l => l.date === today).map(l => l.ip));
  const realActiveNow = Math.max(1, uniqueTodayIps.size);

  res.json({
    totalVisits: Number(db.siteStats.totalVisits || 0),
    todayVisits: Number(db.siteStats.todayVisits || 0),
    lastDate: db.siteStats.lastDate,
    visitorLogs: logs.slice(0, 30),
    totalUsers,
    totalLogins,
    totalBookings,
    totalOrders,
    totalContacts,
    pendingContacts,
    activeNow: realActiveNow
  });
});

app.post('/api/record-visit', (req, res) => {
  const db = readDB();
  const today = new Date().toLocaleDateString('en-GB');
  db.siteStats = db.siteStats || { totalVisits: 0, todayVisits: 0, lastDate: today, visitorLogs: [] };

  if (db.siteStats.lastDate !== today) {
    db.siteStats.todayVisits = 1;
    db.siteStats.lastDate = today;
  } else {
    db.siteStats.todayVisits = (Number(db.siteStats.todayVisits) || 0) + 1;
  }
  db.siteStats.totalVisits = (Number(db.siteStats.totalVisits) || 0) + 1;

  const rawIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');
  const cleanIp = String(rawIp).split(',')[0].trim();
  const userAgent = String(req.headers['user-agent'] || 'Web Client').substring(0, 70);

  db.siteStats.visitorLogs = db.siteStats.visitorLogs || [];
  db.siteStats.visitorLogs.unshift({
    path: req.body.path || '/',
    ip: cleanIp,
    userAgent,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    date: today
  });

  if (db.siteStats.visitorLogs.length > 50) {
    db.siteStats.visitorLogs = db.siteStats.visitorLogs.slice(0, 50);
  }

  writeDB(db);
  res.json({
    success: true,
    totalVisits: db.siteStats.totalVisits,
    todayVisits: db.siteStats.todayVisits
  });
});

app.get('/api/user/my-bookings', (req, res) => {
  const userEmail = (req.query.email || '').trim().toLowerCase();
  const userPhone = (req.query.phone || '').trim();
  const userCode = (req.query.userCode || '').trim().toLowerCase();
  const db = readDB();

  const myBookings = (db.bookings || []).filter(b => {
    if (userEmail && b.email && b.email.toLowerCase() === userEmail) return true;
    if (userPhone && b.phone && b.phone.includes(userPhone)) return true;
    if (userCode && b.userCode && b.userCode.toLowerCase() === userCode) return true;
    return false;
  });
  res.json(myBookings.sort((a, b) => b.id - a.id));
});

app.get('/api/user/my-orders', (req, res) => {
  const userEmail = (req.query.email || '').trim().toLowerCase();
  const userPhone = (req.query.phone || '').trim();
  const userCode = (req.query.userCode || '').trim().toLowerCase();
  const db = readDB();

  const myOrders = (db.orders || []).filter(o => {
    if (userCode && o.userCode && o.userCode.toLowerCase() === userCode) return true;
    if (userPhone && o.phone && o.phone.includes(userPhone)) return true;
    if (userEmail && o.email && o.email.toLowerCase() === userEmail) return true;
    return false;
  });
  res.json(myOrders.sort((a, b) => b.id - a.id));
});

app.post('/api/user/update-profile', (req, res) => {
  const { id, email, name, phone, address } = req.body;
  const db = readDB();
  let user = null;

  if (id) {
    user = (db.users || []).find(u => u.id === parseInt(id));
  }
  if (!user && email) {
    user = (db.users || []).find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
  }

  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  if (name && name.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();

  writeDB(db);
  res.json({
    success: true,
    user: {
      id: user.id,
      userCode: user.userCode || `HIFIX-USR-${1000 + user.id}`,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      avatar: user.avatar
    }
  });
});

app.get('/api/check-admin', (req, res) => {
  const adminCookie = req.cookies && req.cookies.admin_session === 'habib_admin_token_2026';
  const adminHeader = req.headers['x-admin-token'] === 'habib_admin_token_2026';
  if (adminCookie || adminHeader) {
    return res.json({ isAdmin: true, email: 'tec.habiburrahman@gmail.com' });
  }

  const userSessionId = req.cookies && req.cookies.user_session;
  if (userSessionId) {
    const db = readDB();
    const user = (db.users || []).find(u => u.id === parseInt(userSessionId));
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase().includes('tec.habiburrahman')))) {
      return res.json({ isAdmin: true, email: user.email, name: user.name });
    }
  }

  const authEmail = req.headers['x-user-email'];
  if (authEmail && authEmail.toLowerCase().includes('tec.habiburrahman')) {
    return res.json({ isAdmin: true, email: authEmail });
  }

  res.json({ isAdmin: false });
});

app.get('/api/posts', (req, res) => {
  const db = readDB();
  res.json(db.posts.sort((a, b) => b.id - a.id));
});

app.post('/api/bookings', (req, res) => {
  const { planName, planPrice, customerName, phone, email, address } = req.body;
  const date = new Date().toLocaleDateString();
  const db = readDB();
  const id = db.nextBookingId++;
  db.bookings.push({ id, planName, planPrice, customerName, phone, email, address, date });
  writeDB(db);
  res.json({ success: true, id });
});

app.get('/api/bookings', checkAdmin, (req, res) => {
  const db = readDB();
  res.json(db.bookings.sort((a, b) => b.id - a.id));
});

app.post('/api/posts', checkAdmin, (req, res) => {
  const { title, category, description, mediaLink, mediaType } = req.body;
  const date = new Date().toLocaleDateString('en-GB');
  const db = readDB();
  const id = db.nextPostId++;
  db.posts.unshift({ id, title: title || 'New Post', category: category || 'TECH NEWS', description, mediaLink, mediaType: mediaType || 'image', date });
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/posts/:id', checkAdmin, (req, res) => {
  const db = readDB();
  db.posts = (db.posts || []).filter(p => p.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// FREE OFFERS & PERKS CRUD API (Admin & Public)
// ==========================================
app.get('/api/offers', (req, res) => {
  const db = readDB();
  const offers = (db.offers || []).sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.id - a.id;
  });
  res.json(offers);
});

app.get('/api/offers/:id', (req, res) => {
  const db = readDB();
  const offer = (db.offers || []).find(o => o.id === parseInt(req.params.id));
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  res.json(offer);
});

app.post('/api/offers', checkAdmin, (req, res) => {
  const {
    title, subtitle, badge, category, image, description,
    whatYouGet, whoShouldApply, howToApply, officialProgramUrl,
    applicationFormUrl, importantNote, shareCallout, featured
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Offer title is required' });
  }

  const db = readDB();
  db.offers = db.offers || [];
  db.nextOfferId = db.nextOfferId || (db.offers.length ? Math.max(...db.offers.map(o => o.id)) + 1 : 1);
  const id = db.nextOfferId++;

  const newOffer = {
    id,
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    badge: (badge || 'FREE OFFER').trim(),
    category: (category || 'Special Offers').trim(),
    image: (image || '/public/assets/aistudio/IMG_20261022_013415_287_0564f47b.jpg').trim(),
    description: (description || '').trim(),
    whatYouGet: Array.isArray(whatYouGet) ? whatYouGet : (whatYouGet ? whatYouGet.split('\n').map(s => s.trim()).filter(Boolean) : []),
    whoShouldApply: (whoShouldApply || '').trim(),
    howToApply: Array.isArray(howToApply) ? howToApply : (howToApply ? howToApply.split('\n').map(s => s.trim()).filter(Boolean) : []),
    officialProgramUrl: (officialProgramUrl || '').trim(),
    applicationFormUrl: (applicationFormUrl || '').trim(),
    importantNote: (importantNote || '').trim(),
    shareCallout: (shareCallout || 'Share this offer with friends!').trim(),
    reactions: { fire: 1, heart: 1, rocket: 1 },
    date: new Date().toLocaleDateString('en-GB'),
    featured: !!featured,
    status: 'active'
  };

  db.offers.unshift(newOffer);
  writeDB(db);
  res.json({ success: true, offer: newOffer });
});

app.put('/api/offers/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const offer = (db.offers || []).find(o => o.id === parseInt(req.params.id));
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const {
    title, subtitle, badge, category, image, description,
    whatYouGet, whoShouldApply, howToApply, officialProgramUrl,
    applicationFormUrl, importantNote, shareCallout, featured, status
  } = req.body;

  if (title) offer.title = title.trim();
  if (subtitle !== undefined) offer.subtitle = subtitle.trim();
  if (badge !== undefined) offer.badge = badge.trim();
  if (category !== undefined) offer.category = category.trim();
  if (image !== undefined) offer.image = image.trim();
  if (description !== undefined) offer.description = description.trim();
  if (whatYouGet !== undefined) {
    offer.whatYouGet = Array.isArray(whatYouGet) ? whatYouGet : whatYouGet.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (whoShouldApply !== undefined) offer.whoShouldApply = whoShouldApply.trim();
  if (howToApply !== undefined) {
    offer.howToApply = Array.isArray(howToApply) ? howToApply : howToApply.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (officialProgramUrl !== undefined) offer.officialProgramUrl = officialProgramUrl.trim();
  if (applicationFormUrl !== undefined) offer.applicationFormUrl = applicationFormUrl.trim();
  if (importantNote !== undefined) offer.importantNote = importantNote.trim();
  if (shareCallout !== undefined) offer.shareCallout = shareCallout.trim();
  if (featured !== undefined) offer.featured = !!featured;
  if (status !== undefined) offer.status = status;

  writeDB(db);
  res.json({ success: true, offer });
});

app.delete('/api/offers/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.offers = (db.offers || []).filter(o => o.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'Offer deleted successfully' });
});

app.post('/api/offers/:id/react', (req, res) => {
  const { type } = req.body; // 'fire', 'heart', or 'rocket'
  if (!['fire', 'heart', 'rocket'].includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }
  const db = readDB();
  const offer = (db.offers || []).find(o => o.id === parseInt(req.params.id));
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  offer.reactions = offer.reactions || { fire: 0, heart: 0, rocket: 0 };
  offer.reactions[type] = (offer.reactions[type] || 0) + 1;
  writeDB(db);
  res.json({ success: true, reactions: offer.reactions });
});

app.get(['/free-offer', '/free-offers', '/free-offer.html', '/free-offers.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'free-offer.html'));
});

app.get(['/dashboard', '/dashboard.html', '/user-dashboard', '/user-dashboard.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Contact Form API with User ID & Admin Message Reply System
app.post('/api/contact', (req, res) => {
  const { name, contact, message, subject, userCode } = req.body;
  if (!name || !contact || !message) {
    return res.status(400).json({ error: 'Name, contact info, and message are required.' });
  }
  const db = readDB();
  db.contacts = db.contacts || [];
  db.nextContactId = db.nextContactId || 1;
  const newMsg = {
    id: db.nextContactId++,
    userCode: userCode || '',
    name: name.trim(),
    contact: contact.trim(),
    message: message.trim(),
    subject: (subject || 'General Inquiry').trim(),
    status: 'pending',
    adminReply: '',
    repliedAt: '',
    replyMethod: '',
    date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
  db.contacts.unshift(newMsg);
  writeDB(db);
  res.json({ success: true, message: 'Message received successfully!', id: newMsg.id });
});

app.get('/api/contacts', checkAdmin, (req, res) => {
  const db = readDB();
  res.json(db.contacts || []);
});

app.post('/api/contacts/:id/reply', checkAdmin, (req, res) => {
  const { replyMessage, replyMethod } = req.body;
  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ error: 'Reply message cannot be empty' });
  }
  const db = readDB();
  const contact = (db.contacts || []).find(c => c.id === parseInt(req.params.id));
  if (!contact) {
    return res.status(404).json({ error: 'Message not found' });
  }
  contact.adminReply = replyMessage.trim();
  contact.repliedAt = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  contact.status = 'replied';
  contact.replyMethod = replyMethod || 'portal';
  writeDB(db);
  res.json({ success: true, contact });
});

app.patch('/api/contacts/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const contact = (db.contacts || []).find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json({ error: 'Message not found' });
  if (req.body.status) contact.status = req.body.status;
  if (req.body.adminReply !== undefined) {
    contact.adminReply = req.body.adminReply;
    contact.repliedAt = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    contact.status = 'replied';
  }
  writeDB(db);
  res.json({ success: true, contact });
});

app.delete('/api/contacts/:id', checkAdmin, (req, res) => {
  const db = readDB();
  db.contacts = (db.contacts || []).filter(c => c.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// Customer Public Inquiry & Reply Tracking
app.get('/api/contact/track', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }
  const db = readDB();
  const results = (db.contacts || []).filter(c => {
    return (c.contact && c.contact.toLowerCase().includes(query)) ||
           (c.userCode && c.userCode.toLowerCase().includes(query)) ||
           (String(c.id) === query);
  });
  res.json(results);
});

// AI Chat Logs (Admin View)
app.get('/api/ai-messages', checkAdmin, (req, res) => {
  const db = readDB();
  res.json(db.aiMessages || []);
});

app.delete('/api/ai-messages/:id', checkAdmin, (req, res) => {
  const db = readDB();
  db.aiMessages = (db.aiMessages || []).filter(m => m.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// Ecommerce Shop Orders API
app.post('/api/orders', (req, res) => {
  const { productId, productName, price, customerName, phone, address, paymentMethod, quantity = 1, userCode } = req.body;
  if (!customerName || !phone || !address) {
    return res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
  }
  const db = readDB();
  db.orders = db.orders || [];
  db.nextOrderId = db.nextOrderId || 1;
  const newOrder = {
    id: db.nextOrderId++,
    userCode: userCode || '',
    productId: productId || 0,
    productName: productName || 'Repair Part / Tool',
    price: price || '৳০',
    quantity: parseInt(quantity) || 1,
    customerName,
    phone,
    address,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    status: 'Pending',
    date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
  db.orders.unshift(newOrder);
  writeDB(db);
  res.json({ success: true, orderId: newOrder.id });
});

app.get('/api/orders', checkAdmin, (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

app.patch('/api/orders/:id', checkAdmin, (req, res) => {
  const db = readDB();
  const order = (db.orders || []).find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.body.status) order.status = req.body.status;
  writeDB(db);
  res.json({ success: true, order });
});

app.delete('/api/orders/:id', checkAdmin, (req, res) => {
  const db = readDB();
  db.orders = (db.orders || []).filter(o => o.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// Ultimate Free SMS Send API (Carrybee API integration)
async function handleSmsSend(req, res) {
  const num = req.query.num || req.body.num || req.body.phone || '';
  const name = req.query.name || req.body.name || 'Habib iFix';
  const msg = req.query.msg || req.body.msg || req.body.message || '';

  if (!num || !msg) {
    return res.status(400).json({
      status: false,
      error: 'Missing parameters. Required: num, msg. Optional: name'
    });
  }

  let cleanNum = String(num).replace(/[^0-9]/g, '');
  if (cleanNum.startsWith('880')) {
    cleanNum = cleanNum.slice(2);
  } else if (!cleanNum.startsWith('0') && cleanNum.length === 10) {
    cleanNum = '0' + cleanNum;
  }

  const payload = {
    name: String(name).trim(),
    phone_number: cleanNum,
    business_name: String(msg).trim()
  };

  try {
    const response = await fetch('https://api-merchant.carrybee.com/api/v2/merchant/register', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2027 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.8059.43 Mobile Safari/537.36',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Android WebView";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://merchant.carrybee.com',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://merchant.carrybee.com/',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let decoded;
    try {
      decoded = JSON.parse(responseText);
    } catch(e) {
      decoded = null;
    }

    if (decoded) {
      return res.json(decoded);
    } else {
      return res.json({
        status: true,
        raw_response: responseText
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: 'cURL / Network Error: ' + err.message
    });
  }
}


// SMS Proxy for CarryBee
app.post('/api/sms-bomber', async (req, res) => {
  const { num, name, msg } = req.body;
  if (!num || !name || !msg) {
    return res.status(400).json({ status: false, error: 'Missing parameters' });
  }

  try {
    const response = await fetch('https://api-merchant.carrybee.com/api/v2/merchant/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2027 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.8059.43 Mobile Safari/537.36',
        'origin': 'https://merchant.carrybee.com',
        'referer': 'https://merchant.carrybee.com/'
      },
      body: JSON.stringify({
        name: name,
        phone_number: num,
        business_name: msg
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

app.get('/api/tools/fb-profile-pic', async (req, res) => {
  const url = req.query.url || '';
  if (!url) {
    return res.status(400).json({ success: false, error: 'url parameter missing' });
  }
  if (!/^https?:\/\/(www\.|m\.|web\.)?facebook\.com\//i.test(url)) {
    return res.status(400).json({ success: false, error: 'Invalid Facebook URL' });
  }

  try {
    const params = new URLSearchParams();
    params.append('query', url);
    params.append('downloader', 'profile');

    const fvRes = await fetch('https://fvdownloader.net/req', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://fvdownloader.net',
        'Referer': 'https://fvdownloader.net/facebook-profile-picture-viewer',
        'Cookie': 'PHPSESSID=p87k0atbdulafssq1apr161doi; _ga=GA1.1.1832896960.1792768535; _ga_5JPP6DDGFQ=GS2.1.s1792768534$o1$g1$t1792768577$j17$l0$h0'
      },
      body: params.toString()
    });

    const responseText = await fvRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch(e) {
      data = null;
    }

    if (!data || data.error || !data.downloadUrl) {
      return res.status(404).json({ success: false, error: data?.error || 'Profile picture not found or profile is locked/private' });
    }

    const imageUrl = data.downloadUrl.replace('&dl=1', '');
    
    const imgRes = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!imgRes.ok) {
      return res.status(502).json({ success: true, downloadUrl: imageUrl, error: 'Could not stream image binary' });
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
  }
});

app.get('/api/sms-send', handleSmsSend);
app.post('/api/sms-send', handleSmsSend);

app.all('/api/tools/banglalink-sim-bar', async (req, res) => {
  const msisdn = req.query.num || req.body.num || req.query.msisdn || req.body.msisdn || '';
  const nid = req.query.nid || req.body.nid || '';
  const dob = req.query.dob || req.body.dob || '';

  if (!msisdn || !nid || !dob) {
    return res.status(400).json({ error: "Missing Parameters", message: "msisdn (num), nid, or dob is required." });
  }

  let cleanNum = String(msisdn).replace(/[^0-9]/g, '');
  if (cleanNum.startsWith('880')) {
    cleanNum = cleanNum.slice(2);
  } else if (!cleanNum.startsWith('0') && cleanNum.length === 10) {
    cleanNum = '0' + cleanNum;
  }

  const headers = {
    'User-Agent': 'okhttp/5.0.0-alpha.10',
    'Connection': 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    'device-token': 'c2r3mvSlSTifyw3iQB5JwW:APA91bFYAe1icbyjTFPZaDp0bmTjk40uuDIf-vjLx0m6avQlg9_uKBdiJ50PoDV_tAaejQcVes9Aw4aKUKDEIXcsnoE3z6nYGfgAF1g5H7TIm187gb95Rr4',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlkNTQ1ZjNiZWYyOTQwM2Q0MjAyMjUxOWYyZjFlMTM0NGU3YWFmYjkyYmMyZmNkYTkwMDg1NDgzYzhmZTdlMTE3OWQwY2ViN2U5MGQ3ZmE1In0.eyJhdWQiOiJmOGViZTc2MC0wZWIzLTExZWEtOGIwOC00M2E4MmNjOWQxOGMiLCJqdGkiOiI5ZDU0NWYzYmVmMjk0MDNkNDIwMjI1MTlmMmYxZTEzNDRlN2FhZmI5MmJjMmZjZGE5MDA4NTQ4M2M4ZmU3ZTExNzlkMGNlYjdlOTBkN2ZhNSIsImlhdCI6MTczMzY4NTA0MSwibmJmIjoxNzMzNjg1MDQxLCJleHAiOjE3NjUyMjEwNDEsInN1YiI6IjM1MzE3NjM1Iiwic2NvcGVzIjpbXX0.0Bpf2cpg6ldVuTA4H3ezZUl0EuoPJxQGjDmmE_H4CLvlrbPDutKBLf1lR4y1crtnUarJOqAbfSt9f18r0D4HIP94nGJRNSJzMCAeLApOrw2wsqjSRfNRIz3hHCwKl-pr0-1sNAc-pXXw4ROKG8Bf8pP5imXoA9NMBRQRpzqZgmvr3DRWYHO0pxktPsabTH17wQBQ7xSBWVoGdS6Pi9ugZvgR6tQKCxTt4Rh--rbdKLp-4t69q583uqOvPrPVpuJJ5hXplro11qhIT-MuK0b3ryVWXEEEB-iJ7wvTiBpDjjguGaN9UMTvp9ZyO3WtghUjSMakILCb1wEw7NGFxFcdzvYoZl4-0PfPvInH7xDGFOIRL6fHjoUoUlQJW_tq0mPTSklNiQUI2H9o_yat7uHrSDUJof_WUpBjqEpbKOSV_cOiRJNtCBMo4sa_zPQZasyEk3G5StNRUtJevilEdKFvjcu6SygAiDOFq5uf0IHtxPAYS_rgW1oVTUyKCdtra197mCVlYtreDaCp1RXsRE0a9M-g48oWx2SssQyxYYZl_ql30T5wONbuI6TJPSRmXB2aZ6koTpRJ--_8bBy6-KkDT8deJG63mGsJJ8suIvtGLOKBGLZ0djzuXmfhzha-_44moyFAAwdvtScKcpgF66pPL22ruzSmzNc-kTe2RNXjV2s',
    'Accept-Language': 'en',
    'platform': 'android',
    'app-version': '11.17.0',
    'version-code': '1117000',
    'api-client-pass': '1E6F751EBCD16B4B719E76A34FBA9',
    'msisdn': cleanNum,
    'connection-type': 'prepaid',
    'X-Entitlements': 'PREPAID',
    'Content-Type': 'application/json; charset=UTF-8'
  };

  try {
    const initiateRes = await fetch('https://myblapi.banglalink.net/api/v1/sim-bar/initiate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ dob, msisdn: cleanNum, nid })
    });
    const initiateData = await initiateRes.json();

    if (initiateData && initiateData.status === 'SUCCESS' && initiateData.data && initiateData.data.tran_id) {
      const tranId = initiateData.data.tran_id;

      const updateRes = await fetch('https://myblapi.banglalink.net/api/v1/sim-bar/update', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ tran_id: tranId })
      });
      const updateData = await updateRes.json();
      return res.json(updateData);
    } else {
      return res.status(400).json({ error: "Failed to initiate SIM bar", response: initiateData });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server cURL Error", message: err.message });
  }
});

app.all('/api/tools/remove-bg', async (req, res) => {
  const imageUrl = req.query.image || req.body.image || '';
  if (!imageUrl) {
    return res.status(400).json({ status: 'error', message: 'Please provide an image URL or base64. Example: /api/tools/remove-bg?image=IMAGE_URL' });
  }

  try {
    let imageBuffer;
    if (imageUrl.startsWith('data:image')) {
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return res.status(400).json({ status: 'error', message: 'Failed to download image from the provided URL.' });
      }
      imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    }

    const apiKey = '7c248e0b55e6f238c8034604c309ff7cdc4a5f7c5cfccfe71e59ec9d7ee70b8c223c527bc738e38ee0c0f9ab0569cee4';

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image_file', blob, 'image.jpg');

    const clipdropRes = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: formData
    });

    if (!clipdropRes.ok) {
      const errText = await clipdropRes.text();
      return res.status(clipdropRes.status).json({ status: 'error', message: 'Failed to process image with AI API.', details: errText });
    }

    const arrayBuffer = await clipdropRes.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server Error: ' + err.message });
  }
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Habib iFix server running on port ${PORT}`);
  });
}

module.exports = app;
