import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 animate-screen-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Terms of Use</h1>
          <p className="text-xs text-slate-500">Last updated: 14 October 2026</p>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <p>
          By using HamariBaari, you agree to these terms. If you do not agree,
          please do not use the service.
        </p>

        <Section title="1. Service description">
          <p>
            HamariBaari lets patients join a hospital's outpatient (OPD) queue
            from home and track their token number. It is a queue management
            tool only. It does not provide medical advice, diagnosis,
            prescriptions, treatment, or payment processing.
          </p>
        </Section>

        <Section title="2. Registration">
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate information (name, mobile number).</li>
            <li>You are responsible for keeping your password confidential.</li>
            <li>One account per person per mobile number.</li>
          </ul>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Book tokens on behalf of others without their consent.</li>
            <li>Abuse the queue by booking tokens you do not intend to use.</li>
            <li>Attempt to access other patients' or hospitals' data.</li>
            <li>Reverse engineer, scrape, or overload the service.</li>
          </ul>
        </Section>

        <Section title="4. Queue rules">
          <ul className="list-disc pl-5 space-y-1">
            <li>Token numbers are issued sequentially and are not transferable.</li>
            <li>Waiting-time estimates are approximate and not guaranteed.</li>
            <li>Hospital staff may cancel, skip, or reorder tokens for valid operational reasons.</li>
            <li>Patients may cancel their own WAITING token from the app.</li>
          </ul>
        </Section>

        <Section title="5. Payments">
          <p>
            HamariBaari does NOT handle payments. All registration and
            consultation fees are paid directly to the hospital at reception.
            Any dispute regarding fees is between you and the hospital.
          </p>
        </Section>

        <Section title="6. Availability">
          <p>
            We aim to keep the service available but do not guarantee
            uninterrupted access. Hospitals may suspend their queue at any time
            for operational reasons.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            HamariBaari is provided "as is". We are not liable for medical
            outcomes, missed appointments, waiting-time inaccuracies, or any
            indirect damages arising from use of the service.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            We may update these terms. Continued use after changes constitutes
            acceptance. Material changes will be communicated in-app.
          </p>
        </Section>

        <Section title="9. Governing law">
          <p>
            These terms are governed by the laws of India.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For questions, contact the hospital where you booked, or our team
            through the in-app support channel.
          </p>
        </Section>
      </div>
    </section>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 text-sm sm:text-base">{children}</div>
    </div>
  );
}