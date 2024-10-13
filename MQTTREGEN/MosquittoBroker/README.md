# Test MQTT SETUP
1. Start the MQTT BROKER by first installing mosquitto broker:
-   `brew install mosquitto` or `sudo apt install mosquitto`
- Then start the broker server by running: `mosquitto -v` or `mosquitto -c mosquito.conf` to run with the given config file.
- To see if any mosquitto instances is running: `ps -ef | grep mosquitto`
- To kill the running instances: `kill -9 pid`
2. Install paho mqtt client from pip or its [github repository](https://github.com/eclipse/paho.mqtt.python):
- `pip install paho-mqtt`
3. Running each mqtt_pub/sub scripts in separate terminals with the broker running you can test the mqtt setup.

