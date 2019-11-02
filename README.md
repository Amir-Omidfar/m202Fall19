# m202Fall19

## Project title : An indoor navigation for visually impaired people utilizing Ultra Wide Band Technology 

### Project Description: 
***Autonomous navigation is a crucial component for visually impaired people. Outdoors, positioning based on ubiquitous signals is feasible; however, for indoors, no universal positioning solution does exist. Due to the remarkably broad bandwidth, ultra-wideband (UWB) signs offer a proper multipath resolution and allow positioning with sub-meter (10 centimeter) accuracy. 
Also, because of the implementation of screen-reader software into mobile devices, visually impaired people start using smartphones. While creating a navigation system for the blind, this project focuses on adding sensors such as IMU, in wearable form, for increasing the accuracy of UWB modules. Finally, e-sense technology, implemented in earables, provides haptic feedback in guiding the visually impaired.*** 

---
## Objectives 
* Improve an indoor localization system with 3d mapping/visualization that uses UWB modules 
  1. Enhance the systems accuracy by using additional sensors (e.g IMU, … ). 
* Develop an application to utilize the UWB mapping platform in guiding visually impaired individuals
  1. Android app development
  2. E-Sense Earables to be implemented and utilized by the user through the app

## Related works (papers and websites)
1. [Minuet: Multimodal Interaction with an Internet of Things](http://www.guoanhong.com/papers/SUI19-Minuet.pdf)
2. [Pozyx: Localization via UWB](https://www.pozyx.io)
3. [Nokia e-sense earables ](http://www.esense.io)
4. [Indoor Positioning for Visually Impaired People Based on Smartphones](https://link.springer.com/chapter/10.1007/978-3-319-08596-8_68) 
5. [Analysis of a UWB Indoor Positioning System Based on Received Signal Strength](https://www.researchgate.net/profile/Klaus_Witrisal/publication/224699315_Analysis_of_a_UWB_Indoor_Positioning_System_Based_on_Received_Signal_Strength/links/5714ad0508aeff315ba36700.pdf)

## Methodology, Data Set and Experimental validation plan 
* Methodology:
  1. **The indoor localization section:** We will be building on an existing work mentioned in the related works section ([item #1](http://www.guoanhong.com/papers/SUI19-Minuet.pdf)) to improve the 3d mapping of current UWB modules for indoor localization. 
  2. **Earables and App development section:** An Android app would be used to interface between the mapping system and the user. Giving commands and feedbacks to the user using the microphone in earables  
* Experimental Validation: 
  1. Potential use of motion capture system for measuring the accuracy of our implemented UWB localization system. 
* Data Set:
  1.  Define a user study to collect data from visually impaired or blindfolded individuals to test out the system performance.

## Work split between the different team members :
1. **Riyya** :  Android application development for using Earables and getting feedback from Earables
2. **Amir** : UWB system setup, overall system integration
3. **Julian** :  UWB system setup, support on Android app development


---


## Timeline 


| Week  |Indoor localization mapping | Android app development| 
|-------|----------------------------|------------------------|
| 4     |  General proposal finished | |
| 5     | First experiments with UWB system used in prior work| First approach towards connecting earables with smartphone.|
| 6     | Improving the accuracy of the UWB system tag with the inclusion of other sensors in it| Work on Android App that sends data to earables|
| 7     | Continuation of previous week's work | Tests of accuracy with various objects|
| 8     | Same as previous two weeks but focusing more on the interconnection between both systems developed | |
| 9     |Integration of earables and smartphone with UWB system | Tests with blindfolded people              |
| 10    |  Final details and tests. | |
| 11    |  Presentation | | 

