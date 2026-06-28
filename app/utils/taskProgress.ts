import type { Task } from '~/model/Task/Task'
import { TaskStatus } from '~/model/Task/TaskStatus'

export function resetTaskProgress(task: Task): Task {
  task.componentsRepaired = false
  task.completed = false
  task.status = TaskStatus.NOT_STARTED
  task.answer = ''
  task.isSubstituted = false

  if (task.activity) {
    task.activity.isCompleted = false
  }

  if (task.finish) {
    task.finish.isComplete = false
  }

  return task
}

export function resetTaskProgressJson<T extends Record<string, any>>(task: T): T {
  task.componentsRepaired = false
  task.completed = false
  task.status = TaskStatus.NOT_STARTED
  task.answer = ''
  task.isSubstituted = false

  if (task.activity && typeof task.activity === 'object') {
    task.activity.isCompleted = false
  }

  if (task.finish && typeof task.finish === 'object') {
    task.finish.isComplete = false
  }

  return task
}
