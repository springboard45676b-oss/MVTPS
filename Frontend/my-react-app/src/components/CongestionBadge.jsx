function CongestionBadge({ level }) {
  const styles = {
    Low: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    High: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[level]}`}
    >
      {level} Congestion
    </span>
  );
}

export default CongestionBadge;
