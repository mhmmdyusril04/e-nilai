import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getUser } from './users';

export const createBidang = mutation({
    args: {
        name: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login untuk melakukan aksi ini.');
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat menambahkan bidang baru.');
        }

        const existingBidang = await ctx.db
            .query('bidang')
            .filter((q) => q.eq(q.field('name'), args.name))
            .first();

        if (existingBidang) {
            throw new ConvexError('Bidang dengan nama tersebut sudah ada.');
        }

        await ctx.db.insert('bidang', {
            name: args.name,
        });
    },
});

export const getPaginationBidang = query({
    args: { paginationOpts: v.any() },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        return await ctx.db.query('bidang').order('desc').paginate(args.paginationOpts);
    },
});

export const getBidang = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        return await ctx.db.query('bidang').collect();
    },
});

export const updateBidang = mutation({
    args: {
        bidangId: v.id('bidang'),
        name: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        await ctx.db.patch(args.bidangId, {
            name: args.name,
        });
    },
});

export const deleteBidang = mutation({
    args: {
        bidangId: v.id('bidang'),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        // PENTING: Cek apakah ada pegawai yang masih terdaftar di bidang ini
        const pegawaiDiBidang = await ctx.db
            .query('pegawai')
            .withIndex('by_bidangId', (q) => q.eq('bidangId', args.bidangId))
            .first();

        if (pegawaiDiBidang) {
            throw new ConvexError('Tidak bisa menghapus bidang karena masih ada pegawai di dalamnya.');
        }

        await ctx.db.delete(args.bidangId);
    },
});
