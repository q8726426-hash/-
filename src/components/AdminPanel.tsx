import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Scissors, 
  Settings as SettingsIcon,
  LayoutDashboard,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { cn } from '../lib/utils';
import { translations, Language } from '../translations';

interface AdminPanelProps {
  onClose: () => void;
  lang: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'services' | 'gallery'>('settings');
  const t = translations[lang].admin;
  const [settings, setSettings] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  
  // Form states
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', description: '' });
  const [newPhoto, setNewPhoto] = useState({ url: '', type: 'normal' as 'normal' | 'before_after', beforeUrl: '', afterUrl: '', title: '' });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (s) => setSettings(s.data()), (err) => handleFirestoreError(err, OperationType.GET, 'settings/config'));
    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('order')), (s) => setServices(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.LIST, 'services'));
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (s) => setGallery(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.LIST, 'gallery'));
    
    return () => {
      unsubSettings();
      unsubServices();
      unsubGallery();
    };
  }, []);

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'settings', 'config'), settings);
      alert("Settings updated!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings/config');
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'services'), { ...newService, order: services.length });
      setNewService({ name: '', price: '', duration: '', description: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'services');
    }
  };

  const deleteService = async (id: string) => {
    if (confirm("Delete this service?")) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      }
    }
  };

  const addPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'gallery'), { ...newPhoto, createdAt: serverTimestamp() });
      setNewPhoto({ url: '', type: 'normal', beforeUrl: '', afterUrl: '', title: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'gallery');
    }
  };

  const deletePhoto = async (id: string) => {
    if (confirm("Delete this photo?")) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-dark flex flex-col md:flex-row"
    >
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-dark-lighter border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 mb-4">
          <Scissors className="text-gold w-6 h-6" />
          <span className="font-serif font-bold tracking-tighter uppercase text-lg">{t.panel}</span>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'settings' ? "bg-gold text-dark font-bold" : "hover:bg-white/5")}
          >
            <SettingsIcon size={20} /> {t.settings}
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'services' ? "bg-gold text-dark font-bold" : "hover:bg-white/5")}
          >
            <LayoutDashboard size={20} /> {t.services}
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'gallery' ? "bg-gold text-dark font-bold" : "hover:bg-white/5")}
          >
            <Camera size={20} /> {t.gallery}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60"
        >
          <ArrowLeft size={20} /> {t.back}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && settings && (
            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-serif mb-8">General Settings</h2>
              <form onSubmit={updateSettings} className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Instagram URL</label>
                  <input 
                    type="text" 
                    value={settings.instagramUrl} 
                    onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={settings.phoneNumber} 
                    onChange={e => setSettings({...settings, phoneNumber: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Instagram Auto-Reply Message</label>
                  <textarea 
                    value={settings.autoReplyMessage} 
                    onChange={e => setSettings({...settings, autoReplyMessage: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <button type="submit" className="bg-gold text-dark px-8 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2">
                  <Save size={20} /> {t.save}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-serif mb-8">Manage Services</h2>
              
              <form onSubmit={addService} className="grid md:grid-cols-2 gap-4 mb-12 bg-white/5 p-6 rounded-2xl border border-white/10">
                <input 
                  placeholder="Service Name" 
                  value={newService.name} 
                  onChange={e => setNewService({...newService, name: e.target.value})}
                  className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                  required
                />
                <input 
                  placeholder="Price (e.g. 500 SOM)" 
                  value={newService.price} 
                  onChange={e => setNewService({...newService, price: e.target.value})}
                  className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                  required
                />
                <input 
                  placeholder="Duration (e.g. 45 min)" 
                  value={newService.duration} 
                  onChange={e => setNewService({...newService, duration: e.target.value})}
                  className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                />
                <input 
                  placeholder="Short Description" 
                  value={newService.description} 
                  onChange={e => setNewService({...newService, description: e.target.value})}
                  className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                />
                <button type="submit" className="md:col-span-2 bg-gold text-dark py-3 rounded-xl font-bold uppercase tracking-widest flex justify-center items-center gap-2">
                  <Plus size={20} /> {t.addService}
                </button>
              </form>

              <div className="space-y-4">
                {services.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <h4 className="font-bold">{s.name}</h4>
                      <p className="text-sm text-white/40">{s.price} • {s.duration}</p>
                    </div>
                    <button onClick={() => deleteService(s.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-serif mb-8">Gallery Management</h2>

              <form onSubmit={addPhoto} className="space-y-4 mb-12 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewPhoto({...newPhoto, type: 'normal'})}
                    className={cn("flex-1 py-3 rounded-xl border transition-all", newPhoto.type === 'normal' ? "border-gold text-gold bg-gold/10" : "border-white/10")}
                  >
                    {t.normal}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewPhoto({...newPhoto, type: 'before_after'})}
                    className={cn("flex-1 py-3 rounded-xl border transition-all", newPhoto.type === 'before_after' ? "border-gold text-gold bg-gold/10" : "border-white/10")}
                  >
                    {t.beforeAfter}
                  </button>
                </div>

                {newPhoto.type === 'normal' ? (
                  <input 
                    placeholder="Photo URL" 
                    value={newPhoto.url} 
                    onChange={e => setNewPhoto({...newPhoto, url: e.target.value})}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3"
                    required
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Before Photo URL" 
                      value={newPhoto.beforeUrl} 
                      onChange={e => setNewPhoto({...newPhoto, beforeUrl: e.target.value})}
                      className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                      required
                    />
                    <input 
                      placeholder="After Photo URL" 
                      value={newPhoto.afterUrl} 
                      onChange={e => setNewPhoto({...newPhoto, afterUrl: e.target.value})}
                      className="bg-dark border border-white/10 rounded-xl px-4 py-3"
                      required
                    />
                    <input 
                      placeholder="Title (e.g. Skin Fade)" 
                      value={newPhoto.title} 
                      onChange={e => setNewPhoto({...newPhoto, title: e.target.value})}
                      className="md:col-span-2 bg-dark border border-white/10 rounded-xl px-4 py-3"
                    />
                  </div>
                )}
                <button type="submit" className="w-full bg-gold text-dark py-3 rounded-xl font-bold uppercase tracking-widest flex justify-center items-center gap-2">
                  <Plus size={20} /> {t.addGallery}
                </button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map(p => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img 
                      src={p.type === 'normal' ? p.url : p.afterUrl} 
                      className="w-full h-full object-cover" 
                      alt="Gallery"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deletePhoto(p.id)} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    {p.type === 'before_after' && (
                      <div className="absolute top-2 left-2 bg-gold text-dark text-[8px] font-bold px-2 py-1 rounded uppercase">B/A</div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
