# Land Parcels

This programme takes a set of coordinates of plots of land within a grid and finds any parcels of 1 or more
plots connected vertically or horizontally with other plots. It calculates the perimeters of all parcels it
finds and return the number of parcels and their perimeters. 

## Pre-requisites:
- node.js (built on 10.x but should be widely compatible)
- npm

## Installation instructions
Use the node package manager to install all dependencies.

```
npm install
```

## Command line usage
There is a wrapper to allow this to be run on the command line. See the examples below:
```
$ node main "3,3"
There is 1 parcel with a perimeter of 4

$ node main "3,3" "3,4"
There is 1 parcel with a perimeter of 6

$ node main "3,3" "3,4" "5,5"
There are 2 parcels with perimeters of 6,4
```

## Tests
There are tests with 100% coverage available by running:
```
npm run test
```
