import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} flex items-center justify-center select-none text-title`}>
      <svg
        viewBox="0 0 874 753"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M427.872 4.99998C431.721 -1.66664 441.344 -1.66667 445.193 4.99998L871.71 743.75C873.407 746.69 873.419 749.952 872.244 752.683L436.533 414L0.819737 752.684C-0.355716 749.953 -0.34229 746.69 1.35489 743.75L427.872 4.99998Z"
          fill="currentColor"
        />
        <path
          d="M430.624 514.12C434.242 511.293 439.322 511.293 442.94 514.12L728.702 737.43C733.945 741.527 733.491 748.64 729.49 752.545L436.782 709.309L144.072 752.545C140.072 748.64 139.62 741.526 144.862 737.43L430.624 514.12Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Logo;