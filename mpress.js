var http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;

const Mpress = {
  server: {
    listen: (port) => {
      var httpServer = http.createServer((req, res) => {
        // this callb ack function gets called each time when the server gets a hit.
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
        // set query to req as a property
        req.query = parsedUrl.query;

        // get the payload, req obj has streams.
        const decoder = new StringDecoder("utf-8");
        var buffer = "";

        req.on("data", (data) => {
          buffer += decoder.write(data);
        });

        req.on("end", () => {
          buffer += decoder.end();
          // set data in request as body property.
          req.body = buffer;
          // do the middleware things.
          Mpress.processMiddlewares(req, res);
          const handler = Mpress.routes[path] || Mpress.default;
          handler(req, res);
        });
      });
      httpServer.listen(port, () => {
        console.log(`Server stared listening on ${port}`);
      });
    },
  },

  middlewares: [],

  routes: {},

  default: (req, res) => {
    res.writeHead(404);
    res.end("Not found\n");
  },

  routeFunctionFor: (method) => {},

  processMiddlewares: (req, res) => {
    for (const middleware of Mpress.middlewares) {
      middleware(req, res);
    }
  },

  next: () => {},

  use: (cb) => {
    Mpress.middlewares.push(cb);
  },

  get: (path, cb) => {
    Mpress.routes[path] = cb;
  },
};

Mpress.use((req, res) => {
  try {
    req.body = JSON.parse(req.body);
  } catch (error) {}
});

Mpress.get("test", (req, res) => {
  res.writeHead(200);
  const { body } = req;
  console.log(typeof body);
  res.end("Done by test\n");
});

Mpress.server.listen(3001);
