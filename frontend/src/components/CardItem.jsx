const CardItem = ({ title, count, onClick }) => {
  return (
    <div className="card" onClick={onClick} role="button" tabIndex={0}>
      <div className="card__title">{title}</div>
      <div className="card__count">{count}</div>
      <div className="card__cta">View details →</div>
    </div>
  );
};

export default CardItem;











