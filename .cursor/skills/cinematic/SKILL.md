# Build a cinematic scroll-story website

Act as a designer, creative director, motion designer and website developer. Build the actual website, including its visual assets and working scroll animation. The experience should tell the business's story through motion, typography and content that feel intentionally composed together.

Use your available tools and capabilities to create the required media files. Do not assume access to a particular media-generation provider, MCP, plugin, API or external service. Choose the best available method for each asset. If a suitable generation capability is available, use it directly. If generation is unavailable, continue independently using supplied assets, existing project assets, procedural graphics, CSS/SVG effects, locally available media tools, or appropriate placeholders.

Do not claim that media was generated, inspected, uploaded or published unless that action was actually completed.

---

## 1. Establish the brief with minimal friction

Read the conversation, project files and supplied materials first.

Ask only questions whose answers materially affect the result. When information is missing, a single compact intake can cover:

* What does the business do, who is it for, and what should visitors do on the site?
* Is there a business name, logo or existing brand identity to use?
* Are there websites or visual references to follow, or a description of the desired aesthetic?

Do not repeat answered questions or require a full branding questionnaire. A business description is enough to begin; ask for deeper information only when genuinely necessary.

Recognize two modes:

### Guided mode

Use a small number of meaningful review points:

1. Identity/style direction
2. Proposed visual story
3. Major production direction

Show concrete options rather than asking abstract questions repeatedly.

Once a direction is chosen, move forward.

### Template or autonomous mode

If the user says:

* "build a template"
* "choose for me"
* "assume the answers"
* "just build it"
* or equivalent

choose suitable defaults and complete the build without waiting for aesthetic decisions.

Missing copy is not a blocker. Use a coherent content scaffold, keep it easy to replace, and record assumptions in the handoff.

The user can supply final business details later.

Preserve real supplied facts.

Do not fabricate:

* testimonials
* customers
* awards
* addresses
* experience
* project counts
* revenue
* statistics
* certifications
* partnerships
* other credibility claims

For a fictional or template business, make the demo status clear and use useful placeholders where real details are required.

---

## 2. Establish an identity and a real design board

If a logo or official asset is supplied, preserve it.

Distinguish inspiration from material the user owns or has declared authoritative.

Do not redraw an existing logo simply to make it fit a new aesthetic.

If identity is missing, develop a small set of appropriate directions.

Use available image-generation or design capabilities to create logo concepts when a logo is genuinely needed.

Select the strongest direction in autonomous mode; otherwise show a compact selection.

Prefer an editable vector master when the available tools support it.

A raster export is not an SVG master.

Inspect supplied reference websites before describing their design.

Extract useful characteristics such as:

* typography
* spacing
* contrast
* composition
* materials
* component treatment
* imagery
* animation
* transitions
* interaction patterns

References such as component libraries can inform implementation.

Do not copy proprietary branding or distinctive artwork wholesale.

Without references, infer a coherent direction from the business and the user's description.

Avoid defaulting every business to the same template.

Create a compact **style tile** using the actual website design tokens.

Include:

* selected logo
* colour palette
* heading typography
* body typography
* buttons
* links
* sample card or service component
* imagery direction
* motion direction

Prefer an editable HTML/CSS board that can be viewed alongside the site.

This is a design sample, not a screenshot of a finished website and not a full brandbook.

Maintain one consistent identity across:

* style board
* generated assets
* supplied assets
* website
* animations
* responsive layouts

Keep the selected source assets, prompts and selection rationale when practical.

When a relevant installed brand-production skill exists, follow its asset-preservation and production guidance without expanding the deliverable into an unnecessary brandbook.

---

## 3. Design the scroll story

Translate the business's offering into a short visual journey.

Motion should communicate something about the:

* product
* craft
* service
* environment
* customer experience
* transformation
* outcome

Avoid animation that exists only because it looks impressive.

### Present the story before production

Start with a concise table titled **Visual Story**, using exactly these three columns:

**Scene | Visual story | Website copy**

Each row describes a meaningful scene and pairs its visual action with draft headings, supporting copy and relevant calls to action.

Write business-specific proposals rather than empty placeholders.

Often three scenes are enough.

Add scenes only when the narrative genuinely needs them.

Use this table structure:

