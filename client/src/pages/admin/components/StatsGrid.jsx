import { CalendarCheck, Car, CircleDollarSign, CheckCircle2 } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
      <Icon size={20} />
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="mt-1 text-sm font-medium text-gray-300">{label}</div>
    <div className="mt-1 text-xs text-gray-500">{detail}</div>
  </div>
);

const StatsGrid = ({ stats }) => {
  const cards = [
    { icon: CalendarCheck, label: "Bookings", value: stats?.totalBookings || 0, detail: `${stats?.confirmedBookings || 0} currently confirmed` },
    { icon: CheckCircle2, label: "Completed", value: stats?.completedBookings || 0, detail: `${stats?.cancelledBookings || 0} cancelled` },
    { icon: Car, label: "Fleet", value: stats?.totalCars || 0, detail: `${stats?.activeCars || 0} active vehicles` },
    { icon: CircleDollarSign, label: "Paid revenue", value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`, detail: "Excludes refunded payments" },
  ];

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.label} {...card} />)}</div>;
};

export default StatsGrid;
