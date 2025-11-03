import { NavLink } from 'react-router';

export function Navigation() {
	const navigationLinks = [
		{ to: '/', label: 'Home' },
		{ to: '/user/dashboard', label: 'Dashboard' },
		{ to: '/user/settings', label: 'Settings' },
		{ to: '/user/rich-menu', label: 'Rich Menu' },
	];
	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 flex justify-center gap-4 items-center px-4 py-2">
			{navigationLinks.map((link) => (
				<NavLink
					key={link.to}
					to={link.to}
					className={({ isActive, isPending, isTransitioning }) =>
						[
							isPending ? 'pending' : '',
							isActive ? 'text-blue-500 font-bold' : '',
							isTransitioning ? 'transitioning' : '',
						].join('')
					}
				>
					{link.label}
				</NavLink>
			))}
		</nav>
	);
}
