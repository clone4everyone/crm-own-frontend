import React, { useEffect, useState } from 'react';

const Snowfall = ({ snowflakeCount = 50, duration = 12 }) => {
  const [snowflakes, setSnowflakes] = useState([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const flakes = Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 3 + 5,
      opacity: Math.random() * 0.6 + 0.4,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 5,
    }));
    setSnowflakes(flakes);

    // Stop snowfall after duration
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [snowflakeCount, duration]);

  if (!isActive) return null; // ❗ Stop rendering completely

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall"
          style={{
            left: `${flake.left}%`,
            top: '-10%',
            opacity: flake.opacity,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-200">
            <path d="M12 2L10 8L4 10L10 12L12 18L14 12L20 10L14 8L12 2Z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Snowfall;
