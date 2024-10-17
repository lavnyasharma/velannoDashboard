import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _tags, PRODUCT_CATEGORY_GROUP_OPTIONS } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewProductSchema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  description: schemaHelper.editor({ message: { required_error: 'Description is required!' } }),
  thumbnail: schemaHelper.files({ message: { required_error: 'Thumbnail is required!' } }),
  hsn: zod.number().positive({ message: 'HSN is required!' }),
  category: zod.string().nonempty({ message: 'Category is required!' }),
  collection: zod.string().optional(),
  price: zod.number().min(0.01, { message: 'Price must be greater than zero.' }),
  material: zod.string().optional(),
  quantity: zod.number().min(1, { message: 'Quantity is required!' }),
  gender: zod.enum(['male', 'female', 'unisex']).optional(),
  age: zod.enum(['teenage', 'adult', 'baby', 'elders']).optional(),
  size: zod.string().optional(),
  gross_weight: zod.number().optional(),
  net_weight: zod.number().optional(),
  diamond_weight: zod.number().optional(),
  stock_photo: schemaHelper.files().optional(),
  kt: zod.string().optional(),
  diamond_clearity: zod.string().optional(),
  is_gold: zod.boolean().optional(),
  is_diamond: zod.boolean().optional(),
  seller: zod.string().nonempty({ message: 'Seller is required!' }),
  is_live: zod.boolean().optional(),
  views: zod.number().default(0),
  is_deleted: zod.boolean().default(false),
  newLabel: zod.object({ enabled: zod.boolean(), content: zod.string().optional() }),
  saleLabel: zod.object({ enabled: zod.boolean(), content: zod.string().optional() }),
});

// ----------------------------------------------------------------------

export function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      description: currentProduct?.description || '',
      thumbnail: currentProduct?.thumbnail || null,
      hsn: currentProduct?.hsn || '',
      category: currentProduct?.category || PRODUCT_CATEGORY_GROUP_OPTIONS[0]?.classify[0],
      collection: currentProduct?.collection || '',
      price: currentProduct?.price || 0,
      quantity: currentProduct?.quantity || 0,
      seller: currentProduct?.seller || '',
      gender: currentProduct?.gender || '',
      age: currentProduct?.age || '',
      size: currentProduct?.size || '',
      gross_weight: currentProduct?.gross_weight || null,
      net_weight: currentProduct?.net_weight || null,
      diamond_weight: currentProduct?.diamond_weight || null,
      stock_photo: currentProduct?.stock_photo || null,
      kt: currentProduct?.kt || '',
      diamond_clearity: currentProduct?.diamond_clearity || '',
      is_gold: currentProduct?.is_gold || false,
      is_diamond: currentProduct?.is_diamond || false,
      is_live: currentProduct?.is_live || false,
      views: currentProduct?.views || 0,
      is_deleted: currentProduct?.is_deleted || false,
      newLabel: currentProduct?.newLabel || { enabled: false, content: '' },
      saleLabel: currentProduct?.saleLabel || { enabled: false, content: '' },
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: zodResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentProduct ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.product.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.thumbnail && values.thumbnail?.filter((file) => file !== inputFile);
      setValue('thumbnail', filtered);
    },
    [setValue, values.thumbnail]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('thumbnail', [], { shouldValidate: true });
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = (
    <Card>
      <CardHeader title="Details" subheader="Title, short description, image..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="title" label="Product Title" />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Description</Typography>
          <Field.Editor name="description" sx={{ maxHeight: 480 }} />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Thumbnail</Typography>
          <Field.Upload
            
            thumbnail
            name="thumbnail"
            maxSize={3145728}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            onUpload={() => console.info('ON UPLOAD')}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderProperties = (
    <Card>
      <CardHeader
        title="Properties"
        subheader="Additional functions and attributes..."
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <Field.Text name="hsn" label="HSN" type="number" />

          <Field.Select native name="category" label="Category" InputLabelProps={{ shrink: true }}>
            {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
              <optgroup key={category.group} label={category.group}>
                {category.classify.map((classify) => (
                  <option key={classify} value={classify}>
                    {classify}
                  </option>
                ))}
              </optgroup>
            ))}
          </Field.Select>

          <Field.Text
            name="quantity"
            label="Quantity"
            placeholder="0"
            type="number"
            InputLabelProps={{ shrink: true }}
          />

          <Field.Text name="seller" label="Seller" />

          <Field.Select native name="gender" label="Gender" InputLabelProps={{ shrink: true }}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </Field.Select>

          <Field.Select native name="age" label="Age Group" InputLabelProps={{ shrink: true }}>
            <option value="">Select Age Group</option>
            <option value="teenage">Teenage</option>
            <option value="adult">Adult</option>
            <option value="baby">Baby</option>
            <option value="elders">Elders</option>
          </Field.Select>

          <Field.Text name="size" label="Size" placeholder="e.g., M, L, XL" />

          <Field.Text name="gross_weight" label="Gross Weight (kg)" placeholder="0" type="number" />
          <Field.Text name="net_weight" label="Net Weight (kg)" placeholder="0" type="number" />
          <Field.Text name="diamond_weight" label="Diamond Weight (ct)" placeholder="0" type="number" />
        </Box>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Stock Photo</Typography>
          <Field.Upload
          
            name="stock_photo"
            maxSize={3145728}
            onRemove={handleRemoveFile}
           
            onUpload={() => console.info('ON UPLOAD')}
          />
        </Stack>

        <Field.Text name="kt" label="KT" />
        <Field.Text name="diamond_clearity" label="Diamond Clarity" />

        <FormControlLabel
          control={
            <Switch
              checked={values.is_live}
              onChange={(event) => setValue('is_live', event.target.checked)}
            />
          }
          label="Is Live?"
        />
        <FormControlLabel
          control={
            <Switch
              checked={values.is_gold}
              onChange={(event) => setValue('is_gold', event.target.checked)}
            />
          }
          label="Is Gold?"
        />
        <FormControlLabel
          control={
            <Switch
              checked={values.is_diamond}
              onChange={(event) => setValue('is_diamond', event.target.checked)}
            />
          }
          label="Is Diamond?"
        />

        <Field.Text name="views" label="Views" placeholder="0" type="number" />
        <FormControlLabel
          control={
            <Switch
              checked={values.is_deleted}
              onChange={(event) => setValue('is_deleted', event.target.checked)}
            />
          }
          label="Is Deleted?"
        />
      </Stack>
    </Card>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {renderDetails}
      {renderProperties}

      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {currentProduct ? 'Update Product' : 'Create Product'}
      </LoadingButton>
    </Form>
  );
}
