'use node';

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action } from './_generated/server';
import { roles } from './schema';

import { createClerkClient } from '@clerk/backend';

export const sendInvitation = action({
    args: {
        email: v.string(),
        role: roles,
        bidangId: v.optional(v.id('bidang')),
    },
    async handler(ctx, args) {
        // Validate environment variables
        if (!process.env.CLERK_SECRET_KEY) {
            throw new Error('CLERK_SECRET_KEY environment variable is not set');
        }

        const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error('User not authenticated');
        }

        const me = await ctx.runQuery(internal.users.getUserInternal, {
            tokenIdentifier: identity.tokenIdentifier,
        });

        if (me.role !== 'admin') {
            throw new Error('Hanya admin yang dapat mengirim undangan.');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error('Format email tidak valid');
        }

        try {
            // Prepare metadata - only include bidangId if it exists
            const metadata: { role: string; bidangId?: string } = {
                role: args.role,
            };

            if (args.bidangId) {
                metadata.bidangId = args.bidangId;
            }

            // Get redirect URL from environment or use default
            const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            const invitation = await clerkClient.invitations.createInvitation({
                emailAddress: args.email,
                redirectUrl: redirectUrl,
                publicMetadata: metadata,
            });

            console.log('Invitation sent successfully:', invitation);

            return {
                id: invitation.id,
                emailAddress: invitation.emailAddress,
                status: invitation.status,
            };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error sending invitation:', error);

            // Handle specific Clerk errors
            if (error.errors && Array.isArray(error.errors)) {
                const firstError = error.errors[0];

                if (firstError?.code === 'duplicate_record') {
                    throw new Error('Email ini sudah diundang atau sudah memiliki akun.');
                }

                if (firstError?.code === 'invalid_email') {
                    throw new Error('Format email tidak valid.');
                }

                // Log the actual error for debugging
                console.error('Clerk error details:', firstError);
                throw new Error(`Clerk error: ${firstError?.message || 'Unknown error'}`);
            }

            // Handle network or other errors
            if (error.message) {
                throw new Error(`Gagal mengirim undangan: ${error.message}`);
            }

            throw new Error('Gagal mengirim undangan. Silakan periksa log server.');
        }
    },
});
