import { ConvexError, v } from 'convex/values';
import { internalMutation, internalQuery, mutation, MutationCtx, query, QueryCtx } from './_generated/server';
import { roles } from './schema';

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string | undefined) {
    if (!tokenIdentifier) {
        throw new ConvexError('Anda belum login.');
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
        .first();

    if (!user) {
        throw new ConvexError('User tidak ditemukan.');
    }

    return user;
}

export const getUserInternal = internalQuery({
    args: {
        tokenIdentifier: v.string(),
    },
    async handler(ctx, args) {
        return await getUser(ctx, args.tokenIdentifier);
    },
});

export const getMe = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        return await getUser(ctx, identity.tokenIdentifier);
    },
});

export const getUsers = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat mengakses data ini.');
        }
        return await ctx.db.query('users').collect();
    },
});

export const updateUserRole = internalMutation({
    args: {
        userId: v.id('users'),
        roles: roles,
        bidangId: v.optional(v.id('bidang')),
    },
    async handler(ctx, args) {
        await ctx.db.patch(args.userId, {
            role: args.roles,
            bidangId: args.bidangId,
        });
    },
});

export const updateUserRoleByAdmin = mutation({
    args: {
        userId: v.id('users'),
        role: roles,
        bidangId: v.optional(v.id('bidang')),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login untuk melakukan aksi ini.');
        }

        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat mengubah peran pengguna.');
        }

        if (me._id === args.userId) {
            throw new ConvexError('Anda tidak dapat mengubah peran Anda sendiri melalui form ini.');
        }

        await ctx.db.patch(args.userId, {
            role: args.role,
            bidangId: args.role === 'admin' ? undefined : args.bidangId,
        });
    },
});

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
        role: roles,
        bidangId: v.optional(v.id('bidang')),
    },
    async handler(ctx, args) {
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (existingUser) {
            console.log('User sudah ada, tidak perlu membuat lagi.');
            return;
        }

        console.log('Role yang diberikan:', args.role);
        console.log('Bidang ID yang diberikan:', args.bidangId);

        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            name: args.name,
            image: args.image,
            role: args.role ? args.role : 'admin',
            bidangId: args.bidangId,
        });
    },
});

export const updateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
    },
    async handler(ctx, args) {
        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (!user) {
            console.error('User tidak ditemukan untuk diupdate.');
            return;
        }

        await ctx.db.patch(user._id, {
            name: args.name,
            image: args.image,
        });
    },
});

export const deleteUser = internalMutation({
    args: { tokenIdentifier: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (!user) {
            console.error('User tidak ditemukan untuk dihapus.');
            return;
        }

        await ctx.db.delete(user._id);
    },
});

export const getUsersByRole = query({
    args: {
        role: roles,
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        const users = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('role'), args.role))
            .collect();

        return users;
    },
});

export const getUsersTotal = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }
        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat mengakses data ini.');
        }

        const allUsers = await ctx.db.query('users').collect();
        return allUsers.length;
    },
});

export const getPaginatedUsers = query({
    args: { paginationOpts: v.any() },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Anda harus login.');
        }
        const me = await getUser(ctx, identity.tokenIdentifier);
        if (me.role !== 'admin') {
            throw new ConvexError('Hanya admin yang dapat mengakses data ini.');
        }

        const users = await ctx.db.query('users').order('desc').paginate(args.paginationOpts);

        return users;
    },
});
