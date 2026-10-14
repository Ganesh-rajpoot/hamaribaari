import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { searchHospitals } from '../../api/hospitals';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

export default function Hospitals() {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setBusy(true); setErr('');
    try { setList(await searchHospitals(q)); }
    catch (e) { setErr(e?.response?.data?.error?.message || 'Failed to load'); }
    finally { setBusy(false); }
  };

  useEffect(() => { load(); /* initial */ }, []);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Find a hospital</h1>
      <p className="text-slate-500 text-sm mt-1">Search by name or city.</p>

      <div className="mt-4 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="e.g. Bengaluru" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {busy && <p className="mt-4 text-slate-500">Loading…</p>}
      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((h) => (
          <Card key={h.id}>
            <div className="p-5">
              <Link to={`/hospitals/${h.id}`} className="font-semibold text-lg hover:text-brand-600">
                {h.name}
              </Link>
              <div className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />{h.city}
              </div>
              {h.address && <p className="mt-2 text-sm text-slate-600">{h.address}</p>}
            </div>
          </Card>
        ))}
        {!busy && list.length === 0 && (
          <p className="text-slate-500">No hospitals found.</p>
        )}
      </div>
    </section>
  );
}