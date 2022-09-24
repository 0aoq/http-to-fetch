# http-to-fetch

Very simple handler for converting `node:http`'s `IncomingMessage` object into a a [Fetch API Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)

## Usage

After starting a server using `node:http`, listen for requests and convert the objects. Example:

```ts
// (typescript)
import http from "node:http";

http.createServer((request, response) => {
    // create request and return 200 response
    const req = new Request();
    req.translate(request, response);

    // the HTTPResponse object will automatically close the request!
    new HTTPResponse(
        `Hi mom!`, // body
        {
            // options
            status: 200,
            headers: new Headers({
                "Content-Type": "text/plain",
            }),
        },
        req // request
    );
}).listen(8080);
```

### Usage (with PluginAPI)

This library also includes a "Plugin API" that makes the whole process much more like the the native web Fetch API.

Using a basic loader (or the one from [/example](/example/loader.ts)), just listen and handle the request.

```ts
// (typescript)
import loader from "./loader.js";

// start server
loader.start(8080);

// bind endpoint
loader.bind({
    endpoint: "/", // serve everything on the root endpoint (/)
    fetch: (Request, Response) => {
        return new Response(
            "Hello, world!", // body
            {
                // options
                status: 200,
                headers: new loader.Headers({
                    "Content-Type": "text/plain",
                    "Hi-Mom": "It works!",
                }),
            }
        );
    },
});
```

This loader uses the [Plugin.registerEndpoint](https://h2f.docs.oxvs.net/classes/lib_pluginapi.Plugin.html#registerEndpoint) to register an endpoint for the endpoint you defined.

```ts
// (typescript)
// from: loader.ts
// ...
export function bindEndpoint(params: { endpoint: string; fetch: fetch }) {
    // create plugin client
    const pluginClient = new Plugin();

    // update plugin client bindings
    pluginClient.bindOnRegEndpoint((endpoint: string, fetch: fetch) => {
        endpointList[endpoint] = fetch;
        endpointList[`${endpoint}/`] = fetch; // account for trailing slash
    });

    // bind endpoint
    pluginClient.registerEndpoint(params.endpoint, params.fetch);
}
// ...
```

_`loader.bind` just calls `loader.bindEndpoint`_

```ts
// (typescript)
// from: loader.ts
// ...
export default {
    bind: bindEndpoint,
    // ...
```

It is recommended that you just use the example loader and extend it.