import React, { useState } from 'react';
import { Card, Box, Stack, Typography, Divider, Button, ButtonGroup } from '@mui/material';
import { fCurrency } from 'src/utils/format-number';


const SummaryCard = ({ category }) => {
    const [summaryType, setSummaryType] = useState('Total');

    const handleSummaryChange = (type) => {
        setSummaryType(type);
    };

    const getSummaryContent = () => {
        const summaries = {
            Diamond: {
                itemsLeft: category.diamond_summary.diamond_total_left,
                itemsAssigned: category.diamond_summary.diamond_total_assigned,
                priceLeft: fCurrency(category.diamond_summary.diamond_total_price_left),
                priceAssigned: fCurrency(category.diamond_summary.diamond_total_price_assigned),
                weightLeft: `${category.diamond_summary.diamond_total_weight_left}g`,
                weightAssigned: `${category.diamond_summary.diamond_total_weight_assigned}g`,
            },
            Silver: {
                itemsLeft: category.silver_summary.silver_total_left,
                itemsAssigned: category.silver_summary.silver_total_assigned,
                priceLeft: fCurrency(category.silver_summary.silver_total_price_left),
                priceAssigned: fCurrency(category.silver_summary.silver_total_price_assigned),
                weightLeft: `${category.silver_summary.silver_total_weight_left}g`,
                weightAssigned: `${category.silver_summary.silver_total_weight_assigned}g`,
            },
            Total: {
                itemsLeft: category.silver_summary.silver_total_left + category.diamond_summary.diamond_total_left,
                itemsAssigned: category.silver_summary.silver_total_assigned + category.diamond_summary.diamond_total_assigned,
                priceLeft: fCurrency(category.silver_summary.silver_total_price_left + category.diamond_summary.diamond_total_price_left),
                priceAssigned: fCurrency(category.silver_summary.silver_total_price_assigned + category.diamond_summary.diamond_total_price_assigned),
                weightLeft: `${(category.silver_summary.silver_total_weight_left + category.diamond_summary.diamond_total_weight_left).toPrecision(5)}g`,
                weightAssigned: `${(category.silver_summary.silver_total_weight_assigned + category.diamond_summary.diamond_total_weight_assigned).toPrecision(5)}g`,
            },
        };
        return summaries[summaryType];
    };

    const summary = getSummaryContent();

    return (
        <Card variant="outlined" sx={{ maxWidth: 360 }}>
            <Box >
                <Stack direction="column" sx={{ alignItems: 'space-between', justifyContent: 'center' }}>
                    <Typography variant="h5" sx={{ p: 2 }} >
                        {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                    </Typography>
                    <Divider />
                    <Typography sx={{ pl: 2 }} variant="h6" component="div">
                        {summaryType}
                    </Typography>
                </Stack>

                {/* Example: Display "3/5" where 3 is large, and 5 is smaller */}
                <Stack direction="row" sx={{ pl: 2 }} alignItems="flex-end">
                    {/* <ShoppingCartIcon sx={{ mr: 1 }} /> */}
                    <Typography variant="h4">{summary.itemsLeft}</Typography>
                    <Typography variant="body2" sx={{ ml: 0.5 }}>/ {summary.itemsAssigned}</Typography>
                </Stack>

                <Stack direction="row" sx={{ pl: 2 }} alignItems="flex-end">
                    {/* <AttachMoneyIcon sx={{ mr: 1 }} /> */}
                    <Typography variant="h4" color="text.primary">
                        {summary.priceLeft}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        / {summary.priceAssigned}
                    </Typography>
                </Stack>

                <Stack direction="row" sx={{ pl: 2 }} alignItems="flex-end">
                    {/* <ScaleIcon sx={{ mr: 1 }} /> */}
                    <Typography variant="h4" gutterBottom color="text.primary">
                        {summary.weightLeft}
                    </Typography>
                    <Typography variant="body2" gutterBottom color="text.primary" sx={{ ml: 0.5 }}>
                        / {summary.weightAssigned}
                    </Typography>
                </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography gutterBottom variant="body2">
                    Select Summary
                </Typography>
                <Stack direction="row" spacing={1}>
                    <ButtonGroup>
                        <Button onClick={() => handleSummaryChange('Diamond')} variant={summaryType === 'Diamond' ? 'contained' : 'outlined'}>
                            Diamond
                        </Button>
                        <Button onClick={() => handleSummaryChange('Silver')} variant={summaryType === 'Silver' ? 'contained' : 'outlined'}>
                            Silver
                        </Button>
                        <Button onClick={() => handleSummaryChange('Total')} variant={summaryType === 'Total' ? 'contained' : 'outlined'}>
                            Total
                        </Button>
                    </ButtonGroup>
                </Stack>
            </Box>
        </Card>
    );
};

export default SummaryCard;
