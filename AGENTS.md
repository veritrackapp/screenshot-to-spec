<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All data reads go through `src/services/postcodeService.ts` (mock data in `src/services/mockData.ts`); pages never import mock data directly, so the real postcode API can be swapped in one place.
- The USSD flow is a pure state machine in `src/lib/ussd.ts` (replies prefixed `CON`/`END`, side effects returned not performed) so it stays unit-testable.
- Incidents live in a small external store (`src/store/incidents.ts`, useSyncExternalStore + localStorage sync); its server snapshot is empty to avoid hydration mismatches.
- Scoring and USSD rules are covered by `src/test/trustpost.test.ts`; update it when thresholds or menu flow change.
