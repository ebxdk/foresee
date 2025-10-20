# 🔮 Forecast System Overview

## Deterministic Model
- Forecasts use an exponential weighted moving average (EWMA) applied to the most recent 30 days of burnout history (minimum 3 days required).
- The model blends linear trend projection, behavioral modifiers, and regression to a neutral 50% baseline—no random jitter is applied.
- The engine now generates 10 forward-looking values; UI consumers display “Today + 9 days” to keep the 10‑row forecast card deterministic.

## Data Inputs
- Primary input is the stored burnout history maintained in `utils/storage.ts` via `storeBurnoutHistory`.
- EPC scores provide the current burnout anchor for each forecast run.
- HealthKit deltas are only applied when real biometric data is available and permissioned; otherwise forecasts use raw EPC scores.

## Confidence Scoring
- Confidence is derived from data availability and variance, capped at the optimal 7‑day window.
- The API returns both variance and standard deviation so visualizations can render consistent confidence intervals.

## Fallback Behaviour
- When fewer than 3 historical burnout entries exist, the system replicates the current burnout value for all forward days and flags confidence as `poor`.
- If forecasting fails (e.g., missing EPC scores), UI falls back to a neutral 50% baseline with deterministic ±5% bounds.

## Testing
- Unit coverage lives in `__tests__/forecastCalc.test.ts`, ensuring deterministic output for identical inputs and verifying the baseline path when history is insufficient.
