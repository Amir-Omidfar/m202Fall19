import sys
import time
import random
import paho.mqtt.client as paho

port = 1883

client = paho.Client(paho.CallbackAPIVersion.VERSION2)

if __name__ == "__main__":
    port = int(sys.argv[1])
    if client.connect("localhost", port, 60) != 0:
        print("Couldn't connect to the mqtt broker")
        sys.exit(1)

    client.publish("test_topic", "Hi, paho mqtt client works fine!", 0)
    for i in range(100):
        x,y,z = int(random.random()*1000),int(random.random()*100),int(random.random()*100)
        coords_example = [x,y,z,0,0,0]
        coords_string = ' '.join(str(x) for x in coords_example)
        client.publish("test_topic",coords_string,0)
        time.sleep(1)
        #client.loop()
    client.disconnect()