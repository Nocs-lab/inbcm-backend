import fs from "fs"

const content = fs.readFileSync("./src/emails/templates.ts", "utf-8")

let newContent = content.replace(
  `var Handlebars = require("handlebars");`,
  `//@ts-nocheck\nimport Handlebars from "handlebars";`
)

newContent += "\nexport default templates;"

fs.writeFileSync("./src/emails/templates.ts", newContent)
