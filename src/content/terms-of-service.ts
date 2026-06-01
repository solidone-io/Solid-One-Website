import type { LegalBlock } from "@/content/privacy-policy";

export const TERMS_OF_SERVICE_META = {
  title: "TERMS OF SERVICE",
  effectiveDate: "28 May 2026",
  lastUpdated: "28 May 2026",
};

export const TERMS_OF_SERVICE_BLOCKS: LegalBlock[] = [
  { type: "h2", text: "1. Introduction" },
  {
    type: "p",
    text: '1.1 These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and Glider Web3 Solution Pvt. Ltd. ("Solid One", "Company", "we", "our", or "us") governing your access to and use of the Solid One platform, including its mobile applications, wallet interface, website, APIs, software, blockchain integrations, and related services (collectively, the "Services").',
  },
  {
    type: "p",
    text: "1.2 By accessing, downloading, installing, or using the Services in any manner, you acknowledge that you have read, understood, and agreed to be bound by these Terms together with our Privacy Policy and any additional policies published by us from time to time.",
  },
  {
    type: "p",
    text: "1.3 If you do not agree to these Terms, you must immediately discontinue use of the Services.",
  },

  { type: "h2", text: "2. Eligibility" },
  {
    type: "p",
    text: "2.1 You may use the Services only if you are at least eighteen (18) years of age or the legal age of majority in your jurisdiction and are legally capable of entering into a binding agreement under applicable law.",
  },
  {
    type: "p",
    text: "2.2 You represent and warrant that your use of the Services does not violate any law, regulation, sanction, or restriction applicable in your jurisdiction.",
  },
  {
    type: "p",
    text: "2.3 You further represent that you are not located in, organised under the laws of, or ordinarily resident in any jurisdiction subject to sanctions or restrictions imposed by India, OFAC, FATF, the European Union, the United Nations, or any other competent regulatory authority.",
  },
  {
    type: "p",
    text: "2.4 We reserve the right to restrict, suspend, or terminate access to the Services where required by law or where we reasonably believe that a user may be violating these Terms or applicable regulations.",
  },

  { type: "h2", text: "3. Nature of the Services" },
  {
    type: "p",
    text: "3.1 Solid One operates as a non-custodial Web3 wallet and blockchain technology interface primarily designed for interaction with decentralised blockchain networks, digital assets, smart contracts, decentralised applications, and third-party infrastructure providers.",
  },
  {
    type: "p",
    text: "3.2 The Services may include wallet management, crypto transfers, token swaps, contact-based transfers, scan-and-pay functionality, blockchain data display, portfolio tracking, and integrations with third-party protocols or APIs.",
  },
  {
    type: "p",
    text: "3.3 The Services are provided solely as a technology platform and interface. Nothing contained within the Services constitutes investment advice, legal advice, tax advice, financial advice, brokerage services, custodial services, banking services, or fiduciary services.",
  },

  { type: "h2", text: "4. Non-Custodial Nature of the Platform" },
  {
    type: "p",
    text: "4.1 Solid One is strictly a non-custodial platform. We do not hold, access, control, possess, manage, or store your digital assets, private keys, seed phrases, passwords, or wallet credentials at any time.",
  },
  {
    type: "p",
    text: "4.2 Your wallet credentials remain solely under your ownership and control. You are exclusively responsible for maintaining the confidentiality and security of your recovery phrase, private keys, device security, authentication credentials, and wallet access.",
  },
  {
    type: "p",
    text: "4.3 Blockchain transactions are irreversible by nature. Solid One cannot reverse, recover, cancel, freeze, or modify any blockchain transaction after submission.",
  },
  {
    type: "p",
    text: "4.4 You acknowledge that loss of wallet credentials or compromise of your device may result in permanent and unrecoverable loss of digital assets, and Solid One shall bear no responsibility or liability for such loss.",
  },

  { type: "h2", text: "5. Permissions and Limited Device Access" },
  {
    type: "p",
    text: "5.1 In order to provide intended platform functionality and improve user experience, the Services may request access to certain device permissions and limited technical information.",
  },
  {
    type: "p",
    text: "5.2 The Services may access approximate location or regional information solely for regional optimisation, jurisdictional compliance, fraud prevention, transaction routing, and enhancement of platform functionality. We do not use location data for advertising, behavioural profiling, or unauthorised surveillance purposes.",
  },
  {
    type: "p",
    text: "5.3 If enabled by you, the Services may access selected contact information stored on your device solely for facilitating contact-based crypto transfers, wallet discovery features, payment functionality, or username mapping.",
  },
  {
    type: "p",
    text: "5.4 Camera permissions may be requested solely for QR code scanning, scan-and-pay functionality, wallet verification, or compliance-related verification processes where legally required.",
  },
  {
    type: "p",
    text: "5.5 Notification permissions may be used to deliver transaction confirmations, security alerts, login activity notifications, protocol updates, payment requests, and other operational communications related to the Services.",
  },
  {
    type: "p",
    text: "5.6 You may disable or revoke device permissions through your device settings at any time; however, certain features or functionality of the Services may become limited or unavailable as a result.",
  },

  { type: "h2", text: "6. Public Blockchain Information" },
  {
    type: "p",
    text: "6.1 You acknowledge that blockchain networks operate on public and transparent distributed ledgers.",
  },
  {
    type: "p",
    text: "6.2 Wallet addresses, transaction hashes, token balances, smart contract interactions, and related blockchain metadata may be publicly visible and accessible through blockchain explorers, decentralised networks, and the Services.",
  },
  {
    type: "p",
    text: "6.3 Solid One does not claim ownership over publicly available blockchain information and does not treat inherently public blockchain data as confidential information.",
  },

  { type: "h2", text: "7. Data Collection and Privacy" },
  {
    type: "p",
    text: "7.1 We are committed to minimising data collection and processing only such information as is reasonably necessary to operate, secure, maintain, improve, and provide the Services.",
  },
  {
    type: "p",
    text: "7.2 We may process limited technical information including device identifiers, browser information, wallet interaction logs, IP addresses, security diagnostics, crash analytics, and transaction metadata for cybersecurity, fraud prevention, compliance, infrastructure integrity, and operational reliability purposes.",
  },
  {
    type: "p",
    text: "7.3 Solid One does not sell, rent, or commercially exploit user personal information for advertising purposes.",
  },
  {
    type: "p",
    text: "7.4 Any collection, storage, or processing of information shall be governed in accordance with our Privacy Policy and applicable laws.",
  },

  { type: "h2", text: "8. User Responsibilities" },
  {
    type: "p",
    text: "8.1 You are solely responsible for ensuring the security of your wallet, recovery phrase, devices, and digital assets.",
  },
  {
    type: "p",
    text: "8.2 You agree to use the Services only in compliance with applicable laws and regulations.",
  },
  {
    type: "p",
    text: "8.3 You shall not use the Services for unlawful activities including money laundering, terrorism financing, sanctions evasion, fraud, market manipulation, or any activity prohibited by applicable law.",
  },
  {
    type: "p",
    text: "8.4 You further agree not to interfere with the operation of the Services, exploit vulnerabilities, use automated bots, reverse engineer platform infrastructure, or attempt unauthorised access to systems or user data.",
  },

  { type: "h2", text: "9. Third-Party Services" },
  {
    type: "p",
    text: "9.1 The Services may integrate with or provide access to third-party protocols, decentralised applications, APIs, liquidity providers, payment infrastructure providers, blockchain services, bridges, or RPC infrastructure that are not owned or controlled by Solid One.",
  },
  {
    type: "p",
    text: "9.2 We make no warranties or representations regarding the legality, availability, security, reliability, performance, or accuracy of any third-party service.",
  },
  {
    type: "p",
    text: "9.3 Your interactions with third-party services are undertaken entirely at your own risk and may additionally be subject to separate terms and privacy policies imposed by such third parties.",
  },

  { type: "h2", text: "10. Risks of Blockchain Technology" },
  {
    type: "p",
    text: "10.1 You acknowledge and accept the inherent risks associated with blockchain technology, decentralised finance, and digital assets.",
  },
  {
    type: "p",
    text: "10.2 Such risks may include market volatility, smart contract vulnerabilities, protocol exploits, governance failures, hacking incidents, cybersecurity attacks, blockchain forks, software bugs, network congestion, liquidity failures, regulatory uncertainty, and total loss of value of digital assets.",
  },
  {
    type: "p",
    text: "10.3 You understand that digital asset transactions are irreversible and that blockchain technologies may involve significant financial risk.",
  },

  { type: "h2", text: "11. Disclaimer of Warranties" },
  {
    type: "p",
    text: '11.1 The Services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise.',
  },
  {
    type: "p",
    text: "11.2 To the fullest extent permitted under applicable law, Solid One disclaims all warranties relating to merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, reliability, accuracy, and security of the Services.",
  },
  {
    type: "p",
    text: "11.3 We do not guarantee that the Services will be uninterrupted, error-free, secure, or free from vulnerabilities or harmful components.",
  },

  { type: "h2", text: "12. Limitation of Liability" },
  {
    type: "p",
    text: "12.1 To the fullest extent permitted under applicable law, Solid One, Glider Web3 Solution Pvt. Ltd., its affiliates, employees, founders, licensors, contractors, and partners shall not be liable for any indirect, incidental, consequential, punitive, exemplary, or special damages arising out of or relating to the use of the Services.",
  },
  {
    type: "p",
    text: "12.2 This limitation includes, without limitation, loss of digital assets, loss of profits, trading losses, data loss, protocol failures, unauthorised wallet access, smart contract exploits, blockchain failures, or third-party misconduct.",
  },
  {
    type: "p",
    text: "12.3 Your use of the Services is entirely at your own risk.",
  },

  { type: "h2", text: "13. Indemnification" },
  {
    type: "p",
    text: "13.1 You agree to indemnify, defend, and hold harmless Solid One and its affiliates, employees, directors, officers, contractors, licensors, and partners from and against any claims, liabilities, damages, losses, costs, or expenses arising from your use of the Services, your violation of these Terms, or your violation of applicable law or third-party rights.",
  },

  { type: "h2", text: "14. Intellectual Property" },
  {
    type: "p",
    text: "14.1 All intellectual property rights relating to the Services, including software, source code, interfaces, branding, graphics, trademarks, and platform designs, are owned by or licensed to Glider Web3 Solution Pvt. Ltd.",
  },
  {
    type: "p",
    text: "14.2 No rights or licenses are granted except as expressly stated in these Terms.",
  },
  {
    type: "p",
    text: "14.3 You may not copy, reproduce, distribute, modify, reverse engineer, exploit, or create derivative works from the Services without prior written permission from the Company.",
  },

  { type: "h2", text: "15. Governing Law and Dispute Resolution" },
  {
    type: "p",
    text: "15.1 These Terms shall be governed by and construed in accordance with the laws of the Republic of India.",
  },
  {
    type: "p",
    text: "15.2 Any dispute arising out of or relating to these Terms or the Services shall first be attempted to be resolved amicably.",
  },
  {
    type: "p",
    text: "15.3 If unresolved, such disputes shall be finally resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.",
  },
  {
    type: "p",
    text: "15.4 The seat and venue of arbitration shall be in India, the proceedings shall be conducted in the English language, and the decision of the arbitrator shall be final and binding.",
  },

  { type: "h2", text: "16. Modifications to the Services and Terms" },
  {
    type: "p",
    text: "16.1 Solid One reserves the right to modify, suspend, discontinue, or update the Services or these Terms at any time without prior notice.",
  },
  {
    type: "p",
    text: "16.2 Continued use of the Services following any modification constitutes your acceptance of the revised Terms.",
  },

  { type: "h2", text: "17. Force Majeure" },
  {
    type: "p",
    text: "17.1 Solid One shall not be liable for any delay, interruption, and failure in performance arising from causes beyond its reasonable control, including blockchain failures, cyberattacks, governmental actions, internet outages, natural disasters, wars, or failures of third-party infrastructure providers.",
  },

  { type: "h2", text: "18. Contact Information" },
  {
    type: "p",
    text: "18.1 For legal inquiries, compliance concerns, or support requests, you may contact:",
  },
];

export const TERMS_OF_SERVICE_CLOSING =
  "18.2 By continuing to access or use the Services, you confirm that you have read, understood, and agreed to these Terms of Service.";
