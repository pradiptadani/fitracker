## 2026-06-16 - [Cache Intl.NumberFormat and Intl.DateTimeFormat objects]
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` objects inside functions that are called frequently (like rendering lists or formatting charts) can be a significant performance bottleneck. These objects take time to initialize.
**Action:** Always instantiate `Intl` formatter objects once outside of the functions/components, and reuse the single instance for better performance.
