import { X } from "lucide-react";
import { motion } from "motion/react";

const SECTIONS = [
  {
    title: "1. The Sale",
    paragraphs: [
      {
        id: "1.1",
        text: "The Issuer is offering ALLOX tokens (“ALLOX” or the “Tokens”) under a multi-tier pricing and vesting structure based on Fully Diluted Valuation (FDV) plans and vesting options, as set forth in the pricing schedule on the Sale Site, for an initial target of approximately US$2,000,000 in aggregate proceeds (the “Sale”). The initial Token allocation for the Sale is expected to represent approximately 3% of the total Token supply of 1,000,000,000 ALLOX. Depending on demand, the mix of selected FDV / vesting tiers, and committed amounts, the Issuer may increase the Token allocation for the Sale up to approximately 6% of the total Token supply.",
      },
      {
        id: "1.2",
        text: "The Sale is conducted through a sale interface hosted or designated by the Issuer (the “Sale Site”). Identity verification, residence verification, wallet checks, and eligibility screening may be performed through the Issuer’s whitelist and eligibility processes on the Sale Site and/or by third-party verification providers engaged by the Issuer. Any third-party verification provider is a verification service only. It is not an offeror, seller, broker, dealer, placement agent, adviser, or counterparty in respect of the Tokens, does not conduct or facilitate the purchase transaction, and has no responsibility for these Terms, the Disclosures, or the Tokens. Your contractual counterparty for the purchase of Tokens is the Issuer only.",
      },
      {
        id: "1.3",
        text: "The Sale consists of (a) a whitelist / pre-registration period during which prospective purchasers complete eligibility checks, and (b) a purchase window (the “Sale Window”) as announced on the Sale Site. The Issuer may open, extend, shorten, suspend, or close the Sale Window, or reject any or all purchase commitments, in its sole discretion, at any time and without notice.",
      },
      {
        id: "1.4",
        text: "The Issuer may publish additional “ALLOX Token & Sale Disclosures” (the “Disclosures”) on the Sale Site. Where published, the Disclosures form part of these Terms. You represent that you have read and understood these Terms and any Disclosures, including any Risk Factors, before committing to purchase.",
      },
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: [
      {
        id: "2.1",
        text: "You may participate only if all of the following are true at registration, at the time of your purchase commitment, and at settlement: (a) you are at least 18 years old and have full legal capacity; (b) you have completed any required eligibility verification and been confirmed eligible; (c) you are not an Excluded Person (Section 3); (d) your participation is lawful in every jurisdiction applicable to you; and (e) every representation in Section 8 is true and accurate.",
      },
      {
        id: "2.2",
        text: "Eligibility is determined on a fail-closed basis: if your information is incomplete, inconsistent, or unverifiable, or if verification signals (including IP address, VPN, proxy or similar anonymization indicators, device or payment data) are inconsistent with your declared residence or location, you will be rejected or held for manual review. The Issuer’s eligibility determinations are final.",
      },
    ],
  },
  {
    title: "3. Excluded Persons and Excluded Jurisdictions",
    paragraphs: [
      {
        id: "3.1",
        text: "“Excluded Person” means: (a) any natural person resident or located in, or entity organized under the law of, or resident or located in, any Excluded Jurisdiction; (b) any person that is the subject of sanctions administered by OFAC, the UN Security Council, the European Union, the UK's HM Treasury, or any similar authority, or that is owned or controlled by, or acting for the benefit of, any such person; and (c) any person, entity, or arrangement formed or used for the purpose of evading these restrictions.",
      },
      {
        id: "3.2",
        text: "“Excluded Jurisdictions”   are those jurisdictions identified as restricted, prohibited, or excluded under the jurisdiction screening list maintained by Sonar by Echo, as such list may be updated from time to time, together with any other jurisdiction designated on the Sale Site's country schedule as excluded. The Issuer may update this list by notice on the Sale Site.",
      },
      {
        id: "3.3",
        text: "Null and void; refund-only remedy. Any purchase, or attempted purchase, by or for the account or benefit of an Excluded Person is prohibited, void ab initio, and confers no rights. If the Issuer determines at any time (before or after delivery) that a purchaser was an Excluded Person or that any Section 8 representation was untrue, the Issuer may (a) cancel the purchase and refund the purchase amount (without interest, net of network and processing costs) to the originating address, and/or (b) withhold, cancel, or require the return of any Tokens delivered. If Tokens have been delivered, the purchaser must promptly return them to an address designated by the Issuer, and the Issuer has no obligation to make a refund until the Tokens have been returned, recovered, or cancelled. Any transfer made before return remains a breach of these Terms and does not limit the Issuer’s remedies under Section 11.3. Refund of the purchase amount is the sole and exclusive remedy of any such person, and no such person shall have any right to Tokens, damages, or other relief.",
      },
    ],
  },
  {
    title: "4. Purchase Mechanics; Payment",
    paragraphs: [
      {
        id: "4.1",
        text: "Purchase commitments may be made only during the Sale Window through the Sale Site, in USDT and/or USDC on the network(s) designated on the Sale Site. Minimum and maximum purchase amounts per verified participant (aggregated across wallets and affiliates), and the maximum number of wallet addresses that may be associated with one verified participant, will be set by the Issuer and published on the Sale Site.",
      },
      {
        id: "4.2",
        text: "Payment must originate from a wallet associated with your verified / eligible profile on the Sale Site. Payments from third parties, unverified wallets, mixers, or wallets flagged by screening are rejected or held; associated commitments may be cancelled.",
      },
      {
        id: "4.3",
        text: "Handling of Sale Proceeds Funds received in connection with the Sale may be collected through multiple wallet addresses designated by the Issuer. For security, compliance, and operational purposes, the Issuer may consolidate and transfer such funds to one or more institutional accounts controlled by the Issuer.",
      },

      {
        id: "4.4",
        text: "A purchase commitment is an irrevocable offer by you, and is accepted by the Issuer only when the Issuer sends the allocation confirmation described in Section 5.4. The Issuer may reject any commitment in whole or in part for any reason.",
      },
      {
        id: "4.5",
        text: "Token price, discount, unlock at TGE, lock period, and vesting schedule depend on the plan (tier) you select at commitment (for example, Silver, Gold, or Platinum FDV / vesting options). The applicable schedule for each plan is displayed on the Sale Site at the time of commitment and forms part of your purchase terms.",
      },
    ],
  },
  {
    title: "5. Allocation; Oversubscription; Refunds",
    paragraphs: [
      {
        id: "5.1",
        text: "If aggregate commitments exceed the Sale cap then in effect, allocations will be made pro rata to committed amounts, or under such other objective allocation methodology as the Issuer publishes on the Sale Site before or during the Sale Window. The allocation methodology in effect will be applied uniformly.",
      },
      {
        id: "5.2",
        text: "Committed amounts not accepted are refundable to the originating wallet within 10 business days after the Sale Window closes, without interest, net of network costs. No fiat refunds; refunds are made in the payment asset.",
      },
      {
        id: "5.3",
        text: "The Issuer may publish aggregate results (total commitments, participants, allocation outcome) after the close. Individual data is not published.",
      },
      {
        id: "5.4",
        text: "After completing allocations, the Issuer will send each purchaser a notice stating the accepted allocation and the refundable balance. Receipt of payment does not constitute acceptance. A purchase contract is formed only for the accepted allocation when that notice is sent.",
      },
    ],
  },
  {
    title: "6. Delivery of Tokens",
    paragraphs: [
      {
        id: "6.1",
        text: "The Tokens are ALLOX utility tokens of the AlloX platform. The total Token supply is 1,000,000,000 ALLOX. Accepted allocations will be delivered to the purchaser’s registered destination wallet on or about the distribution / TGE date announced on the Sale Site, subject to the lock and vesting schedule of the selected plan. The Issuer may reasonably delay delivery for technical, security, or compliance reasons.",
      },
      {
        id: "6.2",
        text: "You are solely responsible for your wallet, keys, and address accuracy. Delivery to your confirmed address discharges the Issuer’s delivery obligation in full.",
      },
    ],
  },
  {
    title: "7. Transfer and Resale Restrictions",
    paragraphs: [
      {
        id: "7.1",
        text: "You agree not to offer, sell, transfer, or hedge Tokens, directly or indirectly, to or for the account or benefit of any Excluded Person.",
      },
      {
        id: "7.2",
        text: "Tokens are delivered without any right to any exchange listing. No listing, liquidity, or price is promised, and no statement outside these Terms and the Disclosures may be relied upon.",
      },
    ],
  },
  {
    title: "8. Your Representations and Warranties",
    intro:
      "You represent and warrant to the Issuer, at registration, at each purchase commitment, and at settlement, that:",
    bullets: [
      "(a) you are not an Excluded Person; you are not located in an Excluded Jurisdiction; no offer was made to you while you were in a Restricted Jurisdiction; and at the time your purchase order originated, you were outside all Restricted Jurisdictions, or the Issuer reasonably believed that you were outside all Restricted Jurisdictions;",
      "(b) you act solely for your own account and not for the account or benefit of any Excluded Person, and no arrangement exists to transfer Tokens or their economic benefit to any Excluded Person",
      "(c) all registration information you supplied is true, current, and complete; you have not used any VPN, proxy, or other tool to misrepresent your location, and you will not do so in connection with the Sale;",
      "(d) your participation and payment comply with all laws applicable to you (including securities, tax, foreign-exchange, and AML laws of your jurisdiction), and your funds derive from lawful sources;",
      "(e) you have the knowledge and experience to evaluate the purchase, you have read these Terms and any Disclosures including Risk Factors, you can bear the total loss of your purchase amount, and you are not relying on any statement of the Issuer or any other person outside these Terms and the Disclosures;",
      "(f) you acquire Tokens for their utility within the AlloX platform and not with a view to distribution in violation of these Terms; you understand the Tokens confer no equity, debt, dividend, revenue-share, or governance right in the Issuer or any affiliate unless expressly stated otherwise in product documentation; and",
      "(g) you understand that the Issuer has not registered the Sale with any securities regulator, that no regulator has approved or reviewed the Sale, and that these Terms limit your remedies.",
    ],
  },
  {
    title: "9. No Offer of Securities; No Advice",
    paragraphs: [
      {
        id: "9.1",
        text: "The Issuer does not consider the sale of Tokens to be a securities transaction. Tokens are not registered under any securities laws. Participation is limited to verified eligible persons, subject to the restrictions in these Terms.",
      },
      {
        id: "9.2",
        text: "Nothing on the Sale Site, in these Terms, or in the Disclosures constitutes investment, legal, tax, or financial advice, or a recommendation to purchase Tokens.",
      },
      {
        id: "9.3",
        text: "Statements regarding the future development, functionality, or adoption of AlloX are forward-looking, are not commitments of the Issuer, and involve risks and uncertainties. The Issuer undertakes no obligation to update them.",
      },
    ],
  },
  {
    title: "10. Taxes",
    paragraphs: [
      {
        text: "You are solely responsible for all taxes, duties, and reporting obligations arising from your purchase, holding, or disposal of Tokens. Amounts payable are exclusive of taxes; the Issuer may withhold where required by law.",
      },
    ],
  },
  {
    title: "11. Disclaimers; Limitation of Liability; Indemnity",
    paragraphs: [
      {
        id: "11.1",
        text: "The Tokens, the Sale Site, and the Sale are provided “as is” and “as available,” without warranties of any kind, express or implied. The Issuer disclaims all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.",
      },
      {
        id: "11.2",
        text: "To the maximum extent permitted by law: (a) the Issuer, its affiliates, and their directors, officers, employees, advisers, and service providers shall not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or loss of profits, tokens, data, or goodwill; and (b) the aggregate liability of the Issuer to you for all claims arising out of or relating to the Sale or these Terms shall not exceed the amount you paid in the Sale.",
      },
      {
        id: "11.3",
        text: "You will indemnify and hold harmless the Issuer and the persons listed in Section 11.2 from losses arising out of your breach of these Terms, your misrepresentation, or your violation of law.",
      },
    ],
  },
  {
    title: "12. Suspension; Amendment",
    paragraphs: [
      {
        text: "The Issuer may amend these Terms before or during the Sale Window by posting the amended Terms on the Sale Site; your continued participation constitutes acceptance. The Issuer may suspend or terminate the Sale in whole or in part at any time, in which case unaccepted commitments will be refunded under Section 5.2.",
      },
    ],
  },
  {
    title: "13. Privacy",
    paragraphs: [
      {
        text: "Verification and participation data may be collected and processed by the Issuer and any verification providers under applicable privacy notices on the Sale Site, for eligibility, compliance, and record-keeping purposes.",
      },
    ],
  },
  {
    title: "14. Dispute Resolution; Class Waiver",
    paragraphs: [
      {
        id: "14.1",
        text: "Any dispute arising out of or relating to these Terms or the Sale shall be finally resolved by binding arbitration under the Rules of Arbitration of the International Chamber of Commerce by one arbitrator, of the issuing company. Judgment may be entered in any court of competent jurisdiction.",
      },
      {
        id: "14.2",
        text: "All disputes must be brought individually. You waive any right to participate in a class, collective, or representative action, and, to the fullest extent permitted, any right to a jury trial. You may opt out of this Section 14 by written notice to the address or email designated for such notices on the Sale Site, within 30 days of first accepting these Terms.",
      },
      {
        id: "14.3",
        text: "Any claim must be filed within one (1) year after it accrues, or it is permanently barred.",
      },
    ],
  },
  {
    title: "15. Our rights",
    paragraphs: [
      {
        id: "15.1",
        text: "AlloX may, at any time and at its sole discretion, accept, reduce, reject, suspend, cancel, unwind, freeze, or refund any commitment, in whole or in part, for any reason or for no reason. Without limiting this, AlloX may do so where it is required or advisable for legal or regulatory reasons, where a screening check flags a participant or a wallet, where any representation above proves to be untrue, or in order to manage the size, composition, or allocation of the round. Any rejected or unfilled portion of a commitment is returned to the wallet it was committed from after settlement. AlloX may also modify the sale parameters or discontinue the Sale. AlloX is not obliged to give reasons for such a decision, and is not liable for any loss arising from one.",
      },
    ],
  },
  {
    title: "16. Governing Law; Miscellaneous",
    paragraphs: [
      {
        id: "16.1",
        text: "These Terms are governed by the laws of the issuing company, without regard to conflicts principles.",
      },
      {
        id: "16.2",
        text: "These Terms and any Disclosures are the entire agreement regarding the Sale and supersede all prior statements. If any provision is unenforceable, the remainder stands. The Issuer may assign these Terms to an affiliate; you may not assign. No waiver is implied from any failure to enforce. Notices to you may be made via the Sale Site or your registered email.",
      },
    ],
  },
];

export function AlloxSaleTermsModal({
  open,
  onClose,
  //  onAccept
}) {
  if (!open) return null;

  return (
    <motion.div
      key="allox-sale-terms-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-3xl max-h-[88vh] rounded-3xl overflow-hidden flex flex-col bg-white border border-black/10 shadow-[0_32px_80px_rgba(0,0,0,0.25)]"
      >
        <div
          className="h-1.5 w-full shrink-0"
          // style={{
          //   background: "linear-gradient(90deg, #818cf8, #6366f1, #22d3ee)",
          // }}
        />

        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0 pr-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              ALLOX Token Sale Terms
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: August 12, 2026
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close sale terms"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6 text-sm leading-relaxed text-gray-700">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Issuer
            </p>
            <p className="font-bold text-gray-900">AlloX Ltd</p>
          </div>

          <p>
            These ALLOX Token Sale Terms (these “Terms”) govern the offer and
            sale of ALLOX tokens (“ALLOX” or the “Tokens”) by AlloX Ltd, a
            limited liability company organized under the laws of the issuing
            company (the “Issuer,” “we,” “us”). By clicking “I Agree,” accepting
            the sale terms checkbox, registering for, or participating in the
            Sale (as defined below), you enter into a binding agreement with the
            Issuer on these Terms. If you do not agree, do not participate.
          </p>

          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3">
              <h4 className="text-base font-bold text-gray-900">
                {section.title}
              </h4>
              {section.intro && <p>{section.intro}</p>}
              {section.paragraphs?.map((p, idx) => (
                <p key={p.id || idx}>
                  {p.id && (
                    <span className="font-semibold text-gray-900 mr-1.5">
                      {p.id}
                    </span>
                  )}
                  {p.text}
                </p>
              ))}
              {section.bullets?.map((bullet) => (
                <p key={bullet} className="pl-1">
                  {bullet}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {/* {typeof onAccept === "function" && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_8px_20px_rgba(79,70,229,0.28)]"
            >
              I Agree
            </button>
          )} */}
        </div>
      </motion.div>
    </motion.div>
  );
}
