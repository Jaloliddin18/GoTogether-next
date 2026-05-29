import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BOOK_INVENTORY } from '../../../../apollo/admin/mutation';
import { BookInventoryType, BookStorageZone } from '../../../enums/book-inventory.enum';
import { Book } from '../../../types/book/book';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../sweetAlert';

interface ShelfConfig {
	section: string;
	row: string;
	level: string;
	slot: string;
	floorId: string;
	x: number;
	y: number;
	theta: number;
	inventoryType: BookInventoryType;
}

const SHELF_MAP: Record<string, ShelfConfig> = {
	'LIB-1': { section: 'LIB', row: '1', level: '1', slot: 'LIB-1', floorId: 'floor_1', x: 56, y: 24, theta: 90, inventoryType: BookInventoryType.LIBRARY },
	'LIB-2': { section: 'LIB', row: '2', level: '1', slot: 'LIB-2', floorId: 'floor_1', x: 116, y: 24, theta: 90, inventoryType: BookInventoryType.LIBRARY },
	'LIB-3': { section: 'LIB', row: '3', level: '1', slot: 'LIB-3', floorId: 'floor_1', x: 176, y: 24, theta: 90, inventoryType: BookInventoryType.LIBRARY },
	'COM-4': { section: 'COM', row: '4', level: '1', slot: 'COM-4', floorId: 'floor_1', x: 292, y: 24, theta: 90, inventoryType: BookInventoryType.COMMERCIAL },
	'COM-5': { section: 'COM', row: '5', level: '1', slot: 'COM-5', floorId: 'floor_1', x: 352, y: 24, theta: 90, inventoryType: BookInventoryType.COMMERCIAL },
	'COM-6': { section: 'COM', row: '6', level: '1', slot: 'COM-6', floorId: 'floor_1', x: 412, y: 24, theta: 90, inventoryType: BookInventoryType.COMMERCIAL },
};

const STORAGE_ZONE_MAP: Record<BookInventoryType, BookStorageZone> = {
	[BookInventoryType.LIBRARY]: BookStorageZone.LIBRARY_SHELF,
	[BookInventoryType.COMMERCIAL]: BookStorageZone.COMMERCIAL_WAREHOUSE,
};

const DEFAULT_PICKUP = {
	gripperOpenWidthCm: 12,
	gripperCloseWidthCm: 6,
	gripHoldSeconds: 2,
	pickupDirection: 'FRONT',
};

interface Props {
	book: Book;
	onClose: () => void;
	onSuccess: () => void;
}

const AddInventoryModal: React.FC<Props> = ({ book, onClose, onSuccess }) => {
	const [inventoryType, setInventoryType] = useState<BookInventoryType>(BookInventoryType.LIBRARY);
	const [shelfSlot, setShelfSlot] = useState<string>('LIB-1');
	const [totalQuantity, setTotalQuantity] = useState<string>('1');
	const [submitting, setSubmitting] = useState(false);

	const [createBookInventory] = useMutation(CREATE_BOOK_INVENTORY);

	const availableSlots = Object.keys(SHELF_MAP).filter((k) => SHELF_MAP[k].inventoryType === inventoryType);
	const selectedShelf = SHELF_MAP[shelfSlot];

	const handleTypeChange = (type: BookInventoryType) => {
		setInventoryType(type);
		const first = Object.keys(SHELF_MAP).find((k) => SHELF_MAP[k].inventoryType === type);
		if (first) setShelfSlot(first);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const qty = parseInt(totalQuantity, 10);
		if (!qty || qty < 1 || !selectedShelf) return;

		setSubmitting(true);
		try {
			await createBookInventory({
				variables: {
					input: {
						bookId: book._id,
						bookInventoryType: inventoryType,
						bookStorageZone: STORAGE_ZONE_MAP[inventoryType],
						bookTotalQuantity: qty,
						bookShelf: {
							section: selectedShelf.section,
							row: selectedShelf.row,
							level: selectedShelf.level,
							slot: selectedShelf.slot,
						},
						bookLocation: {
							floorId: selectedShelf.floorId,
							x: selectedShelf.x,
							y: selectedShelf.y,
							theta: selectedShelf.theta,
						},
						bookPickup: DEFAULT_PICKUP,
					},
				},
			});
			onSuccess();
			onClose();
			await sweetMixinSuccessAlert('Inventory created');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="admin-modal-overlay" onClick={onClose}>
			<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
				<div className="admin-modal-header">
					<h2 className="admin-modal-title">Add Inventory</h2>
					<button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
						✕
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="admin-modal-body">
						<div className="admin-field">
							<label className="admin-field-label">Book</label>
							<input className="admin-input" value={book.bookTitle} readOnly />
						</div>
						<div className="admin-field-grid">
							<div className="admin-field">
								<label className="admin-field-label">Inventory Type</label>
								<select
									className="admin-select"
									value={inventoryType}
									onChange={(e) => handleTypeChange(e.target.value as BookInventoryType)}
								>
									<option value={BookInventoryType.LIBRARY}>Library</option>
									<option value={BookInventoryType.COMMERCIAL}>Commercial</option>
								</select>
							</div>
							<div className="admin-field">
								<label className="admin-field-label">Shelf Slot</label>
								<select
									className="admin-select"
									value={shelfSlot}
									onChange={(e) => setShelfSlot(e.target.value)}
								>
									{availableSlots.map((slot) => (
										<option key={slot} value={slot}>
											{slot}
										</option>
									))}
								</select>
							</div>
						</div>
						{selectedShelf && (
							<div className="admin-inventory-location">
								<div className="admin-field-label">Location (auto-filled)</div>
								<div className="admin-inventory-location-grid">
									<span>Floor: {selectedShelf.floorId}</span>
									<span>x: {selectedShelf.x}</span>
									<span>y: {selectedShelf.y}</span>
									<span>θ: {selectedShelf.theta}°</span>
								</div>
							</div>
						)}
						<div className="admin-field" style={{ maxWidth: 160 }}>
							<label className="admin-field-label">Total Quantity</label>
							<input
								type="number"
								className="admin-input"
								min={1}
								value={totalQuantity}
								onChange={(e) => setTotalQuantity(e.target.value)}
								required
							/>
						</div>
					</div>
					<div className="admin-modal-footer">
						<button type="button" className="admin-btn admin-btn--ghost" onClick={onClose} disabled={submitting}>
							Cancel
						</button>
						<button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
							{submitting ? 'Creating…' : 'Create Inventory'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddInventoryModal;
