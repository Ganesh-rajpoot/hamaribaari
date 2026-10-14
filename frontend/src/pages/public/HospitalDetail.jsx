import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, Stethoscope } from 'lucide-react';
import { getHospital } from '../../api/hospitals';
import Card from '../../components/ui/Card';

export default function HospitalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getHospital(id).then(setData).catch((e) =>
      setErr(e?.response?.data?.error?.message || 'Failed to load'));
  }, [id]);

  if (err) return <p className="max-w-4xl mx-auto px-4 py-8 text-red-600">{err}</p>;
  if (!data) return <p className="max-w-4xl mx-auto px-4 py-8">Loading…</p>;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <div className="mt-2 text-slate-600 flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{data.city}</span>
        {data.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" />{data.phone}</span>}
      </div>
      {data.address && <p className="mt-2 text-slate-700">{data.address}</p>}

      <h2 className="mt-8 font-semibold text-lg">Departments</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {data.departments.length === 0 && <p className="text-slate-500">No departments listed.</p>}
        {data.departments.map((d) => (
          <Card key={d.id}>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-slate-500">Code: {d.code}</div>
              </div>
              <Link to={`/hospitals/${id}/departments/${d.id}`}
                    className="text-sm text-brand-600 inline-flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />Doctors
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}