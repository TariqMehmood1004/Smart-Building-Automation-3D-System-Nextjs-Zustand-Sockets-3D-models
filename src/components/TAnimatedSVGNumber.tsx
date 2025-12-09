"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

type AnimatedSVGNumberProps = {
  value: number;
  decimals?: number;
};

export default function TAnimatedSVGNumber({ value, decimals = 0 }: AnimatedSVGNumberProps) {
  const motionValue = useMotionValue(value);

  const rounded = useTransform(motionValue, (latest) =>
    Number(latest).toFixed(decimals)
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  // Use <tspan> so it works inside <text> in SVG
  return <motion.tspan>{rounded}</motion.tspan>;
}
