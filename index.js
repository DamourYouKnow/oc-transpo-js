const request = require('request-promise-native');

const api = {
    '1.3': 'https://api.octranspo1.com/v1.3' 
};

module.exports = function OCTranspo(appId, apiKey, version='1.3') {
    this.appId = appId;
    this.apiKey = apiKey;
    this.version = version;

    this.getRouteSummaryForStop = function(stopNo, routeNo) {
        return this.post(
            'GetRouteSummaryForStop', {'stopNo': stopNo, 'routeNo': routeNo});
    };

    this.getNextTripsForStop = function(stopNo, routeNo) {
        if (routeNo) {
            return this.post(
                'GetNextTripsForStop', {'stopNo': stopNo, 'routeNo': routeNo});
        } else {
            return this.post(
                'GetNextTripsForStopAllRoutes', {'stopNo': stopNo});
        }
    };

    this.post = function(method, params) {
        params['format'] = 'json';
        params['appID'] = this.appId;
        params['apiKey'] = this.apiKey;
        const options = {
            'url': `${api[this.version]}/${method}`,
            'form': params,
            'headers': {'content-type': 'application/x-www-form-urlencoded'},
            'json': true,
        };

        return new Promise((resolve, reject) => {
            request.post(options).then((response) => {
                resolve(response[Object.keys(response)[0]]);
            }).catch(reject);
        });
    };
};
