import { FaHeartbeat, FaPaw, FaCalendarAlt, FaFileAlt, FaCreditCard, FaCog } from "react-icons/fa";

const menuItems = [
  { name: "Overview", key: "overview", icon: FaHeartbeat },
  { name: "My Pets", key: "pets", icon: FaPaw },
  { name: "Appointments", key: "appointments", icon: FaCalendarAlt },
  { name: "Medical", key: "medical", icon: FaFileAlt },
  { name: "Billing", key: "billing", icon: FaCreditCard },
  { name: "Settings", key: "settings", icon: FaCog },
];

const UserMenu = ({ tab, setTab }: { tab: string, setTab: (key: string) => void }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-6 bg-white rounded-lg p-2 shadow border">
        {menuItems.map((item) => {
          const isActive = tab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center justify-center gap-2 px-0 py-3 rounded-lg transition font-medium focus:outline-none w-full h-full ${isActive
                ? "bg-gray-100 text-black shadow font-semibold" : "text-gray-500 hover:bg-gray-50"
                }`}
              style={{ minWidth: 0 }}
            >
              <span className={`text-2xl ${isActive ? "text-black" : "text-gray-400"}`}><Icon /></span>
              <span className={`text-base ${isActive ? "font-bold" : "font-normal"}`}>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserMenu;
