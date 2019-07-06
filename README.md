# oc-transpo-js

This is an unofficial JavaScript API wrapper for the OC Transpo API. This 
project is in no way affiliated with OC Tranpo.

The offical API documentation can be found 
[here](http://www.octranspo.com/en/plan-your-trip/travel-tools/developers/dev-doc).

## Setup:

Install with `npm install oc-transpo-js`.

To import the library:
```js
const OCTranpso = require('oc-transpo-js');

// Third argument is the optional API version
const api = new OCTranspo(appId, apiKey, '1.3');
```

## Methods:

Note that all of the methods return promises.

### getRouteSummaryForStop(stopNo, routeNo)
Retrieves the routes for a given stop number. The **routeNo** parameter is 
optional.

Example:
```js
api.getRouteSummaryForStop(4356).then(result).catch(err);
```

Result:
```json
{
    "StopNo": "4356",
    "StopDescription": "FINDLAY CREEK / GRACEWOOD",
    "Error": "",
    "Routes": {
        "Route": [
            {
                "RouteNo": "93",
                "DirectionID": 1,
                "Direction": "Northbound",
                "RouteHeading": "Greenboro/Hurdman"
            },
            {
                "RouteNo": "294",
                "DirectionID": 0,
                "Direction": "Inbound",
                "RouteHeading": "Hurdman"
            }
        ]
    }
}
```

### getNextTripsForStop(stopNo, routeNo)
Retrieves the next three trips for all routes or a single route for a specific 
stop. The **routeNo** parameter is optional.

Example:
```js
api.getNextTripsForStop(4356).then(result).catch(err);
```

Result:
```json
{
    "StopNo": "4356",
    "StopDescription": "FINDLAY CREEK / GRACEWOOD",
    "Error": "",
    "Routes": {
        "Route": [
            {
                "RouteNo": "93",
                "DirectionID": 1,
                "Direction": "Northbound",
                "RouteHeading": "Greenboro/Hurdman",
                "Trips": [
                    {
                        "TripDestination": "Greenboro",
                        "TripStartTime": "20:32",
                        "AdjustedScheduleTime": "4",
                        "AdjustmentAge": "0.73",
                        "LastTripOfSchedule": false,
                        "BusType": "6LB - 60",
                        "Latitude": "45.314684",
                        "Longitude": "-75.629928",
                        "GPSSpeed": "38.9"
                    }
                ]
            }
        ]
    }
}
```