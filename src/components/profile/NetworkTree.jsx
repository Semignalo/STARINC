import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, ChevronsDownUp } from 'lucide-react';

const NetworkNode = ({ node, isRoot = false }) => {
    const [expanded, setExpanded] = useState(isRoot || (node.level && node.level < 2)); // default expand root and first level

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-6 relative mt-2">
            {/* The line connecting to parent */}
            {!isRoot && (
                <div className="absolute -left-6 top-6 w-6 border-t-2 border-gray-200"></div>
            )}
            {!isRoot && (
                <div className="absolute -left-6 -top-2 bottom-0 border-l-2 border-gray-200"></div>
            )}

            <div className="flex items-start gap-2 relative z-10">
                {hasChildren ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 flex-shrink-0 bg-white border border-gray-300 rounded text-gray-500 hover:text-primary hover:border-primary transition"
                    >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <div className="mt-1 w-4 h-4" /> // spacer
                )}
                
                <div className={`p-3 md:p-4 rounded-xl border ${isRoot ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 bg-white'} w-52 md:w-72 flex items-center gap-3 transition-all hover:shadow-md`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                        ${isRoot ? 'bg-primary text-white' : 'bg-gray-100 text-[var(--color-primary)]'}`}>
                        {node.name ? node.name.charAt(0).toUpperCase() : <User />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate" title={node.name}>{node.name}</div>
                        <div className="text-xs text-gray-500 truncate">{node.email}</div>
                        <div className="mt-1 flex items-center gap-2">
                            {node.tier && (
                                <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded">
                                    {node.tier.name || 'BRONZE'}
                                </span>
                            )}
                            {node.level && (
                                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    Lvl {node.level}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="relative">
                    {/* Extend the vertical line for children if there are multiple */}
                    <div className="absolute left-0 top-0 bottom-6 border-l-2 border-gray-200"></div>
                    {node.children.map(child => (
                        <NetworkNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function NetworkTree({ referrals, currentUser }) {
    // Build tree
    const root = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        tier: currentUser.tier,
        level: 0,
        children: []
    };

    const buildTree = (parentId) => {
        return referrals
            .filter(r => r.referrer_id === parentId)
            .map(r => ({
                ...r,
                children: buildTree(r.id)
            }));
    };

    root.children = buildTree(root.id);

    return (
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100">
            {referrals.length > 0 && (
                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <ChevronsDownUp size={13} />
                        Klik node untuk expand/collapse
                    </p>
                    <span className="text-xs text-gray-400 hidden md:block">Geser kanan untuk lihat lebih</span>
                    <span className="text-xs text-gray-400 md:hidden">← Geser untuk lihat</span>
                </div>
            )}
            <div className="overflow-x-auto p-4 md:p-6">
                <div className="min-w-fit">
                    <div className="-ml-6">
                        <NetworkNode node={root} isRoot={true} />
                    </div>
                </div>
                {referrals.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        <User size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">Belum ada downline</p>
                        <p className="text-sm text-gray-400 mt-1">Bagikan referral kamu untuk mulai membangun jaringan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
