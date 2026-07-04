// Single source of truth for the LIVE Privacy Policy and Terms pages (/privacy, /tos).
// The annotated drafts (with reviewer notes) live in legal_docs/*.md; this is the cleaned,
// shippable copy. Fill the LEGAL config below before launch — see legal_docs/LAUNCH-TODO.md.

export const LEGAL = {
  appName: 'Vesper',
  domain: 'vesper.cards',
  // ⚠️ FILL BEFORE LAUNCH. Recommended: a Ltd company (limited liability + the company,
  // not your personal name/home address, becomes the named data controller). If you trade
  // as a sole trader instead, change "a company registered in England and Wales..." in
  // section 1 of both documents to "[Your name], a sole trader based in the United Kingdom".
  entity: '[Vesper legal entity — to be completed before launch]',
  companyNumber: '[company number]',
  registeredAddress: '[registered office address]',
  generalEmail: 'hello@vesper.cards',
  privacyEmail: 'privacy@vesper.cards',
  effectiveDate: '[to be set on launch]',
  lastUpdated: '[to be set on launch]',
} as const;

export const PRIVACY_MD = `# Privacy Policy

**Effective date:** ${LEGAL.effectiveDate}
**Last updated:** ${LEGAL.lastUpdated}

Vesper is a tarot reading experience guided by Melissa, designed for reflection on relationships, decisions, and the things on your mind. This policy explains what information we collect when you use ${LEGAL.domain}, why we collect it, who we share it with, and the choices and rights you have over it.

We have written this in plain language wherever the law lets us. Where a term needs to be precise for legal reasons, we have kept it precise.

## 1. Who we are

Vesper is operated by **${LEGAL.entity}**, a company registered in England and Wales under company number **${LEGAL.companyNumber}**, with a registered office at **${LEGAL.registeredAddress}** ("Vesper", "we", "us", "our"). We are the controller of your personal information for the purposes of UK data protection law.

## 2. Information we collect

### Account information
When you sign in with Google, we receive your name and email address from Google via our authentication provider, Supabase. We do not see or store your Google password.

### Profile and onboarding information
You provide this directly when you set up Melissa as your guide:

- The name you would like Melissa to call you
- Your star sign and date of birth (if you choose to provide it)
- Your mood, focus area (e.g. love, career, a big decision), relationship status, and what you are hoping a reading will show you
- Any free-text reflections you write, including custom questions or journal entries
- Your preferred email check-in time and marketing preference

### Your readings and journal
We store the tarot readings Melissa gives you and any reading you choose to save to your journal, so you can come back to them.

### Approximate location
We use your IP address, via a service called ipapi.co, to estimate your country so we can show prices in the right currency (£ or $). This is an approximate, country-level estimate, not precise GPS location, and we do not use it to track your movements.

### Payment information
Subscription payments are handled entirely by Stripe. We never see or store your full card number, expiry date, or CVC. Stripe holds that information, and we receive only confirmation that a payment succeeded or failed, your subscription status, and limited billing details (such as the last 4 digits of your card, for display in your account, and your billing history).

### Product analytics and technical information
We collect information about how you use the app (pages visited, features used, app version, device and browser type) through PostHog and Vercel Analytics. With your consent, this may include **session recordings** of how you move through the app, with sensitive inputs (such as your reflections and email address) masked. This helps us understand what is working and fix what is not. See the Cookies and analytics section below.

## 3. How we use it

- **To generate your readings.** Your profile, onboarding answers, and any question or reflection you write are sent to our AI provider to generate Melissa's response to you, personally.
- **To run your account.** Authentication, saving your journal, remembering your preferences, and showing you the right subscription status.
- **To bill you.** Processing your subscription, trial, and renewals through Stripe.
- **To communicate with you.** Account and billing emails (transactional, since they are how we tell you about your subscription), and, only if you have opted in, daily reading reminders and other marketing emails.
- **To improve Vesper.** Understanding usage patterns so we can fix bugs and build features people actually want.
- **To keep things secure and lawful.** Detecting fraud or abuse, complying with legal obligations, and enforcing our Terms of Service.

## 4. Our legal bases (UK GDPR)

For our UK and EU users, we rely on:

- **Performance of a contract** to create your account, generate your readings, and provide the subscription you have signed up for.
- **Consent** for marketing emails, session recordings, and any non-essential cookies or analytics. You can withdraw this at any time.
- **Legitimate interests** for core product analytics, fraud prevention, and keeping the service secure, where this does not override your own privacy interests.
- **Legal obligation** for example, keeping financial records for tax purposes.

## 5. How Melissa's readings are generated

When Melissa gives you a reading, the relevant parts of your profile (such as your name, star sign, and focus area) and the text of your question or reflection are sent to an AI model, Claude, made by Anthropic, which we access through Amazon Web Services' Bedrock service. This is how Melissa's responses are written.

We do not use your readings, journal entries, or reflections to train AI models, and AWS Bedrock does not use your inputs to train its underlying foundation models.

## 6. Who we share information with

We do not sell your personal information, and we do not share it with advertisers. We share information only with the service providers ("sub-processors") who help us run Vesper, each bound by a contract limiting what they can do with it:

| Provider | What for | What they see |
|---|---|---|
| Supabase | Authentication and database hosting | Your account, profile, and journal data |
| Stripe | Payments and subscription billing | Your card details and billing information; we never hold your full card number |
| AWS Bedrock (Anthropic Claude) | Generating your tarot readings | Your profile and the text of your question/reflection, for that request only |
| PostHog | Product analytics and session recording | Usage, device/browser information, and (with consent) masked session recordings |
| Vercel | App hosting and web analytics | Standard hosting logs and aggregated traffic data |
| ipapi.co | IP to currency detection | Your IP address, for that request only |
| Resend | Sending account and marketing emails | Your email address and email content |

We may also share information if required by law, to protect the rights, safety, or property of Vesper or others, or in connection with a merger, acquisition, or sale of assets, in which case we would require the new owner to honour this policy.

## 7. International transfers

Some of our sub-processors store or process information outside the UK, for example in the United States or the EU. Where this happens, we rely on legally recognised safeguards, such as the UK's International Data Transfer Addendum or adequacy regulations, to keep your information protected to UK standards.

## 8. How long we keep information

- **Account and profile data:** for as long as your account is active.
- **Readings and journal entries:** until you delete them individually or delete your account.
- **Billing records:** retained after account deletion for as long as required by tax and accounting law.
- **Analytics data:** typically retained in de-identified or aggregated form after this point.

## 9. Your rights (UK)

If you are in the UK (or the EU), data protection law gives you the right to:

- Access the personal information we hold about you
- Correct inaccurate information
- Delete your information ("right to be forgotten")
- Restrict or object to certain processing
- Receive your data in a portable format
- Withdraw consent at any time, where we rely on consent
- Complain to the UK Information Commissioner's Office (ICO) at [ico.org.uk](https://ico.org.uk), though we would appreciate the chance to put things right first

To exercise any of these, use the in-app tools where available (see Deleting your account below) or email us at **${LEGAL.privacyEmail}**.

## 10. Your rights (US / California)

If you are a California resident, the California Consumer Privacy Act (as amended by the CPRA) gives you the right to know what personal information we have collected about you, request deletion of it, correct inaccurate information, and opt out of the sale or sharing of your personal information.

We do not sell or share your personal information for money or for cross-context behavioural advertising, so there is nothing to opt out of on that front. We extend these same rights, access, deletion, and correction, to all our US users as a matter of practice, not just where California law strictly requires it.

To exercise these rights, use the in-app delete-account tool or email **${LEGAL.privacyEmail}**. We will not discriminate against you for exercising any of these rights.

## 11. Deleting your account

You can delete your account at any time from your account settings. Doing this will:

- Cancel any active subscription with Stripe
- Permanently delete your profile, readings, and journal entries from our database

Some information may be retained for a limited period afterward where we are legally required to (for example, billing records for tax purposes, see How long we keep information above).

## 12. Marketing emails

We will only send you daily reading reminders or other marketing emails if you have explicitly opted in during onboarding or in your account settings. Every marketing email includes an unsubscribe link, and you can withdraw your consent at any time. This will not affect transactional emails about your account or billing, which we will still need to send you.

## 13. Cookies and analytics

We use cookies and similar technologies for a few purposes:

- **Strictly necessary** keeping you signed in and remembering your session. These do not require consent.
- **Analytics and session recording** understanding how Vesper is used (via PostHog and Vercel Analytics), so we can improve it.

Where analytics, session recording, or any other non-essential cookie requires consent under UK law (the Privacy and Electronic Communications Regulations, alongside UK GDPR), we ask for it through a cookie banner before any such cookie is set, with an equally clear option to reject. You can change your choice at any time from the cookie settings in the app.

## 14. Children

Vesper is intended for adults aged 18 and over. We do not knowingly collect personal information from anyone under 18. If you believe a child has provided us with personal information, please contact us and we will delete it.

## 15. Security

We use industry-standard measures to protect your information, including encryption in transit and at rest (provided by our infrastructure providers, Supabase and Vercel), and access controls limiting who at Vesper can view your data. No system is completely secure, and we cannot guarantee absolute security.

## 16. Changes to this policy

We may update this policy from time to time. If we make material changes, we will let you know, for example by email or an in-app notice, before they take effect. The "last updated" date at the top of this page always reflects the most recent version.

## 17. Contact us

Questions about this policy, or want to exercise any of your rights? Email us at **${LEGAL.privacyEmail}**.

---

**Entertainment disclaimer.** Melissa's readings are created for entertainment and self-reflection. They are not a substitute for professional medical, legal, financial, or psychological advice. See our [Terms of Service](/tos) for the full disclaimer.
`;

