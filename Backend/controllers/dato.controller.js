import Dato from '../models/dato.model.js';

export const crearDato = async (req, res) => {
  try {
    const { Voltage, Corriente, Potencia, Energia,  FPotencia } = req.body;
    
    if (!Voltage || !Corriente || !Potencia || !Energia || !FPotencia) {
      return res.status(400).json({ mensaje: 'Faltan uno o más parámetros requeridos' });
    }

    const nuevoDato = new Dato({
      Voltage,
      Corriente,
      Potencia,
      Energia,
      FPotencia
    });

    const datoGuardado = await nuevoDato.save();
    
    res.status(201).json(datoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar los datos', error: error.message });
  }
};

export const obtenerDatos = async (req, res) => {
  try {
    const datos = await Dato.find();
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los datos', error: error.message });
  }
};