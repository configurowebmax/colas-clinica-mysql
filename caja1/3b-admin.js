var adm = {
    // (A) PROPERTIES
    connected : false, // connected to websocket
    ready : false, // app ready
    hQT : null, // html queue total
    hQN : null, // html queue now
    hSS : null, // html server status
  
    // (B) ADMIN INIT
    init : () => {
      // (B1) GET HTML ELEMENTS
      adm.hQT = document.querySelector("#qTotal .qNum");
      adm.hQN = document.querySelector("#qNow .qNum");
      adm.hSS = document.getElementById("server");
  
      // (B2) ATTACH CONTROLS
      document.getElementById("qTotal").onclick = adm.issQ;
      document.getElementById("qNow").onclick = adm.nextQ;
  
      // (B3) CONNECT TO WEBSOCKET
      queue.connect({
        // (B3-1) ON OPEN/CLOSE/ERROR
        open : e => adm.toggle(true),
        close : e => adm.toggle(false),
        error : e => adm.toggle(false),
  
        // (B3-2) INIT QUEUE NUMBER
        msg : e => {
          try {
            let res = JSON.parse(e.data);
            if (res.r=="putQ") { adm.putQ(res.qt, res.qn); }
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
        adm.connected = true;
        adm.hSS.className = "green";
        adm.hSS.innerHTML = "Conectado al Servidor";
        adm.getQ();
      } else {
        adm.connected = false;
        adm.ready = false;
        adm.hSS.className = "red";
        adm.hSS.innerHTML = "Desconectado del Servidor";
      }
    },
  
    // (D) REQUEST QUEUE NUMBERS UPDATE FROM SERVER
    getQ : () => { if (adm.connected) {
      queue.send("getQ");
    }},
  
    // (E) UPDATE HTML QUEUE NUMBERS
    putQ : (qt, qn) => { if (adm.connected) {
      adm.hQT.innerHTML = qt;
      adm.hQN.innerHTML = qn;
      adm.ready = true;
    }},
  
    // (F) ISSUE QUEUE NUMBER
    issQ : () => { if (adm.ready) {
      queue.send("issQ");
    }},
  
    // (G) NEXT!
    nextQ : () => { if (adm.ready) {
      queue.send("nextQ");
    }}
  };
  window.onload = adm.init;