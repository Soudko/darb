# Darb (درب): Product Design Document (PDD), with the glass UI system

Written 14 Nov 2026. Status: draft for Saoud's approval.

> **Today's build runs on Replit** (`playbook/10-replit-build.md`). Replit prompt R1 carries this document's glass values and its contrast rules (no teal text on glass; full off-white on a second glass layer). The technical design is `docs/designs/darb-tdd.md`. Values marked † in section 5.10 are still for Saoud to confirm.
Built from: `docs/designs/darb-requirements.md`, the approved mockup `docs/designs/mockup-2026-11-14.jpg`, `playbook/01-mini-prd-and-brand.md`, `brand/darb-brand-book.html`, `playbook/02-build-prompts.md` (Prompts 0 to 9) and the AGENTS.md rulebook in `playbook/07-four-ai-builders.md`.

---

## 1. Purpose and how to use this doc

**What this doc is for.** It tells every AI coding tool what Darb is, who it is for, how every screen behaves and how it looks. The app they build must match the approved mockup, in the glass look set out in section 5.

**Reading order for agents:**
1. `docs/designs/darb-requirements.md`: the requirements and the 12 mockup screens.
2. `playbook/01-mini-prd-and-brand.md`: the Mini PRD and the ready-made Arabic and English wording.
3. This PDD: look and behaviour, screen by screen.
4. `docs/designs/darb-tdd.md`: the Technical Design Document (how it is built).
5. `brand/darb-brand-book.html`: colours, contrast, type, logo files, voice, misuse.
6. The AGENTS.md rules (the rulebook block in `playbook/07-four-ai-builders.md`; in the app repository, `AGENTS.md` at the root).

**Which document wins:**
- **On rules** (honesty labels, privacy, accounts, lanes, routes, limits, AI behaviour): the AGENTS.md rules win.
- **On look and behaviour** (layout, glass, states, motion, screen flow): this doc wins, as long as it breaks no AGENTS.md rule.
- If this doc and AGENTS.md seem to disagree, follow AGENTS.md and tell Saoud.

**Conventions in this doc:**
- Arabic labels are copied from the sources, with the mockup's typos corrected (for example «ابدأ», «اتجه»).
- **(ar: L02)** means the sources give no Arabic for that line yet. Bayan writes it in task L02. The core writes its own first draft only in `client/src/core-strings/`. Never invent Arabic in screens.
- **†** marks a value or choice this doc sets where the sources and the glass brief are silent. Each † is listed for Saoud in section 5.10.
- Example places are made up. Never use a real venue's name in examples, test data or screenshots.
- No code appears here. Values in tables are design values, not code.

---

## 2. Product

### 2.1 Darb in one paragraph
Darb (درب, "path") is a mobile-first web app. It uses AI to help people with disabilities in Kuwait find places that suit their needs, know what to expect at the entrance before they go, and understand their surroundings when they arrive. Arabic comes first, right to left, with an English switch. Tagline: «دليلك الذكي لسهولة الوصول لذوي الإعاقة في الكويت» / "Your smart guide to easy access for people with disabilities in Kuwait". It is a student hackathon project, not an official or government service.

### 2.2 The three features
1. **Adaptive AI assistant (المساعد الذكي المتكيّف).** Ask by voice, typing or simple buttons. The AI suggests up to three suitable places from Darb's own data and says why each suits this person. It adapts to the user's needs and says plainly when Darb has no information.
2. **Smart navigation and accessible places (الملاحة الذكية والأماكن المهيأة).** A map of places with filters, place details (entrances, parking, lifts, toilets, seating), seating and rest areas, alerts, favourites, report a problem, and guidance to the accessible entrance.
3. **AI companion (المرافق الذكي).** Take a photo. The AI describes the scene, reads signs, names landmarks and possible obstacles, says how sure it is and what it cannot tell. A help button reaches a contact the user keeps on the phone. It is assistance, not a safety system.

**How they connect:** the assistant and the companion draw on Darb's place information. What users report keeps it fresh.

