<main>
	<h1>Javascript Framework Co-usage</h1>
	<h3>
		Likelihood of being a fan of other tools, given that a developer is a fan of a tool
	</h3>

	<Chart />

	<footer>
		Using data from the <a href="https://www.kaggle.com/sachag/state-of-js-2019/data">State of JS 2019</a> survey.
		<br />
		Made with 💖 by <a href="http://wattenberger.com">Amelia Wattenberger</a>. Code is up <a href="https://github.com/Wattenberger/javascript-tools-cousage">Github</a>.
	</footer>
</main>

<script>
	import { onMount } from "svelte"
	import { parseNdjson } from "./utils"
	import { getToolCounts, getToolMatches } from "./process-data.js"

	import Chart from "./Chart.svelte"

	let data = []

	onMount(async () => {
		// const res = await fetch("./2019.ndjson")
		// data = parseNdjson(await res.text())
		// console.log(data[0])

		// const toolMatches = getToolMatches(data)
		// const toolCounts = getToolCounts(data)
		// console.log("toolCounts", toolCounts)
	})

</script>

<style>
	@import url('https://rsms.me/inter/inter.css');

	main {
		font-family: 'Inter', sans-serif;
		padding: 1em 3em;
		text-align: center;
	}

	@media (max-width: 760px) {
		main {
			padding: 1em 1em;
			text-align: left;
		}
	}

	h1 {
		margin: 0;
		padding: 1.6em 0 0;
		line-height: 1.3em;
	}

	h3 {
		margin: 0;
		padding: 0 0 3.6em;
		font-weight: 400;
		font-size: 1.1em;
		line-height: 1.6em;
	}

	footer {
		margin: 6em 0 2em;
		line-height: 1.6em;
		color: rgb(110, 106, 131);
	}
</style>
