import React from 'react'
 
import { cn } from '@/lib/utils';

// activeStatus
type activeStatus = 'Auto' | 'Cool' | 'Heat' | 'Dry' | 'Fan';

const COLORS_ON_STATUS: Record<activeStatus, string> = {
  Auto: '#27AE60',
  Cool: '#3498DB',
  Heat: '#E67E22',
  Dry: '#F1C40F',
  Fan: '#8E44AD',
}

interface Props {
    width?: number;
    height?: number;
    className?: string;
    activeStatus?: activeStatus;
    onClick?: () => void;
}

const THvacStatusIcon = ({ width, height, className, onClick, activeStatus }: Props) => {
  return (
    <svg onClick={onClick} className={cn(
        className, 
        'ease-in-out transition-all duration-300',
        activeStatus && COLORS_ON_STATUS[activeStatus],
    )} width={width || 20} height={height || 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.9 16.5C11.7333 16.5 13.2917 15.8583 14.575 14.575C15.8583 13.2917 16.5 11.7333 16.5 9.9C16.5 8.06667 15.8583 6.50833 14.575 5.225C13.2917 3.94167 11.7333 3.3 9.9 3.3C8.06667 3.3 6.50833 3.94167 5.225 5.225C3.94167 6.50833 3.3 8.06667 3.3 9.9C3.3 11.7333 3.94167 13.2917 5.225 14.575C6.50833 15.8583 8.06667 16.5 9.9 16.5ZM9.9 14.3C9.36833 14.3 8.855 14.2039 8.36 14.0118C7.865 13.8197 7.41583 13.5491 7.0125 13.2H12.7875C12.3842 13.5483 11.935 13.8189 11.44 14.0118C10.945 14.2047 10.4317 14.3007 9.9 14.3ZM6.105 12.1C5.95833 11.8433 5.83917 11.5775 5.7475 11.3025C5.65583 11.0275 5.59167 10.7433 5.555 10.45H14.245C14.2083 10.7433 14.1442 11.0275 14.0525 11.3025C13.9608 11.5775 13.8417 11.8433 13.695 12.1H6.105ZM5.555 9.35C5.59167 9.05667 5.65583 8.7725 5.7475 8.4975C5.83917 8.2225 5.95833 7.95667 6.105 7.7H13.695C13.8417 7.95667 13.9608 8.2225 14.0525 8.4975C14.1442 8.7725 14.2083 9.05667 14.245 9.35H5.555ZM7.0125 6.6C7.41583 6.25167 7.865 5.98143 8.36 5.7893C8.855 5.59717 9.36833 5.50073 9.9 5.5C10.4317 5.49927 10.945 5.59533 11.44 5.7882C11.935 5.98107 12.3842 6.25167 12.7875 6.6H7.0125ZM2.2 19.8C1.595 19.8 1.07727 19.5848 0.6468 19.1543C0.216333 18.7238 0.000733333 18.2057 0 17.6V2.2C0 1.595 0.2156 1.07727 0.6468 0.6468C1.078 0.216333 1.59573 0.000733333 2.2 0H17.6C18.205 0 18.7231 0.2156 19.1543 0.6468C19.5855 1.078 19.8007 1.59573 19.8 2.2V17.6C19.8 18.205 19.5848 18.7231 19.1543 19.1543C18.7238 19.5855 18.2057 19.8007 17.6 19.8H2.2Z" 
        fill={
          activeStatus === "Auto"
            ? COLORS_ON_STATUS.Auto
            : activeStatus === "Cool"
            ? COLORS_ON_STATUS.Cool
            : activeStatus === "Heat"
            ? COLORS_ON_STATUS.Heat
            : activeStatus === "Dry"
            ? COLORS_ON_STATUS.Dry
            : activeStatus === "Fan"
            ? COLORS_ON_STATUS.Fan
            : COLORS_ON_STATUS.Auto
        }/>
    </svg>
  )
}

export default THvacStatusIcon