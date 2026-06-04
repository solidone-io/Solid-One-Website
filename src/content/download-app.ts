import appIcon from "@/assets/solid-one-app-icon.png";
import downloadScreenshot1 from "@/assets/download-screenshot-1.png";
import downloadScreenshot2 from "@/assets/download-screenshot-2.png";
import downloadScreenshot3 from "@/assets/download-screenshot-3.png";
import downloadScreenshot4 from "@/assets/download-screenshot-4.png";
import downloadScreenshot5 from "@/assets/download-screenshot-5.png";
import downloadScreenshot6 from "@/assets/download-screenshot-6.png";
import downloadScreenshot7 from "@/assets/download-screenshot-7.png";

export const DOWNLOAD_APP = {
  icon: appIcon,
  screenshots: [
    { src: downloadScreenshot1, alt: "Solid One — True Ownership" },
    { src: downloadScreenshot2, alt: "Solid One — Tokenized Assets" },
    { src: downloadScreenshot3, alt: "Solid One — AI That Executes" },
    { src: downloadScreenshot4, alt: "Solid One — Everything You Own" },
    { src: downloadScreenshot5, alt: "Solid One — Swap Solana to USDC" },
    { src: downloadScreenshot6, alt: "Solid One — True Ownership. Total Security." },
    { src: downloadScreenshot7, alt: "Solid One — One Wallet. For Everything." },
  ] as const,
  name: "Solid One",
  fullName: "Solid One: One App. Infinite Possibilities.",
  shortName: "Solid One",
  developer: "Glider Web3 Solutions Limited",
  heroTags: ["Finance", "Crypto Utility"] as const,
  shortAbout:
    "Solid One is the crypto utility app that turns your Solana wallet into everyday life: pay people, book travel, recharge phones, track credit, and move money with clarity and control.",
  fullAbout: `Most wallets stop at send and receive. Solid One is built for what you actually do with money. You hold SOL, stablecoins, and SPL tokens in one place, see clear balances and history, and sign every important action on your own device so nothing moves without you.

When you are out, scan and pay at merchants in seconds. At home, pay contacts by name or phone, request money from friends, split a dinner, or review an incoming payment before you tap approve. Each request shows who is asking, how much, and why, so you are never guessing what you just allowed.

Planning a trip? Search and book flights and hotels inside the app, with totals shown up front before you commit. Need to top up a phone for yourself or family? Mobile recharge is there when you need it, with receipts saved next to your other activity. Where bill pay is available, you can handle routine payments and keep everything in one timeline instead of jumping between apps.

Your credit score is part of the picture too. Solid One helps you check where you stand, watch changes over time, and understand what may help or hurt your profile when you are planning something bigger.

Behind the scenes, an AI assistant can carry out tasks in plain language: send to a contact, swap tokens, pay a bill, or start a booking without digging through menus. You still review and confirm each step. The app stays non custodial. Your keys remain on your phone, we do not custody your funds, and the stack is backed by open source contracts and audited infrastructure.

Solid One is one app for wallet, payments, travel, recharge, credit, and daily spending on Solana. Install to explore what is available now and what is coming next.

Learn more on our website at solidone.io. For product questions, partnerships, or operations support, contact us at operations@solidone.io.`,
  categories: ["Finance", "Cryptocurrency", "DeFi"],
  playStoreUrl: "/play-store",
  dataSafety: `Solid One is designed so you understand what happens with your information. This summary describes how the app and this download page handle data. Details may vary by app version, feature availability, and country.

What we protect
Connections to our services use encryption in transit. Sensitive data stored on our systems is protected with industry standard safeguards. We review access controls and monitoring so only authorized systems and staff can reach operational data, and only when needed to run the service.

What the app needs to work
To provide wallet, payments, travel, recharge, credit, and support features, the app may process account identifiers, transaction history, device type, app version, and information you enter such as contact details for payments, booking details for flights or hotels, recharge numbers, or credit profile data where you opt in. Payment and approval flows show you what will be shared before you confirm.

What we do not do
We do not sell your personal information. We do not use your data for third party advertising profiles. Private keys, seed phrases, and recovery material are not stored on Solid One servers. We cannot recover your wallet if you lose your credentials because we never hold them.

Sharing with others
Some features rely on partners such as payment networks, travel suppliers, recharge providers, or credit bureaus. Those partners receive only what is required to complete the service you requested. We require them to handle data under contract and applicable law. We do not allow partners to use your Solid One data for their own unrelated marketing.

This download page
If you sign in here with Google, we receive basic profile details to verify your account for ratings and install counts. That sign in is separate from your on chain wallet identity. You can sign out at any time from this page.

Your choices
You may request access, correction, or deletion of personal data we hold about you, subject to legal and operational limits such as fraud prevention or record keeping. You can manage permissions in your device settings and uninstall the app to stop new collection from the application.

Updates
Our practices may change as features expand. We will update this notice and the in app privacy policy when material changes occur. Security and data practices may also differ slightly by region or platform.

For the full legal terms, see the Privacy Policy on solidone.io.`,
};
