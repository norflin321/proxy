import type { NextApiRequest, NextApiResponse } from "next";
import os from "os";

type TParams = {
	method: "GET" | "POST";
	url: string;
	query?: `?${string}`;
	body?: any;
	headers?: { [key in string]: string };
}

class IpAddress {
	private static updateTimeout = 30 * 60 * 1000; // 5 min;
	private static updatedTime = 0;

	private static _value?: string;
	static get value() {
		// when value is empty update it and return
		if (!this._value) {
			this.update();
			return this._value;
		}

		// when cached value is too old then update it and return
		const secondsSinceUpdate = (Date.now() - this.updatedTime) / 1000;
		if (secondsSinceUpdate >= this.updateTimeout) {
			this.update();
			return this._value;
		}

		return this._value;
	}

	/** finds ip address inside of this machine network interfaces */
	static update() {
		const net = os.networkInterfaces();
		let ip = "";

		for (const name in net) {
		  const iface = net[name];
			if (!iface) continue;

		  for (const alias of iface) {
		    if (alias.family == "IPv4" && !alias.internal) {
		      ip = alias.address;
		      break;
		    }
		  }

		  if (ip) break;
		}

		this.updatedTime = Date.now();
		this._value = ip;
	}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method != "POST") return;

		// check for incorrect request params
		const params: TParams = JSON.parse(req.body);
		if (params.method != "GET" && params.method != "POST") {
			res.status(400).send("method should be GET or POST");
			return;
		}
		if (!params.url) {
			res.status(400).send("provide an url");
			return;
		}
		if (params.query && params.query[0] != "?") {
			res.status(400).send("query should start with question mark ('?')");
			return;
		}

		// create request object
		const options: RequestInit = { method: params.method };
		if (params.headers) {
		  const headers = new Headers();
			for (const key in params.headers) headers.append(key, params.headers[key]);
			options.headers = headers;
		}
		if (params.body) options.body = JSON.stringify(params.body);

		// make request
		const url = params.url + (params.query ?? "");
		const response = await fetch(url, options);

		// create response object
		const responseJson = {
			info: { proxyIp: IpAddress.value, targetReqUrl: url },
			resBlob: (await (await response.blob()).text())
		}

		// send response to the client
		res.status(200).json(responseJson);
	} catch(err: any) {
		// handle internal server errors
		res.status(500).send(err.message);
	}
}