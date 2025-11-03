import { index, layout, prefix, type RouteConfig, route } from '@react-router/dev/routes';

export default [
	layout('routes/layout.tsx', [
		index('routes/home.tsx'),
		route('/api/auth/*', 'routes/api-auth.tsx'),
		...prefix('user', [
			layout('routes/user/layout.tsx', [
				route('/dashboard', 'routes/user/dashboard.tsx'),
				route('/settings', 'routes/user/settings.tsx'),
				route('/rich-menu', 'routes/user/rich-menu.tsx'),
			]),
		]),
		layout('routes/auth/layout.tsx', [
			...prefix('auth', [route('/signup', 'routes/auth/signup.tsx'), route('/signin', 'routes/auth/signin.tsx')]),
		]),
	]),
] satisfies RouteConfig;
