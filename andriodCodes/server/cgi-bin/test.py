#!/usr/bin/python

import math
import paho.mqtt.client as mqtt
import location as loc
import cgi, cgitb, json

userLocCounter = 0
esp8266Counter = 0
linearString = ""
orientationString = ""

def parse_place(pos):

	return {
		'kitchen': loc.Point(0.2,2.8),
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

linearString = "3456 3211"
orientationString = "aaaa ttttt 16 32"

form = cgi.FieldStorage()
loc_goal = json.loads(form.getvalue('q'))


print("Content-type:text/html\r\n")



#print(linearString)
#print(orientationString)
linearCoord = linearString.split()
x = float(linearCoord[0])/1000
y = float(linearCoord[1])/1000

orientationCoord = orientationString.split()
yaw = float(orientationCoord[2])-30
pitch = float(orientationCoord[3])

#print("yaw_raw: ",yaw) 
if(yaw < 0):
	yaw += 360
	
yaw = -math.cos((pitch * math.pi) / 180)*math.cos((360-yaw * math.pi) / 180)*180/math.pi

json_inst = loc.loc_instructions(loc.Point(x,y), yaw, parse_place(loc_goal['place']))

#print(json_inst)
print('{"end":"You arrived to your destination, congratulations"}')



