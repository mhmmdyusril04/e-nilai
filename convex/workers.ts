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

    // Admin: ambil semua pegawai
    if (me.role === "admin") {
      const allWorkers = await ctx.db.query("pegawai").collect();

      // Ambil semua bidang yang dibutuhkan untuk enrich data pegawai
      const bidangIds = [...new Set(allWorkers.map(p => p.bidangId).filter(Boolean))];
      const bidangDocs = await Promise.all(
        bidangIds.map(id => ctx.db.get(id))
      );
      const bidangMap = new Map(bidangDocs.map(b => [b?._id, b]));

      return allWorkers.map(p => ({
        ...p,
        bidang: bidangMap.get(p.bidangId) ?? null,
      }));
    }

    // Non-admin: hanya untuk ketua bidang
    if (me.role !== "ketua_bidang" || !me.bidangId) {
      return [];
    }

    const workers = await ctx.db
      .query("pegawai")
      .withIndex("by_bidangId", (q) => q.eq("bidangId", me.bidangId!))
      .collect();

    const bidang = await ctx.db.get(me.bidangId);

    return workers.map((p) => ({
      ...p,
      bidang, // tambahkan nama bidang
    }));
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
