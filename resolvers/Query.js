const makeDataLoaders = require("../utils/dataLoaders")

// TODO: pagination!

module.exports = {
	videos: async (parent, args, ctx, info) => {
		try {
			if (!ctx.videoLoader) {
				ctx.videoLoader = makeDataLoaders(
					args.publisher_name,
					args.publisher_id
				)
			}

			const page = args.page - 1 || 0
			const skip = page * 50
			const videos = await ctx.db.query(
				`SELECT trc.videos.*, trc.publishers.name as publisher 
				FROM trc.videos 
				INNER JOIN trc.publishers 
				ON trc.publishers.id = trc.videos.publisher_id 
				WHERE publisher_id = ? 
				ORDER BY create_time DESC
				LIMIT 50
				OFFSET ?`,
				[args.publisher_id, skip]
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
				`SELECT *
				FROM trc.videos 
				WHERE publisher_id = ? 
				AND id = ?`,
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
				`SELECT *
				FROM trc.videos 
				WHERE publisher_id = ? AND url RLIKE ?`,
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
					`SELECT * FROM trc.publishers WHERE name RLIKE ?`,
					[args.publisher_name]
				)
			}
			if (args.publisher_id) {
				return await ctx.db.query(`SELECT * FROM trc.publishers WHERE id = ?`, [
					args.publisher_id
				])
			}
			if (args.publisher_description) {
				return await ctx.db.query(
					`SELECT * FROM trc.publishers WHERE description RLIKE ?`,
					[args.publisher_description]
				)
			}
		} catch (error) {
			return error
		}
	}
}
