export type RecordEntry = {
    name: string;
    moves: number;
    time: number; // in seconds
    date: string;
};

export type RecordsData = {
    [disks: number]: RecordEntry[];
};

const STORAGE_KEY = 'torre_hanoi_records';
const MAX_RECORDS_PER_LEVEL = 10;

export class RecordsManager {
    private records: RecordsData = {};

    constructor() {
        this.loadRecords();
    }

    private loadRecords(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.records = JSON.parse(stored);
            } else {
                this.records = this.getDefaultRecords();
            }
        } catch (e) {
            console.error('Failed to load records:', e);
            this.records = this.getDefaultRecords();
        }
    }

    private getDefaultRecords(): RecordsData {
        // Initialize empty records for each disk count
        const defaults: RecordsData = {};
        for (let i = 3; i <= 8; i++) {
            defaults[i] = [];
        }
        return defaults;
    }

    private saveRecords(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
        } catch (e) {
            console.error('Failed to save records:', e);
        }
    }

    public addRecord(disks: number, name: string, moves: number, time: number): boolean {
        if (!this.records[disks]) {
            this.records[disks] = [];
        }

        const entry: RecordEntry = {
            name: name.trim() || 'Anônimo',
            moves,
            time,
            date: new Date().toLocaleDateString('pt-BR')
        };

        // Check if this is a new record
        const isNewRecord = this.isNewRecord(disks, moves, time);

        // Add to records
        this.records[disks].push(entry);

        // Sort by moves first, then by time
        this.records[disks].sort((a, b) => {
            if (a.moves !== b.moves) return a.moves - b.moves;
            return a.time - b.time;
        });

        // Keep only top 10
        this.records[disks] = this.records[disks].slice(0, MAX_RECORDS_PER_LEVEL);

        this.saveRecords();

        return isNewRecord;
    }

    public isNewRecord(disks: number, moves: number, time: number): boolean {
        const diskRecords = this.records[disks] || [];

        if (diskRecords.length < MAX_RECORDS_PER_LEVEL) return true;

        // Compare with worst record in top 10
        const worstRecord = diskRecords[diskRecords.length - 1];
        if (moves < worstRecord.moves) return true;
        if (moves === worstRecord.moves && time < worstRecord.time) return true;

        return false;
    }

    public getRecords(disks: number): RecordEntry[] {
        return this.records[disks] || [];
    }

    public getMinMoves(disks: number): number {
        // Optimal solution for Tower of Hanoi is 2^n - 1
        return Math.pow(2, disks) - 1;
    }

    public clearRecords(): void {
        this.records = this.getDefaultRecords();
        this.saveRecords();
    }
}
