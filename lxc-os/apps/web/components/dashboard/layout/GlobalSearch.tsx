import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Ticket, User, School, ArrowRight, LayoutDashboard, Command } from 'lucide-react';
import { useRouter } from 'next/router';
import client from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { dashboardConfig, Role } from '../config/dashboardConfig';
import { useAuth } from '@/lib/context/AuthContext';
import Loader from '@/components/ui/feedback/Loader';

interface SearchResult {
    id: string;
    title: string;
    type: 'Ticket' | 'User' | 'School' | 'Class' | 'Subject' | 'Lead' | 'Navigation';
    href: string;
    description?: string;
}

interface GlobalSearchProps {
    autoFocus?: boolean;
    onClose?: () => void;
}

export default function GlobalSearch({ autoFocus, onClose }: GlobalSearchProps = {}) {
    const [query, setQuery] = useState('');
    const [apiResults, setApiResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { user } = useAuth();
    const role = (user?.role || 'student') as Role;

    // Extract navigation items for searching
    const navigationItems = useMemo(() => {
        const config = dashboardConfig[role];
        if (!config) return [];

        const items: SearchResult[] = [];
        config.sections.forEach(section => {
            section.items.forEach(item => {
                items.push({
                    id: `nav-${item.href}`,
                    title: item.label,
                    type: 'Navigation',
                    href: item.href,
                    description: section.label
                });
            });
        });
        return items;
    }, [role]);

    const filteredNavigation = useMemo(() => {
        if (!query.trim()) return [];
        return navigationItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }, [navigationItems, query]);

    // Combined results
    const results = useMemo(() => {
        return [...filteredNavigation, ...apiResults];
    }, [filteredNavigation, apiResults]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsLoading(true);
                try {
                    const response = await client.get(`/v1/dashboard/search?query=${encodeURIComponent(query)}`);
                    setApiResults(response.data.results || []);
                    setIsOpen(true);
                    setSelectedIndex(-1);
                } catch (error) {
                    console.error('Search error:', error);
                    setApiResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setApiResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            handleNavigate(results[selectedIndex].href);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            onClose?.();
        }
    };

    const handleNavigate = (href: string) => {
        router.push(href);
        setIsOpen(false);
        setQuery('');
        onClose?.();
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Ticket': return <Ticket className="h-4 w-4" />;
            case 'User': return <User className="h-4 w-4" />;
            case 'School': return <School className="h-4 w-4" />;
            case 'Navigation': return <LayoutDashboard className="h-4 w-4" />;
            default: return <ArrowRight className="h-4 w-4" />;
        }
    };

    return (
        <div className="relative w-full max-w-xl" ref={dropdownRef}>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    autoFocus={autoFocus}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search anything... (Ctrl + K)"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-16 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading ? (
                        <Loader className="" />
                    ) : query ? (
                        <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <div className="hidden items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-white/10 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </div>
                    )}
                </div>
            </div>

            {isOpen && query.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-xl dark:border-white/10 dark:bg-gray-900 z-50">
                    <p className="text-sm text-gray-400">Type to search for pages, users, tickets…</p>
                </div>
            )}

            {isOpen && (results.length > 0 || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-gray-900 z-50">
                    <div className="space-y-1">
                        {results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleNavigate(result.href)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                                    selectedIndex === index
                                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg",
                                    selectedIndex === index ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                )}>
                                    {getTypeIcon(result.type)}
                                </div>
                                <div className="flex flex-1 flex-col overflow-hidden">
                                    <span className="truncate text-sm font-medium">{result.title}</span>
                                    <span className="truncate text-xs opacity-60">
                                        {result.type === 'Navigation' ? `Page • ${result.description}` : `${result.type} • ${result.description}`}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && query.length > 1 && !isLoading && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-xl dark:border-white/10 dark:bg-gray-900 z-50">
                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                </div>
            )}
        </div>
    );
}
