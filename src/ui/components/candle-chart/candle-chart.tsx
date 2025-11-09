import { useLayoutEffect, useRef } from "react";
import { CandlestickSeries, createChart, type CandlestickData } from "lightweight-charts";

interface CandleChartProps {
  data: CandlestickData[]
}

export const CandleChart = ({ data }: CandleChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container == null) return;

    const chart = createChart(container, { height: 400, width: 400 });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickVisible: true
    });

    candleSeries.setData(data);

    return () => {
      chart.remove();
    };

  }, [data]);

  return (
    <div ref={containerRef} />
  );
};