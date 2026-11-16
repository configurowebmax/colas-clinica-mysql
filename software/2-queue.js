var queue = {
  // (A) PROPERTIES
  host : "ws://localhost:3000", // @CHANGE to your own!
  socket : null, // websocket object

  // (B) CONNECT TO WS SERVER
  connect : opt => {
    // (B1) CREATE WEB SOCKET
    queue.socket = new WebSocket(queue.host);

    // (B2) READY - CONNECTED TO SERVER
    if (opt.open) { queue.socket.onopen = opt.open; }

    // (B3) ON CONNECTION CLOSE
    if (opt.close) { queue.socket.onclose = opt.close; }

    // (B4) ON RECEIVING DATA FROM SEREVER
    if (opt.msg) { queue.socket.onmessage = opt.msg; }

    // (B5) ON ERROR
    if (opt.error) { queue.socket.onerror = opt.error; }
  },

  // (C) SEND MESSAGE
  send : (req, data) => {
    if (data === undefined) { data = null; }
    queue.socket.send(JSON.stringify({ r: req, d: data }));
  }
};