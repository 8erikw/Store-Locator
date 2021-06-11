const axios = require("axios");

const googleMapsURL = "https://maps.googleapis.com/maps/api/geocode/json";
const googlePlacesURL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const googlePlaceDetailsURL = "https://maps.googleapis.com/maps/api/place/details/json";
const radius_ = 3218

class GoogleMaps {
  async getCoordinates(zipcode) {
    let coordinates = [];
    await axios
      .get(googleMapsURL, {
        params: {
          address: zipcode,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      })
      .then((response) => {
        const data = response.data;
        coordinates = {
          latitude : data.results[0].geometry.location.lat,
          longitude : data.results[0].geometry.location.lng,
        };
      })
      .catch((error) => {
        throw new Error(error);
      });

    return coordinates;
  }

  async getStoreData(zipcode) {
    let coordinates = await this.getCoordinates(zipcode);
    console.log(coordinates);
    coordinates = `${coordinates.latitude},${coordinates.longitude}`;
    let stores = [];
    let e = {};
    let url = `${googlePlacesURL}?query=restaurants&location=${coordinates}&radius=${radius_}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    // console.log(url);
    await axios
      .get(url)
      .then(async (response) => {
        for (const storeData of response.data.results) {
          url = `${googlePlaceDetailsURL}?place_id=${storeData.place_id}&fields=formatted_phone_number,opening_hours&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        //   console.log(url);
        //   console.log(storeData);
          await axios.get(url)
          .then((sd) => {
            e = {};
            e.name = storeData.name;
            e.phoneNumber = sd.data.result.formatted_phone_number;
            e.openStatusText = sd.data.result.opening_hours.weekday_text;
            e.addressLines = storeData.formatted_address.split(",");
            e.coordinates = storeData.geometry.location;
            stores.push(e);
          })
          .catch((error) => {
            throw new Error(error);
          });
        }
        console.log(stores[0]);
      }).catch((error) => {
        throw new Error(error);
      });
    // console.log(data);
    return stores;
  }
}

module.exports = GoogleMaps;
