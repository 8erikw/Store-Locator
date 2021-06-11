const { response } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const Store = require("./models/store");
const GoogleMapsService = require("./services/googleMapsService");
const googleMapsService = new GoogleMapsService();
require("dotenv").config();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const MONGO_DB_ADDRESS = `mongodb+srv://${process.env.MDB_USERNAME}:${process.env.MDB_KEY}@${process.env.MDB_CLUSTER_NAME}.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(MONGO_DB_ADDRESS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(express.json({ limit: "50mb" }));

// app.post("/stores", (req, res) => {
//   let mdbStores = [];
//   let stores = req.body;

//   stores.forEach((store) => {
//     mdbStores.push({
//       storeName: store.name,
//       phoneNumber: store.phone,
//       address: store.address,
//       openStatusText: store.openStatusText,
//       addressLines: store.addressLines,
//       location: {
//         type: "Point",
//         coordinates: [store.coordinates.lat, store.coordinates.lng],
//       },
//     });
//   });
//   Store.create(mdbStores, (err, stores) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).send(stores);
//     }
//   });
// });

app.delete("/stores", (req, res) => {
  Store.deleteMany({}, (err) => {
    res.status(200).send(err);
  });
});

app.get("/stores", (req, res) => {
  const zipcode = req.query.zipcode;
  googleMapsService
    .getCoordinates(zipcode)
    .then((coordinates) => {
      //console.log(coordinates);
      Store.find(
        {
          location: {
            $near: {
              $maxDistance: 8,
              $geometry: {
                type: "Point",
                coordinates: [coordinates.longitude, coordinates.latitude],
              },
            },
          },
        },
        (err, stores) => {
          if (err) {
            res.status(500).send(err);
          } else {
            // console.log("%%%%%%");
            //console.log(`app.get stores : ${stores}`);
            res.status(200).send(stores);
          }
        }
      );
    })
    .catch((error) => {});
});

app.get("/update", (req, res) => {
    const zipcode = req.query.zipcode;
    let mdbStores = [];
    googleMapsService
      .getStoreData(zipcode)
      .then((stores) => {
        stores.forEach((store) => {
          mdbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            openStatusText: store.openStatusText,
            addressLines: store.addressLines,
            location: {
              type: "Point",
              coordinates: [store.coordinates.lng, store.coordinates.lat],
            },
          });
        });
        //console.log(`update stores ${zipcode}`);
        //console.log(mdbStores[0]);
        //console.log(mdbStores[0].location.coordinates)
        Store.create(mdbStores, (err, mdbStores) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send(mdbStores);
          }
        });
      })
      .catch((error) => {});
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
