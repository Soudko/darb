# Darb (درب): requirements from the approved mockup

Written 14 Nov 2026 (afternoon), after Milestone 1 was submitted. This file replaces the features and screens in `darb.md` sections 8 and 12, and the earlier brief in `playbook/01-mini-prd-and-brand.md`.

**Sources, in order of authority:**
1. The Milestone 1 answer the team submitted (section 1 below, in short).
2. The 12-screen mockup Saoud shared on 14 Nov (sections 2 to 5): `docs/designs/mockup-2026-11-14.jpg`.

Where the mockup clashes with a rule decided earlier, the clash is listed in section 7 as a decision for Saoud. **D1 to D3 were decided on 14 Nov afternoon: follow the mockup fully** (accounts, real places, voice navigation outdoors and indoors). How the build keeps them honest and safe is in `playbook/02-build-prompts.md` and `playbook/07-four-ai-builders.md`. D4 uses the mockup's tagline; D5 is kept as a rule; D6 and D7 are still open (vibration works where the phone supports it).

---

## 1. What was submitted in Milestone 1 (short)

- **Challenge area:** Youth & Society (الشباب والمجتمع).
- **Problem:** people with disabilities in Kuwait struggle to move around and reach places and services, because it is hard to know how well a place suits each kind of disability, and there is little clear information about entrances, parking, lifts and facilities. Ordinary apps ignore differences in physical, sensory and cognitive abilities.
- **Who:** all people with disabilities in Kuwait, of every age: mobility, visual, hearing, speech and communication, and multiple disabilities. Also older people, people with temporary disabilities, and their companions.
- **Name used:** درب (Darb AI).
- **The three features promised:**
  1. **Adaptive AI assistant (المساعد الذكي المتكيّف):** a personal assistant that adapts to the user's abilities and needs. Voice, typing or simplified buttons, plus accessibility tools. Supports multiple disabilities. Simplifies instructions and services. Never forces one way of interacting.
  2. **Smart navigation and accessible places (الملاحة الذكية والأماكن المهيأة):** an interactive map to discover places in Kuwait that suit the user's needs, with information on entrances, parking, lifts, toilets and seating. Suggests suitable routes from the user's needs and the information available about each place.
  3. **AI companion (المرافق الذكي بالذكاء الاصطناعي):** uses the phone camera and AI to describe the surroundings, read signs, recognise landmarks and possible obstacles, and give simple spoken or visual guidance for the user's needs, with a way to ask for help.
- **Why it matters:** more independence and inclusion; fewer barriers to moving around and reaching services; less reliance on others.

## 2. Brand (from the mockup's side panel)

| Item | Value |
|---|---|
| Name | درب / Darb |
| Tagline (mockup) | «دليلك الذكي لسهولة الوصول لذوي الإعاقة في الكويت» (English, suggested: "Your smart guide to easy access for people with disabilities in Kuwait"). See D4. |
| Colours (unchanged) | navy `#0B2D5B`, teal `#00A8AB`, light teal `#6ED9D1`, off-white `#F4F8FB` |
| Font (unchanged) | Tajawal (Cairo as back-up) |
| Logo | teal S-shaped road ending in a white location pin, on a navy-to-teal rounded app icon; «درب» above "Darb". See D6. |
| Theme | dark navy by default; light mode and high contrast in settings |
| Look | rounded dark cards, pill-shaped teal main buttons, thin line icons, a teal glow on active items, Kuwait skyline silhouette on the welcome screens |
| Main icons | wheelchair, white cane (visual), ear (hearing), seat, parking "P", lift, toilets, location pin |
| Navigation | a bottom bar on Home with four items: الرئيسية (Home), الخريطة (Map), التنبيهات (Alerts), حسابي (My account). Favourites is a Home tile, not in the bar. |
| Direction | Arabic first, right to left; language switch to English |
| Feature list on the panel (أبرز المميزات) | خريطة أماكن مهيأة في الكويت · ملاحة صوتية للمكفوفين · معلومات المرافق (مواقف، مصاعد، دورات مياه) · أماكن جلوس واستراحة · إعدادات وصول متكاملة · تحديثات وتنبيهات فورية |

