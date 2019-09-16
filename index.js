const { ApolloServer, gql } = require('apollo-server');
const db = require('./db/index');

const typeDefs = gql`
	type Video {
		publisher: String
		id: String
		publisher_id: Int
		pub_video_id: String
		uploader: String
		title: String
		description: String
		url: String
		publish_date: String
		crawlerAuditData: CrawlerAuditData
	}

	type CrawlerAuditData {
		id: String
		publisher: String
		pub_item_id: String
		item_type: String
	}

	type Query {
		videos(publisher_id: Int): [Video]
		crawlerAuditData: [CrawlerAuditData]
	}
`;

const resolvers = {
	Query: {
		videos: async (parent, args, ctx, info) => {
			return await ctx.db.query(
				`select trc.videos.*, trc.publishers.name as publisher from trc.videos inner join trc.publishers on trc.publishers.id = trc.videos.publisher_id where publisher_id = ? limit 10`,
				[args.publisher_id]
			);
		},
		crawlerAuditData: async (parent, args, ctx, info) => {
			return await ctx.db.query(`select * from crawler.audit limit 10`);
		},
	},
	Video: {
		crawlerAuditData: async (parent, args, ctx, info) => {
			try {
				const [data] = await ctx.db.query(
					`select * from crawler.audit where crawler.audit.publisher = ? and crawler.audit.pub_item_id = ?`,
					[parent.publisher, parent.pub_video_id]
				);

				return data;
			} catch (error) {
				return error;
			}
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ctx => {
		ctx.db = db;
		return ctx;
	},
});

server.listen().then(({ url }) => console.log(`Server ready at ${url}`));
