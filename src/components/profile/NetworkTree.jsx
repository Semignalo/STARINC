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
                        className="mt-1 flex-shrink-0 bg-white border border-gray-200 rounded text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors"
                    >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <div className="mt-1 w-4 h-4" />
                )}

                <div className={`p-3 md:p-4 rounded-md border ${isRoot ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'} w-52 md:w-72 flex items-center gap-3 transition-colors`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 uppercase
                        ${isRoot ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {node.name ? node.name.charAt(0) : <User size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={node.name}>{node.name}</div>
                        <div className="text-xs text-gray-500 truncate">{node.email}</div>
                        {node.level !== undefined && node.level !== 0 && (
                            <div className="mt-1.5">
                                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    L{node.level}
                                </span>
                            </div>
                        )}
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
        <div className="bg-gray-50/50 border border-gray-100 rounded-md">
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
