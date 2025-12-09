import React, { useState } from 'react';
import { Power, Minus, Plus, Wind, Flame, Sun, Fan, Loader, Loader2 } from 'lucide-react';
import { Button } from '@heroui/button';
import { useMideaStore } from '@/stores/useMideaStore';
import { HvacMideaDevice } from "@/types/midea-types";
import TCornerButton from './TCornerButton';
import TCircularTemperatureDial from './TCircularTemperatureDial';
import Image from 'next/image';


interface ACControlDrawerProps {
    data: HvacMideaDevice[] | null,
    isMatchedRoom?: boolean,
    onClose: () => void
};

const ACControlDrawer = ({ data, onClose, isMatchedRoom }: ACControlDrawerProps) => {

    const {
        devicePowerOnOff,
        isDevicePowerOnLoading,
        isMasterPowerOn,
        masterPowerOnOff,
    } = useMideaStore();

    const device = data ? data[0] : null;

    const [temperature, setTemperature] = useState(device?.set_temperature || 0);

    const [selectedMode, setSelectedMode] = useState('auto');
    const [swingThrow, setSwingThrow] = useState(true);
    const [fanSpeed, setFanSpeed] = useState(60);

    const modes = [
        { id: 'auto', label: 'Auto', icon: Wind, color: 'text-emerald-400', image: '/icons/AutoIcon.svg' },
        { id: 'cool', label: 'Cool', icon: Wind, color: 'text-blue-400', image: '/icons/CoolIcon.svg' },
        { id: 'heat', label: 'Heat', icon: Flame, color: 'text-orange-400', image: '/icons/HeatIcon.svg' },
        { id: 'dry', label: 'Dry', icon: Sun, color: 'text-yellow-400', image: '/icons/DryIcon.svg' },
        { id: 'fan', label: 'Fan', icon: Fan, color: 'text-purple-400', image: '/icons/FanIcon.svg' }
    ];

    const locks = [
        { id: 'cool-lock', label: 'Cool Lock', icon: Wind },
        { id: 'heat-lock', label: 'Heat Lock', icon: Flame },
        { id: 'onoff-lock', label: 'On/Off Lock', icon: Power },
        { id: 'remote-lock', label: 'Remote Lock', icon: 'remote' },
        { id: 'max-temp', label: 'Max Temp Lock', icon: 'temp-max' },
        { id: 'min-temp', label: 'Min Temp Lock', icon: 'temp-min' },
        { id: 'wired-control', label: 'Wired Control Lock', icon: 'wired', fullWidth: true }
    ];

    const handlePowerOnOff = () => {
        devicePowerOnOff(device?.deviceSn || '');
    };

    return (
        <div className="w-full mx-auto bg-[#16161A] text-white border border-[#0D8FAC] shadow-2xl relative overflow-hidden">

            {/* Cyan corners decoration */}
            <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-1/2 -translate-x-1/2 z-[999]"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
                }}
            >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
            </div>

            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 right-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 right-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-0 z-[999]"></span>

            <div
                className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-1/2 -translate-x-1/2 z-[999]"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
            >
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
            </div>

            {/* Header */}
            <section className='h-[80vh] overflow-y-scroll custom-scrollbar p-6'>
                {!isMatchedRoom ? (
                    <>
                        <div className="w-full h-full flex items-center justify-center text-red-500 text-lg mb-4 text-center font-semibold">
                            <p>Warning: No matching information found</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onPress={onClose} className="text-gray-400 w-12 focus:outline-none h-12 text-lg text-center hover:text-white transition-colors cursor-pointer rounded-full">
                                <Image src="/icons/CloseIcon.svg" alt="Close" width={24} height={24} />
                            </Button>

                            <TCornerButton
                                text={"M"}
                                isLoading={isMasterPowerOn}
                                bgColor="#2d2c31"
                                borderColor='#179BB9'
                                onPress={masterPowerOnOff}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="px-4 space-y-6">
                            {/* Power Dial */}
                            <div className="flex justify-center mb-8">
                                <TCircularTemperatureDial
                                    id="temperature-dial"
                                    value={temperature}
                                    onClick={handlePowerOnOff}
                                    isLoading={isDevicePowerOnLoading}
                                    runMode={device?.run_mode}
                                    device_sn={device?.deviceSn}
                                    device_name={device?.name}
                                    onChange={(value) => {
                                        setTemperature(value);

                                        // if value is less than 16, set it to 16, if it is greater than 30, set it to 30
                                        if (value < 16) {
                                            setTemperature(16);
                                        } else if (value > 30) {
                                            setTemperature(30);
                                        }
                                    }}
                                    min={16}
                                    max={30}
                                    step={1}
                                />
                            </div>

                            {/* Temperature Control */}
                            <div className="flex h-20 items-center justify-center gap-8 mb-8">
                                <TCornerButton
                                    icon={<Minus size={26} />}
                                    onPress={() => {
                                        setTemperature(Math.max(16, temperature - 1));

                                        // if value is less than 16, set it to 16
                                        if (Number(temperature) < 16) {
                                            setTemperature(16);
                                        }
                                    }}
                                    isBorderActive={true}
                                    className='w-9 h-9 rounded-tl-lg rounded-br-lg bg-transparent orbitron-font'
                                />

                                <div className="text-center">
                                    <div className="relative flex items-start gap-1 font-bold tracking-tight orbitron-font">
                                        <input
                                            type="number"
                                            value={temperature.toString()}
                                            onChange={(e) => {
                                                setTemperature(Number(e.target.value))

                                                // if value is less than 16, set it to 16, if it is greater than 30, set it to 30
                                                if (Number(e.target.value) < 16) {
                                                    setTemperature(16);
                                                } else if (Number(e.target.value) > 30) {
                                                    setTemperature(30);
                                                }
                                            }}
                                            className="
                                            bg-transparent
                                            shadow-none
                                            outline-none
                                            border-none
                                            focus:outline-none 
                                            focus:ring-0 
                                            p-0 
                                            w-[115px]
                                            text-center
                                            text-[48px]
                                            font-[600] 
                                            tracking-tight
                                            "
                                        />
                                        <span className="text-[48px] leading-none ml-[-10px]">°</span>
                                    </div>
                                </div>

                                <TCornerButton
                                    icon={<Plus size={26} />}
                                    onPress={() => {
                                        setTemperature(Math.max(16, temperature + 1));

                                        // if value is greater than 30, set it to 30
                                        if (Number(temperature) > 29) {
                                            setTemperature(30);
                                        }
                                    }}
                                    isBorderActive={true}
                                    className='w-9 h-9 rounded-tl-lg rounded-br-lg bg-transparent orbitron-font'
                                />
                            </div>

                            {/* Mode Selection */}
                            <div className="flex items-center gap-3 mb-6">
                                {modes.map((mode) => {
                                    return (
                                        <TCornerButton
                                            key={mode.id}
                                            image={mode.image}
                                            text={mode.label}
                                            textSize="text-sm"
                                            bgColor="#2d2c31"
                                            borderColor="#27AE60"
                                            height="h-[90px]"
                                            width='w-[90px]'
                                            isActive={selectedMode === mode.id}
                                            onPress={() => setSelectedMode(mode.id)}
                                            className={`
                                                text-[16px] font-[600]
                                            `}
                                        />
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-dashed border-gray-700 my-6"></div>

                            {/* Fan Speed Slider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full relative"
                                            style={{ width: `${fanSpeed}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-yellow-400 rounded-full shadow-lg"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-gray-600"></div>
                                <Fan className="text-emerald-400" size={28} />
                            </div>

                            {/* Swing Throw */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium">Swing Throw</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-300">ON</span>
                                    <button
                                        onClick={() => setSwingThrow(!swingThrow)}
                                        className={`w-14 h-14 rounded transition-all ${swingThrow
                                                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                                : 'bg-gray-700'
                                            }`}
                                    >
                                    </button>
                                </div>
                            </div>

                            {/* Lock Controls Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {locks.slice(0, 6).map((lock) => (
                                    <button
                                        key={lock.id}
                                        className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all group"
                                    >
                                        {lock.icon === 'remote' ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-300">
                                                <rect x="8" y="4" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                                                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                                            </svg>
                                        ) : lock.icon === 'temp-max' ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-300">
                                                <path d="M12 2v10M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        ) : lock.icon === 'temp-min' ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-300">
                                                <path d="M12 12v10M8 18l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        ) : lock.icon === 'wired' ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-300">
                                                <path d="M3 12h6m6 0h6M9 12a3 3 0 116 0 3 3 0 01-6 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            React.createElement(lock.icon, { size: 24, className: "text-gray-400 group-hover:text-gray-300" })
                                        )}
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                            {lock.label}
                                        </span>
                                    </button>
                                ))}

                                {/* Wired Control Lock - Full Width */}
                                <button className="col-span-2 flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all group">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-300">
                                        <path d="M3 12h6m6 0h6M9 12a3 3 0 116 0 3 3 0 01-6 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                        Wired Control Lock
                                    </span>
                                </button>
                            </div>
                        </div>
                    </>
                )
                }
            </section>
        </div>
    );
};

export default ACControlDrawer;