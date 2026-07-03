import type { Page } from "~/model/Page";
import type { Task } from "~/model/Task/Task";

export class TaskHelper {
    public static getVisiblePages(tasks: Task[]): Page[] {
        const pagesByRoute = new Map<string, Page>();

        for (const task of tasks) {
            if (!Array.isArray(task.visiblePages)) {
                continue;
            }

            for (const page of task.visiblePages) {
                pagesByRoute.set(page.route, page);
            }
        }

        return [...pagesByRoute.values()];
    }
}
