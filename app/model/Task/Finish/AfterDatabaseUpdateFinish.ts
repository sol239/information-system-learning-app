import type { IFinish } from "./IFinish";
import { OperationResultType } from "../../../utils/Operation/OperationResultType";
import type { DatabaseWrapper } from "../../../utils/DatabaseWrapper";

export class AfterDatabaseUpdateFinish implements IFinish {

    public isComplete: boolean = false;
    
    constructor(
            public description: string | undefined,
            public label?: string,
            public checkQuery: string = "",
        ) { }
    
    public async evaluate(input?: unknown): Promise<boolean> {
        const db = input as DatabaseWrapper | null | undefined;
        const query = this.checkQuery.trim();

        if (!db || !query || !/^select\b/i.test(query)) {
            //console.log('[AfterDatabaseUpdateFinish.evaluate] invalid setup. db:', !!db, '| query:', query, '🔴');
            this.isComplete = false;
            return this.isComplete;
        }

        await db.initializeDatabase();
        const result = await db.query(query);
        const rows = Array.isArray(result.data)
            ? result.data.flatMap(resultSet => resultSet.values ?? [])
            : [];

        this.isComplete = result.result === OperationResultType.SUCCESS && rows.length > 0;
        
        //console.log('[AfterDatabaseUpdateFinish.evaluate] query executed:', query, '| result:', result.result, '| rowCount:', rows.length, this.isComplete ? '🟢' : '🔴');

        return this.isComplete;
    }
}
