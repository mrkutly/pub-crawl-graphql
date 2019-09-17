const DataLoader = require("dataloader")
const db = require("../db/index")

const makeDataLoaders = (pubName, publisherId) => {
	return {
		audit: new DataLoader(async ids => {
			try {
				const placeholders = ids.map(id => "?").join()
				const auditData = await db.query(
					`SELECT * FROM crawler.audit 
					WHERE crawler.audit.publisher = ? 
					AND crawler.audit.pub_item_id IN (${placeholders})`,
					[pubName, ...ids]
				)

				return ids.map(id => auditData.find(audit => audit.pub_item_id === id))
			} catch (error) {
				return error
			}
		}),
		instructions: new DataLoader(async ids => {
			try {
				const placeholders = ids.map(id => "?").join()
				const instructionsData = await db.query(
					`SELECT * FROM crawler.instructions 
					WHERE crawler.instructions.publisher = ? 
					AND crawler.instructions.pub_item_id IN (${placeholders})`,
					[pubName, ...ids]
				)

				return ids.map(id =>
					instructionsData.find(instructions => instructions.pub_item_id === id)
				)
			} catch (error) {
				return error
			}
		}),
		channels: new DataLoader(async ids => {
			try {
				const placeholders = ids.map(id => "?").join()
				const videoChannels = await db.query(
					`SELECT trc.publisher_channels.*, trc.video_channels.* 
					FROM trc.video_channels
					INNER JOIN trc.publisher_channels 
					ON trc.video_channels.channel_id = trc.publisher_channels.id
					WHERE trc.publisher_channels.publisher_id = ?
					AND trc.video_channels.video_id IN (${placeholders})`,
					[publisherId, ...ids]
				)

				return ids.map(id =>
					videoChannels.filter(channel => channel.video_id === id)
				)
			} catch (error) {
				return error
			}
		})
	}
}

module.exports = makeDataLoaders
