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
  const { id } = useParams();
  console.log(id)
  const getOrder = async () => {
    const resp = await axiosInstance.get(`/order/${id}/`).then((res) => {
      if (Object.keys(res.data).length === 0) {
        router.push(paths.dashboard.search.root)
      }

      setOrder(res.data);
    });
  };
  const [order, setOrder] = useState({})
  useEffect(() => {
    getOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // <InvoiceDetailsView invoice={cart} /> 

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {Object.keys(order).length === 0 ? <LoadingScreen /> :
       <InvoiceDetailsView invoice={order} /> 
      }
    </>
  );
}
