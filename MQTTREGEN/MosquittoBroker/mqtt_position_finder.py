# This file subscribe to tagDistance Topic and calculate and publish tag position to tagPos topic
import sys

import paho.mqtt.client as paho

from ast import literal_eval

import math

import numpy as np

from queue import Queue

port = 8883

anchor_0_pos = np.array((0,0))
anchor_1_pos = np.array((1900,1900))
anchors_dist = np.linalg.norm(anchor_0_pos-anchor_1_pos)

def get_ranges(range_string):
    return literal_eval(range_string[6:])

def find_pos(r0,r1):
    ratio = (r0**2+anchors_dist**2-r1**2)/(2*int(anchors_dist)*r1)
    print("ratio: ", ratio)
    if ratio>1 or ratio < -1:
        ratio = 0
    theta = math.acos(ratio)
    tag_x = r1*math.cos(theta)
    tag_y = r1*math.sin(theta)
    return (abs(1000000000000000*tag_x),tag_y)
    #return r0+r1


def message_handling(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")
    #ranges_str = msg.payload.decode()
    #ranges = get_ranges(ranges_str)
    #pos = find_pos(100,90)
    #print("this is pos:"+ pos)
    client.publish("tagPos","12,32",0)

def subscribe(client):
    def on_message(client, userdata, msg):
        messageQueue = msg.payload.decode()    
    client.subscribe("tagDistance")
    client.on_message = on_message


def run_client(q):
    def on_message(client, userdata, msg):
        msg = msg.payload.decode()
        q.put(msg)

    client = paho.Client(paho.CallbackAPIVersion.VERSION2)  # create new instance
    client.connect("localhost", port, 60)  # connect to broker
    client.subscribe("tagDistance")
    client.on_message = on_message
    client.loop_start()

p_client = paho.Client(paho.CallbackAPIVersion.VERSION2)
p_client.connect("localhost", port, 60)
def run():
    q = Queue()
    run_client(q)

    while True:
        msg = q.get()
        ranges = get_ranges(msg)
        pos = find_pos(ranges[0],ranges[1])
        formatted_pos = f"{str(pos[0])} 0 {str(pos[1])} 0 0 0 0"
        p_client.publish("tagPos",formatted_pos)

        # Process message here
        print("processing:", msg)

if __name__ == "__main__":
    run()