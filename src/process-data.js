import { omitBy, countBy, keys, fromPairs, meanBy, some, map, get } from "lodash-es"

const commonJobTitleKeywords = [
  ["frontend", "front end"],
  ["fullstack", "full stack"],
  ["techlead", "tech lead"],
  ["designer"],
  ["engineer"],
  ["developer"],
  ["lead"],
  ["architect"],
  ["web"],
  ["ui"],
  ["ux"],
  ["software"],
  ["junior"],
  ["senior"],
  ["programmer"],
  ["manager"],
  ["ceo"],
  ["cto"],
  ["data"],
  ["manager"],
  ["developer/engineer"],
]

const getUsersWithKeyword = (data, keyword) => (
  data.filter(d => {
    const job = (d.user_info || {}).job_title
    if (!job) return false
    const parsedJob = job.toLowerCase()
      .replace(/-/g, "")
    return some(keyword.map(k => parsedJob.includes(k)))
  })
)

export const getOpinionsPerJobType = data => {
  const jobTitles = omitBy(
    countBy(
      data.map(d => (
        d.user_info.job_title || "").toLowerCase()
      )
    ),
    (v,k) => v < 5
  )
  console.log(jobTitles)

  const opinions = keys(data[0].opinions)
  const opinionsPerJobType =fromPairs(
    opinions.map(opinion => [
      opinion,
      fromPairs(
        commonJobTitleKeywords.map(keywords => [
          keywords[0],
          meanBy(
            getUsersWithKeyword(data, keywords),
            user => (user.opinions || {})[opinion],
          ),
        ])
      )
    ])
  )
  console.log("opinionsPerJobType")
  console.log(opinionsPerJobType)
  return opinionsPerJobType
}

export const getToolCounts = data => fromPairs(
  keys(data[0].tools)
  .map(tool => [
    tool,
    omitBy(
      countBy(data, ({ tools }) => (
        (tools || {})[tool] || {}).experience
      ),
      (_, d) => d == "undefined"
    )
  ])
)

export const getToolMatches = data => {
  const tools = keys(data[0].tools)

  const toolMatches = fromPairs(
    tools.map(tool => [
      tool,
      fromPairs(
        map(
          getToolCounts(
            data.filter(({ tools }) => (
              get(tools, [tool, "experience"]) == "would_use"
            ))
          ),
          (statuses, tool) => [
            tool,
            statuses["would_use"]
          ]
        ).filter(d => d[0] != tool)
      )
    ])
  )
  console.log("toolMatches")
  console.log(toolMatches)

  return toolMatches
}