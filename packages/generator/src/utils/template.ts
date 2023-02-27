import fs from 'fs'
import path from 'path'

export const collectTemplates = (root: string, matches: string[] = []): string[] => {
    const stats = fs.statSync(root)

    if (stats.isDirectory()) {
        const dirContent = fs.readdirSync(root)

        for (let c of dirContent) {
            const p = path.join(root, c)
            collectTemplates(p, matches)
        }
    } else if (stats.isFile()) {
        matches.push(root)
    }
    return matches
}