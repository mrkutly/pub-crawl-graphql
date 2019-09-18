const db = require("../db/index")
const { perPage } = require("../config")

function VideosCache() {
	this.videos = {}
}

VideosCache.makeUniqueKey = function(args) {
	const formattedArgs = {
		...args,
		page: args.page || 1,
		order: args.order || "DESC"
	}

	const key = Object.keys(formattedArgs)
		.sort()
		.reduce((string, key) => string + `|${key}:${formattedArgs[key]}|`, "")

	return key
}

VideosCache.prototype.getVideos = async function(args) {
	try {
		const key = VideosCache.makeUniqueKey(args)
		const foundCache = this.videos[key]
		const hasExpired = foundCache && Date.now() > this.videos[key].expiresAt

		if (!foundCache || hasExpired) {
			const page = args.page - 1 || 0
			const skip = page * perPage
			const order = {
				toSqlString: function() {
					return args.order || "DESC"
				}
			}

			const videos = await db.query(
				`SELECT trc.videos.*, trc.publishers.name as publisher 
                    FROM trc.videos 
                    INNER JOIN trc.publishers 
                    ON trc.publishers.id = trc.videos.publisher_id 
                    WHERE publisher_id = ? 
                    ORDER BY create_time ?
                    LIMIT ?
                    OFFSET ?`,
				[args.publisher_id, order, perPage, skip]
			)

			this.videos[key] = {
				videos,
				expiresAt: Date.now() + 30 * 60 * 1000
			}
		}

		return this.videos[key].videos
	} catch (error) {
		throw error
	}
}

module.exports = VideosCache
