require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

const poolConfig = {
	connectionLimit: 10,
	user: process.env.CRAWLER_DB_USERNAME,
	host: process.env.CRAWLER_DB_HOST,
	database: process.env.CRAWLER_DB_DATABASE,
	password: process.env.CRAWLER_DB_PASSWORD,
	port: process.env.CRAWLER_DB_PORT,
};

const clusterConfig = {
	restoreNodeTimeout: 20,
};

const cluster = mysql.createPoolCluster(clusterConfig);

cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);
cluster.add(poolConfig);

const getConnection = util.promisify(cluster.getConnection).bind(cluster);

module.exports = {
	/**
	 * @param sql {String} - a string of sql
	 * @param values {Array} (optional) - an array of values to bind to the sql string
	 */
	query: async (sql, values) => {
		try {
			const start = new Date();

			values = values || undefined;
			const connection = await getConnection('*');
			const query = util.promisify(connection.query).bind(connection);
			const res = await query(sql, values);
			connection.release();

			const end = new Date();
			console.log(`Query Time - ${end - start}`);
			return res;
		} catch (error) {
			return error;
		}
	},
};