The mockup has a few Arabic typos (for example «اتجة», «إبدأ», «لفتحركة»). This file and the brief use the correct spelling.

## 3. The 12 screens

Each screen lists what is on it and what it must do. Arabic labels are copied from the mockup.

### 3.1 Splash (شاشة البدء)
- Logo, «درب» / "Darb", the tagline, Kuwait skyline at the bottom.
- Button «ابدأ» (Start). Language picker «العربية» with a globe icon.

### 3.2 Onboarding (تعريف بالتطبيق)
- Four swipe pages (four dots). «تخطي» (Skip) at the top. «التالي» (Next) button.
- Page shown: title «وصول أسهل للجميع»; text «اكتشف الأماكن المهيأة، تنقل بثقة، واحصل على إرشادات صوتية» (the mockup says «تنقل بأمان»; changed on 14 Nov so the app never calls a way safe); drawing of a wheelchair user and a person with a white cane in front of the skyline.
- The other three pages are not shown in the mockup: their wording is left to the Lead.

### 3.3 Choose user type (اختيار نوع المستخدم / إنشاء حساب)
- Title «إنشاء حساب» (Create account).
- Three choices, each with an icon: «مستخدم ذو إعاقة» (user with a disability), «مرافق / عائلة» (companion or family), «منشأة (شركة / مجمع)» (facility: company or mall).
- Button «متابعة» (Continue). Link «لديك حساب؟ تسجيل الدخول» (Have an account? Log in).
- See D1.

### 3.4 Home (الصفحة الرئيسية)
- Header: menu, logo, profile icon.
- Greeting «مرحباً بك» and «كيف يمكننا مساعدتك اليوم؟».
- Search box «ابحث عن مكان أو خدمة...».
- Six tiles: «الملاحة الصوتية» (voice navigation), «استكشف الأماكن» (explore places), «أماكن الجلوس والاستراحة» (seating and rest areas), «الخدمات المهيأة» (accessible services, see D5), «المفضلة» (favourites), «الإبلاغ عن مشكلة» (report a problem).
- Bottom bar (see section 2).

### 3.5 Map and place discovery (الخريطة واكتشاف الأماكن)
- Dark map of Kuwait with pins by type: accessible place (wheelchair), parking ("P"), restaurant (fork and knife).
- Search «القريبة مني» (near me) with a location arrow.
- Filter chips: «الجميع» (All), «مهيأ» (Accessible), «مواقف» (Parking), «مطاعم» (Restaurants).
- Map buttons: layers, my location.
- Bottom card for the chosen place: photo, name, distance (for example «12 كم»), an access status badge, favourite heart.

### 3.6 Place details (تفاصيل المكان)
- Large photo, favourite heart, share button.
- Place name and an access status badge (the mockup shows «مهيأ بالكامل», "fully accessible": see D2).
- Three tabs: «معلومات» (Information), «المرافق» (Facilities), «التقييمات» (Reviews).
- Facility checklist with ticks and icons: «مداخل مناسبة» (suitable entrances), «مواقف مخصصة» with a count (for example «120 موقف»), «مصاعد» (lifts), «دورات مياه مهيأة» (accessible toilets), «أماكن جلوس مخصصة» (dedicated seating).
- Main button «ابدأ الملاحة الصوتية» (Start voice navigation).

### 3.7 Filter options (خيارات التصفية)
- Title «تصفية النتائج». Close button.
- Tick list with icons: «مهيأ للكراسي المتحركة» (wheelchair accessible), «مناسب للمكفوفين (إرشاد صوتي)» (suitable for blind users, voice guidance), «مواقف مخصصة», «دورات مياه مهيأة», «أماكن جلوس», «مصاعد».
- Button «عرض النتائج (42)» (Show results, with a live count).

