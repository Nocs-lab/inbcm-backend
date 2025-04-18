import fs from "fs"

const content = fs.readFileSync("./src/emails/templates.ts", "utf-8")

let newContent = content
  .replace(
    `var Handlebars = require("handlebars");`,
    `/* eslint-disable */\n// @ts-nocheck\nimport Handlebars from "handlebars";`
  )
  .replaceAll(".hbs", "")

newContent +=
  "\nHandlebars.partials = Handlebars.templates;\n\nexport default templates;"

fs.writeFileSync("./src/emails/templates.ts", newContent)
