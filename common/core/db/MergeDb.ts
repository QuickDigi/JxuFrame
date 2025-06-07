import fs from 'fs';

interface Row {
    [key: string]: any;
}

interface Table {
    name: string;
    columns: string[];
    rows: Row[];
}

let ColorPMV = {
    Green: "\x1b[32m",
    SkyBlue: "\x1b[36m",
    White: "\x1b[37m",
    Yellow: "\x1b[33m",
    Red: "\x1b[31m",
    Font: {
        Bold: "\x1b"
    },
    Reset: "\x1b[0m"
}

class MergeDb {
    private dblc: string;
    private dbname: string;
    private debugging: boolean;
    private err: { x: boolean; errType: string };

    constructor(dbLocation: string, dbName: string, debugging: boolean) {
        this.dblc = dbLocation;
        this.dbname = dbName;
        this.debugging = debugging;
        this.err = { x: false, errType: "" };

        // التحقق من وجود المسار
        if (!this.dblc) {
            this.err = { ...this.err, x: true, errType: "ERROR_SYNTAX" };
            throw new Error(`ERROR SYNTAX: ADD DATABASE PATH`);
        }

        // التأكد إن الامتداد .json
        if (!this.dblc.endsWith(".json")) {
            this.err = { ...this.err, x: true, errType: "ERROR_DBFILE_NJSON" };
            throw new Error("THIS DATABASE FILE NOT ENDSWITH <*.json>");
        }

        // إنشاء الملف إذا مش موجود
        if (!fs.existsSync(this.dblc)) {
            try {
                fs.writeFileSync(
                    this.dblc,
                    JSON.stringify({
                        [this.dbname]: {
                            name: [this.dbname],
                            columns: [],
                            rows: [],
                        }
                    }, null, 2)
                );
                if (this.debugging)
                    console.info(
                        "\x1b[36m[DB Created]\x1b[0m",
                        `Created database file "${this.dblc}" with base "${this.dbname}"`
                    );
            } catch (e) {
                this.err = { ...this.err, x: true, errType: "ERROR_FILE_WRITE" };
                if (this.debugging) console.error("Error creating DB:", e);
                throw e;
            }
        } else {
            // حتى لو الملف موجود، نعيد تهيئته بالdbname
            try {
                const content = fs.readFileSync(this.dblc, "utf8");
                const data = JSON.parse(content);
                if (!data[this.dbname]) {
                    data[this.dbname] = {};
                    fs.writeFileSync(this.dblc, JSON.stringify(data, null, 2));
                    if (this.debugging)
                        console.info(
                            "\x1b[36m[DB Updated]\x1b[0m",
                            `Initialized "${this.dbname}" in existing database`
                        );
                }
            } catch (e) {
                this.err = { ...this.err, x: true, errType: "ERROR_FILE_UPDATE" };
                if (this.debugging) console.error("Error updating DB:", e);
                throw e;
            }
        }
    }

    // SELECT Method
    public async SELECT(DatabasePath: string, dbname: string): Promise<Table> {
        if (this.err?.x) {
            throw new Error("Database error flag is set.");
        }

        try {
            if (DatabasePath) this.dblc = DatabasePath;

            const fullData = JSON.parse(fs.readFileSync(this.dblc, "utf8"));
            const data: Table = fullData[dbname];

            if (!data) {
                throw new Error(`Database "${dbname}" not found in file.`);
            }

            if (this.debugging) {
                console.info(
                    `${ColorPMV.Green}${ColorPMV.Font.Bold}SSELECTED ` +
                    `${ColorPMV.SkyBlue}"${this.dblc}"` +
                    ` With \`${dbname}\`${ColorPMV.Reset}`
                );
            }

            return data;
        } catch (error: any) {
            if (this.debugging) {
                console.error(`${ColorPMV.Font.Bold}\x1b[31m[ERROR] ${error.message}${ColorPMV.Reset}`);
            }
            throw error;
        }
    }

    // INSERT Method
    public async INSERT(tableName: string, newRow: Row): Promise<Table> {
        try {
            const fullData = JSON.parse(fs.readFileSync(this.dblc, "utf8"));
            const table: Table = fullData[tableName];

            if (!table || !table.columns) {
                throw new Error(`Table "${tableName}" or columns not found.`);
            }

            // Validate if the newRow contains all required columns
            for (const column of table.columns) {
                if (!(column in newRow)) {
                    throw new Error(`Missing value for column "${column}" in the new row.`);
                }
            }

            // Insert the new row
            table.rows.push(newRow);

            // Update the database with the new row
            fullData[tableName] = table;
            fs.writeFileSync(this.dblc, JSON.stringify(fullData, null, 2), "utf8");

            if (this.debugging) {
                console.info(
                    `${ColorPMV.Green}${ColorPMV.Font.Bold}INSERTED ` +
                    `${ColorPMV.SkyBlue}"${newRow}"` +
                    ` into table \`${tableName}\`${ColorPMV.Reset}`
                );
            }

            return table;

        } catch (error: any) {
            if (this.debugging) {
                console.error(`${ColorPMV.Font.Bold}\x1b[31m[ERROR] ${error.message}${ColorPMV.Reset}`);
            }
            throw error;
        }
    }
    public async GET(x: string) {
        try {
            const fileData = await fs.promises.readFile(this.dblc, "utf8");
            if (this.debugging) {
                console.log("Raw file data:", fileData);
            }
            const parsedData = JSON.parse(fileData);
            if (this.debugging) {
                console.log("Parsed JSON:", parsedData);
            }
            return parsedData["users"]?.[x || "rows"] ?? []; // Ensures correct path and returns an array safely
        } catch (error) {
            console.error("Error fetching data:", error);
            return []; // Prevent undefined errors
        }
    }
}

const tDb = new MergeDb("./dbx.json", "users", true);
// tDb.SELECT("", "users");
(async () => {

    // SELECT Before Insert
    let usersTable = await tDb.SELECT("./dbx.json", "users");
    console.log("\nBefore INSERT:", usersTable);
    // INSERT the new row
    const data = await tDb.GET("rows");
    data.forEach((e: any) => {
        console.log(e);
    });
})();
// ./dbx.json