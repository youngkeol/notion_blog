const CONFIG = {
  // profile setting (required)
  profile: {
    name: 'gory',
    image: '/avatar.svg',  // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: 'developer',
    bio: 'Hello 👋',
    email: 'younggory.work@gmail.com',
    linkedin: '',
    github: 'youngkeol',
    instagram: '',
  },
  projects: [
    {
      name: `gory-log`,
      href: 'https://github.com/youngkeol'
    }
  ],
  // blog setting (required)
  blog: {
    title: 'gory-log',
    description: 'welcome to gory-log!',
    theme: 'light' // ['light', 'dark', 'auto']
  },

  // CONFIG configration (required)
  link: 'https://gory-log.vercel.app',
  since: 2022, // If leave this empty, current year will be used.
  lang: 'en-US', // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: 'https://og-image-korean.vercel.app', // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
    //pageId: '6894b003885841f980ef54789ce969bc',
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.GOOGLE_MEASUREMENT_ID || ''
    }
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.GOOGLE_SITE_VERIFICATION || ''
    }
  },
  utterances: {
    enable: true,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO,
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
  isProd: process.env.VERCEL_ENV === 'production' // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 21600 * 7, // revalidate time for [slug], index
}
module.exports = { CONFIG }