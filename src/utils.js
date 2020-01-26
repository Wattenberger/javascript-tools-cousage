import { fromPairs, flatten, map, keys, zip } from "lodash-es"

export const parseNdjson = text => (
  JSON.parse(
    `[${text.replace(/[\n]+/gm, ",").slice(0, -1)}]`
  )
)


export const toolsByType = {
  language: [
    "clojurescript",
    "elm",
    "purescript",
    "reason",
    "typescript",
  ],
  uiFramework: [
    "angular",
    "ember",
    "preact",
    "react",
    "svelte",
    "vuejs",
  ],
  stateManagement: [
    "redux",
    "relay",
    "mobx",
    "apollo", // Apollo is the industry-standard GraphQL implementation
    "graphql", // query language
  ],
  backend: [
    "koa",
    "express", // Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
    "meteor",
    "feathers", // API framework for Node.js, React Native and the browser
    "gatsby", // static-site generator
    "nextjs",
    "nuxt",
    "sails",
  ],
  testing: [
    "ava",
    "cypress",
    "enzyme",
    "jasmine",
    "jest",
    "mocha",
    "puppeteer",
    "storybook",
  ],
  mobile: [
    "cordova",
    "electron",
    "expo",
    "ionic",
    "nativeapps",
    "nwjs",
    "reactnative",
  ],
}

export const toolLabels = {
  language: "languages",
  uiFramework: "ui frameworks",
  stateManagement: "state management libraries",
  backend: "backend libraries",
  testing: "testing libraries",
  mobile: "mobile libraries",
}

export const toolToTypeMap = fromPairs(
  flatten(
    map(toolsByType, (tools, type) => (
      map(tools, tool => [
        tool,
        type,
      ])
    ))
  )
)
export const toolTypes = keys(toolsByType)

export const ordinalColors = ["#e5e5e5", "#beebe9", "#ffbd69", "#ffcccc", "#d2d0fe", "#FEA47F", "#786fa6", "#4b7bec", "#778ca3", "#63cdda"];
export const ordinalColorsDarker = ["#b5b5b5", "#9ecbc9", "#efad59", "#efbcbc", "#b2b0de", "#eE946F", "#685f96", "#3b6bdc", "#677c93", "#53bdca"];

export const toolTypeColors = fromPairs(
  zip(
    toolTypes,
    ordinalColors,
  )
)
export const toolTypeColorsDarker = fromPairs(
  zip(
    toolTypes,
    ordinalColorsDarker,
  )
)

export const getPositionFromAngle = (angle, distance) => [
  Math.cos(angle) * distance,
  Math.sin(angle) * distance,
]
export const getAngleFromDistance = (distance, distanceFromCenter) => (
  Math.atan2(distance, distanceFromCenter)
)
export const getAngleFromArcLength = (radius=1, arcLength=10) => (
  arcLength / radius
)
export const getArcLengthFromAngle = (radius=1, angle) => (
  angle * radius
)
