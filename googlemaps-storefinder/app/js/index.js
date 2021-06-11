//const { update } = require("../../api/models/store");

const title = document.querySelector(".title");

var map;
var infoWindow;
var markers = [];



function initMap() {
  const fremont = { lat: 37.5485, lng: -121.9886 };
  day_dark_mode();
  let mapIDs = ["387bbe3ee25d2d96", "e29f44827af596c2"];
  let curr = mapIDs[0];
  if (isDay()) {
    curr = mapIDs[1];
  }
  map = new google.maps.Map(document.getElementById("map"), {
    center: fremont,
    zoom: 10,
    mapId: curr,
  });

  infoWindow = new google.maps.InfoWindow();
}

const getStores = () => {
  const zipcode = document.getElementById("zip-code").value;
  //console.log(zipcode);

  if (!zipcode) {
    console.log("NO ZIPCODE");
    return;
  }
  const API_URL = "http://localhost:3000/stores";
  const url = `${API_URL}?zipcode=${zipcode}`;
  fetch(url)
    .then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        console.log("error");
        throw new Error(response.status);
      }
    })
    .then((data) => {
      clearLocations();
      console.log(data);
      if (data.length == 0) {
        console.log(`updating stores : ${zipcode}`);
        updateStores(zipcode);
      } else {
        // console.log(data);
        console.log("fetching from database");
        searchNearby(data);
        setStoresList(data);
        setOnClickListener();
      }});
};

const updateStores = (zipcode) => {
  const API_URL = "http://localhost:3000/update";
  const url = `${API_URL}?zipcode=${zipcode}`;
  fetch(url)
    .then((response) => {
    //   console.log(response);
      if (response.status == 200) {
        return response.json();
      } else {
        console.log("error");
        throw new Error(response.status);
      }
    }).then((data) => {
      if (data.length > 0) {
        searchNearby(data);
        setStoresList(data);
        setOnClickListener();
      } else {
        noStoresFound();
      }
    }); 
}


const createMarker = (
  latlng,
  name,
  address,
  openStatusText,
  phoneNumber,
  storeNumber
) => {
  let openHoursText = `<div class="store-info-openStatus">
                            <ul>`;
  openStatusText.forEach((day_status) => {
      openHoursText += `<li>${day_status}</li>`
  })
  openHoursText += `</ul></div>`
  let html = `
    <div class="store-info-window">
      <div class="store-info-name">
        ${name}
      </div>
      <div class="store-info-open-status"> 
        ${openHoursText}
      </div>
      <div class="store-info-address>
        <div class="icon">
          <i class="fas fa-location-arrow"></i>
          <span> 
          ${address} 
         </span>
        </div>
        
      </div>
      <div class="store-info-phone">
        <div class="icon">
          <i class="fas fa-phone-alt"></i>
        </div>
        <span>
          <a href="tel:${phoneNumber}">${phoneNumber}</a>
        </span>
      </div>
    </div>
  `;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    label: `${storeNumber}`,
  });

  google.maps.event.addListener(marker, "click", function () {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
};

const searchNearby = (stores) => {
  console.log(`searchNearby ${stores[0]}`);
  var bounds = new google.maps.LatLngBounds();
  stores.forEach((store, index) => {
    var latlng = new google.maps.LatLng(
      store.location.coordinates[1],
      store.location.coordinates[0]
    );
    
    let name = store.storeName;
    let address = store.addressLines[0];
    let openStatusText = store.openStatusText;
    let phoneNumber = store.phoneNumber;
    bounds.extend(latlng);
    createMarker(latlng, name, address, openStatusText, phoneNumber, index + 1);
  });
  map.fitBounds(bounds);
};

const setStoresList = (stores) => {
  let storesHtml = "";
  stores.forEach((store, index) => {
    storesHtml += `
    <div class="store-container-background">
      <div class="store-container">
        <div class="store-info-container">
          <div class="store-address">
            <span>${store.addressLines[0]}</span>
            <span>${store.addressLines[1]}</span>
          </div>
          <div class="store-phone-number">
            ${store.phoneNumber}
          </div>
        </div>
        <div class="store-number-container">
          <div class="store-number">
            ${index + 1}
          </div>
        </div>
      </div>
    </div>
    `;
  });
  document.querySelector(".stores-list").innerHTML = storesHtml;
};

const setOnClickListener = () => {
  let storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((store, index) => {
    store.addEventListener("click", () => {
      google.maps.event.trigger(markers[index], "click");
      map.panTo(markers[index].getPosition());
    });
  });
};

const onEnter = (e) => {
  if (e.key == "enter") {
    getStores();
  }
};

const clearLocations = () => {
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
};

const noStoresFound = () => {
  const html = `
    <div class="no-stores-found">
      No Stores Found
    </div>
  `;
  document.querySelector(".stores-list").innerHTML = html;
};

function isDay() {
  let hours = new Date().getHours();
  return hours > 6 && hours < 18;
}

function day_dark_mode() {
  if (isDay()) {
    title.style.color = "darkslategray";
  } else {
    title.style.color = "#d2b48c";
  }
}
