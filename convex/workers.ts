import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getUser } from './users';

export const createWorker = mutation({
    args: {
        name: v.string(),
        nip: v.string(),
        bidangId: v.id('bidang'),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        await ctx.db.insert('pegawai', {
            name: args.name,
            nip: args.nip,
            bidangId: args.bidangId,
        });
    },
});

export const getPaginationWorker = query({
    args: {
        bidangId: v.optional(v.id('bidang')),
        paginationOpts: v.any(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            return {
                page: [],
                isDone: true,
                continueCursor: '',
            };
        }

        if (args.bidangId) {
            return await ctx.db
                .query('pegawai')
                .withIndex('by_bidangId', (q) => q.eq('bidangId', args.bidangId!))
                .order('desc')
                .paginate(args.paginationOpts);
        } else {
            return await ctx.db.query('pegawai').order('desc').paginate(args.paginationOpts);
        }
    },
});

export const getAllWorker = query({
    args: {
        bidangId: v.optional(v.id('bidang')),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            return [];
        }

        if (args.bidangId) {
            return await ctx.db
                .query('pegawai')
                .withIndex('by_bidangId', (q) => q.eq('bidangId', args.bidangId!))
                .collect();
        } else {
            return await ctx.db.query('pegawai').collect();
        }
    },
});

export const getMyWorker = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await getUser(ctx, identity.tokenIdentifier);

        if (me.role === 'admin') {
            return await ctx.db.query('pegawai').collect();
        }

        if (me.role !== 'ketua_bidang' || !me.bidangId) {
            return [];
        }

        return await ctx.db
            .query('pegawai')
            .withIndex('by_bidangId', (q) => q.eq('bidangId', me.bidangId!))
            .collect();
    },
});

export const updateWorker = mutation({
    args: {
        workerId: v.id('pegawai'),
        name: v.string(),
        nip: v.string(),
        bidangId: v.id('bidang'),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }
        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        await ctx.db.patch(args.workerId, {
            name: args.name,
            nip: args.nip,
            bidangId: args.bidangId,
        });
    },
});

export const deleteWorker = mutation({
    args: {
        workerId: v.id('pegawai'),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }
        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        const nominasiTerkait = await ctx.db
            .query('nominasi')
            .filter((q) => q.eq(q.field('pegawaiId'), args.workerId))
            .collect();

        for (const nominasi of nominasiTerkait) {
            const penilaianTerkait = await ctx.db
                .query('penilaian')
                .withIndex('by_nominasiId', (q) => q.eq('nominasiId', nominasi._id))
                .first();

            if (penilaianTerkait) {
                await ctx.db.delete(penilaianTerkait._id);
            }
        }

        await Promise.all(nominasiTerkait.map((nominasi) => ctx.db.delete(nominasi._id)));

        await ctx.db.delete(args.workerId);
    },
});
