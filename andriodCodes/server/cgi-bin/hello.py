#!/usr/bin/python

import math
import paho.mqtt.client as mqtt
import location as loc
import cgi, cgitb, json
import sys
import logging

logging.basicConfig(filename='app.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')


userLocCounter = 0
esp8266Counter = 0
linearString = ""
orientationString = ""

def parse_place(pos):

	return {
		'kitchen': loc.Point(0.2,2.2),
		'other': loc.Point(3,2)
	}[pos]

def display_data(data):
	print('<html>')
	print('<head>')
	print('<title>Hello Word - First CGI Program</title>')
	print('</head>')
	print('<body>')
	print('<h2>')
	print(data)
	print('</h2>')
	print('</body>')
	print('</html>')


# The callback for when the client receives a CONNACK response from the server.
#def on_connect(client, userdata, rc):
#	print("Connected with result code "+str(rc))
	# Subscribing in on_connect() means that if we lose the connection and
	# reconnect then subscriptions will be renewed.

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):

	global userLocCounter
	global esp8266Counter
	global linearString
	global orientationString

	if(msg.topic == "userLoc" and not userLocCounter):
		#display_data(msg.topic+" "+str(msg.payload))
		userLocCounter = 1
		linearString = msg.payload
	elif (msg.topic == "esp8266" and not esp8266Counter):
		#display_data(msg.topic+" "+str(msg.payload))
		esp8266Counter = 1
		orientationString = msg.payload
	if(userLocCounter): # and esp8266Counter):
		client.disconnect()

form = cgi.FieldStorage()
loc_goal = json.loads(form.getvalue('q'))

logging.warning("App response: " +  form.getvalue('q'))
print("Content-type:text/html\r\n")

client = mqtt.Client(client_id="clientjs", protocol=mqtt.MQTTv31, transport="websockets")
#client.on_connect = on_connect
client.on_message = on_message

client.connect("192.168.1.40", 9001, 60)
client.subscribe("userLoc",0)
client.subscribe("esp8266")



# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()

#print(linearString)
#print(orientationString)
linearCoord = linearString.split()
x = float(linearCoord[0])/1000
y = float(linearCoord[1])/1000

print("Linear coord: ",str(linearString), file=sys.stderr)

orientationString = "alsdjlfka 33.2 42 99";
orientationCoord = orientationString.split()
yaw = float(orientationCoord[2])-30
pitch = float(orientationCoord[3])

print("Angular coord: " + str(orientationString), file=sys.stderr)

print("yaw_raw: ",yaw, file=sys.stderr) 
if(yaw < 0):
	yaw += 360
	
yaw = -math.cos((pitch * math.pi) / 180)*math.cos((360-yaw * math.pi) / 180)*180/math.pi + 86


json_inst = loc.loc_instructions(loc.Point(x,y), yaw, parse_place(loc_goal['place']))
logging.warning(json_inst)

print(json_inst)



