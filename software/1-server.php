<?php
// (A) COMMAND LINE CHECK
// CREDITS : https://stackoverflow.com/questions/933367/php-how-to-best-determine-if-the-current-invocation-is-from-cli-or-web-server
function is_cli()
{
    if (php_sapi_name() === "cli") {
        return true;
    }
    if (defined("STDIN")) {
        return true;
    }
    if (array_key_exists("SHELL", $_ENV)) {
        return true;
    }
    if (!array_key_exists("REQUEST_METHOD", $_SERVER)) {
        return true;
    }
    if (empty($_SERVER["REMOTE_ADDR"]) && !isset($_SERVER["HTTP_USER_AGENT"]) && count($_SERVER["argv"]) > 0) {
        return true;
    }
    return false;
}
if (!is_cli()) {
    exit("Porfavor carga el servidor desde la linea de comandos");
}

// (!) PHP 8.2+ HAS DEPRECATED DYNAMIC PROPERTIES
// (!) RATCHET IS STILL USING DYNAMIC PROPERTIES AT TIME OF UPDATE
// (!) WILL THROW DEPRECATED WARNINGS, THIS IS TO "SILENCE" THE ERROR
error_reporting(E_ALL & ~E_DEPRECATED);

// (B) LOAD RATCHET
// composer require cboden/ratchet
require "vendor/autoload.php";

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

// (C) QUEUE CLASS
class Queue implements MessageComponentInterface
{
    // (C1) PROPERTIES
    private $debug = true; // debug mode
    protected $clients; // connected clients
    private $qt = 0; // total queue number
    private $qn = 0; // current queue number

    // (C2) CONSTRUCTOR - INIT LIST OF CLIENTS
    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        if ($this->debug) {
            echo "Queue server started.\r\n";
        }
    }

    // (C3) ON CLIENT CONNECT - STORE INTO $THIS->CLIENTS
    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        if ($this->debug) {
            echo "Client connected: {$conn->resourceId}\r\n";
        }
    }

    // (C4) ON CLIENT DISCONNECT - REMOVE FROM $THIS->CLIENTS
    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
        if ($this->debug) {
            echo "Client disconnected: {$conn->resourceId}\r\n";
        }
    }

    // (C5) ON ERROR
    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->close();
        if ($this->debug) {
            echo "Client error: {$conn->resourceId} | {$e->getMessage()}\r\n";
        }
    }

    // (C6) ON RECEIVING MESSAGE FROM CLIENT
    public function onMessage(ConnectionInterface $from, $msg)
    {
        if ($this->debug) {
            echo "Received message from {$from->resourceId}: {$msg}\r\n";
        }
        $msg = json_decode($msg, true);
        switch ($msg["r"]) {
                // (C6-1) INVALID REQUEST
            default:
                break;

                // (C6-2) ADMIN - UPDATE QUEUE NUMBER REQUEST
            case "getQ":
                $from->send(json_encode([
                    "r" => "putQ",
                    "qt" => $this->qt,
                    "qn" => $this->qn
                ]));
                break;

                // (C6-3) ISSUE A QUEUE NUMBER
            case "issQ":
                $this->qt++;
                $this->putAllQ();
                break;

                // (C6-4) NEXT CUSTOMER
            case "nextQ":
                if ($this->qn < $this->qt) {
                    $this->qn++;
                    $this->putAllQ();
                }
                break;
        }
    }

    // (C7) PUSH QUEUE UPDATE TO ALL CLIENTS
    public function putAllQ()
    {
        $msg = json_encode([
            "r" => "putQ",
            "qt" => $this->qt,
            "qn" => $this->qn
        ]);
        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }
}

// (D) WEBSOCKET QUEUE SERVER START!
$server = IoServer::factory(new HttpServer(new WsServer(new Queue())), 3000); // @CHANGE if not port 8080
$server->run();
