import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getUser } from './users';

export const createNomination = mutation({
    args: {
        pegawaiId: v.id('pegawai'),
        periode: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'ketua_bidang' || !me.bidangId) {
            throw new ConvexError('Hanya Kepala seksi yang dapat membuat nominasi.');
        }

        const pegawai = await ctx.db.get(args.pegawaiId);
        if (!pegawai) {
            throw new ConvexError('Pegawai tidak ditemukan.');
        }
        if (pegawai.bidangId !== me.bidangId) {
            throw new ConvexError('Anda hanya bisa menominasikan pegawai dari unit kerja Anda.');
        }

        const existingNomination = await ctx.db
            .query('nominasi')
            .filter((q) => q.and(q.eq(q.field('pegawaiId'), args.pegawaiId), q.eq(q.field('periode'), args.periode)))
            .first();

        if (existingNomination) {
            throw new ConvexError('Pegawai ini sudah pernah dinominasikan untuk periode yang sama.');
        }

        await ctx.db.insert('nominasi', {
            pegawaiId: args.pegawaiId,
            bidangId: pegawai.bidangId,
            periode: args.periode,
            status: 'dinominasikan',
        });
    },
});

export const getNominationToBeAssessed = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await getUser(ctx, identity.tokenIdentifier);

        let nominasi;

        if (me.role === 'admin') {
            nominasi = await ctx.db
                .query('nominasi')
                .filter((q) => q.eq(q.field('status'), 'dinominasikan'))
                .order('desc')
                .collect();
        } else if (me.role === 'atasan') {
            if (!me.bidangId) {
                return [];
            }
            nominasi = await ctx.db
                .query('nominasi')
                .filter((q) => q.and(q.eq(q.field('bidangId'), me.bidangId!), q.eq(q.field('status'), 'dinominasikan')))
                .order('desc')
                .collect();
        } else {
            return [];
        }

        return Promise.all(
            nominasi.map(async (n) => {
                const pegawai = await ctx.db.get(n.pegawaiId);
                return {
                    ...n,
                    namaPegawai: pegawai?.name,
                    nipPegawai: pegawai?.nip,
                    namaPenilai: 'Semua Atasan Bidang Terkait',
                };
            })
        );
    },
});

export const getMyNominations = query({
    args: {
        // TODO: Kita mungkin butuh filter periode di masa depan, untuk saat ini ambil semua
    },
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await getUser(ctx, identity.tokenIdentifier);

        if (!me.bidangId) return [];

        const pegawaiDiBidang = await ctx.db
            .query('pegawai')
            .withIndex('by_bidangId', (q) => q.eq('bidangId', me.bidangId!))
            .collect();

        const pegawaiIds = pegawaiDiBidang.map((p) => p._id);

        const nominations = await ctx.db.query('nominasi').collect();

        const myNominations = nominations.filter((n) => pegawaiIds.includes(n.pegawaiId));

        return myNominations;
    },
});
