import { ExternalClient, IOContext } from "@vtex/api";

export default class GitHubClient extends ExternalClient {
    constructor(context: IOContext) {
        super('https://api.github.com', context);
    }

    public getUser = (username: string) => {
        return this.http.get(`/users/${username}`);
    }

    public getRepos = (username: string) => {
        return this.http.get(`/users/${username}/repos`);
    }
}