| Scene            | Visual story                                                                    | Website copy                                                               |
| ---------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 01 — Opening     | Establish the subject and starting action; identify space for the opening copy. | Draft hero heading, supporting line and primary action.                    |
| 02 — Development | Continue from the previous scene into the next meaningful action or detail.     | Draft feature or service heading, supporting copy and any relevant action. |
| 03 — Resolution  | Carry the same subject into the final reveal or destination.                    | Draft outcome heading, useful business information and closing action.     |

After the table, briefly explain:

* how the scenes connect
* how scrolling introduces, holds and removes website copy
* where readable HTML can sit
* which visual moments deserve emphasis

A video second does not equal a second of scrolling.

Give text-bearing beats enough scroll space to be read.

Allow important visual moments to hold.

### Design transition beats and scroll pacing

Design the space between content scenes as deliberately as the scenes themselves.

Where the narrative benefits, include a dedicated **transition beat**:

1. Previous setting leaves view.
2. Moving subject occupies the viewport on its own.
3. Destination remains outside the viewport.
4. Destination enters only at the planned point.

Do not show the source, travelling subject and destination simultaneously throughout the footage when the intended story requires a staged reveal.

Generate framing and camera/subject movement that actually create the isolation.

Longer scroll distance alone cannot change what is visible in source frames.

Include transition beats as their own rows in the Visual Story table when they carry meaningful action.

The Website copy cell may say:

> No copy — let the motion lead

when appropriate.

Keep the three table columns unchanged.

Beneath the table, give a concise **Scroll pacing** plan for each scene and transition.

Describe:

* what enters/exits view
* intended framing
* approximate active scroll distance in viewport heights
* whether the beat uses continuous motion
* whether it uses slower motion
* whether it uses a still-frame hold

Assign scroll distance independently of clip duration and frame count.

A six-second clip can span several viewport heights of scrolling.

Additional frames improve temporal sampling but do not inherently lengthen the scroll experience.

Measure pacing in viewport heights or equivalent layout distances, not mouse-wheel turns.

Treat suggested distances as initial design choices rather than mandatory values.

For an extended reveal, an opening might use one viewport height, an isolated transition one or two, and a reveal another.

Adjust based on the actual story and readability.

Use a piecewise scroll timeline rather than one uniform mapping when beats need different emphasis.

Allocate more scroll distance to:

* important motion
* transitions
* reveals
* key product moments

Allow deliberate frame holds for readable content.

Distinguish **still-frame hold** from **sustained motion**.

Freezing a frame is appropriate for a pause.

A subject that should keep moving needs enough usable motion and intermediate frames.

Do not stretch a handful of frames across a long scroll range and call the resulting stepped playback smooth.

Request or create a longer or separate transition sequence when necessary.

Specify the pacing structure before footage generation so the media contains the required:

* entrance
* isolated movement
* exit
* transition endpoint

In implementation, map each beat's scroll interval to its own frame interval.

A hold maps an interval to a single frame.

Preserve continuity at boundaries and when reversing direction.

Count active pinned scroll travel separately from the height of the visible stage so layout sizing does not accidentally shorten the intended sequence.

Where browser interaction checks are available, validate the actual experience with ordinary scrolling.

Check that:

* transition gets its intended space
* destination enters at the right time
* text has time to be read
* forward scrolling works
* reverse scrolling works
* scene boundaries feel intentional

If interaction testing is unavailable, disclose that pacing remains unverified rather than claiming a smooth result from compilation alone.

### Make the visual story continuous

For stories following the same subject through multiple actions or locations, prefer connected sequences with matching transition frames.

Each scene should pick up where the previous one leaves off.

Preserve:

* subject identity
* object geometry
* materials
* scale
* lighting
* spatial relationships
* camera perspective
* movement direction

across the handoff.

If the story changes its environment, show a motivated transition rather than accidentally replacing the setting at a clip boundary.

Choose the simplest suitable architecture.

### One continuous sequence

Scrub one short clip while a visual stage remains pinned.

Fade, move or replace actual website content at defined progress ranges.

Several apparent "hero sections" can be chapters inside one pinned stage.

### Multiple connected sequences

Use matched clips when the story changes location, action or composition beyond what one clip can reliably sustain.

Extract the previous sequence's selected ending frame and use it as the next sequence's starting frame or starting reference when the available generation method supports it.

Continue the visible action and camera movement from that state.

Match:

* framing
* subject position
* orientation
* scale
* background
* lighting

at the boundary.

Do not independently generate unrelated scenes and assume a crossfade will make them continuous.

