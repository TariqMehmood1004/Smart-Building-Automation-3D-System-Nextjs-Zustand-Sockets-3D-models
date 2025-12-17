import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Power, Minus, Plus, Wind, Flame, Sun, Fan } from 'lucide-react';
import { Button } from '@heroui/button';
import { useMideaStore } from '@/stores/useMideaStore';
import { HvacMideaDevice } from "@/types/midea-types";
import TCornerButton from './TCornerButton';
import TCircularTemperatureDial from './TCircularTemperatureDial';
import Image from 'next/image';
import toast from 'react-hot-toast';
import TAnimatedNumber from './TAnimatedNumbers';
import TFanSpeedSlider from './TFanSpeedSlider';

interface ACControlDrawerProps {
    data: HvacMideaDevice[] | null,
    isMatchedRoom?: boolean,
    onClose: () => void
};

const ACControlDrawer = ({ 
    data, 
    onClose, 
    isMatchedRoom,
}: ACControlDrawerProps) => {
    const {
        devicePowerOnOff,
        updateDevice,
        isDevicePowerOnLoading,
        isMasterPowerOn,
        masterPowerOnOff,
        data: storeData, // LIVE DATA FROM STORE
    } = useMideaStore();

    const device = data ? data[0] : null;

    // LIVE DEVICE - Always fresh from store
    const liveDevice = useMemo(() => {
        if (!device?.deviceSn || !storeData?.metadata) return device;
        return storeData.metadata.find(d => d.deviceSn === device.deviceSn) || device;
    }, [device, storeData?.metadata]);

    // LIVE VALUES - Sync with store automatically
    const temperature = liveDevice?.set_temperature || 24;
    const runMode = liveDevice?.run_mode || 0;

    // Local states for UX (don't conflict with live data)
    const [selectedMode, setSelectedMode] = useState('auto');
    const [swingThrow, setSwingThrow] = useState(true);
    const [fanSpeed, setFanSpeed] = useState(5);
    const [isMinTempLockOn, setIsMinTempLockOn] = useState(false);
    const [isMaxTempLockOn, setIsMaxTempLockOn] = useState(false);

    const [localTemp, setLocalTemp] = useState(temperature); // For smooth dragging UX
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const modes = [
        { id: 'auto', label: 'Auto',    mode: 192,  icon: Wind, color: 'text-emerald-400',  bg: '#27AE60', image: '/icons/AutoIcon.svg' },
        { id: 'cool', label: 'Cool',    mode: 66,  icon: Wind,  color: 'text-blue-400',     bg: '#3498DB', image: '/icons/CoolIcon.svg' },
        { id: 'heat', label: 'Heat',    mode: 67,  icon: Flame, color: 'text-orange-400',   bg: '#E67E22', image: '/icons/HeatIcon.svg' },
        { id: 'dry', label: 'Dry',      mode: 70,  icon: Sun,   color: 'text-yellow-400',   bg: '#F1C40F', image: '/icons/DryIcon.svg' },
        { id: 'fan', label: 'Fan',      mode: 65,  icon: Fan,   color: 'text-purple-400',   bg: '#8E44AD', image: '/icons/FanIcon.svg' }
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

    const handlePowerOnOff = useCallback(() => {
        devicePowerOnOff(device?.deviceSn || '');
    }, [devicePowerOnOff, device?.deviceSn]);

    const handleRunModesControl = useCallback((mode: number) => {
        if (!mode) {
            toast.error("Invalid mode option.");
            return;
        }

        updateDevice(device?.deviceSn || '', {
            "device_name": device?.deviceSn || '',
            "content": [
                {
                "deviceType": 4,
                "instructions": [
                        {
                            "command": "IduMode",
                            "parameter": mode
                        },
                    ]
                }
            ]
        });
    }, [devicePowerOnOff, device?.deviceSn]);

    const handleTemperatureChange = useCallback((device_sn: string, set_temperature: string) => {
        
        updateDevice(device_sn, {
            "device_name": device_sn,
            "content": [{
                "deviceType": 4,
                "instructions": [{
                    "command": "SetTemperature",
                    "parameter": parseInt(set_temperature)
                }]
            }]
        });
    }, [updateDevice]);

    const handleTempDecrease = useCallback((deviceSn: string) => {
        setLocalTemp((prev) => {
            const newTemp = Math.max(16, prev - 1);

            // if newTemp is equal to 16 then setIsMinTempLockOn to true
            if (newTemp === 16) {
                setIsMinTempLockOn(true);
                setIsMaxTempLockOn(false);
            } else {
                setIsMinTempLockOn(false);
                setIsMaxTempLockOn(false);
            }
            
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            
            debounceTimerRef.current = setTimeout(() => {
                handleTemperatureChange(deviceSn, newTemp.toString());
            }, 500);
            
            return newTemp;
        });
    }, [handleTemperatureChange]);

    const handleTempIncrease = useCallback((deviceSn: string) => {
        setLocalTemp((prev) => {
            const newTemp = Math.min(30, prev + 1);

            // if newTemp is equal to 30 then setIsMinTempLockOn to true
            if (newTemp === 30) {
                setIsMaxTempLockOn(true);
                setIsMinTempLockOn(false);
            } else {
                setIsMaxTempLockOn(false);
                setIsMinTempLockOn(false);
            }
            
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            
            debounceTimerRef.current = setTimeout(() => {
                handleTemperatureChange(deviceSn, newTemp.toString());
            }, 500);
            
            return newTemp;
        });
    }, [handleTemperatureChange]);

    // SYNC localTemp with liveDevice when store updates (but not during dragging)
    const [isDraggingTemp, setIsDraggingTemp] = useState(false);
    
    useEffect(() => {
        if (!isDraggingTemp && Math.abs(localTemp - temperature) > 0.1) {
            setLocalTemp(temperature);

            // if temperature is at min or max, set lock accordingly
            if (temperature <= 16) {
                setIsMinTempLockOn(true);
            } else if (temperature >= 30) {
                setIsMaxTempLockOn(true);
            } else {
                setIsMinTempLockOn(false);
                setIsMaxTempLockOn(false);
            }
        }
    }, [temperature, isDraggingTemp]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const selectedColor = useMemo(() => {
        const mode = modes.find(m => m.id === selectedMode);
        return mode ? mode.bg : '#FFFFFF';
    }, [selectedMode, modes]);

    console.log("Selected Mode BG:", selectedColor);

    return (
        <div className="w-full z-[1000] mx-auto bg-[#16161A] text-white border border-[#0D8FAC] shadow-2xl relative overflow-x-hidden">
            
            {/* Cyan corners decoration - unchanged */}
            <div className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-1/2 -translate-x-1/2 z-[999]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
            </div>

            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 left-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute top-0 right-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 right-0 z-[999]"></span>
            <span className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-0 z-[999]"></span>
            
            <div className="w-2.5 h-2.5 bg-[#0D8FAC] absolute bottom-0 left-1/2 -translate-x-1/2 z-[999]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                <span className="w-2.5 h-2.5 bg-[#0D8FAC]"></span>
            </div>

            <section className='h-[80vh] overflow-y-scroll overflow-x-hidden custom-scrollbar p-6'>
                {!isMatchedRoom ? (
                    <div className="w-full h-full flex items-center justify-center text-red-500 text-lg mb-4 text-center font-semibold">
                        <p>Warning: No matching information found</p>
                    </div>
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

                        <div className="px-4 space-y-6">
                            {/* POWER DIAL - LIVE DATA */}
                            <div className="flex justify-center mb-8">
                                <TCircularTemperatureDial
                                    id="temperature-dial"
                                    value={localTemp}                    // Smooth UX
                                    onClick={handlePowerOnOff}
                                    isLoading={isDevicePowerOnLoading}
                                    modes={modes}
                                    runMode={runMode}                    // LIVE from store
                                    onChange={(value: any) => {
                                        setLocalTemp(value);
                                        setIsDraggingTemp(true);
                                        if (value < 16) setLocalTemp(16);
                                        else if (value > 30) setLocalTemp(30);
                                    }}
                                    onCommit={(value: any) => {
                                        setIsDraggingTemp(false);
                                        handleTemperatureChange(liveDevice?.deviceSn || '', value.toString());
                                    }}
                                    min={16}
                                    max={30}
                                    step={1}
                                />
                            </div>

                            {/* TEMPERATURE CONTROL - LIVE DISPLAY */}
                            <div className="flex h-20 items-center justify-center gap-8 mb-8">
                                <TCornerButton
                                    icon={<Minus size={26} />}
                                    onPress={() => {
                                        handleTempDecrease(liveDevice?.deviceSn || '');
                                    }}
                                    isBorderActive={true}
                                    disabled={runMode === 0 ? true : false} // Disable in certain mode
                                    className={`
                                        ${isMinTempLockOn ? 'opacity-50 pointer-events-none' : 'bg-transparent cursor-default'}
                                        w-9 h-9 rounded-tl-lg rounded-br-lg bg-transparent orbitron-font    
                                    `}
                                />
                                <div className="text-center">
                                    <div className={`
                                        ${runMode === 0 ? 'opacity-50 pointer-events-none' : 'cursor-default'}
                                        relative flex items-start gap-1 font-bold tracking-tight orbitron-font
                                    `}>
                                        <TAnimatedNumber
                                            value={localTemp}
                                            decimals={0}
                                            className={`
                                                bg-transparent pointer-events-none shadow-none outline-none
                                                border-none focus:outline-none focus:ring-0 p-0 w-[115px]
                                                text-center text-[48px] font-[600] tracking-tight
                                            `}
                                        />
                                    </div>
                                </div>
                                <TCornerButton
                                    icon={<Plus size={26} />}
                                    onPress={() => handleTempIncrease(liveDevice?.deviceSn || '')}
                                    isBorderActive={true}
                                    disabled={runMode === 0 ? true : false} // Disable in certain mode
                                    className={`
                                        ${isMaxTempLockOn ? 'opacity-50 pointer-events-none' : 'bg-transparent cursor-default'}
                                        w-9 h-9 rounded-tl-lg rounded-br-lg bg-transparent orbitron-font    
                                    `}
                                />
                            </div>

                            {/* Rest of component unchanged - Mode Selection, Fan Speed, etc. */}
                            <div className="flex items-center gap-3 mb-6">
                                {modes.map((mode) => (
                                    <TCornerButton
                                        key={mode.id}
                                        image={mode.image}
                                        text={mode.label}
                                        textSize="text-sm"
                                        bgColor="#2d2c31"
                                        // borderColor="#27AE60"
                                        borderColor={modes.find((m) => m.id === selectedMode)?.bg || ''}
                                        height="h-[90px]"
                                        width='w-[90px]'
                                        isActive={selectedMode === mode.id}
                                        onPress={() => {
                                            setSelectedMode(mode.id);
                                            handleRunModesControl(mode.mode);
                                        }}
                                        className="text-[16px] font-[600]"
                                    />
                                ))}
                            </div>

                            <div 
                                style={{
                                    borderColor: selectedColor
                                }}
                                className={`dashed-line w-full h-0 border-t border-dashed border-[${selectedColor}]`}
                            ></div>

                            <div className="w-full flex items-center gap-4 mb-6">
                                
                                {/* Fan Range Slider */}
                                <TFanSpeedSlider fanSpeed={fanSpeed} modes={modes.filter(m => m.id === selectedMode)} />

                                <Fan 
                                    size={28}
                                    style={{
                                        color: modes.find(m => m.id === selectedMode)?.bg.replace('bg-[', '').replace(']', '')
                                    }}
                                />
                            </div>

                            <div className="flex items-center relative justify-between py-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium">Swing Throw</span>
                                    <Image src={"/icons/swing-throw.svg"} width={28} height={28} alt="Swing Throw" />
                                </div>

                                <div className="toggle-container">
                                    <div typeof='button' onClick={() => setSwingThrow(prev => !prev)} className="toggle-wrap">
                                        <input
                                            className="toggle-input"
                                            id="holo-toggle"
                                            type="checkbox"
                                            checked={swingThrow}
                                            onChange={() => setSwingThrow(prev => !prev)}
                                        />

                                        <label className="toggle-track" htmlFor="holo-toggle">
                                        <div
                                            className="toggle-thumb"
                                            style={{
                                            background: swingThrow
                                                ? `radial-gradient(circle, ${selectedColor}CC 100%, ${selectedColor}66 100%)`
                                                : `radial-gradient(circle, #ffffff23 100%, #ffffff23 100%)`,
                                            borderColor: swingThrow ? `${selectedColor}100` : '',
                                            }}
                                        >
                                            <div className="thumb-core"></div>
                                        </div>

                                        <div className="toggle-data">
                                            <div className="data-text off">OFF</div>
                                            <div className="data-text on">ON</div>
                                        </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div 
                                style={{
                                    borderColor: selectedColor
                                }}
                                className={`dashed-line w-full h-0 border-t border-dashed border-[${selectedColor}]`}
                            ></div>

                            <div className="grid grid-cols-2 gap-3">
                                {locks.slice(0, 6).map((lock) => (
                                    <button key={lock.id} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all group">
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
                )}
            </section>

        </div>
    );
};

export default ACControlDrawer;
