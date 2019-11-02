#include <EEPROM.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>
#include <QueueArray.h>
#include <Wire.h> //i2c scan

// Connect to the WiFi
//const char* ssid = "NETGEAR99";
const char* ssid = "lemur";
//const char* ssid = "xixiHao";
//const char* password = "19930903";
const char* password = "lemur9473";
//const char* password = "3108807519";
const char* mqtt_server = "192.168.1.40";
const char* userLoc = "userLoc";
const char* locData = "locData";
const char* userName = "raspberrypi";
const char* triggerTopic = "trigger/Richard";
const char* pointTopic = "point/Richard";



HardwareSerial myserial(2);
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


void sendData(const char* topic) {
  sensors_event_t event;
  bno.getEvent(&event);
  dwm_pos_t * p_pos = (dwm_pos_t * )malloc(sizeof(dwm_pos_t));
  //Serial1.write(0x02);
  myserial.write(0x02);
  //Serial1.write((byte)0x00);
  myserial.write((byte)0x00);
  delay(5);
  uint8_t data_cnt = 0;
  uint16_t rx_len = 0;
  uint8_t * rx_data = (byte*)malloc(50);
  while (myserial.available()) {
    rx_data[rx_len] =  myserial.read();
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
  
  mydata1 += " ";
  mydata1 += userName;
  mydata1 += " ";
  mydata1 += String(p_pos->qf);
  mydata1.toCharArray(locCharData, 80);
  
  client.publish(topic, locCharData);
  free(rx_data);
  free(locCharData);
//  Serial.println( "detected a pointing!");
  free(p_pos);

}


void callback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, pointTopic) == 0) {
    sendData(locData);
  }
  else if (strcmp(topic, triggerTopic) == 0) {
    for (int i = 0; i < length; i++) {
      char receivedChar = (char)payload[i];
      Serial.println(receivedChar);
      if (receivedChar == '0')
      {
        digitalWrite(13, LOW);

      }
      else {
        digitalWrite(13, HIGH);
      }
    }
  }
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
    if (client.connect(mqtt_server)) {
      client.subscribe(triggerTopic);
      client.subscribe(pointTopic);
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
  Wire.begin(); //i2c scan 
  Serial.begin(9600);
  myserial.begin(115200);
  
  client.setServer(mqtt_server, 1883);
  setup_wifi();
  //setup_wifi();
  client.setCallback(callback);
  delay(3000);
  /*
  if (!bno.begin())
  {
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while (1);
  }*/
  
  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);
  delay(1000);
  bno.setExtCrystalUse(true);

}

void loop()
{
  
  if (!client.connected()) {
    reconnect();
  }
  /*
  byte error, address;
  int nDevices;
 
  Serial.println("Scanning...");
 
  nDevices = 0;
  for(address = 1; address < 127; address++ )
  {
    // The i2c_scanner uses the return value of
    // the Write.endTransmisstion to see if
    // a device did acknowledge to the address.
    //Wire.beginTransmission(address);
    Wire.requestFrom(address,2);
    //Serial.println(address,HEX);
    //error = Wire.endTransmission(true);
 
    if (error == 0)
    {
      Serial.print("I2C device found at address 0x");
      if (address<16)
        Serial.print("0");
      Serial.print(address,HEX);
      Serial.println("  !");
 
      nDevices++;
    }
    else if (error==4)
    {
      Serial.print("Unknown error at address 0x");
      if (address<16)
        Serial.print("0");
      Serial.println(address,HEX);
    }    
  }
  if (nDevices == 0){
    Serial.println("No I2C devices found\n");
    Serial.println(error);
  }
  else{
    Serial.println("done\n");
  }
  delay(5000);  
  //i2c scanner
  */
  
  client.loop();
  //char * charData1 = (char*)malloc(50);
  //client.publish("publishing",charData1);
  /*
  imu::Vector<3> acc = bno.getVector(Adafruit_BNO055::VECTOR_LINEARACCEL);
  imu::Vector<3> gyros = bno.getVector(Adafruit_BNO055::VECTOR_GYROSCOPE);
  String myimudata = "";
  char * charData1 = (char*)malloc(50);
  myimudata += String(acc.x());
  myimudata += " ";
  myimudata += String(acc.y());
  myimudata += " ";
  myimudata += String(acc.z());
  myimudata += " ";
  myimudata += String(gyros.x());
  myimudata += " ";
  myimudata += String(gyros.y());
  myimudata += " ";
  myimudata += String(gyros.z());
  myimudata += " ";
  myimudata += userName;
  myimudata.toCharArray(charData1, 50);

  client.publish("data", charData1);*/
  sendData(userLoc);
  //free(charData1);
  delay(100);
}
