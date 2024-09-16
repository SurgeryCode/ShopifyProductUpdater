import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  TextField,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader() {
  //get data from database
  let settings = await db.updater.findFirst();

  console.log("tu: " + settings);

  return json(settings);
}

export async function action({ request }) {
  // updates persistent data
  let settings = await request.formData();

  settings = Object.fromEntries(settings);
  return json({ settings });
}

export default function Updater() {
  const settings = useLoaderData();

  const [formState, setFormState] = useState(settings);
  console.log("tu " + formState.name + " " + formState.description);
  return (
    <Page>
      <TitleBar title="Product updater" />
      <BlockStack>
        <Layout>
          <Layout.Section>
            <Card>
              <Form method="POST">
                <TextField
                  name="name"
                  label="Product ID"
                  value={formState?.name}
                  onChange={(value) =>
                    setFormState({ ...formState, name: value })
                  }
                ></TextField>
                <TextField
                  name="description"
                  label="Description"
                  value={formState?.description}
                  onChange={(value) =>
                    setFormState({ ...formState, description: value })
                  }
                ></TextField>
                <Button submit={true}>Save</Button>
              </Form>
            </Card>
            <Card></Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
