// import { Link } from 'react-router-dom';
// import { Stethoscope, MapPin, Clock } from 'lucide-react';

// export default function Landing() {
//   return (
//     <section className="max-w-4xl mx-auto px-4 py-10">
//       <div className="text-center">
//         <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">HamariBaari</h1>
//         <p className="mt-3 text-slate-600">Join the queue from home. Reach closer to your turn.</p>
//       </div>

//       <div className="mt-10 grid sm:grid-cols-3 gap-4">
//         {[
//           { icon: Stethoscope, title: 'Choose doctor', text: 'Browse hospitals and today\'s OPD sessions.' },
//           { icon: Clock,       title: 'Get a token',   text: 'A unique token, no double-booking.' },
//           { icon: MapPin,      title: 'Reach on time', text: 'Track live status and head to the hospital.' },
//         ].map(({ icon: Icon, title, text }) => (
//           <div key={title} className="rounded-2xl border border-slate-100 p-5 shadow-sm">
//             <Icon className="w-6 h-6 text-brand-600" />
//             <h3 className="mt-3 font-semibold">{title}</h3>
//             <p className="mt-1 text-sm text-slate-600">{text}</p>
//           </div>
//         ))}
//       </div>

//       <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
//         <Link to="/register" className="px-6 py-3 rounded-xl bg-brand-600 text-white text-center font-medium">
//           Create patient account
//         </Link>
//         <Link to="/login" className="px-6 py-3 rounded-xl border border-slate-200 text-center font-medium">
//           I already have an account
//         </Link>
//         <Link to="/hospitals" className="px-6 py-3 rounded-xl border border-slate-200 text-center font-medium">
//          Browse hospitals
//         </Link>
//       </div>
//     </section>
//   );
// }

import { Link } from 'react-router-dom';
import { Stethoscope, Clock3, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-6 sm:pt-12 animate-screen-in">
        <div className="pq-hero pq-fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Live OPD queue · No more waiting rooms
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-white">
              Join the queue <span className="opacity-80">from home.</span><br />
              Reach closer to your turn.
            </h1>
            <p className="mt-3 text-white/85 text-sm sm:text-base max-w-md">
              Book your token at any hospital, watch the live queue, and walk in
              exactly when it&apos;s your turn.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="
                inline-flex items-center justify-center gap-2 rounded-2xl
                bg-white text-slate-900 px-5 py-3 font-semibold
                shadow-lg active:scale-[0.98] transition">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/hospitals" className="
                inline-flex items-center justify-center gap-2 rounded-2xl
                border border-white/30 bg-white/10 text-white px-5 py-3 font-semibold
                backdrop-blur active:scale-[0.98] transition hover:bg-white/20">
                Browse hospitals
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-white/80">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> No online payment
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Visit reception to pay
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Stethoscope, title: 'Choose a doctor',
              text: 'Pick a hospital, department, and today\u2019s live session.',
              tint: 'from-sky-100 to-cyan-50', fg: 'text-sky-600' },
            { icon: Clock3, title: 'Get a token',
              text: 'A unique token — no double bookings, no phone calls.',
              tint: 'from-teal-100 to-emerald-50', fg: 'text-teal-600' },
            { icon: MapPin, title: 'Reach on time',
              text: 'Live status updates 12s ahead. Know when to head out.',
              tint: 'from-indigo-100 to-violet-50', fg: 'text-indigo-600' },
          ].map(({ icon: Icon, title, text, tint, fg }, i) => (
            <div key={title}
                 className="pq-card pq-card-tap pq-slide-up p-5"
                 style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`pq-cat-icon bg-gradient-to-br ${tint} ${fg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-center text-xl sm:text-2xl font-bold">
          Three taps. That&apos;s it.
        </h2>
        <ol className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { n: 1, t: 'Pick a hospital', d: 'Search by name or city.' },
            { n: 2, t: 'Join the queue', d: 'Instant token number.' },
            { n: 3, t: 'Arrive at reception', d: 'Register & pay, then see the doctor.' },
          ].map((s) => (
            <li key={s.n} className="pq-card p-5">
              <span className="inline-flex w-8 h-8 items-center justify-center
                               rounded-xl bg-slate-900 text-white text-sm font-bold">
                {s.n}
              </span>
              <div className="mt-3 font-semibold">{s.t}</div>
              <div className="text-slate-600 mt-0.5">{s.d}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}