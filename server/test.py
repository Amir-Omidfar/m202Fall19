import math

class Point:
	def __init__(self, x, y):
		self.x = x
		self.y = y
	def __str__(self):
		return "(" + str(self.x) + "," + str(self.y) + ")"



table = [Point(1.7,1.325),Point(1.73,2.125),Point(4.34,1.2),Point(4.38,2)]
goal_p =  Point(3,2)

def area(p1, p2, p3): 

	return abs((p1.x * (p2.y - p3.y) + 
		p2.x * (p3.y - p1.y) + 
		p3.x * (p1.y - p2.y)) / 2.0) 

def isPointInsideArea(p, obst): #https://www.geeksforgeeks.org/check-whether-given-point-lies-inside-rectangle-not/

	A = area(obst[0], obst[1], obst[2]) + area(obst[1], obst[3], obst[2])
	A1 = area(p,obst[0],obst[1])
	A2 = area(p,obst[1],obst[3])
	A3 = area(p,obst[2],obst[3])
	A4 = area(p,obst[0],obst[2])

	print("A = " + str(A) + " A1 " + str(A1) + " A2 " + str(A2) + " A3 " + str(A3) + " A4 " + str(A4) + " sum " + str(A1 + A2 + A3 + A4))

	return (A == A1 + A2 + A3 + A4)

isPointInsideArea(goal_p, table)