In guided or explicitly step-by-step mode, present the table and connection explanation for feedback before generating story footage or building the animation.

In autonomous/template mode, still present them, then continue without waiting for aesthetic approval.

Do not force every website into one fixed-length clip or an endlessly pinned hero.

A short clip around 6–12 seconds is a useful starting point, subject to the chosen generation method's capabilities.

Generate only the motion needed for the chosen story.

The final website can combine:

* scrubbed scenes
* transitions
* resting frames
* ordinary flowing sections
* interactive UI

Plan responsive composition now.

Reserve space for text and consider how the subject survives a narrow crop.

Avoid important action on both extreme edges.

Choose a separate mobile asset only when it materially improves the result.

---

## 4. Generate, inspect and prepare the assets

Use whatever media-generation and media-processing capabilities are actually available in the current environment.

Do not assume a specific provider, MCP, plugin, API or generation model.

Before generating media, determine the capabilities relevant to the task, including where applicable:

* image generation
* video generation
* image-to-video
* image references
* video references
* starting-frame control
* ending-frame control
* duration
* aspect ratio
* resolution
* frame rate
* camera controls
* motion controls
* local media processing
* file conversion
* image extraction

Choose the simplest reliable method that satisfies the visual requirement.

Do not use an external service merely because it is familiar if a better available method exists.

Do not install a new service, purchase a subscription, create an account or change billing settings unless the user explicitly authorizes it.

### Generate key stills first

Generate key stills first when they help establish:

* composition
* subject identity
* environment
* lighting
* product appearance
* camera position
* visual continuity

For related clips, reuse selected references instead of independently reinventing the subject.

Specify:

* action
* camera behaviour
* materials
* lighting
* usable text space
* transition endpoints
* composition
* subject position
* visual style

Avoid cuts unless the storyboard intentionally uses them.

Do not bake:

* headings
* navigation
* service descriptions
* calls to action
* UI labels

into generated pixels.

Keep website copy as real HTML.

### Connected scenes

For connected scenes, produce dependent clips in order when the available tools support reference-based continuation.

Workflow:

1. Generate scene A.
2. Inspect scene A.
3. Accept the best version.
4. Extract its clean ending frame.
5. Pass that exact raster asset as the next scene's starting-frame/reference input.
6. Generate scene B as a continuation.
7. Inspect the seam.
8. Correct only if necessary.
9. Continue to the next dependent scene.

Retain the same identity references and visual settings.

Plan and inspect the handoff frame before starting its dependent clip.

Independent stills and website work can continue concurrently.

If the available generation method does not support starting-frame control, use the strongest available:

* image-to-video workflow
* reference-image workflow
* image conditioning
* local compositing
* procedural transition
* compatible alternative generation method

Disclose important limitations rather than claiming guaranteed continuity.

### Inspect every important asset

Inspect representative frames and completed motion using available media-inspection capabilities.

Check:

* continuity
* visual coherence
* subject consistency
* unintended text
* artifacts
* framing
* lighting
* composition
* motion quality
* whether website copy remains readable
* whether the asset works at the intended responsive crop

If an asset fails an important requirement, make a targeted correction.

Do not run an open-ended regeneration loop.

Preserve already useful assets.

### Organize generated assets

Keep generated files organized.

Use clear filenames and directories.

For example:

```text
public/
  media/
    source/
    generated/
    selected/
    frames/
    posters/
```

Keep original source videos whenever possible.

Keep selected master images.

Keep prompts and useful generation metadata when practical.

Avoid duplicate generation when an existing usable result already satisfies the requirement.

A pending generation job is not necessarily a failed job.

If generation is asynchronous, continue working on layout, content and implementation while it runs.

### Prepare browser-ready media

Save the original video and selected brand masters.

Extract a browser-ready image sequence using an available media-processing tool such as FFmpeg.

A typical command is:

```sh
ffmpeg -i input.mp4 -an -vf "fps=18,scale=1280:-2" -c:v libwebp -quality 78 -start_number 0 frames/frame-%04d.webp
```

Treat these settings as a starting point, not a guarantee.

Adapt:

* frame rate
* dimensions
* quality
* codec
* format

to the motion and measured transfer size.

Avoid upscaling a low-resolution source.

Use a fresh staging directory rather than overwriting an existing sequence.

Write a manifest with:

* actual frame count
* dimensions
* naming pattern
* frame rate
* source video
* poster path

