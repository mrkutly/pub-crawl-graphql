require("dotenv").config()
const mysql = require("mysql")
const util = require("util")

const poolConfig = {
	connectionLimit: 10,
	user: process.env.CRAWLER_DB_USERNAME,
	host: process.env.CRAWLER_DB_HOST,
	database: process.env.CRAWLER_DB_DATABASE,
	password: process.env.CRAWLER_DB_PASSWORD,
	port: process.env.CRAWLER_DB_PORT,
	supportBigNumbers: true
}

const clusterConfig = {
	removeNodeErrorCount: 1,
	restoreNodeTimeout: 0,
	canRetry: true
}

const cluster = mysql.createPoolCluster(clusterConfig)

cluster.on("remove", function(nodeId) {
	console.log("REMOVED NODE : " + nodeId) // nodeId = SLAVE1
})
;[...Array(10)].forEach(el => cluster.add(poolConfig))

const getConnection = util.promisify(cluster.getConnection).bind(cluster)

module.exports = {
	/**
	 * @param sql {String} - a string of sql
	 * @param values {Array} (optional) - an array of values to bind to the sql string
	 */
	query: async (sql, values) => {
		try {
			values = values || undefined
			const connection = await getConnection("*")

			const query = util.promisify(connection.query).bind(connection)
			const res = await query(sql, values)

			connection.release()

			return res
		} catch (error) {
			return error
		}
	},

	end: () => {
		cluster.end()
	}
}
