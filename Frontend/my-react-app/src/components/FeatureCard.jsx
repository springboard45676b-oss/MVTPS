function FeatureCard({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-6 text-white
                 flex flex-col justify-between
                 transition hover:scale-[1.02] hover:shadow-lg
                 bg-blue-600"
    >
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>

      <span className="text-2xl mt-4">→</span>
    </div>
  );
}

export default FeatureCard;