Verify:

* first frame
* middle frame
* last frame
* numbering
* file sizes
* dimensions
* all referenced paths

Make a suitable still available immediately while the sequence loads.

---

## 5. Build a complete, usable website

Reuse the current project and suitable existing components.

Follow the hosting environment's required build/deployment workflow, if present.

Keep one owner for the source and publishing lifecycle.

Build the site's business structure as well as its animation.

Include only sections that make sense for the business.

Potential sections include:

* hero
* offering
* products/services
* process
* benefits
* portfolio
* event information
* about
* contact
* FAQ
* final CTA

Do not mechanically add every standard landing-page section.

Use the business brief to determine content.

### Implement the scroll story

Implement the scroll story with a pinned canvas/image stage or an equivalently reliable approach.

For an image sequence, map clamped scene progress to a valid frame index:

```text
progress = clamp(sceneScroll / sceneScrollDistance, 0, 1)
frameIndex = round(progress * (frameCount - 1))
```

Keep motion rendering separate from semantic HTML content.

Timed text, buttons, feature labels and navigation must remain:

* crisp
* selectable
* accessible
* editable
* responsive

Coordinate their transitions with the storyboard.

If copy appears attached to a moving object, use deliberate positioning/keyframes or tracking rather than assuming a fixed label will follow it automatically.

Avoid scroll hijacking.

Native scrolling should work forward and backward.

Make scene boundaries feel intentional.

Let the rest of the page flow normally.

Ensure invisible layers do not:

* intercept clicks
* block interaction
* create inaccessible keyboard order
* leave hidden links in the tab sequence

### Performance

Prioritize the requested frame and nearby frames.

Bound concurrent requests and decoded-frame memory.

Discard obsolete work.

Release evicted bitmaps.

Avoid loading every full-resolution frame into memory.

Use bounded retries for missing frames.

Account for:

* fast scroll jumps
* reverse scrolling
* resize
* high-density displays
* mobile devices
* teardown/unmount
* network latency

Retain a useful still if media fails.

Use progressive loading where practical.

Do not sacrifice basic usability for animation fidelity.

### Accessibility and reduced motion

Provide reduced-motion and constrained-device fallbacks that preserve:

* content
* hierarchy
* primary action
* product understanding

Let visitors skip a long animation when appropriate.

Respect:

```css
prefers-reduced-motion
```

Reflow content for mobile.

Do not merely shrink the desktop composition.

Never make understanding the business depend entirely on seeing the animation.

---

## 6. Make the content easy to replace, validate and deliver

Keep business copy, service details, calls to action and media references in a clear content file or an appropriate existing CMS.

A structure such as:

```text
src/
  content/
    site.ts
```

or the project's existing content architecture is preferred.

A small browser-based editor is useful when it fits the project.

If edits are saved only in local storage, explain that clearly and provide:

* export
* import
* actual path to publish changes

Do not present local drafts as shared live edits.

### Forms

Forms need a real submission destination or an explicitly labelled demo behaviour.

Never show:

> Sent successfully

if nothing was actually sent.

### Validation

Run appropriate:

* code checks
* linting
* production build
* asset checks
* route checks
* responsive checks
* media checks

Verify:

* sequence manifest
* frame paths
* posters
* source assets
* responsive layouts
* motion fallbacks
* key interactions
* loading behaviour

Distinguish checks actually performed from those not performed.

Compilation alone does not prove smooth playback or visual quality.

### Publishing

Publish only within the user's authorized scope and audience.

Where the environment supports authorized private previews, use them.

Do not silently expose a draft publicly.

If publishing is unavailable, deliver a runnable local project and state the missing dependency.

---

## 7. Deliver the finished result

Deliver, where applicable:

* website/preview
* complete source code
* style tile
* selected logo masters
* original video clips
* generated images
* browser-ready media
* posters
* editable content
* concise editing instructions

Include a short production note containing:

* chosen visual direction
* assumptions
* important prompts
* asset provenance
* important measurements
* media-generation method used
* important limitations
* validation performed

Do not include:

* credentials
* API keys
* private tokens
* temporary signed URLs
* unnecessary internal secrets

Keep reusable packages clean and portable.

Continue until the requested result is complete or a concrete dependency prevents completion.

Show meaningful progress and finished outputs rather than repeated plans.

When the user asks only for a template, complete a coherent template now and leave the content ready for later refinement.
