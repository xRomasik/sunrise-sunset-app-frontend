const timeConvertTo24hLocalTimeZoneFormat = (fetchedTime, timeOffset) => {
    const [time, modifier] = fetchedTime.split(' ');
    let [hours, minutes] = time.split(':', 2);
    const timeOffsetMinutes = timeOffset % 60;
    const timeOffsetHours = (timeOffset - timeOffsetMinutes) / 60;

    if (hours === '12') {
        hours = '00';
    };

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    };

    hours = parseInt(hours) + timeOffsetHours;
    minutes = parseInt(minutes) + timeOffsetMinutes;

    if (minutes >= 60) {
        minutes = minutes - 60;
        hours = hours + 1
    };

    if (minutes < 10) {
        minutes = '0' + minutes.toString();
    };

    if (hours < 0) {
        hours = hours + 24
    };

    if (hours >= 24) {
        hours = hours - 24
    };

    return `${hours}:${minutes}`;
}

export const getSunriseSunsetTimes = (country, date, API_KEY, API_KEY2, setSunsetSunriseTime, setErrorMessage) => {
    if (country.length > 2 && country.match(/^[^0-9]*$/)) {

        let coordinates = {}

        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${country.toLowerCase()}&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                coordinates = ({
                    latitude: data.results[0].geometry.lat,
                    longitude: data.results[0].geometry.lng,
                    timezone: data.results[0].annotations.timezone.name
                })
            })
            .then(() => fetch(`https://timezoneapi.io/api/timezone/?${coordinates.timezone}&date=${date}&token=${API_KEY2}`))
            .then(response => response.json())
            .then(data => {
                coordinates = ({
                    ...coordinates,
                    timeOffset: parseInt(data.data.datetime.offset_minutes)
                })
            })
            .then(() => fetch(`https://api.sunrise-sunset.org/json?lat=${coordinates.latitude}&lng=${coordinates.longitude}&date=${date}`))
            .then(response => response.json())
            .then(data => {
                setSunsetSunriseTime({
                    sunriseTime: timeConvertTo24hLocalTimeZoneFormat(data.results.sunrise, coordinates.timeOffset),
                    sunsetTime: timeConvertTo24hLocalTimeZoneFormat(data.results.sunset, coordinates.timeOffset)
                });
                setErrorMessage(null)

            }).catch(() => setErrorMessage('Something went wrong, please check the name of the country and try again.'))
    }

    else if (!country.match(/^[^0-9]*$/)) {
        setErrorMessage('It seems like there is a number in your country name.')
    } else {
        setErrorMessage('Country name must be at least 3 letters long.')
    }
}


// export const getSunriseSunsetTimes = (countrySearchfield, dateSearchfield, setSunsetSunriseTime, setErrorMessage) => {


//     if (countrySearchfield.length > 2 && countrySearchfield.match(/^[^0-9]*$/)) {
//         const requestOptions = {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 country: countrySearchfield,
//                 date: dateSearchfield,
//             })
//         }

//         fetch('http://127.0.0.1:5000/server/api/sunrise-sunset-times', requestOptions)
//             .then(response => {
//                 if (response.status !== 200) {
//                     throw new Error('Bad response')
//                 }
//                 return response.json()
//             })
//             .then(data => {
//                 setSunsetSunriseTime({
//                     sunriseTime: data.sunriseTime,
//                     sunsetTime: data.sunsetTime
//                 })
//                 setErrorMessage(null)
//             }

//             ).catch(() => setErrorMessage('Something went wrong, please check the name of the country and try again.'))

//     } else if (!countrySearchfield.match(/^[^0-9]*$/)) {
//         setErrorMessage('It seems like there is a number in your country name.')
//     } else {
//         setErrorMessage('Country name must be at least 3 letters long.')
//     }

// };