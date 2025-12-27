function AdminActionCard({ title, description, color }) {
  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition ${color}`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}

export default AdminActionCard;
