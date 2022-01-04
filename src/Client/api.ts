import got, { CancelableRequest, Response } from "got/dist/source";
import { ToFix } from "../common";

export class ApiService {
    constructor(private apiLocation: string) { }

    getFixes(guildId: string, authorId: string): CancelableRequest<ToFix[]> {
        return got.get(`${this.apiLocation}/fix/${guildId}/${authorId}`).json();
    }

    createFix(payload: ToFix): CancelableRequest<ToFix> {
        return got.post(`${this.apiLocation}/fix`, { json: payload }).json();
    }

    deleteFix(messageId: string): CancelableRequest<Response<{ affected?: number | null }>> {
        return got.delete(`${this.apiLocation}/fix/${messageId}`) as CancelableRequest<Response<{ affected?: number | null }>>;
    }
}