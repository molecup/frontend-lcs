'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiveRefreshClient({ isLive = false, intervalMs = 30000 }) {
    const router = useRouter();

    useEffect(() => {
        if (!isLive) return undefined;

        const intervalId = window.setInterval(() => {
            router.refresh();
        }, intervalMs);

        return () => window.clearInterval(intervalId);
    }, [isLive, intervalMs, router]);

    return null;
}

