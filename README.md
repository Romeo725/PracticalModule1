# Romeo Mangena - Personal Developer Portfolio 🚀

A modern, responsive, and interactive personal website and developer portfolio built for **Romeo Mduduzi Mangena** (Java Developer & Web Creator).

## 💡 Features

- 🌓 **Dark & Light Mode Toggle**: Persists the theme when browser storage is available and follows system preference by default.
- ✨ **Scroll-Driven UI Effects**: Reading progress indicator, active section navigation, and reduced-motion-aware reveal animations.
- 🔎 **Mobile & Skills Navigation**: Collapsible small-screen menu and searchable, category-filtered skills list.
- 💼 **Interactive Profile & Stats**: Animated count-up numbers respect reduced-motion preferences and have useful static values without JavaScript.
- 🧰 **CV-Based Experience & Education**: Summarizes professional roles, academic background, and selected academic honors.
- 🚀 **Featured Projects Grid**: Highlight section showing key Java backend and frontend web projects with tech stack pills.
- 🏷️ **Categorized Skills Filter**: Filter skills across backend, frontend, data, tools/testing, and professional categories.
- ☕ **Support & Donations**: Account-holder information and downloadable PDF confirmation (`AccountConfirmationDocument.pdf`).
- 📄 **CV Integration**: Direct download and view link for `RomeoMduduziMangena.pdf`.
- 🔗 **Professional Profiles**: Quick links to GitHub and LinkedIn.
- 📋 **Toast Notifications**: Clipboard feedback for the contact email, with an accessible status announcement.
- ⬆️ **Smooth Scroll & Back-to-Top**: Floating back-to-top button for mobile and desktop user navigation.

## 📁 File Structure

```text
PracticalModule1/
├── index.html                      # Main HTML structure
├── style.css                       # Modern CSS styling, CSS variables & theme rules
├── script.js                       # Modular JavaScript functions
├── 616.jpg                         # Profile avatar image
├── RomeoMduduziMangena.pdf         # Downloadable CV document
├── UW_AD_UGF0_N.pdf                # Education document displayed in the education section
├── AccountConfirmationDocument.pdf # Downloadable Bank Confirmation document
├── whatsapp-bot/                   # WhatsApp Cloud API portfolio FAQ bot
├── render.yaml                     # Render backend service blueprint
└── README.md                       # Documentation
```

## 🌐 Running Locally

Simply open `index.html` in any modern web browser or run a lightweight local HTTP server (e.g., Live Server in VS Code/IntelliJ or `npx serve`).

## WhatsApp Chatbot Setup

The portfolio includes a WhatsApp link and a Node.js FAQ webhook for the WhatsApp Business Cloud API. The webhook replies to questions about Romeo's portfolio; it is not an AI model and does not store message history.

The website is hosted on GitHub Pages, so the webhook must run as a separate public backend. To deploy the included Render service:

1. Connect this repository to Render and deploy the `render.yaml` Blueprint.
2. Add the required environment variables in the Render dashboard. Use `whatsapp-bot/.env.example` as the key list; obtain the access token, app secret, and phone number ID from the Meta app. Set a private webhook verification token of your own and the current Graph API version supported by your Meta app.
3. In the Meta app's WhatsApp webhook settings, set the callback URL to `https://<your-render-service>.onrender.com/webhook`, enter the same verification token, and subscribe to the `messages` field.
4. Confirm the WhatsApp Business phone number connected to Meta is the number used by the website's `wa.me` link.

Keep all API credentials in Render's environment settings. Do not put them in the website JavaScript, commit them, or send them in chat. The Render free plan may sleep when idle, so an always-on plan is preferable for reliable webhook responses.

Run the backend tests with `cd whatsapp-bot && npm test`. To start locally, copy `.env.example` to `.env`, fill in the Meta values, then run `npm start`.
