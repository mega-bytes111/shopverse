const RatingStars = ({ value = 0, outOf = 5 }) => {
  const rounded = Math.round(Number(value) || 0);

  return (
    <span title={`${value} / ${outOf}`}>
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < rounded;
        return (
          <span key={i} style={{ color: filled ? "#f59e0b" : "#d1d5db" }}>
            ★
          </span>
        );
      })}
    </span>
  );
};

export default RatingStars;