export const TERMS_MD = `# Terms of Service

**Effective date:** ${LEGAL.effectiveDate}
**Last updated:** ${LEGAL.lastUpdated}

These terms govern your use of Vesper (${LEGAL.domain}) and the readings, journal, and subscription provided through it. By creating an account, you agree to these terms.

## 1. Who we are

Vesper is operated by **${LEGAL.entity}**, a company registered in England and Wales under company number **${LEGAL.companyNumber}**, with a registered office at **${LEGAL.registeredAddress}** ("Vesper", "we", "us", "our").

## 2. What Vesper is

Vesper is an entertainment and self-reflection product. Melissa, our AI-guided oracle character, generates tarot-style readings based on information you provide. Vesper is **not** a substitute for professional advice of any kind, see the Entertainment disclaimer (section 11) below, which is core to these terms, not a footnote.

## 3. Eligibility

You must be at least 18 years old to use Vesper. By creating an account, you confirm that you are 18 or older. We may ask you to verify your age and may suspend or close accounts we believe belong to someone under 18.

## 4. Your account

You are responsible for keeping your Google account secure, since that is how you sign in to Vesper. You are responsible for all activity under your account. Let us know immediately if you suspect unauthorised access.

## 5. Subscriptions, billing and cancellation

### 5.1 How it works
Vesper is offered on a subscription basis: a **14-day free trial**, followed by an **auto-renewing subscription** at **£9.99/month** or **£79.99/year**, unless you cancel before the trial ends. A valid payment card is required to start the trial.

### 5.2 Auto-renewal
Your subscription will automatically renew at the end of each billing period (monthly or annually, matching your plan) at the then-current price, charged to the payment method on file, until you cancel.

### 5.3 How to cancel
You can cancel at any time through the Stripe Customer Portal, accessible from your account page inside the app. Cancelling stops future renewals; you will keep access until the end of the billing period you have already paid for.

### 5.4 Refunds
We do not offer refunds for partial subscription periods or unused time, except where required by law (see 5.5 and 5.6 below). The free trial exists precisely so you can evaluate Vesper before being charged. If you do not want to continue, cancel before the trial ends.

### 5.5 UK cancellation rights
If you are a UK consumer, you normally have a 14-day "cooling-off" period to cancel a contract for digital services under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. Because Vesper gives you immediate access to the service when your free trial begins, by starting your trial you expressly request that the service begins immediately and acknowledge that you will lose this 14-day cancellation right once the service has been fully performed. This does not affect your right to cancel your subscription at any time as described in section 5.3, and you will not be charged if you cancel before your free trial ends.

### 5.6 US disclosures
If you are a US consumer, please note: this is a "negative option" / auto-renewal arrangement. Before you are charged, we clearly disclose the trial length, the price and billing frequency that follow it, and how to cancel, and we will not charge you without your consent to those terms. You can cancel online, the same way you signed up.

### 5.7 Price changes
We will give you advance notice before any price increase takes effect on your next renewal, and you will be able to cancel before being charged the new price.

## 6. Acceptable use

You agree not to:

- Use Vesper for any unlawful purpose, or to harass, abuse, or impersonate anyone
- Attempt to reverse-engineer, scrape, or extract Melissa's underlying prompts or model
- Share your account with others or attempt to access another user's account
- Use automated means (bots, scripts) to interact with the service
- Misrepresent your age or identity

We may suspend or terminate accounts that breach this section.

## 7. Your content

You own the questions, reflections, and journal entries you write. By submitting them, you grant Vesper a licence to process and store that content for the purpose of generating your readings, maintaining your journal, and operating the service, see our [Privacy Policy](/privacy) for exactly how this works, including how content is sent to our AI provider to generate readings. We do not use your content to train AI models, and we do not sell it.

## 8. Intellectual property

Vesper, the Melissa character, our branding, and the app's design and code are owned by us or our licensors and protected by intellectual property law. The traditional tarot card imagery used in the app (Rider-Waite deck) is in the public domain. You may not copy, modify, or redistribute any part of the service except as the service itself intends (e.g. saving your own readings).

## 9. Third-party services

Signing in and paying for Vesper involves third-party services (Google, Stripe) that have their own terms and privacy practices, which you should review separately. We are not responsible for those services' acts or omissions.

## 10. AI-generated content

Readings are generated by an AI model and are inherently variable, sometimes imperfect, and not guaranteed to be accurate, complete, or consistent between sessions. Melissa's "voice" and persona are a creative and entertainment device, not a representation that you are speaking with a human or with anything that has genuine insight into your future.

## 11. Entertainment disclaimer

**This section matters more than any other in these terms, please read it.**

Vesper and Melissa's readings are provided **for entertainment and self-reflection purposes only**. They are **not**, and must never be relied upon as:

- Medical or psychological advice or treatment
- Legal advice
- Financial or investment advice
- A substitute for professional help of any kind

Nothing in a reading should be used as the basis for a real-world decision about your health, finances, legal situation, or safety. If you are dealing with something serious, a relationship that involves abuse, a mental health concern, a financial or legal decision with real consequences, please speak to a qualified professional or, where appropriate, a doctor, lawyer, or financial advisor.

If you are in crisis or experiencing thoughts of self-harm, please contact a crisis line or emergency services in your country rather than relying on Vesper.

We make no representation that Melissa's readings are accurate, predictive, or based on any scientifically validated method. Tarot, as presented in Vesper, is a creative and reflective tool, not a method of fortune-telling with guaranteed outcomes.

## 12. Disclaimers and limitation of liability

To the fullest extent permitted by law, Vesper is provided "as is" without warranties of any kind, and we do not guarantee the service will be uninterrupted, error-free, or that any reading will meet your expectations.

To the fullest extent permitted by law, we will not be liable for any indirect, incidental, or consequential damages arising from your use of Vesper.

**Nothing in these terms excludes or limits liability that cannot be excluded or limited under UK law**, including liability for death or personal injury caused by negligence, or your statutory rights under the Consumer Rights Act 2015 (for example, the right to a service performed with reasonable care and skill).

## 13. Termination

You can stop using Vesper and delete your account at any time. We may suspend or terminate your account if you breach these terms, or for any other reason with reasonable notice where practicable. On termination, section 11 (Entertainment disclaimer) and section 12 (Disclaimers and limitation of liability) survive.

## 14. Governing law and dispute resolution

These terms are governed by the laws of England and Wales, and the courts of England and Wales will have jurisdiction over any dispute. Nothing in this section deprives you of any protection you have under the mandatory consumer protection laws of the country where you live, and if you are a consumer resident outside England and Wales you may also be able to bring proceedings in your local courts. We aim to resolve any complaint informally first, so please contact us at **${LEGAL.generalEmail}** before starting formal proceedings.

## 15. Changes to these terms

We may update these terms from time to time. If we make material changes, we will notify you, for example by email or an in-app notice, before they take effect. Continuing to use Vesper after changes take effect means you accept the updated terms.

## 16. Contact us

Questions about these terms? Email us at **${LEGAL.generalEmail}**.
`;
