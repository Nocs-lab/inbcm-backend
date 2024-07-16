import type { Request, Response } from "express"

interface PlainObject {
  [key: string]: unknown
}

interface Options {
  allowDots?: boolean
  replaceWith?: string
  onSanitize?: (info: { req: unknown; key: string }) => void
  dryRun?: boolean
}

const TEST_REGEX = /^\$|\./
const TEST_REGEX_WITHOUT_DOT = /^\$/
const REPLACE_REGEX = /^\$|\./g

function isPlainObject(obj: unknown): obj is PlainObject {
  return typeof obj === "object" && obj !== null
}

function getTestRegex(allowDots: boolean | undefined): RegExp {
  return allowDots ? TEST_REGEX_WITHOUT_DOT : TEST_REGEX
}

function withEach(
  target: unknown,
  cb: (
    obj: { [key: string]: unknown },
    val: unknown,
    key: string
  ) => { shouldRecurse: boolean; key?: string }
): void {
  ;(function act(obj: unknown): void {
    if (Array.isArray(obj)) {
      obj.forEach(act)
    } else if (isPlainObject(obj)) {
      Object.keys(obj).forEach(function (key) {
        const val = obj[key]
        const resp = cb(obj, val, key)
        if (resp.shouldRecurse) {
          act(obj[resp.key || key])
        }
      })
    }
  })(target)
}

function _sanitize(
  target: unknown,
  options: Options
): { isSanitized: boolean; target: unknown } {
  const regex = getTestRegex(options.allowDots)

  let isSanitized = false
  let replaceWith = null
  const dryRun = Boolean(options.dryRun)
  if (!regex.test(options.replaceWith!) && options.replaceWith !== ".") {
    replaceWith = options.replaceWith
  }

  withEach(target, function (obj, val, key) {
    let shouldRecurse = true

    if (regex.test(key)) {
      isSanitized = true
      // if dryRun is enabled, do not modify the target
      if (dryRun) {
        return {
          shouldRecurse: shouldRecurse,
          key: key
        }
      }
      delete obj[key]
      if (replaceWith) {
        key = key.replace(REPLACE_REGEX, replaceWith)
        // Avoid to set __proto__ and constructor.prototype
        // https://portswigger.net/daily-swig/prototype-pollution-the-dangerous-and-underrated-vulnerability-impacting-javascript-applications
        // https://snyk.io/vuln/SNYK-JS-LODASH-73638
        if (
          key !== "__proto__" &&
          key !== "constructor" &&
          key !== "prototype"
        ) {
          obj[key] = val
        }
      } else {
        shouldRecurse = false
      }
    }

    return {
      shouldRecurse: shouldRecurse,
      key: key
    }
  })

  return {
    isSanitized,
    target
  }
}

/**
 * @param options
 * @returns Middleware function
 */
function sanitizeMongo(options: Options = {}) {
  const hasOnSanitize = typeof options.onSanitize === "function"
  return function (req: Request, _res: Response, next: () => void) {
    ;(["body", "params", "headers", "query"] as const).forEach(function (key) {
      if (req[key]) {
        const { target, isSanitized } = _sanitize(req[key], options)
        req[key] = target
        if (isSanitized && hasOnSanitize) {
          options.onSanitize!({
            req,
            key
          })
        }
      }
    })
    next()
  }
}

export default sanitizeMongo
