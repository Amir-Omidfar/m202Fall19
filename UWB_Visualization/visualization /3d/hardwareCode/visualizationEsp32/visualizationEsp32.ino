#include <EEPROM.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>


// Connect to the WiFi
const char* ssid = "NETGEAR99";
const char* password = "19930903";
const char* mqtt_server = "192.168.1.8";
HardwareSerial Serial1(2);
WiFiClient espClient;
PubSubClient client(espClient);

Adafruit_BNO055 bno = Adafruit_BNO055(55);


typedef struct {
  int32_t x;
  int32_t y;
  int32_t z;
  uint8_t qf;
  double yaw;
  double pitch;
  double roll;
} dwm_pos_t;



void callback(char* topic, byte* payload, unsigned int length) {

}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32visUser", "admin", "19930903")) {

      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 3 seconds");

      delay(3000);
    }
  }
}

void setup()
{
  Serial.begin(9600);
  Serial1.begin(115200);
  client.setServer(mqtt_server, 1883);
  setup_wifi();
  client.setCallback(callback);
  delay(3000);

  if (!bno.begin())
  {
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while (1);
  }
  pinMode(14, OUTPUT);
  digitalWrite(14, LOW);
  delay(1000);
  bno.setExtCrystalUse(true);

}

void loop()
{
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  sensors_event_t event;
  bno.getEvent(&event);



  dwm_pos_t * p_pos = (dwm_pos_t * )malloc(sizeof(dwm_pos_t));

  Serial1.write(0x02);
  Serial1.write((byte)0x00);
  delay(5);
  uint8_t data_cnt = 0;
  uint16_t rx_len = 0;
  uint8_t * rx_data = (byte*)malloc(50);
  while (Serial1.available()) {
    rx_data[rx_len] =  Serial1.read();
    rx_len++;

  }
  if (rx_data[2] == (byte)0x00 && rx_data[4] == (byte)0x0D) {
    data_cnt = 5;
    p_pos->x = rx_data[data_cnt]
               + (rx_data[data_cnt + 1] << 8)
               + (rx_data[data_cnt + 2] << 16)
               + (rx_data[data_cnt + 3] << 24);
    data_cnt += 4;
    p_pos->y = rx_data[data_cnt]
               + (rx_data[data_cnt + 1] << 8)
               + (rx_data[data_cnt + 2] << 16)
               + (rx_data[data_cnt + 3] << 24);
    data_cnt += 4;
    p_pos->z = rx_data[data_cnt]
               + (rx_data[data_cnt + 1] << 8)
               + (rx_data[data_cnt + 2] << 16)
               + (rx_data[data_cnt + 3] << 24);
    data_cnt += 4;
    p_pos->qf = rx_data[data_cnt];
  }
  p_pos->yaw = event.orientation.x;
  p_pos->pitch = event.orientation.y;
  p_pos->roll = event.orientation.z;
  char * locCharData = (char*)malloc(80);
  String mydata1 = "";
  mydata1 += String(p_pos->x);
  mydata1 += " ";
  mydata1 += String(p_pos->y);
  mydata1 += " ";
  mydata1 += String(p_pos->z);
  mydata1 += " ";
  mydata1 += String(p_pos->yaw);
  mydata1 += " ";
  mydata1 += String(p_pos->pitch);
  mydata1 += " ";
  mydata1 += String(p_pos->roll);
  mydata1.toCharArray(locCharData, 80);
  client.publish("locData", locCharData);
  free(rx_data);
  free(locCharData);
  Serial.println( "detected a pointing!");

  free(p_pos);

  delay(90);
}
