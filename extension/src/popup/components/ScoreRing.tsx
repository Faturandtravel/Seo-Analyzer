import React, { useEffect, useRef } from 'react';
import { getSeoGrade } from '../../utils/seoCalculator';

interface ScoreRingProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 120, animate = true }) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const { grade, color, label } = getSeoGrade(score);

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    const el = circleRef.current;
    el.style.strokeDashoffset = String(circumference);
    const timer = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      el.style.strokeDashoffset = String(offset);
    });
    return () => cancelAnimationFrame(timer);
  }, [score, offset, circumference, animate]);

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-ring-svg">
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />

        {/* Progress ring */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#glow)"
          style={{ transition: animate ? undefined : 'none' }}
        />
      </svg>

      {/* Center text */}
      <div className="score-ring-center">
        <span className="score-ring-number" style={{ color }}>
          {score}
        </span>
        <span className="score-ring-grade" style={{ color }}>
          {grade}
        </span>
        <span className="score-ring-label">{label}</span>
      </div>
    </div>
  );
};
