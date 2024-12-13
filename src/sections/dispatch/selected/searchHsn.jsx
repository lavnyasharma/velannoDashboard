import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Button,
  Divider,
  Autocomplete,
} from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { toast } from 'src/components/snackbar';

const API_COUNTERS_URL = '/list/counter/';
const API_BULK_EDIT_URL = '/update/bulk/counter/';

export default function BulkEditCard() {
  const [counterOptions, setCounterOptions] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [hsnList, setHsnList] = useState('');
  const [hsnCount, setHsnCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await axiosInstance.get(API_COUNTERS_URL);
        const counters = response.data.map((counter) => ({
          label: counter.user.username,
          id: counter.user.id,
        }));
        setCounterOptions(counters);
      } catch (error) {
        console.error('Error fetching counters:', error);
      }
    };

    fetchCounters();
  }, []);

  const handleCounterChange = (event, value) => {
    setSelectedCounter(value);
  };

  const handleRangeStartChange = (event) => {
    setRangeStart(event.target.value);
  };

  const handleRangeEndChange = (event) => {
    setRangeEnd(event.target.value);
  };

  const handleHsnListChange = (event) => {
    const input = event.target.value;
    setHsnList(input);
    const hsnArray = input.split(',').filter((hsn) => hsn.trim() !== '');
    setHsnCount(hsnArray.length);
  };

  const handleBulkEdit = async () => {
    if (!hsnList || !selectedCounter) {
      toast.error('Please provide a valid list of HSNs and select a counter.');
      return;
    }

    setLoading(true);
    const hsnArray = hsnList.split(',').map((hsn) => hsn.trim());

    try {
      const response = await axiosInstance.post(API_BULK_EDIT_URL, {
        hsn_list: hsnArray,
        counter_seller_id: selectedCounter.id,
      });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error applying bulk edit:', error);
      toast.error('Failed to apply bulk edit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeEdit = async () => {
    if (!rangeStart || !rangeEnd || !selectedCounter) {
      toast.error('Please provide a valid range and select a counter.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_BULK_EDIT_URL, {
        from_hsn: rangeStart,
        to_hsn: rangeEnd,
        counter_seller_id: selectedCounter.id,
      });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error applying range edit:', error);
      toast.error('Failed to apply range edit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ padding: '20px' }}>
      {/* Main Card */}
      <Card sx={{ flex: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Counter
          </Typography>
          <Autocomplete
            options={counterOptions}
            getOptionLabel={(option) => option.label || ''}
            value={selectedCounter}
            onChange={handleCounterChange}
            renderInput={(params) => (
              <TextField {...params} label="Search Counter" variant="outlined" size="small" />
            )}
            sx={{ marginBottom: 2 }}
          />

          <Divider sx={{ marginY: 2 }} />

          {/* Range Edit Section */}
          <Typography variant="h6" gutterBottom>
            Range Edit
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Start HSN"
              value={rangeStart}
              onChange={handleRangeStartChange}
              variant="outlined"
              size="small"
              disabled={!!hsnList}
            />
            <TextField
              label="End HSN"
              value={rangeEnd}
              onChange={handleRangeEndChange}
              variant="outlined"
              size="small"
              disabled={!!hsnList}
            />
            <Typography variant="body2" color="text.secondary">
              • Ensure the range is continuous without missing HSNs.
              <br />
              • Both start and end HSN are included.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRangeEdit}
              disabled={!!hsnList || loading}
            >
              {loading ? 'Applying...' : 'Apply Range Edit'}
            </Button>
          </Stack>

          <Divider sx={{ marginY: 4 }} />

          {/* Bulk Edit Section */}
          <Typography variant="h6" gutterBottom>
            Bulk Edit
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="List of HSNs (comma separated)"
              value={hsnList}
              onChange={handleHsnListChange}
              variant="outlined"
              size="small"
              disabled={!!rangeStart || !!rangeEnd}
            />
            <Typography variant="body2" color="text.secondary">
              • Use comma-separated values without spaces.
              <br />
              • Ensure all HSNs exist in the database.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkEdit}
              disabled={!!rangeStart || !!rangeEnd || loading}
            >
              {loading ? 'Applying...' : 'Apply Bulk Edit'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <Card sx={{ flex: 1, padding: '10px' }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body1" gutterBottom>
          {hsnCount} Products ➔ {selectedCounter?.label || 'None'}
        </Typography>
      </Card>
    </Stack>
  );
}
