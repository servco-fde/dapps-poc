## Implementation
- [x] Register Sample Orders and generate metadata/types.
- [x] Add selection and coherent per-example content with loading, empty, and error handling.
- [x] Update documentation and browser switching coverage.
- [x] Run checks and live local analytics verification.

## Verification
- Generated Sample Orders metadata/types with Hawaii dev; 9 measures and 26 dimensions.
- Typecheck, 29 unit tests, production build, and five browser smoke tests passed.
- Changed-file ESLint passed. Full lint retains two existing require-await errors in server/routes/proposals/proposal-routes.test.ts (lines 114 and 120).
- Live local queries returned 4,083,290 orders, five market segments, and 44 monthly revenue points.
- Live browser loaded Sample Orders without page errors; desktop/mobile layout inspected.
- Local app remains running at http://localhost:8001. No deployment or Unity Catalog mutation.
