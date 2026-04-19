import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Instagram, 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2,
  Gamepad2,
  Camera,
  User
} from 'lucide-react';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { translations, Language } from './translations';
import SupportChat from './components/SupportChat';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { AdminPanel } from './components/AdminPanel';

// --- Types ---
interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  order: number;
}

interface GalleryItem {
  id: string;
  url: string;
  type: 'normal' | 'before_after';
  beforeUrl?: string;
  afterUrl?: string;
  title?: string;
  createdAt: any;
}

interface SiteSettings {
  instagramUrl: string;
  phoneNumber: string;
  autoReplyMessage: string;
  admins: string[];
}

// --- Components ---

const Navbar = ({ 
  user, 
  isAdmin, 
  onLogin, 
  onLogout, 
  onOpenAdmin,
  lang,
  setLang
}: { 
  user: FirebaseUser | null, 
  isAdmin: boolean, 
  onLogin: () => void, 
  onLogout: () => void, 
  onOpenAdmin: () => void,
  lang: Language,
  setLang: (l: Language) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.gallery, href: '#gallery' },
    { name: t.nav.contact, href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-dark/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="https://storage.googleapis.com/test-media-genai-studio/gen-lang-client-0202024111/input_file_0.png" 
            alt="AMMOR STYLE" 
            className="h-10 w-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} className="text-sm uppercase tracking-widest hover:text-gold transition-colors">
              {link.name}
            </a>
          ))}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-8">
            {(['ru', 'ky', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tighter w-8 h-8 rounded-full border transition-all",
                  lang === l ? "bg-gold border-gold text-dark" : "border-white/10 text-white/40 hover:border-white/30"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={onOpenAdmin}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Settings size={20} className="text-gold" />
                </button>
              )}
              <button onClick={onLogout} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-red-500 transition-colors">
                <LogOut size={18} />
                {t.nav.signOut}
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="bg-gold text-dark px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">
              {t.nav.signIn}
            </button>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-dark border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">
                {link.name}
              </a>
            ))}
            <div className="flex gap-4 py-4 border-y border-white/5">
              {(['ru', 'ky', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setIsOpen(false); }}
                  className={cn(
                    "px-4 py-2 rounded-lg border uppercase text-xs font-bold",
                    lang === l ? "bg-gold border-gold text-dark" : "border-white/10"
                  )}
                >
                  {l === 'ru' ? 'Русский' : l === 'ky' ? 'Кыргызча' : 'English'}
                </button>
              ))}
            </div>
            {!user && (
              <button onClick={onLogin} className="bg-gold text-dark px-6 py-3 rounded-full font-bold uppercase text-sm tracking-widest">
                {t.nav.signIn}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ lang }: { lang: Language }) => {
  const t = translations[lang].hero;
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1512690196236-d5a234e73751?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-50"
          alt="Luxury Barbershop Interior"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/20 via-dark/60 to-dark"></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src="https://storage.googleapis.com/test-media-genai-studio/gen-lang-client-0202024111/input_file_0.png" 
            alt="Logo" 
            className="w-48 h-auto mx-auto mb-8"
            referrerPolicy="no-referrer"
          />
          <p className="text-gold uppercase tracking-[0.5em] mb-4 text-sm font-bold">{t.subtitle}</p>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
            {t.title} <br /> <span className="gold-text">{t.titleGold}</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/60 mb-10 text-lg leading-relaxed">
            {t.description}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="#services" className="bg-gold text-dark px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              {t.btnServices}
            </a>
            <a href="#gallery" className="border border-white/20 hover:border-gold px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-colors">
              {t.btnGallery}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = ({ lang }: { lang: Language }) => {
  const t = translations[lang].about;
  return (
    <section id="about" className="py-24 px-6 bg-dark-lighter">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden border-2 border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <img 
              src="https://images.unsplash.com/photo-1621605815971-fbc388ad7383?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover"
              alt="Premium Interior"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 glass p-8 rounded-2xl hidden md:block">
            <div className="flex items-center gap-4 mb-4">
              <Gamepad2 className="text-gold w-8 h-8" />
              <span className="font-serif text-xl">{t.gamingZone}</span>
            </div>
            <p className="text-sm text-white/60 max-w-[200px]">
              {t.gamingDesc}
            </p>
          </div>
        </div>

        <div>
          <p className="text-gold uppercase tracking-widest mb-4 font-bold">{t.tag}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">{t.title}</h2>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            {t.description}
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-serif text-gold">{t.statChairs}</span>
              <span className="text-sm uppercase tracking-widest text-white/40">{t.statChairsDesc}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-serif text-gold">{t.statGaming}</span>
              <span className="text-sm uppercase tracking-widest text-white/40">{t.statGamingDesc}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-serif text-gold">{t.statBarbers}</span>
              <span className="text-sm uppercase tracking-widest text-white/40">{t.statBarbersDesc}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-serif text-gold">{t.statAtmosphere}</span>
              <span className="text-sm uppercase tracking-widest text-white/40">{t.statAtmosphereDesc}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="max-w-2xl w-full"
    >
      <img 
        src="https://storage.googleapis.com/test-media-genai-studio/gen-lang-client-0202024111/input_file_0.png" 
        alt="AMMOR STYLE Logo" 
        className="w-full h-auto"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  </motion.div>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [lang, setLang] = useState<Language>('ru');
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.email === "q8726426@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(data);
        if (user?.email && (data.admins.includes(user.email) || user.email === "q8726426@gmail.com")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        // Only super-admin or admin should initialize settings
        if (user?.email === "q8726426@gmail.com") {
          const initialSettings: SiteSettings = {
            instagramUrl: "https://instagram.com/ammorstyle",
            phoneNumber: "+996 550 73 78 27",
            autoReplyMessage: "Welcome to AMMOR STYLE UZGEN. Please choose your service or ask your question.",
            admins: ["q8726426@gmail.com"]
          };
          setDoc(doc(db, 'settings', 'config'), initialSettings).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, 'settings/config');
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });

    // Fetch Services
    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('order')), (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    // Fetch Gallery
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
    });

    return () => {
      unsubSettings();
      unsubServices();
      unsubGallery();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold"></div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && isAdmin && (
          <AdminPanel onClose={() => setShowAdmin(false)} lang={lang} />
        )}
      </AnimatePresence>
      
      <Navbar 
        user={user} 
        isAdmin={isAdmin} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onOpenAdmin={() => setShowAdmin(true)} 
        lang={lang}
        setLang={setLang}
      />
      
      <Hero lang={lang} />
      <About lang={lang} />

      {/* Services Section */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold uppercase tracking-widest mb-4 font-bold">{t.services.tag}</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">{t.services.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {services.length > 0 ? services.map(service => (
              <div key={service.id} className="group flex flex-col gap-2 border-b border-white/10 pb-6 hover:border-gold transition-colors">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-serif group-hover:text-gold transition-colors">{service.name}</h3>
                  <div className="flex-grow border-b border-dotted border-white/20 mx-4 mb-1"></div>
                  <span className="text-gold font-bold">{service.price}</span>
                </div>
                <div className="flex justify-between text-sm text-white/40">
                  <p>{service.description}</p>
                  <span>{service.duration}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center text-white/40 py-12">
                {t.services.empty}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 bg-dark-lighter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold uppercase tracking-widest mb-4 font-bold">{t.gallery.tag}</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">{t.gallery.title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {gallery.map(item => (
              item.type === 'before_after' && item.beforeUrl && item.afterUrl ? (
                <BeforeAfterSlider 
                  key={item.id}
                  before={item.beforeUrl}
                  after={item.afterUrl}
                  title={item.title || t.gallery.transformation}
                  master="AMMOR"
                />
              ) : (
                <div key={item.id} className="aspect-[4/5] rounded-xl overflow-hidden border border-white/10 group">
                  <img 
                    src={item.url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Gallery"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">{t.contact.title}</h2>
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{t.contact.location}</p>
                  <p className="text-lg">{t.contact.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{t.contact.call}</p>
                  <a href={`tel:${settings?.phoneNumber}`} className="text-lg hover:text-gold transition-colors">
                    {settings?.phoneNumber || "+996 550 73 78 27"}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{t.contact.hours}</p>
                  <p className="text-lg">{t.contact.hoursVal}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center">
            <Instagram className="text-gold w-16 h-16 mb-6" />
            <h3 className="text-2xl font-serif mb-4">{t.contact.bookTitle}</h3>
            <p className="text-white/60 mb-8">
              {t.contact.bookDesc}
            </p>
            <a 
              href={settings?.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gold text-dark px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              {t.contact.bookBtn} <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Scissors className="text-gold w-6 h-6" />
          <span className="text-xl font-serif font-bold tracking-tighter uppercase">
            AMMOR STYLE <span className="text-gold">UZGEN</span>
          </span>
        </div>
        <p className="text-white/30 text-xs uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} AMMOR STYLE UZGEN. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
