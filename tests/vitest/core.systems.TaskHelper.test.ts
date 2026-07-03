import { describe, expect, it } from "vitest";
import { TaskHelper } from "../../app/core/systems/TaskHelper";
import { Task } from "../../app/model/Task/Task";

describe("TaskHelper", () => {
    describe("getVisiblePages", () => {
        it("returns unique visible pages from tasks", () => {
            const firstTask = Task.fromJSON({
                id: "first-task",
                title: "First task",
                visiblePages: [
                    { name: "Dashboard", route: "/dashboard" },
                    { name: "Database", route: "/database" },
                ],
            });
            const secondTask = Task.fromJSON({
                id: "second-task",
                title: "Second task",
                visiblePages: [
                    { name: "Dashboard duplicate", route: "/dashboard" },
                    { name: "Participants", route: "/participants" },
                ],
            });

            expect(TaskHelper.getVisiblePages([firstTask, secondTask])).toEqual([
                { name: "Dashboard duplicate", route: "/dashboard" },
                { name: "Database", route: "/database" },
                { name: "Participants", route: "/participants" },
            ]);
        });

        it("ignores tasks without explicit visible pages", () => {
            const task = Task.fromJSON({
                id: "task-without-visible-pages",
                title: "Task without visible pages",
            });

            expect(TaskHelper.getVisiblePages([task])).toEqual([]);
        });
    });
});
