const makeDataLoaders = require("../utils/dataLoaders")

module.exports = {
	videos: async (parent, args, ctx, info) => {
		try {
			if (!ctx.videoLoader) {
				ctx.videoLoader = makeDataLoaders(
					args.publisher_name,
					args.publisher_id
				)
			}
			const videos = await ctx.db.query(
				`select trc.videos.*, trc.publishers.name as publisher 
				from trc.videos 
				inner join trc.publishers 
				on trc.publishers.id = trc.videos.publisher_id 
				where publisher_id = ? 
				order by create_time desc 
				limit 30`,
				[args.publisher_id]
			)

			return videos
		} catch (error) {
			return error
		}
	},
	videoWhereId: async (parent, args, ctx, info) => {
		try {
			if (!ctx.videoLoader) {
				ctx.videoLoader = makeDataLoaders(
					args.publisher_name,
					args.publisher_id
				)
			}
			const [video] = await ctx.db.query(
				`select *
				from trc.videos 
				where publisher_id = ? and id = ?`,
				[args.publisher_id, args.video_id]
			)

			video.publisher = args.publisher_name
			return video
		} catch (error) {
			return error
		}
	},
	videosWhereUrl: async (parent, args, ctx, info) => {
		try {
			if (!ctx.videoLoader) {
				ctx.videoLoader = makeDataLoaders(
					args.publisher_name,
					args.publisher_id
				)
			}
			const videos = await ctx.db.query(
				`select *
				from trc.videos 
				where publisher_id = ? and url rlike ?`,
				[args.publisher_id, args.video_url]
			)

			videos.forEach(video => (video.publisher = args.publisher_name))
			return videos
		} catch (error) {
			return error
		}
	},
	publishers: async (parent, args, ctx, info) => {
		try {
			if (args.publisher_name) {
				return await ctx.db.query(
					`select * from trc.publishers where name rlike ?`,
					[args.publisher_name]
				)
			}
			if (args.publisher_id) {
				return await ctx.db.query(`select * from trc.publishers where id = ?`, [
					args.publisher_id
				])
			}
			if (args.publisher_description) {
				return await ctx.db.query(
					`select * from trc.publishers where description rlike ?`,
					[args.publisher_description]
				)
			}
		} catch (error) {
			return error
		}
	}
}
