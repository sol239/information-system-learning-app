import { AppLoader } from "~/core/AppLoader";

/**
 * Nuxt plugin to load and prepare the primary system on client-side application startup/reload.
 * The function prepareSystem ensures that the system DB is ready.
 */
export default defineNuxtPlugin(async (_nuxtApp) => {

    const systemsStore = useSystemsStore();
    const prepareSystem = usePrepareSystem();

    const appLoader = new AppLoader();
    await appLoader.loadApp();

    const primarySystem = systemsStore.getPrimarySystem();

    if (primarySystem) {
        await prepareSystem.prepareSystem(primarySystem.id);
    } else {
        console.log("No primary system found. Please ensure that at least one system is loaded.");
    }

})
