import loader from "./loader.js";

// start server
loader.start(8080);

// bind endpoint
loader.bind({
    endpoint: "all", // handle all traffic here
    fetch: (Request, Response) => {
        return new Response("Hello, world!", {
            status: 200,
            headers: new loader.Headers({
                "Content-Type": "text/plain",
                "Hi-Mom": "It works!",            
            })
        });
    }
});