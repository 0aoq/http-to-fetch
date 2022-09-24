/**
 * @file Handle the example server and loader
 * @name index.ts
 */

import http from "node:http";
import path from "node:path";

import {
    fetch,
    Request,
    HTTPResponse,
    ResponseOptions,
    Headers,
} from "../lib/fetchapi.js";

import { Plugin } from "../lib/pluginapi.js";

// start server
let endpointList: { [key: string]: any } = {};
const server = http.createServer((request, response) => {
    let pathname = request.url!.toString() as string;

    // check if endpoint handler exists
    if (endpointList[pathname] || endpointList["all"]) {
        // create request
        const req = new Request();
        req.translate(request, response);

        // call all handler first
        if (!endpointList[pathname] && endpointList["all"]) {
            return endpointList["all"](
                req,
                class extends HTTPResponse {
                    // response object but it supplies the request automatically
                    constructor(body: string, options: ResponseOptions) {
                        super(body, options, req);
                    }
                }
            );
        }

        // run handler and return
        return endpointList[pathname](
            req,
            class extends HTTPResponse {
                // response object but it supplies the request automatically
                constructor(body: string, options: ResponseOptions) {
                    super(body, options, req);
                }
            }
        );
    } else {
        // create request and return 404 response
        const req = new Request();
        req.translate(request, response);

        new HTTPResponse(
            `404: Not Found! (${pathname})`,
            {
                status: 404,
                headers: new Headers({
                    "Content-Type": "text/plain",
                }),
            },
            req
        );
    }
});

/**
 * @function bindEndpoint
 * @description Bind an endpoint to a function
 *
 * @param {object} params
 *
 * @param {string} params.endpoint
 * @param {fetch} params.fetch
 *
 * @returns {void}
 *
 * @example
 * import loader from "./loader.js";
 *
 * // start server
 * loader.start(8080);
 *
 * // bind endpoint
 * loader.bind({
 *     endpoint: "/",
 *     fetch: (Request, Response) => {
 *         return new Response("Hello, world!", {
 *             status: 200,
 *             headers: new loader.Headers({
 *                 "Content-Type": "text/plain",
 *                 "Hi-Mom": "It works!",
 *             })
 *         });
 *     }
 * });
 */
export function bindEndpoint(params: { endpoint: string; fetch: fetch }) {
    // create plugin client
    const pluginClient = new Plugin();

    // update plugin client bindings
    pluginClient.bindOnRegEndpoint((endpoint: string, fetch: fetch) => {
        if (endpoint === "all") {
            // call this endpoint every time
            endpointList["all"] = fetch;
        }

        // normal
        endpointList[endpoint] = fetch;
        endpointList[`${endpoint}/`] = fetch; // account for trailing slash
    });

    // bind endpoint
    pluginClient.registerEndpoint(params.endpoint, params.fetch);
}

// default export
export default {
    bind: bindEndpoint,

    /**
     * @function start
     * @description Start the HTTP server on a specific port
     *
     * @param {number} port
     * @returns {void}
     */
    start: (port: number) => {
        server.listen(port);
    },

    // export headers so "new Headers()" can be used
    Headers,
};
