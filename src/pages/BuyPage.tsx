import { Layout } from "@/components/layout/Layout";
import { ListingsPageLayout } from "@/components/listings/ListingsPageLayout";

export default function BuyPage() {
  return (
    <Layout>
      <ListingsPageLayout transactionType="sale" title="Homes for Sale" />
    </Layout>
  );
}
