#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>

Adafruit_BNO055 bno = Adafruit_BNO055(55);

const char* ssid = "Apt329";                   // wifi ssid
const char* password =  "4243201550";         // wifi password
const char* mqttServer = "192.168.1.8";    // IP adress Raspberry Pi
const int mqttPort = 1883;
const char* mqttUser = "Whereiot";      // if you don't have MQTT Username, no need input
const char* mqttPassword = "joeyandnic";  // if you don't have MQTT Password, no need input
String string_dir ;
char x_dir[8] ;
char y_dir[8] ;
char z_dir[8] ;
String total_dir;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {

  Serial.begin(9600);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");

  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");

    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {

      Serial.println("connected");

    } else {

      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);

    }
  }

  Serial.println("Orientation Sensor Test"); Serial.println("");
  
  /* Initialise the sensor */
  if(!bno.begin())
  {
    /* There was a problem detecting the BNO055 ... check your connections */
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }
  
  delay(1000);
    
  bno.setExtCrystalUse(true);

//  client.publish("esp8266", "Hello Raspberry Pi");
//  client.subscribe("esp8266");

}

void callback(char* topic, byte* payload, unsigned int length) {

  Serial.print("Message arrived in topic: ");
  Serial.println(topic);

  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }

  Serial.println();
  Serial.println("-----------------------");

}

void loop() {
  total_dir = "";
  sensors_event_t event; 
  bno.getEvent(&event);
  
  /* Display the floating point data */
  Serial.print("X: ");
  Serial.print(event.orientation.x, 4);
  Serial.print("\tY: ");
  Serial.print(event.orientation.y, 4);
  Serial.print("\tZ: ");
  Serial.print(event.orientation.z, 4);
  Serial.println("");

  dtostrf(event.orientation.x,3,4,x_dir);
  dtostrf(event.orientation.y,3,4,y_dir);
  dtostrf(event.orientation.z,3,4,z_dir);

  total_dir.concat("\nX:");
  total_dir.concat(x_dir);
  total_dir.concat("\tY:");
  total_dir.concat(y_dir);
  total_dir.concat("\tZ:");
  total_dir.concat(z_dir);
  
  client.publish("esp8266",total_dir.c_str());
  
  client.subscribe("esp8266");
  delay(300);
  client.loop();
}
