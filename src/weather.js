import './weather.css';
import React, { useState, useEffect } from 'react';


async function getCoordinates(name) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=1&language=en&format=json`
    )
    if (!response.ok) {
      throw new Error('Problem in API fetching');
    }
    const data = await response.json();
    if(data?.results)return data?.results[0]
    
  } catch (error) {
    console.error('Error in getCoordinates:', error);
    throw error;
  }
}


async function fetchData({ coords, setWeather, setLoad }) {
  setLoad(true)
  try {
    const response = await fetch('http://127.0.0.1:3001/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( {lat: coords.latitude, lng: coords.longitude})
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setWeather(data);
    setLoad(false);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
function Weather() {
  const [load, setLoad] = useState(true);
  const [weather, setWeather] = useState({});
  const [coords, setCoords] = useState({lat:'', lng:''})
  const handleSearch = (lat='', lng='')=>{
    setCoords(lat, lng)
  }
  useEffect(() => {
    fetchData({coords, setWeather, setLoad });
  }, [coords]);

  return (
    <div className='weather'>
      <Search handleSearch={handleSearch}/>
      <City cityWeather={weather.current_weather} load={load} city={weather.city}/>
      <Description currentWeather={weather.hourly} load={load} />
      <Days daily={weather.daily} load={load} />
    </div>
  );
}
function Loading() {
  return (
    <div className='loading'>
      <div className="loadingio-spinner-eclipse-sulk5cuy3yr"><div className="ldio-t3r3uxtxshl">
<div></div>
</div></div>
      
      
    </div>
  );
}
function Search({handleSearch}) {
  const [search, setSearch] = useState('');
  const resetCords = ()=>{
    handleSearch()
    setSearch('')
  }
  const handleSubmit = async()=>{
    const coordinates = await getCoordinates(search)
    handleSearch(coordinates)
    setSearch('')
  }
  return (
    <>
      <div className='search'>
        <input
          type='text'
          name='search'
          id='search'
          placeholder='Search for a city'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSubmit}>Search</button>
        <button onClick={resetCords}>Current</button>
      </div>
    </>
  );
}

function City({ cityWeather, load, city }) {
  const date = new Date(cityWeather?.time * 1000);
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return (
    <>
      <div className='city'>
        {load ? (
          <Loading />
        ) : (
          <>
            <h1 className='cityName'>{city}</h1>
            <h1 className='cityTemp'>{cityWeather?.temperature}'C</h1>
            <h3 className='cityDes'>{Climate(cityWeather?.weathercode)}</h3>
            <h3 className='cityDay'>
              {daysOfWeek[date.getDay()]} {date.getHours()}:{date.getMinutes()}
            </h3>
          </>
        )}
      </div>
    </>
  );
}

function Description({ currentWeather, load }) {
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const currentIndex = currentWeather?.time.findIndex(
    (timestamp) => currentTimestampInSeconds > timestamp
  );
  return (
    <>
      <div className='desc'>
        {load ? (
          <></>
        ) : (
          <>
            <div className='temp'>
              🌡️ <br />
              feels like <br />{' '}
              {currentWeather?.apparent_temperature[currentIndex]}'
            </div>
            <div className='wind'>
              💨 <br />
              wind <br /> {currentWeather?.windspeed_10m[currentIndex]}mph
            </div>
            <div className='humidity'>
              📃 <br />
              humidity <br />
              {currentWeather?.relativehumidity_2m[currentIndex]}%
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Days({ daily, load }) {
  return (
    <>
      <div className='days'>
        {load ? (
          <Loading />
        ) : (
          [...Array(5).keys()].map((e) => (
            <Day
              key={e}
              time={daily?.time[e]}
              temp={daily?.temperature_2m_max[e]}
              code={daily?.weathercode[e]}
              wind={daily?.windspeed_10m_max[e]}
            />
          ))
        )}
      </div>
    </>
  );
}

function Day({ time, temp, code, wind }) {
  const date = new Date(time * 1000);
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return (
    <>
      <div className='day'>
        <h3>{daysOfWeek[date.getDay()]}</h3>
        <h3>{getWeatherEmoji(code)}</h3>
        <h3>
          {temp}'|{wind}mph
        </h3>
      </div>
    </>
  );
}

function Climate(n) {
  switch (n) {
    case 0:
      return 'Clear';
    case 1:
    case 2:
    case 3:
      return 'Partly Cloudy';
    case 45:
    case 48:
      return 'Foggy';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm';
    default:
      return 'Unknown';
  }
}
function getWeatherEmoji(n) {
  if (n === 0) {
    return '☀️';
  } else if (n === 1 || n === 2 || n === 3) {
    return '🌤️';
  } else if (n === 45 || n === 48) {
    return '🌫️';
  } else if (n === 51 || n === 53 || n === 55) {
    return '🌧️';
  } else if (n === 56 || n === 57) {
    return '🌧️❄️';
  } else if (n === 61 || n === 63 || n === 65) {
    return '🌧️';
  } else if (n === 66 || n === 67) {
    return '🌧️❄️';
  } else if (n === 71 || n === 73 || n === 75) {
    return '❄️';
  } else if (n === 77) {
    return '❄️';
  } else if (n === 80 || n === 81 || n === 82) {
    return '🌧️💦';
  } else if (n === 85 || n === 86) {
    return '❄️💦';
  } else if (n === 95 || n === 96 || n === 99) {
    return '⛈️';
  } else if (n === 96 || n === 99) {
    return '⛈️❄️';
  } else {
    return '❓';
  }
}
export default Weather;
