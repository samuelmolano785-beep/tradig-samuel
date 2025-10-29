import React from 'react';
import type { PriceChartData } from '../types';

interface PriceChartProps {
    data: PriceChartData;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
    const { historicalData, predictedData, entryPoint, stopLoss, takeProfit, timeLabels } = data;

    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 50, bottom: 30, left: 50 };

    const allData = [...historicalData, ...predictedData];
    if (allData.length === 0) return null;

    const minPrice = Math.min(...allData, stopLoss, takeProfit);
    const maxPrice = Math.max(...allData, stopLoss, takeProfit);

    const xScale = (index: number) => {
        return padding.left + (index / (allData.length - 1)) * (width - padding.left - padding.right);
    };

    const yScale = (price: number) => {
        return padding.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * (height - padding.top - padding.bottom);
    };

    const historicalPath = historicalData
        .map((price, index) => `${xScale(index)},${yScale(price)}`)
        .join(' ');

    // Connect the prediction to the last historical point
    const lastHistoricalPoint = `M${xScale(historicalData.length - 1)},${yScale(historicalData[historicalData.length - 1])}`;
    const predictedPath = predictedData
        .map((price, index) => `L${xScale(historicalData.length + index)},${yScale(price)}`)
        .join(' ');

    const fullPredictedPath = `${lastHistoricalPoint} ${predictedPath}`;
    
    const renderHorizontalLine = (price: number, color: string, label: string) => (
        <g key={label}>
            <line
                x1={padding.left}
                y1={yScale(price)}
                x2={width - padding.right}
                y2={yScale(price)}
                stroke={color}
                strokeWidth="1"
                strokeDasharray="4 2"
            />
            <text x={width - padding.right + 5} y={yScale(price)} fill={color} fontSize="10" alignmentBaseline="middle">
                {label}
            </text>
             <text x={padding.left} y={yScale(price) - 4} fill={color} fontSize="10" alignmentBaseline="middle">
                {price.toFixed(2)}
            </text>
        </g>
    );

    return (
        <div className="my-4 bg-slate-900/50 p-2 rounded-lg">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-axis labels */}
                <text x={padding.left-5} y={yScale(maxPrice)} fill="#94a3b8" fontSize="10" textAnchor="end" alignmentBaseline="middle">{maxPrice.toFixed(2)}</text>
                <text x={padding.left-5} y={yScale(minPrice)} fill="#94a3b8" fontSize="10" textAnchor="end" alignmentBaseline="middle">{minPrice.toFixed(2)}</text>

                {/* X-axis labels */}
                {timeLabels.map((label, index) => (
                     <text key={index} x={xScale(index)} y={height - padding.bottom + 15} fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {label}
                     </text>
                ))}

                {/* Grid Lines */}
                <line x1={padding.left} y1={yScale(maxPrice)} x2={width-padding.right} y2={yScale(maxPrice)} stroke="#334155" strokeWidth="0.5" />
                <line x1={padding.left} y1={yScale(minPrice)} x2={width-padding.right} y2={yScale(minPrice)} stroke="#334155" strokeWidth="0.5" />


                {/* Price Lines */}
                {renderHorizontalLine(takeProfit, '#22c55e', 'Take Profit')}
                {renderHorizontalLine(entryPoint.price, '#38bdf8', 'Entrada')}
                {renderHorizontalLine(stopLoss, '#ef4444', 'Stop Loss')}

                {/* Data Paths */}
                <polyline
                    points={historicalPath}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                />
                 <path
                    d={fullPredictedPath}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                />

                {/* Entry Point Marker */}
                <circle cx={xScale(entryPoint.index)} cy={yScale(entryPoint.price)} r="4" fill="#38bdf8" stroke="white" strokeWidth="1" />
            </svg>
        </div>
    );
};
