import { useCallback, useEffect, useState } from "react";
import { Car, FileText, ListChecks, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import Loader from "../../components/Loader";
import StatsGrid from "./components/StatsGrid";
import BookingTable from "./components/BookingTable";
import CarManagement from "./components/CarManagement";
import ContentManager from "./components/ContentManager";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, carsRes, settingsRes] = await Promise.all([
        axiosInstance.get("/bookings/admin/stats"),
        axiosInstance.get("/bookings/admin/all?limit=50"),
        axiosInstance.get("/cars/admin/all?limit=50"),
        axiosInstance.get("/home-settings"),
      ]);
      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings);
      setCars(carsRes.data.cars);
      setSettings(settingsRes.data.settings);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const completeBooking = async (id) => {
    try {
      await axiosInstance.put(`/bookings/${id}/complete`);
      toast.success("Booking completed");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not complete booking");
    }
  };


  const saveCar = async (formData, localError) => {
    if (localError) return toast.error(localError);
    setSubmitting(true);
    try {
      if (editingCar) await axiosInstance.put(`/cars/${editingCar._id}`, formData);
      else await axiosInstance.post("/cars", formData);
      toast.success(editingCar ? "Vehicle updated" : "Vehicle added");
      setShowCarForm(false);
      setEditingCar(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCar = async (car) => {
    if (!window.confirm(`Remove ${car.brand} ${car.name}? Vehicles with history are archived instead of deleted.`)) return;
    try {
      const { data } = await axiosInstance.delete(`/cars/${car._id}`);
      toast.success(data.message);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove vehicle");
    }
  };

  const saveFounder = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.put("/home-settings/founder", formData);
      setSettings(data.settings);
      toast.success("Homepage profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const addTestimonial = async (payload) => {
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/home-settings/testimonial", payload);
      setSettings(data.settings);
      toast.success("Testimonial added");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add testimonial");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const { data } = await axiosInstance.delete(`/home-settings/testimonial/${id}`);
      setSettings(data.settings);
      toast.success("Testimonial deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete testimonial");
    }
  };

  if (loading) return <Loader />;

  const tabs = [
    { id: "bookings", label: "Bookings", icon: ListChecks },
    { id: "cars", label: "Fleet", icon: Car },
    { id: "content", label: "Homepage", icon: FileText },
  ];

  return (
    <main className="min-h-screen pb-16 pt-32">
      <div className="page-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Administration</p><h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">CarBook control center</h1><p className="mt-2 max-w-2xl text-gray-500">Fleet operations, reservation lifecycle and homepage content in one place.</p></div>
          <button onClick={load} className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/[0.07]"><RefreshCw size={16} /> Refresh</button>
        </div>
        <div className="mt-8"><StatsGrid stats={stats} /></div>
        <div className="mt-8 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.025] p-1.5">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${activeTab === id ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}><Icon size={16} /> {label}</button>)}</div>
        <section className="mt-5">
          {activeTab === "bookings" && <BookingTable bookings={bookings} onComplete={completeBooking} />}
          {activeTab === "cars" && <CarManagement cars={cars} editingCar={editingCar} showForm={showCarForm} submitting={submitting} onAdd={() => { setEditingCar(null); setShowCarForm(true); }} onEdit={(car) => { setEditingCar(car); setShowCarForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} onCancel={() => { setShowCarForm(false); setEditingCar(null); }} onSave={saveCar} onDelete={deleteCar} />}
          {activeTab === "content" && <ContentManager settings={settings} submitting={submitting} onSaveFounder={saveFounder} onAddTestimonial={addTestimonial} onDeleteTestimonial={deleteTestimonial} />}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
