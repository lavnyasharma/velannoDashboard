import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, TableRow, TableCell, Autocomplete, Typography } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { toast } from 'src/components/snackbar';


const CouponCodeComponent = ({ couponData, disable, onDataUpdate }) => {
    const [couponCode, setCouponCode] = useState('');
    const [coupons, setCoupons] = useState([]);
    const [selectedCouponId, setSelectedCouponId] = useState(null); // Store only the coupon id
    const handleApplyCoupon = async (coupon) => {

        try {
            // Send the put request to update the cart franchise discount
            await axiosInstance.put(`cart/update/`,
                {
                    applied_coupons: coupon
                });
            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                // Show a toast notification for validation error
                toast.error(`Error: ${error.response.data.detail}`,);
            } else {
                // Handle other types of errors, such as network errors
                toast.error('Something went wrong. Please try again later.', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000,
                });
            }
        }
    };
    // Fetch coupons based on the search term
    useEffect(() => {
        if (couponCode) {
            // Make API call to search coupons
            axiosInstance.get(`/counter-coupon/?search=${couponCode}`)
                .then(response => {
                    setCoupons(response.data.results);
                })
                .catch(error => {
                    console.error("Error fetching coupons:", error);
                    setCoupons([]);
                });
        } else {
            setCoupons([]);
        }
        if (couponData && selectedCouponId === null) {
            setCouponCode(couponData.code)
            setCoupons([couponData])
            setSelectedCouponId(couponData.id)
        }
    }, [couponCode, couponData, selectedCouponId]);

    // Handle applying the selected coupon

    // Handle deleting the selected coupon
    const handleDeleteCoupon = () => {
        setSelectedCouponId(null);
        setCouponCode('');
    };

    return (
        <TableRow>
            <TableCell>Coupon Code</TableCell>
            <TableCell>

                <Autocomplete
                    disabled={disable}
                    value={coupons.find(coupon => coupon.id === selectedCouponId) || null}
                    onChange={(e, newValue) => {
                        setSelectedCouponId(newValue ? newValue.id : null);
                        handleApplyCoupon(newValue ? newValue.id : null)
                    }}
                    options={coupons}
                    getOptionLabel={(option) => option.code}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                        <li {...props} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                            <Typography variant="body1">{option.code} - {option.title} - {option.percentage}%</Typography>
                            <Typography variant="body2" color="textSecondary">{option.description || 'No description available'}</Typography>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Enter Coupon Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            fullWidth
                        />
                    )}
                    noOptionsText="No coupons found"
                />
            </TableCell>
        </TableRow>
    );
};

export default CouponCodeComponent;
