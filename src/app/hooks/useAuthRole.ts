'use client';

import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';

export function useAuthRole() {
    const me = useQuery(api.users.getMe);

    return {
        role: me?.role ?? 'loading',
        isLoading: me === undefined,
    };
}
