import { Router } from 'express';
import { changePassword, forgotPassword, login, register, resetPassword, verifyEmail, verifyOtp,sendNewPassword, loginWithGoogle} from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/new-password',sendNewPassword );
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post("/google-login", loginWithGoogle);
export default router;



