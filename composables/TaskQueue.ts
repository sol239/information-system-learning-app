import type { Task } from "~/model/Task";
import { useSelectedTaskStore } from "#imports";
import { useSelectedSystemStore } from "#imports";
import { useInformationSystemStore } from "#imports";
import type { InformationSystem } from "~/model/InformationSystem";

export class TaskQueue {
    public static getTasks(id: number): Task[] {
        const selectedTaskStore = useSelectedTaskStore();
        const selectedSystemStore = useSelectedSystemStore();
        const currentSystem: InformationSystem | undefined = useInformationSystemStore().systems.find(system => system.id === selectedSystemStore.selectedId);
    
        if (!currentSystem) {
            console.error('No information system found for the selected ID:', selectedSystemStore.selectedId);
            return [];
        }

        const tasks = currentSystem.tasks.filter(task => task.round <= selectedTaskStore.currentRound);
        return tasks;
    }

    public static getNotCompletedTasks(id: number): Task[] {
        const allTasks = this.getTasks(id);
        const notCompletedTasks = allTasks.filter(task => !task.componentsRepaired);
        return notCompletedTasks;
    }

    public static getSelectedTaskErrorComponentFilenames(selectedTaskId: number, systemId: number): string[] {
        const allTasks = this.getTasks(systemId);
        const selectedTask = allTasks.find(task => task.id === selectedTaskId);

        if (!selectedTask) {
            console.error('No task found with the selected ID:', selectedTaskId);
            return [];
        }
        const errorComponents = selectedTask.errorComponents ?? [];
        return errorComponents.map(comp => comp.name);
    }
}