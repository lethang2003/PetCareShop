import noDataImage from "../assets/notFound.png";
const NoData = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 pt-20">
      <img src={noDataImage} alt="no data" className="w-40" />
      <p className="text-neutral-500">No Data</p>
    </div>
  );
};

export default NoData;
