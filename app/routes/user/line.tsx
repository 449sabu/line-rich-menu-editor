import { useEffect, useId, useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { Route } from './+types/line';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export async function loader({ context }: Route.LoaderArgs) {
	const r2 = context.cloudflare.env.OGAWANOUEN_R2;
	const richMenu = await r2.list();
	return { richMenu };
}

export async function action({ request, context }: Route.ActionArgs) {
	const r2 = context.cloudflare.env.OGAWANOUEN_R2;
	const formData = await request.formData();
	const file = formData.get('picture') as File | null;

	if (!file) {
		return { error: 'ファイルが選択されていません。' };
	}

	// ファイル形式チェック
	const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
	if (!validTypes.includes(file.type)) {
		return { error: 'JPEGまたはPNG形式のファイルを選択してください。' };
	}

	// ファイルサイズチェック
	if (file.size > MAX_FILE_SIZE) {
		return { error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / (1024 * 1024)}MBまでです。` };
	}

	try {
		// ファイル名を生成（タイムスタンプ + 元のファイル名）
		const timestamp = Date.now();
		const extension = file.name.split('.').pop();
		const fileName = `rich-menu-${timestamp}.${extension}`;

		// R2にアップロード
		await r2.put(fileName, file.stream(), {
			httpMetadata: {
				contentType: file.type,
			},
		});

		return { success: true, fileName };
	} catch (error) {
		console.error('R2アップロードエラー:', error);
		return { error: 'ファイルのアップロードに失敗しました。' };
	}
}

export default function RichMenu({ loaderData }: Route.ComponentProps) {
	const pictureId = useId();
	const { richMenu } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const [fileError, setFileError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const isSubmitting = navigation.state === 'submitting';

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	// アップロード成功時にフォームをリセット
	useEffect(() => {
		if (actionData?.success) {
			setPreviewUrl(null);
			setSelectedFile(null);
			setFileError(null);
			// ファイル入力もリセット
			const fileInput = document.getElementById(pictureId) as HTMLInputElement;
			if (fileInput) {
				fileInput.value = '';
			}
		}
	}, [actionData?.success, pictureId]);

	// ファイル選択時の処理
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setPreviewUrl(null);
			setSelectedFile(null);
			return;
		}

		// ファイル形式チェック
		const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
		if (!validTypes.includes(file.type)) {
			setFileError('JPEGまたはPNG形式のファイルを選択してください。');
			e.target.value = '';
			setPreviewUrl(null);
			setSelectedFile(null);
			return;
		}

		// ファイルサイズチェック
		if (file.size > MAX_FILE_SIZE) {
			setFileError(`ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / (1024 * 1024)}MBまでです。`);
			e.target.value = '';
			setPreviewUrl(null);
			setSelectedFile(null);
		} else {
			setFileError(null);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			setSelectedFile(file);
		}
	};

	const isValidFile = selectedFile && !fileError;

	console.log(richMenu);
	return (
		<div>
			<Form method="post" encType="multipart/form-data">
				<Label htmlFor={pictureId}>Picture</Label>
				<Input
					id={pictureId}
					type="file"
					name="picture"
					accept="image/jpeg,image/png"
					onChange={handleFileChange}
					disabled={isSubmitting}
				/>
				{fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
				{actionData?.error && <p className="text-red-500 text-sm mt-1">{actionData.error}</p>}
				{actionData?.success && <p className="text-green-500 text-sm mt-1">アップロード成功: {actionData.fileName}</p>}
				{previewUrl && (
					<div className="mt-4">
						<img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-96 rounded" />
					</div>
				)}
				<div className="mt-4">
					<Button type="submit" disabled={!isValidFile || isSubmitting}>
						{isSubmitting ? 'アップロード中...' : 'アップロード'}
					</Button>
				</div>
			</Form>
		</div>
	);
}
