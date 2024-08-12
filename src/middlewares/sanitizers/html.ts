import _sanitizeHtml, { IOptions } from "sanitize-html"
import type { Request, Response } from "express"

interface Body {
  [key: string]: unknown
}

interface Config extends IOptions {}

function cleanup(body: Body, config: Config): Body {
  for (const key in body) {
    if (typeof body[key] === "object" || Array.isArray(body[key])) {
      body[key] = cleanup(body[key] as Body, config)
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
  return function (req: Request, _res: Response, next: () => void) {
    req.body = cleanup(req.body, config)
    next()
  }
}
