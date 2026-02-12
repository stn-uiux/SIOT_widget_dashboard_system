---
trigger: always_on
---

# ui/ux and design system governance
## single source of truth
- # primary authority: design-tokens.json and css variables in index.css are the ultimate authority.
- # no hard-coding: never use hex codes or pixel values directly. use mapped css variables only.
- # documentation: designdocs.tsx must always stay in sync with tokens and components.
## change management process
- # propose before action: ask for approval before adding or changing any design tokens.
- # sync requirement: update design-tokens.json and designdocs.tsx first, then update app code.
- # legacy cleanup: refactor any hard-coded styles you find into tokens during your work.
## implementation standard
- # component first: use components from designsystem.tsx instead of raw html tags.
- # visual consistency: follow layout, padding, and font patterns defined in designdocs.tsx.
- # verification: double-check if generated code adheres to design-tokens.json before finalizing.