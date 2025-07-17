import mongoose from 'mongoose';

const datoSchema = new mongoose.Schema({
  Voltage: {
    type: Number,
    required: true
  },
  Corriente: {
    type: Number,
    required: true
  },
  Potencia: {
    type: Number,
    default: false
  },
  Energia: {
    type: Number,
    default: false
  },
  FPotencia: {
    type: Number,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Dato', datoSchema);