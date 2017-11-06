const { server: WebSocketServer } = require('websocket');
const Base = require('noflo-runtime-base');

class WebSocketRuntime extends Base {
  constructor(options = {}) {
    super(options);
    this.connections = [];
    if (options.catchExceptions) {
      process.on('uncaughtException', (err) => {
        this.connections.forEach((connection) => {
          this.send('network', 'error', err, {
            connection,
          });
          if (err.stack) {
            console.error(err.stack);
          } else {
            console.error(`Error: ${err.toString()}`);
          }
        });
      });
    }

    if (options.captureOutput) {
      this.startCapture();
    }
  }

  send(protocol, topic, payload, context) {
    if (!context.connection || !context.connection.connected) {
      return;
    }
    let normalizedPayload = payload;
    if (payload instanceof Error) {
      normalizedPayload = {
        message: payload.message,
        stack: payload.stack,
      };
    }
    context.connection.sendUTF(JSON.stringify({
      protocol,
      command: topic,
      normalizedPayload,
    }));
    super.send(protocol, topic, payload, context);
  }

  sendAll(protocol, topic, payload) {
    this.connections.forEach((connection) => {
      this.send(protocol, topic, payload, {
        connection,
      });
    });
  }

  startCapture() {
    this.originalStdOut = process.stdout.write;
    process.stdout.write = (string) => {
      this.connections.forEach(function (connection) {
        this.send('network', 'output', {
          message: string.replace(/\n$/, ''),
        }, {
          connection,
        });
      });
    };
  }

  stopCapture() {
    if (!this.originalStdOut) {
      return;
    }
    process.stdout.write = this.originalStdOut;
  }
}

module.exports = function (httpServer, options) {
  const wsServer = new WebSocketServer({
    httpServer,
  });

  const runtime = new WebSocketRuntime(options);
  const handleMessage = function (message, connection) {
    if (message.type === 'utf8') {
      let contents;
      try {
        contents = JSON.parse(message.utf8Data);
      } catch (e) {
        if (e.stack) {
          console.error(e.stack);
        } else {
          console.error(`Error: ${e.toString()}`);
        }
        return;
      }
      runtime.receive(contents.protocol, contents.command, contents.payload, {
        connection,
      });
    }
  };

  wsServer.on('request', (request) => {
    const subProtocol = (request.requestedProtocols.indexOf('noflo') !== -1) ? 'noflo' : null;
    const connection = request.accept(subProtocol, request.origin);
    runtime.connections.push(connection);
    connection.on('message', (message) => {
      handleMessage(message, connection);
    });
    connection.on('close', () => {
      if (runtime.connections.indexOf(connection) === -1) {
        return;
      }
      runtime.connections.splice(runtime.connections.indexOf(connection), 1);
    });
  });

  return runtime;
};
