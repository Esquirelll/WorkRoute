# The WorkRoute motion system

Every animation takes its numbers from `motion.ts`. Change a value there and the whole site changes feel.

## Personality
Quick, soft and small. Heavily damped springs (almost no bounce), movement of a few pixels, nothing longer than 0.4 s.
The only playful bounce (`spring.lively`) is for tiny things: a badge appearing, a saved bookmark, a stepper node.

## The pieces
| Name | Used for |
|---|---|
| `spring.snappy` | chips, menus, nav underline, panels |
| `spring.smooth` | page enter, cards entering and reordering |
| `spring.lively` | badge reveal, bookmark pop, stepper node |
| `spring.count` | the match score counting up (never overshoots) |
| `duration.fast/base/slow` | simple fades, the stepper line, plain CSS hover transitions (160 ms) |
| `delay.stagger`, `delay.maxStaggerItems` | first-load card stagger (first 6 only) |
| `loading.showAfterMs / minVisibleMs` | the loader: 400 ms before it may appear, 500 ms minimum once shown |

## Signature moments
1. **Score count-up** (`components/CountUp.tsx`): counts from 0 on first appearance, retargets smoothly if the score changes mid-count.
2. **Badge reveal** (`popVariants`): workplace badge, then commute badge, 0.1 s apart.
3. **Commute stepper** (`stepperNodeVariants`, `stepperLineVariants`): each node pops, and the orange line grows down to the next one, stop by stop.
4. Also: page enter, filter chips (shared sliding pill), cards gliding when the list reorders, account menu, panels and notices.

## Rules
- Animate only `transform` and `opacity`.
- Springs for anything the user can trigger or reverse; short tweens only for fades and the one-way stepper line.
- Never block input. Everything is interruptible.
- Reduced motion: `MotionConfig reducedMotion="user"` turns off movement; CSS turns off animations and transitions; delays become zero; the count-up shows its final number at once.
- No private numbers in components. `motionSystem.test.ts` fails if one appears.
