import type { Locale } from "./config";

/**
 * All customer-facing copy. English is the source of truth for the shape;
 * `th` must match it exactly, which TypeScript enforces below.
 *
 * `**bold**` inside a string is rendered by <RichText>. The admin console is
 * deliberately left in English — it is an internal tool.
 */
const en = {
  common: {
    signIn: "Sign in",
    signOut: "Sign out",
    getStarted: "Get started",
    myApps: "My Apps",
    submitApp: "Add New App",
    plans: "Plans",
    settings: "Settings",
    admin: "Admin",
    back: "Back",
    cancel: "Cancel",
    continue: "Continue",
    language: "Language",
    day: "Day",
    of: "of",
    days: "days",
    menu: "Menu",
  },

  landing: {
    nav: {
      how: "How it works",
      rule: "The Play rule",
      included: "What you get",
      pricing: "Pricing",
      faq: "FAQ",
    },
    badge: "Google Play closed testing",
    titleTop: "14 days of real testers.",
    titleAccent: "Android Closed Testing",
    subtitle:
      "Google Play wants 12 testers and 14 continuous days of closed testing before your app can go live. We run that cycle with real people, and you follow every single day from one dashboard.",
    ctaSignedOut: "Start with Google",
    ctaSignedIn: "Add New App",
    ctaSecondary: "See how it works",
    stats: {
      testers: "Real testers, every day",
      days: "Continuous days of testing",
      policy: "Manual policy check",
    },
    preview: {
      appName: "My Amazing App",
      appStatus: "Testing process",
      inProgress: "In progress",
      completed: "Testing completed",
      current: "Testing in progress",
      scheduled: "Scheduled",
      testersToday: "Testers today",
      active: "active",
    },
    rule: {
      eyebrow: "Why this exists",
      title: "The rule that blocks most new developers",
      body: "If your personal developer account was created after 13 November 2023, Play will not even show you the production track until a closed test has run its course.",
      cards: [
        {
          title: "12 testers, opted in",
          body: "Not installs — testers who joined your closed track through the opt-in URL and stayed on it.",
        },
        {
          title: "14 continuous days",
          body: "The clock restarts if your track goes quiet or your testers drop below the threshold.",
        },
        {
          title: "No shortcuts",
          body: "Emulator farms and recycled accounts get flagged. Our testers are real people on real devices.",
        },
        {
          title: "A form at the end",
          body: "Play asks what you learned from testing. We hand you answers that match your actual cycle.",
        },
      ],
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps, in this order",
      body: "Sign in and the app walks you through them one at a time — no guessing what comes next.",
      step: "Step",
      cards: [
        {
          title: "Activate your app",
          body: "Buy a package to get started, or use the code you already have — one covers one app for the whole 14-day cycle.",
          detail: "Secure checkout, ready to use instantly.",
        },
        {
          title: "Prepare your track",
          body: "We walk you through the Play Console screens: open your closed track to all countries, add our tester group, and send your changes for review.",
          detail: "Guided, with a screenshot for every click.",
        },
        {
          title: "Watch 14 days tick by",
          body: "12+ real testers open and use your app every day. Your dashboard shows the exact day you are on and what happens next.",
          detail: "Form answers arrive before the final day.",
        },
      ],
    },
    included: {
      eyebrow: "What you get",
      title: "Everything the cycle needs, handled",
      body: "One team runs the testing, checks your track against Play policy, and hands you the paperwork at the end.",
      timelineTitle: "Daily activity",
      note13: "Day 13 — we send the production form answers to your inbox.",
      note14:
        "Day 14 — submit the form, then promote your release to production.",
    },
    pricingTeaser: {
      eyebrow: "Pricing",
      title: "One package, one app",
      body: "No subscription — buy a package once, and each one activates one full 14-day cycle.",
      cta: "See all plans",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions we get every week",
      items: [
        {
          q: "What exactly does Google Play require?",
          a: "For personal developer accounts created after 13 November 2023, Play requires a closed test with at least 12 testers who opted in, running continuously for at least 14 days, before you can apply for production access.",
        },
        {
          q: "Do I need to publish my app first?",
          a: "You need a closed testing track with a release that has passed Google's review, and an opt-in URL testers can use. The setup guide inside the app shows you exactly where to find both.",
        },
        {
          q: "What about paid apps?",
          a: "Paid apps work too. You generate 14 promo codes in Play Console under Monetise → App pricing → Promo codes and share them with us, so testers can install without paying.",
        },
        {
          q: "What happens after the 14 days?",
          a: "We send you the answers for the production access form and stay with you until your app is live. Testing only counts once you promote the release to production, so do not stop your track early.",
        },
        {
          q: "Will the testers leave reviews or ratings?",
          a: "No. Closed testers use your app so the requirement is met. Ratings and reviews on a closed track are not public and we never manipulate your store listing.",
        },
        {
          q: "Do you need access to my Play Console?",
          a: "Never. You add our Google Group as testers on your own track — that is the only thing we need from your account.",
        },
      ],
    },
    cta: {
      title: "Start your 14 days today",
      body: "Sign in with Google, follow the setup guide, and your cycle can be running before the end of the week.",
      buttonSignedOut: "Continue with Google",
      buttonSignedIn: "Go to my apps",
    },
  },

  login: {
    cardTitle: "Continue with Google",
    button: "Continue with Google",
    signingIn: "Redirecting…",
    errorExpired:
      "That sign-in link has expired or was already used. Please try again.",
    errorGeneric: "Sign-in did not complete. Please try again.",
  },

  dashboard: {
    title: "My Apps",
    emptySubtitle: "Your submissions and their 14-day cycles live here.",
    countOne: "submission",
    countMany: "submissions",
    inProgress: "in progress",
    needAttention: "need attention",
    loadError:
      "Could not load your apps. If this is the first run, apply the SQL migrations in supabase/migrations to your project.",
    emptyTitle: "No apps yet",
    testingProgress: "Testing progress",
    subtitleDraft: "Draft — activate this app",
    subtitleSetup: "Complete the Play Console setup",
    subtitleSetupConfirmed: "Setup confirmed — waiting for our team",
    subtitleCancelled: "Cancelled",
    subtitleRunning: "Testing process",
    actionActivate: "Activate with a token",
    actionView: "View details",
  },

  status: {
    draft: "DRAFT",
    awaiting_setup: "SETUP REQUIRED",
    in_progress: "IN PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  },

  wizard: {
    title: "Add New App",
    step: "Step",
    stepOf: "of",
    steps: [
      { title: "Activate", caption: "Buy a package / enter your token" },
      { title: "Before you begin", caption: "Prepare your Play Console track" },
      { title: "App details", caption: "Tell us what to test" },
    ],
    step1: {
      title: "Activate your app",
      body: "One token covers one app for the full 14-day cycle.",
      cardTitle: "Enter your token",
      checking: "Checking…",
      valid: "Token accepted — continue to your app details.",
      noTokenTitle: "No token yet?",
      noTokenCta: "Buy a package",
      questions: "Questions?",
      tokensAvailableOne: "You have **1** unused token — filled in below.",
      tokensAvailableMany:
        "You have **{count}** unused tokens — one is filled in below.",
      viewTokens: "View all my tokens",
    },
    step2: {
      title: "Before you begin",
      body: "Do this in Play Console first — your cycle cannot start until your track is open and our testers are on it.",
      question: "Confirm your Play Console setup",
      hint: "You can only continue once these steps are done in Play Console.",
      doneTitle: "All done",
      doneBody:
        "Countries opened, tester group added, changes sent for review.",
    },
    step3: {
      title: "App details",
      body: "The last step. We only need four things.",
      appName: "App name",
      appNamePlaceholder: "e.g. My Amazing App",
      contactEmail: "Contact email",
      optInUrl: "Tester opt-in URL / Play Store link",
      optInHintToggle: "Where do I find this link?",
      optInHint:
        "Play Console → Test and release → Testing → Closed testing → your track → **How testers join your test** → Copy link.",
      appType: "App type",
      freeTitle: "Free App",
      freeBody: "Testers install it straight from your opt-in link.",
      paidTitle: "Paid App",
      paidBody: "You send us 14 promo codes so testers can install it.",
      summary: "Summary",
      summaryToken: "Token",
      summarySetup: "Play Console setup",
      setupDone: "Completed",
      submit: "Finalize submission",
      submitting: "Submitting…",
    },
  },

  setupGuide: {
    beforeYouBegin: "Before you begin",
    introTitle: "Open your Play Console dashboard",
    intro1:
      "Log in to the **Google Play Console** and select the app you want to test.",
    intro2:
      "Go to **Test and release** → **Testing** → **Closed testing**, then open your track.",
    intro3:
      "Keep that tab open — you will copy your **opt-in URL** from it at the last step.",
    openConsole: "Open Play Console",
    groupEmail: "Group Email",
    steps: [
      {
        title: "Set Countries/Regions",
        body: "Go to the **Countries/regions** tab, click **Add countries/regions**, select **All countries/regions**, and click Save.",
      },
      {
        title: "Add Tester Group",
        body: "In the **Testers** tab, under 'Choose a testing method', select **Google Groups**. Click 'Enter email address' and add the group below. Don't forget to click 'Save changes'.",
      },
      {
        title: "Check Track Visibility",
        body: "Verify your track is **Active** and your app is **Published** (In Review or Approved) under Advanced settings → App availability.",
      },
      {
        title: "Final Review",
        body: "Finally, ensure you have clicked the **Send changes for review** button at the top of the Publishing overview page. **Testing will only begin after Google's initial review.**",
      },
    ],
  },

  setupPage: {
    eyebrow: "Play Console",
    title: "Setup guide",
    subtitle:
      "Four changes on your closed testing track. Once they are done, confirm below and our team starts your cycle.",
    confirmed: "Setup confirmed",
    doneTitle: "Setup confirmed",
    doneBody:
      "Our team is checking your track and will start the 14-day cycle shortly.",
    askTitle: "Finished all four steps?",
    askBody: "Confirm and our team will verify your track, then start day 1.",
    button: "I've completed setup",
    buttonDone: "Setup confirmed",
    buttonSaving: "Saving…",
  },

  guidePage: {
    eyebrow: "Public guide",
    title: "Play Console setup guide",
    subtitle:
      "Everything you need to do before your 14-day closed testing cycle can start — no sign-in needed to read it.",
    cta: "Sign in to submit an app",
  },

  appDetails: {
    welcomeTitle: "Submission received.",
    welcomeBody:
      "Our team checks your track and starts the 14-day cycle from here — you will see day 1 appear on this page.",
    draft: "Draft — activate this app to begin.",
    awaitingSetup: "Complete the Play Console setup to begin.",
    cancelled: "This cycle was cancelled.",
    complete: "complete",
    activate: "Activate this app",
    openSetup: "Open setup guide",
    reviewSetup: "Review setup guide",
    setupConfirmedTitle: "Setup confirmed.",
    setupConfirmedBody:
      "Our team is checking your track and will start your 14-day cycle shortly.",
    testingProgress: "Testing progress",
    started: "Started",
    waitingStart: "Waiting for our team to start the cycle",
    dailyActivity: "Daily activity",
    handledTitle: "We take care of the rest.",
    handledBody:
      "Don't worry, our team will handle everything after the 14-day cycle. We take full responsibility for your production access — we will send you the form answers and guide you through every step until your app is live.",
    submission: "Submission",
    appType: "App type",
    optInUrl: "Opt-in URL",
    contact: "Contact",
    setupStatus: "Play Console setup",
    setupYes: "Confirmed",
    setupNo: "Not confirmed",
    freeApp: "Free App",
    paidApp: "Paid App",
    policyEyebrow: "Policy restriction",
    policyLocked: "Locked",
    policyTitle: "days testing",
    policyBody:
      "Google Play requires **{days} days of continuous testing** before you can request production access.",
    complianceTitle: "Compliance verification",
    complianceBody:
      "Want to cross-check that everything works? Join the group and test it yourself to confirm everything is operational on your side.",
    joinTesting: "Join testing",
    timeline: {
      ready: "Ready",
      today: "Today",
      locked: "Locked",
      formAnswersDay:
        "Almost done — after this final round of testing we'll email you your production access answers.",
      finalDay:
        "Final day — check your email for your production access answers, then submit Google's form and promote your release to production.",
      completedOn: "Testing has been completed on {date}.",
      completed: "Testing has been completed.",
      inProgressOn: "Testing in progress for {date}.",
      inProgress: "Testing in progress.",
      scheduledOn: "Testing scheduled for {date}.",
      notScheduled: "Scheduled once your cycle starts.",
      teamUpdate: "Update from our team:",
    },
    promo: {
      cta: "Send promo codes…",
      submittedNotice:
        "Promo codes sent — we'll check them and start your cycle.",
      modalTitle: "Send your 14 promo codes",
      modalBody:
        "Since your app is **PAID**, generate 14 promo codes in Play Console under Monetize → App pricing → Promo codes, then paste them below — one per line.",
      placeholder: "PROMO-CODE-1\nPROMO-CODE-2\n…",
      submit: "Submit codes",
      submitting: "Sending…",
      required: "Paste at least one promo code.",
      statusLabel: "Promo codes",
      yes: "Submitted",
      no: "Not submitted yet",
    },
  },

  messages: {
    title: "Report an issue",
    subtitle:
      "Something not working, or have a question? Send us a note and we'll reply here.",
    placeholder: "Describe the issue…",
    send: "Send",
    sending: "Sending…",
    required: "Write a message first.",
    you: "You",
    team: "Our team",
    empty: "No messages yet.",
  },

  activate: {
    title: "Ready to go live?",
    subtitle:
      "**{name}** is saved. Enter your token to start the 14-day testing cycle.",
    cardTitle: "Enter your token",
    cardBody: "Each token activates one app.",
    tokenLabel: "Token ID",
    submit: "Activate with token",
    checking: "Checking…",
    noTokenTitle: "No token yet?",
    noTokenCta: "Buy a package",
    questions: "Questions?",
  },

  redeem: {
    title: "Redeem a token",
    subtitle: "Each token activates one app for a full 14-day cycle.",
    yourToken: "Your token",
    newTitle: "Submit a new app",
    newBody:
      "The submission flow walks you through the Play Console setup, takes your token, and collects your app details.",
    newCta: "Start submission",
    existingTitle: "Or activate an app you already submitted",
    notActivated: "not activated",
  },

  pricing: {
    eyebrow: "Plans & pricing",
    popular: "Most popular",
    appsOne: "app",
    appsMany: "apps",
    buy: "Buy now",
    buying: "Opening checkout…",
    signInToBuy: "Sign in to buy",
    everyPackage: "every package includes",
  },

  checkout: {
    successTitle: "Payment complete",
    successBody:
      "Thank you. Your tokens are ready — each one activates a single app.",
    tokensTitle: "Your tokens",
    tokensHint:
      "Keep these somewhere safe. You can always find them again under Redeem a token.",
    useNow: "Use a token now",
    backToApps: "Back to my apps",
    pending: "We are still confirming your payment. Refresh in a moment.",
    failedTitle: "Payment not completed",
    failedBody:
      "Your card was not charged, or the checkout was cancelled. You can try again from the pricing page.",
    backToPricing: "Back to pricing",
    cancelledTitle: "Checkout cancelled",
    cancelledBody:
      "No payment was taken. Your package is still waiting whenever you are ready.",
    orderSummary: "Order",
    unavailable:
      "Card payment is not configured yet. Please contact us to buy a package.",
  },

  settings: {
    title: "Settings",
    subtitle: "Your account and the details you need in Play Console.",
    signedInAs: "Signed in as",
    adminTitle: "Admin console",
    adminBody: "Submissions, cycles, tokens, packages and site settings.",
    adminLink: "Open the admin console",
    groupTitle: "Tester group",
    groupBody:
      "Add this Google Group to the Testers tab of your closed testing track.",
    openGroup: "Open the group",
    plansTitle: "Plans",
    plansBody: "Every app needs its own token. See what a package includes.",
    plansLink: "Plans & pricing",
    languageTitle: "Language",
    languageBody: "Choose the language for the whole site.",
  },

  tokenErrors: {
    invalid: "We don't recognise that token. Check for typos and try again.",
    used: "That token has already been used for another app.",
    void: "That token was cancelled. Contact us and we'll sort it out.",
    tooShort: "Enter the token you received after payment.",
    missingSetup:
      "Token checking is not set up on the server yet. Apply the latest SQL migration and try again.",
    generic: "Could not check that token. Try again.",
    signIn: "Please sign in again.",
  },

  formErrors: {
    name: "Enter your app name.",
    type: "Choose whether your app is free or paid.",
    url: "Enter a valid opt-in URL or Play Store link.",
    email: "Enter a valid contact email.",
    save: "Could not save your submission. Try again.",
    tokenFirst: "Enter your token first.",
  },

  copy: {
    clickToCopy: "Click to copy",
    copied: "Copied",
  },

  plan: {
    features: [
      "Production Access Guarantee",
      "12+ Real Testers interact with your app daily for 14 days",
      "12 Real Testers Delivered",
      "Daily Active Engagement",
      "Fully Handled by Our Team",
      "Money Back Guarantee",
    ],
    name: "Pro Plan",
    tagline: "Guaranteed Production Access",
    badge: "Testers Pro",
  },
};

// No `as const` above on purpose: literal types would force the Thai
// dictionary to repeat the English strings verbatim.
type Dictionary = typeof en;

const th: Dictionary = {
  common: {
    signIn: "เข้าสู่ระบบ",
    signOut: "ออกจากระบบ",
    getStarted: "เริ่มใช้งาน",
    myApps: "แอปของฉัน",
    submitApp: "เพิ่ม App ใหม่",
    plans: "แพ็กเกจ",
    settings: "ตั้งค่า",
    admin: "ผู้ดูแล",
    back: "ย้อนกลับ",
    cancel: "ยกเลิก",
    continue: "ถัดไป",
    language: "ภาษา",
    day: "วันที่",
    of: "จาก",
    days: "วัน",
    menu: "เมนู",
  },

  landing: {
    nav: {
      how: "ขั้นตอนการใช้งาน",
      rule: "กฎของ Google Play",
      included: "สิ่งที่คุณได้รับ",
      pricing: "ราคา",
      faq: "คำถามที่พบบ่อย",
    },
    badge: "Google Play closed testing",
    titleTop: "14 วัน กับ Tester ตัวจริง",
    titleAccent: "Android Closed Testing",
    subtitle:
      "Google Play กำหนดให้ต้องมี Tester 12 คน และทดสอบแบบปิดต่อเนื่อง 14 วัน ก่อนแอปของคุณจะขึ้น production ได้ เราจัดรอบทดสอบให้ด้วยคนจริง และคุณติดตามได้ทุกวันจากแดชบอร์ดเดียว",
    ctaSignedOut: "เริ่มต้นใช้งาน",
    ctaSignedIn: "เพิ่ม App ใหม่",
    ctaSecondary: "ดูขั้นตอนการใช้งาน",
    stats: {
      testers: "Tester ตัวจริง ทุกวัน",
      days: "วันทดสอบต่อเนื่อง",
      policy: "ตรวจนโยบายด้วยทีมงาน",
    },
    preview: {
      appName: "แอปของฉัน",
      appStatus: "กำลังอยู่ในรอบทดสอบ",
      inProgress: "กำลังดำเนินการ",
      completed: "ทดสอบเสร็จแล้ว",
      current: "กำลังทดสอบ",
      scheduled: "รอถึงคิว",
      testersToday: "Tester วันนี้",
      active: "คน",
    },
    rule: {
      eyebrow: "ทำไมต้องมีบริการนี้",
      title: "กฎที่ทำให้นักพัฒนาหน้าใหม่ไปต่อไม่ได้",
      body: "ถ้าบัญชีนักพัฒนาแบบส่วนบุคคลของคุณสมัครหลังวันที่ 13 พฤศจิกายน 2023 Play จะยังไม่เปิดแท็บ production ให้เลย จนกว่ารอบ closed testing จะครบตามกำหนด",
      cards: [
        {
          title: "Tester 12 คนที่กด opt-in",
          body: "ไม่ใช่แค่ยอดติดตั้ง แต่ต้องเป็นคนที่เข้าร่วม track ผ่านลิงก์ opt-in และอยู่ในรอบตลอด",
        },
        {
          title: "ต่อเนื่อง 14 วัน",
          body: "ถ้า track เงียบไปหรือจำนวน Tester หลุดเกณฑ์ ระบบจะเริ่มนับใหม่",
        },
        {
          title: "ไม่มีทางลัด",
          body: "ฟาร์มอีมูเลเตอร์และบัญชีเวียนใช้จะถูกจับได้ Tester ของเราคือคนจริงบนเครื่องจริง",
        },
        {
          title: "มีแบบฟอร์มตอนจบ",
          body: "Play จะถามว่าคุณได้อะไรจากการทดสอบ เราส่งคำตอบที่ตรงกับรอบทดสอบจริงของคุณให้",
        },
      ],
    },
    how: {
      eyebrow: "ขั้นตอนการใช้งาน",
      title: "3 ขั้นตอน เรียงตามนี้",
      body: "เข้าสู่ระบบแล้วระบบจะพาทำทีละขั้น ไม่ต้องเดาว่าต้องทำอะไรต่อ",
      step: "ขั้นที่",
      cards: [
        {
          title: "เปิดใช้งานแอป",
          body: "ซื้อแพ็กเกจเพื่อเริ่มต้น หรือกรอกรหัสที่มีอยู่แล้วก็ได้ หนึ่งรายการใช้ได้กับหนึ่งแอปตลอดรอบ 14 วัน",
          detail: "ชำระเงินปลอดภัย ใช้งานได้ทันที",
        },
        {
          title: "เตรียม track ของคุณ",
          body: "เราพาไล่ทีละหน้าจอใน Play Console ทั้งเปิด track ให้ครบทุกประเทศ เพิ่มกลุ่ม Tester ของเรา และส่งการเปลี่ยนแปลงให้ Google รีวิว",
          detail: "มีภาพประกอบทุกขั้นตอน",
        },
        {
          title: "ดู 14 วันเดินไปทีละวัน",
          body: "Tester จริง 12+ คนเปิดใช้แอปคุณทุกวัน แดชบอร์ดบอกชัดว่าตอนนี้วันที่เท่าไร และขั้นต่อไปคืออะไร",
          detail: "ได้คำตอบแบบฟอร์มก่อนวันสุดท้าย",
        },
      ],
    },
    included: {
      eyebrow: "สิ่งที่คุณได้รับ",
      title: "ครบทุกอย่างที่รอบทดสอบต้องใช้",
      body: "ทีมเดียวดูแลทั้งการทดสอบ ตรวจ track ให้ตรงนโยบาย Play และส่งเอกสารให้คุณตอนจบ",
      timelineTitle: "กิจกรรมรายวัน",
      note13: "วันที่ 13 — เราส่งคำตอบแบบฟอร์ม production เข้าอีเมลคุณ",
      note14: "วันที่ 14 — ส่งแบบฟอร์ม แล้วเลื่อนรีลีสขึ้น production",
    },
    pricingTeaser: {
      eyebrow: "ราคา",
      title: "หนึ่งแพ็กเกจ หนึ่งแอป",
      body: "ไม่มีระบบรายเดือน ซื้อแพ็กเกจครั้งเดียว แต่ละรายการใช้ได้กับรอบทดสอบ 14 วันเต็มหนึ่งรอบ",
      cta: "ดูแพ็กเกจทั้งหมด",
    },
    faq: {
      eyebrow: "คำถามที่พบบ่อย",
      title: "คำถามที่เราเจอทุกสัปดาห์",
      items: [
        {
          q: "Google Play กำหนดอะไรไว้บ้าง",
          a: "สำหรับบัญชีนักพัฒนาแบบส่วนบุคคลที่สมัครหลัง 13 พฤศจิกายน 2023 Play กำหนดให้ทำ closed test โดยมี Tester ที่กด opt-in อย่างน้อย 12 คน และต้องต่อเนื่องอย่างน้อย 14 วัน ก่อนจะขอสิทธิ์ production ได้",
        },
        {
          q: "ต้องเผยแพร่แอปก่อนไหม",
          a: "คุณต้องมี track แบบ closed testing ที่มีรีลีสผ่านการรีวิวของ Google แล้ว และมีลิงก์ opt-in ให้ Tester ใช้ คู่มือตั้งค่าในระบบจะบอกว่าหาทั้งสองอย่างได้ตรงไหน",
        },
        {
          q: "แอปแบบเสียเงินทำได้ไหม",
          a: "ได้ครับ คุณสร้างโปรโมโค้ด 14 โค้ดใน Play Console ที่ Monetise → App pricing → Promo codes แล้วส่งมาให้เรา Tester จะติดตั้งได้โดยไม่ต้องจ่ายเงิน",
        },
        {
          q: "หลังครบ 14 วันแล้วยังไงต่อ",
          a: "เราส่งคำตอบสำหรับแบบฟอร์มขอสิทธิ์ production ให้ และอยู่กับคุณจนแอปขึ้นจริง การทดสอบจะนับก็ต่อเมื่อคุณเลื่อนรีลีสขึ้น production แล้ว จึงอย่าเพิ่งหยุด track ก่อน",
        },
        {
          q: "Tester จะรีวิวหรือให้ดาวไหม",
          a: "ไม่ครับ Tester แค่ใช้งานแอปเพื่อให้ครบเงื่อนไข คะแนนและรีวิวใน track แบบปิดไม่แสดงต่อสาธารณะ และเราไม่ยุ่งกับหน้า store listing ของคุณ",
        },
        {
          q: "ต้องให้สิทธิ์เข้า Play Console ไหม",
          a: "ไม่ต้องเลย คุณแค่เพิ่ม Google Group ของเราเป็น Tester ใน track ของคุณเอง นั่นคือสิ่งเดียวที่เราต้องการ",
        },
      ],
    },
    cta: {
      title: "เริ่มนับ 14 วันได้ตั้งแต่วันนี้",
      body: "เข้าสู่ระบบด้วย Google ทำตามคู่มือตั้งค่า แล้วรอบทดสอบของคุณเริ่มได้ภายในสัปดาห์นี้",
      buttonSignedOut: "เริ่มใช้งาน",
      buttonSignedIn: "ไปที่แอปของฉัน",
    },
  },

  login: {
    cardTitle: "Log in ด้วย Google",
    button: "Log in ด้วย Google",
    signingIn: "กำลังพาไปหน้า Google…",
    errorExpired:
      "ลิงก์เข้าสู่ระบบหมดอายุหรือถูกใช้ไปแล้ว กรุณาลองใหม่อีกครั้ง",
    errorGeneric: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },

  dashboard: {
    title: "แอปของฉัน",
    emptySubtitle: "แอปที่คุณส่งเข้าทดสอบและรอบ 14 วันจะอยู่ที่นี่",
    countOne: "แอป",
    countMany: "แอป",
    inProgress: "กำลังทดสอบ",
    needAttention: "รอคุณดำเนินการ",
    loadError:
      "โหลดรายการแอปไม่สำเร็จ ถ้าเพิ่งติดตั้งครั้งแรก กรุณารันไฟล์ SQL ใน supabase/migrations กับโปรเจกต์ของคุณก่อน",
    emptyTitle: "ยังไม่มีแอป",
    testingProgress: "ความคืบหน้าการทดสอบ",
    subtitleDraft: "ฉบับร่าง — เปิดใช้งานแอปนี้",
    subtitleSetup: "ตั้งค่าใน Play Console ให้เสร็จ",
    subtitleSetupConfirmed: "ยืนยันการตั้งค่าแล้ว — รอทีมงานตรวจสอบ",
    subtitleCancelled: "ยกเลิกแล้ว",
    subtitleRunning: "อยู่ในรอบทดสอบ",
    actionActivate: "เปิดใช้งานด้วย Token",
    actionView: "ดูรายละเอียด",
  },

  status: {
    draft: "ฉบับร่าง",
    awaiting_setup: "ต้องตั้งค่า",
    in_progress: "กำลังทดสอบ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  },

  wizard: {
    title: "เพิ่ม App ใหม่",
    step: "ขั้นที่",
    stepOf: "จาก",
    steps: [
      { title: "เปิดใช้งาน", caption: "ซื้อแพ็คเก็ต / กรอก Token" },
      { title: "ก่อนเริ่มต้น", caption: "เตรียม track ใน Play Console" },
      { title: "ข้อมูลแอป", caption: "บอกเราว่าจะทดสอบอะไร" },
    ],
    step1: {
      title: "เปิดใช้งานแอปของคุณ",
      body: "หนึ่ง Token ใช้กับหนึ่งแอปตลอดรอบ 14 วัน",
      cardTitle: "กรอก Token ของคุณ",
      checking: "กำลังตรวจสอบ…",
      valid: "Token ถูกต้อง — ไปกรอกข้อมูลแอปต่อได้เลย",
      noTokenTitle: "ยังไม่มี Token?",
      noTokenCta: "ซื้อแพ็กเกจ",
      questions: "มีคำถาม?",
      tokensAvailableOne:
        "คุณมี Token ที่ยังไม่ใช้ **1** อัน — กรอกให้แล้วด้านล่าง",
      tokensAvailableMany:
        "คุณมี Token ที่ยังไม่ใช้ **{count}** อัน — กรอกให้ 1 อันด้านล่างแล้ว",
      viewTokens: "ดู Token ทั้งหมดของฉัน",
    },
    step2: {
      title: "ก่อนเริ่มต้น",
      body: "ทำใน Play Console ให้เรียบร้อยก่อน รอบทดสอบจะเริ่มไม่ได้จนกว่า track จะเปิดและ Tester ของเราเข้าร่วมแล้ว",
      question: "ยืนยันการตั้งค่า Play Console",
      hint: "ต้องทำขั้นตอนนี้ใน Play Console ให้เสร็จก่อน ถึงจะไปต่อได้",
      doneTitle: "ทำครบแล้ว",
      doneBody: "เปิดครบทุกประเทศ เพิ่มกลุ่ม Tester และส่งให้รีวิวเรียบร้อย",
    },
    step3: {
      title: "ข้อมูลแอป",
      body: "ขั้นสุดท้ายแล้ว ขอแค่ 4 อย่าง",
      appName: "ชื่อแอป",
      appNamePlaceholder: "เช่น My Amazing App",
      contactEmail: "อีเมลติดต่อ",
      optInUrl: "ลิงก์ opt-in สำหรับ Tester / ลิงก์ Play Store",
      optInHintToggle: "หาลิงก์นี้ได้จากไหน",
      optInHint:
        "Play Console → Test and release → Testing → Closed testing → track ของคุณ → **How testers join your test** → คัดลอกลิงก์",
      appType: "ประเภทแอป",
      freeTitle: "แอปฟรี",
      freeBody: "Tester ติดตั้งจากลิงก์ opt-in ได้เลย",
      paidTitle: "แอปเสียเงิน",
      paidBody: "ส่งโปรโมโค้ด 14 โค้ดมาให้เรา เพื่อให้ Tester ติดตั้งได้",
      summary: "สรุปข้อมูล",
      summaryToken: "Token",
      summarySetup: "การตั้งค่า Play Console",
      setupDone: "ทำครบแล้ว",
      submit: "ยืนยันการส่งแอป",
      submitting: "กำลังส่ง…",
    },
  },

  setupGuide: {
    beforeYouBegin: "ก่อนเริ่มต้น",
    introTitle: "เปิดแดชบอร์ด Play Console ของคุณ",
    intro1: "เข้าสู่ระบบ **Google Play Console** แล้วเลือกแอปที่ต้องการทดสอบ",
    intro2:
      "ไปที่ **Test and release** → **Testing** → **Closed testing** แล้วเปิด track ของคุณ",
    intro3:
      "เปิดแท็บนั้นค้างไว้ เพราะต้องคัดลอก **ลิงก์ opt-in** จากตรงนั้นในขั้นสุดท้าย",
    openConsole: "เปิด Play Console",
    groupEmail: "อีเมลกลุ่ม",
    steps: [
      {
        title: "ตั้งค่าประเทศ/ภูมิภาค",
        body: "ไปที่แท็บ **Countries/regions** กด **Add countries/regions** เลือก **All countries/regions** แล้วกด Save",
      },
      {
        title: "เพิ่มกลุ่ม Tester",
        body: "ในแท็บ **Testers** หัวข้อ 'Choose a testing method' ให้เลือก **Google Groups** กด 'Enter email address' แล้วใส่อีเมลกลุ่มด้านล่าง อย่าลืมกด 'Save changes'",
      },
      {
        title: "ตรวจสอบสถานะ track",
        body: "ตรวจว่า track เป็น **Active** และแอปอยู่ในสถานะ **Published** (In Review หรือ Approved) ที่ Advanced settings → App availability",
      },
      {
        title: "ตรวจครั้งสุดท้าย",
        body: "สุดท้ายอย่าลืมกดปุ่ม **Send changes for review** ที่ด้านบนหน้า Publishing overview **การทดสอบจะเริ่มหลัง Google รีวิวรอบแรกเท่านั้น**",
      },
    ],
  },

  setupPage: {
    eyebrow: "Play Console",
    title: "คู่มือตั้งค่า",
    subtitle:
      "มี 4 จุดที่ต้องแก้ใน track แบบ closed testing เมื่อทำครบแล้วกดยืนยันด้านล่าง ทีมงานจะเริ่มรอบทดสอบให้",
    confirmed: "ยืนยันการตั้งค่าแล้ว",
    doneTitle: "ยืนยันการตั้งค่าแล้ว",
    doneBody: "ทีมงานกำลังตรวจ track ของคุณ และจะเริ่มรอบ 14 วันเร็ว ๆ นี้",
    askTitle: "ทำครบทั้ง 4 ขั้นแล้วหรือยัง",
    askBody: "กดยืนยันแล้วทีมงานจะตรวจ track ของคุณ ก่อนเริ่มนับวันที่ 1",
    button: "ฉันตั้งค่าเสร็จแล้ว",
    buttonDone: "ยืนยันการตั้งค่าแล้ว",
    buttonSaving: "กำลังบันทึก…",
  },

  guidePage: {
    eyebrow: "คู่มือสาธารณะ",
    title: "คู่มือตั้งค่า Play Console",
    subtitle:
      "ทุกอย่างที่ต้องทำก่อนเริ่มรอบ closed testing 14 วัน — ไม่ต้องเข้าสู่ระบบก็อ่านได้",
    cta: "เข้าสู่ระบบเพื่อส่งแอป",
  },

  appDetails: {
    welcomeTitle: "รับข้อมูลเรียบร้อยแล้ว",
    welcomeBody:
      "ทีมงานจะตรวจ track ของคุณแล้วเริ่มรอบ 14 วันจากตรงนี้ คุณจะเห็นวันที่ 1 ปรากฏในหน้านี้",
    draft: "ฉบับร่าง — เปิดใช้งานแอปนี้เพื่อเริ่มต้น",
    awaitingSetup: "ตั้งค่าใน Play Console ให้เสร็จเพื่อเริ่มต้น",
    cancelled: "รอบทดสอบนี้ถูกยกเลิกแล้ว",
    complete: "เสร็จแล้ว",
    activate: "เปิดใช้งานแอปนี้",
    openSetup: "เปิดคู่มือตั้งค่า",
    reviewSetup: "ดูคู่มือตั้งค่าอีกครั้ง",
    setupConfirmedTitle: "ยืนยันการตั้งค่าแล้ว",
    setupConfirmedBody:
      "ทีมงานกำลังตรวจ track ของคุณ และจะเริ่มรอบ 14 วันเร็ว ๆ นี้",
    testingProgress: "ความคืบหน้าการทดสอบ",
    started: "เริ่มเมื่อ",
    waitingStart: "รอทีมงานเริ่มรอบทดสอบ",
    dailyActivity: "กิจกรรมรายวัน",
    handledTitle: "ที่เหลือเราจัดการให้",
    handledBody:
      "ไม่ต้องกังวล ทีมงานดูแลทุกอย่างต่อหลังครบรอบ 14 วัน เรารับผิดชอบเรื่องสิทธิ์ production ให้เต็มที่ ทั้งส่งคำตอบแบบฟอร์มและแนะนำทุกขั้นตอนจนแอปขึ้นจริง",
    submission: "ข้อมูลที่ส่ง",
    appType: "ประเภทแอป",
    optInUrl: "ลิงก์ opt-in",
    contact: "อีเมลติดต่อ",
    setupStatus: "การตั้งค่า Play Console",
    setupYes: "ยืนยันแล้ว",
    setupNo: "ยังไม่ยืนยัน",
    freeApp: "แอปฟรี",
    paidApp: "แอปเสียเงิน",
    policyEyebrow: "ข้อจำกัดตามนโยบาย",
    policyLocked: "ล็อกอยู่",
    policyTitle: "วันของการทดสอบ",
    policyBody:
      "Google Play กำหนดให้ **ทดสอบต่อเนื่อง {days} วัน** ก่อนจะขอสิทธิ์ production ได้",
    complianceTitle: "ตรวจสอบด้วยตัวเอง",
    complianceBody:
      "อยากตรวจสอบเองว่าทุกอย่างทำงานปกติไหม? เข้าร่วมกลุ่มแล้วลองทดสอบดูได้เลย",
    joinTesting: "เข้าร่วมการทดสอบ",
    timeline: {
      ready: "เสร็จแล้ว",
      today: "วันนี้",
      locked: "ล็อกอยู่",
      formAnswersDay:
        "ใกล้เสร็จแล้ว — หลังทดสอบรอบสุดท้ายนี้ เราจะอีเมลคำตอบแบบฟอร์มขอสิทธิ์ production ให้คุณ",
      finalDay:
        "วันสุดท้าย — เช็กอีเมลเพื่อดูคำตอบแบบฟอร์มขอสิทธิ์ production แล้วส่งแบบฟอร์มของ Google และเลื่อนรีลีสขึ้น production",
      completedOn: "ทดสอบเสร็จแล้วเมื่อ {date}",
      completed: "ทดสอบเสร็จแล้ว",
      inProgressOn: "กำลังทดสอบของวันที่ {date}",
      inProgress: "กำลังทดสอบ",
      scheduledOn: "กำหนดทดสอบวันที่ {date}",
      notScheduled: "จะเริ่มนับเมื่อรอบทดสอบเริ่ม",
      teamUpdate: "อัปเดตจากทีมงาน:",
    },
    promo: {
      cta: "ส่งโปรโมโค้ด…",
      submittedNotice: "ส่งโปรโมโค้ดแล้ว — เราจะตรวจสอบแล้วเริ่มรอบทดสอบให้",
      modalTitle: "ส่งโปรโมโค้ด 14 โค้ด",
      modalBody:
        "เนื่องจากแอปของคุณเป็น **แบบเสียเงิน** กรุณาสร้างโปรโมโค้ด 14 โค้ดใน Play Console ที่ Monetize → App pricing → Promo codes แล้ววางด้านล่าง บรรทัดละ 1 โค้ด",
      placeholder: "PROMO-CODE-1\nPROMO-CODE-2\n…",
      submit: "ส่งโค้ด",
      submitting: "กำลังส่ง…",
      required: "กรุณาวางโปรโมโค้ดอย่างน้อย 1 โค้ด",
      statusLabel: "โปรโมโค้ด",
      yes: "ส่งแล้ว",
      no: "ยังไม่ได้ส่ง",
    },
  },

  messages: {
    title: "แจ้งปัญหา",
    subtitle: "มีปัญหาหรือคำถาม? ส่งข้อความถึงเรา แล้วเราจะตอบกลับที่นี่",
    placeholder: "อธิบายปัญหาของคุณ…",
    send: "ส่ง",
    sending: "กำลังส่ง…",
    required: "กรุณาพิมพ์ข้อความก่อน",
    you: "คุณ",
    team: "ทีมงาน",
    empty: "ยังไม่มีข้อความ",
  },

  activate: {
    title: "พร้อมเริ่มหรือยัง?",
    subtitle:
      "บันทึก **{name}** ไว้แล้ว กรอก Token เพื่อเริ่มรอบทดสอบ 14 วันได้เลย",
    cardTitle: "กรอก Token ของคุณ",
    cardBody: "หนึ่ง Token เปิดใช้งานได้หนึ่งแอป",
    tokenLabel: "รหัส Token",
    submit: "เปิดใช้งานด้วย Token",
    checking: "กำลังตรวจสอบ…",
    noTokenTitle: "ยังไม่มี Token?",
    noTokenCta: "ซื้อแพ็กเกจ",
    questions: "มีคำถาม?",
  },

  redeem: {
    title: "ใช้ Token",
    subtitle: "หนึ่ง Token เปิดใช้งานหนึ่งแอปตลอดรอบ 14 วัน",
    yourToken: "Token ของคุณ",
    newTitle: "ส่งแอปใหม่",
    newBody:
      "ระบบจะพาคุณตั้งค่า Play Console รับ Token แล้วกรอกข้อมูลแอปทีละขั้น",
    newCta: "เริ่มส่งแอป",
    existingTitle: "หรือเปิดใช้งานแอปที่ส่งไว้แล้ว",
    notActivated: "ยังไม่เปิดใช้งาน",
  },

  pricing: {
    eyebrow: "แพ็กเกจและราคา",
    popular: "ยอดนิยม",
    appsOne: "แอป",
    appsMany: "แอป",
    buy: "ซื้อเลย",
    buying: "กำลังเปิดหน้าชำระเงิน…",
    signInToBuy: "เข้าสู่ระบบเพื่อซื้อ",
    everyPackage: "ทุกแพ็กเกจได้รับ",
  },

  checkout: {
    successTitle: "ชำระเงินสำเร็จ",
    successBody:
      "ขอบคุณครับ Token ของคุณพร้อมใช้งานแล้ว หนึ่ง Token เปิดใช้งานได้หนึ่งแอป",
    tokensTitle: "Token ของคุณ",
    tokensHint: 'เก็บรหัสนี้ไว้ให้ดี ดูย้อนหลังได้ตลอดที่หน้า "ใช้ Token"',
    useNow: "ใช้ Token ตอนนี้",
    backToApps: "กลับไปที่แอปของฉัน",
    pending: "เรากำลังยืนยันการชำระเงิน กรุณารีเฟรชอีกครั้งในอีกสักครู่",
    failedTitle: "ยังชำระเงินไม่สำเร็จ",
    failedBody:
      "บัตรของคุณยังไม่ถูกตัด หรือคุณยกเลิกการชำระเงินไป ลองใหม่ได้จากหน้าแพ็กเกจ",
    backToPricing: "กลับไปหน้าแพ็กเกจ",
    cancelledTitle: "ยกเลิกการชำระเงิน",
    cancelledBody: "ยังไม่มีการตัดเงิน แพ็กเกจยังรออยู่เมื่อคุณพร้อม",
    orderSummary: "รายการสั่งซื้อ",
    unavailable:
      "ยังไม่ได้ตั้งค่าการชำระเงินด้วยบัตร กรุณาติดต่อเราเพื่อซื้อแพ็กเกจ",
  },

  settings: {
    title: "ตั้งค่า",
    subtitle: "บัญชีของคุณ และข้อมูลที่ต้องใช้ใน Play Console",
    signedInAs: "เข้าสู่ระบบในชื่อ",
    adminTitle: "หน้าผู้ดูแลระบบ",
    adminBody: "จัดการแอปที่ส่งเข้ามา รอบทดสอบ Token แพ็กเกจ และการตั้งค่าเว็บ",
    adminLink: "เปิดหน้าผู้ดูแลระบบ",
    groupTitle: "กลุ่ม Tester",
    groupBody:
      "เพิ่ม Google Group นี้ในแท็บ Testers ของ track แบบ closed testing ของคุณ",
    openGroup: "เปิดกลุ่ม",
    plansTitle: "แพ็กเกจ",
    plansBody: "ทุกแอปต้องใช้ Token ของตัวเอง ดูว่าแต่ละแพ็กเกจได้อะไรบ้าง",
    plansLink: "แพ็กเกจและราคา",
    languageTitle: "ภาษา",
    languageBody: "เลือกภาษาที่ใช้แสดงทั้งเว็บไซต์",
  },

  tokenErrors: {
    invalid: "ไม่พบ Token นี้ในระบบ กรุณาตรวจตัวสะกดแล้วลองใหม่",
    used: "Token นี้ถูกใช้กับแอปอื่นไปแล้ว",
    void: "Token นี้ถูกยกเลิกแล้ว กรุณาติดต่อเราเพื่อแก้ไข",
    tooShort: "กรุณากรอก Token ที่ได้รับหลังชำระเงิน",
    missingSetup:
      "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าระบบตรวจ Token กรุณารันไฟล์ SQL migration ล่าสุดแล้วลองใหม่",
    generic: "ตรวจสอบ Token ไม่สำเร็จ กรุณาลองใหม่",
    signIn: "กรุณาเข้าสู่ระบบอีกครั้ง",
  },

  formErrors: {
    name: "กรุณากรอกชื่อแอป",
    type: "กรุณาเลือกว่าแอปเป็นแบบฟรีหรือเสียเงิน",
    url: "กรุณากรอกลิงก์ opt-in หรือลิงก์ Play Store ที่ถูกต้อง",
    email: "กรุณากรอกอีเมลติดต่อที่ถูกต้อง",
    save: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่",
    tokenFirst: "กรุณากรอก Token ก่อน",
  },

  copy: {
    clickToCopy: "คลิกเพื่อคัดลอก",
    copied: "คัดลอกแล้ว",
  },

  plan: {
    features: [
      "การันตีได้สิทธิ์ Production",
      "Tester จริง 12+ คนใช้งานแอปคุณทุกวันตลอด 14 วัน",
      "ส่งมอบ Tester จริง 12 คน",
      "มีการใช้งานจริงทุกวัน",
      "ทีมงานดูแลให้ทั้งหมด",
      "รับประกันคืนเงิน",
    ],
    name: "แพ็กเกจ Pro",
    tagline: "การันตีสิทธิ์ Production",
    badge: "Testers Pro",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, th };

export type Dict = Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
