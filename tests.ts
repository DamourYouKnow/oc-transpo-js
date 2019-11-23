import * as assert from 'assert';

import OCTranspo from './src/index';

const appId = process.env['OCTRANSPO_CLIENT_ID'] || '';
const apiKey =  process.env['OCTRANSPO_API_TOKEN'] || '';

const api = new OCTranspo(appId, apiKey);

describe('Setup', () => {
    it('API app ID set', () => {
        assert.notStrictEqual(appId, '');
    });

    it('API key set', () => {
        assert.notStrictEqual(apiKey, '');
    });
});

describe('OCTranspo', () => {
    it('stopSummary', async () => {
        const stop = await api.stopSummary(4356);
    });
    
    it('stopTrips', async () => {
        const stop = await api.stopTrips(4168);
        const stopRoute = await api.stopTrips(3011); 
    });
});
