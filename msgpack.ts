import { NextFunction, Request, RequestHandler } from "express";
import readBody from "raw-body";
import { Packr } from "msgpackr"

type ReadBodyCallback = (err: Error, body: Buffer) => void;

const msgpack = (): RequestHandler => {
  const r = new RegExp("^application/x-msgpack", "i")

  const packr = new Packr();

  const bodyHandler = (req: Request, next: NextFunction): ReadBodyCallback => (err, body) => {
    if (err) {
      return next(err);
    }
    try {
      req.body = packr.unpack(body);
    } catch (err) {
      return next(err);
    }
    (req as Request & { _body: boolean })._body = true;
    next();
  };

	return async (req, res, next) => {
		try {
      const _json = res.json;
			res.json = (body) => {
				return res.format({
					"application/json": () => _json.call(res, body),
					"application/x-msgpack": () => res.send(packr.pack(body)),
				});
			};

			if (r.test(req.header("Content-Type") ?? "")) {
				return readBody(
					req,
					{ length: req.header("Content-Length"), limit: "100kb" },
					bodyHandler(req, next)
				);
			}

			next();
		} catch (err) {
			next(err);
		}
	};
};

export default msgpack;
