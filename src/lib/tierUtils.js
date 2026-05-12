// Tier Configuration
export const TIER_CONFIG = {
    bronze: { name: 'Bronze', minSpend: 0, discount: 10, nextTier: 'silver' },
    silver: { name: 'Silver', minSpend: 5000000, discount: 15, nextTier: 'gold' },
    gold: { name: 'Gold', minSpend: 10000000, discount: 20, nextTier: 'platinum' },
    platinum: { name: 'Platinum', minSpend: 20000000, discount: 25, nextTier: 'diamond' },
    diamond: { name: 'Diamond', minSpend: 50000000, discount: 30, nextTier: null }
};

export const TIER_LEVELS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Calculate progress to next tier
export const getTierProgress = (currentTier, cumulativeSpending) => {
    const tierData = TIER_CONFIG[currentTier] || TIER_CONFIG.bronze;
    if (!tierData.nextTier) return { maxReached: true, progress: 100, needed: 0 };
    
    const nextTierData = TIER_CONFIG[tierData.nextTier];
    const needed = (nextTierData.minSpend || 0) - (cumulativeSpending || 0);
    const progress = Math.min(100, Math.max(0, ((cumulativeSpending || 0) / nextTierData.minSpend) * 100));
    
    return {
        maxReached: false,
        progress,
        needed: Math.max(0, needed),
        nextTierName: nextTierData.name
    };
};

export const getEligibleTier = (cumulativeSpending) => {
    if (cumulativeSpending >= TIER_CONFIG.diamond.minSpend) return 'diamond';
    if (cumulativeSpending >= TIER_CONFIG.platinum.minSpend) return 'platinum';
    if (cumulativeSpending >= TIER_CONFIG.gold.minSpend) return 'gold';
    if (cumulativeSpending >= TIER_CONFIG.silver.minSpend) return 'silver';
    return 'bronze';
};

// Lazy check for downgrade on inactive days (30 days)
export const checkDowngradeLogic = (user) => {
    if (user.role === 'starcenter') return null; // Starcenter is locked

    // Handle both Firestore Timestamps and regular Date objects
    let lastTx;
    if (user.lastTransactionDate) {
        lastTx = typeof user.lastTransactionDate === 'string'
            ? new Date(user.lastTransactionDate)
            : new Date(user.lastTransactionDate);
    } else if (user.createdAt) {
        lastTx = typeof user.createdAt === 'string'
            ? new Date(user.createdAt)
            : new Date(user.createdAt);
    } else {
        lastTx = new Date();
    }
    const now = new Date();
    const diffTime = Math.abs(now - lastTx);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
        // Calculate number of downgrades (1 tier per 30 days)
        const dropCount = Math.floor(diffDays / 30);
        const currentIdx = TIER_LEVELS.indexOf(user.tier || 'silver');
        if (currentIdx > 0) {
            const newIdx = Math.max(0, currentIdx - dropCount);
            if (newIdx !== currentIdx) {
                return TIER_LEVELS[newIdx];
            }
        }
    }
    return null;
};
