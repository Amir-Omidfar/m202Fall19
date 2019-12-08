import paho.mqtt.client as mqtt

userLocCounter = 0
esp8266Counter = 0

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, rc):
    print("Connected with result code "+str(rc))
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    global userLocCounter
    global esp8266Counter
#    if "userLoc" == "userLoc":
#        userLocCounter = 1
#    if(msg.topic == "userLoc" and not userLocCounter):
    #print(msg.topic+" "+str(msg.payload) + " " + str(userLocCounter))
    #userLocCounter = 1
#    elif(msg.topic == "esp8266" and not esp8266Counter):

    if(msg.topic == "esp8266"):
        print(msg.topic+" "+str(msg.payload) + " " + str(userLocCounter))
#    esp8266Counter = 1
    #if(userLocCounter and esp8266Counter):
    #    client.disconnect()

def on_publish(mqttc, obj, mid):
    print("mid: " + str(mid))


def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

client = mqtt.Client(client_id="clientjs", protocol=mqtt.MQTTv31, transport="websockets")
client.on_connect = on_connect
client.on_message = on_message
client.on_publish = on_publish
client.on_subscribe = on_subscribe

client.connect("192.168.1.40", 9001, 60)
client.subscribe("userLoc",0)
client.subscribe("esp8266",0)



# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()
