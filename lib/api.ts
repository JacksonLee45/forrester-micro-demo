const PRODUCT_GRAPHQL_FIELDS = `
  title
  image
  description
`;

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["products"] },
    },
  ).then((response) => response.json());
}

function extractProduct(fetchResponse: any): any {
  return fetchResponse?.data?.productCollection?.items?.[0];
}

function extractProducts(fetchResponse: any): any[] {
  return fetchResponse?.data?.productCollection?.items || [];
}

export async function getProduct(isDraftMode: boolean): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      productCollection(limit: 1, preview: ${
        isDraftMode ? "true" : "false"
      }) {
        items {
          ${PRODUCT_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractProduct(entry);
}

export async function getAllProducts(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      productCollection(preview: ${isDraftMode ? "true" : "false"}) {
        items {
          ${PRODUCT_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractProducts(entries);
}