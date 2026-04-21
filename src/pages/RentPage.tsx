import { Layout } from "@/components/layout/Layout";
import { ListingsPageLayout } from "@/components/listings/ListingsPageLayout";

export default function RentPage() {
  return (
    <Layout>
      <ListingsPageLayout transactionType="rent" title="Homes for Rent" />
    </Layout>
  );
}
