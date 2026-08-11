import React, { useState, useRef, useEffect } from "react";
import { X, Printer, Eye, FileText, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: any;
}

export default function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
    const [zoom, setZoom] = useState(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-fit logic
    useEffect(() => {
        if (isOpen && containerRef.current && contentRef.current) {
            const containerWidth = containerRef.current.clientWidth - 48; // 24px padding each side
            const contentWidth = 21 * 37.8; // Approx 21cm in pixels (1cm ~= 37.8px at 96dpi)

            // Calculate fit zoom, but don't exceed 0.4 by default
            const fitZoom = containerWidth / contentWidth;
            setZoom(Math.min(0.4, fitZoom));
        } else if (!isOpen) {
            setZoom(0.4);
        }
    }, [isOpen]);

    if (!template) return null;

    // Dummy data for variable replacement
    const dummyData: Record<string, string> = {
        name: "John Doe",
        class: "X-A",
        admissionNo: "LXC/2026/001",
        school: "Demo Public School",
        date: new Date().toLocaleDateString(),
        academicYear: "2025-26",
        issueDate: new Date().toLocaleDateString(),
        "school.name": "LearnXChain Academy",
        "school.address": "123 Education Street, Knowledge City",
    };

    // Simple placeholder replacement logic
    const renderContent = (content: string) => {
        let rendered = content;
        Object.keys(dummyData).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            rendered = rendered.replace(regex, dummyData[key]);
        });
        return rendered;
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2));
    const handleResetZoom = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth - 48;
            const contentWidth = 21 * 37.8;
            setZoom(Math.min(0.4, containerWidth / contentWidth));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full md:max-w-6xl h-full md:h-auto bg-white dark:bg-slate-900 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 backdrop-blur-sm sticky top-0 z-20">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                                    <Eye className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm md:text-xl font-black uppercase tracking-tight dark:text-white truncate">
                                        Template Preview
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium pb-5 truncate">Viewing: {template.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 border dark:border-white/5 mr-2">
                                    <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 rounded-lg">
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
                                    <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 rounded-lg">
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleResetZoom} title="Fit to Screen" className="h-8 w-8 rounded-lg border-l dark:border-white/5 ml-1 pl-2">
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 hover:bg-gray-200 dark:hover:bg-white/10">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Zoom Controls Overlay */}
                        <div className="sm:hidden absolute bottom-24 right-6 z-30 flex flex-col gap-2">
                            <Button onClick={handleZoomIn} className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border dark:border-white/10 text-gray-900 dark:text-white">
                                <ZoomIn className="h-5 w-5" />
                            </Button>
                            <Button onClick={handleZoomOut} className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border dark:border-white/10 text-gray-900 dark:text-white">
                                <ZoomOut className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Content Area */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-auto p-4 md:p-12 bg-gray-100 dark:bg-slate-950 flex justify-center items-start min-h-0"
                        >
                            <div
                                ref={contentRef}
                                className="bg-white shadow-2xl rounded-sm w-[21cm] min-h-[29.7cm] p-8 md:p-16 relative origin-top transition-transform duration-200"
                                style={{
                                    boxShadow: '0 0 50px rgba(0,0,0,0.1)',
                                    transform: `scale(${zoom})`,
                                    marginBottom: `${(29.7 * 37.8 * (zoom - 1))}px` // Adjust for scale offset
                                }}
                            >
                                {/* Watermark Background */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] scale-150">
                                    <span className="text-[60px] md:text-[120px] font-black uppercase whitespace-nowrap">LearnXChain</span>
                                </div>

                                {/* Rendered Content */}
                                <div
                                    className="relative z-10 prose prose-indigo max-w-none dark:text-gray-900"
                                    dangerouslySetInnerHTML={{ __html: renderContent(template.content) }}
                                />
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t dark:border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center sticky bottom-0 z-20">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 font-medium italic">
                                <FileText className="h-4 w-4" />
                                Visual representation (Draft Mode)
                            </div>
                            <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                                <Button variant="outline" className="flex-1 md:flex-none rounded-xl font-bold dark:border-white/10 h-11" onClick={onClose}>
                                    Close
                                </Button>
                                <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 font-bold shadow-lg shadow-indigo-200 dark:shadow-none h-11">
                                    <Printer className="h-4 w-4" /> Print
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

