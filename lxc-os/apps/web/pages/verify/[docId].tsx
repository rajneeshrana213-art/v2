import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircle, AlertCircle, FileText, Download, ShieldCheck, School, User } from 'lucide-react';
import { Loader } from "@/components/ui/feedback/Loader";

export default function VerifyPage() {
    const router = useRouter();
    const { docId } = router.query;
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (docId) {
            fetch(`/api/v1/verify/${docId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) setError(data.error);
                    else setDocument(data);
                })
                .catch(() => setError("Failed to connect to verification server"))
                .finally(() => setLoading(false));
        }
    }, [docId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader size="lg" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>Document Verification | LearnXChain</title>
            </Head>

            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-lg">
                    {/* Header */}
                    <div className={`p-8 text-center ${error ? 'bg-red-50' : 'bg-green-50'}`}>
                        {error ? (
                            <div className="flex flex-col items-center">
                                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                                <h1 className="text-2xl font-bold text-red-900">Verification Failed</h1>
                                <p className="text-red-700 mt-2">{error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <ShieldCheck className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-bold mb-4 uppercase tracking-wider">
                                    Authentic Document
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">VERIFICATION SUCCESSFUL</h1>
                                <p className="text-gray-500 mt-2">This document is issued by an authorized educational institution.</p>
                            </div>
                        )}
                    </div>

                    {!error && document && (
                        <div className="p-8 space-y-8">
                            {/* Document Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" /> Document Details
                                        </h2>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="text-sm text-gray-500">Document Type</div>
                                            <div className="text-lg font-bold text-gray-900">{document.template?.type?.replace('_', ' ')}</div>
                                            <div className="mt-3 text-sm text-gray-500">Document Number</div>
                                            <div className="text-sm font-mono font-medium text-blue-600">{document.documentNo}</div>
                                            <div className="mt-3 text-sm text-gray-500">Issue Date</div>
                                            <div className="text-sm font-medium">{new Date(document.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                            <School className="h-4 w-4 mr-2" /> Issuing Institution
                                        </h2>
                                        <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            {document.school?.schoolLogo && (
                                                <img src={document.school.schoolLogo} alt="Logo" className="h-12 w-12 rounded-xl mr-4 object-cover ring-2 ring-white shadow-sm" />
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-900">{document.school?.schoolName}</div>
                                                <div className="text-xs text-gray-500">{document.school?.user?.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                            <User className="h-4 w-4 mr-2" /> Issued To
                                        </h2>
                                        <div className="flex items-center p-5 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
                                            {document.targetUser?.profilePic ? (
                                                <img src={document.targetUser.profilePic} alt="User" className="h-16 w-16 rounded-2xl mr-4 object-cover ring-4 ring-white/20" />
                                            ) : (
                                                <div className="h-16 w-16 rounded-2xl mr-4 bg-white/20 flex items-center justify-center">
                                                    <User className="h-8 w-8 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-2xl font-bold leading-tight">{document.targetUser?.name}</div>
                                                <div className="text-blue-100 text-sm opacity-80 uppercase tracking-widest font-bold">Authenticated Profile</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <a
                                            href={document.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                                        >
                                            <Download className="h-5 w-5 mr-3" /> View Original PDF
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Security Footer */}
                            <div className="pt-8 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400 italic">
                                    This verification is secured by LearnXChain's digital blockchain-ready signature system.
                                    Tampering with this document is a punishable offense.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    © {new Date().getFullYear()} LearnXChain Smart Documents. All Rights Reserved.
                </div>
            </div>
        </div>
    );
}
