export default function Button({
  children, variant = 'primary', size = 'md', className = '', ...rest
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5', lg: 'px-5 py-3 text-lg' };
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-teal-600 text-white hover:bg-teal-500',
    outline:   'border border-slate-200 text-slate-700 hover:bg-slate-50',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-slate-700 hover:bg-slate-100',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}