### 3.8 Voice navigation for blind users (الملاحة الصوتية للمكفوفين)
- Waveform showing the app is speaking.
- Large spoken and written instruction, for example «اتجه للأمام لمسافة 30 متر ثم انعطف يميناً نحو المدخل المهيأ».
- A big direction arrow with the distance («30 متر»).
- Three large controls: «الصوت» (sound), «إيقاف مؤقت» (pause), «إنهاء» (end).
- See D3.

### 3.9 Indoor navigation (الملاحة داخل المباني)
- Screen title «داخل المبنى». Floor indicator «الطابق الحالي: الأرضي» (current floor: ground).
- Floor plan with a dotted route from the user (blue arrow) to a wheelchair destination pin; two map-layer buttons.
- Instruction card «اتجه للأمام 25 متر إلى المصعد» with a speaker button.
- See D3.

### 3.10 Seating and rest areas (أماكن الجلوس والاستراحة)
- Tabs «قائمة» (List) and «خريطة» (Map).
- Cards with photo, name, a short access note, distance and a heart. Mockup examples: «منطقة استراحة – البوابة A» («مهيأة لذوي الإعاقة», 50 m); «منطقة جلوس – وسط المجمع» («مهيأة», 120 m); «استراحة هادئة» («مناسبة للحساسية الصوتية»: quiet, for sound sensitivity, 200 m).

### 3.11 Alerts and updates (التنبيهات والتحديثات)
- Bell icon, title «التنبيهات».
- Cards with an icon by type, a title, one line and the time ago. Three types in the mockup:
  - **Update** (parking icon): new parking added at a place.
  - **Temporary maintenance** (warning icon): a lift out of service at a place.
  - **Event** (calendar icon): an accessibility event at a place, with date and time.
- See D2 for the real place names used in the mockup.

### 3.12 Accessibility settings (إعدادات إمكانية الوصول)
- Screen title «إعدادات الوصول».
- «حجم الخط» (text size, for example «كبير», large).
- «نمط العرض» (display: light or dark).
- «التباين العالي» (high contrast) switch.
- «القراءة الصوتية تلقائياً» (read aloud automatically) switch.
- «الاهتزاز (تنبيهات ملاحية)» (vibration for navigation alerts) switch. See D7.
- «اللغة» (language: Arabic or English).

## 4. Functions, grouped by the three Milestone 1 features

### Feature 1: Adaptive AI assistant
- Reached from Home: the greeting «كيف يمكننا مساعدتك اليوم؟» and the search box are its way in. The user types, speaks or taps simple buttons.
- Answers adapt to the user's needs and settings: shorter, simpler wording for cognitive needs; read aloud for visual needs; text and vibration, never sound alone, for hearing needs.
- Finds places and services that suit the user, and explains *why* a place suits them, from Darb's own place information.
- Says plainly when Darb has no information about a place. Never invents a fact.
- Not shown as its own screen in the mockup: see section 6.

### Feature 2: Smart navigation and accessible places
- Map of places with pins by type; "near me"; filter chips; full filter sheet with a live result count.
- Place details: facility checklist, reviews tab, favourite, share, start navigation.
- Seating and rest areas, as a list or on the map, including quiet areas.
- Voice navigation for blind users, and indoor navigation (see D3 for how far this can honestly go).
- Report a problem (Home tile), which feeds the alerts.
- Alerts and updates about places.
- Favourites.

