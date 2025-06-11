export interface Transaction {
    id: number;
    customerId: number;
    status: string;
    amount: number;
    tellerName: string;
}

export let transaction: Transaction[] = [];