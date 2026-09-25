import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

const blank = {
  name: "",
  brand: "",
  category: "Sedan",
  description: "",
  location: "",
  perHour: "",
  perDay: "",
  perWeek: "",
  seats: 5,
  fuelType: "Petrol",
  transmission: "Manual",
  mileage: "",
  year: "",
  operationalStatus: "active",
  packages: "[]",
};

const fieldClass = "w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white placeholder:text-gray-600 focus:border-primary";

const CarForm = ({ car, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(blank);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!car) {
      setForm(blank);
      setImages([]);
      return;
    }
    setForm({
      name: car.name || "",
      brand: car.brand || "",
      category: car.category || "Sedan",
      description: car.description || "",
      location: car.location || "",
      perHour: car.pricing?.perHour || "",
      perDay: car.pricing?.perDay || "",
      perWeek: car.pricing?.perWeek || "",
      seats: car.specs?.seats || 5,
      fuelType: car.specs?.fuelType || "Petrol",
      transmission: car.specs?.transmission || "Manual",
      mileage: car.specs?.mileage || "",
      year: car.specs?.year || "",
      operationalStatus: car.operationalStatus || "active",
      packages: JSON.stringify((car.pricing?.packages || []).map(({ label, price, durationDays }) => ({ label, price, durationDays })), null, 2),
    });
    setImages([]);
  }, [car]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    let packages;
    try {
      packages = JSON.parse(form.packages || "[]");
      if (!Array.isArray(packages)) throw new Error();
    } catch {
      return onSubmit(null, "Packages must be valid JSON array data");
    }
    const data = new FormData();
    Object.entries({ ...form, packages: JSON.stringify(packages) }).forEach(([key, value]) => data.append(key, value));
    images.forEach((image) => data.append("images", image));
    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-white">{car ? "Edit vehicle" : "Add vehicle"}</h2><p className="mt-1 text-sm text-gray-500">Fleet, pricing and operational details</p></div>
        <button type="button" onClick={onCancel} className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"><X size={20} /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input required className={fieldClass} placeholder="Brand" value={form.brand} onChange={set("brand")} />
        <input required className={fieldClass} placeholder="Model" value={form.name} onChange={set("name")} />
        <select className={fieldClass} value={form.category} onChange={set("category")}>{["Sedan", "SUV", "Luxury", "Electric", "Bike/Scooter", "Mini/Hatchback", "General"].map((value) => <option key={value}>{value}</option>)}</select>
        <input required className={fieldClass} placeholder="Location" value={form.location} onChange={set("location")} />
        <input className={fieldClass} type="number" min="0" placeholder="Price per hour" value={form.perHour} onChange={set("perHour")} />
        <input className={fieldClass} type="number" min="0" placeholder="Price per day" value={form.perDay} onChange={set("perDay")} />
        <input className={fieldClass} type="number" min="0" placeholder="Price per week" value={form.perWeek} onChange={set("perWeek")} />
        <select className={fieldClass} value={form.operationalStatus} onChange={set("operationalStatus")}><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select>
        <input className={fieldClass} type="number" min="1" max="60" placeholder="Seats" value={form.seats} onChange={set("seats")} />
        <select className={fieldClass} value={form.fuelType} onChange={set("fuelType")}>{["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map((value) => <option key={value}>{value}</option>)}</select>
        <select className={fieldClass} value={form.transmission} onChange={set("transmission")}>{["Manual", "Automatic", "Semi-Automatic", "CVT", "DCT", "AMT"].map((value) => <option key={value}>{value}</option>)}</select>
        <input className={fieldClass} placeholder="Mileage" value={form.mileage} onChange={set("mileage")} />
        <input className={fieldClass} type="number" min="1990" placeholder="Year" value={form.year} onChange={set("year")} />
        <input className={fieldClass} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setImages(Array.from(event.target.files || []))} />
      </div>
      <textarea className={`${fieldClass} mt-4 min-h-28`} placeholder="Description" value={form.description} onChange={set("description")} />
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">Packages JSON</label>
      <textarea className={`${fieldClass} mt-2 min-h-36 font-mono text-xs`} value={form.packages} onChange={set("packages")} />
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300">Cancel</button><button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50"><Save size={16} /> {submitting ? "Saving" : "Save vehicle"}</button></div>
    </form>
  );
};

export default CarForm;
