const makeDataLoaders = require('../utils/dataLoaders');

module.exports = {
	videos: async (parent, args, ctx, info) => {
		if (!ctx.videoLoader) {
			ctx.videoLoader = makeDataLoaders(args.publisher_name);
		}
		return await ctx.db.query(
			`select trc.videos.*, trc.publishers.name as publisher from trc.videos inner join trc.publishers on trc.publishers.id = trc.videos.publisher_id where publisher_id = ? limit 30`,
			[args.publisher_id]
		);
	},
};
