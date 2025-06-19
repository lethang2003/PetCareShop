import Axios from "./Axios";
import SummaryApi from "../common/SummarryAPI";

const workScheduleTransferAPI = {
  createTransferRequest: async (fromId: string, toId: string): Promise<any> => {
    return await Axios({
      ...SummaryApi.workScheduleTransfer.create,
      data: {
        workScheduleId: fromId,
        targetScheduleId: toId,
      },
    });
  },   

  getMyTransferRequests: async () => {
    return await Axios(SummaryApi.workScheduleTransfer.getMine);
  },

  acceptTransfer: async (transferId: string) => {
    return await Axios(SummaryApi.workScheduleTransfer.accept(transferId));
  },

  rejectTransfer: async (transferId: string) => {
    return await Axios(SummaryApi.workScheduleTransfer.reject(transferId));
  },
};

export default workScheduleTransferAPI;
