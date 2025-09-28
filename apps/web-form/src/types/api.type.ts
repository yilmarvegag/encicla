export interface ResponseData<T> {
    type?: string;
    title?: string;
    status?: number;
    instance?: string;
    message?: string;
    data: T;
    errors?: string[];
    details?: string;
}