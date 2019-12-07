#!/usr/bin/python

import math
import paho.mqtt.client as mqtt
import location as loc
import cgi, cgitb, json
import sys
import csv

#logging.basicConfig(filename='app.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')


userLocCounter = 0
esp8266Counter = 0
linearString = ""
orientationString = ""

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
		#print(msg.topic+" | "+str(msg.payload), file=sys.stderr)
		esp8266Counter = 1
		orientationString = msg.payload
	if(userLocCounter and esp8266Counter): # and esp8266Counter):
		client.disconnect()

form = cgi.FieldStorage()
loc_goal = json.loads(form.getvalue('q'))

print("App response: ",  form.getvalue('q'), file=sys.stderr)
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

print("Strings: ", linearString, orientationString, file=sys.stderr)

#print(linearString)
#print(orientationString)
linearCoord = linearString.split()
x = float(linearCoord[0])/1000
y = float(linearCoord[1])/1000


places = {}

if 'add' in loc_goal:
	with open('places.txt', mode='a') as csv_file:
		fieldnames = ['name', 'x', 'y']
		writer = csv.DictWriter(csv_file, fieldnames = fieldnames)
		writer.writerow({'name': loc_goal['add'], 'x': str(x), 'y': str(y)})

else:
	with open('places.txt', mode='r') as csv_file:
		csv_reader = csv.DictReader(csv_file)
		for row in csv_reader:
			places[row['name']] = loc.Point(float(row['x']), float(row['y']))
		
	#print("orientation: ", orientationString, file=sys.stderr)
	orientationCoord = orientationString.split()
	yaw = float(orientationCoord[2])


	json_inst = loc.loc_instructions(loc.Point(x,y), yaw, places[loc_goal['place']])

	print(json_inst)

