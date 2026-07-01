import { AppLoader } from "~/core/AppLoader"

export default defineNuxtRouteMiddleware(async (to, from) => {
    await new AppLoader().loadApp()

    const { prepareSystem } = usePrepareSystem()

    const systemId = routeSystemId(to)
    if (systemId) {
        await prepareSystem(systemId)
    }
})

function routeSystemId(route: { params: Record<string, unknown>, path: string }): string | null {
    const paramId = route.params.id
    if (typeof paramId === 'string' && paramId.length > 0) {
        return paramId
    }

    const pathMatch = route.path.match(/^\/systems\/([^/]+)/)
    return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null
}
