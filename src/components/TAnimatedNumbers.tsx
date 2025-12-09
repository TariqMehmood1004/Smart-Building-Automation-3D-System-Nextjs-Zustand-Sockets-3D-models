"use client";
import { motion, useMotionValue, useTransform, animate, useMotionTemplate } from "framer-motion";
import { useEffect } from "react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  className?: string;
};

export default function TAnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);

  const rounded = useTransform(motionValue, (latest) =>
    Number(latest).toFixed(decimals)
  );

  // Combine the motion value with static text
  const display = useMotionTemplate`${rounded}°C`;

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}


export function TAnimatedWattNumber({ value, decimals = 2, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);

  const rounded = useTransform(motionValue, (latest) =>
    Number(latest).toFixed(decimals)
  );

  const display = useMotionTemplate`${rounded}`;

  useEffect(() => {
    const controls = animate(motionValue, value, {
      type: "keyframes",
      stiffness: 150,
      damping: 20,
      mass: 0.5,
      duration: 0.8,
    });

    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}