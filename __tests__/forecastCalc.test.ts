import { generateSmartForecast } from '../utils/forecastCalc';

describe('generateSmartForecast', () => {
  it('produces deterministic forecasts for identical inputs', () => {
    const currentBurnout = 64;
    const history = [58, 60, 61, 63, 62, 64, 65];

    const firstRun = generateSmartForecast(currentBurnout, history);
    const secondRun = generateSmartForecast(currentBurnout, history);

    expect(firstRun.forecast).toEqual(secondRun.forecast);
    expect(firstRun.trend).toBe(secondRun.trend);
    expect(firstRun.confidence.score).toBe(secondRun.confidence.score);
  });

  it('returns baseline projection when history is insufficient', () => {
    const currentBurnout = 72;
    const shortHistory = [70];

    const result = generateSmartForecast(currentBurnout, shortHistory);

    expect(result.forecast.length).toBe(10);
    expect(result.forecast.every(value => value === currentBurnout)).toBe(true);
    expect(result.trend).toBe('stable');
    expect(result.confidence.score).toBe(0);
    expect(result.confidence.standardDeviation).toBe(0);
  });
});
