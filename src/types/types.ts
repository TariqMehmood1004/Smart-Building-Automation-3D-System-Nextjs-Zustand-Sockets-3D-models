import { Power, Minus, Plus, Wind, Flame, Sun, Fan } from 'lucide-react';

export const MideaRunModes = [
    { id: 'auto', label: 'Auto',    mode: 192,  icon: Wind, color: 'text-emerald-400',  bg: '#27AE60', image: '/icons/AutoIcon.svg' },
    { id: 'cool', label: 'Cool',    mode: 66,  icon: Wind,  color: 'text-blue-400',     bg: '#3498DB', image: '/icons/CoolIcon.svg' },
    { id: 'heat', label: 'Heat',    mode: 67,  icon: Flame, color: 'text-orange-400',   bg: '#E67E22', image: '/icons/HeatIcon.svg' },
    { id: 'dry', label: 'Dry',      mode: 70,  icon: Sun,   color: 'text-yellow-400',   bg: '#F1C40F', image: '/icons/DryIcon.svg' },
    { id: 'fan', label: 'Fan',      mode: 65,  icon: Fan,   color: 'text-purple-400',   bg: '#8E44AD', image: '/icons/FanIcon.svg' }
];

// activeStatus
export type activeStatus = 'Auto' | 'Cool' | 'Heat' | 'Dry' | 'Fan';

export const getActiveStatus = (runMode: number): activeStatus => {
    const mode = MideaRunModes.find(m => m.mode === runMode);
    if (!mode) return 'Auto';
    
    return mode.id.charAt(0).toUpperCase() + mode.id.slice(1) as activeStatus;
};