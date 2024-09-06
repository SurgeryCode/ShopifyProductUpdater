import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { useActionData, Form } from "@remix-run/react";

import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

// Shopify API endpoint
const SHOPIFY_API_ENDPOINT =
  "https://recruitment-tasks.myshopify.com/admin/api/2024-07/graphql.json";
// Access token - przechowujesz w zmiennej środowiskowej
const SHOPIFY_ACCESS_TOKEN = loader;

// GraphQL mutacja do aktualizacji produktu
const PRODUCT_UPDATE_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        descriptionHtml
        variants(first: 10) {
          edges {
            node {
              id
              price
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Loader Remix.js dla GET requestów
// export async function loader() {
//   return json({ message: "Use POST method to update product" });
// }

// Action Remix.js dla POST requestów
export async function action({ request }) {
  // Parse request body
  const formData = await request.formData();
  const productId = formData.get("productId");
  const title = formData.get("title");
  const description = formData.get("description");
  const price = formData.get("price");

  // Ustaw dane do mutacji
  const variables = {
    input: {
      id: productId,
      title: title,
      descriptionHtml: description,
      variants: [
        {
          price: price,
        },
      ],
    },
  };

  const response = await fetch(SHOPIFY_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: PRODUCT_UPDATE_MUTATION,
      variables,
    }),
  });

  const data = await response.json();

  if (data.errors || data.data.productUpdate.userErrors.length > 0) {
    return json(
      { errors: data.errors || data.data.productUpdate.userErrors },
      { status: 400 },
    );
  }

  return json({ success: true, product: data.data.productUpdate.product });
}
export default function AdditionalPage() {
  const actionData = useActionData();
  return (
    <Page>
      <TitleBar title="Product updater ;)" />
      <BlockStack>
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingMd">
                Chang data in your product
              </Text>
            </Card>
            <Card>
              <div>
                <h1>Update Shopify Product</h1>
                <Form method="post">
                  <label>
                    Product ID:
                    <input
                      type="text"
                      name="productId"
                      placeholder="gid://shopify/Product/1234567890"
                    />
                  </label>
                  <br />
                  <label>
                    Title:
                    <input
                      type="text"
                      name="title"
                      placeholder="New Product Title"
                    />
                  </label>
                  <br />
                  <label>
                    Description:
                    <textarea
                      name="description"
                      placeholder="New product description"
                    ></textarea>
                  </label>
                  <br />
                  <label>
                    Price:
                    <input type="text" name="price" placeholder="19.99" />
                  </label>
                  <br />
                  <button type="submit">Update Product</button>
                </Form>

                {actionData?.success && <p>Product updated successfully!</p>}
                {actionData?.errors && <ul>error</ul>}
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
