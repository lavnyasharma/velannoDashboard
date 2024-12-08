import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Country, State, City } from 'country-state-city';
import axiosInstance from 'src/utils/axios';
import { toast } from 'src/components/snackbar';

function AddCustomerModal({ open, onClose, customerData, setCustomerData }) {
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setCountries(Country.getAllCountries());

  }, [setCustomerData]);

  useEffect(() => {
    if (customerData.country) {
      setStates(State.getStatesOfCountry(customerData.country));
    } else {
      setStates([]);
    }
  }, [customerData.country]);

  useEffect(() => {
    if (customerData.state) {
      setCities(City.getCitiesOfState(customerData.country, customerData.state));
    } else {
      setCities([]);
    }
  }, [customerData.state, customerData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleAutocompleteChange = (field, value) => {
    setCustomerData((prevData) => ({
      ...prevData,
      [field]: value ? value.isoCode || value.name : '',
      city: field === 'state' ? '' : field === 'city' ? value.name : prevData.city,
      state: field === 'country' ? '' : field === 'state' ? value.isoCode : prevData.state,
    }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Collect the customer data in the format expected by your backend
      const customerPayload = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email === '' ? null : customerData.email,
        birthday: customerData.birthday === '' ? null : customerData.birthday,
        country: customerData.country === '' ? null : customerData.country,
        state: customerData.state === '' ? null : customerData.state,
        city: customerData.city === '' ? null : customerData.city,
        street_address: customerData.streetAddress === '' ? null : customerData.streetAddress,
        postal_code: customerData.postalCode === '' ? null : customerData.postalCode,
      };

      // Send a POST request to the API
      if (customerData.id) {
        const response = await axiosInstance.put('add/customer/', customerPayload).catch((error) => {
          toast(`error ${error.message}`)
        });
       }
      else {
        const response = await axiosInstance.post('add/customer/', customerPayload).catch((error) => {
          toast(`error ${error.message}`)
        });
      }

      onClose();

    } catch (error) {
      toast('Error adding customer:', error);
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'phone'];
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!customerData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    if (/^\d*$/.test(customerData.phone) && customerData.phone.length <= 10) {
      // Show error if phone number is not 10 digits long
      if (customerData.phone.length !== 10 && customerData.phone.length > 0) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    return newErrors;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Customer</DialogTitle>
      <DialogContent>
        <form>
          <Box mb={2}>
            <TextField
              id="customer-name"
              label="Name"
              name="name"
              value={customerData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
          </Box>

          <Box mb={2}>
            <TextField
              id="customer-phone"
              label="Phone Number"
              name="phone"
              value={customerData.phone}
              onChange={handleChange}
              fullWidth
              required
              type="number"
              error={!!errors.phone}
              helperText={errors.phone}
              margin="normal"
              inputProps={{ maxLength: 10 }}
            />
          </Box>

          <Box mb={2}>
            <TextField
              id="customer-email"
              label="Email"
              name="email"
              type="email"
              value={customerData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box mb={2}>
            <TextField
              id="customer-birthday"
              label="Birthday"
              name="birthday"
              type="date"
              value={customerData.birthday}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.birthday}
              helperText={errors.birthday}
              margin="normal"
            />
          </Box>

          <Box mb={2}>
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => handleAutocompleteChange('country', value)}
              renderOption={(props, option) => (
                <li {...props}>
                  <span style={{ marginRight: 8 }}>{option.flag}</span>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  name="country"
                  fullWidth
                  error={!!errors.country}
                  helperText={errors.country}
                />
              )}
              value={countries.find((c) => c.isoCode === customerData.country) || null}
            />
          </Box>

          <Box mb={2}>
            <Autocomplete
              options={states}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => handleAutocompleteChange('state', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  name="state"
                  fullWidth
                  error={!!errors.state}
                  helperText={errors.state}
                />
              )}
              value={states.find((s) => s.isoCode === customerData.state) || null}
              disabled={!customerData.country}
            />
          </Box>

          <Box mb={2}>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => handleAutocompleteChange('city', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  name="city"
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city}
                />
              )}
              value={cities.find((c) => c.name === customerData.city) || null}
              disabled={!customerData.state}
            />
          </Box>

          <Box mb={2}>
            <TextField
              id="customer-street-address"
              label="Street Address"
              name="streetAddress"
              value={customerData.streetAddress}
              onChange={handleChange}
              fullWidth
              error={!!errors.streetAddress}
              helperText={errors.streetAddress}
              margin="normal"
            />
          </Box>

          <Box mb={2}>
            <TextField
              id="customer-postal-code"
              label="Pin Code"
              name="postalCode"
              value={customerData.postalCode}
              onChange={handleChange}
              fullWidth
              error={!!errors.postalCode}
              helperText={errors.postalCode}
              margin="normal"
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCustomerModal;
