import sys

import paho.mqtt.client as paho

port = 8883

def message_handling(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

if __name__ == "__main__":
    
    client = paho.Client(paho.CallbackAPIVersion.VERSION2)
    client.on_message = message_handling

    if client.connect("localhost", port, 60) != 0:
        print("Couldn't connect to the mqtt broker")
        sys.exit(1)

    
    client.subscribe("tagDistance")
    client.subscribe("tagPos")

    try:
        print("Press CTRL+C to exit...")
        client.loop_forever()
    except Exception:
        print("Caught an Exception, something went wrong...")
    finally:
        print("Disconnecting from the MQTT broker")
        client.disconnect()