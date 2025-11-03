import { useId } from 'react';
import type { Route } from './+types/rich-menu';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export async function loader({ context }: Route.LoaderArgs) {
    const r2 = context.cloudflare.env.OGAWANOUEN_R2;
    // await r2.put('test.json', 'test data');

	const richMenu = await r2.list();
	return { richMenu };
}

export default function RichMenu({ loaderData }: Route.ComponentProps) {
	const pictureId = useId();
	const { richMenu } = loaderData;
	console.log(richMenu);
	return (
		<div>
			RichMenuPage
			<Label htmlFor="picture">Picture</Label>
			<Input id={pictureId} type="file" name="picture"/>
		</div>
	);
}