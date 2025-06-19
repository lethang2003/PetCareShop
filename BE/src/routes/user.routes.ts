
import { Router } from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth.middlewares';
import {
  createUserAccount,
  deleteUser,
  getAllUsers,
  getUserById,
  toggleBlockUser,
  updateProfile,
} from "../controllers/user.controller";
const router = Router();
router.get('/get-all-users', getAllUsers);
router.get('/get-users-detail/:userId', getUserById);
router.put('/update-profile/:userId', updateProfile);
router.delete('/delete-user/:userId', deleteUser);
router.patch('/block/:userId/unblock', isAuthenticated, authorizeRoles('admin'), toggleBlockUser);

router.patch(
  "/block/:userId/unblock",
  isAuthenticated,
  authorizeRoles("admin"),
  toggleBlockUser
);
router.post(
  "/create-user-account",
  isAuthenticated,
  authorizeRoles("admin"),
  createUserAccount
);
export default router;
