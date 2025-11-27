import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) navigate("/dashboard");
      else navigate("/login");
    }, 5600);

    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden px-4 text-center relative">

      {/* Animated Text Brand */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 animate-fadeSlideUp">
        <span className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-red-600 animate-pulseSlow">
          B
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl tracking-wide font-light text-white animate-smoothReveal">
          EING
        </span>
        <span className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-red-600 animate-pulseSlow ml-1">
          D
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl tracking-wide font-light text-white animate-smoothReveal">
          IPLOMATIC
        </span>
      </div>

      {/* Animated Tagline */}
      <p className="text-gray-300 mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl tracking-wide opacity-0 animate-taglineFade">
        You Grow, We Grow Together
      </p>

      {/* Soft Glow Background Effects */}
      <div className="absolute w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full bg-red-600 opacity-20 blur-3xl -z-10 animate-floatingBlob"></div>
      <div className="absolute w-[250px] sm:w-[350px] md:w-[450px] h-[250px] sm:h-[350px] md:h-[450px] rounded-full bg-purple-600 opacity-20 blur-3xl left-10 sm:left-20 animate-floatingBlob delay-1000 -z-10"></div>
    </div>
  );
}
