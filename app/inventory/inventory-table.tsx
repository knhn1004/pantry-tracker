'use client';

import { useEffect, useState } from 'react';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	SortingState,
	getSortedRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Trash2, Carrot, RefreshCw } from 'lucide-react';
import UseItemDialog from './use-item-dialog';
import TrashItemDialog from './trash-item-dialog';
import { consumeInventoryItem, removeInventoryItem } from '@/lib/actions/items';
import { revalidateInventory } from '@/lib/actions/revalidate';
import { toast } from '@/components/ui/use-toast';

export type InventoryItem = {
	id: string;
	itemName: string;
	quantity: number;
	unit: string;
	location: string;
	expirationDate: string;
	category: string;
};

export default function InventoryTable({ data }: { data: InventoryItem[] }) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [refreshing, setRefreshing] = useState(false);

	// use item dialog & remove item dialog
	const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
	const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

	const handleRefresh = async () => {
		setRefreshing(true);
		// Simulate a delay for refreshing
		await revalidateInventory();
		setRefreshing(false);
	};

	useEffect(() => {
		if (refreshing) {
			toast({
				title: 'Refreshing inventory...',
				description: 'Please wait a moment.',
			});
		}
	}, [refreshing]);

	const columns: ColumnDef<InventoryItem>[] = [
		{
			accessorKey: 'itemName',
			header: 'Item Name',
			cell: ({ row }) => <div>{row.getValue('itemName')}</div>,
		},
		{
			accessorKey: 'category',
			header: 'Category',
			cell: ({ row }) => (
				<Badge variant="outline">{row.getValue('category') || 'N/A'}</Badge>
			),
		},
		{
			accessorKey: 'quantity',
			header: 'Quantity',
			cell: ({ row }) => <div>{row.getValue('quantity')}</div>,
		},
		{
			accessorKey: 'unit',
			header: 'Unit',
			cell: ({ row }) => <div>{row.getValue('unit') || '-'}</div>,
		},
		{
			accessorKey: 'location',
			header: 'Location',
			cell: ({ row }) => <div>{row.getValue('location') || '-'}</div>,
		},
		{
			accessorKey: 'expirationDate',
			header: 'Expiration Date',
			cell: ({ row }) => {
				const date = row.getValue('expirationDate') as string;
				return date ? (
					<Badge variant={getExpirationBadgeVariant(date)}>
						{new Date(date).toLocaleDateString()}
					</Badge>
				) : (
					<Badge variant="outline">-</Badge>
				);
			},
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleUseItem(item)}
						>
							<Carrot className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleTrashItem(item)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	const handleUseItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsUseDialogOpen(true);
	};
	const handleConfirmUse = async (quantity: number) => {
		if (selectedItem) {
			await consumeInventoryItem(selectedItem.id, quantity);
		}
	};

	const handleConfirmRemove = async () => {
		if (selectedItem) {
			await removeInventoryItem(selectedItem.id);
			setIsRemoveDialogOpen(false);
		}
	};

	const handleTrashItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsRemoveDialogOpen(true);
	};

	return (
		<>
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter items..."
					value={
						(table.getColumn('itemName')?.getFilterValue() as string) ?? ''
					}
					onChange={event =>
						table.getColumn('itemName')?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<Button
					variant="outline"
					size="icon"
					onClick={handleRefresh}
					className="ml-2"
				>
					<RefreshCw className="h-4 w-4" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter(column => column.getCanHide())
							.map(column => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={value => column.toggleVisibility(!!value)}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
			<UseItemDialog
				isOpen={isUseDialogOpen}
				onClose={() => setIsUseDialogOpen(false)}
				onConfirm={handleConfirmUse}
				itemName={selectedItem?.itemName || ''}
				maxQuantity={selectedItem?.quantity || 0}
			/>
			<TrashItemDialog
				isRemoveDialogOpen={isRemoveDialogOpen}
				setIsRemoveDialogOpen={setIsRemoveDialogOpen}
				selectedItem={selectedItem}
				handleConfirmRemove={handleConfirmRemove}
			/>
		</>
	);
}

function getExpirationBadgeVariant(
	date: string
): 'outline' | 'secondary' | 'destructive' {
	const expirationDate = new Date(date);
	const today = new Date();
	const diffTime = expirationDate.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return 'destructive';
	} else if (diffDays <= 7) {
		return 'secondary';
	} else {
		return 'outline';
	}
}
