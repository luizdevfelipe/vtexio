export async function githubUserHandler(ctx: Context, next: () => Promise<any>) {
    const { username } = ctx.vtex.route.params;

    try {
        const response = await ctx.clients.github.getUser(username as string);
        ctx.status = 200;
        ctx.body = response;
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { message: 'Erro ao buscar dados do usuário no GitHub', error: error.message };
    }

    await next();
}