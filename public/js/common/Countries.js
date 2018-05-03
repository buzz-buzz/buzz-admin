import {countries} from 'moment-timezone/data/meta/latest.json'

export const list = Object.keys(countries).map(key => {
    return {
        key: key,
        text: countries[key].name,
        value: countries[key].name,
        flag: key.toLowerCase()
    };
});