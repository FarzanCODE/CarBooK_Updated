import { Check } from "lucide-react";

const statusClass = {
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  payment_failed: "border-red-500/30 bg-red-500/10 text-red-300",
};

const BookingTable = ({ bookings, onComplete }) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-5 py-4">Booking</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Dates</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bookings.map((booking) => (
            <tr key={booking._id} className="hover:bg-white/[0.025]">
              <td className="px-5 py-4">
                <div className="font-semibold text-white">{booking.car ? `${booking.car.brand} ${booking.car.name}` : "Archived vehicle"}</div>
                <div className="mt-1 font-mono text-xs text-gray-600">{booking._id.slice(-8)}</div>
              </td>
              <td className="px-5 py-4">
                <div className="text-gray-200">{booking.user?.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{booking.user?.email}</div>
              </td>
              <td className="px-5 py-4 text-gray-400">
                <div>{new Date(booking.startDate).toLocaleDateString("en-IN")}</div>
                <div className="text-xs">to {new Date(booking.endDate).toLocaleDateString("en-IN")}</div>
              </td>
              <td className="px-5 py-4 font-semibold text-white">₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}</td>
              <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[booking.status] || "border-white/10 text-gray-400"}`}>{booking.status.replace("_", " ")}</span></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {booking.status === "confirmed" && <button onClick={() => onComplete(booking._id)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"><Check size={14} /> Complete</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {!bookings.length && <div className="p-12 text-center text-gray-500">No booking records yet.</div>}
  </div>
);

export default BookingTable;
