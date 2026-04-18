import { useLocation, useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-whisper">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center">
            <span className="font-serif text-cream leading-none">R</span>
          </div>
          <span className="font-serif text-xl text-ink">Refract</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-3">404</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink mb-3">Nothing to show here.</h1>
        <p className="text-soft mb-8">
          The page <span className="text-ink">"{pageName}"</span> isn't part of Refract.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-charcoal text-white hover:bg-black transition"
        >
          Back home
        </button>
      </div>
    </div>
  );
}