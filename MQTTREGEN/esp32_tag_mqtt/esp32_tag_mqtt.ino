/*
  ESP32S3 Dev Module MQTT with DW3000 with ST32 AT commands enabled
*/
// User config          ------------------------------------------

#define UWB_INDEX 0

#define TAG

#define FREQ_850K

#define UWB_TAG_COUNT 64

// User config end       ------------------------------------------

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Arduino.h>

#define SERIAL_LOG Serial
#define SERIAL_AT mySerial2

HardwareSerial SERIAL_AT(2);

#define RESET 16

#define IO_RXD2 18
#define IO_TXD2 17

#define I2C_SDA 39
#define I2C_SCL 38

Adafruit_SSD1306 display(128, 64, &Wire, -1);



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

void uwbsetup()
{
    pinMode(RESET, OUTPUT);
    digitalWrite(RESET, HIGH);

    SERIAL_LOG.begin(115200);

    SERIAL_LOG.print(F("Hello! ESP32-S3 AT command V1.0 Test"));
    SERIAL_AT.begin(115200, SERIAL_8N1, IO_RXD2, IO_TXD2);

    SERIAL_AT.println("AT");
    Wire.begin(I2C_SDA, I2C_SCL);
    delay(1000);
    // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    { // Address 0x3C for 128x32
        SERIAL_LOG.println(F("SSD1306 allocation failed"));
        for (;;)
            ; // Don't proceed, loop forever
    }
    display.clearDisplay();

    logoshow();

    sendData("AT?", 2000, 1);
    sendData("AT+RESTORE", 5000, 1);

    sendData(config_cmd(), 2000, 1);
    sendData(cap_cmd(), 2000, 1);

    sendData("AT+SETRPT=1", 2000, 1);
    sendData("AT+SAVE", 2000, 1);
    sendData("AT+RESTART", 2000, 1);
}
void mqttsetup()
{
    pinMode(RESET, OUTPUT);
    digitalWrite(RESET, HIGH);
    WiFi.begin(ssid, password);
    SERIAL_LOG.println("connected");
    client.setServer(mqtt_server, 8883);//connecting to mqtt server
    client.setCallback(callback);
    connectmqtt();
}

void setup()
{
    void uwbsetup();
    void mqttsetup();
}

void callback(char* topic, byte* payload, unsigned int length) {   //callback includes topic and payload ( from which (topic) the payload is comming)
  SERIAL_LOG.print("Message arrived [");
  SERIAL_LOG.print(topic);
  SERIAL_LOG.print("] ");
  for (int i = 0; i < length; i++)
  {
    SERIAL_LOG.print((char)payload[i]);
  }
  if ((char)payload[0] == 'O' && (char)payload[1] == 'N') //on
  {
    digitalWrite(LED, HIGH);
    SERIAL_LOG.println("on");
    client.publish("outTopic", "LED turned ON");
  }
  else if ((char)payload[0] == 'O' && (char)payload[1] == 'F' && (char)payload[2] == 'F') //off
  {
    digitalWrite(LED, LOW);
    SERIAL_LOG.println(" off");
    client.publish("outTopic", "LED turned OFF");
  }
  SERIAL_LOG.println();
}

void reconnect() {
  while (!client.connected()) {
    SERIAL_LOG.println("Attempting MQTT connection...");
    if (client.connect("ESP32_clientID")) {
      SERIAL_LOG.println("connected");
      // Once connected, publish an announcement...
      client.publish("userLoc", "connected to MQTT");
      // ... and resubscribe
      client.subscribe("test-topic");

    } else {
      SERIAL_LOG.print("failed, rc=");
      SERIAL_LOG.print(client.state());
      SERIAL_LOG.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

long int runtime = 0;

String response = "";
String rec_head = "AT+RANGE";


void loop()
{
    // put your main code here, to run repeatedly:
    if (!client.connected())
    {
        reconnect();
    }

        // put your main code here, to run repeatedly:
    while (SERIAL_LOG.available() > 0)
    {
        SERIAL_AT.write(SERIAL_LOG.read());
        yield();
    }
    while (SERIAL_AT.available() > 0)
    {
        char c = SERIAL_AT.read();

        if (c == '\r')
            continue;
        else if (c == '\n' || c == '\r')
        {
            SERIAL_LOG.println(response);

            response = "";
        }
        else
            response += c;
    }


    client.publish("userLoc",  response);
    delay(1000);
    client.loop();
}


void connectmqtt()
{
  client.connect("ESP32_clientID");  // ESP will connect to mqtt broker with clientID
  {
    SERIAL_LOG.println("connected to MQTT");
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



// SSD1306

void logoshow(void)
{
    display.clearDisplay();

    display.setTextSize(1);              // Normal 1:1 pixel scale
    display.setTextColor(SSD1306_WHITE); // Draw white text
    display.setCursor(0, 0);             // Start at top-left corner
    display.println(F("MaUWB DW3000"));

    display.setCursor(0, 20); // Start at top-left corner
    // display.println(F("with STM32 AT Command"));

    display.setTextSize(2);

    String temp = "";

    temp = temp + "T" + UWB_INDEX;

    temp = temp + "   850k";

    display.println(temp);

    display.setCursor(0, 40);

    temp = "Total: ";
    temp = temp + UWB_TAG_COUNT;
    display.println(temp);

    display.display();

    delay(2000);
}

String sendData(String command, const int timeout, boolean debug)
{
    String response = "";
    // command = command + "\r\n";

    SERIAL_LOG.println(command);
    SERIAL_AT.println(command); // send the read character to the SERIAL_LOG

    long int time = millis();

    while ((time + timeout) > millis())
    {
        while (SERIAL_AT.available())
        {

            // The esp has data so display its output to the serial window
            char c = SERIAL_AT.read(); // read the next character.
            response += c;
        }
    }

    if (debug)
    {
        SERIAL_LOG.println(response);
    }

    return response;
}

String config_cmd()
{
    String temp = "AT+SETCFG=";

    // Set device id
    temp = temp + UWB_INDEX;

    // Set device role

    temp = temp + ",0";

    // Set frequence 850k or 6.8M

    temp = temp + ",0";

    // Set range filter
    temp = temp + ",1";

    return temp;
}

String cap_cmd()
{
    String temp = "AT+SETCAP=";

    // Set Tag capacity
    temp = temp + UWB_TAG_COUNT;

    //  Time of a single time slot

    temp = temp + ",15";

    return temp;
}