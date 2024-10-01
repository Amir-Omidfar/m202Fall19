/*
  Basic ESP32 MQTT example

*/

#if defined(ESP8266)
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#if defined(ESP8266)
#include <ESP8266WebServer.h>
#else
#include <WebServer.h>
#endif
#include <PubSubClient.h>

const char* mqtt_server = "10.0.0.239"; //mqtt server
const char* ssid = "PishiDino";
const int port = 8883;
const char* password = "8185102546";

WiFiClient espClient;
PubSubClient client(espClient); //lib required for mqtt

void setup()
{
  //Serial.begin(115200);
  WiFi.begin(ssid, password);
  //Serial.println("connected");
  client.setServer(mqtt_server, 8883);//connecting to mqtt server
  connectmqtt();
}



void reconnect() {
  while (!client.connected()) {
    //Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32_UWB Client")) {
      //Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic", "ESP32 connected to MQTT");
      // ... and resubscribe
      client.subscribe("test-topic");

    } else {
      //Serial.print("failed, rc=");
      //Serial.print(client.state());
      //Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop()
{
  // put your main code here, to run repeatedly:
  if (!client.connected())
  {
    reconnect();
  }
  client.publish("userLoc",  "hi");
  delay(1000);
  client.loop();
}


void connectmqtt()
{
  client.connect("ESP32_UWB Client");  // ESP will connect to mqtt broker with clientID
  {
    //Serial.println("connected to MQTT");
    // Once connected, publish an announcement...

    // ... and resubscribe
    client.subscribe("test_topic"); //topic=Demo
    client.publish("userLoc",  "connected to MQTT");

    if (!client.connected())
    {
      reconnect();
    }
  }
}