//code write by Moz for YouTube changel logMaker360, 24-11-2016
//code belongs to this video: https://youtu.be/nAUUdbUkJEI

#include <EEPROM.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

 
// Connect to the WiFi
const char* ssid = "ESPap";                           //!!!!!!!!!!!!!!!!!!!!!
const char* password = "thereisnospoon";                //!!!!!!!!!!!!!!!!!!!!!
const char* mqtt_server = "192.168.1.8";                 //!!!!!!!!!!!!!!!!!!!!!
 
WiFiClient espClient;
PubSubClient client(espClient);
 
const byte ledPin =2; 
 
void LEDChange() {
  
  Serial.print("Start Sending");
  digitalWrite(ledPin, HIGH);
  delay(5000);
  digitalWrite(ledPin, LOW);
  delay(5000);
  Serial.print("Loop Finished");
  Serial.println();
}
 
 
void reconnect() {
 // Loop until we're reconnected
 while (!client.connected()) {
 Serial.print("Attempting MQTT connection...");
 // Attempt to connect
 if (client.connect("ESP8266 Client")) {
  Serial.println("connected");
  // ... and subscribe to topic
  client.subscribe("ledStatus");
 } else {
  Serial.print("failed, rc=");
  Serial.print(client.state());
  Serial.println(" try again in 5 seconds");
  // Wait 5 seconds before retrying
  delay(5000);
  }
 }
}
 
void setup()
{
 Serial.begin(9600);
 
 client.setServer(mqtt_server, 1883);
 client.setCallback(LEDChange);
 
 pinMode(ledPin, OUTPUT);
 digitalWrite(ledPin, HIGH);
 delay(5000);
 digitalWrite(ledPin, LOW);
}
 
void loop()
{
 if (!client.connected()) {
  reconnect();
 }
 client.loop();
}

/* Python code LEDblink.py
import paho.mqtt.publish as publish
import time

While True:
   print("Sending 1...")
   publish.single("ledStatus", "1", hostname="Your broker IP")
   time.sleep(6)
   print("Sending 0...")
   publish.single("ledStatus", "0", hostname="Your broker IP")
   time.sleep(3)

*/
