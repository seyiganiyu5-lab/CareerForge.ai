# Task 3 — ATS API Builder

## Files Created
- `src/app/api/ats-check/route.ts` — POST handler for ATS resume analysis
- `src/app/api/ats-check/history/route.ts` — GET handler for report history

## Summary

### POST /api/ats-check
Full hybrid analysis pipeline:
1. **Auth**: `getAuthUser()` → 401
2. **Feature gate**: `checkAndIncrementUsage(ATS_CHECKER)` → 403 with `{ error: 'limit_reached', limit, used, planName }`
3. **Resume fetch + ownership check** → 404
4. **Local analysis** (7 deterministic functions):
   - Contact Info (email/phone/location/LinkedIn/website)
   - Formatting (summary/education/work/skills presence, date consistency)
   - Work Experience (count tiers, description length, action verbs from 170+ verb list)
   - Education (count tiers, degree/field/dates)
   - Skills (count tiers, specificity)
   - Readability (word count: ideal 300-800)
   - Achievements (quantifiable metrics detection)
5. **AI analysis** via `z-ai-web-dev-sdk`:
   - With job description: keyword extraction, matching, gap analysis
   - Without: keyword suggestions, grammar check, general improvements
   - Graceful fallback on AI failure
6. **Weighted score**: Contact 10%, Formatting 15%, Keywords 15%, Skills Match 15%, Work Exp 15%, Education 10%, Grammar 8%, Readability 7%, Achievements 5%
7. **DB storage**: Creates `AtsReport` record with all JSON data

### GET /api/ats-check/history
- Returns latest 20 reports with resume title, category scores, keyword summary
- Score comparison: finds previous report for same resume, calculates `scoreChange`