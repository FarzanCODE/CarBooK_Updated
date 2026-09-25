import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

const inputClass = "w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white placeholder:text-gray-600 focus:border-primary";

const ContentManager = ({ settings, onSaveFounder, onAddTestimonial, onDeleteTestimonial, submitting }) => {
  const [founder, setFounder] = useState({ name: "", role: "", bio: "" });
  const [founderImage, setFounderImage] = useState(null);
  const [testimonial, setTestimonial] = useState({ name: "", city: "", text: "", rating: 5 });

  useEffect(() => {
    setFounder({ name: settings?.founder?.name || "", role: settings?.founder?.role || "", bio: settings?.founder?.bio || "" });
  }, [settings]);

  const saveFounder = (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(founder).forEach(([key, value]) => data.append(key, value));
    if (founderImage) data.append("image", founderImage);
    onSaveFounder(data);
  };

  const addTestimonial = async (event) => {
    event.preventDefault();
    const success = await onAddTestimonial({ ...testimonial, rating: Number(testimonial.rating) });
    if (success) setTestimonial({ name: "", city: "", text: "", rating: 5 });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <form onSubmit={saveFounder} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <h2 className="text-xl font-bold text-white">Project profile</h2><p className="mt-1 text-sm text-gray-500">Homepage developer section</p>
        <div className="mt-5 space-y-3"><input required className={inputClass} value={founder.name} onChange={(e) => setFounder({ ...founder, name: e.target.value })} placeholder="Name" /><input required className={inputClass} value={founder.role} onChange={(e) => setFounder({ ...founder, role: e.target.value })} placeholder="Role" /><textarea required className={`${inputClass} min-h-32`} value={founder.bio} onChange={(e) => setFounder({ ...founder, bio: e.target.value })} placeholder="Bio" /><input className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFounderImage(e.target.files?.[0] || null)} /></div>
        <button disabled={submitting} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50"><Save size={16} /> Save profile</button>
      </form>
      <div className="space-y-5">
        <form onSubmit={addTestimonial} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><h2 className="text-xl font-bold text-white">Testimonials</h2><p className="mt-1 text-sm text-gray-500">Use only genuine feedback</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required className={inputClass} value={testimonial.name} onChange={(e) => setTestimonial({ ...testimonial, name: e.target.value })} placeholder="Name" /><input required className={inputClass} value={testimonial.city} onChange={(e) => setTestimonial({ ...testimonial, city: e.target.value })} placeholder="City" /><textarea required className={`${inputClass} min-h-24 sm:col-span-2`} value={testimonial.text} onChange={(e) => setTestimonial({ ...testimonial, text: e.target.value })} placeholder="Feedback" /><select className={inputClass} value={testimonial.rating} onChange={(e) => setTestimonial({ ...testimonial, rating: e.target.value })}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></div><button disabled={submitting} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary"><Plus size={16} /> Add testimonial</button></form>
        <div className="space-y-2">{(settings?.testimonials || []).map((item) => <div key={item._id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div><div className="font-semibold text-white">{item.name} · {item.city}</div><p className="mt-1 text-sm text-gray-400">{item.text}</p></div><button onClick={() => onDeleteTestimonial(item._id)} className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300"><Trash2 size={15} /></button></div>)}</div>
      </div>
    </div>
  );
};

export default ContentManager;
