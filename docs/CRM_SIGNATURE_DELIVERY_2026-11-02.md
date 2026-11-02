# CRM ↔ E-Sign delivery — 2026-11-02

## Result

An approved quote creates a unique contract snapshot containing its deal, customer, line items, discount and net total. The E-Sign link includes that deal and contract ID. A drawn signature is stored with its signer, organization, timestamp and record ID in a versioned registry, keyed by deal plus document. Returning to CRM restores the selected deal and contract tab, displaying the same saved image, signing event and Signed badge in the pipeline. Signing does not automatically close the deal.

Unapproved quotes cannot be sent to signing. A signed quote cannot be changed until its signature is cancelled. Cancelling removes only that document's signature; a closed deal returns to contract stage. CRM reset removes CRM-linked signatures while retaining standalone sample-document signatures. Stale/mismatched document links are rejected rather than opening an unrelated default contract. Old unscoped signature state is not assigned to any deal; legacy E-Sign store data is left in place.

Open tabs update via storage events while preserving their selected CRM view/deal. Render-only quote reads no longer write state, preventing storage-event feedback loops between tabs. Browser back-cache restoration reads current signature state. CRM/E-Sign conversion bars are in normal document flow on desktop and mobile so they do not cover signing controls.

Removed fabricated hash, IP, location and cryptographic-verification claims from the signing UI. Records are explicitly local prototype data, not a digital certificate or externally verified identity.

## Verification

`output/crm-signature-delivery/verify.js` passed **40 checks**, recorded in `test-results.json`:

- Actual UI quote approval → contract → mouse-drawn signature → return to the same CRM deal.
- Exact stored PNG shown in CRM, real signer/record data in the signing log, state retained on reload.
- Two simultaneous tabs and two separate deal signatures, cancellation without affecting the other deal, and independent standalone document state.
- Empty signature, cleared pad and blank required signer field rejected.
- Contract/customer/net amount match the approved quote; signed deal can close and cancellation reverses its closed state.
- Reset, stale links, mismatched deal/document and old unscoped signature input.
- Signed CRM and audit modal at 375/390/768 px; E-Sign at 375/768/1440 px have no document horizontal overflow. Desktop and mobile captures visually inspected.
- No JavaScript page errors. JS/PHP syntax, `git diff --check` and root/public entrypoint equality passed.

Evidence includes `crm-signed-desktop.png`, `crm-signed-mobile.png` and `esign-signed-mobile.png` in the same output directory. Tests used isolated local Chromium through Playwright CLI because access to the in-app surface had been policy-blocked. Reset confirmation was accepted with a test-only `window.confirm` stub; no real contract or external message was submitted.

## Try

Open `/business-suite?deal=D-001&tab=quote` → approve the sample quote → open Contract → sign → return to that deal. Signing is local to the current browser; testing did not populate the user's browser with test signatures.

Local only; not deployed. There is no production authentication, backend persistence, identity verification, signing provider or tamper-proof audit service. Shipping and external storefront/booking defects remain separate tasks. Previous audit findings F03 and prototype hash-claim concerns are addressed within this scope; previous audit documents remain historical evidence.
