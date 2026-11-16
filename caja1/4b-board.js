var board = {
    // (A) PROPERTIES
    connected : false, // connected to websocket
    aDD : null, // ding dong audio
    hQN : null, // html queue now
    hSS : null, // html server status
  
    // (B) INIT QUEUE BOARD
    start : () => {
      // (B1) PRELOAD AUDIO
      board.aDD = new Audio("ding-dong.mp3");
  
      // (B2) GET + TOGGLE HTML ELEMENTS
      board.hSS = document.getElementById("server");
      board.hQN = document.getElementById("qNum");
      document.getElementById("start").style.display = "none";
      document.getElementById("board").style.display = "block";
  
      // (B3) CONNECT TO WEBSOCKET
      queue.connect({
        // (B3-1) ON OPEN/CLOSE/ERROR
        open : e => board.toggle(true),
        close : e => board.toggle(false),
        error : e => board.toggle(false),
  
        // (B3-2) INIT QUEUE NUMBER
        msg : e => {
          try {
            let res = JSON.parse(e.data);
            if (res.r=="putQ") { board.putQ(res.qn); }
          } catch (e) {
            alert("Init error");
            console.error(e);
          }
        }
      });
    },
  
    // (C) TOGGLE CONNECTION STATUS
    toggle : good => {
      if (good) {
        board.connected = true;
        board.hSS.className = "green";
        board.hSS.innerHTML = "Conectado al Servidor";
        board.getQ();
      } else {
        board.connected = false;
        board.hSS.className = "red";
        board.hSS.innerHTML = "Desconectado del Servidor";
      }
    },
  
    // (D) REQUEST QUEUE NUMBERS UPDATE FROM SERVER
    getQ : () => { if (board.connected) {
      queue.send("getQ");
    }},
  
    // (E) UPDATE HTML QUEUE NUMBERS
    putQ : qn => { if (board.connected && board.hQN.innerHTML!=qn) {
      board.hQN.innerHTML = qn;
      board.aDD.currentTime = 0;
      board.aDD.play();
    }}
  };