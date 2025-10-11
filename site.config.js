const CONFIG = {
    // profile setting (required)
    profile: {
        name: "<Gori />",
        image: "/avatar.png", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
        mobileImage: "/mobile-avatar.png",
        role: "",
        bio: "Hello 👋",
        email: "younggori.work@gmail.com",
        linkedin: "",
        github: "youngkeol",
        instagram: "",
    },
    projects: [
        {
            name: `gori-log`,
            href: "https://github.com/youngkeol",
        },
    ],
    // blog setting (required)
    blog: {
        title: "<Gori />",
        description: "welcome to Gori!",
    },

    // CONFIG configration (required)
    link: "https://gori-log.vercel.app",
    since: 2025, // If leave this empty, current year will be used.
    lang: "en-US", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
    ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

    // notion configuration (required)
    notionConfig: {
        pageId: process.env.NOTION_PAGE_ID,
        notionToken: process.env.NOTION_TOKEN,
    },

    // plugin configuration (optional)
    googleAnalytics: {
        enable: false,
        config: {
            measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
        },
    },
    googleSearchConsole: {
        enable: false,
        config: {
            siteVerification:
                process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
        },
    },
    utterances: {
        enable: false,
        config: {
            //repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO,
            repo: "morethanmin/mormin-log",
            "issue-term": "og:title",
            label: "💬 Utterances",
        },
    },
    cusdis: {
        enable: false,
        config: {
            host: "https://cusdis.com",
            appid: "", // Embed Code -> data-app-id value
        },
    },
    giscus: {
        enable: true,
        config: {
            repo: "youngkeol/notion_blog",
            repoId: "R_kgDOI1k-6w",
            category: "Comments",
            categoryId: "DIC_kwDOI1k-684CtESe",
            mapping: "pathname",
            strict: "0",
            reactionsEnabled: "1",
            emitMetadata: "0",
            inputPosition: "top",
            lang: "ko",
            loading: "lazy",
        },
    },
    isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
    //revalidateTime: 21600 * 7, // revalidate time for [slug], index
    revalidateTime: 1800, // 30분(1800초)
};

module.exports = { CONFIG };
