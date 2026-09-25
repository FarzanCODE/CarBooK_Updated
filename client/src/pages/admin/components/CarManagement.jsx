import { Pencil, Plus, Trash2 } from "lucide-react";
import CarForm from "./CarForm";

const statusClass = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  maintenance: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  inactive: "border-gray-500/30 bg-gray-500/10 text-gray-300",
};

const CarManagement = ({ cars, editingCar, showForm, submitting, onAdd, onEdit, onCancel, onSave, onDelete }) => (
  <div className="space-y-5">
    {!showForm && <div className="flex justify-end"><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold"><Plus size={17} /> Add vehicle</button></div>}
    {showForm && <CarForm car={editingCar} onSubmit={onSave} onCancel={onCancel} submitting={submitting} />}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cars.map((car) => (
        <article key={car._id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
          <div className="aspect-[16/9] bg-black/20">{car.images?.[0] ? <img src={car.images[0]} alt={`${car.brand} ${car.name}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-gray-700">No image</div>}</div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{car.brand} {car.name}</h3><p className="mt-1 text-sm text-gray-500">{car.location}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[car.operationalStatus]}`}>{car.operationalStatus}</span></div>
            <div className="mt-4 flex items-end justify-between"><div><div className="text-xs text-gray-500">Daily price</div><div className="text-lg font-bold text-primary">₹{Number(car.pricing?.perDay || 0).toLocaleString("en-IN")}</div></div><div className="flex gap-2"><button onClick={() => onEdit(car)} className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5"><Pencil size={16} /></button><button onClick={() => onDelete(car)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"><Trash2 size={16} /></button></div></div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default CarManagement;
