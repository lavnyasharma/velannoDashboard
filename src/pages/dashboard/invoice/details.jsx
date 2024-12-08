import { Helmet } from 'react-helmet-async';

import { useParams, useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { _invoices } from 'src/_mock/_invoice';

import { InvoiceDetailsView } from 'src/sections/invoice/view';
import { useEffect, useState } from 'react';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Invoice details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const router = useRouter()
  const { id = '' } = useParams();
  const getCartData = async () => {
    const resp = await axiosInstance.get('/cart/').then((res) => {
      if (res.data.count === 0) {
        router.push(paths.dashboard.search.root)
      }
      
      setCart(res.data.results);
    });
  };
  const [cart, setCart] = useState([])
  useEffect(() => {

    getCartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {cart.length === 0 ? <LoadingScreen /> : <InvoiceDetailsView invoice={cart} />}
    </>
  );
}
