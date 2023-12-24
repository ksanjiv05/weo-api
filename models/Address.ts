import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IAddress } from "../interfaces/IAddress";

const AddressSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    // coordinates: {
    //   lat: Number,
    //   lng: Number,
    // },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

AddressSchema.post<IAddress>("save", function () {
  logging.info("Mongo", "Address just saved: ");
});

export default mongoose.model<IAddress>("Address", AddressSchema);

// const mapItemSchema = new mongoose.Schema({
//   name: String,
//   location: {
//       // It's important to define type within type field, because
//       // mongoose use "type" to identify field's object type.
//       type: {type: String, default: 'Point'},
//       // Default value is needed. Mongoose pass an empty array to
//       // array type by default, but it will fail MongoDB's pre-save
//       // validation.
//       coordinates: {type: [Number], default: [0, 0]}
//   }
// });
// const MapItem = mongoose.model('MapItem', mapItemSchema);

// MapItem.create({
//   name: 'Toronto',
//   location: {
//       type: 'Point',
//       // Place longitude first, then latitude
//       coordinate: [-79.3968307, 43.6656976]
//   }
// });

//https://stackoverflow.com/questions/61343311/mongoose-geo-near-search-how-to-sort-within-a-given-distance
