---
trigger: always_on
---

# ui/ux and design system governance

# CRITICAL: STOP AND ASK
- BEFORE generating any UI code, analyze if the required tokens exist.
- IF tokens are missing or you are tempted to use Tailwind's arbitrary values (e.g., p-4, bg-white/90), you MUST stop and ask for a token mapping first.

## single source of truth
- # zero tolerance for hard-coding: never use raw values (hex, px, rem) for any reason. 
- # token mandatory: if a token is missing, you MUST ask to create one. do not fallback to hard-coded values.
- # primary authority: design-tokens.json and css variables in index.css are the absolute source of truth.

## change management process (strict order)
- # step 1: propose. if existing tokens don't fit, propose a new token name and value first.
- # step 2: document. update design-tokens.json and designdocs.tsx after my approval.
- # step 3: implement. only then, apply the tokens to the component code.
- # error correction: if you find legacy hard-coded values, refactor them immediately to tokens.

## implementation standard
- # consistency: all generated ui must perfectly match the spacing and shadow patterns in designdocs.tsx.
- # component-driven: always use existing components from designsystem.tsx instead of building from scratch with raw html.