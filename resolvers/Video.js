module.exports = {
	crawlerAuditData: (parent, args, ctx, info) => {
		return Promise.resolve(ctx.videoLoader.audit.load(parent.pub_video_id));
	},
	crawlerInstructionsData: (parent, args, ctx, info) => {
		return Promise.resolve(ctx.videoLoader.instructions.load(parent.pub_video_id));
	},
	channelData: (parent, args, ctx, info) => {
		return Promise.resolve(ctx.videoLoader.channel.load(parent.id));
	},
};
