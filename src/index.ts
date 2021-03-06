import * as request from 'request';

interface Stop {
    number: string;
    name: string;
}

interface StopSummary extends Stop {
    routes: Route[];
}

interface StopTrips extends Stop {
    routes: RouteTrips[];
}

interface Route {
    number: string;
    directionId: 0 | 1;
    direction: string;
    heading: string;
}

interface RouteTrips extends Route {
    trips: Trip[];
}

interface Trip {
    destination: string;
    scheduledTime: Date;
    eta: number;
    lastTrip: boolean;
    bus?: Bus;
}

interface Bus {
    type: string;
    gps?: GPS;
}

interface GPS {
    latitude: number;
    longitude: number;
    speed: number;
    etaAge: number;
}

const api = 'https://api.octranspo1.com/v1.3';

export default class {
    private _appId: string;
    private _apiKey: string;

    constructor(appId: string, apiKey: string) {
        this._appId = appId;
        this._apiKey = apiKey;
    }

    async stopSummary(stopNumber: string): Promise<StopSummary> {
        const response = await this._post(
            'GetRouteSummaryForStop', 
            {'stopNo': stopNumber}
        );

        if (response['error']) throw Error(response['error']);

        try {
            return {
                number: response['StopNo'],
                name: response['StopDescription'],
                routes: extractRouteArray(response)
            };
        } catch (err) {
            throw Error(`Could not find info for stop ${stopNumber}`);
        }
    }

    async stopTrips(stopNumber: string): Promise<StopTrips> {
        const response = await  this._post(
            'GetNextTripsForStopAllRoutes',
            {'stopNo': stopNumber}
        );

        if (response['error']) throw Error(response['error']);

        try {
            return {
                number: response['StopNo'],
                name: response['StopDescription'],
                routes: extractRouteTripsArray(response)
            };
        } catch (err) {
            throw Error(`Could not find info for stop ${stopNumber}`);
        }
    }


    private _post(method: string, params: any): Promise<any> {
        params['format'] = 'json';
        params['appID'] = this._appId;
        params['apiKey'] = this._apiKey;
        const options = {
            form: params,
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            json: true
        };

        return new Promise<any>((resolve, reject) => {
            request.post(`${api}/${method}`, options, (err, response, body) => {
                if (err) reject(err);
                if (response.statusCode !== 200) {
                    throw Error(`HTTP code ${response.statusMessage}`);
                }
                else resolve(body[Object.keys(body)[0]]);
            });
        });
    }
}

function extractRouteArray(stop: any): Route[] {
    return extractArray(stop, 'Routes', 'Route').map(extractRoute);
}

function extractRouteTripsArray(stop: any): RouteTrips[] {
    return extractArray(stop, 'Routes', 'Route').map(extractRouteTrips);
}

function extractRoute(route: any): Route {
    return {
        number: route['RouteNo'],
        directionId: route['DirectionID'] == 0 ? 0 : 1,
        direction: route['Direction'],
        heading: route['RouteHeading']
    };
}

function extractRouteTrips(route: any): RouteTrips {
    return {
        ...extractRoute(route),
        ...{
            trips: extractArray(route, 'Trips', 'Trip').map(extractTrip)
        }
    };
}

function extractTrip(trip: any): Trip {
    const now = new Date();
    const scheduled = trip['TripStartTime'].split(':');
    const scheduledTime = `${now.getFullYear()}-`
        + `${(now.getMonth() + 1).toString().padStart(2, '0')}-`
        + `${now.getDate().toString().padStart(2, '0')}T`
        + `${scheduled[0].padStart(2, '0')}:${scheduled[1].padStart(2, '0')}:`
        + `00.000`;

    return {
        destination: trip['TripDestination'],
        scheduledTime: new Date(Date.parse(scheduledTime)),
        eta: Number(trip['AdjustedScheduleTime']),
        lastTrip: trip['LastTripOfSchedule'],
        bus: trip['BusType'] ?
            {
                type: trip['BusType'],
                gps: trip['Latitude'] ?
                    {
                        latitude: trip['Latitude'],
                        longitude: trip['Longitude'],
                        speed: trip['GPSSpeed'],
                        etaAge: Number(trip['AdjustmentAge'])
                    } :
                    undefined
            } :
            undefined
    };
}

// The OC Transpo API is a little weird...
function extractArray(obj: any, outerKey: string, innerKey: string): any[] {
    const outerObj = obj[outerKey];
    if (Array.isArray(outerObj)) return outerObj;

    const innerObj = outerObj[innerKey];
    if (!innerObj) return [outerObj];
    if (Array.isArray(innerObj)) return innerObj;
    return [innerObj];
}
