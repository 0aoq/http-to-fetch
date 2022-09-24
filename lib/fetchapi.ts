/**
 * @file Handle the Fetch API
 * @name fetchapi.ts
 * @license MIT
 */

import http from "node:http";

/**
 * @class Headers
 */
export class Headers extends Object {
    st: { [key: string]: string } = {};

    constructor(initial?: { [key: string]: string }) {
        super();

        // push initial headers
        if (initial === undefined) return;
        this.headerList = initial;
    }

    set headerList(nv: any) {
        this.st = nv;
        this.readST();
    }

    /**
     * @function Headers.readST
     * @description Add all values from ST to the Headers object
     *
     * @param {boolean} collapse Should the headers be collapsed and not expand?
     * @returns {void}
     */
    private readST(collapse: boolean = false) {
        if (this.st === undefined) return; // ???
        for (let header of Object.entries(this.st)) {
            // @ts-ignore
            if (this[header[0]] !== undefined) continue; // already exists!

            // if header[1] contains more than one comma, split it
            // (headers commonly use a comma to split data)
            if (!collapse)
                if (header[1].split(",").length > 1)
                    header[1] = header[1].split(",") as any;

            // @ts-ignore (I don't care)
            this[header[0]] = header[1];
        }
    }

    /**
     * @function Headers.append
     * @description https://developer.mozilla.org/en-US/docs/Web/API/Headers/append
     *
     * @param {string} name
     * @param {string} value
     */
    public append(name: string, value: string) {
        // just do this.set, we don't actually care about append
        this.set(name, value);
    }

    /**
     * @function Headers.set
     * @description https://developer.mozilla.org/en-US/docs/Web/API/Headers/set
     *
     * @param {string} name
     * @param {string} value
     */
    public set(name: string, value: string) {
        this.st[name] = value;
    }

    /**
     * @function Headers.get
     * @description https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
     *
     * @param {string} name
     * @param {string} value
     */
    public get(name: string) {
        return this.st[name];
    }
}

/**
 * @class Request
 * @description https://developer.mozilla.org/en-US/docs/Web/API/Request
 */
export class Request {
    headers: Headers = new Headers();
    path: string = ""; // TODO: construct full url instead of just adding this.path
    method: string = "GET";
    origin?: http.ServerResponse;

    text: () => Promise<string> = undefined as any;
    json: () => Promise<object> = undefined as any;

    constructor() {}

    /**
     * @function Request.translate
     * @description Translate a node:http request to sw request
     *
     * @param {http.IncomingMessage} request
     * @returns {Request}
     */
    public translate(
        request: http.IncomingMessage,
        response: http.ServerResponse
    ) {
        this.origin = response;

        // build this request object based on the request param
        this.headers.headerList = request.headers as any;
        this.path = request.url as string; // TODO: construct full url instead of just adding this.path
        this.method = request.method || "GET";

        // get body
        let body = "";

        request.on("readable", function () {
            body += request.read();
        });

        this.text = async () => {
            // async turns this into Promise<string> instead of just string
            return body;
        };

        this.json = async () => {
            // async turns this into Promise<object> instead of just string
            return JSON.parse(body);
        };
    }
}

/**
 * @type ResponseOptions
 */
export type ResponseOptions = {
    status: number;
    headers: Headers;
    // method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD"; // DOESN'T BELONG HERE
};

/**
 * @class HTTPResponse
 * @description https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
export class HTTPResponse {
    body: string;
    options: ResponseOptions;
    request?: Request; // DO NOT GIVE IN ENDPOINT HANDLE

    constructor(body: string, options: ResponseOptions, request: Request) {
        // handle options
        options.headers = options.headers.st as any; // basically collapse

        // add to this
        this.body = body;
        this.options = options;
        this.request = request;

        // translate was probably applied to the given request object, so just use request.origin
        if (!this.request.origin) return;
        this.request.origin.writeHead(
            this.options.status || 200,
            this.options.headers as any
        );

        this.request.origin.end(this.body);
    }
}

/**
 * @type Response
 * @description https://developer.mozilla.org/en-US/docs/Web/API/Response
 * 
 * Automatically builds HTTPResponse object with Request object
 */
export type Response = {
    new (body: string, options: ResponseOptions): HTTPResponse;
};

/**
 * @type fetch
 */
export type fetch = (Request: Request, Response: Response) => HTTPResponse;

// default export
export default {
    HTTPResponse,
    Request,
    Headers
}