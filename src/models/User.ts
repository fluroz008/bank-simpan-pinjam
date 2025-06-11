export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

export let users: User[] = [];