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

}