import React from 'react';
import { ShoppingBag, Package, Banknote, Users, Inbox } from 'lucide-react';

const PRESET_ICONS = {
    cart: ShoppingBag,
    orders: Package,
    commissions: Banknote,
    network: Users,
    default: Inbox,
};

/**
 * Reusable empty state component for lists and pages.
 *
 * @param {string|React.ComponentType} icon - Preset name ('cart','orders','commissions','network') or lucide component
 * @param {string} title - Heading text
 * @param {string} description - Supporting description
 * @param {React.ReactNode} action - CTA button or link
 * @param {string} className - Extra classes
 */
export default function EmptyState({ icon = 'default', title, description, action, className = '' }) {
    const Icon = typeof icon === 'string' ? (PRESET_ICONS[icon] ?? PRESET_ICONS.default) : icon;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                <Icon size={36} className="text-gray-300" />
            </div>
            {title && <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>}
            {description && <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>}
            {action}
        </div>
    );
}
