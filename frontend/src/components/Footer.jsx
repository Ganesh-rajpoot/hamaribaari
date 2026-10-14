import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, MessageCircle, Clock3,
  ShieldCheck, FileText, Stethoscope, Building2,
  Users, Heart, ArrowUpRight,
} from 'lucide-react';
import { CONTACT } from '../config/contact';

export default function Footer({ compact = false }) {
  const tel1 = CONTACT.phone1.replace(/\s+/g, '');
  const tel2 = CONTACT.phone2.replace(/\s+/g, '');
  const wa = CONTACT.whatsapp.replace(/[^\d+]/g, '');

  return (
    <footer className="mt-10 border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {/* ============ Main grid ============ */}
        <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${compact ? 'lg:grid-cols-3' : ''}`}>
          {/* -------- Brand + tagline -------- */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt=""
                className="w-9 h-9 rounded-xl shadow-sm"
              />
              <span className="font-bold text-slate-900 text-lg">
                Hamari<span className="text-brand-600">Baari</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-600 max-w-xs">
              Join the queue from home. Reach closer to your turn.
            </p>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-slate-600">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                No online payments
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-slate-600">
                <Heart className="w-3 h-3 text-rose-500" />
                Made in India
              </span>
            </div>
          </div>

          {/* -------- Product -------- */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink to="/hospitals">Find a hospital</FooterLink>
              <FooterLink to="/register">Create patient account</FooterLink>
              <FooterLink to="/login">Sign in</FooterLink>
              <FooterLink to="/patient/tokens">My tokens</FooterLink>
            </ul>
          </div>

          {/* -------- For hospitals -------- */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              For hospitals
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-slate-600 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400 flex-shrink-0" />
                OPD queue management
              </li>
              <li className="text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                Reception & doctor consoles
              </li>
              <li className="text-slate-600 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                Multi-hospital ready
              </li>
            </ul>

            <a
              href={`mailto:${CONTACT.email}?subject=HamariBaari%20onboarding%20enquiry`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Request a demo <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* -------- Contact us -------- */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact us
            </h4>

            <ul className="mt-3 space-y-2.5 text-sm">
              {/* Contact person */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200
                                flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-brand-600">
                    {CONTACT.person.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="leading-tight min-w-0">
                  <div className="font-medium text-slate-800">{CONTACT.person}</div>
                  <div className="text-xs text-slate-500">{CONTACT.role}</div>
                </div>
              </li>

              {/* Phones */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200
                                flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <a href={`tel:${tel1}`} className="text-slate-700 hover:text-brand-600 truncate">
                    {CONTACT.phone1}
                  </a>
                  <a href={`tel:${tel2}`} className="text-slate-700 hover:text-brand-600 truncate">
                    {CONTACT.phone2}
                  </a>
                </div>
              </li>

              {/* WhatsApp */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200
                                flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <a
                    href={`https://wa.me/${wa.replace('+', '')}?text=${encodeURIComponent(
                      'Hi, I want to know more about HamariBaari.',
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-emerald-600 truncate"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200
                                flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-slate-700 hover:text-brand-600 truncate break-all"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </li>

              {/* Support hours */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200
                                flex items-center justify-center flex-shrink-0">
                  <Clock3 className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-xs text-slate-500">
                  {CONTACT.supportHours}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ============ Bottom strip ============ */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row
                        items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} HamariBaari. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-slate-800">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-800">Terms</Link>
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:text-slate-800"
            >
              Support
            </a>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center sm:text-left">
          HamariBaari is a queue management tool. It does not provide medical advice,
          diagnosis, prescriptions, or process payments. All fees are paid at the
          hospital reception.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-slate-600 hover:text-slate-900 transition">
        {children}
      </Link>
    </li>
  );
}