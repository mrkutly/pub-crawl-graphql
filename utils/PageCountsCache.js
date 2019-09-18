const db = require("../db/index")
const { perPage } = require("../config")

function PageCountsCache() {
	this.pageCounts = {}
}

PageCountsCache.prototype.getCount = async function(publisherId) {
	try {
		const pageCountExists = this.pageCounts[publisherId]
		const pageCountExpired =
			pageCountExists && Date.now() > this.pageCounts[publisherId].expiresAt

		if (!pageCountExists || pageCountExpired) {
			const [countRes] = await db.query(
				`SELECT COUNT(id) FROM trc.videos WHERE publisher_id = ?`,
				[publisherId]
			)
			const numVideos = countRes["COUNT(id)"]
			const totalPages = Math.ceil(numVideos / perPage)
			this.pageCounts[publisherId] = {
				totalPages,
				expiresAt: Date.now() + 30 * 60 * 1000
			}
		}

		return this.pageCounts[publisherId].totalPages
	} catch (error) {
		throw error
	}
}

module.exports = PageCountsCache
