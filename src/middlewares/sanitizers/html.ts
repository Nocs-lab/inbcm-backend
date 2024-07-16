import _sanitizeHtml, { IOptions } from "sanitize-html"

interface Body {
  [key: string]: any
}

interface Config extends IOptions {}

function cleanup(body: Body, config: Config): Body {
  for (const key in body) {
    if (typeof body[key] === "object" || Array.isArray(body[key])) {
      body[key] = cleanup(body[key], config)
    } else if (typeof body[key] === "string") {
      body[key] = _sanitizeHtml(body[key], config)
    }
  }
  return body
}

/**
 * Middleware function to sanitize request body recursively.
 * @param config Sanitize-html configuration options.
 * @returns Express middleware function.
 */
export default function sanitizeHtml(config: Config = {}) {
  return function (req: any, _res: any, next: () => void) {
    req.body = cleanup(req.body, config)
    next()
  }
}
