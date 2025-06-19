import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CloseIcon from '@mui/icons-material/Close';
const ChatPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Mở form đặt lịch hẹn"
                className="fixed bottom-5 right-5 bg-blue-500 p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
            >
                <EditCalendarIcon style={{ fontSize: 28, color: 'white' }} />
            </button>


            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 50 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Đóng form đặt lịch hẹn"
                                className="absolute top-3 right-3 text-gray-400 hover:text-black transition"
                            >
                                <CloseIcon style={{ fontSize: 28 }} />
                            </button>


                            <h2 className="text-2xl font-bold text-blue-600 text-center mb-1">Đặt Lịch Hẹn</h2>
                            <div className="flex justify-center mb-4">
                                <img src="/src/assets/logo.jpg" alt="icon" className="w-12 h-12 rounded-full" />
                            </div>

                            <form className="space-y-4">
                                <div className="flex gap-3">
                                    <select className="border p-2 rounded w-1/2" aria-label="Chọn chuyên khoa">
                                        <option>Chọn chuyên khoa</option>
                                    </select>
                                    <select className="border p-2 rounded w-1/2" aria-label="Chọn thú nuôi">
                                        <option>Chọn thú nuôi</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Tên" className="border p-2 rounded w-1/2" aria-label="Tên" />
                                    <input type="email" placeholder="Email" className="border p-2 rounded w-1/2" aria-label="Email" />
                                </div>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Số Điện Thoại" className="border p-2 rounded w-1/2" aria-label="Số Điện Thoại" />
                                    <input
                                        type="date"
                                        className="border p-2 rounded w-1/2"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        aria-label="Chọn ngày hẹn"
                                    />
                                </div>
                                <select className="border p-2 rounded w-full" aria-label="Chọn nơi khám">
                                    <option>Chọn nơi khám</option>
                                </select>
                                <textarea placeholder="Nhập nội dung" className="border p-2 rounded w-full h-24" aria-label="Nhập nội dung"></textarea>
                                <button
                                    type="submit"
                                    className="w-full border-2 border-blue-500 text-blue-500 rounded-full py-2 hover:bg-blue-500 hover:text-white transition"
                                >
                                    GỬI YÊU CẦU
                                </button>
                            </form>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatPopup;
