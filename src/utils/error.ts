export default class HTTPError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = this.constructor.name
    this.status = status
  }
}
