# oc-transpo-js

This is an unofficial JavaScript/TypeScript API wrapper for the OC Transpo API. 
This project is in no way affiliated with OC Tranpo.

The offical API documentation can be found 
[here](http://www.octranspo.com/en/plan-your-trip/travel-tools/developers/dev-doc).

The real API responses have been modified to maintain consistency.

## Setup:

Install with `npm install oc-transpo-js`.

To import the library:
```js
const OCTranpso = require('oc-transpo-js').default;

// or import OCTranspo from 'oc-transpo-js'

// Third argument is the optional API version
const api = new OCTranspo(appId, apiKey);
```

## Methods:

Note that all of the methods return promises.

### stopSummary(stopNo)
Retrieves the routes for a given stop number. The **routeNo** parameter is 
optional.

Example:
```js
api.stopSummary('4356').then(result).catch(err);
```

Result:
```js
{
    "number": "4356",
    "name": "FINDLAY CREEK / GRACEWOOD",
    "routes": [
        {
            "number": 93,
            "directionId": 1,
            "direction": "",
            "heading": "Greenboro/Hurdman"
        }
    ]
}
```

### stopTrips(stopNo)
Retrieves the next three trips for all routes for a specific 
stop.

Example:
```js
api.stopTrips('4168').then(result).catch(err);
```

Result:
```json
{
    "number": "4168",
    "name": "UPLANDS / RICH LITTLE",
    "routes": [
        {
            "number": "90",
            "directionId": 0,
            "direction": "",
            "heading": "Greenboro",
            "trips": [
                {
                    "destination": "Greenboro",
                    "scheduledTime": "2019-11-23T15:23:00.000Z",
                    "eta": 15,
                    "lastTrip": false,
                    "bus": {
                        "type": "6EB - 60",
                        "gps": {
                            "latitude": "45.396614",
                            "longitude": "-75.669391",
                            "speed": "47.8",
                            "etaAge": 0.46
                        }
                    }
                },
                {
                    "destination": "Greenboro",
                    "scheduledTime": "2019-11-23T15:53:00.000Z",
                    "eta": 44,
                    "lastTrip": false,
                    "bus": {
                        "type": "6EB - 60"
                    }
                },
                {
                    "destination": "Greenboro",
                    "scheduledTime": "2019-11-23T16:23:00.000Z",
                    "eta": 74,
                    "lastTrip": false,
                    "bus": {
                        "type": "4LB - IN"
                    }
                }
            ]
        }
    ]
}
```