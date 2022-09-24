/**
 * @file Handle primary plugin API, used for registering endpoints
 * @name pluginapi.ts
 * @license MIT
 */

import { fetch, Request, Response, HTTPResponse } from "./fetchapi.js";

/**
 * @class Plugin
 */
export class Plugin {
    onRegisterEndpoint?: (endpoint: string, fetch: fetch) => void;

    constructor() {}

    /**
     * @function Plugin.bindOnRegEndpoint
     * @description Set function to handle an endpoint registration
     */
    public bindOnRegEndpoint(fun: (endpoint: string, fetch: fetch) => void) {
        this.onRegisterEndpoint = fun;
    }

    /**
     * @function Plugin.registerEndpoint
     * @description Create a new server endpoint
     *
     * @param {(Request: Request, Response: Response) => HTTPResponse} fetch
     */
    public registerEndpoint(
        endpoint: string,
        fetch: (Request: Request, Response: Response) => HTTPResponse
    ) {
        if (!this.onRegisterEndpoint) return;

        // register endpoint
        this.onRegisterEndpoint(endpoint, fetch);
    }
}

// default export
export default {
    Plugin
};