### 2.3 Milestone 2 core journey
1. **Choose your needs once** (at sign-up, or in the assistant's needs picker for guests).
2. **Ask the AI assistant** for a suitable place.
3. **Open the place** in smart navigation, check its facilities, and **follow the guidance to the accessible entrance**.
4. **On arrival, use the AI companion** to read signs and understand what is ahead.

Every screen should make this journey short. The demo follows it in this order.

---

## 3. Users and their needs

### 3.1 By need
The seven needs are the ones the account and the assistant's needs picker offer. More than one may be chosen.

| Need | Arabic label | What the app does differently (from the sources) |
|---|---|---|
| Mobility | «إعاقة حركية» | Filter "wheelchair accessible" (entrances "yes"); facility rows for entrances, parking and lifts; quick question "A place I can enter in a wheelchair"; guidance from the accessible parking to the accessible entrance; targets at least 48 px for limited hand control. |
| Visual | (ar: L02) | Reads new results aloud after the user's tap (as if "Read aloud automatically" were on); voice navigation with large spoken instructions; companion says more about where things are; filter "suitable for blind users (voice guidance)" (the place has an accessible entrance point); screen-reader labels on every button and image. |
| Hearing | (ar: L02) | Never relies on sound: every spoken line is also on screen; when an AI answer arrives the phone buzzes once (`buzz("alert")`); the AI writes with no reliance on sound; vibration for navigation alerts where the phone supports it. |
| Speech | (ar: L02) | Never forced to speak: typing and simple quick-question buttons always work; the microphone is optional and its words can be corrected before sending. |
| Cognitive | (ar: L02) | Every AI answer uses shorter, simpler sentences; one idea per sentence; simple buttons; quiet areas marked «مناسبة للحساسية الصوتية». |
| Elderly | «كبار السن» | No separate rule in the sources. Uses the general tools: text size, high contrast, read aloud, seating and rest areas. |
| Temporary | (ar: L02) | No separate rule in the sources. Uses the general tools; needs can be changed at any time in My account. |

### 3.2 By user type
| User type | Arabic label | What the app does differently |
|---|---|---|
| User with a disability | «مستخدم ذو إعاقة» | The full app. Needs saved on the account and used by the assistant and companion. |
| Companion or family | «مرافق / عائلة» | Uses the same app as a user. The sources give it no separate screens. |
| Facility (company or mall) | «منشأة (شركة / مجمع)» | Starts "pending" and uses the app like a user. Once the admin approves it, it can edit the places it manages (place editor, floor-plan editor), post updates, maintenance notes and events, and resolve alerts on those places. |
| Admin (one account, not offered at sign-up) | (ar: L02) | Approves or rejects facility accounts, adds and deletes places, edits any place. |
| Guest (no account) | (ar: L02) | May use the map, place details, the AI assistant and the AI companion. Asked to log in for favourites, reviews, reports and the "My favourites" alerts tab. |

---

## 4. Design principles

1. **Arabic first.** Design every screen right to left first, then check it left to right in English. Every word exists in both languages.
2. **Honest labels, always.** Every place fact shows its source, its date and «معلومات مجتمعية — غير رسمية». Every navigation screen shows the guidance line. AI output is called an estimate. When Darb has no information, it says so in the exact words.
3. **Calm, short voice.** One idea per sentence. No alarm, no hype, no promises. Easy to read aloud.
4. **Big, easy targets.** Every target is at least 48 px tall; main buttons are at least 52 px. Space between targets so a shaky hand does not hit the wrong one.
5. **Never colour alone.** Status always has an icon or a word as well as a colour: a tick, a mark, a badge word.
6. **Guidance, not safety.** Darb never says a way is safe. The companion and navigation always remind the user to stay aware of their surroundings.
7. **Glass serves reading.** Glass makes surfaces, not decoration. If glass ever hurts reading, it gives way: high contrast and reduced transparency turn it solid.

---

## 5. The glass UI system

### 5.1 Overview
Darb's look is dark navy glass with a soft teal light, as in the mockup: rounded translucent cards over a deep navy gradient, pill-shaped teal buttons, thin line icons, and a teal glow on active items. Light mode and high contrast are first-class, not afterthoughts.

Three themes:
- **Dark** (default).
- **Light** (setting «نمط العرض»).
- **High contrast** (setting «التباين العالي»), in a dark and a light version. The same solid look is used when the phone asks for **reduced transparency**.

### 5.2 Background tokens
| Token | Dark (default) | Light | High contrast |
|---|---|---|---|
| bg.base | Vertical gradient, navy #0B2D5B (top) to #071F44 (bottom) | Gradient #F4F8FB (top) to #DCEAF3 (bottom) | No gradient. Solid #0B2D5B (dark) or #F4F8FB (light) † |
| bg.light | Soft teal radial light behind the top of the screen: #00A8AB at 18% opacity | None † | None |
| bg.skyline (splash and onboarding only) | Kuwait skyline silhouette at the bottom, drawn in navy and teal (the team's own drawing) | Same drawing † | Flat silhouette, no gradient † |

### 5.3 Glass tokens
**Standard glass** (cards, tiles, list cards, inputs, chips):

| Token | Dark | Light | High contrast |
|---|---|---|---|
| glass.fill | rgba(244,248,251,0.08) | rgba(255,255,255,0.62) | Solid #0B2D5B (dark) or #FFFFFF (light) |
| glass.blur | Backdrop blur 20px, saturation 140% | Backdrop blur 20px (saturation not set †: use 140%) | None |
| glass.border | 1px rgba(244,248,251,0.16) | 1px rgba(11,45,91,0.10) | 2px off-white #F4F8FB (dark) or 2px navy #0B2D5B (light) |
| glass.highlight | Inner top highlight: inset 0 1px 0 rgba(255,255,255,0.18) | Not set † (use none) | None |
| glass.shadow | 0 8px 32px rgba(2,10,30,0.45) | Not set † (use none until Saoud sets one) | None † |
| glass.radius | 20px | 20px | 20px |
| glass.fallback (no backdrop blur in the browser) | Solid rgba(16,52,99,0.92) | Solid rgba(255,255,255,0.94) | Same as the high-contrast fill |

**Strong glass** (bottom bar, bottom sheets, dialogs, the map's place card):

| Token | Dark | Light | High contrast |
|---|---|---|---|
| glass.strong.fill | rgba(11,45,91,0.62) | Not set †: use light glass.fill | Solid, as standard glass |
| glass.strong.blur | 28px | Not set †: use 20px | None |
| glass.strong.border | As glass.border | As glass.border (light) | As glass.border (high contrast) |
| glass.strong.highlight | As glass.highlight | As glass.highlight (light) | None |
| glass.strong.radius | 24px on the top corners for sheets; dialogs 24px all corners †; map card 20px †; bottom bar 24px top corners † | Same | Same |

**Active or selected glass** (selected tile, chip, tab, bottom-bar item, chosen user type, ticked filter row):

| Token | Dark | Light | High contrast |
|---|---|---|---|
| glass.active.border | Teal #00A8AB at 60% | Teal #00A8AB at 60% † | 3px light teal #6ED9D1 (dark) or deep teal #007376 (light) † |
| glass.active.glow | Brand glow: teal at 30%, 24px soft | None † (the brand book keeps the glow to dark mode) | None |
| glass.active.mark | Always also a tick, a filled icon or an underline: never colour alone | Same | Same |

### 5.4 Button tokens
| Token | Dark | Light | High contrast |
|---|---|---|---|
| button.primary.fill | Solid teal #00A8AB | Solid teal #00A8AB | Solid teal #00A8AB, plus a 2px border in off-white (dark) or navy (light) † |
| button.primary.text | Navy #0B2D5B, bold | Navy #0B2D5B, bold | Navy #0B2D5B, bold |
| button.primary.shape | Pill, at least 52px tall | Same | Same |
| button.secondary.fill | Standard glass | Light glass † | Solid card colour |
| button.secondary.text | Off-white #F4F8FB | Navy #0B2D5B † | Off-white (dark) or navy (light) |
| button.secondary.border | 1px light teal #6ED9D1 | 1px deep teal #007376 † | 2px off-white or navy |
| button.secondary.shape | Pill, at least 52px tall † | Same | Same |
| Rule | **Never white text on teal.** Off-white on teal is 2.7:1 and fails. | Same | Same |

### 5.5 Text and focus tokens
| Token | Dark | Light | High contrast |
|---|---|---|---|
| text.body | Off-white #F4F8FB | Navy #0B2D5B | Off-white #F4F8FB (dark) or navy #0B2D5B (light) |
| text.secondary | Off-white at 72% | Navy at 72% † | Full off-white or full navy (no transparency) † |
| text.highlight (highlights and links) | Light teal #6ED9D1 | Deep teal #007376 | Light teal #6ED9D1 (dark) or deep teal #007376 (light), links underlined † |
| text.size.body | 18px | 18px | 18px |
| text.size.minimum | 15px, never smaller | Same | Same |
| focus.outline | 3px solid off-white #F4F8FB | 3px solid navy #0B2D5B † | 3px solid off-white (dark) or navy (light) |

### 5.6 Type scale
Font: **Tajawal** (Cairo as back-up), served by the app itself, never from another website. Arabic needs the taller line spacing shown (about 1.7).

| Role | Size / line | Weight |
|---|---|---|
| Display | 40 / 44 px | ExtraBold 800 |
| Screen title | 28 / 34 px | Bold 700 |
| Card title | 22 / 28 px | Bold 700 |
| Body | 18 / 30 px | Medium 500 |
| Button | 18 px | Bold 700 |
| Small print | 15 / 24 px (never smaller) | Medium 500 |

Text size setting: "normal" ×1, "large" ×1.25, "larger" ×1.5, applied to every size above.

### 5.7 Spacing, radii, elevation, icons
**Spacing scale (4px base):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px.
- Screen side margin: 16px †.
- Space inside a glass card: 16px †.
- Gap between cards and tiles: 12px †.
- Gap between two touch targets: at least 8px †.

**Radii:**
| Token | Value |
|---|---|
| radius.card | 20px (standard glass, tiles, list cards, place card) |
| radius.sheet | 24px, top corners only |
| radius.dialog | 24px † |
| radius.pill | Full pill (buttons, chips, search box, segmented control) |
| radius.small | 14px † (small controls such as text inputs; taken from the brand book's old button corner) |

**Elevation (bottom to top):**
| Level | What sits there | Surface |
|---|---|---|
| 0 | Screen background, map, photos | bg.base and bg.light |
| 1 | Cards, tiles, list cards, chips, top bar | Standard glass |
| 2 | Bottom bar, bottom sheets, map place card | Strong glass |
| 3 | Dialogs ("Are you sure?") over a dimmed screen † | Strong glass |

At most two glass layers are ever stacked. A dialog over a sheet hides the sheet's glass behind a dim layer † so that only two layers show.

**Icons:**
- Thin line icons from **one free, credited icon set. The set is still to be chosen.** Credit it on the About screen.
- Line icons sit in light teal #6ED9D1 (dark) or deep teal #007376 (light) on glass, or off-white/navy beside text.
- Need icons: wheelchair (mobility), white cane (visual), ear (hearing), speech bubble (speech), puzzle piece or brain (cognitive), walking stick (elderly), clock or plaster (temporary).
- Place and facility icons (from the mockup): seat, parking "P", lift, toilets, location pin, fork and knife (restaurant), calendar (event), warning (maintenance and problems), bell (alerts), globe (language), heart (favourite), share, layers, my-location arrow, speaker, pause, close.
- Every icon that acts as a button has a screen-reader label (section 9).

### 5.8 Motion
| Token | Value |
|---|---|
| motion.press | 180ms ease-out |
| motion.sheet (open and close) | 240ms ease-out |
| motion.screen (screen change) | 200ms ease-out † (within 180 to 240ms) |
| motion.ai | The waveform and any "AI is thinking" indicator pulse slowly |
| motion.reduced | When the phone asks for reduced motion: everything stops or becomes a plain fade; the waveform becomes still bars with the words "Speaking now" |

Screen changes move in the reading direction: right to left in Arabic, left to right in English.

### 5.9 Rules
1. Never put text directly on the skyline or on a photo. Always put a glass layer behind it.
2. Check every text and background pair at **4.5:1 or better**.
3. Glass is for surfaces, not for every element. Rows inside a card are not each glass.
4. At most two glass layers stacked.
5. Main buttons are solid teal with navy text. Never white text on teal.
6. Teal #00A8AB is never used as text on glass (see the estimates below). Use light teal on dark and deep teal on light.
7. Glow only on active or selected items, and only in the dark theme.
8. High contrast and reduced transparency: no blur, no gradients, no glow; solid cards with a 2px border; focus outline 3px.
9. If the browser has no backdrop blur, use the solid fallback fills.
10. Build screens from the four brand colours plus deep teal. The icon tile colours (#1B5597, #071F44 as a tile colour, #00B5B8, #DCEAF3 as a pin shade) live only in the icon; #071F44 and #DCEAF3 appear on screens only as the background gradient ends set in 5.2.
11. The logo is never stretched, squashed, recoloured, rotated, outlined or given a glow. The white-pin mark never goes on a light background: use `darb-mark-light.svg` there. On busy photos, use the icon tile.

**The brand book's contrast table (WCAG 2.2):**
| Text on background | Ratio | Result |
|---|---|---|
| Off-white on navy | 12.8 : 1 | AAA |
| Light teal on navy | 8.1 : 1 | AAA |
| Teal on navy | 4.7 : 1 | AA |
| Navy on teal (buttons) | 4.7 : 1 | AA |
| Navy on off-white | 12.8 : 1 | AAA |
| Deep teal on off-white | 5.3 : 1 | AA |
| Off-white on teal | 2.7 : 1 | Fails: never use |
| Teal on off-white | 2.7 : 1 | Fails: use deep teal |

**Glass estimates (worked out for this doc, not from the brand book).** These treat each glass layer as a flat colour over the background and ignore what shows through the blur. Re-check on screen in the build.
| Text on surface | Estimate | Use |
|---|---|---|
| Off-white on standard dark glass | about 7.9 to 12.3 : 1 | Yes |
| Off-white 72% on one dark glass layer | about 5.0 to 7.2 : 1 | Yes |
| Off-white 72% on two dark glass layers under the teal light | about 4.2 : 1 | **No**: use full off-white on a second layer |
| Light teal on dark glass | about 5.0 to 7.8 : 1 | Yes |
| Teal on dark glass | about 2.9 to 4.5 : 1 | **No** |
| Off-white 72% and light teal on the solid dark fallback | about 6.8 and 7.4 : 1 | Yes |
| Navy on light glass | about 12.6 to 13.3 : 1 | Yes |
| Deep teal on light glass | about 5.2 to 5.5 : 1 | Yes |
| Teal on light glass | about 2.7 : 1 | **No** |

### 5.10 Values this doc set where the brief is silent (†)
For Saoud to confirm or change:
- High-contrast background colours; skyline in light and high contrast.
- Light theme: saturation, highlight, shadow, strong glass, secondary text, focus colour, secondary button colours, active border, no glow.
- Strong glass radii for dialogs, map card and bottom bar.
- High-contrast primary button border, active border and secondary text.
- Side margin, card padding, gaps, small radius, dialog dimming, screen-change duration.
- Map pin status colours (section 6).
- No error or warning colour exists in the brand. Errors and warnings use an icon and words, not red (section 6).

---

## 6. Components

**States that apply to every component unless the row says otherwise:**
- **Default:** as in the tables of section 5.
- **Pressed:** 180ms ease-out; the surface brightens slightly † and scales to 98% †; no movement under reduced motion (brightness only).
- **Focus:** 3px solid outline (off-white on dark, navy on light), 2px away from the edge †. Never removed.
- **Disabled:** content at 50% opacity †, no glow; a short reason is shown nearby when it is not obvious. Text inside still reads at 4.5:1 where it carries meaning.
- **Loading:** a short loading line in words plus the slow pulse; the action that started it is disabled.
- **Error:** an error banner or line in words, with an icon. Never colour alone, never red alone.

| Component | Anatomy | Default | Pressed | Focus | Disabled | Loading | Error |
|---|---|---|---|---|---|---|---|
| Top bar | Standard glass strip: menu (Home only) or back chevron, screen title (28px) or logo mark with «درب», action icon (profile, close, bell or share) | Glass; back chevron mirrors in English | Icon press state | Outline round each icon | n/a | n/a | n/a |
| Bottom bar | Strong glass, top corners 24px; four items, each icon + label: «الرئيسية» Home, «الخريطة» Map, «التنبيهات» Alerts, «حسابي» My account | Labels off-white 72%; active item: light teal icon and label, filled icon, active glow | Item brightens | Outline round the item | n/a | n/a | n/a |
| Home tile | Standard glass card, radius 20px; line icon (light teal) above a one- or two-line label (body, bold) | Glass | Active border and glow while pressed | Outline | n/a | n/a | n/a |
| Glass card | Standard glass; optional title (22px), body, actions | Glass | If tappable: brighten | Outline | Content 50% | Pulse on the card body | Error line inside the card |
| Place card | Glass card; photo with a glass caption layer, place name, access status badge, distance (phone only), favourite heart, «معلومات مجتمعية — غير رسمية» | Glass | Brighten | Outline | n/a | Grey photo space with pulse | "No data yet" / «لا توجد بيانات بعد» for a missing item |
| Access status badge | Pill: icon + word. «مهيأ بالكامل» (tick), «مهيأ جزئياً» (half mark †), «لا توجد معلومات كافية» (question mark †) | Full: teal fill, navy text; partial: glass with light teal border; unknown: glass with off-white 72% text † | n/a | n/a | n/a | n/a | n/a |
| Map pin | Pin shape; inside, the type icon: wheelchair (accessible place), "P" (parking), fork and knife (restaurant); a small status mark on the pin's shoulder (tick, half mark or question mark) | Pin colour shows status: full teal, partial light teal, unknown off-white 72% † (the mockup's orange and blue pins are not brand colours). A small warning mark when the place has an open problem or maintenance alert | Grows to 110% † | Outline | n/a | n/a | n/a |
| Bottom sheet | Strong glass, 24px top corners, grab handle, title, close button, content, sticky main button at the bottom | Slides up 240ms | n/a | Focus moves into the sheet and stays there until it closes | n/a | Main button shows loading | Error line above the main button |
| Filter chip | Pill of standard glass, label, optional icon | Glass | Brighten | Outline | 50% | n/a | n/a |
| Filter chip, selected | Same, plus tick | Active border and glow, tick icon | Brighten | Outline | n/a | n/a | n/a |
| Toggle | Row: icon, label (body), switch on the reading-end side | Off: glass track; on: teal track with navy knob and a tick in the knob † | Knob moves 180ms | Outline round the whole row | 50% plus the reason line (for example the vibration line) | n/a | n/a |
| Segmented control | Pill of standard glass with two or more segments (for example «قائمة» / «خريطة», «معلومات» / «المرافق» / «التقييمات», All / My favourites) | Selected segment: solid teal with navy text; others: off-white 72% | Brighten | Outline round the segment | 50% | n/a | n/a |
| List row with source line | A row inside a card (not its own glass): icon, label, value (yes, no, unknown with a tick, a cross or a question mark), count if known, note; under it a small-print source line: source (facility, community or Darb team), date, «معلومات مجتمعية — غير رسمية» | Row dividers 1px off-white 16% † | If tappable: brighten | Outline | n/a | n/a | "No data yet" / «لا توجد بيانات بعد» |
| Alert card | Standard glass: type icon (P or update, warning, calendar), place name, title (22px), one line, photo if any (with a glass caption), time ago or event date, source line, community label | Glass | Brighten | Outline | n/a | Pulse | Error banner on the list |
| Chat bubble (user) | Standard glass bubble on the reading-start side †, the question text | Glass | n/a | n/a | n/a | n/a | n/a |
| Chat bubble (assistant) | Standard glass bubble on the reading-end side †: the reply, then up to three place cards (with the "why" lines and "Show on map" and "Details"), speaker and stop buttons, the footer line | Glass with a light teal top border † | n/a | Outline on each button | n/a | "Thinking" line with the slow pulse | Error banner inside the thread with Try again |
| Result card (companion) | Strong glass card: description; Signs (text as written + meaning); Landmarks; Possible obstacles (what + where); How sure the AI is (word + icon); What I cannot tell from this photo; speaker; the companion label and "AI estimate from one photo." | Glass | n/a | Outline on each button | n/a | Loading line, Describe disabled | Error banner with Try again |
| Navigation instruction card | Strong glass: big direction arrow (light teal), distance in large display type (for example «30 متر»), the instruction in screen-title size, speaker button | Glass | n/a | Outline on the speaker | n/a | "Finding your position" line † | Accuracy warning line when worse than about 25 m |
| Waveform | A row of thin bars in light teal | Bars pulse slowly while the voice module says "speaking" | n/a | n/a | Hidden when voice is off | n/a | Replaced by "Voice is not ready yet." / «الصوت غير جاهز بعد.» |
| Empty state | Glass card: line icon, one friendly line, a button to the next step where it makes sense | Glass | Button press | Outline on the button | n/a | n/a | n/a |
| Error banner | Standard glass with a 2px light teal border † (deep teal in light), warning icon, the message in the current language, a Try again button | Glass | Button press | Outline on the button | n/a | Try again shows loading | n/a |
| Footer label | Small print, off-white 72%, centred above the bottom bar: «تقدير بالذكاء الاصطناعي. ليس نصيحة طبية أو رسمية.» / "AI estimate. Not medical or official advice." | On every main screen | n/a | n/a | n/a | n/a | n/a |
| Community label | Small print in the source line: «معلومات مجتمعية — غير رسمية» / "Community information — not official" | On every place fact, list row and card | n/a | n/a | n/a | n/a | n/a |
| Guidance label | Glass strip at the top of every navigation screen: «إرشاد فقط. انتبه لما حولك.» / "Guidance only. Stay aware of your surroundings." | Always shown | n/a | n/a | n/a | n/a | n/a |
| Companion label | On every companion result: «مساعدة بالذكاء الاصطناعي، وليست نظام أمان. انتبه لما حولك.» / "AI assistance, not a safety system. Stay aware of your surroundings." | Always shown | n/a | n/a | n/a | n/a | n/a |
| Text input and search box | Search box: pill of standard glass, search icon, placeholder «ابحث عن مكان أو خدمة...». Text inputs: radius 14px †, label above, help line below | Glass | n/a | Outline | 50% | n/a | Error line under the field, in words |
| Dialog | Strong glass, radius 24px †, title, one line, two buttons (secondary Cancel, primary action) | Over a dim layer † | Button press | Focus starts on Cancel † and stays inside | n/a | Action button shows loading | Error line |

---

## 7. Screen inventory

Each screen lists: purpose, layout top to bottom, content, actions, and states (guest, loading, empty, error, AI not set up, no information). "n/a" means the state cannot happen there. The footer label sits on every main screen. Every navigation screen shows the guidance label.

### 7.1 Splash «شاشة البدء»
- **Purpose:** first view; brand and language.
- **Layout:** bg.base with bg.light and the skyline at the bottom. Centre: stacked logo (`darb-logo-ar-dark.svg`, or `darb-logo-ar-light.svg` in light), at least 96px tall mark. Under it the tagline on a glass layer (it overlaps the skyline space). Bottom: primary button, then the language picker.
- **Content:** «درب» / "Darb"; tagline «دليلك الذكي لسهولة الوصول لذوي الإعاقة في الكويت» / "Your smart guide to easy access for people with disabilities in Kuwait"; button «ابدأ» (Start); language picker «العربية» with a globe icon.
- **Actions:** «ابدأ» → Onboarding. Language picker switches Arabic and English at once.
- **States:** guest: this is the guest view. Loading, empty, error, AI not set up, no information: n/a.

### 7.2 Onboarding «تعريف بالتطبيق»
- **Purpose:** explain Darb in four swipe pages.
- **Layout:** «تخطي» (Skip) at the top, reading-end corner. Drawing in the middle over the skyline. Title and text on a glass layer. Four dots. Primary button «التالي» (Next) at the bottom.
- **Content:** page 1: «وصول أسهل للجميع» / «اكتشف الأماكن المهيأة، تنقل بثقة، واحصل على إرشادات صوتية», with a drawing of a wheelchair user and a person with a white cane before the skyline. Pages 2 to 4: one each for the AI assistant, the map and navigation, and the AI companion, in the same style; wording drafted by the core in core-strings and polished by Bayan (not set in the sources).
- **Actions:** swipe or «التالي»; «تخطي» → Create account. «التالي» on page 4 → Create account.
- **States:** all n/a. Dots show the page by position and filled shape, not colour alone.

### 7.3 Create account: choose user type «إنشاء حساب»
- **Purpose:** pick a user type, then make a nickname account, or continue as a guest.
- **Layout:** top bar with back. Title «إنشاء حساب». Three large glass choice cards, each with an icon. Then the form: nickname, password, needs (several allowed, each a chip with its need icon). The privacy line. Primary button «متابعة». Link «لديك حساب؟ تسجيل الدخول». Link "Continue as a guest" (ar: L02).
- **Content:** «مستخدم ذو إعاقة» (wheelchair icon), «مرافق / عائلة» (people icon), «منشأة (شركة / مجمع)» (building icon). Needs: mobility «إعاقة حركية», visual, hearing, speech, cognitive, elderly «كبار السن», temporary (others ar: L02). Line: "For your account we never ask for your name, email or phone number. Use a nickname." (ar: L02). A facility choice shows that the account waits for approval (ar: L02).
- **Actions:** choose a type (active glass with tick); «متابعة» creates the account and goes to Home; log-in link → Log in; guest link → Home as a guest.
- **States:** guest: this screen. Loading: «متابعة» shows loading, form locked. Empty: «متابعة» disabled until type, nickname (3 to 30 characters) and password (8 to 100) are filled. Error: nickname taken, or a field out of limits, shown under the field in words. AI not set up and no information: n/a.

### 7.4 Log in «تسجيل الدخول»
- **Purpose:** return to an account.
- **Layout:** top bar with back and title. Nickname field, password field, primary button, link to Create account, link "Continue as a guest".
- **Content:** nickname, password (labels ar: L02).
- **Actions:** log in → Home (or back to the screen that asked for log-in).
- **States:** loading: button loading. Empty: button disabled until both fields are filled. Error: one message, the same whether the nickname or the password is wrong (ar: L02); too many tries → the polite rate-limit message (ar: L02). Guest, AI not set up, no information: n/a.

### 7.5 Home «الصفحة الرئيسية»
- **Purpose:** the start of every journey.
- **Layout:** top bar: menu (reading-start), logo mark with «درب» (centre), profile icon (reading-end). Greeting «مرحباً بك» (screen title) and «كيف يمكننا مساعدتك اليوم؟». Search box. Six tiles, two per row (one per row at "larger" text †). A large camera button for the AI companion under the tiles. Footer label. Bottom bar with Home active.
- **Content:** search placeholder «ابحث عن مكان أو خدمة...». Tiles: «الملاحة الصوتية» (voice navigation), «استكشف الأماكن» (explore places), «أماكن الجلوس والاستراحة» (seating and rest areas), «الخدمات المهيأة» (accessible services), «المفضلة» (favourites), «الإبلاغ عن مشكلة» (report a problem). Camera button label: AI companion «المرافق الذكي».
- **Actions:** greeting or search box → AI assistant. Tiles → their screens («الملاحة الصوتية» first asks the user to pick a place from the map, the list or favourites). Camera button → AI companion. Menu → AI assistant, AI companion, Access settings †, About †. Profile icon → My account.
- **States:** guest: same screen; the profile icon leads to My account's guest view. Loading, empty, error: n/a. AI not set up: shown inside the assistant and companion, not here. No information: n/a.

### 7.6 AI assistant «المساعد الذكي» (Feature 1)
- **Purpose:** ask for a suitable place and learn why it suits you.
- **Layout:** top bar with back and title. For guests: a needs picker at the top (chips, kept on the phone). The thread: user bubbles and assistant bubbles. Quick-question buttons above the input. Input row: text box (up to 500 characters), microphone button (only when voice can listen), Ask button. Footer label.
- **Content:** quick questions: "A place I can enter in a wheelchair", "Accessible parking near the entrance", "A quiet place to sit", "Accessible toilets" (ar: L02). An answer shows the AI's reply and up to three place cards with the "why" lines that name stored facts, open alerts first, buttons "Show on map" and "Details", the community label on each card, speaker and stop buttons.
- **Actions:** type, tap a quick question, or speak (words go into the box and can be corrected). Ask. "Show on map" → Map centred on the place. "Details" → Place details. Speaker reads the answer.
- **States:**
  - Guest: allowed; needs come from the picker.
  - Loading: a clear loading line in the thread, the slow pulse, Ask disabled.
  - Empty: before the first question, the quick questions and the needs picker only.
  - Error: «لم يصلنا رد من الذكاء الاصطناعي. حاول مرة أخرى.» / "The AI did not answer. Please try again." with Try again.
  - AI not set up: «الذكاء الاصطناعي غير مُعدّ على هذا الجهاز.» / "AI is not set up on this computer." Never a sample answer.
  - No information: exactly «لا توجد في درب معلومات عن هذا المكان بعد.» / "Darb has no information about this place yet." with a button to the map. An answer with no matching place shows only the AI's reply and the map button.
  - Medical question: «هذا ليس نصيحة طبية.» / "This is not medical advice." at once, with no place.
  - Questions are not stored.

### 7.7 Map and place discovery «الخريطة واكتشاف الأماكن»
- **Purpose:** find places on a map of Kuwait.
- **Layout:** full-screen dark map (darkened in the dark theme). Over it, at the top: back (when opened from a tile) and the "near me" search pill «القريبة مني» with a location arrow; a row of filter chips with a filter button that opens the full filter sheet †; a "List" switch. On the side: map buttons (layers, my location), each a 48px glass circle. Bottom: the strong-glass place card for the chosen pin. Bottom bar when opened from the bar.
- **Content:** chips «الجميع» (All), «مهيأ» (Accessible), «مواقف» (Parking), «مطاعم» (Restaurants). Pins by type with a status mark (section 6). Place card: photo, name, distance (for example «12 كم»), status badge, community label, heart.
- **Actions:** tap a pin → place card; tap the card → Place details. «القريبة مني» asks for the phone's location only when tapped, then centres the map and shows distances (worked out on the phone; never sent). Chips filter at once. Filter button → Filter sheet. List switch → the same places as a list with distances. Heart → favourite.
- **States:**
  - Guest: allowed; the heart asks to log in.
  - Loading: the map shows a loading line over a plain navy area.
  - Empty: no places yet: an empty-state card (friendly line, ar: L02).
  - Error: error banner with Try again.
  - Location refused: the map still works, without "near me" or distances.
  - Map tiles not approved or not loading: the list view is shown instead.
  - AI not set up: n/a. No information: a place with no facilities shows «لا توجد معلومات كافية» on its badge.

### 7.8 Filter options «خيارات التصفية» (bottom sheet)
- **Purpose:** narrow the map to the user's needs.
- **Layout:** strong-glass sheet. Title «تصفية النتائج», close button. Tick list rows inside one card, each with an icon. Sticky primary button.
- **Content:** «مهيأ للكراسي المتحركة» (wheelchair), «مناسب للمكفوفين (إرشاد صوتي)» (ear, as in the mockup), «مواقف مخصصة» (P), «دورات مياه مهيأة» (toilets), «أماكن جلوس» (seat), «مصاعد» (lift). Button «عرض النتائج (عدد)», for example «عرض النتائج (42)», with the live count.
- **Actions:** tick or untick (tick mark and active border); the count updates live; the button closes the sheet and shows the results; close keeps the previous filters.
- **States:** empty: count 0 disables the button and shows a line (ar: L02). Loading, error, guest, AI not set up, no information: n/a.

### 7.9 Place details «تفاصيل المكان»
- **Purpose:** everything Darb knows about one place, and the way in.
- **Layout:** large photo at the top with a glass layer under its icons: back, favourite heart, share. Below on a glass card: name (screen title) and access status badge. Segmented tabs «معلومات» / «المرافق» / «التقييمات». Tab content. Sticky primary button «ابدأ الملاحة الصوتية». Buttons "Report a problem", and for managers and the admin "Post an update" and "Edit place" (ar: L02). A button «داخل المبنى» only when the place has a drawn indoor route †.
- **Content:**
  - «معلومات» (default, as in the mockup): the facility checklist with ticks and icons: «مداخل مناسبة», «مواقف مخصصة» with the count (for example «120 موقف»), «مصاعد», «دورات مياه مهيأة», «أماكن جلوس مخصصة»; open alerts first, with a warning mark.
  - «المرافق»: each facility as a list row: yes, no or unknown with a tick, a cross or a question mark, the count, the note, then the source line with source, date and «معلومات مجتمعية — غير رسمية». The place's points (accessible entrance, accessible parking, seating) with their source lines.
  - «التقييمات»: reviews newest first: nickname, stars (shown as stars and as a number), text, date. Logged-in users add 1 to 5 stars and an optional text up to 300 characters.
- **Actions:** heart; share (the phone's own share sheet with the place name and the app link only); «ابدأ الملاحة الصوتية» → Voice navigation; Report a problem → Report a problem with this place chosen; Post an update → a sheet (type «تحديث», «صيانة مؤقتة» or «فعالية مخصصة», title and one line in both languages, date and time for events; no AI); Edit place → Place editor.
- **States:**
  - Guest: heart and reviews ask to log in ("Log in to add a review", ar: L02); report asks to log in.
  - Loading: photo space and rows pulse.
  - Empty: no reviews: empty-state line.
  - Error: error banner with Try again.
  - No information: a place with no facilities saved shows exactly «لا توجد في درب معلومات عن هذا المكان بعد.» / "Darb has no information about this place yet." A single missing item shows «لا توجد بيانات بعد».
  - AI not set up: n/a.

### 7.10 Voice navigation, outdoors «الملاحة الصوتية»
- **Purpose:** guide the user on foot from the accessible parking to the accessible entrance.
- **Layout:** top bar with back and title. Guidance label. Waveform. The instruction in large type. The navigation instruction card: big arrow and distance («30 متر»). The location accuracy line. "Open in Maps" button (secondary). Three large round controls at the bottom: «الصوت» (sound), «إيقاف مؤقت» (pause), «إنهاء» (end).
- **Content:** example instruction: «اتجه للأمام لمسافة 30 متر ثم انعطف يميناً نحو المدخل المهيأ». Without a compass, no left or right: the distance and a direction in words, for example "about 30 metres, towards the north-east" (ar: L02).
- **Actions:** Start asks for location and compass only on the tap. The instruction updates every few seconds and is spoken only when it changes meaningfully. Each new instruction buzzes ("step"); within about 10 metres, "arrived" (buzz and spoken). «الصوت» mutes or unmutes speech; «إيقاف مؤقت» pauses; «إنهاء» ends and returns to the place. "Open in Maps" hands the parking point (or the place position) to Apple Maps or Google Maps. On arrival, offer the AI companion † (step 4 of the core journey).
- **States:**
  - Guest: allowed.
  - Loading: "finding your position" line † until the first fix.
  - Error: location refused: a line saying so, and "Open in Maps" only.
  - Poor accuracy (worse than about 25 m): said plainly; no turn instructions.
  - No information: no accessible entrance point: «لا توجد في درب معلومات عن هذا المكان بعد.» and "Open in Maps" only.
  - Voice not ready: «الصوت غير جاهز بعد.»; the text still works.
  - AI not set up: n/a (no AI here; never labelled as AI).
  - Empty: from the Home tile with no place chosen: the place picker first.

### 7.11 Indoor navigation «داخل المبنى» (cut first unless the team is ahead)
- **Purpose:** step-by-step guidance on one floor, from a drawn route.
- **Layout:** top bar with back and title «داخل المبنى». Guidance label. Floor indicator «الطابق الحالي: الأرضي» (current floor). The floor plan with a dotted route, the user's step marker (the mockup's blue arrow, drawn in light teal †) and a wheelchair destination pin; two map-layer buttons. The instruction card «اتجه للأمام 25 متر إلى المصعد» with a speaker button. A big "Next step" button (ar: L02).
- **Content:** destinations from the indoor points on the entrance's floor: lift, toilet, seating, quiet area. Steps worked out by the server from the drawn path: distance in metres and a turn.
- **Actions:** pick a destination; Next step moves on (no indoor positioning); each step is spoken after a tap and buzzes ("step"). To change floor: go to a lift, then pick that floor and its lift as the new start.
- **States:** loading: plan pulses. Empty or no information: no route drawn → «لا توجد في درب معلومات عن هذا المكان بعد.» Error: banner with Try again. Guest: allowed. AI not set up: n/a (never labelled as AI).

### 7.12 Seating and rest areas «أماكن الجلوس والاستراحة»
- **Purpose:** find places to sit and rest, including quiet areas.
- **Layout:** top bar with back and title. Segmented control «قائمة» (List) / «خريطة» (Map). List: glass cards. Map: the map with seating pins.
- **Content:** each card: the place's photo, the point's name, access note, distance (phone only), heart for the place, source line with community label. Mockup examples: «منطقة استراحة – البوابة A» («مهيأة لذوي الإعاقة», 50 m); «منطقة جلوس – وسط المجمع» («مهيأة», 120 m); «استراحة هادئة» («مناسبة للحساسية الصوتية», 200 m). Quiet areas show «مناسبة للحساسية الصوتية».
- **Actions:** tap a card → Place details. Heart → favourite (log-in for guests).
- **States:** guest: allowed. Loading: cards pulse. Empty: no seating points yet (ar: L02). Error: banner. No information: n/a. AI not set up: n/a. Map tab is on the cut list (keep the list).

### 7.13 Alerts and updates «التنبيهات والتحديثات»
- **Purpose:** changes at places: updates, maintenance, events and reported problems.
- **Layout:** top bar with bell icon and title «التنبيهات». Segmented control: All / My favourites (ar: L02). Alert cards, newest first. Bottom bar with Alerts active.
- **Content:** card icon by type: «تحديث» (parking or update icon), «صيانة مؤقتة» (warning), «فعالية مخصصة» (calendar), problem reports (warning). Each: place name, title, one line, photo if any, time ago or event date, source, community label. Example (made-up place): "Update: new accessible parking at Example Mall".
- **Actions:** tap → Place details. Resolve (shown to the place's manager, the admin, or the person who reported it) → the alert leaves the list. While the screen is open, new alerts are checked every 30 seconds; new ones buzz once ("alert"). In-app only, no push notifications.
- **States:** guest: All only; My favourites asks to log in. Loading: cards pulse. Empty: no alerts (ar: L02). Error: banner. AI not set up, no information: n/a.

### 7.14 Accessibility settings «إعدادات إمكانية الوصول»
- **Purpose:** make the app fit the user.
- **Layout:** top bar with back and title «إعدادات الوصول». One glass card of rows (rows are not each glass).
- **Content and controls:**
  - «حجم الخط» (text size): normal, large «كبير», larger (others ar: L02).
  - «نمط العرض» (display): dark or light («فاتح» in the mockup).
  - «التباين العالي» (high contrast): toggle.
  - «القراءة الصوتية تلقائياً» (read aloud automatically): toggle.
  - «الاهتزاز (تنبيهات ملاحية)» (vibration for navigation alerts): toggle. Where the browser cannot vibrate, a small line under it: "Not available on this phone's browser" (ar: L02).
  - «اللغة» (language): «العربية» or English.
- **Actions:** every change applies to the whole app at once and is kept on the phone. Link to About.
- **States:** guest: allowed. Loading, empty, error, AI not set up, no information: n/a.

### 7.15 My account «حسابي»
- **Purpose:** the user's own account.
- **Layout:** top bar with title. Glass card: nickname, user type, facility status if a facility ("pending" or "approved", ar: L02). Needs as editable chips. Links: Access settings, About, Admin (admin only). Log out (secondary button). Bottom bar with My account active.
- **Actions:** change needs (saved to the account). Log out → Home as a guest.
- **States:** guest: "Log in" and "Create account" buttons instead (ar: L02), plus Access settings and About. Loading: card pulses. Error: banner. Empty, AI not set up, no information: n/a.

### 7.16 Admin: facility approval (admin only)
- **Purpose:** approve or reject facility accounts.
- **Layout:** top bar with back and title (ar: L02). A list of pending facility accounts: nickname and date. Each opens a sheet: choose the places it will manage (tick list), then Approve (primary) or Reject (secondary). An "Add place" button for the admin (name in both languages, type, position) and Delete on test places with "Are you sure?".
- **Actions:** approve with places, reject, add a place, delete a place (dialog first).
- **States:** loading: rows pulse. Empty: no pending accounts (ar: L02). Error: banner; a duplicate place name is refused with a line (ar: L02). Not admin: refused (forbidden). Guest, AI not set up, no information: n/a.

### 7.17 Place editor (admin, and approved facility accounts on their own places)
- **Purpose:** keep a place's facts right.
- **Layout:** top bar with back and title (ar: L02). Sections as glass cards: name (both languages), type, photo, position (tap the map). Facilities: for each of entrances, parking, lifts, toilets, seating: a segmented yes / no / unknown, an optional count, a note in both languages saying where the fact came from. Outdoor points: tap the map to add entrances and parking (with an "Accessible" switch), seating, rest areas, quiet areas. Save (primary).
- **Content:** photo upload asks first for the tick box "This photo shows no people, faces, number plates, name badges or screens" (ar: L02). The photo is shrunk and redrawn in the browser before upload.
- **Actions:** save sets the source to "facility" (manager) or "team" (admin) and the date to now. Link to the Floor-plan editor.
- **States:** loading: Save loading. Error: banner; a field out of limits is shown under the field. Not allowed: refused (forbidden). Empty: a new place with nothing saved shows each facility as unknown. Guest, AI not set up, no information: n/a.

### 7.18 Floor-plan editor (cut with indoor navigation)
- **Purpose:** draw indoor points and routes on the team's own floor plan.
- **Layout:** top bar with back and title (ar: L02). Upload a floor plan (after the "no people" tick box). Floor name (both languages), level (0 = ground), how many metres the plan's full width covers. The plan: tap to add indoor points (entrance, lift, toilet, seating, rest area, quiet area). Route drawing: pick a start and an end point on the same floor, tap the turns between them. Save.
- **States:** loading: Save loading. Error: banner. Empty: no floors yet. Not allowed: refused. Guest, AI not set up, no information: n/a.

### 7.19 AI companion «المرافق الذكي» (Feature 3)
- **Purpose:** understand the surroundings from one photo.
- **Layout:** top bar with back and title. Camera or upload area (glass frame). Optional question box with quick questions "What is in front of me?", "Read the signs", "Is the path clear?" (ar: L02) and a microphone where available. Primary button Describe (ar: L02). Result card. Help button «اطلب المساعدة» (secondary, always visible). Footer label.
- **Content:** result card as in section 6, with «مساعدة بالذكاء الاصطناعي، وليست نظام أمان. انتبه لما حولك.» and "AI estimate from one photo." (ar: L02). If a face, number plate, name badge or screen is visible: "A face, number plate, name badge or screen can be seen in this photo." (ar: L02). Help: a line saying the number stays on this phone (ar: L02).
- **Actions:** take or upload a photo (JPEG or PNG; shrunk and redrawn in the browser); Describe; speaker reads the description (and automatically after Describe when "Read aloud automatically" is on); help button saves one contact on the phone only, then opens the phone's own call or message app.
- **States:**
  - Guest: allowed.
  - Loading: loading line, slow pulse, Describe disabled.
  - Empty: before a photo: the camera area and a short line on what to photograph.
  - Error: «لم يصلنا رد من الذكاء الاصطناعي. حاول مرة أخرى.» with Try again.
  - AI not set up: «الذكاء الاصطناعي غير مُعدّ على هذا الجهاز.»
  - Not a scene (for example a cup): the card only says what it shows, with no route advice.
  - No information: n/a. Nothing is stored: not the photo, not the answer.

### 7.20 Report a problem «الإبلاغ عن مشكلة»
- **Purpose:** tell others about a barrier; it becomes an alert.
- **Layout:** top bar with back and title. Place picker (default: the place the user came from). Photo area. Optional note (up to 300 characters). Primary button that asks the AI to draft the report. The draft card: problem type, severity, title, description, each editable before saving. Save (primary).
- **Content:** problem types: blocked ramp, steps only, broken lift, toilet out of order, blocked accessible parking, obstacle on path, narrow door, poor lighting, other (ar: L02). Success line: "Report saved. Thank you for helping." (ar: L02).
- **Actions:** draft (AI), correct, save → the alert appears in Alerts and on the place.
- **States:**
  - Guest: asked to log in.
  - Loading: drafting line, button disabled.
  - Empty: no photo yet.
  - Error: «لم يصلنا رد من الذكاء الاصطناعي. حاول مرة أخرى.»
  - AI not set up: «الذكاء الاصطناعي غير مُعدّ على هذا الجهاز.»
  - No problem visible: said plainly, with a way to try another photo.
  - Private details visible: saved without the photo, with «يظهر وجه أو لوحة سيارة أو بطاقة اسم أو شاشة في الصورة، لذلك لن نحفظها.» / "A face, number plate, name badge or screen can be seen in this photo, so we will not save it."

### 7.21 Accessible services «الخدمات المهيأة»
- **Purpose:** places of type "service" in Darb's own data.
- **Layout:** top bar with back and title. Place cards with their facilities and source lines.
- **Rule:** never a government service, never a claim of partnership.
- **States:** guest: allowed. Loading: pulse. Empty: no services yet (ar: L02). Error: banner. AI not set up, no information: n/a.

### 7.22 Favourites «المفضلة»
- **Purpose:** the user's saved places.
- **Layout:** top bar with back and title. Place cards. Heart on each to remove.
- **States:** guest: asked to log in. Loading: pulse. Empty: no favourites, with a button to the map (ar: L02). Error: banner. AI not set up, no information: n/a.

### 7.23 About (ar: L02)
- **Purpose:** what Darb is, honesty, privacy, credits.
- **Layout:** top bar with back and title. Glass cards: what Darb is (two sentences); disclaimer; privacy; credits.
- **Content:** disclaimer: "Darb is a student hackathon project. It is not an official or government service. Place information comes from facilities, the community and our team, and can be out of date. AI answers are estimates and can be wrong. Navigation is guidance only, not a safety system. This is not medical advice." Privacy: "Accounts use a nickname only. We never ask for your name, email or phone number. Your location and your help contact stay on your phone. Please do not upload photos that show people, faces, name badges, screens or number plates." Credits: every library, font (Tajawal, Cairo), icon set, map (Leaflet, OpenStreetMap and its contributors), AI model, the languages and tools, as in Prompt 8. The logo `darb-icon.svg` at the top.
- **States:** all n/a.

---

## 8. Navigation map

```text
Splash
└─ Onboarding (4 pages; Skip)
   └─ Create account (user type, nickname, needs)
      ├─ Log in ──────────────┐
      ├─ Continue as a guest ─┤
      └─ Continue ────────────┤
                              ▼
Home  [bottom bar: Home · Map · Alerts · My account]
├─ Greeting / search box ──► AI assistant
│                             ├─ Show on map ──► Map
│                             └─ Details ─────► Place details
├─ Tile: Voice navigation ──► pick a place (map, list, favourites) ──► Voice navigation (outdoors)
├─ Tile: Explore places ────► Map
├─ Tile: Seating and rest areas ──► Seating (List | Map) ──► Place details
├─ Tile: Accessible services ─────► Accessible services ──► Place details
├─ Tile: Favourites ──────────────► Favourites ──► Place details
├─ Tile: Report a problem ────────► Report a problem
├─ Camera button ─────────────────► AI companion (help button ► phone's own call/message app)
├─ Menu ──► AI assistant · AI companion · Access settings † · About †
└─ Profile icon ──► My account

Map
├─ Filter button ──► Filter options (sheet) ──► back to Map with results
├─ List switch ────► the same places as a list
└─ Pin ──► place card ──► Place details

Place details
├─ Start voice navigation ──► Voice navigation (outdoors)
│                             ├─ Open in Maps ──► phone's own maps app
│                             └─ On arrival ──► AI companion †
├─ Inside the building † ──► Indoor navigation (cut first)
├─ Report a problem ──► Report a problem (this place chosen)
├─ Post an update (manager, admin) ──► sheet
├─ Edit place (manager, admin) ──► Place editor ──► Floor-plan editor (cut first)
└─ Share ──► phone's own share sheet

Alerts ──► Place details
My account
├─ Access settings ──► About
├─ About
├─ Admin (admin only) ──► Place editor
└─ Log out ──► Home (guest)
```

Any screen that needs an account sends a guest to Log in and back again after log-in.

---

## 9. Accessibility behaviour

### 9.1 Per setting
| Setting | Behaviour |
|---|---|
| Text size «حجم الخط» | Normal ×1, large ×1.25, larger ×1.5, applied to every text size. Layouts wrap; text is never cut off. Home tiles drop to one per row at "larger" †. |
| Display «نمط العرض» | Dark (default) or light, using the tokens in section 5. The logo files switch with the theme. |
| High contrast «التباين العالي» | No blur, no gradients, no glow. Solid cards (#0B2D5B dark, #FFFFFF light) with a 2px off-white or navy border. Focus outline 3px. Secondary text at full strength. |
| Reduced transparency (the phone's own setting) | The same solid look as high contrast. |
| Reduced motion (the phone's own setting) | Motion stops or becomes a plain fade. The waveform turns into still bars with "Speaking now". |
| Read aloud automatically «القراءة الصوتية تلقائياً» | After the user's tap that asked for a result (assistant answer, companion description, navigation instruction), the new result is read in the app's current language. Speech always starts from a tap. |
| Vibration «الاهتزاز (تنبيهات ملاحية)» | Short patterns: "step" at each new navigation instruction, "arrived" near the entrance, "alert" for new alerts and, for hearing needs, when an AI answer arrives. Only when the switch is on and the phone supports it. **iPhone fallback:** iPhone browsers cannot vibrate; the switch shows "Not available on this phone's browser" and the app relies on text on screen. Vibration is never the only signal. |
| Language «اللغة» | Arabic (right to left) or English (left to right). Every word changes at once. |

### 9.2 Per need
See section 3.1. In short: visual → read aloud and spoken guidance; hearing → never sound alone, text plus a buzz; speech → typing and buttons always work; cognitive → shorter, simpler AI answers; mobility → wheelchair filters and guidance to the accessible entrance.

### 9.3 Screen readers
- Every button and image has a label in Arabic and English (the accessibility module's labelFor).
- Icon-only buttons (heart, share, layers, my location, speaker, close, menu, profile) always carry a label.
- When a new AI answer, a companion result or a navigation instruction appears, it is announced to the screen reader †.
- Status badges are read as words («مهيأ بالكامل»), not as colours.
- Focus moves into a sheet or dialog when it opens and back to its button when it closes.

### 9.4 Direction (RTL and LTR)
- Arabic lays out right to left: back chevrons, the reading-start and reading-end corners, the toggle side and the bottom bar order all mirror.
- **Navigation arrows do not mirror.** They show the real direction in the world.
- Numbers use the digits shown in the mockup («30 متر», «12 كم»).
- Mixed Arabic and English text (for example a sign copied as written) keeps each part's own direction.

### 9.5 Always
- Colour is never the only signal: ticks, marks, words and filled icons go with every status.
- Touch targets at least 48px tall (52px for main buttons), with at least 8px between them †.
- Focus outline 3px, always visible.
- Small print never below 15px.

---

## 10. Content and voice

### 10.1 Tone
- **Calm:** no alarm and no hype. People are planning a trip.
- **Short:** one idea per sentence, plain words, easy to read aloud.
- **Honest:** never promises. Says "AI estimate", never "official". Says when there is no data.
- Use «ذوي الإعاقة», as in the tagline, everywhere.

### 10.2 Lines that must be exact
| Where | العربية | English |
|---|---|---|
| No information about a place (word for word, everywhere) | لا توجد في درب معلومات عن هذا المكان بعد. | Darb has no information about this place yet. |
| No data for one item | لا توجد بيانات بعد | No data yet |
| Every place fact | معلومات مجتمعية — غير رسمية | Community information — not official |
| Every navigation screen | إرشاد فقط. انتبه لما حولك. | Guidance only. Stay aware of your surroundings. |
| Footer, every main screen | تقدير بالذكاء الاصطناعي. ليس نصيحة طبية أو رسمية. | AI estimate. Not medical or official advice. |
| Companion result | مساعدة بالذكاء الاصطناعي، وليست نظام أمان. انتبه لما حولك. | AI assistance, not a safety system. Stay aware of your surroundings. |
| Medical question | هذا ليس نصيحة طبية. | This is not medical advice. |
| AI error | لم يصلنا رد من الذكاء الاصطناعي. حاول مرة أخرى. | The AI did not answer. Please try again. |
| AI not set up (never a sample answer) | الذكاء الاصطناعي غير مُعدّ على هذا الجهاز. | AI is not set up on this computer. |
| Voice not ready | الصوت غير جاهز بعد. | Voice is not ready yet. |
| Private details in a photo | يظهر وجه أو لوحة سيارة أو بطاقة اسم أو شاشة في الصورة، لذلك لن نحفظها. | A face, number plate, name badge or screen can be seen in this photo, so we will not save it. |
| Access status | مهيأ بالكامل · مهيأ جزئياً · لا توجد معلومات كافية | Fully accessible · (en: L02) · (en: L02) |
| Report saved | (ar: L02) | Report saved. Thank you for helping. |
| Wrong log-in | (ar: L02) | One message for a wrong nickname or a wrong password. |
| Vibration not available | (ar: L02) | Not available on this phone's browser |

### 10.3 Words never to use
- "official", "government", "certified", "approved": only allowed in the disclaimer that says Darb is not official, on the admin's Approve button, and in the facility status "approved".
- "safe" about a way, a path or a route. Never say the way is safe.
- "Verified accessible", "Approved by Darb", "Success!", "No results found." (the brand book's "not" column).
- "Community check — not official" (old wording): use "Community information — not official".
- Any medical advice or diagnosis.
- Any real venue name in examples, demo data or screenshots.

---

## 11. Out of scope and cut by default

### 11.1 Not in Darb
- Push notifications or anything sent outside the app (alerts are in-app only).
- Government services, or any claim of partnership or official status.
- Medical advice.
- Indoor positioning (indoor steps move on with a Next button), and routes across floors (one floor per route).
- Storing questions, companion photos or answers; storing or sending the user's location or help contact.
- Real names, emails, phone numbers or Civil IDs.
- Paid speech services.
- Invented places or facts; the database starts empty.
- Sample or made-up answers shown as AI.

### 11.2 The cut list (file 07, first cut first)
1. **Indoor navigation and the floor-plan editor** (C10, part B). Cut by default; build only if the team is ahead.
2. Reviews.
3. The microphone (C13, part B). Keep read aloud.
4. Seating and rest areas on the map tab (keep the list).
5. Outdoor voice navigation (C10, part A). Keep "Open in Maps".

**Never cut** the AI assistant (C06) or the AI companion (C08). They are two of the three features.

When a part is cut, hide its entry points (the «داخل المبنى» button, the reviews tab, the microphone button, the seating map tab). Never show a dead button.
