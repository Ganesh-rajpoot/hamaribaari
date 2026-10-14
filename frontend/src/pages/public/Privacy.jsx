import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 animate-screen-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: 14 October 2026</p>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <p>
          HamariBaari ("we", "our", "us") helps patients join a hospital's OPD
          queue from home and track their token in real time. This policy
          explains what information we collect and how we use it.
        </p>

        <Section title="1. What we collect">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data</strong>: full name, mobile number, and a hashed password.</li>
            <li><strong>Queue data</strong>: token numbers, session bookings, arrival status, and the hospital / doctor / department you selected.</li>
            <li><strong>Technical data</strong>: IP address, user agent, and request timestamps (used for security and audit logs).</li>
          </ul>
        </Section>

        <Section title="2. What we do NOT collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>No Aadhaar, PAN, or government identification numbers.</li>
            <li>No medical history, diagnosis, symptoms, or prescriptions.</li>
            <li>No payment details — HamariBaari does not process payments.</li>
            <li>No location tracking.</li>
          </ul>
        </Section>

        <Section title="3. How we use the data">
          <ul className="list-disc pl-5 space-y-1">
            <li>To authenticate you and secure your account.</li>
            <li>To generate your queue token and estimate waiting time.</li>
            <li>To let hospital staff (receptionists and doctors) coordinate the queue.</li>
            <li>To comply with legal obligations and prevent abuse.</li>
          </ul>
        </Section>

        <Section title="4. Who can see your data">
          <p>
            Only staff belonging to the hospital whose queue you joined. Each
            hospital is isolated — a hospital cannot see another hospital's
            patients, tokens, or sessions. Receptionists and doctors only see
            queue-relevant details (your name, mobile, and current token).
          </p>
          <p className="mt-2">
            Other patients cannot see your name or mobile number.
          </p>
        </Section>

        <Section title="5. Data retention">
          <p>
            Queue and audit records are retained as long as required for hospital
            operations. You may request deletion of your account by contacting
            the hospital where you booked, or by writing to us.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            Passwords are stored using bcrypt hashing. All API requests use JWT
            authentication. Data is transferred over HTTPS. Access is limited by
            role, and every queue-changing action is logged.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            For privacy questions, contact the hospital you joined, or reach our
            team through the in-app support channel.
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