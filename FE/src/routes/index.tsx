import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "@pages/NotFound";
import Forum from "@pages/Forum";
import ForumDetail from "@pages/ForumDetail";
import KnowledgeDetail from "@pages/KnowledgeDetail";
import PrivateRoute from "./PrivateRoute";
import DashboardManage from "@layouts/DashboardManage";
import Users from "@pages/Users";
import ClinicManagement from "@pages/admin/ClinicManagement";
import CreateClinic from "@pages/admin/CreateClinic";
import UpdateClinic from "@pages/admin/UpdateClinic";
const ClinicDetail = lazy(() => import("@pages/ClinicDetail"));
const ViewAllClinics = lazy(() => import("@pages/ViewAllClinics"));
const ViewAllServices = lazy(() => import("@pages/ViewAllServices"));
const ForgotPassword = lazy(() => import("@pages/ForgotPassword"));
const Home = lazy(() => import("@pages/Home"));
const Login = lazy(() => import("@pages/Login"));
const ContactPage = lazy(() => import("@pages/Contact"));
const ServiceDetail = lazy(() => import("@pages/ServiceDetail"));
const HomeStaff = lazy(() => import("@pages/HomeStaff"));
const HomeDoctor = lazy(() => import("@pages/HomeDoctor"));
const WorkSchedulesDoctor = lazy(() => import("@pages/WorkSchedulesDoctor"));
const Dashboard = lazy(() => import("@layouts/Dashboard"));
const EditProfile = lazy(() => import("@pages/EditProfile"));
const Pets = lazy(() => import("@pages/Pets"));
const Register = lazy(() => import("@pages/Register"));
const VerifyEmail = lazy(() => import("@pages/VerifyEmail"));
const FormCreatePetForCustomer = lazy(
  () => import("@components/FormCreatePetForCustomer")
);
const FormCreatePetForDoctor = lazy(
  () => import("@components/FormCreatePetForDoctor")
);
const ViewAllPetsForCustomer = lazy(
  () => import("@components/ViewAllPetsForCustomer")
);
const ViewAllPetsForDoctor = lazy(
  () => import("@components/ViewAllPetsForDoctor")
);
const Overview = lazy(() => import("@pages/Overview"));
const AppointmentList = lazy(() => import("@components/AppointmentList"));
import WorkSchedulesStaff from "@pages/WorkSchedulesStaff";
import ViewAllListProduct from "@components/ViewAllListProduct";
import NearbyClinicsPage from "@components/NearbyClinicsPage";

const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }
  >
    <Component />
  </Suspense>
);
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: withSuspense(Home),
      },
      {
        path: "contact",
        element: withSuspense(ContactPage),
      },
      {
        path: "general",
        element: <Forum />,
      },
      {
        path: "general/knowledge/:id",
        element: <KnowledgeDetail />,
      },
      {
        path: "general/forum/:id",
        element: <ForumDetail />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          {
            path: "overview",
            element: withSuspense(Overview),
          },
          {
            path: "profile",
            element: withSuspense(EditProfile),
          },
          {
            path: "pets",
            element: withSuspense(Pets),
          },
          {
            path: "pet-new",
            element: withSuspense(FormCreatePetForCustomer),
          },
          {
            path: "pet-new-doctor",
            element: withSuspense(FormCreatePetForDoctor),
          },
          {
            path: "view-pet-customer",
            element: withSuspense(ViewAllPetsForCustomer),
          },
          {
            path: "view-pet-doctor",
            element: withSuspense(ViewAllPetsForDoctor),
          },
          {
            path: "appointments",
            element: withSuspense(AppointmentList),
          },
        ],
      },
    ],
  },
  {
    path: "dashboardmanage/admin",
    element: (
      <PrivateRoute
        roles={["admin"]}
        element={<DashboardManage role="admin" />}
      />
    ),
    children: [
      { path: "user", element: <Users /> },
      { path: "clinic", element: <ClinicManagement /> },
      { path: "clinic/create", element: <CreateClinic /> },
      { path: "clinic/update/:id", element: <UpdateClinic /> },
    ],
  },
  {
    path: "dashboardmanage/manager",
    element: (
      <PrivateRoute
        roles={["manager"]}
        element={<DashboardManage role="manager" />}
      />
    ),
    children: [
      { path: "profile", element: <EditProfile /> },
      { path: "user", element: <Users /> },
    ],
  },
  {
    path: "dashboardmanage/staff",
    element: (
      <PrivateRoute
        roles={["staff"]}
        element={<DashboardManage role="staff" />}
      />
    ),
    children: [
      { path: "profile", element: <EditProfile /> },
      { path: "work-schedule", element: <WorkSchedulesStaff /> },
    ],
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/viewproduct",
    element: <ViewAllListProduct />,
  },
  {
    path: "/auth/forgot-password",
    element: withSuspense(ForgotPassword),
  },
  {
    path: "/service/view-detail-service/:id",
    element: withSuspense(ServiceDetail),
  },
  {
    path: "/clinic/view-detail-clinic/:id",
    element: withSuspense(ClinicDetail),
  },
  {
    path: "/services",
    element: withSuspense(ViewAllServices),
  },
  {
    path: "/clinics",
    element: withSuspense(ViewAllClinics),
  },
  {
    path: "/staff",
    element: withSuspense(HomeStaff),
  },
  {
    path: "/doctor",
    element: <HomeDoctor />,
    children: [
      {
        path: "workSchedulesDoctor",
        element: withSuspense(WorkSchedulesDoctor),
      },
    ],
  },
  {
    path: "/auth/register",
    element: withSuspense(Register),
  },
  {
    path: "/auth/verify-email",
    element: withSuspense(VerifyEmail),
  },
  // routes.tsx hoặc tương đương
{
  path: "/nearby-clinics",
  element: <NearbyClinicsPage />,
}
]);

export default router;
