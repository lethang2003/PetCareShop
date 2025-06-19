import { useState } from "react";
import EditProfile from "../pages/EditProfile";
import UserMenu from "../components/UserMenu";
import Overview from "../pages/Overview";
import AppointmentList from "@components/AppointmentList";
import ViewAllPetsForCustomer from "@components/ViewAllPetsForCustomer";
import ViewAllPetsForDoctor from "@components/ViewAllPetsForDoctor";

const tabList = [
  { key: "overview", label: "Overview" },
  { key: "pets", label: "My Pets" },
  { key: "appointments", label: "Appointments" },
  { key: "medical", label: "Medical" },
  { key: "billing", label: "Billing" },
  { key: "settings", label: "Settings" },
];

const Dashboard = () => {
  const [tab, setTab] = useState("overview");

  // TODO: import các component khác tương ứng tab nếu có
  const renderTabContent = () => {
    switch (tab) {
      case "overview":
        return <Overview />;
      case "appointments":
        return <AppointmentList />;
      case "pets":
        return <ViewAllPetsForCustomer />;
      // case 'pets':
      //   return <Pets />;
      // ... các tab khác
      default:
        return <Overview />;
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen pt-24">
      <div className="flex flex-col items-center w-full">
        {/* Profile */}
        <div className="w-full flex justify-center">
          <EditProfile />
        </div>
        {/* UserMenu ngang phía dưới */}
        <div className="w-full flex justify-center mt-6 mb-4">
          <UserMenu tab={tab} setTab={setTab} />
        </div>
        {/* Nội dung tab */}
        <div className="w-full flex justify-center">{renderTabContent()}</div>
      </div>
    </section>
  );
};

export default Dashboard;
