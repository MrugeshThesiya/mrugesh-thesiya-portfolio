import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

import { roleTracks } from './src/data/roles.ts'
import { contact, currently, education, internship, site, systems, wdc } from './src/data/site.ts'

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const list = (items: readonly string[]) =>
  `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`

/**
 * The page is a client-rendered SPA, so without this its body is an empty
 * <div id="root">. Crawlers that do not execute JavaScript — link unfurlers, AI
 * answer engines, some preview bots — would see nothing to index.
 *
 * This writes the homepage copy into the built HTML as plain semantic markup,
 * then an inline script removes it before first paint, so browsers never see a
 * duplicate. Deep routes are rendered by React once JS runs.
 */
function preRenderContent(): Plugin {
  return {
    name: 'pre-render-content',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const trackMarkup = roleTracks
          .map(
            (track) =>
              `<h3>${esc(track.label)}</h3><p>${esc(track.card.blurb)}</p>${list(
                track.card.points,
              )}<p><a href="${track.path}">${esc(track.label)}</a></p>`,
          )
          .join('')

        const systemMarkup = systems
          .map(
            (system) =>
              `<h3>${esc(system.name)}</h3><p>${esc(system.status)} · ${esc(
                system.period,
              )} · ${esc(system.role)}</p><p>${esc(system.summary)}</p>${list(
                system.highlights,
              )}<p>${system.stack.map(esc).join(' &middot; ')}</p>`,
          )
          .join('')

        const content = [
          `<h1>I turn conversations into production software</h1>`,
          `<p>Two university systems taken from first requirements conversation to production, serving 450+ students and 40+ faculty, with support, roadmap and deployment still mine.</p>`,
          `<h2>Three tracks, one candidate</h2>`,
          trackMarkup,
          `<h2>Work</h2>`,
          systemMarkup,
          `<h3>${esc(wdc.title)}</h3>`,
          `<p>${esc(wdc.org)} · ${esc(wdc.period)}</p>`,
          `<p>${esc(wdc.summary)}</p>`,
          list(wdc.responsibilities),
          `<h2>Background</h2>`,
          `<p>${esc(internship.title)}, ${esc(internship.org)} (${esc(internship.period)}): ${esc(
            internship.summary,
          )}</p>`,
          `<p>${esc(education.degree)}, ${esc(education.org)} (${esc(
            education.period,
          )}): CGPA ${esc(education.cgpa)}.</p>`,
          `<h2>About</h2>`,
          site.about.map((paragraph) => `<p>${esc(paragraph)}</p>`).join(''),
          `<h2>Currently</h2>`,
          list([
            currently.looking,
            currently.availability,
            currently.based,
            `Email: ${contact.email}`,
            `Phone: ${contact.phone}`,
            ...site.social.map((link) => `${link.label}: ${link.href}`),
          ]),
          `<h2>Resumes</h2>`,
          list([
            `Development Engineer: /Mrugesh_Thesiya_Resume.pdf`,
            `Solutions Engineer: /Mrugesh_Thesiya_Resume_Solutions_Engineer.pdf`,
            `Product Manager: /Mrugesh_Thesiya_Resume_APM.pdf`,
          ]),
        ].join('')

        const injected =
          `<div id="prerender" hidden>${content}</div>` +
          `<script>document.getElementById("prerender")?.remove()</script>`

        return html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${injected}`)
      },
    },
  }
}

/**
 * Cloudflare Pages and most static hosts need a fallback document for
 * /engineering, /solutions and /product to resolve after a hard refresh.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'

  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const index = path.resolve(outDir, 'index.html')
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.resolve(outDir, '404.html'))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preRenderContent(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
