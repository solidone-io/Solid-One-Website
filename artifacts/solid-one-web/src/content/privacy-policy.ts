export type LegalBlock = { type: "h2" | "p"; text: string };

export const PRIVACY_POLICY_META = {
  title: "PRIVACY POLICY",
  effectiveDate: "28 May 2026",
  lastUpdated: "28 May 2026",
};

export const PRIVACY_POLICY_BLOCKS: LegalBlock[] = [
  { type: "h2", text: "1. Introduction" },
  {
    type: "p",
    text: '1.1 This Privacy Policy ("Policy") explains how Glider Web3 Solution Pvt. Ltd. ("Solid One", "Company", "we", "our", or "us") collects, uses, stores, processes, discloses, and protects information when you access or use the Solid One platform, including its mobile applications, browser extension, wallet interface, website, application programming interfaces (APIs), software, smart contract integrations, blockchain connectivity tools, and any related products or services (collectively, the "Services").',
  },
  {
    type: "p",
    text: '1.2 This Policy applies to all users, visitors, and individuals who interact with the Services, whether or not you create an account, connect a wallet, or complete a transaction. It describes our practices in clear terms so you can make informed decisions about your use of Solid One.',
  },
  {
    type: "p",
    text: "1.3 By accessing, downloading, installing, registering for, or otherwise using the Services, you acknowledge that you have read, understood, and agreed to the collection and use of information in accordance with this Policy. If you do not agree, you must discontinue use of the Services.",
  },
  {
    type: "p",
    text: "1.4 This Policy forms an integral part of our Terms of Service and should be read together with all related legal notices, disclaimers, and policies published by us from time to time. Where this Policy conflicts with mandatory law in your jurisdiction, the mandatory provisions shall prevail to the extent of the conflict.",
  },
  {
    type: "p",
    text: "1.5 We may provide additional notices at the point of collection or within specific features (for example, when enabling permissions or connecting to third party services). Those notices supplement, and do not replace, this Policy.",
  },
  {
    type: "p",
    text: "1.6 The Services are intended for individuals who can form legally binding contracts and who are permitted to use digital asset technology under the laws that apply to them. You represent that you meet these requirements when you use Solid One.",
  },
  {
    type: "p",
    text: "1.7 We may update product features, supported networks, and integrated partners over time. This Policy applies to all current and future features unless a separate notice states otherwise for a specific product or region.",
  },

  { type: "h2", text: "2. Nature of the Platform" },
  {
    type: "p",
    text: "2.1 Solid One operates as a non custodial Web3 wallet and blockchain interface designed primarily for interaction with decentralised blockchain networks, digital assets, tokenised instruments, and related decentralised finance (DeFi) or payment functionality.",
  },
  {
    type: "p",
    text: "2.2 Because the Services are non custodial, you retain sole control over your wallet, cryptographic keys, and on chain activity. Solid One provides software that facilitates your interaction with blockchain networks; it does not act as a bank, custodian, broker, or financial intermediary holding user funds on your behalf.",
  },
  {
    type: "p",
    text: "2.3 Solid One does not store, control, possess, recover, or access your private keys, seed phrases, recovery phrases, passcodes, or other wallet credentials at any time. We cannot restore access to your wallet if you lose your credentials, and we will never ask you to share your seed phrase or private key.",
  },
  {
    type: "p",
    text: "2.4 All blockchain transactions initiated through the Services are broadcast to decentralised networks and validated according to the rules of those networks. Transaction finality, fees, and outcomes depend on network conditions and are outside our exclusive control.",
  },
  {
    type: "p",
    text: "2.5 You are solely responsible for reviewing transaction details, recipient addresses, network selection, token contracts, and smart contract interactions before confirming any action. Mistakes on irreversible blockchain networks may result in permanent loss.",
  },
  {
    type: "p",
    text: "2.6 Solid One may display market data, estimates, quotes, and educational content for convenience. Such information is not personalised financial, legal, or tax advice and may be delayed or incomplete.",
  },
  {
    type: "p",
    text: "2.7 We do not guarantee uninterrupted access to the Services. Maintenance, upgrades, network congestion, partner outages, or security events may temporarily affect availability.",
  },

  { type: "h2", text: "3. Information We Collect" },
  {
    type: "p",
    text: "3.1 We follow a data minimisation approach. We collect only information that is reasonably necessary to operate, secure, maintain, improve, and comply with legal obligations relating to the Services.",
  },
  {
    type: "p",
    text: "3.2 The categories of information we may collect include technical data, operational logs, diagnostic information, and publicly available blockchain related data associated with your use of the Services.",
  },
  { type: "p", text: "3.3 Depending on how you use the Services, such information may include:" },
  {
    type: "p",
    text: "a) Device identifiers, hardware model, device type, and technical device information;\n\nb) Browser type, language settings, operating system, application version, and general configuration data;\n\nc) Internet protocol (IP) addresses, connection timestamps, and network level metadata;\n\nd) Wallet interaction logs, session events, feature usage metrics, and transaction metadata (excluding private keys);\n\ne) Crash reports, error logs, diagnostics, and aggregated performance analytics;\n\nf) Public blockchain wallet addresses, transaction hashes, token balances, smart contract calls, and other on chain activity visible through public ledgers;\n\ng) Approximate regional or location information where reasonably necessary for regulatory compliance, sanctions screening, fraud prevention, regional feature availability, or service optimisation;\n\nh) Information you voluntarily provide when contacting support, submitting feedback, or participating in surveys or promotions.",
  },
  {
    type: "p",
    text: "3.4 We do not intentionally collect special categories of sensitive personal information (such as biometric templates used for unique identification, health data, or similar sensitive classes) unless required by applicable law or reasonably necessary for a specific security or compliance purpose disclosed at collection.",
  },
  {
    type: "p",
    text: "3.5 We do not store your private keys, seed phrases, passwords, or wallet recovery credentials. Any optional cloud backup or export features, if offered, will be described separately and may involve encryption or third party infrastructure subject to their own terms.",
  },
  {
    type: "p",
    text: "3.6 Information collected through cookies, local storage, or similar technologies on our website may include preferences and basic analytics. You may manage browser settings to limit certain technologies, though some site features may not function properly as a result.",
  },
  {
    type: "p",
    text: "3.7 We may create internal identifiers to associate technical events with a device or session. These identifiers are used for security and product analytics and are not sold as standalone data products.",
  },
  {
    type: "p",
    text: "3.8 If you participate in beta programmes, waitlists, or research interviews, we may collect the information you choose to submit, such as feedback, screenshots, or survey responses, under the terms presented at collection.",
  },
  {
    type: "p",
    text: "3.9 You should not submit confidential wallet recovery information through support channels, social media, or email. We will treat unsolicited credential material as a security risk and may delete it without review.",
  },

  { type: "h2", text: "4. Device Permissions" },
  {
    type: "p",
    text: "4.1 To deliver core and optional features, the mobile or desktop application may request certain permissions on your device. Permissions are requested only where relevant to the feature you use, and you may grant or deny them through your device operating system.",
  },
  {
    type: "p",
    text: "4.2 Location permissions, if requested, may be used for regional optimisation, determining feature availability, complying with jurisdictional restrictions, fraud prevention, routing of payment or on ramp services, and improving relevance of localised content. We do not use location for unrelated advertising profiles.",
  },
  {
    type: "p",
    text: "4.3 Contact permissions, if requested, may be used solely to enable contact based transfers, wallet discovery, payment requests, username or handle mapping, or similar social payment features you choose to activate within the Services.",
  },
  {
    type: "p",
    text: "4.4 Camera permissions, if requested, may be used for QR code scanning, scan and pay flows, wallet address capture, and identity or compliance verification where a regulated partner requires visual confirmation.",
  },
  {
    type: "p",
    text: "4.5 Notification permissions, if requested, may be used to deliver transaction confirmations, security alerts, payment requests, protocol or network notices, product updates, and other operational communications related to your account or device.",
  },
  {
    type: "p",
    text: "4.6 Clipboard access, storage access, or other system permissions may be used only where technically necessary for a described feature (for example, pasting an address you approve or caching non sensitive application data).",
  },
  {
    type: "p",
    text: "4.7 You may revoke permissions at any time through device settings. Revocation may disable or limit related features but will not affect information already processed in accordance with this Policy and applicable law.",
  },
  {
    type: "p",
    text: "4.8 Permission prompts are shown in context so you can understand why a feature requests access. We do not use permissions to collect information unrelated to the stated purpose.",
  },
  {
    type: "p",
    text: "4.9 On some platforms, you may grant one time or limited access. The operating system controls those options, and Solid One follows the platform rules available on your device.",
  },

  { type: "h2", text: "5. Public Blockchain Information" },
  {
    type: "p",
    text: "5.1 Blockchain networks are designed to be transparent. Transactions and balances are typically recorded on distributed ledgers that can be viewed by anyone with network access.",
  },
  {
    type: "p",
    text: "5.2 When you use Solid One, your public wallet addresses, transaction hashes, token transfers, smart contract interactions, and related metadata may be visible through blockchain explorers, indexers, validators, nodes, analytics providers, and other participants in the ecosystem.",
  },
  {
    type: "p",
    text: "5.3 We may read, display, cache, or index public on chain data to show balances, transaction history, prices, and protocol status within the interface. Such data is not treated as private personal information in the same manner as confidential off chain records.",
  },
  {
    type: "p",
    text: "5.4 Techniques that attempt to enhance privacy on chain (if you choose to use them) are subject to the limitations of the underlying protocol. We do not guarantee anonymity or unlinkability of wallet activity.",
  },
  {
    type: "p",
    text: "5.5 Public blockchain records may persist indefinitely and cannot be deleted or modified by Solid One once confirmed on chain.",
  },
  {
    type: "p",
    text: "5.6 Linking multiple public addresses to a single identity may be possible through external analytics. We do not guarantee that your on chain activity cannot be correlated by third parties.",
  },
  {
    type: "p",
    text: "5.7 If you use privacy enhancing tools or alternate networks, you remain responsible for understanding how those tools work and any trade offs they introduce.",
  },

  { type: "h2", text: "6. How We Use Information" },
  {
    type: "p",
    text: "6.1 We use collected information for legitimate purposes connected to providing and protecting the Services, including where necessary to perform our contract with you, comply with law, or pursue legitimate interests balanced against your rights.",
  },
  { type: "p", text: "6.2 Without limiting the foregoing, information may be used to:" },
  {
    type: "p",
    text: "a) Operate, maintain, and administer the Services, including wallet connectivity and transaction routing;\n\nb) Personalise and improve user experience, interface design, and feature performance;\n\nc) Monitor, detect, investigate, and prevent fraud, abuse, security incidents, and prohibited activity;\n\nd) Conduct risk scoring, anomaly detection, and integrity checks on infrastructure;\n\ne) Analyse aggregated usage trends to plan capacity, fix bugs, and develop new features;\n\nf) Comply with legal, regulatory, tax, sanctions, anti money laundering (AML), and know your customer (KYC) obligations where applicable;\n\ng) Respond to support enquiries, dispute notices, and technical troubleshooting requests;\n\nh) Send service related communications, including security warnings and policy updates;\n\ni) Enforce our Terms of Service and protect the rights, property, and safety of users, the Company, and the public.",
  },
  {
    type: "p",
    text: "6.3 We do not sell, rent, or lease your personal information to third parties for their independent advertising or marketing databases. We do not use your wallet activity to build unrelated commercial advertising profiles.",
  },
  {
    type: "p",
    text: "6.4 We may use de identified or aggregated information that cannot reasonably identify you for analytics, research, and product improvement.",
  },
  {
    type: "p",
    text: "6.5 We may record the fact that you accepted policies, completed onboarding steps, or enabled specific risk disclosures. This helps demonstrate compliance and improve clarity for users.",
  },
  {
    type: "p",
    text: "6.6 Automated systems may flag unusual activity for human review. Reviews are conducted for security and compliance and are not used to provide investment recommendations.",
  },

  { type: "h2", text: "7. Third-Party Services" },
  {
    type: "p",
    text: "7.1 The Services may contain links, integrations, or deep connections to third party protocols, decentralised applications (dApps), exchanges, liquidity pools, fiat on ramp or off ramp providers, RPC endpoints, analytics vendors, payment processors, identity verification partners, and other infrastructure.",
  },
  {
    type: "p",
    text: "7.2 When you interact with a third party through Solid One, that party may collect information directly from you or from your device according to its own privacy policy and terms. We encourage you to review third party policies before proceeding.",
  },
  {
    type: "p",
    text: "7.3 We may share limited technical information with service providers who assist us with hosting, content delivery, crash reporting, customer support tools, email delivery, or security monitoring, subject to contractual confidentiality and security obligations.",
  },
  {
    type: "p",
    text: "7.4 Solid One is not responsible for the availability, security, legality, or data practices of third party services. Your relationship with third parties is solely between you and them.",
  },
  {
    type: "p",
    text: "7.5 If we believe a third party integration poses material risk to users or the platform, we may suspend or remove the integration without prior notice.",
  },
  {
    type: "p",
    text: "7.6 Third party branding, names, and logos displayed in the interface do not imply endorsement of every product or statement made by that third party.",
  },
  {
    type: "p",
    text: "7.7 When you leave Solid One to open an external website or dApp, their collection practices apply from the moment you interact with their service.",
  },

  { type: "h2", text: "8. Data Retention" },
  {
    type: "p",
    text: "8.1 We retain information only for as long as reasonably necessary to fulfil the purposes described in this Policy, unless a longer retention period is required or permitted by law.",
  },
  {
    type: "p",
    text: "8.2 Retention periods may vary based on the type of data, the nature of your interaction with the Services, active investigations, dispute resolution, audit requirements, and regulatory obligations.",
  },
  {
    type: "p",
    text: "8.3 When information is no longer required, we will take reasonable steps to delete, anonymise, or aggregate it, subject to technical limitations and backup cycles.",
  },
  {
    type: "p",
    text: "8.4 Public blockchain data may remain permanently accessible on decentralised networks regardless of whether you stop using Solid One or request deletion of off chain records held by us.",
  },
  {
    type: "p",
    text: "8.5 Backup systems may retain residual copies for a limited period before being overwritten in the ordinary course of operations.",
  },
  {
    type: "p",
    text: "8.6 You may request information about off chain data we hold where applicable law provides such rights. Requests may require identity verification and may be declined where an exception applies.",
  },
  {
    type: "p",
    text: "8.7 Deletion of off chain records does not remove historical blockchain entries, which remain on public networks independent of Solid One.",
  },

  { type: "h2", text: "9. Data Security" },
  {
    type: "p",
    text: "9.1 We implement commercially reasonable technical, administrative, and organisational measures designed to protect information against unauthorised access, loss, misuse, alteration, or disclosure.",
  },
  {
    type: "p",
    text: "9.2 These measures may include access controls, encryption in transit where appropriate, network monitoring, secure development practices, employee confidentiality obligations, and vendor due diligence.",
  },
  {
    type: "p",
    text: "9.3 No method of transmission over the Internet or electronic storage is completely secure. Blockchain systems, smart contracts, and third party networks may contain vulnerabilities that are discovered over time.",
  },
  {
    type: "p",
    text: "9.4 You are responsible for securing your devices, operating systems, browsers, and wallet credentials. Use strong device passcodes, enable device encryption where available, and avoid sharing recovery phrases with anyone.",
  },
  {
    type: "p",
    text: "9.5 If we become aware of a security incident affecting information under our control, we may investigate and, where required by law, notify affected users or authorities in accordance with applicable regulations.",
  },
  {
    type: "p",
    text: "9.6 You should report suspected unauthorised access to your device or wallet immediately. Prompt action may reduce harm, but recovery of lost digital assets is often not possible.",
  },
  {
    type: "p",
    text: "9.7 We may temporarily restrict features during active investigations to protect users and infrastructure.",
  },

  { type: "h2", text: "10. Compliance and Legal Obligations" },
  {
    type: "p",
    text: "10.1 We may access, preserve, and disclose information where we reasonably believe doing so is necessary to comply with applicable laws, regulations, legal process, governmental or regulatory requests, court orders, or enforceable subpoenas.",
  },
  {
    type: "p",
    text: "10.2 We may also process or disclose information to establish, exercise, or defend legal claims; investigate violations of our terms; protect the safety of users and the public; or prevent fraud and security threats.",
  },
  {
    type: "p",
    text: "10.3 Where legally required for certain features, partners, or transaction types, we or our partners may request identity verification, proof of address, source of funds information, or other compliance documentation.",
  },
  {
    type: "p",
    text: "10.4 Failure to provide information reasonably requested for compliance purposes may result in delayed, restricted, or suspended access to some or all Services.",
  },
  {
    type: "p",
    text: "10.5 We may restrict access from jurisdictions where use of the Services or specific features is prohibited or where we are unable to meet regulatory requirements.",
  },
  {
    type: "p",
    text: "10.6 We cooperate with lawful requests in accordance with applicable procedure. We may challenge overbroad or improper requests where appropriate.",
  },
  {
    type: "p",
    text: "10.7 Sanctions and export control rules may require us to block certain regions, addresses, or transaction types. Automated screening tools may produce false positives that require user follow up.",
  },

  { type: "h2", text: "11. International Users" },
  {
    type: "p",
    text: "11.1 The Services may be accessed from many countries, but they are operated by Glider Web3 Solution Pvt. Ltd. in accordance with the laws of India, unless otherwise stated.",
  },
  {
    type: "p",
    text: "11.2 If you access the Services from outside India, you understand that your information may be transferred to, stored in, or processed in India or other countries where our service providers maintain facilities.",
  },
  {
    type: "p",
    text: "11.3 Data protection laws in those jurisdictions may differ from the laws of your residence. By using the Services, you consent to such transfer and processing to the extent permitted by applicable law.",
  },
  {
    type: "p",
    text: "11.4 You are responsible for ensuring that your use of the Services complies with local laws applicable to you, including restrictions on digital assets, payments, or financial technology.",
  },
  {
    type: "p",
    text: "11.5 If you are located in a region with specific data protection rights, you may have additional rights to access, correct, or object to certain processing. Contact us to discuss your request.",
  },
  {
    type: "p",
    text: "11.6 We will respond to valid requests within timeframes required by applicable law, subject to extensions permitted for complex cases.",
  },

  { type: "h2", text: "12. Children's Privacy" },
  {
    type: "p",
    text: "12.1 The Services are intended for individuals who are at least eighteen (18) years of age, or the age of legal majority in their jurisdiction, whichever is higher.",
  },
  {
    type: "p",
    text: "12.2 We do not knowingly solicit or collect personal information from children under the applicable minimum age.",
  },
  {
    type: "p",
    text: "12.3 If you believe we have inadvertently collected information from a minor without appropriate consent, please contact us promptly. Upon verification, we will take reasonable steps to delete such information from our systems.",
  },
  {
    type: "p",
    text: "12.4 Parents or guardians who become aware that a minor has used the Services should supervise device access and credential security to prevent unauthorised wallet activity.",
  },
  {
    type: "p",
    text: "12.5 Educational materials within the Services are not directed at children and should not be used as a substitute for parental guidance on financial technology.",
  },

  { type: "h2", text: "13. Limitation of Liability" },
  {
    type: "p",
    text: "13.1 To the fullest extent permitted by applicable law, Solid One, Glider Web3 Solution Pvt. Ltd., and their directors, officers, employees, contractors, and affiliates shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or related to this Policy or your use of the Services.",
  },
  {
    type: "p",
    text: "13.2 Without limiting the foregoing, we shall not be liable for damages arising from unauthorised access to systems, phishing or social engineering directed at users, smart contract exploits, blockchain reorganisations, third party service outages, or events beyond our reasonable control.",
  },
  {
    type: "p",
    text: "13.3 You acknowledge that digital assets and blockchain technologies involve inherent risks, including volatility, irreversibility of transactions, and evolving regulatory treatment.",
  },
  {
    type: "p",
    text: "13.4 Nothing in this Policy limits liability where such limitation is prohibited by mandatory applicable law.",
  },
  {
    type: "p",
    text: "13.5 Your sole remedy for dissatisfaction with privacy practices, to the extent permitted by law, is to discontinue use of the Services.",
  },

  { type: "h2", text: "14. Changes to this Privacy Policy" },
  {
    type: "p",
    text: "14.1 We may update this Policy from time to time to reflect changes in the Services, legal requirements, industry standards, or our data practices.",
  },
  {
    type: "p",
    text: "14.2 When we make material changes, we may provide notice through the application, website, email, or other reasonable means. The “Last Updated” date at the top of this Policy indicates when it was most recently revised.",
  },
  {
    type: "p",
    text: "14.3 Unless otherwise stated, updated versions take effect upon publication. Your continued access or use of the Services after the effective date constitutes acceptance of the revised Policy.",
  },
  {
    type: "p",
    text: "14.4 If you do not agree to an updated Policy, you must stop using the Services and disconnect any integrations you have enabled.",
  },
  {
    type: "p",
    text: "14.5 We encourage you to review this page periodically. Material changes affecting how we use personal information may be highlighted in product notices where practical.",
  },

  { type: "h2", text: "15. Contact Information" },
  {
    type: "p",
    text: "15.1 For privacy related inquiries, data subject requests where applicable, legal correspondence, compliance questions, or security concerns regarding this Policy, you may contact us using the details below. We will endeavour to respond within a reasonable timeframe.",
  },
  {
    type: "p",
    text: "15.2 When contacting us, please provide sufficient detail to identify your request (for example, the feature used, approximate date of activity, and wallet address if relevant to a support matter). Do not include your seed phrase or private key in any communication.",
  },
  {
    type: "p",
    text: "15.3 We may need additional information to verify your identity before fulfilling certain requests. This helps protect users against fraudulent account takeover or impersonation.",
  },
  {
    type: "p",
    text: "15.4 Response times may vary based on request complexity, legal review, and operational volume. We prioritise urgent security reports when credible evidence of active harm is presented.",
  },
];

export const PRIVACY_POLICY_CLOSING =
  "15.5 By continuing to access or use the Services, you acknowledge that you have read, understood, and agreed to this Privacy Policy in its current form.";
