const mongoose = require("mongoose");
const storeSchema = mongoose.Schema({
  storeName: String,
  phoneNumber: String,
  openStatusText: Array,
  addressLines: Array,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

storeSchema.index(
  {
    location: "2dsphere",
  },
  { sparse: true }
);

module.exports = mongoose.model("Store", storeSchema);
