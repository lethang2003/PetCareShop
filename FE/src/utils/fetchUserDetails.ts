import Axios from './Axios';
import SummaryApi from '../common/SummarryAPI';

const fetchUserDetails = async (userId: string) => {
    try {
        const response = await Axios({
            ...SummaryApi.userDetails(userId)
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch user details');
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};

export default fetchUserDetails;
