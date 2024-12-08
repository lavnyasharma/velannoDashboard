import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { capitalizeFirstLetter } from 'src/utils/helper';

const DiscountModalComponent = ({ modalTitle, itemDiscount, is_diamond, open, handleCloseDiscountModal, cartItemId, onDiscountUpdate }) => {
    const [discounts, setDiscounts] = useState([]); // To store the discounts
    const [selectedDiscount, setSelectedDiscount] = useState(itemDiscount); // To store the selected discount
    const silver = !is_diamond;
    const diamond = is_diamond;

    // Fetch discounts when the component mounts or on certain dependencies (like open)
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await axiosInstance.get(
                    `/discounts/?is_silver=${silver}&is_diamond=${diamond}`
                );
                setDiscounts(response.data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            }
        };

        fetchDiscounts();
    }, [open, diamond, silver]);

    // Handle discount selection and API call to update cart item
    const handleDiscountChange = async (event) => {
        const selectedDiscountId = event.target.value;
        setSelectedDiscount(selectedDiscountId);

        try {
            // Send the PATCH request to update the cart item's discount
            await axiosInstance.patch(`/cart-items/${cartItemId}/update/`, { discount: selectedDiscountId });

            // Close the modal after successful update
            handleCloseDiscountModal();

            // Call parent callback to re-render the parent's parent if provided
            if (onDiscountUpdate) {
                onDiscountUpdate();
            }
        } catch (error) {
            console.error('Error updating discount for cart item:', error);
        }
    };

    return (
        <Dialog open={open} fullWidth onClose={handleCloseDiscountModal}>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogContent>
                <Box mb={2}>
                    <FormControl sx={{ mt: 2 }} fullWidth>
                        <InputLabel id="discount-select-label">Discount</InputLabel>
                        <Select
                            labelId="discount-select-label"
                            value={selectedDiscount}
                            onChange={handleDiscountChange}
                            label="Discount"
                        >
                            <MenuItem value={null}>
                                Remove Discount
                            </MenuItem>
                            {discounts.map((discount, index) => (
                                <MenuItem key={index} value={discount.id}>
                                    {`${capitalizeFirstLetter(discount.title)} - ${discount.percentage}%`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default DiscountModalComponent;
