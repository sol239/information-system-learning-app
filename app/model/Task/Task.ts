import type { IActivity } from "./Activity/IActivity";
import { ActivityType } from "./Activity/ActivityType";
import type { ComponentContainsConstraint } from "./Activity/ComponentContainsCheck";
import { RepairActivity } from "./Activity/RepairActivity";
import { SelectActivity } from "./Activity/SelectActivity";
import { SelectOptionsActivity } from "./Activity/SelectOptionsActivity";
import { AfterDatabaseUpdateFinish } from "./Finish/AfterDatabaseUpdateFinish";
import { FinishType } from "./Finish/FinishType";
import { ImmediateFinish } from "./Finish/ImmediateFinish";
import type { Page } from "../Page";
import { TaskStatus } from "./TaskStatus";
import { Component } from "../Component";
import type { IFinish } from "./Finish/IFinish";
import { SelectOptionsFinish } from "./Finish/SelectOptionsFinish";
import { TypeCorrectFinish } from "./Finish/TypeCorrectFinish";
import { VariableConstraintFinish } from "./Finish/VariableConstraintFinish";
import type { Option } from "./Option";
import type { CodeEditPermissions } from "~/utils/codeEditPermissions";

export class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string,

    public componentsRepaired: boolean = false,
    public completed: boolean = false,

    public activity?: IActivity,
    public activityType: ActivityType = ActivityType.REPAIR,
    
    public finish?: IFinish,
    public finishType: FinishType = FinishType.IMMEDIATE,

    public round: number = 1,
    
    public status: TaskStatus = TaskStatus.NOT_STARTED,

    public feedback: string = '',

    public pointsReward: number = 0,
    public failPenalty: number = 1,

    public answer: string = "",
    public errorComponents: Component[] = [],
    public isEditable: boolean = false,
    public isSubstituted: boolean = false,
    public canExecuteQuery: boolean = false,
    public visiblePages?: Page[],
    public codeEditPermissions?: CodeEditPermissions
  ) { }

  public static fromJSON(data: any): Task {
    const activityType = Task.parseActivityType(data?.activityType ?? data?.type ?? data?.kind);
    const finishType = Task.parseFinishType(data?.finishType);
    const status = Task.parseStatus(data?.status);
    const errorComponents = Task.parseComponents(data?.errorComponents ?? data?.["error-components"]);
    const finish = Task.createFinish(finishType, data?.finish, data?.finishDescription ?? "");

    const task = new Task(
      String(data?.id ?? ""),
      data?.title ?? "",
      data?.description ?? "",
      data?.componentsRepaired ?? false,
      data?.completed ?? status === TaskStatus.COMPLETED,
      Task.createActivity(activityType, data?.activity, data?.description ?? "", errorComponents, data?.substituteAfterActivity ?? data?.activity?.substituteAfterActivity ?? false),
      activityType,
      finish,
      finishType,
      Number(data?.round ?? 1),
      status,
      data?.feedback ?? "",
      Number(data?.pointsReward ?? 0),
      Number(data?.failPenalty ?? 1),
      data?.answer ?? "",
      errorComponents,
      data?.isEditable ?? data?.is_editable ?? false,
      data?.isSubstituted ?? false,
      Boolean(data?.canExecuteQuery ?? false),
      Array.isArray(data?.visiblePages ?? data?.visible_pages)
        ? (data.visiblePages ?? data.visible_pages)
        : undefined,
      data?.codeEditPermissions ?? data?.code_edit_permissions
    );

    return task;
  }

  private static parseComponents(data: any): Component[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((component: any) => {
      // Legacy schema support: previously, component properties like html/js/sql might have been nested under `variables` alongside `error-component-name`.
      // The current schema stores html/js/sql at the component root level.
      if (component?.variables && (typeof component.variables.html === 'string' || component.variables.sql)) {
        return Component.fromJSON({
          id: component.id ?? "",
          name: component["error-component-name"] ?? component.name ?? component.id ?? "",
          description: component.description ?? "",
          html: component.variables.html ?? component.html ?? "",
          css: component.variables.css ?? component.css ?? "",
          js: component.variables.js ?? component.js ?? "",
          js_click: component.variables.js_click ?? component.js_click ?? "",
          sql: Task.normalizeSql(component.variables.sql ?? component.sql),
          sql_click: component.variables.sql_click ?? component.sql_click ?? {},
          tags: component.tags ?? [],
          edited: component.edited ?? false,
          variables: component.variables
        });
      }

      return Component.fromJSON(component);
    });
  }

  private static normalizeSql(sql: unknown): Record<string, string> {
    if (typeof sql === "string") {
      return { default: sql };
    }

    if (sql && typeof sql === "object") {
      return sql as Record<string, string>;
    }

    return {};
  }

  private static createActivity(
    activityType: ActivityType,
    activity: any,
    _description: string,
    activityComponents: Component[],
    substituteAfterActivity: boolean = false
  ): IActivity {
    const activityDescription = activity?.description;
    const parsedComponents = Task.parseComponents(activity?.activityComponents);
    const components = parsedComponents.length > 0 ? parsedComponents : activityComponents;
    const label = activity?.label;

    const activityOptions = Task.normalizeOptions(activity?.options);

    let instance: IActivity;
    switch (activityType) {
      case ActivityType.SELECT:
        instance = new SelectActivity(activityDescription, components, label);
        break;
      case ActivityType.SELECT_OPTIONS:
        instance = new SelectOptionsActivity(activityDescription, components, label, activityOptions);
        break;
      case ActivityType.REPAIR:
      default:
        instance = new RepairActivity(
          activityDescription,
          components,
          label,
          Boolean(activity?.checkRepair ?? activity?.checkRepairComponents),
          Task.normalizeComponentContainsConstraints(activity?.repairChecks ?? activity?.componentContainsConstraints)
        );
    }
    instance.substituteAfterActivity = substituteAfterActivity;
    return instance;
  }

  public static createFinish(
    finishType: FinishType,
    finish: any,
    fallbackDescription?: string
  ): IFinish {
    const description = finish?.description ?? fallbackDescription;
    const label = finish?.label;
    let taskFinish: IFinish;

    switch (finishType) {
      case FinishType.AFTER_DATABASE_UPDATE:
        taskFinish = new AfterDatabaseUpdateFinish(
          description,
          label,
          finish?.checkQuery ?? finish?.query ?? ""
        );
        break;
      case FinishType.SELECT_OPTIONS:
        taskFinish = new SelectOptionsFinish(
          description,
          label,
          Task.normalizeOptions(finish?.options)
        );
        break;
      case FinishType.TYPE_CORRECT:
        taskFinish = new TypeCorrectFinish(description, finish?.correctAnswer ?? "", label);
        break;
      case FinishType.VARIABLE_CONSTRAINT:
        taskFinish = new VariableConstraintFinish(
          description,
          label,
          Array.isArray(finish?.constraints) ? finish.constraints : []
        );
        break;
      case FinishType.IMMEDIATE:
      default:
        taskFinish = new ImmediateFinish(description, label);
    }

    taskFinish.isComplete = Boolean(finish?.isComplete);
    return taskFinish;
  }

  private static normalizeOptions(data: any): Option[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((option: any) => ({
      id: String(option?.id ?? Task.createOptionId()),
      text: option?.text ?? "",
      isCorrect: Boolean(option?.isCorrect)
    }));
  }

  private static createOptionId(): string {
    const cryptoApi = globalThis.crypto as Crypto | undefined;
    if (cryptoApi?.randomUUID) {
      return cryptoApi.randomUUID();
    }

    return `option-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private static normalizeComponentContainsConstraints(data: any): ComponentContainsConstraint[] {
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((constraint: any) => ({
      id: constraint?.id ? String(constraint.id) : undefined,
      componentId: String(constraint?.componentId ?? ''),
      componentName: constraint?.componentName ?? undefined,
      operator: constraint?.operator === 'not-contains' ? 'not-contains' : 'contains',
      text: String(constraint?.text ?? '')
    }))
  }

  private static parseActivityType(value: unknown): ActivityType {
    if (value === ActivityType.SELECT || value === ActivityType.SELECT_OPTIONS || value === ActivityType.REPAIR) {
      return value;
    }

    return ActivityType.REPAIR;
  }

  private static parseFinishType(value: unknown): FinishType {
    if (
      value === FinishType.IMMEDIATE ||
      value === FinishType.AFTER_DATABASE_UPDATE ||
      value === FinishType.SELECT_OPTIONS ||
      value === FinishType.TYPE_CORRECT ||
      value === FinishType.VARIABLE_CONSTRAINT
    ) {
      return value;
    }

    return FinishType.IMMEDIATE;
  }

  private static parseStatus(value: unknown): TaskStatus {
    if (value === TaskStatus.IN_PROGRESS || value === "active") {
      return TaskStatus.IN_PROGRESS;
    }

    if (value === TaskStatus.COMPLETED || value === "completed") {
      return TaskStatus.COMPLETED;
    }

    return TaskStatus.NOT_STARTED;
  }

}
