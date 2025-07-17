import { Router } from 'express';
import { crearDato, obtenerDatos } from '../controllers/dato.controller.js';

const router = Router();

// POST /api/datos - Crear nuevo dato con 4 parámetros
router.post('/', crearDato);

// GET /api/datos - Obtener todos los datos
router.get('/', obtenerDatos);

export default router;