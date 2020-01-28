<div
  class="chart"
  id="chart"
  bind:offsetWidth={w}>

  <div class="annotation">
    Tools that are less likely to be used by
    <div class="annotation-highlighted" style={`background: ${toolTypeColors[toolToTypeMap[focusedTool]]}`}>
      { focusedTool }
    </div>
    are further from the center
  </div>
  <div class="annotation-left">
    Use your <div class="key" on:click={() => diffFocusedToolIndex(-1)}>&lt;-</div> and <div class="key" on:click={() => diffFocusedToolIndex(1)}>-&gt;</div> arrow keys to cycle through tools.
    <br />
    Or click a specific tool to focus on it.
  </div>

  <svg width={w} height={w}>
    <defs>
      <path class="heart" id="heart" d="M6.53734 1.46266C6.39074 1.31598 6.21667 1.19963 6.02508 1.12024C5.8335 1.04086 5.62815 1 5.42076 1C5.21338 1 5.00803 1.04086 4.81645 1.12024C4.62486 1.19963 4.45079 1.31598 4.30418 1.46266L3.99992 1.76692L3.69566 1.46266C3.39953 1.16652 2.99788 1.00015 2.57908 1.00015C2.16028 1.00015 1.75864 1.16652 1.4625 1.46266C1.16637 1.75879 1 2.16044 1 2.57924C1 2.99803 1.16637 3.39968 1.4625 3.69582L1.76676 4.00008L3.99992 6.23324L6.23308 4.00008L6.53734 3.69582C6.68402 3.54921 6.80037 3.37514 6.87976 3.18355C6.95914 2.99197 7 2.78662 7 2.57924C7 2.37185 6.95914 2.1665 6.87976 1.97492C6.80037 1.78333 6.68402 1.60926 6.53734 1.46266V1.46266Z" />
    </defs>

    {#if Object.keys(toolMatches)}
      <g transform={`translate(${w / 2}, ${w / 2})`}>
        {#if delay}
          <path
            in:draw={{duration: 1000, delay: 600}}
            class="annotation-line"
            d={annotationLinePath}
          />
        {/if}
        <g
          class="legend"
          transform={`translate(${r * 0.9}, ${r * 0.9})`}
        >
          {#each toolRadiusScale.ticks(4) as tick}
            <circle
              class="legend-circle"
              r={toolRadiusScale(tick)}
            />
          {/each}
          <text
            class="legend-text"
            y={toolRadiusScale.range()[1] + 10}>
            Larger circles represent
          </text>
          <text
            class="legend-text"
            y={toolRadiusScale.range()[1] + 28}>
            tools with more fans
          </text>
        </g>

        {#each rings as ringSize}
          <circle
            class="ring"
            r={ringSize}
          />
        {/each}

        <path
          class="type-circle"
          id="type-circle"
          d={[
            ["M", 0, -labelR].join(" "),
            ["A", labelR, labelR, 0, 0, 1, 0, labelR].join(" "),
            ["A", labelR, labelR, 0, 0, 1, 0, -labelR].join(" "),
          ].join(" ")}
        />
        <path
          class="type-circle"
          id="type-circle-2"
          d={[
            ["M", 0, -labelR].join(" "),
            ["A", labelR, labelR, 0, 0, 0, 1, labelR].join(" "),
            ["A", labelR, labelR, 0, 0, 0, 1, -labelR].join(" "),
          ].join(" ")}
        />

        {#if toolTypeArcLengthsMap[toolTypes[0]].arcLength}
          {#each toolTypes as type}
            <text transition:blur={{ duration: 1000 }}>
              <textPath
                class="type-text type-text--${toolTypeArcLengthsMap[type].isFlipped ? "flipped" : "normal"}"
                href={toolTypeArcLengthsMap[type].isFlipped ? "#type-circle-2" : "#type-circle"}
                startOffset={toolTypeArcLengthsMap[type].arcLength}
                style={`fill: ${toolTypeColorsDarker[type]}`}
              >
                { toolLabels[type] }
              </textPath>
            </text>
          {/each}
        {/if}

        {#each toolPositions as tool, index}
            <line
              class="tool-line"
              x2={getPositionFromAngle(tool.angle, r)[0]}
              y2={getPositionFromAngle(tool.angle, r)[1]}
            />
        {/each}

        {#each toolPositions as tool, index}
          <g
            class="tool"
            transform={`translate(${tool.x}, ${tool.y})`}
            on:click={() => focusedToolIndex = index}
            on:keydown={handleToolKeydown(index)}
            tabIndex="0"
            ariaRole="button">

            <circle
              class="tool-circle"
              r={tool.r}
              fill={toolTypeColors[toolToTypeMap[tool.name]]}
              style={`animation-delay: ${0.3 + 0.05 * index}s`}
            >
              <title>
                { tool.name }: { (toolMatches[focusedTool] || {})[tool.name] }
              </title>
            </circle>

            {#each tool.heartPositions as heart, heartIndex}
              <use
                class="tool-heart"
                x={heart[0] - 3}
                y={heart[1] - 3}
                href="#heart"
                style={`animation-delay: ${0.9 + 0.05 * index + 0.06 * heartIndex}s`}
              />
            {/each}

            <text class="tool-text" transition:blur={{delay: 300 + 100 * index}}>
              { tool.name }
            </text>
          </g>
        {/each}
      </g>

    {/if}
  </svg>
</div>

<svelte:window on:keydown={handleKeydown} />

<script>
  import { onMount } from "svelte"
  import { draw, blur } from "svelte/transition"
  import { scaleQuantile, scaleSqrt, max, mean } from "d3"
  import { flatten, fromPairs, map, omitBy, times, values } from "lodash-es"
  import { toolTypes, toolLabels, toolToTypeMap, toolTypeColors, toolTypeColorsDarker, getPositionFromAngle, getAngleFromArcLength, getArcLengthFromAngle } from "./utils"

  let toolMatches = {}
  let toolCounts = {}
  $: w = 800
  $: r = Math.max(w, 800) * 0.45
  $: labelR = r + 20
  let focusedToolIndex = 9
  $: focusedTool = tools[focusedToolIndex] || "..."
  let rings = []

  let delay = false

	onMount(async () => {
		const toolMatchesRes = await fetch("./tool-matches.json")
    toolMatches = await toolMatchesRes.json()

		const toolCountsRes = await fetch("./tool-counts.json")
    toolCounts = await toolCountsRes.json()
    delay = true

    // seems like `w` misses a resize after styles have been loaded
    // only happens when assets aren't cached locally (eg. first load, hard refresh)
    // this is a hacky way to fix a too-wide `w` value
    const elemWidth = document.getElementById("chart").offsetWidth
    w = elemWidth
  })

  $: annotationLinePosition = getPositionFromAngle(-Math.PI / 4, r + 20)
  $: annotationLinePath = [
    "M 0 0",
    ["L", annotationLinePosition[0], annotationLinePosition[1]].join(" "),
    ["L", annotationLinePosition[0] - 10, annotationLinePosition[1]].join(" "),
    ["L", annotationLinePosition[0], annotationLinePosition[1]].join(" "),
    ["L", annotationLinePosition[0], annotationLinePosition[1] + 10].join(" "),
  ].join(" ")

  const keyHandlers = {
    ArrowLeft: -1,
    ArrowRight: 1,
  }
  const handleKeydown = event => {
    const diff = keyHandlers[event.key] || 0
    diffFocusedToolIndex(diff)
  }
  $: diffFocusedToolIndex = diff => {
    focusedToolIndex += diff
    if (focusedToolIndex >= tools.length) focusedToolIndex = tools.length % focusedToolIndex
    if (focusedToolIndex < 0) focusedToolIndex = focusedToolIndex + tools.length
  }

  const keyHandlersTool = {
    Enter: true,
    " ": true,
  }
  const handleToolKeydown = index => event => {
    if (!keyHandlersTool[event.key]) return
    focusedToolIndex = index
	}

  $: tools = Object.keys(toolMatches)

  $: maxMatchCount = max(
    flatten(
      map(toolMatches, (counts, tool) => (
        values(
          counts
        )
      ))
    )
  )
  $: maxCount = max(
    flatten(values(toolCounts).map(getCount))
  )
  $: meanCount = mean(
    flatten(values(toolCounts).map(getCount))
  )

  $: rings = times(6, i => r * (i + 1) / 6).reverse()

  $: ringRadiusScale = scaleQuantile()
    .domain([-1.1, 2])
    .range(rings)

  $: heartCountScale = scaleQuantile()
    .domain([0, 6])
    .range(times(3, i => i + 1))

  $: toolRadiusScale = scaleSqrt()
    .domain([0, maxCount])
    .range([5, 39])

  $: anglePerTool = Math.PI * 2 / tools.length
  $: toolAnglesMap = fromPairs(
    map(tools, (type, i) => [
      type,
      anglePerTool * i + Math.PI * 0.095
    ])
  )
  $: toolTypeArcLengthsMap = fromPairs(
    map(toolTypes, (type, i) => {
      const [first, ...rest] = tools
        .filter(tool => toolToTypeMap[tool] == type)
        .map(tool => toolAnglesMap[tool])
      const last = rest.slice(-1)[0]
      const centerAngle = mean([first, last]) + Math.PI / 2
      const normalizedAngle = centerAngle % (Math.PI * 2)
      const arcLength = getArcLengthFromAngle(normalizedAngle, labelR)
      const isFlipped = normalizedAngle > 2 && normalizedAngle < 4
      const totalArcLength = getArcLengthFromAngle(Math.PI * 2, labelR)

      return [
        type,
        {
          arcLength: isFlipped ? totalArcLength - arcLength : arcLength,
          isFlipped,
        },
      ]
    })
  )

  const getCount = ({ interested, not_interested, would_use, would_not_use }={}) => (
    would_use
  )
  const getHeartsCount = ({ interested, not_interested, would_use, would_not_use }={}) => (
    (would_use + interested)
    / (would_not_use + not_interested)
  )
  const totalUsers = 21681

  $: toolPositions = tools.map(tool => {
    const matchesCount = (toolMatches[focusedTool] || {})[tool] || 0
    const count = getCount(toolCounts[tool])
    const focusedToolCount = getCount(toolCounts[focusedTool])
    const heartCount = getHeartsCount(toolCounts[tool])
    // const totalNumberOfFans = count + getCount(toolCounts[focusedTool])
    const percentOfOtherTool = matchesCount / count
    const percentExpected = focusedToolCount / totalUsers
    const normalizedMatches = percentOfOtherTool / percentExpected - 1

    // const amountLiked = getCount(toolCounts[tool])

    // const angle = Math.random() * Math.PI * 2
    const angle = toolAnglesMap[tool]

    const distance = focusedTool == tool ? 0 : ringRadiusScale(normalizedMatches)
    const [x, y] = getPositionFromAngle(angle, distance)
    const r = toolRadiusScale(count)

    const numberOfHearts = heartCountScale(heartCount)
    const heartOffsetFromCircle = 5
    const angleDiff = getAngleFromArcLength(r + heartOffsetFromCircle, 9)
    const heartPositions = times(numberOfHearts, i => (
      getPositionFromAngle(
        angleDiff * i
        // - Math.PI / 2
        + angle
        - (angleDiff * (numberOfHearts / 2)),
        r + heartOffsetFromCircle
      )
    ))

    return {
      x,
      y,
      r,
      angle,
      name: tool,
      heartPositions,
    }
  })

</script>

<style>
  .chart {
    position: relative;
    width: 100%;
    max-width: 60em;
    min-width: 800px;
    min-height: 800px;
    margin: 0 auto;
    overflow: hidden;
  }

  svg {
    overflow: visible;
  }

  text {
    fill: #4a4564;
    font-weight: 600;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
  }

  .ring {
    fill: none;
    stroke: #d4d8df;
    stroke-width: 1;
  }

  .tool {
    /* fill: #45aeb1; */
    transition: all 0.3s ease-out;
    mix-blend-mode: multiply;
    cursor: pointer;
  }

  .heart {
    fill: #4a4564;
    mix-blend-mode: multiply;
  }

  .tool-text {
    font-size: 0.9em;
    mix-blend-mode: multiply;
  }

  @keyframes scaleIn {
      0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
  .tool-circle {
    transform: scale(0);
    animation: scaleIn 0.6s ease-out;
    animation-fill-mode: forwards;
  }
  .tool-heart {
    transform: scale(0);
    animation: scaleIn 0.6s ease-out;
    animation-fill-mode: forwards;
  }

  .tool-line {
    fill: none;
    stroke: #eceef1;
  }
  .annotation-line {
    fill: none;
    stroke: #bbc2ce;
  }
  .annotation {
    position: absolute;
    top: 30px;
    right: 40px;
    max-width: 10em;
    font-size: 0.9em;
    text-align: right;
    color: #4a4564;
  }
  .annotation-left {
    position: absolute;
    top: 30px;
    left: 40px;
    max-width: 13em;
    font-size: 0.9em;
    text-align: left;
    color: #4a4564;
  }
  .annotation-highlighted {
    font-weight: 600;
    margin: 0.3em 0.1em;
    padding: 0.3em 0.6em;
    border-radius: 3px;
    transition: background 0.3s ease-out;
  }
  .key {
    display: inline-block;
    padding: 0.1em 0.3em;
    font-size: 0.9em;
    background: #d4d8df;
    border-radius: 3px;
    cursor: pointer;
  }

  .legend-circle {
    fill: none;
    stroke: #d4d8df;
  }
  .legend-text {
    font-size: 0.9em;
    font-weight: 400;
  }

  .type-circle {
    fill: none;
  }

  circle {
    transition: all 0.3s ease-out;
  }

	@media (max-width: 850px) {
    .annotation {
      top: -20px;
    }
    .annotation-left {
      top: -20px;
    }
  }
	@media (max-width: 760px) {
    .annotation {
      position: relative;
      text-align: left;
      max-width: 80vw;
      left: 0;
      right: 0;
      margin: 1em 0;
    }
    .annotation-left {
      position: relative;
      text-align: left;
      max-width: 80vw;
      left: 0;
      right: 0;
      margin: 1em 0;
    }
    .annotation-highlighted {
      display: inline-block;
      margin: -0.2em 0;
    }
    .annotation-line {
      display: none;
    }
  }
</style>