### Feature 3: AI companion (camera)
- Not shown in the mockup. From the Milestone 1 answer: the user points the camera or takes a photo; the AI describes the surroundings, reads signs, and points out landmarks and possible obstacles, in simple spoken or written words for the user's needs, and says how sure it is.
- A way to ask for help (for example, open the phone's own call or message app to a contact the user picks, so Darb stores no contacts).
- See D3: this is assistance, never a safety system.

### Set-up and settings (support the features; not a feature)
- Splash, onboarding, user type, accessibility settings, language, theme.

## 5. Data the app needs (outline, no code)

- **Places:** name, type (mall, restaurant and so on), position on the map, photo, facilities (suitable entrances, accessible parking and its count, lifts, accessible toilets, seating), access status, and where each fact came from and when.
- **Seating and rest areas:** belong to a place; name, access note, quiet or not, position.
- **Reports and alerts:** belong to a place; type (update, maintenance, event, problem), title, one line, date, open or resolved.
- **Reviews:** belong to a place (only if D1 allows a way to say who writes them).
- **On the phone only:** favourites, settings, language, theme, user type (unless D1 decides on accounts).
- **Never stored:** names, phone numbers, emails, Civil IDs, unless D1 decides otherwise. The user's live location is used on the phone for "near me" and distances, and is not sent to or kept on the server (decided in advance; Saoud can overrule).

## 6. Where the AI does the work: a gap

The mockup shows **no AI screen**: no assistant conversation and no camera screen. Milestone 1 promised AI in all three features, the hackathon scores AI, and the rules disqualify fixed answers shown as AI. Still to design, to match Milestone 1:
- **Assistant screen** (Feature 1): question box with microphone, answer card with "why this suits you", the places it used, and the "AI estimate" label.
- **Camera companion screen** (Feature 3): camera or photo, description, signs read, possible obstacles, confidence, "what I cannot tell", read aloud, help button.
- **AI inside Feature 2:** for example, the AI writes the "why this place suits you" summary on place details from the stored facility information, or turns a "report a problem" photo into a structured alert.

## 7. Open decisions for Saoud (clashes with the earlier plan)

| # | The mockup shows | The earlier plan said | Why it matters |
|---|---|---|---|
| D1 | Create account, log in, three user types including facility accounts | No accounts, no log-in, no personal data | Accounts store personal data (a disqualifying risk if real data is used) and take build time. A middle way: the user type is a choice kept on the phone, with no account. |
| D2 | Real venues (The Avenues, 360 Mall, Marina Mall) with "fully accessible" badges, parking counts and alerts about real lifts and events | No real venue names; no "fully accessible" badges; only made-up Sample places; every result labelled "Community check — not official" | Unverified facts about real venues are invented facts. Either use made-up Sample places, or label every real-place fact as "community information, not official", with its date. The "fully accessible" badge needs a decision either way. |
| D3 | Turn-by-turn voice navigation outdoors and indoors, with distances in metres | Dropped as non-goals: unreliable in a day, a wrong instruction is unsafe, indoor maps do not exist | Judges test what they see. A smaller honest version: spoken directions to the accessible entrance from the place's stored notes, labelled as guidance, not a safety system. |
| D4 | Tagline «دليلك الذكي لسهولة الوصول لذوي الإعاقة في الكويت» | «درب — دليلك الذكي للأماكن المهيأة في الكويت», used everywhere; the Milestone 1 text said «ذوي الاحتياجات الخاصة» | One tagline must be picked and used everywhere. This file and the brief use the mockup's. |
| D5 | An "accessible services" (الخدمات المهيأة) tile | A "government services" screen was dropped because it looks like a claim of government partnership | Keep the tile only for places and services in Darb's own data, never government services. |
| D6 | The logo in the mockup | Saoud draws the logo by hand on the day; no AI draws it | If the mockup's logo was AI-made, the rule needs Saoud's call before it goes in the app. |
| D7 | Vibration alerts switch | Not in the plan | Web vibration does not work in iPhone browsers (not re-checked today). Keep it for Android only, or drop it. |

## 8. Files now out of date

These still describe the earlier three features (Check a place, Report a barrier, Plan my trip). Each carries a warning line at the top until it is rewritten:
- `docs/designs/darb.md` (sections 3, 8, 9, 10, 12, 13 and 15 in part)
- `playbook/02-build-prompts.md` (Prompts 0 to 5)
- `playbook/03-team-schedule.md`
- `playbook/04-demo-script.md`
- `playbook/05-judges-questions.md`
- `playbook/06-checklist-tonight-and-tomorrow.md` (the rules self-check)
- `playbook/07-four-ai-builders.md` (the task board)

Still valid as written: the brand colours and font, the local-first build approach, the lanes and no-clash rules, what may go online, the safety and honesty rules for AI answers, and the Replit facts.
