import { Outlet, redirect } from 'react-router';
// import { Navigation } from '~/components/navigation/navigation';
import { validateSessionToken } from '~/lib/cookie';
import type { Route } from './+types/layout';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { AppSidebar } from '~/components/navigation/sidebar';
import { authClient } from '~/lib/auth.client';

async function authMiddleware({ request }: Route.LoaderArgs, next: Parameters<Route.MiddlewareFunction>[1]) {
	const sessionToken = validateSessionToken(request);

	if (!sessionToken?.token) {
		return redirect('/auth/signin');
	}

	const response = await next();
	console.log(response.status, '\u001b[32m' + request.method + '\u001b[0m', request.url);
	// レスポンスを返す（必須）
	return response;
}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];


export async function clientLoader() {
	const { data: session } = await authClient.getSession();
	console.log(session);
	if (!session) {
		throw redirect('/auth/signin');
	}
	return { user:{ name: session.user.name, email: session.user.email, avatar: session.user.image } };
}

export default function UserLayout({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<main>
				<SidebarTrigger />
				<Outlet />
				{/* <Navigation /> */}
			</main>
			{/* <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="flex w-full max-w-sm flex-col gap-6">
					<Outlet />
					<Navigation />
				</div>
			</div> */}
		</SidebarProvider>
	);
}
