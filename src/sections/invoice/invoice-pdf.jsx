import { useMemo } from 'react';
import { Page, View, Text, Font, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { cDiscount, fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        // layout
        page: {
          fontSize: 9,
          lineHeight: 1.6,
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          padding: '40px 24px 120px 24px',
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          margin: 'auto',
          borderTopWidth: 1,
          borderStyle: 'solid',
          position: 'absolute',
          borderColor: '#e9ecef',
        },
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        // margin
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        // text
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        body2: { fontSize: 9 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        // table
        table: { display: 'flex', width: '100%' },
        row: {
          padding: '10px 0 8px 0',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#e9ecef',
        },
        cell_1: { width: '5%' },
        cell_2: { width: '50%' },
        cell_3: { width: '15%', paddingLeft: 32 },
        cell_4: { width: '15%', paddingLeft: 8 },
        cell_5: { width: '15%' },
        noBorder: { paddingTop: '10px', paddingBottom: 0, borderBottomWidth: 0 },
      }),
    []
  );

// ----------------------------------------------------------------------

export function InvoicePDF({ invoice }) {
  const {
    order_number,
    customer,
    createDate,
    subtotal,
    final_total,
    diamond_discount,
    silver_discount,
    f_discount,
    franchise_discount_amount,
    order_items,
  } = invoice;

  const styles = useStyles();

  const renderHeader = (
    <View style={[styles.container, styles.mb40]}>
      <Image src="/logo/logo-full.png" style={{ width: 130 }} />
    </View>
  );

  const renderFooter = (
    <View style={[styles.container, styles.footer]} fixed>
      <View style={{ width: '75%' }}>
        <Text style={styles.subtitle2}>NOTES</Text>
        <Text>We appreciate your business.</Text>
        <Text>This is not an official bill.</Text>
      </View>
      <View style={{ width: '25%', textAlign: 'right' }}>
        <Text style={styles.subtitle2}>Have a question?</Text>
        <Text>info@velonna.co</Text>
      </View>
    </View>
  );

  const renderInfo = (
    <View style={[styles.container]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Estimate from</Text>
        <Text style={styles.body2}>Velonna.co</Text>
        <Text style={styles.body2}>info@velonna.co</Text>
      </View>

      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Estimate to</Text>
        <Text style={styles.body2}>{customer.name}</Text>
        <Text style={styles.body2}>{customer.email}</Text>
        <Text style={styles.body2}>{customer.phone}</Text>
      </View>
    </View>
  );

  const renderTime = (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.subtitle2, styles.mb4]}>Date created</Text>
        <Text style={styles.body2}>{fDate(createDate)}</Text>
      </View>
    </View>
  );

  const renderTable = (
    <>
      <Text style={[styles.subtitle1, styles.mb8]}>Invoice Details</Text>

      <View style={styles.table}>
        <View>
          <View style={styles.row}>
            <View style={styles.cell_1}>
              <Text style={styles.subtitle2}>#</Text>
            </View>
            <View style={styles.cell_2}>
              <Text style={styles.subtitle2}>Product (Unit Price)</Text>
            </View>
            <View style={styles.cell_3}>
              <Text style={styles.subtitle2}>Weight</Text>
            </View>
            <View style={styles.cell_4}>
              <Text style={styles.subtitle2}>Quantity</Text>
            </View>
            <View style={styles.cell_4}>
              <Text style={styles.subtitle2}>Discount</Text>
            </View>
            <View style={[styles.cell_5, { textAlign: 'right' }]}>
              <Text style={styles.subtitle2}>Total</Text>
            </View>
          </View>
        </View>

        <View>
          {order_items.map((item, index) => (
            <View key={item.product.id} style={styles.row}>
              <View style={styles.cell_1}>
                <Text>{index + 1}</Text>
              </View>
              <View style={styles.cell_2}>
                <Text style={styles.subtitle2}>{item.product.title}</Text>
                <Text>{fCurrency(item.product.price)}</Text>
              </View>
              <View style={styles.cell_3}>
                <Text>{`${item.product.gross_weight}g`}</Text>
              </View>
              <View style={styles.cell_4}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={styles.cell_4}>
                <Text>{item.product.is_gold ? diamond_discount : silver_discount}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text>
                  {fCurrency(
                    item.total -
                      item.total * cDiscount(item.product.is_gold ? diamond_discount : silver_discount)
                  )}
                </Text>
              </View>
            </View>
          ))}

          {[
            { name: 'Subtotal', value: fCurrency(subtotal) },
            { name: 'Franchise Discount', value: `-${fCurrency(franchise_discount_amount)}` },
            { name: 'Additional Discount', value: f_discount },
            { name: 'Total', value: fCurrency(final_total), styles: styles.h4 },
          ].map((item) => (
            <View key={item.name} style={[styles.row, styles.noBorder]}>
              <View style={styles.cell_1} />
              <View style={styles.cell_2} />
              <View style={styles.cell_3} />
              <View style={styles.cell_4}>
                <Text style={item.styles}>{item.name}</Text>
              </View>
              <View style={[styles.cell_5, { textAlign: 'right' }]}>
                <Text style={item.styles}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader}

        {renderInfo}

        {renderTime}

        {renderTable}

        {renderFooter}
      </Page>
    </Document>
  );
}
