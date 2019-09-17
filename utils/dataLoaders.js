const DataLoader = require('dataloader');
const db = require('../db/index');

const makeDataLoaders = pubName => {
	return {
		audit: new DataLoader(async ids => {
			try {
				const placeholders = ids.map(id => '?').join();
				const auditData = await db.query(
					`select * from crawler.audit where crawler.audit.publisher = ? and crawler.audit.pub_item_id in (${placeholders})`,
					[pubName, ...ids]
				);
				return ids.map(id => auditData.find(audit => audit.pub_item_id === id));
			} catch (error) {
				return error;
			}
		}),
		instructions: new DataLoader(async ids => {
			try {
				const placeholders = ids.map(id => '?').join();
				const instructionsData = await db.query(
					`select * from crawler.instructions where crawler.instructions.publisher = ? and crawler.instructions.pub_item_id in (${placeholders})`,
					[pubName, ...ids]
				);

				return ids.map(id =>
					instructionsData.find(instructions => instructions.pub_item_id === id)
				);
			} catch (error) {
				return error;
			}
		}),
	};
};

module.exports = makeDataLoaders;
