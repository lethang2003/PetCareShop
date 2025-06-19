import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/store';
import { setUserDetails } from '../store/userSlice';
import toast from 'react-hot-toast';
import Axios from '@utils/Axios';
import SummaryApi from '@common/SummarryAPI';
import { FaPaw, FaCalendarAlt, FaFileAlt, FaMedal, FaEnvelope, FaPhone } from 'react-icons/fa';
import { viewAllPets } from "../utils/PetsAPI";

const EditProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);
    const appointments = useSelector(
        (state: RootState) => state.appointments.appointments
    );

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });

    // Tính số lượng lịch hẹn Pending
    const pendingAppointments = appointments.filter(
        (app) => app.status === "confirmed"
    ).length;
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [petCount, setPetCount] = useState(0);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || ''
            });
            setAvatarPreview(user.avatar || '');
        }
        // Lấy số lượng pet thực tế
        const fetchPetCount = async () => {
            try {
                const res = await viewAllPets();
                if (res.success) {
                    setPetCount(res.data.length);
                }
            } catch { }
        };
        fetchPetCount();
    }, [user]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type! Please upload only JPG, PNG, GIF or WEBP images.');
            return;
        }


        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toast.error('File size too large! Maximum size is 5MB.');
            return;
        }

        setSelectedAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));

        // Auto upload avatar when selected
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const res = await Axios.post('/api/v1/upload/upload-image', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success && res.data.data.url) {
                const updatedAvatarUrl = res.data.data.url;

                // Update profile with new avatar
                const response = await Axios({
                    ...SummaryApi.updateProfile(user.userId),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                    data: { ...formData, avatar: updatedAvatarUrl },
                });

                if (response.data.success) {
                    toast.success('Avatar updated successfully!');
                    dispatch(setUserDetails({ ...response.data.data, token: user.token, userId: user.userId }));
                } else {
                    toast.error(response.data.message || 'Failed to update avatar.');
                }
            } else {
                setSelectedAvatarFile(null);
                toast.error('Failed to upload image!');
            }
        } catch (err: any) {
            if (err.response?.status === 413) {
                toast.error('File size exceeds server limit!');
            } else if (err.response?.status === 415) {
                toast.error('Unsupported media type!');
            } else {
                toast.error('Error uploading image! Please try again.');
            }
            setSelectedAvatarFile(null);
        }
    };

    return (
        <div className="min-h-[320px] w-full bg-gradient-to-r from-orange-400 via-pink-400 to-pink-500 p-8 shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                {/* Left: Avatar + Info */}
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <div className="relative group">
                        <img
                            src={avatarPreview}
                            alt="avatar"
                            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                            onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        />
                        <label
                            htmlFor="avatarUpload"
                            className="absolute bottom-2 right-2 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 border-2 border-white shadow"
                        >
                            📷
                        </label>
                        <input
                            id="avatarUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="text-white space-y-1 md:ml-4 text-center md:text-left">
                        <div className="text-2xl font-bold">{formData.fullName || 'User Name'}</div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm opacity-90">
                            <span className="flex items-center gap-1"><FaEnvelope className="text-base" /> {formData.email}</span>
                            <span className="flex items-center gap-1"><FaPhone className="text-base" /> {formData.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Info boxes */}
            <div className="max-w-6xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="rounded-2xl bg-white bg-opacity-20 h-32 flex flex-col items-center justify-center text-white w-full shadow">
                    <FaPaw className="text-3xl mb-1" />
                    <div className="text-2xl font-bold">{petCount}</div>
                    <div className="text-base mt-1">Pets</div>
                </div>
                <div className="rounded-2xl bg-white bg-opacity-20 h-32 flex flex-col items-center justify-center text-white w-full shadow">
                    <FaCalendarAlt className="text-3xl mb-1" />
                    <div className="text-2xl font-bold">{pendingAppointments}</div>
                    <div className="text-base mt-1">Upcoming</div>
                </div>
                <div className="rounded-2xl bg-white bg-opacity-20 h-32 flex flex-col items-center justify-center text-white w-full shadow">
                    <FaFileAlt className="text-3xl mb-1" />
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-base mt-1">Records</div>
                </div>
                <div className="rounded-2xl bg-white bg-opacity-20 h-32 flex flex-col items-center justify-center text-white w-full shadow">
                    <FaMedal className="text-3xl mb-1" />
                    <div className="text-2xl font-bold">Gold</div>
                    <div className="text-base mt-1">Member</div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
