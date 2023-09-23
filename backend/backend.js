const express = require('express');
const app = express();
const navigator = require('navigator')
const port = 3001;
const cors = require('cors');
app.use(cors());
app.use(express.json());

async function getCityName({lat, lng}) {
  var requestOptions = {
    method: 'GET',
  };
  console.log(lat, lng);
  
  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=c290bcbe537c45b1b5bdc0a5b463dc8b`, requestOptions);
    const result = await response.json();
    
    if (result.features.length) {
      const city = result.features[0].properties.city;
      return city;
    } else {

      return null; 
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}


async function getIpAddress() {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
}

async function getLocation(ipAddress) {
  try {
    const response = await fetch(`https://ipinfo.io/${ipAddress}/geo`);
    const data = await response.json();
    const [lat, lng] = data.loc.split(',');
    return { lat, lng };
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}
async function getWeather({ lat = '', lng = '', res }) {
  if (!lat || !lng) {
    const ipAddress = await getIpAddress();
    if (ipAddress) {
      const location = await getLocation(ipAddress);
      lat = location.lat;
      lng = location.lng;
    }
  }

  const city = await getCityName({lat, lng})
  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=relativehumidity_2m,windspeed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weathercode,apparent_temperature_max,apparent_temperature_min,windspeed_10m_max&current_weather=true&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=Asia%2FSingapore`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json({...data, city:city});
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.post('/weather', async (req, res) => {
  const {lat, lng} = req.body
  getWeather({lat, lng, res})
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
