<?php

require("phpMQTT/phpMQTT.php");

$server = "192.168.1.40";
$port = 9001;
$client_id = "clientjs";

$mqtt = new Bluerhinos\phpMQTT($server, $port, $client_id);

if(!$mqtt->connect(true, NULL, "", "")){
	exit(1);
}

$topics['userLoc'] = array("qos" => 0, "function" => "procmsg");
$topics['esp8266'] = array("qos" => 0, "function" => "procmsg");
$mqtt->subscribe($topics, 0);
$mqtt->publish("jsStatus", "mqtt Start", 0);

while($mqtt->proc()){
}

$mqtt->close();

function procmsg($topic, $msg){
	echo "Msg Received: " . date("r") . "\n";
	echo "Topic: {$topic}\n\n";
	echo "\t$msg\n\n";
}

?>
