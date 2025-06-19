import express from 'express';
import {
  addFavoriteClinic,
  removeFavoriteClinic,
  getFavoriteClinics
} from '../controllers/favoriteClinic.controller';

const router = express.Router();

router.post('/add-favorite', addFavoriteClinic);
router.delete('/remove-favorite/:clinicId', removeFavoriteClinic);
router.get('/get-favorite', getFavoriteClinics);

export default router;