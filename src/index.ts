import request from 'request';

interface Stop {
    number: number;
    name: string;
}

interface StopSummary extends Stop {
    routes: Route[];
}

interface StopTrips extends Stop {
    routes: RouteTrips[];
}

interface Route {
    number: number;
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
    etaAge: number;
    lastTrip: boolean;
    bus?: Bus;
}

interface Bus {
    type: string;
    latitude: number;
    longitude: number;
    speed: number;
}

const api = 'https://api.octranspo1.com/v1.3';

export default class {
    private _appId: string;
    private _apiKey: string;

    constructor(appId: string, apiKey: string) {
        this._appId = appId;
        this._apiKey = apiKey;
    }

    async stopSummary(stopNumber: number): Promise<StopSummary> {
        const response = await this._post(
            'GetRouteSummaryForStop', 
            {'stopNo': stopNumber}
        );

        if (response['error']) throw Error(response['error']);

        return {
            number: response['StopNo'],
            name: response['StopDescription'],
            routes: extractRouteArray(response)
        };
    }

    async stopTrips(
        stopNumber: number,
        routeNumber?: number
    ): Promise<StopTrips> {
        const response = routeNumber ?
            await this._post(
                'GetNextTripsForStop',
                {'stopNo': stopNumber, 'routeNo': routeNumber}
            ) :
            await this._post(
                'GetNextTripsForStopAllRoutes',
                {'stopNo': stopNumber}
            );

        if (response['error']) throw Error(response['error']);



        return {
            number: response['StopNo'],
            name: response['StopDescription'],
            routes: extractRouteTripsArray(response)
        };
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
            request.post(`${api}/${method}`, options, (err, response) => {
                if (err) reject(err);
                else resolve(response);
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
        number: Number(route['RouteNo']),
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
    const scheduledTime = Date.parse(
        `${now.getFullYear()}-
        ${(now.getMonth() + 1).toString().padStart(2, '0')}-
        ${now.getDate().toString().padStart(2, '0')}T
        ${scheduled[0].leftPad(2, '0')}:${scheduled[1].leftPad(2, '0')}:00.000`
    );

    return {
        destination: trip['TripDestination'],
        scheduledTime: new Date(scheduledTime),
        eta: Number(trip['AdjustedScheduleTime']),
        etaAge: Number(trip['AdjustmentAge']),
        lastTrip: trip['AdjustmentAge'],
        bus: trip['BusType'] ?
            {
                type: trip['BusType'],
                latitude: trip['Latitude'],
                longitude: trip['Longitude'],
                speed: trip['GPSSpeed']
            } :
            undefined
    };
}

// The OC Transpo API is a little weird...
function extractArray(obj: any, outerKey: string, innerKey: string): any[] {
    if (Array.isArray(outerKey)) return obj;

    const innerObj = obj[outerKey][innerKey];
    if (!innerObj) return [obj];
    if (Array.isArray(innerObj)) return innerObj;
    return [innerObj];
}
