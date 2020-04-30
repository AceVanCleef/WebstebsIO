# Stebs

Build Server (branch master) [![Build status](https://ci.appveyor.com/api/projects/status/nb50vg5rqspo6yij?svg=true)](https://ci.appveyor.com/project/JoelNussbaum/stebs)

### Summary

For German, read [here](https://web.fhnw.ch/technik/projekte/i/ip518/wohlgensinger-buerki/index.html).

This project's goal was to improve the current usability of Webstebs, an online microprocessor simulator of the [UAS Nothwestern Switzerland](https://www.fhnw.ch/de/studium/technik). It allows students to learn and discover how computer hardware can be programmed using assembler. Furthermore, they are now able to choose from newly developed simulated hardware devices, such as a keyboard, text console and a number display, which extend the capabilities of Webstebs and the range of exercises students can perform. All usability improvements had been tested and proven via usability tests. Read the [project report](https://github.com/AceVanCleef/WebstebsIO/raw/master/IP5_IODevices_Bericht.pdf) (download) to get an in-depth overview what it is about and how we approached this project.

### Goals

At the beginning of this project, all required functionality had been implemented by a previous project team. What had to be improved was the usability of the user interface and the number of devices visible, which was limited to three at that time. The goal was to increase the number of devices shown in the UI and the usability of the whole application, which has to support students in their learning efforts. The aim was to utilize the overhauled version of Webstebs in the coming spring semester 2018.

### Starting Point

Websteps is a browser based microprocessor simulator developed for the lectures at the UAS Northwestern Switzerland. Several student teams have contributed to this web application as part of their academic education. Webstebs allows to observe the execution of assembly code within the microprocessor and its RAM. This enables students to learn and understand the inner workings of computer hardware. It is also possible to connect and control I/O - devices using assembly code.

### Results

The user interface of Webstebs received a major improvement. A menu bar was introduced and the UI controls to control the simulation were relocated to one central location. Furthermore, Fontawesome was introduced to standardize the icon-concept. The way devices were displayed has also been overhauled so that any number of devices can be displayed. All made changes and improvements had been tested with users.

## Credits

[Take me to the credits page](Credits.md)


### Used technologies

Here are the technologies we worked with. For a complete list of all used technologies in Webstebs, please consult the [project report](https://github.com/AceVanCleef/WebstebsIO/raw/master/IP5_IODevices_Bericht.pdf) (download).

- .Net Framework 4.6
- TypeScript (and JavaScript)
- JQuery
- Html, CSS and Microsofts Razor Syntax for dynamic webcontent generation.
- Font Awesome
