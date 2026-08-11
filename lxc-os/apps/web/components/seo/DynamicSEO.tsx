import Head from 'next/head';
import { SeoData } from '@/lib/seo/MetadataEngine';

interface DynamicSEOProps {
    seo?: SeoData | null;
    defaultTitle?: string;
    defaultDescription?: string;
}

export default function DynamicSEO({
    seo,
    defaultTitle = "LearnXChain - AI-First Education Operating System",
    defaultDescription = "LearnXChain is an AI-powered, modular school management and learning platform that digitizes, automates, and personalizes education workflows."
}: DynamicSEOProps) {
    const title = seo?.title || defaultTitle;
    const description = seo?.description || defaultDescription;
    const keywords = seo?.keywords || "school management, erp, education, ai, learnxchain";
    const ogImage = seo?.ogImage || "https://learnxchain.com/og-image.jpg"; // Replace with your default OG
    const canonical = seo?.canonical || undefined;
    const noIndex = seo?.noIndex || false;

    // Structured JSON-LD Data for the Organization/Website
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "LearnXChain",
        "url": "https://learnxchain.com",
        "logo": "https://learnxchain.com/logo.png",
        "description": defaultDescription,
        "sameAs": [
            "https://twitter.com/learnxchain",
            "https://linkedin.com/company/learnxchain"
        ]
    };

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Canonical Link */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Robots */}
            {noIndex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow" />
            )}

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </Head>
    );
}
