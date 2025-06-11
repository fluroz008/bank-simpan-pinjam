export interface Customer {
    id: number;
    fullName: string;
    address: string;
    birthDate: Date;
    nik: string;
    deleted: Boolean;
}

export let customers: Customer[] = [];