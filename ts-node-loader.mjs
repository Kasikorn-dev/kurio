import { access, readFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import ts from "typescript"

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname)

async function fileExists(filePath) {
        try {
                await access(filePath)
                return true
        } catch {
                return false
        }
}

export async function resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/")) {
                const resolvedPath = path.resolve(projectRoot, "src", specifier.slice(2))
                const directTsPath = `${resolvedPath}.ts`
                const directJsPath = `${resolvedPath}.js`
                const indexTsPath = path.join(resolvedPath, "index.ts")
                const indexJsPath = path.join(resolvedPath, "index.js")

                const targetPath = (await fileExists(directTsPath))
                        ? directTsPath
                        : (await fileExists(directJsPath))
                                ? directJsPath
                                : (await fileExists(indexTsPath))
                                        ? indexTsPath
                                        : (await fileExists(indexJsPath))
                                                ? indexJsPath
                                                : `${resolvedPath}`

                return nextResolve(pathToFileURL(targetPath).href, context)
        }

        if (specifier.startsWith("./") || specifier.startsWith("../")) {
                const basePath = path.dirname(new URL(context.parentURL ?? import.meta.url).pathname)
                const resolvedSpecifier = path.resolve(basePath, specifier)
                const directTsPath = `${resolvedSpecifier}.ts`
                const directJsPath = `${resolvedSpecifier}.js`
                const indexTsPath = path.join(resolvedSpecifier, "index.ts")
                const indexJsPath = path.join(resolvedSpecifier, "index.js")

                const targetPath = (await fileExists(directTsPath))
                        ? directTsPath
                        : (await fileExists(directJsPath))
                                ? directJsPath
                                : (await fileExists(indexTsPath))
                                        ? indexTsPath
                                        : (await fileExists(indexJsPath))
                                                ? indexJsPath
                                                : resolvedSpecifier

                return nextResolve(pathToFileURL(targetPath).href, context)
        }

        return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
        if (url.endsWith(".ts")) {
                const source = await readFile(new URL(url), "utf8")
                const { outputText } = ts.transpileModule(source, {
                        compilerOptions: {
                                module: ts.ModuleKind.ESNext,
                                moduleResolution: ts.ModuleResolutionKind.Bundler,
                                target: ts.ScriptTarget.ES2022,
                                esModuleInterop: true,
                                jsx: ts.JsxEmit.Preserve,
                                types: ["node"],
                        },
                        fileName: url,
                })

                return {
                        format: "module",
                        source: outputText,
                        shortCircuit: true,
                }
        }

        return nextLoad(url, context)
}
