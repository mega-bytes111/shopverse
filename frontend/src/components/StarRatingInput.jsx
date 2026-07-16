const StarRatingInput = ({ value, onChange, outOf = 5 }) => {
  return (
    <div>
      {Array.from({ length: outOf }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 22,
              padding: 0,
              color: filled ? "#f59e0b" : "#d1d5db",
            }}
            aria-label={`Rate ${starValue}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;