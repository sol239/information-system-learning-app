import initSqlJs from 'sql.js';

class DbHandler {

    private db: any;

    constructor() {
        this.db = null;
        this.init();

    }

    public init(): void {
        initSqlJs().then((SQL: { Database: new () => any; }) => {
            this.db = new SQL.Database();
            
            this.db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");

            this.db.run("")

            this.db.run("")

            
        });
    }



}