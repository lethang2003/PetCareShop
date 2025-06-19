import User, { IUser } from '../models/user.model';
import Rank, { IRank } from '../models/rank.model';

export const updateUserRank = async (userId: string) => {
  const user = await User.findById(userId) as IUser | null;
  if (!user) return;

  const rank: IRank | null = await Rank.findOne({
    minPoint: { $lte: user.point },
    maxPoint: { $gte: user.point }
  });

  if (rank && (!user.rankId || !user.rankId.equals(rank._id))) {
    user.rankId = rank._id;
    await user.save();
  }
};
