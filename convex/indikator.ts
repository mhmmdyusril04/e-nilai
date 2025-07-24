import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getUser } from './users';

export const getPaginationIndikator = query({
    args: { paginationOpts: v.any() },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        return await ctx.db.query('indikator').order('desc').paginate(args.paginationOpts);
    },
});

export const getIndikator = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        return await ctx.db.query('indikator').collect();
    },
});

export const createIndikator = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang bisa menambah indikator.');
        }
        await ctx.db.insert('indikator', {
            name: args.name,
            description: args.description,
        });
    },
});

export const updateIndikator = mutation({
    args: {
        indikatorId: v.id('indikator'),
        name: v.string(),
        description: v.optional(v.string()),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        await ctx.db.patch(args.indikatorId, {
            name: args.name,
            description: args.description,
        });
    },
});

export const deleteIndikator = mutation({
    args: {
        indikatorId: v.id('indikator'),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
        }

        const indikatorToDelete = await ctx.db.get(args.indikatorId);
        if (!indikatorToDelete) {
            throw new ConvexError('Indikator tidak ditemukan.');
        }

        const allPenilaian = await ctx.db.query('penilaian').collect();

        const isIndikatorUsed = allPenilaian.some((penilaian) =>
            penilaian.skor.some((skorItem) => skorItem.indikator === indikatorToDelete.name)
        );

        if (isIndikatorUsed) {
            throw new ConvexError('Tidak bisa menghapus indikator karena sudah pernah digunakan dalam penilaian.');
        }

        await ctx.db.delete(args.indikatorId);
    },
});
