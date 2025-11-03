const WEBSITE_CONTENT_FIELDS = `
  heading
  subHeading
  headingDescription
  imagesCollection {
    items {
      ... on Product {
        title
        image
        description
      }
    }
  }
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
      next: { tags: ["website"] },
    },
  ).then((response) => response.json());
}

function extractWebsiteContent(fetchResponse: any): any {
  return fetchResponse?.data?.microWebsiteContentCollection?.items?.[0];
}

export async function getWebsiteContent(isDraftMode: boolean): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      microWebsiteContentCollection(limit: 1, preview: ${
        isDraftMode ? "true" : "false"
      }) {
        items {
          ${WEBSITE_CONTENT_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractWebsiteContent(entry);
}