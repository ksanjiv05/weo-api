import { Document } from "mongoose";

export interface IQuantity extends Document {
  name: string;
  description?: string;
}
